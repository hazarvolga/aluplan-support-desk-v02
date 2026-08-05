import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../../settings/settings.service';
import * as crypto from 'crypto';

@Injectable()
export class InboundEmailWebhookSignatureGuard implements CanActivate {
    constructor(
        private readonly configService: ConfigService,
        private readonly settingsService: SettingsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const signature = this.getHeader(request.headers, 'x-webhook-signature');
        const secret = (await this.settingsService.getValue('email.inbound.webhook_secret'))
            || this.configService.get<string>('INBOUND_EMAIL_WEBHOOK_SECRET');

        if (!secret) {
            throw new UnauthorizedException('Inbound email webhook secret is not configured');
        }

        if (!signature) {
            throw new UnauthorizedException('Missing inbound email webhook signature');
        }

        const payload = this.getRawPayload(request);
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');

        if (!this.matches(signature, expectedSignature)) {
            throw new UnauthorizedException('Invalid inbound email webhook signature');
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

    private matches(signature: string, expectedSignature: string): boolean {
        const normalized = signature.startsWith('sha256=')
            ? signature.slice('sha256='.length)
            : signature;
        const signatureBuffer = Buffer.from(normalized);
        const expectedBuffer = Buffer.from(expectedSignature);

        if (signatureBuffer.length !== expectedBuffer.length) {
            crypto.timingSafeEqual(signatureBuffer, signatureBuffer);
            return false;
        }

        return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    }
}
