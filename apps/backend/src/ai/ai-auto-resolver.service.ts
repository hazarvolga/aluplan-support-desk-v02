import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Ticket, TicketStatus } from '@aluplan/database';
import { AiQueryService } from './ai-query.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';

@Injectable()
export class AiAutoResolverService {
    private readonly logger = new Logger(AiAutoResolverService.name);

    constructor(
        private readonly aiQueryService: AiQueryService,
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
                this.logger.log(`✅ Auto-resolving ticket ${ticket.ticketNumber} with HIGH confidence AI response.`);

                // 1. Add the AI message
                await this.prisma.ticketMessage.create({
                    data: {
                        ticketId: ticket.id,
                        senderId: null, // System / AI sender (null senderId)
                        message: result.answer,
                        isInternal: false,
                    }
                });

                // 2. Update ticket status to RESOLVED and set SLA metrics
                const now = new Date();
                await this.prisma.ticket.update({
                    where: { id: ticket.id },
                    data: {
                        status: TicketStatus.RESOLVED,
                        interactionId: result.interactionId,
                        slaRespondedAt: now,
                        slaSolvedAt: now,
                        resolvedAt: now,
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
        } catch (error) {
            this.logger.error(`❌ Failed to auto-resolve ticket ${ticket.ticketNumber}`, error.stack);
        }
    }

    /**
     * Listener triggered when a ticket feedback represents a high score (>=4).
     * Extracts useful context from the ticket and saves to embeddings.
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

            this.logger.log(`✅ Ticket ${ticket.ticketNumber} context saved to Vector DB.`);

        } catch (error) {
            this.logger.error(`❌ Failed to extract context for ticket ${ticket.ticketNumber}`, error.stack);
        }
    }
}
