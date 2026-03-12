import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TicketStatus } from '@aluplan/database';

@Injectable()
export class SlaCronService {
    private readonly logger = new Logger(SlaCronService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async checkSlaWarnings() {
        try {
            this.logger.debug('🤖 SLA Cron: Checking for tickets approaching SLA breaches...');
            const now = new Date();

            // Warning threshold: If an SLA is within 30 minutes of breaching.
            // We look for tickets where the SLA due date is > now, but < now + 30 minutes, 
            // AND slaWarningSentAt is null.
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

                // Send warning email to assignee or log a system event
                if (ticket.assignee?.email) {
                    this.eventEmitter.emit('sla.warning', {
                        agentEmail: ticket.assignee.email,
                        ticketNumber: ticket.ticketNumber,
                        subject: ticket.subject,
                        timeLeft: '30 dakikadan az',
                        breachType: 'response'
                    });
                }

                // Mark as sent
                await this.prisma.ticket.update({
                    where: { id: ticket.id },
                    data: { slaWarningSentAt: new Date() }
                });
            }

            // 2. Check Resolution SLA (Tickets not closed/resolved)
            const resolutionRiskTickets = await this.prisma.ticket.findMany({
                where: {
                    status: {
                        notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED]
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
                    this.eventEmitter.emit('sla.warning', {
                        agentEmail: ticket.assignee.email,
                        ticketNumber: ticket.ticketNumber,
                        subject: ticket.subject,
                        timeLeft: '30 dakikadan az',
                        breachType: 'resolution'
                    });
                }

                // Mark as sent
                await this.prisma.ticket.update({
                    where: { id: ticket.id },
                    data: { slaWarningSentAt: new Date() }
                });
            }
        } catch (error) {
            this.logger.error('Error during SLA Cron checks', error);
        }
    }
}
