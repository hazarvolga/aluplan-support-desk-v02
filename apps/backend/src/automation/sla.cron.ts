import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TicketStatus } from '@aluplan/database';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class SlaCronService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SlaCronService.name);

    constructor(
        @InjectQueue('sla-processing') private readonly slaQueue: Queue,
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    async onApplicationBootstrap() {
        try {
            // Register SLA warnings check repeatable job (every 5 minutes)
            await this.slaQueue.add(
                'check-warnings',
                {},
                {
                    repeat: { pattern: '*/5 * * * *' },
                    jobId: 'sla-check-warnings-repeatable',
                },
            );

            // Register SLA breaches check repeatable job (every 5 minutes)
            await this.slaQueue.add(
                'check-breaches',
                {},
                {
                    repeat: { pattern: '*/5 * * * *' },
                    jobId: 'sla-check-breaches-repeatable',
                },
            );

            // Register auto-close resolved tickets repeatable job (every hour)
            await this.slaQueue.add(
                'auto-close-tickets',
                {},
                {
                    repeat: { pattern: '0 * * * *' },
                    jobId: 'sla-auto-close-tickets-repeatable',
                },
            );

            this.logger.log('📢 SLA repeatable jobs enqueued successfully in BullMQ');
        } catch (error) {
            this.logger.error(`❌ Failed to register SLA repeatable jobs: ${error.message}`, error.stack);
        }
    }

    async checkSlaWarnings() {
        try {
            this.logger.debug('🤖 SLA Cron: Checking for tickets approaching SLA breaches...');
            const now = new Date();

            // Warning threshold: If an SLA is within 30 minutes of breaching.
            const warningThreshold = new Date(now.getTime() + 30 * 60000);

            // 1. Check Response SLA (Tickets that are OPEN and haven't gotten a first response)
            const responseRiskTickets = await this.prisma.ticket.findMany({
                where: {
                    status: TicketStatus.OPEN,
                    slaResponseDue: {
                        gt: now,
                        lte: warningThreshold
                    },
                    slaWarningSentAt: null
                },
                include: {
                    assignee: true
                }
            });

            for (const ticket of responseRiskTickets) {
                this.logger.warn(`SLA Warning (Response): Ticket ${ticket.ticketNumber} is breaching soon!`);

                if (ticket.assignee?.email) {
                    await this.eventEmitter.emitAsync('sla.warning', {
                        agentEmail: ticket.assignee.email,
                        agentName: ticket.assignee.fullName || 'Temsilci',
                        ticketId: ticket.id,
                        ticketNumber: ticket.ticketNumber,
                        subject: ticket.subject,
                        timeLeft: '30 dakikadan az',
                        breachType: 'response',
                        ticketStatus: ticket.status
                    });
                }

                // Record the warning attempt after listeners settle; not delivery proof.
                await this.prisma.ticket.update({
                    where: { id: ticket.id },
                    data: { slaWarningSentAt: new Date() }
                });
            }

            // 2. Check Resolution SLA (Tickets not closed/resolved)
            const resolutionRiskTickets = await this.prisma.ticket.findMany({
                where: {
                    status: {
                        notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.PENDING_CUSTOMER_REVIEW]
                    },
                    slaResolveDue: {
                        gt: now,
                        lte: warningThreshold
                    },
                    slaWarningSentAt: null
                },
                include: {
                    assignee: true
                }
            });

            for (const ticket of resolutionRiskTickets) {
                this.logger.warn(`SLA Warning (Resolution): Ticket ${ticket.ticketNumber} is breaching soon!`);

                if (ticket.assignee?.email) {
                    await this.eventEmitter.emitAsync('sla.warning', {
                        agentEmail: ticket.assignee.email,
                        agentName: ticket.assignee.fullName || 'Temsilci',
                        ticketId: ticket.id,
                        ticketNumber: ticket.ticketNumber,
                        subject: ticket.subject,
                        timeLeft: '30 dakikadan az',
                        breachType: 'resolution',
                        ticketStatus: ticket.status
                    });
                }

                // Record the warning attempt after listeners settle; not delivery proof.
                await this.prisma.ticket.update({
                    where: { id: ticket.id },
                    data: { slaWarningSentAt: new Date() }
                });
            }
        } catch (error) {
            this.logger.error('Error during SLA Cron warnings check', error);
        }
    }

    async checkSlaBreaches() {
        try {
            const now = new Date();

            // 1. Handle Active Breaches
            const breached = await this.prisma.ticket.findMany({
                where: {
                    isSlaBreached: false,
                    status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED, TicketStatus.PENDING_CUSTOMER_REVIEW] },
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
            const warningThreshold = new Date(now.getTime() + 15 * 60 * 1000);
            const nearing = await this.prisma.ticket.findMany({
                where: {
                    isSlaBreached: false,
                    status: { notIn: [TicketStatus.CLOSED, TicketStatus.RESOLVED, TicketStatus.PENDING_CUSTOMER_REVIEW] },
                    slaResponseDue: { lt: warningThreshold, gt: now },
                    slaRespondedAt: null,
                }
            });

            for (const ticket of nearing) {
                this.logger.warn(`⚠️ SLA Warning (80%): ${ticket.ticketNumber} is nearing response deadline.`);
            }

            if (breached.length > 0) {
                this.logger.log(`⏱ SLA check done — ${breached.length} breach(es) processed`);
            }
        } catch (error) {
            this.logger.error('Error during SLA Cron breaches check', error);
        }
    }

    async autoCloseResolvedTickets() {
        try {
            const now = new Date();
            const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
            await this.sendReviewReminders(fiveDaysAgo, now);
            const tickets = await this.prisma.ticket.findMany({
                where: {
                    deletedAt: null,
                    status: { in: [TicketStatus.RESOLVED, TicketStatus.PENDING_CUSTOMER_REVIEW] },
                    resolvedAt: { lte: fiveDaysAgo },
                },
                orderBy: { updatedAt: 'asc' },
                take: 100,
            });
            for (const ticket of tickets) {
                if (!ticket.resolvedAt) continue;
                try {
                    const updated = await this.prisma.ticket.update({
                        where: { id: ticket.id, status: ticket.status, resolvedAt: ticket.resolvedAt,
                            updatedAt: ticket.updatedAt, deletedAt: null },
                        data: {
                            status: TicketStatus.CLOSED,
                            closedAt: now,
                            messages: { create: {
                                message: 'Ticket closed after five days without customer confirmation.',
                                isInternal: true,
                                metadata: { action: 'AUTO_CLOSED_NO_RESPONSE',
                                    resolutionProposedAt: ticket.resolvedAt?.toISOString() ?? null },
                            } },
                        },
                    });
                    await this.eventEmitter.emitAsync('ticket.status_changed', {
                        ticketId: ticket.id, oldStatus: ticket.status, newStatus: TicketStatus.CLOSED,
                        closureReason: 'NO_CUSTOMER_RESPONSE',
                    });
                    await this.notificationsGateway.emitTicketUpdated(updated);
                } catch (error) {
                    if (error?.code === 'P2025') continue;
                    this.logger.error('Error completing automatic ticket closure', error);
                }
            }
        } catch (error) {
            this.logger.error('Error during SLA Cron auto close resolved tickets', error);
        }
    }

    private async sendReviewReminders(fiveDaysAgo: Date, now: Date) {
        const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
        const tickets = await this.prisma.ticket.findMany({
            where: {
                deletedAt: null,
                status: { in: [TicketStatus.RESOLVED, TicketStatus.PENDING_CUSTOMER_REVIEW] },
                resolvedAt: { gt: fiveDaysAgo, lte: fourDaysAgo },
            },
            // Recording a reminder advances updatedAt so later batches are not starved.
            orderBy: { updatedAt: 'asc' },
            take: 100,
        });
        for (const ticket of tickets) {
            if (!ticket.resolvedAt) continue;
            const metadata = { action: 'TICKET_REVIEW_REMINDER', resolutionProposedAt: ticket.resolvedAt.toISOString() };
            const previousReminder = await this.prisma.ticketMessage.findFirst({
                where: { ticketId: ticket.id, isInternal: true, deletedAt: null,
                    metadata: { equals: metadata } },
                select: { id: true },
            });
            if (previousReminder) continue;
            try {
                await this.prisma.ticket.update({
                    where: { id: ticket.id, status: ticket.status, resolvedAt: ticket.resolvedAt,
                        updatedAt: ticket.updatedAt, deletedAt: null },
                    data: { messages: { create: {
                        message: 'Customer confirmation reminder scheduled before automatic closure.',
                        isInternal: true, metadata,
                    } } },
                });
                await this.eventEmitter.emitAsync('ticket.review_reminder', { ticketId: ticket.id });
            } catch (error) {
                if (error?.code === 'P2025') continue;
                this.logger.error('Error scheduling customer confirmation reminder', error);
            }
        }
    }
}
