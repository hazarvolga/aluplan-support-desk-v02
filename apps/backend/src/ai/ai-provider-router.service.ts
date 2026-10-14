import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
import { LlmApiService } from './llm-api.service';
import { GeminiService } from './gemini.service';
import { AiProvider } from './interfaces/ai-provider.interface';

/**
 * Provider Router - Handles provider resolution logic
 * 
 * Extracted from AiService to reduce god node complexity.
 * Handles: provider lookup, fallback chains, settings-based resolution.
 */
@Injectable()
export class AiProviderRouter {
    private readonly logger = new Logger(AiProviderRouter.name);

    constructor(
        private readonly settings: SettingsService,
        private readonly openai: OpenAiService,
        private readonly custom: GenericOpenAiService,
        private readonly llmapi: LlmApiService,
        private readonly gemini: GeminiService,
    ) {}

    /**
     * Get provider by name
     */
    async getProviderByName(providerName: string | null): Promise<AiProvider | null> {
        if (!providerName) return null;

        const name = providerName.toLowerCase();
        
        if (name === 'openai') return this.openai;
        
        if (['custom', 'xai', 'deepseek', 'groq', 'grok'].includes(name)) {
            const providerKey = (name === 'grok') ? 'xai' : name;
            return this.custom.forProvider(providerKey as 'custom' | 'xai' | 'deepseek' | 'groq');
        }
        
        if (name === 'llmapi') return this.llmapi;
        
        if (name === 'gemini') return this.gemini;
        
        this.logger.warn(`Unknown provider: ${providerName}`);
        return null;
    }

    /**
     * Get active chat provider from settings/env
     */
    async getActiveChatProvider(): Promise<AiProvider> {
        const chatProvider = await this.settings.getValue('ai.chat_provider');
        const legacyProvider = await this.settings.getValue('ai.active_provider');

        const configured = chatProvider || legacyProvider;
        if (configured) {
            const provider = await this.getProviderByName(configured);
            if (provider) return provider;
            throw this.unavailable(configured);
        }

        // Auto-upgrade logic for production
        if (process.env.OPENAI_API_KEY) return this.openai;
        if (process.env.GEMINI_API_KEY) return this.llmapi;

        throw this.unavailable();
    }

    /**
     * Get active embedding provider from settings/env
     */
    async getActiveEmbedProvider(): Promise<AiProvider> {
        const embedProvider = await this.settings.getValue('ai.embed_provider');
        const legacyProvider = await this.settings.getValue('ai.active_provider');

        // Env check (Priority)
        const envProvider = process.env.EMBEDDING_PROVIDER?.toLowerCase();
        if (envProvider === 'openai') return this.openai;
        if (envProvider === 'llmapi') return this.llmapi;
        if (envProvider === 'gemini') return this.gemini;

        if (envProvider) throw this.unavailable(envProvider);

        const configured = embedProvider || legacyProvider;
        if (configured) {
            const provider = await this.getProviderByName(configured);
            if (provider) return provider;
            throw this.unavailable(configured);
        }

// Auto-upgrade logic for production
        if (process.env.OPENAI_API_KEY) return this.openai;
        if (process.env.GEMINI_API_KEY) return this.llmapi;

        throw this.unavailable();
    }

    /**
     * Check if circuit breaker is manually overridden (disabled)
     */
    async isManualOverride(): Promise<boolean> {
        const manualOff = await this.settings.getValue('ai.circuit_breaker.manual_off');
        return manualOff?.toString() === 'true';
    }

    /**
     * Get provider by task type
     */
    async getProviderForTask(task: string): Promise<string> {
        // Task-specific provider selection can be added here
        // For now, return chat provider
        const provider = await this.getActiveChatProvider();
        return provider.getName();
    }

    /**
     * Get fallback provider names
     */
    async getFallbackProviders(type: 'chat' | 'embed'): Promise<string[]> {
        const fallbackSetting = type === 'chat' 
            ? 'ai.fallback_provider' 
            : 'ai.embed_fallback_provider';
        
        const fallbackName = await this.settings.getValue(fallbackSetting);
        return fallbackName ? [fallbackName] : [];
    }

    /**
     * Build provider chain (primary + fallbacks)
     */
    async buildProviderChain(type: 'chat' | 'embed'): Promise<string[]> {
        const chain: string[] = [];

        if (type === 'chat') {
            const chatProvider = await this.settings.getValue('ai.chat_provider');
            const legacyProvider = await this.settings.getValue('ai.active_provider');
            const primary = chatProvider || legacyProvider ||
                (process.env.OPENAI_API_KEY ? 'openai' : 
                 process.env.GEMINI_API_KEY ? 'llmapi' : null);
            if (primary) {
                if (!await this.getProviderByName(primary)) throw this.unavailable(primary);
                chain.push(primary);
            }
        } else {
            const embedProvider = await this.settings.getValue('ai.embed_provider');
            const envProvider = process.env.EMBEDDING_PROVIDER?.toLowerCase();
            const primary = embedProvider || envProvider ||
                (process.env.OPENAI_API_KEY ? 'openai' : 
                 process.env.GEMINI_API_KEY ? 'llmapi' : null);
            if (primary) {
                if (!await this.getProviderByName(primary)) throw this.unavailable(primary);
                chain.push(primary);
            }
        }

        const fallbacks = await this.getFallbackProviders(type);
        for (const fallback of fallbacks) {
            const normalizedFallback = fallback.toLowerCase();
            if (!await this.getProviderByName(normalizedFallback)) {
                throw this.unavailable(normalizedFallback);
            }
            if (!chain.includes(normalizedFallback)) {
                chain.push(normalizedFallback);
            }
        }

        return chain;
    }

    private unavailable(provider?: string): ServiceUnavailableException {
        return new ServiceUnavailableException(provider
            ? `AI provider "${provider}" is unavailable or unsupported.`
            : 'No supported AI provider is configured.');
    }

    /**
     * Get tenant budget config - delegates to settings
     * (Used by AiBudgetMonitor)
     */
    async getTenantConfig(tenantId: string): Promise<{ budget: { dailyCap: number; warningThreshold: number } }> {
        const dailyCapStr = await this.settings.getValue('ai.budget.daily_cap');
        const warningThresholdStr = await this.settings.getValue('ai.budget.warning_threshold');
        return {
            budget: {
                dailyCap: parseFloat(dailyCapStr || '50'),
                warningThreshold: parseFloat(warningThresholdStr || '0.8'),
            },
        };
    }
}
