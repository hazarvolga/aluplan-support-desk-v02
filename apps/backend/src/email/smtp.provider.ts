import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { EmailProvider, SendEmailOptions } from './interfaces/email-provider.interface';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpProvider implements EmailProvider {
    private readonly logger = new Logger(SmtpProvider.name);

    constructor(private readonly settings: SettingsService) { }

    private async getTransporter(): Promise<nodemailer.Transporter | null> {
        const host = await this.settings.getValue('email.smtp.host');
        if (!host) return null;

        return nodemailer.createTransport({
            host,
            port: parseInt((await this.settings.getValue('email.smtp.port')) ?? '587', 10),
            secure: (await this.settings.getValue('email.smtp.secure')) === 'true',
            auth: {
                user: (await this.settings.getValue('email.smtp.user')) ?? '',
                pass: (await this.settings.getValue('email.smtp.pass')) ?? '',
            },
        } as nodemailer.TransportOptions);
    }

    async send(options: SendEmailOptions): Promise<{ messageId: string }> {
        const transporter = await this.getTransporter();
        if (!transporter) throw new Error('SMTP not configured');

        const from = options.from ?? (await this.settings.getValue('email.from_address')) ?? process.env.MAIL_FROM ?? 'noreply@aluplan.com';
        const info = await transporter.sendMail({
            from,
            to: Array.isArray(options.to) ? options.to.join(',') : options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });
        return { messageId: info.messageId };
    }

    async healthCheck(): Promise<boolean> {
        const transporter = await this.getTransporter();
        if (!transporter) return false;
        try {
            await transporter.verify();
            return true;
        } catch {
            return false;
        }
    }
}
