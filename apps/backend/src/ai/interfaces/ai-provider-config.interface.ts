/**
 * AI Provider Configuration Interfaces
 *
 * Defines the configuration schema for user/project-level AI provider routing.
 * Each tenant/user can have their own provider preference, fallback chain,
 * embedding normalization settings, and budget controls.
 */

export interface AiProviderConfig {
    /** Unique provider identifier (e.g., 'openai', 'anthropic', 'ollama') */
    providerId: string;

    /** Human-readable name */
    displayName: string;

    /** Provider type categorization */
    type: 'cloud' | 'self-hosted' | 'hybrid';

    /** Whether this provider is enabled for the tenant */
    enabled: boolean;

    /** Priority in fallback chain (lower = higher priority) */
    priority: number;

    /** Model configuration */
    models: {
        chat?: string;
        embed?: string;
        vision?: string;
    };

    /** Rate limiting per provider */
    rateLimit?: {
        requestsPerMinute: number;
        tokensPerMinute: number;
    };

    /** Provider-specific settings (API version, region, etc.) */
    settings?: Record<string, any>;
}

export interface TenantAiConfig {
    /** Tenant / Project / User identifier */
    tenantId: string;

    /** Primary provider for chat/generation tasks */
    primaryProvider: string;

    /** Ordered fallback chain (provider IDs) */
    fallbackChain: string[];

    /** Provider-specific configs */
    providers: AiProviderConfig[];

    /** Embedding normalization settings */
    embedding: {
        /** Normalization strategy */
        strategy: 'none' | 'l2' | 'canonical';
        /** Target dimensionality (if different from provider output) */
        targetDimensions?: number;
        /** Provider to use for embeddings */
        provider: string;
    };

    /** Budget controls */
    budget: {
        /** Daily USD cap */
        dailyCap: number;
        /** Per-request max tokens */
        maxTokensPerRequest: number;
        /** Warning threshold (% of daily cap) */
        warningThreshold: number;
    };

    /** Feature flags */
    features: {
        streaming: boolean;
        vision: boolean;
        functionCalling: boolean;
    };

    /** Metadata */
    updatedAt: Date;
    updatedBy: string;
}

export interface ProviderHealthStatus {
    providerId: string;
    healthy: boolean;
    lastCheckedAt: Date;
    latencyMs: number;
    errorRate: number;
    consecutiveFailures: number;
    message?: string;
}

export interface RoutingDecision {
    providerId: string;
    reason: 'primary' | 'fallback' | 'health-check' | 'quota' | 'forced';
    estimatedLatencyMs?: number;
    estimatedCostUsd?: number;
}
