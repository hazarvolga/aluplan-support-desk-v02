import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider, SendEmailOptions } from './interfaces/email-provider.interface';

@Injectable()
export class ResendProvider implements EmailProvider {
    private readonly logger = new Logger(ResendProvider.name);
    private readonly apiKey: string;
    private readonly apiUrl = 'https://api.resend.com/emails';

    constructor(private readonly config: ConfigService) {
        this.apiKey = config.get<string>('RESEND_API_KEY', '');
    }

    async send(options: SendEmailOptions): Promise<{ messageId: string }> {
        const from = options.from ?? this.config.get('EMAIL_FROM', 'noreply@aluplan.com');
        const to = Array.isArray(options.to) ? options.to : [options.to];

        const res = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from,
                to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Resend API error ${res.status}: ${err}`);
        }

        const data = await res.json() as { id: string };
        return { messageId: data.id };
    }

    async healthCheck(): Promise<boolean> {
        if (!this.apiKey) return false;
        try {
            const res = await fetch('https://api.resend.com/domains', {
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
                signal: AbortSignal.timeout(5_000),
            });
            return res.ok;
        } catch {
            return false;
        }
    }
}
