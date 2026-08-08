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
import { getReservedEmailRecipient } from './email-recipient-guard.util';

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
        // Read active provider from Settings, fall back to SMTP for the self-hosted mail path.
        await this.refreshProvider();
    }

    private async refreshProvider() {
        try {
            const providerName = (await this.settings.getValue('email.active_provider')) || 'smtp';
            this.logger.log(`📧 Active email provider from settings: ${providerName}`);
            switch (providerName) {
                case 'smtp':
                    this.provider = this.smtp;
                    break;
                case 'gmail':
                    this.provider = this.gmail;
                    break;
                case 'resend':
                    this.provider = this.resend;
                    break;
                default:
                    this.provider = this.smtp;
                    break;
            }
            this.logger.log(`📧 Email provider: ${providerName}`);
        } catch (error) {
            this.provider = this.smtp;
            await this.errorLogger.logError({
                action: 'email_provider_refresh_failed',
                message: 'Failed to refresh email provider, falling back to SMTP',
                error
            });
        }
    }

    private async getCurrentMailProviderForLog(): Promise<'RESEND' | 'SMTP'> {
        const providerName = (await this.settings.getValue('email.active_provider')) || 'smtp';
        return providerName === 'resend' ? 'RESEND' : 'SMTP';
    }

    /**
     * Entry-point for enqueueing emails securely. Creates Log tracking entries dynamically.
     */
    async enqueueEmail(payload: EmailPayload): Promise<void> {
        try {
            const blockedRecipient = process.env.NODE_ENV === 'production'
                ? getReservedEmailRecipient(payload.to)
                : null;
            if (blockedRecipient) {
                this.logger.warn(`🚫 Skipping email to reserved/test recipient: ${blockedRecipient}`);
                await this.prisma.emailLog.create({
                    data: {
                        recipientEmail: payload.to,
                        subject: payload.subject,
                        templateName: payload.template,
                        provider: await this.getCurrentMailProviderForLog(),
                        status: 'SKIPPED_INVALID_RECIPIENT',
                        error: `Reserved/test recipient blocked before enqueue: ${blockedRecipient}`,
                    }
                });
                return;
            }

            // 1. Map template to Email Type (Category)
            const emailType = this.mapTemplateToType(payload.template);

            // 2. Evaluate preference limits before proceeding.
            const userObj = await this.prisma.user.findUnique({
                where: { email: payload.to },
                select: { id: true, email: true }
            });

            let payloadForQueue = payload;

            if (userObj) {
                const [globalPref, typePref] = await Promise.all([
                    this.prisma.emailPreference.findUnique({
                        where: { userId_emailType: { userId: userObj.id, emailType: 'ALL' } }
                    }),
                    this.prisma.emailPreference.findUnique({
                        where: { userId_emailType: { userId: userObj.id, emailType } }
                    })
                ]);

                // If global or category preference is explicitly disabled, skip. Default is enabled if missing.
                if (globalPref?.enabled === false || typePref?.enabled === false) {
                    this.logger.warn(`🚫 Skipping email: ${payload.template} (${emailType}) to ${payload.to} - User Opted Out`);
                    return;
                }

                payloadForQueue = {
                    ...payload,
                    data: {
                        ...payload.data,
                        userId: payload.data?.userId ?? userObj.id,
                    },
                };
            }

            // 3. Create a draft log entry.
            const draftLog = await this.prisma.emailLog.create({
                data: {
                    recipientEmail: payloadForQueue.to,
                    subject: payloadForQueue.subject,
                    templateName: payloadForQueue.template,
                    provider: await this.getCurrentMailProviderForLog(),
                    status: 'QUEUED'
                }
            });

            // 4. Enqueue the BullMQ job.
            const job = await this.emailQueue.add(
                payloadForQueue.template,
                { ...payloadForQueue, logRef: draftLog.id },
                {
                    priority: payloadForQueue.priority ?? 3,
                    delay: payloadForQueue.delay ?? 0,
                    jobId: payloadForQueue.jobId,
                    attempts: 5, // Increased attempts for enterprise reliability
                    backoff: { type: 'exponential', delay: 2000 } // More generous backoff
                }
            );

            this.logger.log(`✅ Enqueued Email -> ${payloadForQueue.template} to ${payloadForQueue.to} (Log: ${draftLog.id}, Job: ${job.id}, Priority: ${payloadForQueue.priority || 3})`);
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

        if (template === 'raw' || template === 'broadcast' || template === 'master-announcement') return 'ANNOUNCEMENTS';
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

    async healthCheck(): Promise<{ provider: string; available: boolean; message?: string }> {
        // Force refresh to get latest settings
        await this.refreshProvider();
        
        // Get the real provider name directly from settings to avoid UI confusion
        const providerName = (await this.settings.getValue('email.active_provider')) || 'resend';
        
        try {
            const available = await this.provider.healthCheck();
            return {
                provider: providerName,
                available,
                message: available ? 'Connection successful' : 'Provider health check failed'
            };
        } catch (error: any) {
            return {
                provider: providerName,
                available: false,
                message: error.message
            };
        }
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
