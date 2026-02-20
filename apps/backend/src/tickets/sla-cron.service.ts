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

        // 1. Handle Active Breaches
        const breached = await this.prisma.ticket.findMany({
            where: {
                isSlaBreached: false,
                status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] },
                OR: [
                    { slaResolveDue: { lt: now } },
                    { slaResponseDue: { lt: now }, slaRespondedAt: null },
                ],
            },
        });

        for (const ticket of breached) {
            await this.prisma.ticket.update({
                where: { id: ticket.id },
                data: { isSlaBreached: true },
            });

            // Auto-escalate to URGENT on breach
            await this.prisma.ticket.update({
                where: { id: ticket.id },
                data: {
                    priority: 'URGENT' as any,
                    escalated: true,
                    escalationCount: { increment: 1 }
                }
            });

            this.notificationsGateway.emitSlaBreached(ticket);
            this.logger.error(`🚨 SLA Breached & Escalated: ${ticket.ticketNumber}`);
        }

        // 2. Handle Near-Breach Warnings (80% path)
        // For simplicity: check tickets due in the next 15 minutes that haven't breached yet
        const warningThreshold = new Date(now.getTime() + 15 * 60 * 1000);
        const nearing = await this.prisma.ticket.findMany({
            where: {
                isSlaBreached: false,
                status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED] },
                slaResponseDue: { lt: warningThreshold, gt: now },
                slaRespondedAt: null,
            }
        });

        for (const ticket of nearing) {
            this.logger.warn(`⚠️ SLA Warning (80%): ${ticket.ticketNumber} is nearing response deadline.`);
            // In a real app, send email/slack to agent here
        }

        if (breached.length > 0) {
            this.logger.log(`⏱ SLA check done — ${breached.length} breach(es) processed`);
        }
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
