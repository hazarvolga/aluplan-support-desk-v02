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
        const hotinfoSnapshot = (ticket.hotinfoSnapshot || ticket.creator?.customerProfile?.hotinfoData) as any;
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

        const systemPrompt = `
${MASTER_DIAGNOSIS_PROMPT}

## STEP 7 — OUTPUT
Output ONLY in the following language: [${targetLanguage.toUpperCase()}]
Use strict headers:
## 📌 Sorun Yorumu
...
## 🎯 En Olası Neden
...
## 🛠️ Çözüm Adımları
...
`;

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
            return {
                draft: response || 'Draft could not be generated.',
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
}
