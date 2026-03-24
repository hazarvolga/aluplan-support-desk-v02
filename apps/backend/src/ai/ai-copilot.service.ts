import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { PromptContextBuilderService } from './prompt-context-builder.service';

@Injectable()
export class AiCopilotService {
    private readonly logger = new Logger(AiCopilotService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
        private readonly promptContextBuilder: PromptContextBuilderService,
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
                    include: { sender: { select: { fullName: true } } }
                },
                interaction: true,
                creator: {
                    include: { customerProfile: true }
                }
            }
        });

        if (!ticket) throw new NotFoundException('Ticket not found');

        // Extract Hotinfo
        const hotinfoSnapshot = ticket.hotinfoSnapshot || ticket.creator?.customerProfile?.hotinfoData;

        // Context from the initial AI search/RAG interaction
        const kbContent = ticket.interaction?.responseGenerated || 'No specific knowledge base context found for this incident.';

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

        const prompt = `Task: Prepare a response draft like a professional customer support representative.
Use the following "KNOWLEDGE SOURCE AND CONTEXT" and "CONVERSATION HISTORY" to write an empathetic and technically accurate response to help the customer.

KNOWLEDGE SOURCE AND CONTEXT:
${context}

CONVERSATION HISTORY:
${history}

RULES:
1. The response must be professional and solution-oriented.
2. Use only approved technical information from the KNOWLEDGE SOURCE.
3. Do not start with greetings like "Hello", "Dear ...", only write the body of the message.
4. Do not add an agent signature.
5. Provide the response in the same language used by the customer in the conversation history (Turkish, English, or German).
6. [PROACTIVE CLARIFICATION]: If the user's issue is related to technical errors, performance, exporting, installations, or crashes, YOU MUST CHECK the [MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)] section. If missing ("Bulunamadı"), proactively ask for the "_hotinfo_.hxl" file. If present, use it to accurately address hardware or driver issues.
7. [NO HALLUCINATION]: We are Aluplan Support (Allplan). Do NOT invent or guess the user's software versions (like AutoCAD) unless explicitly stated.

RESPONSE DRAFT:`;


        this.logger.log(`🤖 Generating AI draft for ticket ${ticket.ticketNumber}...`);
        const response = await this.ai.generate(prompt, 60_000);

        return {
            draft: response || 'Draft could not be generated. Please check AI settings in the Admin panel.',
            model: 'dynamic'
        };

    }
}
