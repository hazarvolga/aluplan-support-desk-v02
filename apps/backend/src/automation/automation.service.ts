import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { TicketStatus } from '@aluplan/database';
import { EmailService } from '../email/email.service';

@Injectable()
export class AutomationService {
    private readonly logger = new Logger(AutomationService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly audit: AuditService,
        private readonly emailService: EmailService,
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

        // Send Status Change Email
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: payload.ticketId },
            include: { creator: true }
        });

        if (ticket?.creator?.email) {
            this.emailService.sendTicketStatusChanged({
                customerEmail: ticket.creator.email,
                customerName: ticket.creator.fullName || 'Değerli Müşterimiz',
                ticketNumber: ticket.ticketNumber,
                ticketId: ticket.id,
                oldStatus: payload.oldStatus,
                newStatus: payload.newStatus,
                ticketUrl: `${process.env.FRONTEND_URL}/tickets/${ticket.id}`
            }).catch(err => this.logger.error(`Failed to send status change email: ${err.message}`));

            // If RESOLVED or PENDING_CUSTOMER_REVIEW, send closed/survey email
            if (payload.newStatus === TicketStatus.RESOLVED || payload.newStatus === TicketStatus.PENDING_CUSTOMER_REVIEW) {
                if (payload.newStatus === TicketStatus.RESOLVED) {
                    this.emailService.sendTicketResolved({
                        customerEmail: ticket.creator.email,
                        customerName: ticket.creator.fullName,
                        ticketNumber: ticket.ticketNumber,
                        ticketId: ticket.id,
                        surveyUrl: `${process.env.FRONTEND_URL}/tickets/${ticket.id}/feedback`
                    });
                }

                this.emailService.sendCsatSurvey({
                    customerEmail: ticket.creator.email,
                    customerName: ticket.creator.fullName,
                    ticketNumber: ticket.ticketNumber,
                    ticketId: ticket.id,
                    surveyUrl: `${process.env.FRONTEND_URL}/tickets/${ticket.id}/feedback`
                });
            }
        }

        // Rule Evaluation logic will go here
        this.evaluateRules(payload.ticketId, 'STATUS_CHANGE', payload);
    }

    @OnEvent('ticket.message_added')
    async handleMessageAdded(payload: { ticket: any; message: any; recipientEmail?: string; userName?: string }) {
        this.logger.log(`🤖 Automation: Dispatching new message notification for ${payload.ticket.ticketNumber}`);

        if (payload.recipientEmail) {
            this.emailService.sendNewMessage({
                recipientEmail: payload.recipientEmail,
                userName: payload.userName || 'Kullanıcı',
                ticketId: payload.ticket.id,
                ticketNumber: payload.ticket.ticketNumber,
                latestMessage: payload.message.message,
                ticketUrl: `${process.env.FRONTEND_URL}/tickets/${payload.ticket.id}`
            }).catch(err => this.logger.error(`Failed to send message notification: ${err.message}`));
        }
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

        // Send confirmation email to customer
        if (ticket.creator?.email) {
            this.emailService.sendTicketCreated({
                customerEmail: ticket.creator.email,
                customerName: ticket.creator.fullName || 'Değerli Müşterimiz',
                ticketNumber: ticket.ticketNumber,
                subject: ticket.subject,
                priority: ticket.priority,
            }).catch(err => {
                this.logger.error(`Failed to send creation email for ${ticket.ticketNumber}: ${err.message}`);
                require('fs').writeFileSync('/tmp/mail_error.txt', err.stack || err.message);
            });
        }

        this.evaluateRules(ticket.id, 'TICKET_CREATED', ticket);
    }

    @OnEvent('user.created')
    async handleUserCreated(user: any) {
        this.logger.log(`🤖 Automation: User onboarded ${user.email}`);

        // Send confirmation email to customer
        if (user?.email) {
            this.emailService.sendWelcomeCustomer({
                customerEmail: user.email,
                fullName: user.fullName || 'Değerli Müşterimiz',
                loginUrl: `${process.env.FRONTEND_URL}/login`
            }).catch(err => {
                this.logger.error(`Failed to send welcome email for ${user.email}: ${err.message}`);
            });
        }
    }

    @OnEvent('auth.security_alert')
    async handleSecurityAlert(payload: { email: string; fullName?: string; location: string; ipValue: string }) {
        this.logger.log(`🚨 Automation: Security alert triggered for ${payload.email} at IP ${payload.ipValue}`);

        this.emailService.sendSecurityAlert({
            recipientEmail: payload.email,
            fullName: payload.fullName || 'Değerli Müşterimiz',
            location: payload.location,
            ipValue: payload.ipValue,
            time: new Date().toLocaleString()
        }).catch(err => {
            this.logger.error(`Failed to send security alert email for ${payload.email}: ${err.message}`);
        });
    }

    @OnEvent('auth.2fa_requested')
    async handle2faRequested(payload: { email: string; fullName?: string; code: string }) {
        this.emailService.sendTwoFactorAuth({
            recipientEmail: payload.email,
            fullName: payload.fullName || 'Kullanıcı',
            code: payload.code
        }).catch(err => {
            this.logger.error(`Failed to send 2FA email for ${payload.email}: ${err.message}`);
        });
    }

    @OnEvent('sla.warning')
    async handleSlaWarning(payload: { agentEmail: string; ticketNumber: string; subject: string; timeLeft: string; breachType: 'response' | 'resolution' }) {
        this.logger.warn(`🚨 Automation: Sending SLA Warning to ${payload.agentEmail} for ticket ${payload.ticketNumber}`);

        this.emailService.sendSlaBreachWarning({
            recipientEmail: payload.agentEmail,
            ticketNumber: payload.ticketNumber,
            subject: payload.subject,
            breachType: payload.breachType,
            // Actually reusing `sendSlaBreachWarning` but we'll override the HTML payload subject dynamically inside email.service if needed.
            // The template sla-breached vs sla-warning uses the same metadata. 
        }).catch(err => {
            this.logger.error(`Failed to send SLA warning email for ${payload.ticketNumber}: ${err.message}`);
        });
    }

    private async evaluateRules(ticketId: string, trigger: string, context: any) {
        // Step 3.2 Placeholder: Fetch active TicketRule and match conditions
        this.logger.debug(`Evaluating rules for ${ticketId} [Trigger: ${trigger}]`);
    }
}
