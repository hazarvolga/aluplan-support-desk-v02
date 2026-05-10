import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { OllamaService } from './ollama.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
import { LlmApiService } from './llm-api.service';
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
        private readonly ollama: OllamaService,
        private readonly openai: OpenAiService,
        private readonly custom: GenericOpenAiService,
        private readonly llmapi: LlmApiService,
    ) {}

    /**
     * Get provider by name
     */
    async getProviderByName(providerName: string | null): Promise<AiProvider | null> {
        if (!providerName) return null;

        const name = providerName.toLowerCase();
        
        if (name === 'openai') return this.openai;
        
        if (name === 'vertex') {
            this.logger.warn('⚠️ Provider "vertex" is deprecated. Falling back to "openai".');
            return this.openai;
        }
        
        if (['custom', 'xai', 'deepseek', 'groq'].includes(name)) {
            this.custom.setProvider(name as 'custom' | 'xai' | 'deepseek' | 'groq');
            return this.custom;
        }
        
        if (name === 'llmapi') return this.llmapi;
        
        if (name === 'ollama') return this.ollama;
        
        this.logger.warn(`Unknown provider: ${providerName}`);
        return null;
    }

    /**
     * Get active chat provider from settings/env
     */
    async getActiveChatProvider(): Promise<AiProvider> {
        const chatProvider = await this.settings.getValue('ai.chat_provider');
        const legacyProvider = await this.settings.getValue('ai.active_provider');

        const provider = await this.getProviderByName(chatProvider || legacyProvider);
        if (provider) return provider;

        // Auto-upgrade logic for production
        if (process.env.OPENAI_API_KEY) return this.openai;
        if (process.env.GEMINI_API_KEY) return this.llmapi;

        return this.ollama;
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
        if (envProvider === 'ollama') return this.ollama;

        const provider = await this.getProviderByName(embedProvider || legacyProvider);
        if (provider) return provider;

// Auto-upgrade logic for production
        if (process.env.OPENAI_API_KEY) return this.openai;
        if (process.env.GEMINI_API_KEY) return this.llmapi;

        return this.ollama;
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
                 process.env.GEMINI_API_KEY ? 'llmapi' : 'ollama');
            chain.push(primary);
        } else {
            const embedProvider = await this.settings.getValue('ai.embed_provider');
            const envProvider = process.env.EMBEDDING_PROVIDER?.toLowerCase();
            const primary = embedProvider || envProvider || 
                (process.env.OPENAI_API_KEY ? 'openai' : 
                 process.env.GEMINI_API_KEY ? 'llmapi' : 'ollama');
            chain.push(primary);
        }

        const fallbacks = await this.getFallbackProviders(type);
        for (const fallback of fallbacks) {
            if (!chain.includes(fallback)) {
                chain.push(fallback);
            }
        }

        return chain;
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