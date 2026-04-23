import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { ResendProvider } from './resend.provider';
import { SmtpProvider } from './smtp.provider';
import { GmailProvider } from './gmail.provider';
import { EmailProvider } from './interfaces/email-provider.interface';
import { EmailPayload } from './email.templates';
import { ErrorLoggerService } from '../common/services/error-logger.service';

@Injectable()
export class EmailService implements OnModuleInit {
    private readonly logger = new Logger(EmailService.name);
    private provider: EmailProvider;

    constructor(
        @InjectQueue('email') private readonly emailQueue: Queue,
        private readonly settings: SettingsService,
        private readonly prisma: PrismaService,
        private readonly resend: ResendProvider,
        private readonly smtp: SmtpProvider,
        private readonly gmail: GmailProvider,
        private readonly errorLogger: ErrorLoggerService,
    ) { }

    async onModuleInit() {
        // Read active provider from Settings, fall back to resend
        await this.refreshProvider();
    }

    private async refreshProvider() {
        try {
            const providerName = (await this.settings.getValue('email.active_provider')) || 'resend';
            switch (providerName) {
                case 'smtp':
                    this.provider = this.smtp;
                    break;
                case 'gmail':
                    this.provider = this.gmail;
                    break;
                case 'resend':
                default:
                    this.provider = this.resend;
                    break;
            }
            this.logger.log(`📧 Email provider: ${providerName}`);
        } catch (error) {
            this.provider = this.resend;
            await this.errorLogger.logError({
                action: 'email_provider_refresh_failed',
                message: 'Failed to refresh email provider, falling back to Resend',
                error
            });
        }
    }

    /**
     * Entry-point for enqueueing emails securely. Creates Log tracking entries dynamically.
     */
    async enqueueEmail(payload: EmailPayload): Promise<void> {
        try {
            // 1. Map template to Email Type (Category)
            const emailType = this.mapTemplateToType(payload.template);

            // 2. Evaluate preference limits before proceeding.
            const userObj = await this.prisma.user.findUnique({
                where: { email: payload.to },
                select: { id: true, email: true }
            });

            if (userObj) {
                const pref = await this.prisma.emailPreference.findUnique({
                    where: { userId_emailType: { userId: userObj.id, emailType } }
                });

                // If preference is explicitly disabled, skip. (Default is enabled if missing)
                if (pref && pref.enabled === false) {
                    this.logger.warn(`🚫 Skipping email: ${payload.template} (${emailType}) to ${payload.to} - User Opted Out`);
                    return;
                }
            }

            // 3. Create a draft log entry.
            const draftLog = await this.prisma.emailLog.create({
                data: {
                    recipientEmail: payload.to,
                    subject: payload.subject,
                    templateName: payload.template,
                    provider: 'RESEND', // Use a valid enum value as initial draft
                    status: 'QUEUED'
                }
            });

            // 4. Enqueue the BullMQ job.
            const job = await this.emailQueue.add(
                payload.template,
                { ...payload, logRef: draftLog.id },
                {
                    priority: payload.priority ?? 3,
                    delay: payload.delay ?? 0,
                    jobId: payload.jobId,
                    attempts: 5, // Increased attempts for enterprise reliability
                    backoff: { type: 'exponential', delay: 2000 } // More generous backoff
                }
            );

            this.logger.log(`✅ Enqueued Email -> ${payload.template} to ${payload.to} (Log: ${draftLog.id}, Job: ${job.id}, Priority: ${payload.priority || 3})`);
        } catch (error) {
            this.logger.error(`❌ Failed to enqueue email: ${payload.template} to ${payload.to}`, error.stack);
            await this.errorLogger.logError({
                action: 'email_enqueue_failed',
                message: `Failed to enqueue email: ${payload.template}`,
                error,
                metadata: { to: payload.to, subject: payload.subject }
            });
            throw error;
        }
    }

    /**
     * Maps internal template names to user-facing preference categories.
     */
    private mapTemplateToType(template: string): string {
        const tickets = [
            'ticket-created', 'ticket-assigned', 'ticket-closed',
            'ticket-reopened', 'ticket-status-changed', 'ticket-updated',
            'csat-survey', 'sla-breached'
        ];
        const system = [
            'password-reset', 'welcome-customer', 'user-invited',
            'email-verification', 'security-alert', 'two-factor-auth'
        ];

        if (template === 'raw' || template === 'broadcast') return 'ANNOUNCEMENTS';
        if (tickets.includes(template)) return 'TICKETS';
        if (system.includes(template)) return 'SYSTEM';

        return 'SYSTEM'; // Default fallback
    }

    /**
     * Attempts to remove a pending email job from the queue.
     */
    async cancelEmail(jobId: string): Promise<boolean> {
        const job = await this.emailQueue.getJob(jobId);
        if (job) {
            await job.remove();
            this.logger.log(`🚫 Cancelled pending email job: ${jobId}`);
            return true;
        }
        return false;
    }

    // ─── TICKET EVENT EMAILS (Proxied to Enqueuer) ─────────────────────────

    async sendTicketCreated(data: any) {
        await this.enqueueEmail({
            template: 'ticket-created',
            to: data.customerEmail,
            subject: `[${data.ticketNumber}] Talebiniz alındı`,
            priority: 1, // Standard High Priority
            data: data
        });
    }

    async sendNewTicketToStaff(recipientEmails: string, data: any) {
        await this.enqueueEmail({
            template: 'staff-alert-new-ticket',
            to: recipientEmails,
            subject: `🚨 [YENİ TALEP] ${data.ticketNumber}: ${data.subject}`,
            priority: 1,
            data: data
        });
    }

    async sendTicketAssigned(data: any) {
        await this.enqueueEmail({
            template: 'ticket-assigned',
            to: data.agentEmail,
            subject: `[${data.ticketNumber}] Atanan Talep: ${data.subject}`,
            priority: 2,
            data: data
        });
    }

    async sendPasswordReset(data: any) {
        await this.enqueueEmail({
            template: 'password-reset',
            to: data.recipientEmail,
            subject: `Aluplan Destek - Yeni Şifreniz Oluşturuldu`,
            priority: 1, // High Priority
            data: data
        });
    }

    async sendSlaBreachWarning(data: any) {
        const type = data.breachType === 'response' ? 'Yanıt SLA İhlali' : 'Çözüm SLA İhlali';
        await this.enqueueEmail({
            template: 'sla-breached',
            to: data.recipientEmail,
            subject: `🚨 [${data.ticketNumber}] ${type}`,
            priority: 1,
            data: data
        });
    }

    async sendTicketResolved(data: any) {
        await this.enqueueEmail({
            template: 'ticket-closed',
            to: data.customerEmail,
            subject: `[${data.ticketNumber}] Biletiniz Çözümlendi`,
            priority: 2,
            data: data
        });
    }

    async sendTicketReopened(data: any) {
        await this.enqueueEmail({
            template: 'ticket-reopened',
            to: data.customerEmail,
            subject: `[${data.ticketNumber}] Bilet Tekrar Açıldı`,
            priority: 1,
            data: data
        });
    }

    async sendTicketStatusChanged(data: any) {
        await this.enqueueEmail({
            template: 'ticket-status-changed',
            to: data.customerEmail,
            subject: `[${data.ticketNumber}] Durum Güncellemesi`,
            priority: 2,
            data: data
        });
    }

    async sendAiSuggestedReply(data: any) {
        await this.enqueueEmail({
            template: 'ai-suggested-reply',
            to: data.agentEmail,
            subject: `🤖 Yapay Zeka Önerisi: #${data.ticketId}`,
            priority: 3, // Lower priority for suggestions
            data: data
        });
    }

    async sendNewMessage(data: any, options?: { delay?: number, jobId?: string }) {
        await this.enqueueEmail({
            template: 'ticket-updated',
            to: data.recipientEmail,
            subject: `[${data.ticketNumber}] Yeni Mesaj`,
            priority: 2,
            data: data,
            delay: options?.delay,
            jobId: options?.jobId,
        });
    }

    async sendUserInvited(data: any) {
        await this.enqueueEmail({
            template: 'user-invited',
            to: data.recipientEmail,
            subject: `Aluplan Destek Ekibine Davet Edildiniz`,
            priority: 1,
            data: data
        });
    }

    async sendEmailVerification(data: any) {
        await this.enqueueEmail({
            template: 'email-verification',
            to: data.recipientEmail,
            subject: `E-posta Adresinizi Doğrulayın`,
            priority: 1,
            data: data
        });
    }

    async sendWelcomeCustomer(data: any) {
        await this.enqueueEmail({
            template: 'welcome-customer',
            to: data.customerEmail,
            subject: `Aluplan Destek Merkezine Hoş Geldiniz`,
            priority: 2,
            data: data
        });
    }

    async sendCsatSurvey(data: any) {
        await this.enqueueEmail({
            template: 'csat-survey',
            to: data.customerEmail,
            subject: `[${data.ticketNumber}] Biletiniz için Geri Bildirim Bekliyoruz`,
            priority: 3,
            data: data
        });
    }

    async sendSecurityAlert(data: any) {
        await this.enqueueEmail({
            template: 'security-alert',
            to: data.recipientEmail,
            subject: `🚨 [GÜVENLİK UYARISI] Yeni Bir Cihazdan Giriş Yapıldı`,
            priority: 0, // CRITICAL PRIORITY
            data: data
        });
    }

    async sendTwoFactorAuth(data: any) {
        await this.enqueueEmail({
            template: 'two-factor-auth',
            to: data.recipientEmail,
            subject: `Aluplan Doğrulama Kodunuz`,
            priority: 0, // CRITICAL PRIORITY
            data: data
        });
    }

    // ─── UTILITIES & SYNC TRIGGERS ────────────────────────────

    async healthCheck(): Promise<{ provider: string; available: boolean }> {
        const available = await this.provider.healthCheck();
        let providerName = 'unknown';
        if (this.provider instanceof ResendProvider) providerName = 'resend';
        else if (this.provider instanceof SmtpProvider) providerName = 'smtp';
        else if (this.provider instanceof GmailProvider) providerName = 'gmail';

        return {
            provider: providerName,
            available,
        };
    }

    async switchProvider(name: 'resend' | 'smtp' | 'gmail') {
        await this.settings.upsert({
            key: 'email.active_provider',
            value: name,
        });
        await this.refreshProvider();
        return { provider: name };
    }
}
