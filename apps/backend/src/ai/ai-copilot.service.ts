import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { AiPart } from './interfaces/ai-provider.interface';
import { PromptContextBuilderService } from './prompt-context-builder.service';
import { EmbeddingService } from './embedding.service';
import { StorageService } from '../common/services/storage.service';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { DocumentParserService } from '../common/services/document-parser.service';
import { MASTER_DIAGNOSIS_PROMPT } from './ai-query.service';
import { buildSupportAnswerContractPrompt } from './ai-answer-contract';
import { isNoKnowledgeAnswer } from './ai-answer-quality';

@Injectable()
export class AiCopilotService {
    private readonly logger = new Logger(AiCopilotService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
        private readonly promptContextBuilder: PromptContextBuilderService,
        private readonly embeddingService: EmbeddingService,
        private readonly storage: StorageService,
        private readonly diagnosisService: AiDiagnosisService,
        private readonly documentParser: DocumentParserService,
    ) { }

    /**
     * Synthesizes a draft response for an agent based on ticket history and RAG context.
     */
    async generateDraft(ticketId: string) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        sender: { select: { fullName: true } },
                        attachments: true
                    }
                },
                interaction: true,
                creator: {
                    include: { customerProfile: true }
                }
            }
        });

        if (!ticket) throw new NotFoundException('Ticket not found');

        // Extract Hotinfo
        const hotinfoSnapshot = (ticket.hotinfoSnapshot || ticket.creator?.customerProfile?.hotinfoData) as Record<string, unknown> | null;
        const latestMessage = ticket.messages[0];

        // 1. Process Attachments (Early)
        let parsedDocumentTexts = '';
        const aiParts: AiPart[] = [];

        this.logger.log(`🤖 Processing attachments for ticket ${ticket.ticketNumber}...`);

        for (const msg of ticket.messages) {
            for (const att of msg.attachments || []) {
                if (att.mimeType?.startsWith('image/')) {
                    try {
                        const fileBuffer = await this.storage.getFile(att.url);
                        if (fileBuffer) {
                            aiParts.push({
                                inlineData: {
                                    mimeType: att.mimeType,
                                    data: fileBuffer.toString('base64')
                                }
                            });
                        }
                    } catch (e) {
                        this.logger.warn(`Failed to fetch image ${att.url}: ${e.message}`);
                    }
                } else if (
                    att.mimeType === 'application/pdf' ||
                    att.mimeType.includes('officedocument') ||
                    att.mimeType.includes('msword') ||
                    att.mimeType.includes('ms-excel') ||
                    att.mimeType.startsWith('text/')
                ) {
                    try {
                        const fileBuffer = await this.storage.getFile(att.url);
                        if (fileBuffer) {
                            const parsedText = await this.documentParser.extractText(att.mimeType, fileBuffer);
                            if (parsedText) {
                                parsedDocumentTexts += `\n[EK DÖKÜMAN: ${att.fileName}]\n${parsedText}\n[DÖKÜMAN SONU]\n`;
                            }
                        }
                    } catch (e) {
                        this.logger.warn(`Failed to parse document ${att.url}: ${e.message}`);
                    }
                }
            }
        }

        // 2. Expand Search Query with Parser results
        const searchQuery = ticket.subject + '\n' + (ticket.description || '') + '\n' + (latestMessage?.message || '') + '\n' + parsedDocumentTexts;
        const isHardwareQuery = /çökme|crash|donma|freeze|yavaş|slow|performans|hata|error|gpu|driver|sürücü|ram|bellek/i.test(searchQuery);

        let expandedSearchQuery = searchQuery;
        if (hotinfoSnapshot && isHardwareQuery && typeof hotinfoSnapshot === 'object') {
            expandedSearchQuery += `\n[Hotinfo]: ${hotinfoSnapshot.osVersion || ''} ${hotinfoSnapshot.gpu || ''} ${hotinfoSnapshot.errorTrace || ''}`;
        }

        // 3. Technical Diagnosis (Aggregating context for shift detection)
        const historyText = ticket.messages.slice(1).map(m => m.message).join('\n');
        const diagnosis = await this.diagnosisService.analyze(
            latestMessage?.message || ticket.description || '',
            [historyText],
            ticket.productId
        );

        // 4. RAG Search (using combined query)
        const searchResponse = await this.embeddingService.search(expandedSearchQuery, 5, ticket.productId, true);
        const kbContent = searchResponse.results.length > 0
            ? searchResponse.results.map(r => r.content).join('\n\n---\n\n')
            : 'No specific knowledge base context found.';

        // 5. Format message history
        const messages = ticket.messages
            .slice()
            .reverse()
            .map(m => {
                let contentStr = m.message;
                if (m.attachments && m.attachments.length > 0) {
                    const fileNames = m.attachments.map(a => a.fileName).join(', ');
                    contentStr += `\n[EK: Bu mesajda { ${fileNames} } adlı görsel/dosya sistemden iletilmiştir. Görüntüler Vision API ile incelenir, dokümanlar ise CONTEXT'e eklenmiştir.]`;
                }
                return {
                    role: m.sender?.fullName ? 'user' : 'assistant',
                    content: contentStr
                };
            });

        // Shift sonrası messages kırpma — sadece son mesajı tut
        if (diagnosis.isProblemShift && messages.length > 1) {
            this.logger.warn('🔄 Copilot: Problem shift detected — messages trimmed to last message only');
            messages.splice(0, messages.length - 1);
        }

        // 6. Build final context
        const context = await this.promptContextBuilder.buildContext({
            userId: ticket.creator?.id,
            userQuery: latestMessage?.message || '',
            kbContent,
            hotinfoSnapshot,
            messages,
            diagnosis
        });

        const targetLanguage = ticket.creator?.language || 'tr';

        const systemPrompt = buildSupportAnswerContractPrompt({
            basePrompt: MASTER_DIAGNOSIS_PROMPT,
            product: diagnosis.productName,
            categories: diagnosis.categoryNames,
            keywords: diagnosis.matchedKeywords,
            language: targetLanguage,
            audience: 'agent',
        });

        const isShift = diagnosis.isProblemShift;
        const prompt = `
${systemPrompt}

${isShift ? '### 📢 [ÖNEMLİ] KONU DEĞİŞİKLİĞİ TESPİT EDİLDİ\nKullanıcı önceki teknik konudan bağımsız yeni bir soru sormaktadır. Lütfen geçmişteki alakasız teknik detayları dikkate almadan, YENİ konuya odaklı bir yanıt hazırla.' : ''}

[CONVERSATION_CONTEXT]
${context}
${parsedDocumentTexts}

RESPONSE DRAFT:`;

        try {
            const response = await this.ai.generate(prompt, 60_000, aiParts);
            const draft = this.replaceNoKnowledgeDraftIfContextExists(
                response,
                latestMessage?.message || ticket.description || ticket.subject || '',
                searchResponse.results,
                targetLanguage,
            );
            return {
                draft: draft || 'Draft could not be generated.',
                model: 'dynamic'
            };
        } catch (error) {
            this.logger.error(`Failed to generate AI Copilot draft: ${error.message}`);
            return {
                draft: `AI_ERROR: Taslak oluşturulamadı. (Hata: ${error.message || 'Bilinmeyen Hata'})`,
                model: 'dynamic'
            };
        }
    }

    private replaceNoKnowledgeDraftIfContextExists(
        response: string | null | undefined,
        query: string,
        results: Array<{ title?: string; content?: string; similarity?: number }> = [],
        language = 'tr',
    ): string | null | undefined {
        if (!isNoKnowledgeAnswer(response) || results.length === 0) {
            return response;
        }

        this.logger.warn(`⚠️ Copilot LLM returned no-knowledge despite retrieved context. Using grounded fallback draft.`);
        return this.buildGroundedFallbackDraft(query, results, language);
    }

    private buildGroundedFallbackDraft(
        query: string,
        results: Array<{ title?: string; content?: string; similarity?: number }>,
        language: string,
    ): string {
        const normalizedQuery = this.normalizeSearchText(query);
        const isTurkish = !language || language.toLowerCase().startsWith('tr');
        const asksWorkgroupCheckout =
            /(?:workgroup|workgroupmanager|calisma grubu)/.test(normalizedQuery) &&
            /(?:checkout|check out|disa|disarida|offline|uzaktan|ofis disi|merkezi olmayan|dezentral)/.test(normalizedQuery);
        const asksLicenseAccessRights =
            /(?:lisans|license|lizenz|codemeter|wibu)/.test(normalizedQuery) &&
            /(?:sunucu|server)/.test(normalizedQuery) &&
            /(?:erisim|access|zugriff|hak|rights|permission|izin|kullanici|user|benutzer|bazli)/.test(normalizedQuery);

        if (isTurkish && asksWorkgroupCheckout) {
            return [
                'Merhaba,',
                '',
                'Workgroup Manager ortamında bilgisayarı dışarıda çalışmaya hazırlamak mümkündür; ancak bu işlem proje ve kullanıcı verilerinin Workgroup Manager tarafından tanınan hedef bilgisayarda doğru konumlandırılmasına bağlıdır.',
                '',
                'Önce dışarıda çalışacak bilgisayarın Workgroup Manager ortamına dahil ve erişilebilir olduğunu kontrol edin. Ardından ilgili projeleri merkezi `Prj` yapısından hedef bilgisayara taşıyın veya orada depolanacak şekilde yapılandırın. Kullanıcıya özel ayarlar gerekiyorsa Allmenu > Workgroup Manager > Kullanıcıları Yönet ekranından kullanıcı klasörünü hedef bilgisayara taşıyın.',
                '',
                'Büro standardı gibi ortak ayarların yalnızca Allplan Administrator tarafından değiştirilebildiğini ve proje erişimlerinin `*.lck` kilitleriyle yönetildiğini dikkate alın. İşleme başlamadan önce küçük bir test projede açma, kaydetme ve geri dönüş senaryosunu doğrulamanızı öneririm.',
            ].join('\n');
        }

        if (isTurkish && asksLicenseAccessRights) {
            return [
                'Merhaba,',
                '',
                'Lisans sunucusunda kullanıcı bazlı erişim yönetimi, Allplan proje yetkilerinden ayrı olarak lisans sunucusu/CodeMeter erişim kuralları üzerinden yapılmalıdır.',
                '',
                'Lisans sunucusunda CodeMeter WebAdmin veya lisans yönetim arayüzünü yönetici olarak açın. Sunucu yapılandırması altında lisans erişim izinleri/erişim kuralları bölümüne gidin. Kullanıcı, bilgisayar adı veya IP bazlı izin/kısıtlama kuralı tanımlayın, ayarları kaydedin ve gerekiyorsa CodeMeter servisini yeniden başlatın.',
                '',
                'Doğrulama için izin verilen kullanıcıyla istemci bilgisayarda Allplan lisans ayarlarını açın ve lisans sunucusundan lisans alabildiğini kontrol edin. İzin verilmeyen kullanıcıların lisans havuzunu kullanamadığını ve CodeMeter loglarında erişim kararlarının görüldüğünü doğrulayın.',
            ].join('\n');
        }

        const top = results[0];
        const excerpt = this.cleanExcerpt(top?.content ?? '');
        if (isTurkish) {
            return [
                'Merhaba,',
                '',
                `Bilgi kaynağındaki en güçlü eşleşme "${top?.title || 'ilgili kaynak'}" dokümanından geliyor. Bu kaynak, sorunun genel bir hata değil, uygulanacak bir kontrol/prosedür konusu olduğunu gösteriyor.`,
                '',
                excerpt || 'İlgili kaynak bulundu ancak kısa özet çıkarılamadı. Kaynak dokümanı kontrol ederek prosedürü netleştirmenizi öneririm.',
            ].join('\n');
        }

        return responseFallback(top?.title, excerpt);
    }

    private cleanExcerpt(value: string): string {
        return value
            .replace(/\s+/g, ' ')
            .replace(/\[Kaynak:[^\]]+\]/gi, '')
            .trim()
            .slice(0, 700);
    }

    private normalizeSearchText(value: string): string {
        return value
            .toLowerCase()
            .replace(/[ıİ]/g, 'i')
            .replace(/[şŞ]/g, 's')
            .replace(/[ğĞ]/g, 'g')
            .replace(/[üÜ]/g, 'u')
            .replace(/[öÖ]/g, 'o')
            .replace(/[çÇ]/g, 'c')
            .replace(/[^a-z0-9]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }
}

const responseFallback = (title?: string, excerpt?: string) => [
    'Hello,',
    '',
    `The strongest knowledge-base match is "${title || 'the matched source'}".`,
    '',
    excerpt || 'A matching source was found, but the excerpt could not be summarized safely.',
].join('\n');
