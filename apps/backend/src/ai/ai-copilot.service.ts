import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { AiPart } from './interfaces/ai-provider.interface';
import { PromptContextBuilderService } from './prompt-context-builder.service';
import { EmbeddingService } from './embedding.service';
import { StorageService } from '../common/services/storage.service';

@Injectable()
export class AiCopilotService {
    private readonly logger = new Logger(AiCopilotService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
        private readonly promptContextBuilder: PromptContextBuilderService,
        private readonly embeddingService: EmbeddingService,
        private readonly storage: StorageService,
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

        // Conditional Hotinfo for search query to avoid retrieval pollution
        const searchQuery = ticket.subject + '\n' + (ticket.description || '');
        const isHardwareQuery = /çökme|crash|donma|freeze|yavaş|slow|performans|hata|error|gpu|driver|sürücü|ram|bellek/i.test(searchQuery);

        let expandedSearchQuery = searchQuery;
        if (hotinfoSnapshot && isHardwareQuery && typeof hotinfoSnapshot === 'object') {
            expandedSearchQuery += `\n[Hotinfo]: ${hotinfoSnapshot.osVersion || ''} ${hotinfoSnapshot.gpu || ''} ${hotinfoSnapshot.errorTrace || ''}`;
        }

        // Perform a fresh search for the draft generator
        const searchResponse = await this.embeddingService.search(
            expandedSearchQuery,
            5,
            null,
            true // drafts are for staff
        );
        const kbContent = searchResponse.results.length > 0
            ? searchResponse.results.map(r => r.content).join('\n\n---\n\n')
            : 'No specific knowledge base context found.';

        // Use Context Builder to include Hotinfo properly
        const context = await this.promptContextBuilder.buildContext({
            userId: ticket.userId || undefined,
            userQuery: ticket.subject + '\n' + (ticket.description || ''),
            kbContent,
            hotinfoSnapshot
        });

        // Conversation overview
        const history = ticket.messages
            .map(m => `${m.sender?.fullName || 'SYSTEM/AI'}: ${m.message}`)
            .reverse()
            .join('\n');

        const userLanguage = (ticket.interaction as any)?.userLanguage || 'Turkish';
        const prompt = `Task: Prepare a response draft like a professional customer support representative.
Use the following "KNOWLEDGE SOURCE AND CONTEXT" and "CONVERSATION HISTORY" to write an empathetic and technically accurate response to help the customer.

KNOWLEDGE SOURCE AND CONTEXT:
${context}

CONVERSATION HISTORY:
${history}

RULES:
1. QUERY INTENT: Mentally classify the query (LICENSE, INSTALLATION, PERFORMANCE, MODELING).
   - If LICENSE/INSTALLATION: Prioritize procedural steps from the source.
2. SOURCE COMPLIANCE: Use ONLY information from the source.
   - [CRITICAL] If the source contains a menu path (e.g. "Allmenu -> ..."), you MUST include it EXACTLY.
   - Do NOT summarize into vague advice like "kontrol edin". Explain EXACTLY what/where to check.
3. STEP-BY-STEP: Present procedures as numbered lists.
4. UNAVAILABLE INFO: 
   - If a partial match exists, present the closest procedure and add: "Not: Tam eşleşme bulunamadı, ancak bu adımlar yardımcı olabilir."
   - ONLY if there is absolutely NO related info, use: "Veritabanımızda bu konuyla ilgili kesin teknik çözüm bulunamadığı için konuyu uzman mühendislerimize aktarıyorum."
5. TONE: Professional, empathetic, solution-oriented. Do not include greetings or signatures.
6. LANG: Use the same language as the customer (${userLanguage}).

RESPONSE DRAFT:`;


        this.logger.log(`🤖 Generating AI vision-augmented draft for ticket ${ticket.ticketNumber}...`);

        // Collect all image attachments from recent messages and convert to base64 for Vision
        const aiParts: AiPart[] = [];
        for (const msg of ticket.messages) {
            for (const att of msg.attachments || []) {
                if (att.mimeType?.startsWith('image/')) {
                    try {
                        const fileBuffer = await this.storage.getFile(att.key);
                        if (fileBuffer) {
                            aiParts.push({
                                inlineData: {
                                    mimeType: att.mimeType,
                                    data: fileBuffer.toString('base64')
                                }
                            });
                        }
                    } catch (e) {
                        this.logger.warn(`Failed to process attachment ${att.key} for AI Vision: ${e.message}`);
                    }
                }
            }
        }

        const response = await this.ai.generate(prompt, 60_000, aiParts);

        return {
            draft: response || 'Draft could not be generated. Please check AI settings in the Admin panel.',
            model: 'dynamic'
        };

    }
}
