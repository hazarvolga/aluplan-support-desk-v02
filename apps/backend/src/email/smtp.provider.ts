import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { EmailProvider, SendEmailOptions } from './interfaces/email-provider.interface';
import nodemailer from 'nodemailer';

@Injectable()
export class SmtpProvider implements EmailProvider {
    private readonly logger = new Logger(SmtpProvider.name);

    constructor(private readonly settings: SettingsService) { }

    private async getTransporter(): Promise<nodemailer.Transporter | null> {
        const host = await this.settings.getValue('email.smtp.host');
        if (!host) return null;

        const port = parseInt((await this.settings.getValue('email.smtp.port')) ?? '587', 10);
        const isSecure = (await this.settings.getValue('email.smtp.secure')) === 'true';

        return nodemailer.createTransport({
            host,
            port,
            secure: isSecure, // true for 465, false for other ports
            auth: {
                user: (await this.settings.getValue('email.smtp.user')) ?? '',
                pass: (await this.settings.getValue('email.smtp.pass')) ?? '',
            },
            tls: {
                // Do not fail on invalid certs (common with docker-mailserver/self-signed)
                rejectUnauthorized: false,
                // Ensure modern TLS version is used
                minVersion: 'TLSv1.2'
            }
        } as nodemailer.TransportOptions);
    }

    async send(options: SendEmailOptions): Promise<{ messageId: string }> {
        const transporter = await this.getTransporter();
        if (!transporter) throw new Error('SMTP not configured');

        const _from = options.from ?? (await this.settings.getValue('email.from_address')) ?? process.env.MAIL_FROM ?? 'noreply@aluplan.com';
        const _to = typeof options.to === 'string' ? options.to.split(',').map(e => e.trim()) : options.to;
        const info = await transporter.sendMail({
            subject: options.subject,
            html: options.html,
            text: options.text,
        });
        return { messageId: info.messageId };
    }

    async healthCheck(): Promise<boolean> {
        const host = (await this.settings.getValue('email.smtp.host')) || 'localhost';
        const port = parseInt((await this.settings.getValue('email.smtp.port')) || '587', 10);
        
        const transporter = await this.getTransporter();
        if (!transporter) {
            this.logger.warn(`⚠️ SMTP check skipped: Host not configured.`);
            return false;
        }

        try {
            this.logger.log(`🔍 Testing SMTP connection to ${host}:${port}...`);
            await transporter.verify();
            this.logger.log(`✅ SMTP connection to ${host}:${port} successful.`);
            return true;
        } catch (error: any) {
            this.logger.error(`❌ SMTP Connection Failed (${host}:${port}): ${error.message}`);
            // Throwing allows EmailService to catch the error and return the message to the UI
            throw new Error(`SMTP (${host}:${port}) Refused: ${error.message}`);
        }
    }
}
