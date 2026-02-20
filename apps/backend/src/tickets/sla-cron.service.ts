import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TicketStatus } from '@aluplan/database';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class SlaCronService {
    private readonly logger = new Logger(SlaCronService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    /**
     * Every 5 minutes: find active tickets with passed SLA deadlines and mark as breached.
     */
    @Cron(CronExpression.EVERY_5_MINUTES)
    async checkSlaBreaches() {
        const now = new Date();

        const breached = await this.prisma.ticket.findMany({
            where: {
                isSlaBreached: false,
                status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] },
                OR: [
                    // Resolve deadline passed
                    { slaResolveDue: { lt: now } },
                    // Response deadline passed and no response yet
                    { slaResponseDue: { lt: now }, slaRespondedAt: null },
                ],
            },
        });

        if (breached.length === 0) return;

        // Bulk update
        const ids = breached.map((t) => t.id);
        await this.prisma.ticket.updateMany({
            where: { id: { in: ids } },
            data: { isSlaBreached: true },
        });

        // Emit WebSocket breach events
        for (const ticket of breached) {
            this.notificationsGateway.emitSlaBreached(ticket);
            this.logger.warn(`🚨 SLA Breach: ${ticket.ticketNumber}`);
        }

        this.logger.log(`⏱ SLA check done — ${breached.length} breach(es) marked`);
    }

    /**
     * Every hour: auto-close tickets that have been RESOLVED for 5+ days without customer response.
     */
    @Cron(CronExpression.EVERY_HOUR)
    async autoCloseResolvedTickets() {
        const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

        const { count } = await this.prisma.ticket.updateMany({
            where: {
                status: TicketStatus.RESOLVED,
                resolvedAt: { lt: fiveDaysAgo },
            },
            data: {
                status: TicketStatus.CLOSED,
                closedAt: new Date(),
            },
        });

        if (count > 0) {
            this.logger.log(`🔒 Auto-closed ${count} resolved ticket(s)`);
        }
    }
}
