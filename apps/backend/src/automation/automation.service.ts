import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { TicketStatus } from '@aluplan/database';

@Injectable()
export class AutomationService {
    private readonly logger = new Logger(AutomationService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly audit: AuditService,
    ) { }

    @OnEvent('ticket.status_changed')
    async handleStatusChange(payload: { ticketId: string; oldStatus: TicketStatus; newStatus: TicketStatus; actorId?: string }) {
        this.logger.log(`🤖 Automation: Processing status change for ticket ${payload.ticketId} (${payload.oldStatus} -> ${payload.newStatus})`);

        // Log to Audit
        await this.audit.log({
            actorId: payload.actorId,
            action: 'ticket.status_changed',
            entityType: 'TICKET',
            entityId: payload.ticketId,
            oldValue: { status: payload.oldStatus },
            newValue: { status: payload.newStatus },
        });

        // Rule Evaluation logic will go here
        this.evaluateRules(payload.ticketId, 'STATUS_CHANGE', payload);
    }

    @OnEvent('ticket.created')
    async handleTicketCreated(ticket: any) {
        this.logger.log(`🤖 Automation: New ticket created ${ticket.ticketNumber}`);

        await this.audit.log({
            actorId: ticket.userId,
            action: 'ticket.created',
            entityType: 'TICKET',
            entityId: ticket.id,
            newValue: ticket,
        });

        this.evaluateRules(ticket.id, 'TICKET_CREATED', ticket);
    }

    private async evaluateRules(ticketId: string, trigger: string, context: any) {
        // Step 3.2 Placeholder: Fetch active TicketRule and match conditions
        this.logger.debug(`Evaluating rules for ${ticketId} [Trigger: ${trigger}]`);
    }
}
