import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Ticket, TicketStatus } from '@aluplan/database';
import { AiQueryService } from './ai-query.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiAutoResolverService {
    private readonly logger = new Logger(AiAutoResolverService.name);

    constructor(
        private readonly aiQueryService: AiQueryService,
        private readonly prisma: PrismaService,
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
}
