import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ResendProvider } from './resend.provider';
import { SmtpProvider } from './smtp.provider';
import { EmailProvider, SendEmailOptions } from './interfaces/email-provider.interface';
import * as Templates from './email.templates';

@Injectable()
export class EmailService implements OnModuleInit {
    private readonly logger = new Logger(EmailService.name);
    private provider: EmailProvider;

    constructor(
        private readonly config: ConfigService,
        private readonly prisma: PrismaService,
        private readonly resend: ResendProvider,
        private readonly smtp: SmtpProvider,
    ) { }

    async onModuleInit() {
        // Read active provider from Settings table, fall back to env
        await this.refreshProvider();
    }

    private async refreshProvider() {
        try {
            const setting = await this.prisma.setting.findUnique({ where: { key: 'email_provider' } });
            const providerName = setting?.value ?? this.config.get('EMAIL_PROVIDER', 'resend');
            this.provider = providerName === 'smtp' ? this.smtp : this.resend;
            this.logger.log(`📧 Email provider: ${providerName}`);
        } catch {
            this.provider = this.resend;
        }
    }

    // ─── CORE SEND ───────────────────────────────────────────
    async send(options: SendEmailOptions): Promise<void> {
        try {
            const result = await this.provider.send(options);
            this.logger.log(`✉️ Email sent → ${JSON.stringify(options.to)} [${result.messageId}]`);
        } catch (err: any) {
            this.logger.error(`❌ Email send failed: ${err.message}`);
            // Don't throw — email is non-critical, business continues
        }
    }

    // ─── TICKET EVENT EMAILS ──────────────────────────────────
    async sendTicketCreated(data: {
        customerEmail: string;
        customerName: string;
        ticketNumber: string;
        subject: string;
        priority: string;
    }) {
        const portalUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/tickets/${data.ticketNumber}`;
        const template = Templates.ticketCreated({ ...data, portalUrl });
        await this.send({ to: data.customerEmail, ...template });
    }

    async sendTicketAssigned(data: {
        agentEmail: string;
        agentName: string;
        customerName: string;
        ticketNumber: string;
        subject: string;
        priority: string;
    }) {
        const portalUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/tickets/${data.ticketNumber}`;
        const template = Templates.ticketAssigned({ ...data, portalUrl });
        await this.send({ to: data.agentEmail, ...template });
    }

    async sendSlaBreachWarning(data: {
        recipientEmail: string;
        recipientName: string;
        ticketNumber: string;
        subject: string;
        priority: string;
        breachType: 'response' | 'resolve';
        minutesOverdue: number;
    }) {
        const portalUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/tickets/${data.ticketNumber}`;
        const template = Templates.slaBreachWarning({ ...data, portalUrl });
        await this.send({ to: data.recipientEmail, ...template });
    }

    async sendTicketResolved(data: {
        customerEmail: string;
        customerName: string;
        ticketNumber: string;
        subject: string;
    }) {
        const baseUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
        const template = Templates.ticketResolved({
            ...data,
            portalUrl: `${baseUrl}/tickets/${data.ticketNumber}`,
            feedbackUrl: `${baseUrl}/tickets/${data.ticketNumber}/feedback`,
        });
        await this.send({ to: data.customerEmail, ...template });
    }

    async sendNewMessage(data: {
        recipientEmail: string;
        recipientName: string;
        senderName: string;
        ticketNumber: string;
        messagePreview: string;
    }) {
        const portalUrl = `${this.config.get('FRONTEND_URL', 'http://localhost:3000')}/tickets/${data.ticketNumber}`;
        const template = Templates.newMessage({ ...data, portalUrl });
        await this.send({ to: data.recipientEmail, ...template });
    }

    // ─── HEALTH CHECK ─────────────────────────────────────────
    async healthCheck(): Promise<{ provider: string; available: boolean }> {
        const available = await this.provider.healthCheck();
        return {
            provider: this.provider instanceof ResendProvider ? 'resend' : 'smtp',
            available,
        };
    }

    // ─── HOT SWAP: Change provider without restart ────────────
    async switchProvider(name: 'resend' | 'smtp') {
        await this.prisma.setting.upsert({
            where: { key: 'email_provider' },
            update: { value: name },
            create: { key: 'email_provider', value: name },
        });
        await this.refreshProvider();
        return { provider: name };
    }
}
