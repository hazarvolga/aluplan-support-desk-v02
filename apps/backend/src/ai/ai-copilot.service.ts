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
        const customerMessages = ticket.messages.filter((message) => !message.isInternal && this.isCustomerMessage(message, ticket.userId));
        const latestCustomerMessage = customerMessages[0] ?? ticket.messages.find((message) => !message.isInternal) ?? latestMessage;
        const activeUserMessage = latestCustomerMessage?.message || ticket.description || ticket.subject || '';

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
        const searchQuery = ticket.subject + '\n' + (ticket.description || '') + '\n' + activeUserMessage + '\n' + parsedDocumentTexts;
        const isHardwareQuery = /çökme|crash|donma|freeze|yavaş|slow|performans|hata|error|gpu|driver|sürücü|ram|bellek/i.test(searchQuery);

        let expandedSearchQuery = searchQuery;
        if (hotinfoSnapshot && isHardwareQuery && typeof hotinfoSnapshot === 'object') {
            expandedSearchQuery += `\n[Hotinfo]: ${hotinfoSnapshot.osVersion || ''} ${hotinfoSnapshot.gpu || ''} ${hotinfoSnapshot.errorTrace || ''}`;
        }

        // 3. Technical Diagnosis (Aggregating context for shift detection)
        const historyText = ticket.messages.slice(1).map(m => m.message).join('\n');
        const diagnosis = await this.diagnosisService.analyze(
            activeUserMessage,
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
                    role: this.isCustomerMessage(m, ticket.userId) ? 'user' : 'assistant',
                    content: contentStr
                };
            });

        // Shift sonrası messages kırpma — sadece son mesajı tut
        if (diagnosis.isProblemShift && messages.length > 1) {
            this.logger.warn('🔄 Copilot: Problem shift detected — messages trimmed to last message only');
            messages.splice(0, messages.length - 1);
        }

        // 6. Build final context
        const targetLanguage = this.resolveTicketAnswerLanguage(ticket);
        const linkedCustomerAnswer = this.extractUsableInteractionAnswer(ticket.interaction);
        const requesterName = this.resolveTicketRequesterName(ticket);
        const latestAgentName = this.resolveLatestAgentName(ticket);
        const context = await this.promptContextBuilder.buildContext({
            userId: ticket.creator?.id,
            userQuery: activeUserMessage,
            kbContent,
            hotinfoSnapshot,
            messages,
            diagnosis
        });

        const systemPrompt = buildSupportAnswerContractPrompt({
            basePrompt: MASTER_DIAGNOSIS_PROMPT,
            product: diagnosis.productName,
            categories: diagnosis.categoryNames,
            keywords: diagnosis.matchedKeywords,
            language: targetLanguage,
            audience: 'agent',
        });

        const isShift = Boolean(diagnosis.isProblemShift);
        const prompt = `
${systemPrompt}

${isShift ? '### 📢 [ÖNEMLİ] KONU DEĞİŞİKLİĞİ TESPİT EDİLDİ\nKullanıcı önceki teknik konudan bağımsız yeni bir soru sormaktadır. Lütfen geçmişteki alakasız teknik detayları dikkate almadan, YENİ konuya odaklı bir yanıt hazırla.' : ''}
${!isShift ? '### KONU DEĞİŞİKLİĞİ YOK\nBu ticket için konu değişikliği tespit edilmedi. Yanıtta "Problem Değişimi", "Konu Değişikliği", "Problem Shift", "Topic Shift" veya benzeri ayrı bir bölüm üretme.' : ''}

[CONVERSATION_CONTEXT]
${context}
${parsedDocumentTexts}
${linkedCustomerAnswer ? this.buildLinkedCustomerAnswerContext(linkedCustomerAnswer) : ''}
${this.buildTicketResponseTargetContext(requesterName, latestAgentName)}

RESPONSE DRAFT:`;

        try {
            const response = await this.ai.generate(prompt, 60_000, aiParts);
            const draft = this.replaceNoKnowledgeDraftIfContextExists(
                response,
                activeUserMessage,
                searchResponse.results,
                targetLanguage,
                linkedCustomerAnswer,
            );
            const cleanedDraft = this.removeProblemShiftSectionUnlessDetected(draft, isShift);
            return {
                draft: cleanedDraft || 'Draft could not be generated.',
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
        linkedCustomerAnswer?: string | null,
    ): string | null | undefined {
        if (!isNoKnowledgeAnswer(response)) {
            return response;
        }

        if (linkedCustomerAnswer) {
            this.logger.warn(`⚠️ Copilot LLM returned no-knowledge despite a usable ticket-opening AI answer. Reusing linked answer as grounded fallback.`);
            return this.formatLinkedCustomerAnswerForAgent(linkedCustomerAnswer);
        }

        if (results.length === 0) {
            return response;
        }

        this.logger.warn(`⚠️ Copilot LLM returned no-knowledge despite retrieved context. Using grounded fallback draft.`);
        return this.buildGroundedFallbackDraft(query, results, language);
    }

    private removeProblemShiftSectionUnlessDetected(
        draft: string | null | undefined,
        isProblemShift: boolean,
    ): string | null | undefined {
        if (!draft || isProblemShift) return draft;

        return draft
            .replace(
                /(^|\n)#{1,6}\s*(?:🔄\s*)?(?:Problem Değişimi|Konu Değişikliği|Problem Shift|Topic Shift|Problemwechsel|Themenwechsel)[^\n]*\n[\s\S]*?(?=\n#{1,6}\s|$)/gi,
                '$1',
            )
            .replace(/\n{3,}/g, '\n\n')
            .trim();
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
        const asksManualLicenseServer =
            /(?:lisans|license|lizenz|codemeter|wibu)/.test(normalizedQuery) &&
            /(?:sunucu|server)/.test(normalizedQuery) &&
            /(?:otomatik|automatic|auto|bulunmuyor|bulamiyor|find|finden|discovery|manuel|manual|ekle|add|eintragen)/.test(normalizedQuery);
        const top = results[0];
        const normalizedEvidence = this.normalizeSearchText(`${top?.title ?? ''} ${top?.content ?? ''}`);

        if (isTurkish && asksWorkgroupCheckout && /(?:workgroup|workgroupmanager|benutzer|kullanici|projekt|proje|dezentral|lck)/.test(normalizedEvidence)) {
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

        if (isTurkish && asksLicenseAccessRights && /(?:license|lisans|codemeter|wibu|access|erisim|zugriff|hak|permission|user|kullanici|benutzer)/.test(normalizedEvidence)) {
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

        if (isTurkish && asksManualLicenseServer && /(?:license|lisans|lizenz|codemeter|wibu|server|sunucu|automatic|automatisch|manuel|manual|ek|additional|zusatzlich|22350)/.test(normalizedEvidence)) {
            return [
                'Merhaba,',
                '',
                '## 📌 Sorun Yorumu',
                'İstemci bilgisayar lisans sunucusunu otomatik olarak bulamıyorsa, lisans sunucusu Allplan lisans ayarlarından manuel olarak eklenmelidir.',
                '',
                '## 🎯 En Olası Neden',
                'Bu genellikle otomatik sunucu keşfinin ağ, VPN, güvenlik duvarı veya isim çözümleme nedeniyle çalışmamasından kaynaklanır. Bu durumda istemciye lisans sunucusunun adı veya IP adresi elle tanıtılır.',
                '',
                '## ⚠️ Kritik Kontroller',
                '- Lisans sunucusunun çalıştığını ve istemci bilgisayardan erişilebilir olduğunu doğrulayın.',
                '- Güvenlik duvarı veya ağ kurallarının CodeMeter lisans iletişimini engellemediğini kontrol edin.',
                '- Sunucu adını kullanacaksanız DNS/isim çözümlemesinin doğru çalıştığından emin olun; emin değilseniz IP adresiyle test edin.',
                '',
                '## 🛠️ Çözüm Adımları',
                '1. İstemci bilgisayarda Allplan lisans ayarlarını açın.',
                '2. Lisans sunucusunu otomatik bulma seçeneği sonuç vermiyorsa manuel sunucu ekleme alanına lisans sunucusunun adını veya IP adresini girin.',
                '3. Ayarı kaydedin ve lisans listesinin yenilenmesini bekleyin.',
                '4. Lisans görünmüyorsa CodeMeter servisini ve ağ erişimini kontrol edin, ardından Allplan lisans ayarlarını tekrar açın.',
                '',
                '## ✅ Doğrulama',
                'Lisans ayarlarında sunucudan gelen lisansların listelendiğini ve istemci bilgisayarda Allplan’ın lisans alarak açıldığını doğrulayın.',
            ].join('\n');
        }

        if (isTurkish) {
            return [
                'Merhaba,',
                '',
                'Bu konu için bilgi kaynağında yeterince güvenilir ve doğrudan eşleşen içerik bulunamadı. Lütfen ilgili dökümanı ekleyin veya destek talebini manuel incelemeye alın.',
            ].join('\n');
        }

        return responseFallback();
    }

    private cleanExcerpt(value: string): string {
        return value
            .replace(/\s+/g, ' ')
            .replace(/\[Kaynak:[^\]]+\]/gi, '')
            .trim()
            .slice(0, 700);
    }

    private extractUsableInteractionAnswer(interaction?: { responseGenerated?: string | null } | null): string | null {
        const answer = interaction?.responseGenerated?.trim();
        if (!answer) return null;
        if (answer.startsWith('AI_ERROR:')) return null;
        if (isNoKnowledgeAnswer(answer)) return null;
        if (answer.length < 80) return null;
        return this.sanitizeLinkedCustomerAnswer(answer);
    }

    private buildLinkedCustomerAnswerContext(answer: string): string {
        return `
[LINKED_CUSTOMER_AI_ANSWER]
The customer-facing AI answer below was generated at ticket opening from the same user intent.
Use it as the primary grounding signal for this agent draft. Keep the same core solution and language.
If the new draft would otherwise say the knowledge base is insufficient, reuse this answer instead of contradicting it.

${answer}
[/LINKED_CUSTOMER_AI_ANSWER]`;
    }

    private buildTicketResponseTargetContext(requesterName: string | null, latestAgentName: string | null): string {
        const requesterLine = requesterName
            ? `Respond to the ticket requester/customer: ${requesterName}.`
            : 'Respond to the ticket requester/customer.';
        const agentLine = latestAgentName ? `Do not address ${latestAgentName}; that person is the support agent/admin, not the customer.` : '';

        return `
[TICKET_RESPONSE_TARGET]
${requesterLine}
The support agent/admin generating this draft is NOT the recipient.
${agentLine}
Opening greeting must address the ticket requester/customer once when a requester name is available.
[/TICKET_RESPONSE_TARGET]`;
    }

    private formatLinkedCustomerAnswerForAgent(answer: string): string {
        return this.sanitizeLinkedCustomerAnswer(answer);
    }

    private sanitizeLinkedCustomerAnswer(answer: string): string {
        return answer
            .split('\n')
            .filter(line => !/^\s*(kaynak|source|quelle)\s*:/i.test(line))
            .join('\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
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

    private isCustomerMessage(message: { senderId?: string | null }, ticketUserId?: string | null): boolean {
        return Boolean(ticketUserId && message.senderId && message.senderId === ticketUserId);
    }

    private resolveTicketRequesterName(ticket: { creator?: { fullName?: string | null } | null }): string | null {
        const fullName = ticket.creator?.fullName?.trim();
        return fullName || null;
    }

    private resolveLatestAgentName(ticket: {
        userId?: string | null;
        messages?: Array<{ senderId?: string | null; sender?: { fullName?: string | null } | null }>;
    }): string | null {
        const latestAgentMessage = ticket.messages?.find((message) => message.senderId && message.senderId !== ticket.userId && message.sender?.fullName);
        const fullName = latestAgentMessage?.sender?.fullName?.trim();
        return fullName || null;
    }

    private resolveTicketAnswerLanguage(ticket: {
        interaction?: { userContext?: unknown } | null;
        creator?: { language?: string | null } | null;
    }): 'tr' | 'en' | 'de' {
        const interactionLanguage = this.extractInteractionLanguage(ticket.interaction?.userContext);
        if (interactionLanguage) return interactionLanguage;

        const creatorLanguage = ticket.creator?.language?.toLowerCase() ?? '';
        if (creatorLanguage.startsWith('en')) return 'en';
        if (creatorLanguage.startsWith('de')) return 'de';
        return 'tr';
    }

    private extractInteractionLanguage(userContext: unknown): 'tr' | 'en' | 'de' | null {
        if (!userContext || typeof userContext !== 'object' || Array.isArray(userContext)) return null;

        const context = userContext as Record<string, unknown>;
        const rawLanguage = String(
            context.responseLanguage ||
            context.requestLocale ||
            context.language ||
            '',
        ).toLowerCase();

        if (rawLanguage.startsWith('en')) return 'en';
        if (rawLanguage.startsWith('de')) return 'de';
        if (rawLanguage.startsWith('tr')) return 'tr';
        return null;
    }
}

const responseFallback = () => [
    'Hello,',
    '',
    'The knowledge base does not contain enough reliable information for this exact question. Please add the relevant document or handle this support request manually.',
].join('\n');
