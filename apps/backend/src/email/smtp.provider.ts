import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider, SendEmailOptions } from './interfaces/email-provider.interface';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpProvider implements EmailProvider {
    private readonly logger = new Logger(SmtpProvider.name);
    private transporter: nodemailer.Transporter | null = null;

    constructor(private readonly config: ConfigService) {
        const host = config.get('SMTP_HOST');
        if (host) {
            this.transporter = nodemailer.createTransport({
                host,
                port: parseInt(config.get('SMTP_PORT', '587')),
                secure: config.get('SMTP_SECURE', 'false') === 'true',
                auth: {
                    user: config.get('SMTP_USER'),
                    pass: config.get('SMTP_PASS'),
                },
            });
        }
    }

    async send(options: SendEmailOptions): Promise<{ messageId: string }> {
        if (!this.transporter) throw new Error('SMTP not configured');

        const from = options.from ?? this.config.get('EMAIL_FROM', 'noreply@aluplan.com');
        const info = await this.transporter.sendMail({
            from,
            to: Array.isArray(options.to) ? options.to.join(',') : options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });
        return { messageId: info.messageId };
    }

    async healthCheck(): Promise<boolean> {
        if (!this.transporter) return false;
        try {
            await this.transporter.verify();
            return true;
        } catch {
            return false;
        }
    }
}
