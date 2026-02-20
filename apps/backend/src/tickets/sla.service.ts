import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TicketPriority } from '@aluplan/database';
import { PrismaService } from '../prisma/prisma.service';

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
    ) { }

    /**
     * Calculate SLA deadlines from current time based on priority.
     * Reads from Settings table if configured, falls back to defaults.
     */
    async calculateDeadlines(priority: TicketPriority, from: Date = new Date()): Promise<SlaDeadlines> {
        const slaConfig = await this.getSlaConfig(priority);

        const slaResponseDue = new Date(from.getTime() + slaConfig.response * 60 * 60 * 1000);
        const slaResolveDue = new Date(from.getTime() + slaConfig.resolve * 60 * 60 * 1000);

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

        // If ticket already has a response, only recalculate resolve deadline
        const slaConfig = await this.getSlaConfig(newPriority);

        const slaResponseDue = ticket.slaRespondedAt
            ? ticket.slaResponseDue!  // Keep original if already responded
            : new Date(now.getTime() + slaConfig.response * 60 * 60 * 1000);

        const slaResolveDue = new Date(now.getTime() + slaConfig.resolve * 60 * 60 * 1000);

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
            await this.prisma.ticket.update({
                where: { id: ticketId },
                data: { isSlaBreached: true },
            });
            this.logger.warn(`🚨 SLA breached for ticket ${ticket.ticketNumber}`);
        }

        return isBreached;
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
