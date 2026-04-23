import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { AiProvider } from './interfaces/ai-provider.interface';
import {
    TenantAiConfig,
    RoutingDecision,
    ProviderHealthStatus,
} from './interfaces/ai-provider-config.interface';
import { AiProviderRegistry } from './ai-provider-registry.service';
import { SettingsService } from '../settings/settings.service';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import CircuitBreaker from 'opossum';

/**
 * AI Provider Router
 *
 * User/Project-level AI provider routing with health-check-based policy routing.
 * Replaces hard-coded model cascading with dynamic, config-driven provider selection.
 *
 * Architecture:
 * - Primary provider: Configured per tenant (default: openai)
 * - Fallback chain: Ordered list of backup providers
 * - Health-check routing: Unhealthy providers automatically skipped
 * - Quota routing: Budget-exceeded providers skipped
 * - Plugin support: New providers register dynamically via AiProviderRegistry
 *
 * Guarantees:
 * - Vector DB consistency: All embeddings normalized to canonical space
 * - No provider lock-in: Switch providers without code changes
 * - Observability: Every routing decision logged with reason
 */
@Injectable()
export class AiProviderRouter {
    private readonly logger = new Logger(AiProviderRouter.name);
    private breakers = new Map<string, CircuitBreaker>();
    private tenantCache = new Map<string, TenantAiConfig>();

    constructor(
        private readonly registry: AiProviderRegistry,
        private readonly settings: SettingsService,
        private readonly redis: RedisService,
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Route a task to the best available provider for a tenant/user.
     *
     * Routing logic (in priority order):
     * 1. Forced provider override (admin kill-switch)
     * 2. Primary provider (if healthy and within quota)
     * 3. Fallback chain (first healthy provider)
     * 4. Global default (openai)
     * 5. Throw ServiceUnavailableException
     */
    async route(
        tenantId: string,
        taskType: 'chat' | 'embed' | 'vision',
    ): Promise<{ provider: AiProvider; decision: RoutingDecision }> {
        const config = await this.getTenantConfig(tenantId);

        // 1. Check global kill switch
        const killSwitch = await this.settings.getValue('ai.circuit_breaker.manual_off');
        if (killSwitch === 'true') {
            throw new ServiceUnavailableException(
                'AI services globally disabled by administrator'
            );
        }

        // 2. Check tenant budget
        const budgetExceeded = await this.isBudgetExceeded(tenantId, config);
        if (budgetExceeded) {
            throw new ServiceUnavailableException(
                'Daily AI budget exceeded for this tenant'
            );
        }

        // 3. Determine provider chain
        const chain = [config.primaryProvider, ...config.fallbackChain];
        const enabledProviders = this.registry.getEnabledProviders().map((p) => p.id);
        const candidates = chain.filter((id) => enabledProviders.includes(id));

        // 4. Evaluate each candidate
        for (const providerId of candidates) {
            const decision = await this.evaluateProvider(providerId, taskType, config);
            if (decision) {
                const provider = this.registry.get(providerId);
                if (provider) {
                    this.logger.log(
                        `🔀 Routed ${taskType} to ${providerId} for tenant ${tenantId} (reason: ${decision.reason})`
                    );
                    return { provider, decision };
                }
            }
        }

        // 5. Global default fallback
        const defaultProvider = this.registry.get('openai');
        if (defaultProvider && (await this.registry.isHealthy('openai'))) {
            return {
                provider: defaultProvider,
                decision: {
                    providerId: 'openai',
                    reason: 'fallback',
                    estimatedLatencyMs: 0,
                },
            };
        }

        this.logger.error(`🚨 No healthy AI provider available for tenant ${tenantId}`);
        throw new ServiceUnavailableException('All AI providers unavailable');
    }

    /**
     * Get the embedding provider for a tenant.
     * Embeddings MUST use canonical normalization for vector DB consistency.
     */
    async getEmbedProvider(tenantId: string): Promise<AiProvider> {
        const config = await this.getTenantConfig(tenantId);
        const embedProviderId = config.embedding.provider || config.primaryProvider;

        const provider = this.registry.get(embedProviderId);
        if (!provider) {
            this.logger.warn(`Embedding provider ${embedProviderId} not found, falling back to openai`);
            const fallback = this.registry.get('openai');
            if (!fallback) {
                throw new ServiceUnavailableException('No embedding provider available');
            }
            return fallback;
        }

        const healthy = await this.registry.isHealthy(embedProviderId);
        if (!healthy) {
            this.logger.warn(`Embedding provider ${embedProviderId} unhealthy, falling back`);
            // Try fallback chain
            for (const fallbackId of config.fallbackChain) {
                const fallback = this.registry.get(fallbackId);
                if (fallback && (await this.registry.isHealthy(fallbackId))) {
                    return fallback;
                }
            }
            throw new ServiceUnavailableException('No healthy embedding provider available');
        }

        return provider;
    }

    /**
     * Get tenant configuration (cached)
     */
    async getTenantConfig(tenantId: string): Promise<TenantAiConfig> {
        // Memory cache
        const cached = this.tenantCache.get(tenantId);
        if (cached && Date.now() - cached.updatedAt.getTime() < 60000) {
            return cached;
        }

        // Redis cache
        const redisKey = `ai:config:${tenantId}`;
        const redisCached = await this.redis.get(redisKey);
        if (redisCached) {
            try {
                const parsed = JSON.parse(redisCached);
                parsed.updatedAt = new Date(parsed.updatedAt);
                this.tenantCache.set(tenantId, parsed);
                return parsed;
            } catch {
                // ignore
            }
        }

        // Load from database / settings
        const config = await this.loadTenantConfigFromDb(tenantId);
        this.tenantCache.set(tenantId, config);
        await this.redis.set(redisKey, JSON.stringify(config), 300); // 5 min cache
        return config;
    }

    /**
     * Invalidate tenant config cache (call after config changes)
     */
    async invalidateConfig(tenantId: string): Promise<void> {
        this.tenantCache.delete(tenantId);
        await this.redis.getClient().del(`ai:config:${tenantId}`);
    }

    /**
     * Get all provider health statuses for a tenant
     */
    async getProviderHealth(tenantId: string): Promise<ProviderHealthStatus[]> {
        const config = await this.getTenantConfig(tenantId);
        const allIds = [config.primaryProvider, ...config.fallbackChain];
        const results: ProviderHealthStatus[] = [];
        for (const id of [...new Set(allIds)]) {
            const status = await this.registry.getHealthStatus(id);
            if (status) results.push(status);
        }
        return results;
    }

    /**
     * Execute a provider call with circuit breaker protection
     */
    async executeWithBreaker<T>(
        providerId: string,
        operation: () => Promise<T>,
    ): Promise<T> {
        const breaker = this.getBreaker(providerId);
        return breaker.fire(operation) as Promise<T>;
    }

    // ─── Private Helpers ────────────────────────────────────────────────────

    private async evaluateProvider(
        providerId: string,
        taskType: string,
        config: TenantAiConfig,
    ): Promise<RoutingDecision | null> {
        // Check health
        const healthy = await this.registry.isHealthy(providerId);
        if (!healthy) {
            this.logger.debug(`Provider ${providerId} unhealthy, skipping`);
            return null;
        }

        // Check circuit breaker
        const breaker = this.getBreaker(providerId);
        if (breaker.opened) {
            this.logger.debug(`Provider ${providerId} circuit breaker open, skipping`);
            return null;
        }

        // Check task support
        const providerConfig = this.registry.getConfig(providerId);
        if (taskType === 'embed' && !providerConfig?.models?.embed) {
            this.logger.debug(`Provider ${providerId} does not support embeddings, skipping`);
            return null;
        }

        return {
            providerId,
            reason: providerId === config.primaryProvider ? 'primary' : 'fallback',
        };
    }

    private async isBudgetExceeded(tenantId: string, config: TenantAiConfig): Promise<boolean> {
        const today = new Date().toISOString().split('T')[0];
        const costKey = `ai:budget:${tenantId}:${today}`;
        const spent = parseFloat((await this.redis.get(costKey)) || '0');
        return spent >= config.budget.dailyCap;
    }

    private async loadTenantConfigFromDb(tenantId: string): Promise<TenantAiConfig> {
        // Try to load from settings / tenant config
        // Fallback to sensible defaults
        const savedConfig = await this.settings.getValue(`ai:tenant_config:${tenantId}`);
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                parsed.updatedAt = new Date(parsed.updatedAt);
                return parsed;
            } catch {
                this.logger.warn(`Failed to parse tenant config for ${tenantId}, using defaults`);
            }
        }

        // Default configuration
        return this.getDefaultConfig(tenantId);
    }

    private getDefaultConfig(tenantId: string): TenantAiConfig {
        return {
            tenantId,
            primaryProvider: 'openai',
            fallbackChain: ['groq', 'ollama'],
            providers: [
                {
                    providerId: 'openai',
                    displayName: 'OpenAI',
                    type: 'cloud',
                    enabled: true,
                    priority: 1,
                    models: { chat: 'gpt-4o', embed: 'text-embedding-3-small' },
                },
                {
                    providerId: 'groq',
                    displayName: 'Groq',
                    type: 'cloud',
                    enabled: true,
                    priority: 2,
                    models: { chat: 'llama-3.3-70b-versatile' },
                },
                {
                    providerId: 'ollama',
                    displayName: 'Ollama (Self-hosted)',
                    type: 'self-hosted',
                    enabled: true,
                    priority: 3,
                    models: { chat: 'llama3.2', embed: 'nomic-embed-text' },
                },
            ],
            embedding: {
                strategy: 'canonical',
                provider: 'openai',
                targetDimensions: 1536,
            },
            budget: {
                dailyCap: 50.0,
                maxTokensPerRequest: 4096,
                warningThreshold: 0.8,
            },
            features: {
                streaming: true,
                vision: false,
                functionCalling: false,
            },
            updatedAt: new Date(),
            updatedBy: 'system',
        };
    }

    private getBreaker(providerId: string): CircuitBreaker {
        if (!this.breakers.has(providerId)) {
            const breaker = new CircuitBreaker(async (fn: () => Promise<any>) => await fn(), {
                timeout: 120_000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                volumeThreshold: 5,
            });
            breaker.on('open', () =>
                this.logger.error(`🚨 Circuit Breaker OPENED for ${providerId}`)
            );
            breaker.on('halfOpen', () =>
                this.logger.warn(`⚠️ Circuit Breaker HALF-OPEN for ${providerId}`)
            );
            breaker.on('close', () =>
                this.logger.log(`✅ Circuit Breaker CLOSED for ${providerId}`)
            );
            this.breakers.set(providerId, breaker);
        }
        return this.breakers.get(providerId)!;
    }
}
