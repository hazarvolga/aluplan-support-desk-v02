import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import * as nodemailer from 'nodemailer';
import { SettingsService } from '../settings/settings.service';
import { EmailProvider, SendEmailOptions } from './interfaces/email-provider.interface';

@Injectable()
export class GmailProvider implements EmailProvider {
    private readonly logger = new Logger(GmailProvider.name);

    constructor(private readonly settings: SettingsService) { }

    // Build an OAuth2 client from stored settings
    private async buildOAuth2Client() {
        const [clientId, clientSecret, refreshToken] = await Promise.all([
            this.settings.getValue('mail.gmail.client_id'),
            this.settings.getValue('mail.gmail.client_secret'),
            this.settings.getValue('mail.gmail.refresh_token'),
        ]);

        if (!clientId || !clientSecret || !refreshToken) {
            throw new Error('Gmail OAuth2 credentials eksik. Lütfen ayarlar sayfasından yapılandırın ve yetkilendirin.');
        }

        const redirectUri = await this.settings.getValue('mail.gmail.redirect_uri')
            || 'http://localhost:4000/api/v1/email/gmail/callback';

        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
        oauth2Client.setCredentials({ refresh_token: refreshToken });

        return { oauth2Client, clientId, clientSecret, refreshToken };
    }

    async send(options: SendEmailOptions): Promise<{ messageId: string }> {
        const { oauth2Client, clientId, clientSecret, refreshToken } = await this.buildOAuth2Client();

        // Get a fresh access token
        const { token: accessToken } = await oauth2Client.getAccessToken();
        if (!accessToken) {
            throw new Error('Gmail access token alınamadı. Refresh token geçersiz olabilir, lütfen yeniden yetkilendirin.');
        }

        const fromEmail = await this.settings.getValue('mail.gmail.email')
            || await this.settings.getValue('email.from_address')
            || 'newsletters@aluplan.info';

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: fromEmail,
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refreshToken,
                accessToken,
            },
        } as any);

        const info = await transporter.sendMail({
            from: `"Aluplan Destek" <${fromEmail}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });

        this.logger.log(`✅ Gmail sent: ${info.messageId} → ${options.to}`);
        return { messageId: info.messageId };
    }

    async healthCheck(): Promise<boolean> {
        try {
            const { oauth2Client } = await this.buildOAuth2Client();
            const { token } = await oauth2Client.getAccessToken();
            return !!token;
        } catch {
            return false;
        }
    }

    // Build the Google consent/authorization URL — called by controller
    async buildAuthUrl(): Promise<string> {
        const [clientId, clientSecret, email] = await Promise.all([
            this.settings.getValue('mail.gmail.client_id'),
            this.settings.getValue('mail.gmail.client_secret'),
            this.settings.getValue('mail.gmail.email'),
        ]);

        if (!clientId || !clientSecret) {
            throw new Error('Gmail Client ID ve Client Secret önce kaydedilmelidir.');
        }

        const redirectUri = await this.settings.getValue('mail.gmail.redirect_uri')
            || 'http://localhost:4000/api/v1/email/gmail/callback';

        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

        return oauth2Client.generateAuthUrl({
            access_type: 'offline',       // Required for refresh_token
            prompt: 'consent',            // Always show consent to get fresh refresh_token
            login_hint: email ?? undefined,  // Pre-select the newsletters@aluplan.info account
            scope: [
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/gmail.readonly',
            ],
        });
    }

    // Exchange authorization code for refresh/access token — called by callback endpoint
    async handleCallback(code: string): Promise<{ email: string }> {
        const [clientId, clientSecret] = await Promise.all([
            this.settings.getValue('mail.gmail.client_id'),
            this.settings.getValue('mail.gmail.client_secret'),
        ]);

        if (!clientId || !clientSecret) {
            throw new Error('Gmail Client ID ve Client Secret DB\'de bulunamadı.');
        }

        const redirectUri = await this.settings.getValue('mail.gmail.redirect_uri')
            || 'http://localhost:4000/api/v1/email/gmail/callback';

        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
        const { tokens } = await oauth2Client.getToken(code);

        if (!tokens.refresh_token) {
            throw new Error('Google refresh token döndürmedi. consent ekranından tekrar yetkilendirin.');
        }

        // Store refresh and access tokens securely (encrypted)
        await Promise.all([
            this.settings.upsert({ key: 'mail.gmail.refresh_token', value: tokens.refresh_token, isSecret: true }),
            ...(tokens.access_token
                ? [this.settings.upsert({ key: 'mail.gmail.access_token_cache', value: tokens.access_token, isSecret: true })]
                : []),
        ]);

        // Get authorized email address from Google
        oauth2Client.setCredentials(tokens);
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        const profile = await gmail.users.getProfile({ userId: 'me' });
        const email = profile.data.emailAddress || '';

        this.logger.log(`✅ Gmail OAuth2 authorized for: ${email}`);
        return { email };
    }
}
