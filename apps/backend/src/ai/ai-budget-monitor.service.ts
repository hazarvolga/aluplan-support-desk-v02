import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SettingsService } from '../settings/settings.service';
import { RedisService } from '../redis/redis.service';
import { AiProviderRouter } from './ai-provider-router.service';

/**
 * AI Budget Monitor & Kill Switch
 *
 * Monitors global and per-tenant AI spending in real-time.
 * Implements automatic kill-switch when budget thresholds are exceeded.
 *
 * Features:
 * - Global daily USD cap with automatic service disable
 * - Per-tenant budget tracking
 * - Configurable warning thresholds (%80 alert)
 * - Slack webhook notifications
 * - Prometheus-compatible metrics export
 *
 * Kill Switch Behavior:
 * - Soft: Return 429 to new requests, allow in-flight requests to complete
 * - Hard: Disable all AI endpoints, require manual admin reset
 */
@Injectable()
export class AiBudgetMonitor {
    private readonly logger = new Logger(AiBudgetMonitor.name);
    private alertSent = new Map<string, boolean>();
    private readonly globalCap: number;

    constructor(
        private readonly settings: SettingsService,
        private readonly redis: RedisService,
        private readonly router: AiProviderRouter,
    ) {
        this.globalCap = parseFloat(process.env.AI_GLOBAL_DAILY_CAP || '200');
    }

    /**
     * Record token/cost usage after each AI call.
     */
    async recordUsage(
        tenantId: string,
        costUsd: number,
        inputTokens: number,
        outputTokens: number,
    ): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const client = this.redis.getClient();

        // Global cost tracking
        const globalKey = `ai:budget:global:cost:${today}`;
        await client.incrbyfloat(globalKey, costUsd);
        await client.expire(globalKey, 86400); // 24h TTL

        // Per-tenant cost tracking
        const tenantKey = `ai:budget:${tenantId}:cost:${today}`;
        await client.incrbyfloat(tenantKey, costUsd);
        await client.expire(tenantKey, 86400);

        // Token tracking
        const tokenKey = `ai:budget:${tenantId}:tokens:${today}`;
        await client.incrby(tokenKey, inputTokens + outputTokens);
        await client.expire(tokenKey, 86400);

        // Check thresholds after recording
        await this.checkThresholds(tenantId, today);
    }

    /**
     * Check if global or tenant budget is exceeded.
     */
    async isBudgetExceeded(tenantId: string): Promise<{ exceeded: boolean; reason?: string }> {
        const today = new Date().toISOString().split('T')[0];
        const config = await this.router.getTenantConfig(tenantId);

        // Check global cap
        const globalCost = parseFloat((await this.redis.get(`ai:budget:global:cost:${today}`)) || '0');
        if (globalCost >= this.globalCap) {
            return { exceeded: true, reason: `Global budget exceeded: $${globalCost.toFixed(2)} / $${this.globalCap}` };
        }

        // Check tenant cap
        const tenantCost = parseFloat((await this.redis.get(`ai:budget:${tenantId}:cost:${today}`)) || '0');
        if (tenantCost >= config.budget.dailyCap) {
            return { exceeded: true, reason: `Tenant budget exceeded: $${tenantCost.toFixed(2)} / $${config.budget.dailyCap}` };
        }

        return { exceeded: false };
    }

    /**
     * Get current budget status for a tenant.
     */
    async getBudgetStatus(tenantId: string): Promise<{
        global: { spent: number; cap: number; remaining: number };
        tenant: { spent: number; cap: number; remaining: number };
        tokens: { input: number; output: number; total: number };
    }> {
        const today = new Date().toISOString().split('T')[0];
        const config = await this.router.getTenantConfig(tenantId);

        const globalCost = parseFloat((await this.redis.get(`ai:budget:global:cost:${today}`)) || '0');
        const tenantCost = parseFloat((await this.redis.get(`ai:budget:${tenantId}:cost:${today}`)) || '0');
        const totalTokens = parseInt((await this.redis.get(`ai:budget:${tenantId}:tokens:${today}`)) || '0', 10);

        return {
            global: {
                spent: globalCost,
                cap: this.globalCap,
                remaining: Math.max(0, this.globalCap - globalCost),
            },
            tenant: {
                spent: tenantCost,
                cap: config.budget.dailyCap,
                remaining: Math.max(0, config.budget.dailyCap - tenantCost),
            },
            tokens: {
                input: Math.floor(totalTokens * 0.7), // approximate
                output: Math.floor(totalTokens * 0.3),
                total: totalTokens,
            },
        };
    }

    /**
     * Admin: Manually trigger global kill switch.
     */
    async triggerGlobalKillSwitch(reason: string): Promise<void> {
        await this.settings.setValue('ai.circuit_breaker.manual_off', 'true');
        await this.sendAlert('🚨 AI GLOBAL KILL SWITCH ACTIVATED', reason, 'critical');
        this.logger.error(`🔒 Global AI kill switch activated: ${reason}`);
    }

    /**
     * Admin: Manually re-enable AI services.
     */
    async resetGlobalKillSwitch(adminId: string): Promise<void> {
        await this.settings.setValue('ai.circuit_breaker.manual_off', 'false');
        // Reset all budget tracking for today
        const today = new Date().toISOString().split('T')[0];
        await this.redis.getClient().del(`ai:budget:global:cost:${today}`);
        this.alertSent.clear();
        await this.sendAlert('✅ AI SERVICES RE-ENABLED', `Reset by admin ${adminId}`, 'info');
        this.logger.log(`🔓 Global AI kill switch reset by admin ${adminId}`);
    }

    // ─── Private: Threshold Monitoring ──────────────────────────────────────

    private async checkThresholds(tenantId: string, today: string): Promise<void> {
        const config = await this.router.getTenantConfig(tenantId);
        const warningThreshold = config.budget.warningThreshold;

        // Check global threshold
        const globalCost = parseFloat((await this.redis.get(`ai:budget:global:cost:${today}`)) || '0');
        const globalRatio = globalCost / this.globalCap;

        if (globalRatio >= 1.0 && !this.alertSent.get('global:killed')) {
            await this.settings.setValue('ai.circuit_breaker.manual_off', 'true');
            await this.sendAlert(
                '🚨 AI BUDGET CRITICAL',
                `Global daily cap exceeded: $${globalCost.toFixed(2)} / $${this.globalCap}. AI services auto-disabled.`,
                'critical'
            );
            this.alertSent.set('global:killed', true);
        } else if (globalRatio >= warningThreshold && !this.alertSent.get('global:warning')) {
            await this.sendAlert(
                '⚠️ AI BUDGET WARNING',
                `Global daily cap at ${(globalRatio * 100).toFixed(0)}%: $${globalCost.toFixed(2)} / $${this.globalCap}`,
                'warning'
            );
            this.alertSent.set('global:warning', true);
        }

        // Check tenant threshold
        const tenantCost = parseFloat((await this.redis.get(`ai:budget:${tenantId}:cost:${today}`)) || '0');
        const tenantRatio = tenantCost / config.budget.dailyCap;

        if (tenantRatio >= warningThreshold && !this.alertSent.get(`tenant:${tenantId}:warning`)) {
            await this.sendAlert(
                '⚠️ TENANT BUDGET WARNING',
                `Tenant ${tenantId} daily cap at ${(tenantRatio * 100).toFixed(0)}%: $${tenantCost.toFixed(2)} / $${config.budget.dailyCap}`,
                'warning'
            );
            this.alertSent.set(`tenant:${tenantId}:warning`, true);
        }
    }

    /**
     * Periodic health check: Every 5 minutes verify budget status.
     */
    @Cron('*/5 * * * *')
    async periodicBudgetCheck(): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const globalCost = parseFloat((await this.redis.get(`ai:budget:global:cost:${today}`)) || '0');

        if (globalCost >= this.globalCap) {
            const isKilled = await this.settings.getValue('ai.circuit_breaker.manual_off');
            if (isKilled !== 'true') {
                await this.triggerGlobalKillSwitch('Periodic check: budget exceeded');
            }
        }
    }

    // ─── Private: Alerting ─────────────────────────────────────────────────

    private async sendAlert(title: string, message: string, severity: 'critical' | 'warning' | 'info'): Promise<void> {
        const slackWebhook = process.env.SLACK_WEBHOOK_URL;
        if (!slackWebhook) {
            this.logger.warn(`No Slack webhook configured. Alert: ${title} — ${message}`);
            return;
        }

        try {
            await fetch(slackWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: `${title}\n${message}\nSeverity: ${severity.toUpperCase()}\nTime: ${new Date().toISOString()}`,
                }),
            });
        } catch (err: any) {
            this.logger.error(`Failed to send Slack alert: ${err.message}`);
        }
    }
}
