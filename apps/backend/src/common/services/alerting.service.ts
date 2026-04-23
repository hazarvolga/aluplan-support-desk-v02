import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * AlertingService — Health-based alerting via webhooks.
 *
 * Sends alert notifications to configured webhook URLs
 * (Slack, Discord, PagerDuty, custom) when critical
 * health checks fail or recover.
 */
@Injectable()
export class AlertingService {
    private readonly logger = new Logger(AlertingService.name);
    private readonly webhookUrl: string | undefined;
    private readonly alertCooldownMs = 5 * 60 * 1000; // 5 minutes
    private lastAlertTime: Record<string, number> = {};

    constructor(private readonly config: ConfigService) {
        this.webhookUrl = this.config.get<string>('ALERT_WEBHOOK_URL') || undefined;
    }

    async sendAlert(checkName: string, status: 'down' | 'up', details?: string) {
        const now = Date.now();
        const key = `${checkName}:${status}`;

        // Cooldown to prevent alert spam
        if (status === 'down' && this.lastAlertTime[key] && (now - this.lastAlertTime[key]) < this.alertCooldownMs) {
            return;
        }
        this.lastAlertTime[key] = now;

        const emoji = status === 'down' ? '🔴' : '🟢';
        const message = `${emoji} *Aluplan Health Alert*\n\n*Check:* ${checkName}\n*Status:* ${status.toUpperCase()}${details ? `\n*Details:* ${details}` : ''}\n*Time:* ${new Date().toISOString()}`;

        this.logger.warn(`[ALERT] ${checkName} is ${status}${details ? `: ${details}` : ''}`);

        if (!this.webhookUrl) {
            this.logger.debug('No ALERT_WEBHOOK_URL configured, alert logged only');
            return;
        }

        try {
            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: message }),
            });
        } catch (error: any) {
            this.logger.error(`Failed to send alert webhook: ${error.message}`);
        }
    }
}
