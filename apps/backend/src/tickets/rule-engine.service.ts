import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';
import { Ticket, TicketMessage, TicketPriority } from '@aluplan/database';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditService } from '../automation/audit.service';

@Injectable()
export class RuleEngineService {
    private readonly logger = new Logger(RuleEngineService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly audit: AuditService,
    ) { }

    @OnEvent('ticket.created', { async: true, promisify: true })
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
                const conditions = (rule.conditions as Record<string, unknown>) || {};
                const actions = (rule.actions as Record<string, unknown>) || {};

                if (!conditions || !actions) continue;

                let isMatch = true;

                for (const [key, value] of Object.entries(conditions)) {
                    const strValue = String(value);
                    if (key === 'subject:contains') {
                        if (!context.subject?.toLowerCase().includes(strValue.toLowerCase())) isMatch = false;
                    } else if (key === 'priority:equals') {
                        if (context.priority !== strValue) isMatch = false;
                    } else if (key === 'message:contains' && typeof context.messageBody === 'string') {
                        if (!context.messageBody.toLowerCase().includes(strValue.toLowerCase())) isMatch = false;
                    }
                }

                if (isMatch) {
                    this.logger.log(`⚡ Rule matched: ${rule.name} for ticket ${ticketId}`);

                    // Log rule match to audit
                    await this.audit.log({
                        action: 'automation.rule_matched',
                        entityType: 'TICKET',
                        entityId: ticketId,
                        newValue: { ruleName: rule.name, triggerOn },
                    });

                    const updateData: Record<string, unknown> = {};
                    for (const [key, value] of Object.entries(actions)) {
                        const strValue = String(value);
                        if (key === 'setPriority') {
                            updateData.priority = strValue as TicketPriority;
                        } else if (key === 'addTags') {
                            const current = await this.prisma.ticket.findUnique({ where: { id: ticketId }, select: { tags: true } });
                            if (current) {
                                const newTags = strValue.split(',').map((t: string) => t.trim());
                                updateData.tags = Array.from(new Set([...current.tags, ...newTags]));
                            }
                        } else if (key === 'assignTo') {
                            updateData.assignedTo = strValue;
                        } else if (key === 'translateTo') {
                            // Join the nested background operation, not the HTTP response.
                            await this.eventEmitter.emitAsync('ai.translate_message', {
                                ticketId,
                                messageId: (context as Record<string, unknown>).messageId as string,
                                targetLanguage: strValue
                            });
                        }
                    }

                    if (Object.keys(updateData).length > 0) {
                        const oldTicket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
                        await this.prisma.ticket.update({
                            where: { id: ticketId },
                            data: updateData
                        });

                        // Log rule application to audit
                        await this.audit.log({
                            action: 'automation.rule_applied',
                            entityType: 'TICKET',
                            entityId: ticketId,
                            oldValue: oldTicket,
                            newValue: updateData,
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
