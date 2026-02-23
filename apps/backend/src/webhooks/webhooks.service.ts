import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class WebhooksService {
    private readonly logger = new Logger(WebhooksService.name);

    constructor(private readonly prisma: PrismaService) { }

    @OnEvent('ticket.*', { async: true })
    async handleTicketEvents(event: any, payload: any) {
        // Find active webhooks for this event
        const webhooks = await this.prisma.webhook.findMany({
            where: {
                isActive: true,
                events: {
                    has: event
                }
            }
        });

        for (const webhook of webhooks) {
            this.sendWebhook(webhook, event, payload);
        }
    }

    private async sendWebhook(webhook: any, event: string, payload: any) {
        try {
            this.logger.log(`📤 Sending webhook ${webhook.name} for event ${event} to ${webhook.url}`);

            await axios.post(webhook.url, {
                event,
                timestamp: new Date().toISOString(),
                payload,
            }, {
                timeout: 5000,
                headers: {
                    'X-Webhook-Secret': webhook.secret,
                    'Content-Type': 'application/json',
                }
            });

            this.logger.log(`✅ Webhook ${webhook.name} delivered`);
        } catch (error) {
            this.logger.error(`❌ Webhook ${webhook.name} failed: ${error.message}`);
        }
    }
}
