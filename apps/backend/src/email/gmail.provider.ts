import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { EmailProvider, SendEmailOptions } from './interfaces/email-provider.interface';

@Injectable()
export class GmailProvider implements EmailProvider {
    private readonly logger = new Logger(GmailProvider.name);

    constructor(private readonly settings: SettingsService) { }

    async send(options: SendEmailOptions): Promise<{ messageId: string }> {
        this.logger.warn('Gmail OAuth2 provider is not fully implemented yet. Falling back to internal warning.');
        throw new Error('Gmail OAuth2 bağlantısı henüz tamamlanmadı. Lütfen şimdilik SMTP veya Resend kullanın.');
    }

    async healthCheck(): Promise<boolean> {
        // Placeholder refresh token check logic goes here
        const refreshToken = await this.settings.getValue('email.gmail.refresh_token');
        return !!refreshToken;
    }
}
