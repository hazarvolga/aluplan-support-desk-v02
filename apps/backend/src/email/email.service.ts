import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { ResendProvider } from './resend.provider';
import { SmtpProvider } from './smtp.provider';
import { GmailProvider } from './gmail.provider';
import { EmailProvider, SendEmailOptions } from './interfaces/email-provider.interface';
import { EmailPayload } from './email.templates';

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
        } catch {
            this.provider = this.resend;
        }
    }

    /**
     * Entry-point for enqueueing emails securely. Creates Log tracking entries dynamically.
     */
    async enqueueEmail(payload: EmailPayload): Promise<void> {
        // Evaluate preference limits before proceeding.
        /*const userObj = await this.prisma.user.findFirst({ where: { email: payload.to }, include: { settings: true } });
        if (userObj) {
            const pref = await this.prisma.emailPreference.findUnique({
               where: { userId_emailType: { userId: userObj.id, emailType: payload.template } }
            });
            if (pref && pref.enabled === false) {
                this.logger.log(`Skipping queue enqueue for ${payload.template} to ${payload.to} (User Opt-Out)`);
                return;
            }
        }*/

        // Inject initial mapping schema into our Database logs:
        const draftLog = await this.prisma.emailLog.create({
            data: {
                recipientEmail: payload.to,
                subject: payload.subject,
                templateName: payload.template,
                provider: 'RESEND',
                status: 'QUEUED'
            }
        });

        // Delegate to BullMQ for processing logic.
        const jobId = `${payload.template}:${payload.to}:${payload.data?.ticket?.id ?? 'sys'}`;
        await this.emailQueue.add('send-email', { ...payload, logRef: draftLog.id }, {
            jobId: jobId,
            delay: payload.delay ?? 0,
            priority: payload.priority ?? 2,
            removeOnComplete: true,
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 60000
            }
        });

        this.logger.log(`Enqueued Email -> ${payload.template} to ${payload.to} (Log ID: ${draftLog.id})`);
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

    async sendNewMessage(data: any) {
        await this.enqueueEmail({
            template: 'ticket-updated',
            to: data.recipientEmail,
            subject: `[${data.ticketNumber}] Yeni Mesaj`,
            priority: 2,
            data: data
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
