import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TicketPriority } from '@aluplan/database';
import { BusinessHoursService } from './business-hours.service';

export interface SlaDeadlines {
    slaResponseDue: Date;
    slaResolveDue: Date;
}

// Default SLA hours per priority — overridable via Settings table
const DEFAULT_SLA_HOURS: Record<TicketPriority, { response: number; resolve: number }> = {
    LOW: { response: 24, resolve: 72 },
    MEDIUM: { response: 8, resolve: 24 },
    HIGH: { response: 4, resolve: 8 },
    URGENT: { response: 1, resolve: 4 },
};

@Injectable()
export class SlaService {
    private readonly logger = new Logger(SlaService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
        private readonly businessHoursService: BusinessHoursService,
    ) { }

    /**
     * Calculate SLA deadlines from current time based on priority.
     * Reads from Settings table if configured, falls back to defaults.
     * Uses BusinessHoursService to account for working hours.
     */
    async calculateDeadlines(priority: TicketPriority, from: Date = new Date()): Promise<SlaDeadlines> {
        const slaConfig = await this.getSlaConfig(priority);

        const [slaResponseDue, slaResolveDue] = await Promise.all([
            this.businessHoursService.calculateDeadline(from, slaConfig.response),
            this.businessHoursService.calculateDeadline(from, slaConfig.resolve),
        ]);

        return { slaResponseDue, slaResolveDue };
    }

    /**
     * Recalculate deadlines when ticket priority changes (escalation).
     */
    async recalculateOnEscalation(
        ticketId: string,
        newPriority: TicketPriority,
    ): Promise<SlaDeadlines> {
        const ticket = await this.prisma.ticket.findUniqueOrThrow({ where: { id: ticketId } });
        const now = new Date();

        const slaConfig = await this.getSlaConfig(newPriority);

        const slaResponseDue = ticket.slaRespondedAt
            ? ticket.slaResponseDue!  // Keep original if already responded
            : await this.businessHoursService.calculateDeadline(now, slaConfig.response);

        const slaResolveDue = await this.businessHoursService.calculateDeadline(now, slaConfig.resolve);

        return { slaResponseDue, slaResolveDue };
    }

    /**
     * Check if a ticket has breached its SLA and update DB if so.
     */
    async checkAndMarkBreach(ticketId: string): Promise<boolean> {
        const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
        if (!ticket || ticket.isSlaBreached) return false;

        const now = new Date();
        const isBreached =
            (ticket.slaResolveDue !== null && now > ticket.slaResolveDue) ||
            (ticket.slaResponseDue !== null && !ticket.slaRespondedAt && now > ticket.slaResponseDue);

        if (isBreached) {
            await this.escalateTicket(ticketId, 'SLA Breach Auto-Escalation');
            this.logger.warn(`🚨 SLA breached for ticket ${ticket.ticketNumber}`);
        }

        return isBreached;
    }

    async escalateTicket(ticketId: string, reason: string) {
        const ticket = await this.prisma.ticket.findUniqueOrThrow({ where: { id: ticketId } });

        // Prevent infinite escalation
        if (ticket.priority === TicketPriority.URGENT && ticket.escalated) return;

        await this.prisma.$transaction([
            this.prisma.ticket.update({
                where: { id: ticketId },
                data: {
                    priority: TicketPriority.URGENT,
                    escalated: true,
                    escalationCount: { increment: 1 },
                },
            }),
            this.prisma.ticketEscalation.create({
                data: {
                    ticketId,
                    fromPriority: ticket.priority,
                    toPriority: TicketPriority.URGENT,
                    reason,
                }
            })
        ]);
    }

    private async getSlaConfig(priority: TicketPriority): Promise<{ response: number; resolve: number }> {
        try {
            const key = priority.toLowerCase();
            const [responseRow, resolveRow] = await Promise.all([
                this.prisma.setting.findUnique({ where: { key: `sla_${key}_response_hours` } }),
                this.prisma.setting.findUnique({ where: { key: `sla_${key}_resolve_hours` } }),
            ]);

            return {
                response: responseRow ? parseInt(responseRow.value, 10) : DEFAULT_SLA_HOURS[priority].response,
                resolve: resolveRow ? parseInt(resolveRow.value, 10) : DEFAULT_SLA_HOURS[priority].resolve,
            };
        } catch {
            return DEFAULT_SLA_HOURS[priority];
        }
    }
}
