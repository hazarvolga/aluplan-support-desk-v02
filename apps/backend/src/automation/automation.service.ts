import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from './audit.service';
import { TicketStatus } from '@aluplan/database';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { generateCsatFeedbackToken } from '../tickets/csat-feedback-token';

@Injectable()
export class AutomationService {
    private readonly logger = new Logger(AutomationService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly audit: AuditService,
        private readonly emailService: EmailService,
        private readonly config: ConfigService,
    ) { }

    @OnEvent('ticket.status_changed')
    async handleStatusChange(payload: { ticketId: string; oldStatus: TicketStatus; newStatus: TicketStatus; actorId?: string; resolution?: string }) {
        this.logger.log(`🤖 Automation: Processing status change for ticket ${payload.ticketId} (${payload.oldStatus} -> ${payload.newStatus})`);

        const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');

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
            await this.emailService.sendTicketStatusChanged({
                customerEmail: ticket.creator.email,
                customerName: ticket.creator.fullName || 'Değerli Müşterimiz',
                ticketNumber: ticket.ticketNumber,
                ticketId: ticket.id,
                oldStatus: payload.oldStatus,
                newStatus: payload.newStatus,
                ticketUrl: `${frontendUrl}/tickets/${ticket.id}`
            }).catch(err => this.logger.error(`Failed to send status change email: ${err.message}`));

            // If RESOLVED or PENDING_CUSTOMER_REVIEW, send closed/survey email
            if (payload.newStatus === TicketStatus.RESOLVED || payload.newStatus === TicketStatus.PENDING_CUSTOMER_REVIEW) {
                if (payload.newStatus === TicketStatus.RESOLVED) {
                    await this.emailService.sendTicketResolved({
                        customerEmail: ticket.creator.email,
                        customerName: ticket.creator.fullName || 'Değerli Müşterimiz',
                        ticketNumber: ticket.ticketNumber,
                        ticketId: ticket.id,
                        ticketSubject: ticket.subject,
                        ticketPriority: ticket.priority,
                        ticketPriorityLow: ticket.priority?.toLowerCase() || 'low',
                        closedAt: new Date().toLocaleString(),
                        resolution: payload.resolution || 'Bilet çözümlendi',
                        ticketUrl: `${frontendUrl}/tickets/${ticket.id}`
                    }).catch(() => this.logger.error('Failed to enqueue ticket resolution email'));
                }

                if (ticket.satisfactionScore == null) {
                    await this.emailService.sendCsatSurvey({
                        customerEmail: ticket.creator.email,
                        customerName: ticket.creator.fullName,
                        ticketNumber: ticket.ticketNumber,
                        ticketId: ticket.id,
                        surveyUrl: this.createCsatFeedbackUrl(frontendUrl, ticket.id)
                    }).catch(() => this.logger.error('Failed to enqueue customer survey email'));
                }
            }
        }

        // Rule Evaluation logic will go here
        await this.evaluateRules(payload.ticketId, 'STATUS_CHANGE', payload);
    }

    @OnEvent('ticket.message_added')
    async handleMessageAdded(payload: { ticket: any; message: any; recipientEmail?: string; userName?: string }) {
        this.logger.log(`🤖 Automation: Processing message notification for ${payload.ticket.ticketNumber} [Channel: ${payload.message.channel}]`);

        // Only explicitly public messages may leave the ticket through email.
        // Missing or malformed visibility must not expose a staff-only note.
        if (payload.message.isInternal === false && payload.recipientEmail) {
            const isWeb = payload.message.channel === 'WEB';
            const jobId = `email-ntf-msg-${payload.message.id}`; // Define jobId here
            const options = isWeb ? {
                delay: 60000, // 1 minute buffer for real-time read
                jobId: jobId, // Use the defined jobId
            } : undefined;

            if (isWeb) {
                this.logger.debug(`⏳ Smart Buffer: Delaying email for message ${payload.message.id} by 1m`);
            }

            const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');

            await this.emailService.sendNewMessage({
                recipientEmail: payload.recipientEmail,
                userName: payload.userName || 'Kullanıcı',
                ticketId: payload.ticket.ticketNumber, // Fixed: template expects ticketNumber here
                ticketNumber: payload.ticket.ticketNumber,
                latestMessage: payload.message.message,
                ticketUrl: `${frontendUrl}/tickets/${payload.ticket.id}`
            }, options).catch(err => this.logger.error(`Failed to send message notification: ${err.message}`));
        }
    }

    @OnEvent('ticket.created')
    async handleTicketCreated(ticket: any) {
        this.logger.log(`🤖 Automation: New ticket created ${ticket.ticketNumber}`);

        const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');

        await this.audit.log({
            actorId: ticket.userId,
            action: 'ticket.created',
            entityType: 'TICKET',
            entityId: ticket.id,
            newValue: ticket,
        });

        // Send confirmation email to customer
        if (ticket.creator?.email) {
            await this.emailService.sendTicketCreated({
                customerEmail: ticket.creator.email,
                customerName: ticket.creator.fullName || 'Değerli Müşterimiz',
                ticketNumber: ticket.ticketNumber,
                ticketId: ticket.id,
                ticketSubject: ticket.subject,
                ticketPriority: ticket.priority,
                ticketPriorityLow: ticket.priority?.toLowerCase() || 'low',
                ticketStatus: ticket.status,
                ticketCategory: ticket.tags?.includes('licensing')
                    ? 'Lisanslama'
                    : ticket.department?.name || undefined,
                ticketType: undefined,
                createdAt: new Date(ticket.createdAt).toLocaleString(),
                ticketUrl: `${frontendUrl}/tickets/${ticket.id}`
            }).catch(() => {
                this.logger.error('Failed to enqueue ticket creation email');
            });
        }

        // --- NEW: Notify Staff Members (Admin/Agent) ---
        try {
            const staff = await this.prisma.user.findMany({
                where: {
                    role: { name: { in: ['admin', 'super-admin', 'agent'] } },
                    status: 'ACTIVE'
                },
                select: { email: true }
            });

            const staffEmails = staff.map(s => s.email).filter(Boolean).join(',');

            if (staffEmails) {
                await this.emailService.sendNewTicketToStaff(staffEmails, {
                    ticketId: ticket.id,
                    ticketNumber: ticket.ticketNumber,
                    ticketSubject: ticket.subject,
                    ticketPriority: ticket.priority,
                    ticketPriorityLow: ticket.priority?.toLowerCase() || 'low',
                    ticketStatus: ticket.status,
                    ticketCategory: ticket.tags?.includes('licensing')
                        ? 'Lisanslama'
                        : ticket.department?.name || undefined,
                    ticketType: undefined,
                    customerName: ticket.creator?.fullName || 'Müşteri',
                    customerEmail: ticket.creator?.email || '-',
                    customerCompany: (ticket.creator as unknown as { customerProfile?: { companyName?: string } })?.customerProfile?.companyName || '-',
                    createdAt: new Date(ticket.createdAt).toLocaleString(),
                    ticketUrl: `${frontendUrl}/admin/tickets/${ticket.id}`
                }).catch(err => this.logger.error(`Failed to notify staff for ${ticket.ticketNumber}: ${err.message}`));
            }
        } catch (error) {
            this.logger.error(`Failed to fetch staff for notification: ${error.message}`);
        }

        await this.evaluateRules(ticket.id, 'TICKET_CREATED', ticket);
    }

    private createCsatFeedbackUrl(frontendUrl: string, ticketId: string): string {
        const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
        const secret = this.config.getOrThrow<string>('AUTH_ACTION_JWT_SECRET');
        const token = generateCsatFeedbackToken(ticketId, expiresAt, secret);
        return new URL(`/tr/feedback/${token}`, frontendUrl).toString();
    }

    @OnEvent('user.created')
    async handleUserCreated(user: any) {
        this.logger.log(`🤖 Automation: User onboarded ${user.email}`);

        // Send confirmation email to customer
        if (user?.email) {
            const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
            await this.emailService.sendWelcomeCustomer({
                email: user.email,
                customerName: user.fullName || 'Değerli Müşterimiz',
                verifyUrl: `${frontendUrl}/login`,
                password: 'CRM üzerinden yetkilendirildiniz. Şifrenizi sıfırlayarak giriş yapabilirsiniz.'
            }).catch(err => {
                this.logger.error(`Failed to send welcome email for ${user.email}: ${err.message}`);
            });
        }
    }

    @OnEvent('auth.security_alert')
    async handleSecurityAlert(payload: { email: string; fullName?: string; location: string; ipValue: string }) {
        this.logger.log(`🚨 Automation: Security alert triggered for ${payload.email} at IP ${payload.ipValue}`);

        const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
        await this.emailService.sendSecurityAlert({
            recipientEmail: payload.email,
            fullName: payload.fullName || 'Değerli Müşterimiz',
            locationInfo: payload.location,
            deviceInfo: payload.ipValue,
            loginDate: new Date().toLocaleString(),
            securityUrl: `${frontendUrl}/`
        }).catch(err => {
            this.logger.error(`Failed to send security alert email for ${payload.email}: ${err.message}`);
        });
    }

    @OnEvent('auth.2fa_requested')
    async handle2faRequested(payload: { email: string; fullName?: string; code: string }) {
        await this.emailService.sendTwoFactorAuth({
            recipientEmail: payload.email,
            fullName: payload.fullName || 'Kullanıcı',
            token: payload.code
        }).catch(err => {
            this.logger.error(`Failed to send 2FA email for ${payload.email}: ${err.message}`);
        });
    }

    @OnEvent('sla.warning')
    async handleSlaWarning(payload: { agentEmail: string; agentName?: string; ticketId?: string; ticketStatus?: string; ticketNumber: string; subject: string; timeLeft: string; breachType: 'response' | 'resolution' }) {
        this.logger.warn(`🚨 Automation: Sending SLA Warning to ${payload.agentEmail} for ticket ${payload.ticketNumber}`);

        const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');

        await this.emailService.sendSlaBreachWarning({
            recipientEmail: payload.agentEmail,
            agentName: payload.agentName || 'Temsilci',
            ticketId: payload.ticketId,
            ticketNumber: payload.ticketNumber,
            ticketSubject: payload.subject,
            ticketStatus: payload.ticketStatus || 'OPEN',
            ticketUrl: `${frontendUrl}/tickets/${payload.ticketId}`,
            minutesLeft: payload.timeLeft,
            breachType: payload.breachType,
        }).catch(err => {
            this.logger.error(`Failed to send SLA warning email for ${payload.ticketNumber}: ${err.message}`);
        });
    }

    private async evaluateRules(ticketId: string, trigger: string, _context: any) {
        // Step 3.2 Placeholder: Fetch active TicketRule and match conditions
        this.logger.debug(`Evaluating rules for ${ticketId} [Trigger: ${trigger}]`);
    }
}
