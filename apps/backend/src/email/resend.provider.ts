import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { EmailProvider, SendEmailOptions } from './interfaces/email-provider.interface';

@Injectable()
export class ResendProvider implements EmailProvider {
    private readonly logger = new Logger(ResendProvider.name);
    private readonly apiUrl = 'https://api.resend.com/emails';

    constructor(
        private readonly settings: SettingsService,
    ) { }

    private async getApiKey(): Promise<string | null> {
        const dbKey = await this.settings.getValue('email.resend.api_key');
        if (dbKey && dbKey.trim() !== '') {
            this.logger.debug('Using Resend API key from DATABASE');
            return dbKey;
        }

        const envKey = process.env.RESEND_API_KEY;
        if (envKey) {
            this.logger.debug('Using Resend API key from ENVIRONMENT (.env)');
            return envKey;
        }

        this.logger.error('Resend API key NOT FOUND in Database or Environment');
        return null;
    }

    async send(options: SendEmailOptions): Promise<{ messageId: string }> {
        const apiKey = await this.getApiKey();
        if (!apiKey) throw new Error('Resend API key not configured');

        const from = options.from ?? (await this.settings.getValue('email.from_address')) ?? process.env.MAIL_FROM ?? 'noreply@aluplan.com';
        const to = typeof options.to === 'string' ? options.to.split(',').map(e => e.trim()) : options.to;

        const res = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
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
            this.logger.error(`❌ Resend API error ${res.status} (from: ${from}, to: ${JSON.stringify(to)}): ${err}`);
            throw new Error(`Resend API error ${res.status}: ${err}`);
        }

        const data = await res.json() as { id: string };
        return { messageId: data.id };
    }

    async healthCheck(): Promise<boolean> {
        const apiKey = await this.getApiKey();
        if (!apiKey) return false;
        try {
            const res = await fetch('https://api.resend.com/domains', {
                headers: { 'Authorization': `Bearer ${apiKey}` },
                signal: AbortSignal.timeout(5_000),
            });
            return res.ok;
        } catch {
            return false;
        }
    }
}
