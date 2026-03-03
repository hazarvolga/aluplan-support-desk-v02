import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../utils/crypto.service';
import { CrmProvider } from '@aluplan/database';

@Injectable()
export class CrmWebhookGuard implements CanActivate {
    constructor(
        private prisma: PrismaService,
        private crypto: CryptoService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
            throw new UnauthorizedException('Missing x-api-key header');
        }

        const connection = await this.prisma.crmConnection.findUnique({
            where: { provider: CrmProvider.DYNAMICS_365 }
        });

        if (!connection || !connection.webhookSecret) {
            throw new UnauthorizedException('CRM Webhook Secret not configured on server UI');
        }

        const decryptedSecret = this.crypto.decrypt(connection.webhookSecret);

        if (apiKey !== decryptedSecret) {
            throw new UnauthorizedException('Invalid CRM API Key');
        }

        return true;
    }
}
