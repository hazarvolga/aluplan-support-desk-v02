import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../utils/crypto.service';
import { CrmProvider } from '@aluplan/database';
import * as crypto from 'crypto';

@Injectable()
export class CrmWebhookGuard implements CanActivate {
    constructor(
        private prisma: PrismaService,
        private crypto: CryptoService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const signature = request.headers['x-signature'];

        if (!signature) {
            throw new UnauthorizedException('Missing x-signature header');
        }

        const connection = await this.prisma.crmConnection.findFirst({
            where: {
                provider: CrmProvider.DYNAMICS_365,
                isActive: true,
                deletedAt: null,
            }
        });

        if (!connection || !connection.webhookSecret) {
            throw new UnauthorizedException('CRM Webhook Secret not configured on server UI');
        }

        const decryptedSecret = this.crypto.decrypt(connection.webhookSecret);

        let payload = '';
        if (request.rawBody) {
            payload = request.rawBody.toString();
        } else if (request.body) {
            payload = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
        }

        const computedSignature = crypto
            .createHmac('sha256', decryptedSecret)
            .update(payload)
            .digest('hex');

        const a = Buffer.from(signature);
        const b = Buffer.from(computedSignature);

        if (a.length !== b.length) {
            crypto.timingSafeEqual(a, a); // dummy run to prevent timing discrepancies
            throw new UnauthorizedException('Invalid CRM Webhook Signature');
        }

        if (!crypto.timingSafeEqual(a, b)) {
            throw new UnauthorizedException('Invalid CRM Webhook Signature');
        }

        return true;
    }
}
