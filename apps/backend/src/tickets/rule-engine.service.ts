import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Ticket, TicketMessage, TicketPriority } from '@aluplan/database';

@Injectable()
export class RuleEngineService {
    private readonly logger = new Logger(RuleEngineService.name);

    constructor(private readonly prisma: PrismaService) { }

    @OnEvent('ticket.created', { async: true })
    async handleTicketCreated(ticket: Ticket) {
        await this.evaluateRules('TICKET_CREATED', ticket.id, ticket);
    }

    @OnEvent('ticket.message_added', { async: true })
    async handleMessageAdded(event: { ticket: Ticket; message: TicketMessage }) {
        await this.evaluateRules('MESSAGE_ADDED', event.ticket.id, {
            ...event.ticket,
            messageBody: event.message.message
        });
    }

    private async evaluateRules(triggerOn: 'TICKET_CREATED' | 'MESSAGE_ADDED', ticketId: string, context: any) {
        try {
            const rules = await this.prisma.ticketRule.findMany({
                where: { isActive: true, triggerOn }
            });

            for (const rule of rules) {
                const conditions: Record<string, string> = rule.conditions as any;
                const actions: Record<string, string> = rule.actions as any;

                if (!conditions || !actions) continue;

                let isMatch = true;

                for (const [key, value] of Object.entries(conditions)) {
                    if (key === 'subject:contains') {
                        if (!context.subject?.toLowerCase().includes(value.toLowerCase())) isMatch = false;
                    } else if (key === 'priority:equals') {
                        if (context.priority !== value) isMatch = false;
                    } else if (key === 'message:contains' && typeof context.messageBody === 'string') {
                        if (!context.messageBody.toLowerCase().includes(value.toLowerCase())) isMatch = false;
                    }
                }

                if (isMatch) {
                    this.logger.log(`⚡ Rule matched: ${rule.name} for ticket ${ticketId}`);

                    const updateData: any = {};
                    for (const [key, value] of Object.entries(actions)) {
                        if (key === 'setPriority') {
                            updateData.priority = value as TicketPriority;
                        } else if (key === 'addTags') {
                            const current = await this.prisma.ticket.findUnique({ where: { id: ticketId }, select: { tags: true } });
                            if (current) {
                                const newTags = value.split(',').map(t => t.trim());
                                updateData.tags = Array.from(new Set([...current.tags, ...newTags]));
                            }
                        } else if (key === 'assignTo') {
                            updateData.assignedTo = value;
                        }
                    }

                    if (Object.keys(updateData).length > 0) {
                        await this.prisma.ticket.update({
                            where: { id: ticketId },
                            data: updateData
                        });
                        this.logger.log(`✅ Rule ${rule.name} applied to ticket ${ticketId}`);
                    }
                }
            }
        } catch (error) {
            this.logger.error(`❌ Rule evaluation failed for ticket ${ticketId}`, error.stack);
        }
    }
}
