import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { AiPart } from './interfaces/ai-provider.interface';
import { PromptContextBuilderService } from './prompt-context-builder.service';
import { EmbeddingService } from './embedding.service';
import { StorageService } from '../common/services/storage.service';
import { AiDiagnosisService } from './ai-diagnosis.service';

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

        // Identify latest message (descending order, so index 0 is newest)
        const latestMessage = ticket.messages[0];

        // Conditional Hotinfo for search query to avoid retrieval pollution
        // Using subject, description, AND the newest message to properly track context shifts
        const searchQuery = ticket.subject + '\n' + (ticket.description || '') + '\n' + (latestMessage?.message || '');
        const isHardwareQuery = /çökme|crash|donma|freeze|yavaş|slow|performans|hata|error|gpu|driver|sürücü|ram|bellek/i.test(searchQuery);

        let expandedSearchQuery = searchQuery;
        if (hotinfoSnapshot && isHardwareQuery && typeof hotinfoSnapshot === 'object') {
            expandedSearchQuery += `\n[Hotinfo]: ${hotinfoSnapshot.osVersion || ''} ${hotinfoSnapshot.gpu || ''} ${hotinfoSnapshot.errorTrace || ''}`;
        }

        // Perform a fresh search for the draft generator
        const searchResponse = await this.embeddingService.search(
            expandedSearchQuery,
            5,
            ticket.productId, // <-- Added productId to fix Search leakage
            true // drafts are for staff
        );
        const kbContent = searchResponse.results.length > 0
            ? searchResponse.results.map(r => r.content).join('\n\n---\n\n')
            : 'No specific knowledge base context found.';

        // Conversation overview
        const diagnosis = await this.diagnosisService.analyze(
            ticket.subject + ' ' + (latestMessage?.message || ''),
            [],
            ticket.productId
        );

        // 4. Format messages for context builder (internal format)
        const messages = ticket.messages
            .reverse() // Chronological
            .map(m => ({
                role: m.sender?.fullName ? 'user' : 'assistant',
                content: m.message
            }));

        // 5. Use Context Builder for unified, budget-aware context
        const context = await this.promptContextBuilder.buildContext({
            userId: ticket.userId || undefined,
            userQuery: latestMessage?.message || ticket.description || '',
            kbContent,
            hotinfoSnapshot,
            messages,
            diagnosis
        });

        const targetLanguage = ticket.creator?.language || 'tr';

        // 6. Prepare system prompt using the Master 7-Step engine
        const systemPrompt = `
You are a senior AI system designer and expert engineer powering ANN_TASLAK.
Your task is to prepare a professional diagnostic response draft using the 7-STEP engine.

---

## STEP 1-5 (TEKNİK ANALİZ)
- Analiz edilecek bağlam aşağıdadır: [CONVERSATION_CONTEXT]
- Teknik Tanı: ${diagnosis.productName} (${diagnosis.matchedKeywords.join(', ')})
- Multimodal: Eğer [ATTACHMENTS] (görsel) varsa, bunları hata kodları veya görsel anormallikler için dikkatle incele.

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

        const prompt = `
${systemPrompt}

[CONVERSATION_CONTEXT]
${context}

RESPONSE DRAFT:`;

        // 6. Build attachments for Vision analysis
        const aiParts: AiPart[] = [];
        this.logger.log(`🤖 Generating AI vision-augmented diagnostic draft for ticket ${ticket.ticketNumber}...`);

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
                        this.logger.warn(`Failed to process attachment ${att.url} for AI Vision: ${e.message}`);
                    }
                }
            }
        }

        try {
            const response = await this.ai.generate(prompt, 60_000, aiParts);
            return {
                draft: response || 'Draft could not be generated. Please check AI settings in the Admin panel.',
                model: 'dynamic'
            };
        } catch (error) {
            this.logger.error(`Failed to generate AI Copilot draft: ${error.message}`);
            return {
                draft: `AI_ERROR: Taslak oluşturulamadı. (Hata: ${error.message || 'Bilinmeyen Hata'}). Lütfen API anahtarlarınızı kontrol edin veya servis durumunu admin panelinden sorgulayın.`,
                model: 'dynamic'
            };
        }

    }
}
