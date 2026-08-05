import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../../settings/settings.service';
import * as crypto from 'crypto';

@Injectable()
export class WhatsAppWebhookSignatureGuard implements CanActivate {
    constructor(
        private readonly configService: ConfigService,
        private readonly settingsService: SettingsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const signature = this.getHeader(request.headers, 'x-hub-signature-256');
        const appSecret = (await this.settingsService.getValue('whatsapp.webhook_secret'))
            || (await this.settingsService.getValue('whatsapp.app_secret'))
            || this.configService.get<string>('WHATSAPP_APP_SECRET');

        if (!appSecret) {
            throw new UnauthorizedException('WhatsApp webhook app secret is not configured');
        }

        if (!signature || !signature.startsWith('sha256=')) {
            throw new UnauthorizedException('Missing WhatsApp webhook signature');
        }

        const payload = this.getRawPayload(request);
        const expectedSignature = `sha256=${crypto
            .createHmac('sha256', appSecret)
            .update(payload)
            .digest('hex')}`;

        if (!this.safeEqual(signature, expectedSignature)) {
            throw new UnauthorizedException('Invalid WhatsApp webhook signature');
        }

        return true;
    }

    private getRawPayload(request: any): string {
        if (request.rawBody) {
            return Buffer.isBuffer(request.rawBody)
                ? request.rawBody.toString('utf8')
                : String(request.rawBody);
        }

        return typeof request.body === 'string' ? request.body : JSON.stringify(request.body ?? {});
    }

    private getHeader(headers: Record<string, string | string[] | undefined>, name: string): string | null {
        const value = headers[name] ?? headers[name.toLowerCase()];
        if (Array.isArray(value)) return value[0] ?? null;
        return value ?? null;
    }

    private safeEqual(a: string, b: string): boolean {
        const aBuffer = Buffer.from(a);
        const bBuffer = Buffer.from(b);

        if (aBuffer.length !== bBuffer.length) {
            crypto.timingSafeEqual(aBuffer, aBuffer);
            return false;
        }

        return crypto.timingSafeEqual(aBuffer, bBuffer);
    }
}
