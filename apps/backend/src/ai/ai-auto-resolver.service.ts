import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Ticket, TicketStatus, TicketMessage } from '@aluplan/database';
import { AiQueryService } from './ai-query.service';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';

@Injectable()
export class AiAutoResolverService {
    private readonly logger = new Logger(AiAutoResolverService.name);

    constructor(
        private readonly aiQueryService: AiQueryService,
        private readonly aiService: AiService,
        private readonly prisma: PrismaService,
        private readonly embeddingService: EmbeddingService,
    ) { }
    @OnEvent('ticket.created', { async: true })
    async handleTicketCreated(ticket: Ticket) {
        // Skip if already has interaction or if it's not a NEW ticket
        if (ticket.interactionId || ticket.status !== TicketStatus.NEW) {
            return;
        }

        try {
            const queryText = `${ticket.subject}\n\n${ticket.description || ''}`;
            this.logger.log(`🤖 Attempting auto-resolution for ticket ${ticket.ticketNumber}`);

            const result = await this.aiQueryService.query(queryText, ticket.userId ?? undefined);

            if (result.confidence === 'HIGH' && result.answer) {
                this.logger.log(`✍️ Creating Draft for ticket ${ticket.ticketNumber} with HIGH confidence AI response.`);

                // 1. Add the AI message as an internal note (Draft)
                await this.prisma.ticketMessage.create({
                    data: {
                        ticketId: ticket.id,
                        senderId: null, // System / AI sender
                        message: `[AI DRAFT RESPONSE]\n\n${result.answer}`,
                        isInternal: true,
                    }
                });

                // 2. Update ticket status to DRAFT wait for Human-in-the-loop
                await this.prisma.ticket.update({
                    where: { id: ticket.id },
                    data: {
                        status: TicketStatus.DRAFT,
                        interactionId: result.interactionId,
                    }
                });

            } else {
                this.logger.log(`⚠️ Ticket ${ticket.ticketNumber} did not meet auto-resolve threshold. Confidence: ${result.confidence}`);
                // Just link the interaction if it's not high enough, so agents can see what the AI thought
                await this.prisma.ticket.update({
                    where: { id: ticket.id },
                    data: {
                        interactionId: result.interactionId,
                    }
                });
            }
        } catch (error: any) {
            this.logger.error(`❌ Failed to auto-resolve ticket ${ticket.ticketNumber}`, error.stack);
        }
    }
    @OnEvent('ticket.message_added', { async: true })
    async handleMessageAdded(event: { ticket: Ticket; message: TicketMessage }) {
        const { ticket, message } = event;
        // Ignore internal messages and messages from someone who isn't the ticket creator (agents)
        if (message.isInternal || message.senderId !== ticket.userId) return;

        try {
            const sentiment = await this.aiService.analyzeSentiment(message.message);
            if (sentiment) {
                await this.prisma.ticketMessage.update({
                    where: { id: message.id },
                    data: { sentiment }
                });
                this.logger.log(`🎭 Sentimenent of message ${message.id} is ${sentiment}.`);

                if (sentiment === 'NEGATIVE' && ticket.priority !== 'URGENT') {
                    this.logger.warn(`😠 Negative sentiment detected in ticket ${ticket.ticketNumber}. Elevating priority.`);

                    await this.prisma.ticket.update({
                        where: { id: ticket.id },
                        data: { priority: 'URGENT' }
                    });
                }
            }
        } catch (e: any) {
            this.logger.error(`❌ Failed to analyze sentiment for message ${message.id}`, e.stack);
        }
    }

    /**
     * Listener triggered when a ticket feedback represents a high score (>=4).
     * Extracts useful context from the ticket and saves to embeddings AND creates a draft FaqEntry.
     */
    @OnEvent('ticket.kb_summarize', { async: true })
    async handleTicketSummarize(ticket: Ticket) {
        if (!ticket.satisfactionScore || ticket.satisfactionScore < 4) return;

        try {
            this.logger.log(`🤖 Reading high-rated ticket ${ticket.ticketNumber} for RAG AI...`);

            // Get all messages from this ticket
            const messages = await this.prisma.ticketMessage.findMany({
                where: { ticketId: ticket.id },
                orderBy: { createdAt: 'asc' }
            });

            if (messages.length === 0) return;

            // Simple concatenation for now (subject + description + messages)
            const conversation = messages.map(m => `[${m.isInternal ? 'Admin' : 'Customer'}]: ${m.message}`).join('\n\n');
            const totalContent = `TICKET: ${ticket.subject}\nISSUE: ${ticket.description || ''}\n\nCONVERSATION:\n${conversation}`;

            // Pass this context to the embedding service to index
            await this.embeddingService.indexTicket(ticket.id, totalContent);

            // Mark the ticket as having been added to knowledge base
            await this.prisma.ticket.update({
                where: { id: ticket.id },
                data: { knowledgeBaseAdded: true }
            });

            const faqPrompt = `Task: Analyze the following technical support conversation and create a professional FAQ entry from it.
            If the conversation contains a solution, extract the question and the answer with clear technical steps.
            
            CONVERSATION:
            ${totalContent}
            
            OUTPUT FORMAT (JSON):
            {
              "question": "Clear and technical question sentence",
              "answer": "Technical solution with numbered steps",
              "language": "tr | en | de" (The language used in the conversation)
            }`;


            const faqJson = await this.aiService.generate(faqPrompt);
            if (faqJson) {
                try {
                    const parsed = JSON.parse(faqJson);
                    await this.prisma.faqEntry.create({
                        data: {
                            question: parsed.question,
                            answer: parsed.answer,
                            language: parsed.language || 'tr',
                            status: 'PENDING_REVIEW',
                            confidenceScore: 0.95,
                            sourceTypes: ['TICKET'],
                            tags: ticket.tags,
                        }
                    });
                    this.logger.log(`📚 Created draft FAQ from ticket ${ticket.ticketNumber}`);
                } catch (pe) {
                    this.logger.error('Failed to parse FAQ JSON from AI', pe);
                }
            }

            this.logger.log(`✅ Ticket ${ticket.ticketNumber} context saved to Vector DB.`);

        } catch (error: any) {
            this.logger.error(`❌ Failed to extract context for ticket ${ticket.ticketNumber}`, error.stack);
        }
    }
}

