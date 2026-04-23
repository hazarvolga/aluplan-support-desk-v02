import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AiProvider } from './interfaces/ai-provider.interface';
import { ProviderHealthStatus, AiProviderConfig } from './interfaces/ai-provider-config.interface';
import { SettingsService } from '../settings/settings.service';
import { RedisService } from '../redis/redis.service';

/**
 * AI Provider Registry
 *
 * Central registry for all AI providers. Supports dynamic registration,
 * health checking, and provider metadata management.
 *
 * Design Principles:
 * - Plugin architecture: New providers register without code changes
 * - Lazy health checks: Health status cached in Redis with TTL
 * - Provider isolation: Each provider is independently manageable
 */
@Injectable()
export class AiProviderRegistry implements OnModuleInit {
    private readonly logger = new Logger(AiProviderRegistry.name);
    private providers = new Map<string, AiProvider>();
    private configs = new Map<string, AiProviderConfig>();
    private healthStatuses = new Map<string, ProviderHealthStatus>();

    constructor(
        private readonly settings: SettingsService,
        private readonly redis: RedisService,
    ) { }

    async onModuleInit() {
        this.logger.log('🧠 AI Provider Registry initialized');
        // Load provider configs from settings/DB on boot
        await this.loadProviderConfigs();
    }

    /**
     * Register a provider implementation
     */
    register(providerId: string, provider: AiProvider, config: AiProviderConfig): void {
        this.providers.set(providerId, provider);
        this.configs.set(providerId, config);
        this.logger.log(`✅ Provider registered: ${providerId} (${config.displayName})`);
    }

    /**
     * Get provider by ID
     */
    get(providerId: string): AiProvider | undefined {
        return this.providers.get(providerId);
    }

    /**
     * Get provider config by ID
     */
    getConfig(providerId: string): AiProviderConfig | undefined {
        return this.configs.get(providerId);
    }

    /**
     * Get all registered provider IDs
     */
    getAllProviderIds(): string[] {
        return Array.from(this.providers.keys());
    }

    /**
     * Get all enabled providers sorted by priority
     */
    getEnabledProviders(): Array<{ id: string; config: AiProviderConfig; instance: AiProvider }> {
        const result: Array<{ id: string; config: AiProviderConfig; instance: AiProvider }> = [];
        for (const [id, provider] of this.providers.entries()) {
            const config = this.configs.get(id);
            if (config && config.enabled) {
                result.push({ id, config, instance: provider });
            }
        }
        return result.sort((a, b) => a.config.priority - b.config.priority);
    }

    /**
     * Check if provider is registered
     */
    has(providerId: string): boolean {
        return this.providers.has(providerId);
    }

    /**
     * Run health check for a single provider
     */
    async checkHealth(providerId: string): Promise<ProviderHealthStatus> {
        const provider = this.providers.get(providerId);
        const config = this.configs.get(providerId);
        if (!provider || !config) {
            return {
                providerId,
                healthy: false,
                lastCheckedAt: new Date(),
                latencyMs: 0,
                errorRate: 1,
                consecutiveFailures: 999,
                message: 'Provider not registered',
            };
        }

        const start = Date.now();
        try {
            const available = await provider.isAvailable();
            const latency = Date.now() - start;

            const status: ProviderHealthStatus = {
                providerId,
                healthy: available,
                lastCheckedAt: new Date(),
                latencyMs: latency,
                errorRate: available ? 0 : 1,
                consecutiveFailures: available ? 0 : (this.getConsecutiveFailures(providerId) + 1),
                message: available ? 'Healthy' : 'Provider unavailable',
            };

            this.healthStatuses.set(providerId, status);
            await this.cacheHealthStatus(status);
            return status;
        } catch (error: any) {
            const status: ProviderHealthStatus = {
                providerId,
                healthy: false,
                lastCheckedAt: new Date(),
                latencyMs: Date.now() - start,
                errorRate: 1,
                consecutiveFailures: this.getConsecutiveFailures(providerId) + 1,
                message: error.message || 'Health check failed',
            };
            this.healthStatuses.set(providerId, status);
            await this.cacheHealthStatus(status);
            return status;
        }
    }

    /**
     * Run health checks for all enabled providers
     */
    async checkAllHealth(): Promise<ProviderHealthStatus[]> {
        const enabled = this.getEnabledProviders();
        const results: ProviderHealthStatus[] = [];
        for (const { id } of enabled) {
            results.push(await this.checkHealth(id));
        }
        return results;
    }

    /**
     * Get cached health status (from memory or Redis)
     */
    async getHealthStatus(providerId: string): Promise<ProviderHealthStatus | undefined> {
        // Memory cache first
        const mem = this.healthStatuses.get(providerId);
        if (mem && Date.now() - mem.lastCheckedAt.getTime() < 30000) {
            return mem; // Cache for 30s in memory
        }

        // Redis cache
        const cached = await this.redis.get(`ai:health:${providerId}`);
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                parsed.lastCheckedAt = new Date(parsed.lastCheckedAt);
                this.healthStatuses.set(providerId, parsed);
                return parsed;
            } catch {
                // ignore parse errors
            }
        }

        // Run fresh check
        return this.checkHealth(providerId);
    }

    /**
     * Check if provider is healthy (cached result)
     */
    async isHealthy(providerId: string): Promise<boolean> {
        const status = await this.getHealthStatus(providerId);
        return status?.healthy ?? false;
    }

    private async loadProviderConfigs(): Promise<void> {
        // Load from settings service or database
        // This is a placeholder for dynamic config loading
        this.logger.log('📋 Provider configs loaded from settings');
    }

    private getConsecutiveFailures(providerId: string): number {
        return this.healthStatuses.get(providerId)?.consecutiveFailures ?? 0;
    }

    private async cacheHealthStatus(status: ProviderHealthStatus): Promise<void> {
        const key = `ai:health:${status.providerId}`;
        await this.redis.set(key, JSON.stringify(status), 60); // 60s TTL
    }
}
