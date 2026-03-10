import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';

@Injectable()
export class AiCopilotService {
    private readonly logger = new Logger(AiCopilotService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
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
            }
        });

        if (!ticket) throw new NotFoundException('Ticket not found');

        // Context from the initial AI search/RAG interaction
        const context = ticket.interaction?.responseGenerated || 'No specific knowledge base context found for this incident.';

        // Conversation overview
        const history = ticket.messages
            .map(m => `${m.sender?.fullName || 'SYSTEM/AI'}: ${m.message}`)
            .reverse()
            .join('\n');

        const prompt = `Task: Prepare a response draft like a professional customer support representative.
Use the following "KNOWLEDGE SOURCE" and "CONVERSATION HISTORY" to write an empathetic and technically accurate response to help the customer.

KNOWLEDGE SOURCE:
${context}

CONVERSATION HISTORY:
${history}

RULES:
1. The response must be professional and solution-oriented.
2. Use only approved technical information from the KNOWLEDGE SOURCE.
3. Do not start with greetings like "Hello", "Dear ...", only write the body of the message.
4. Do not add an agent signature.
5. Provide the response in the same language used by the customer in the conversation history (Turkish, English, or German).

RESPONSE DRAFT:`;


        this.logger.log(`🤖 Generating AI draft for ticket ${ticket.ticketNumber}...`);
        const response = await this.ai.generate(prompt, 60_000);

        return {
            draft: response || 'Draft could not be generated. Please check AI settings in the Admin panel.',
            model: 'dynamic'
        };

    }
}
