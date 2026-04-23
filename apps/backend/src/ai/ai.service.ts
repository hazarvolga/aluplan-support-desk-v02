import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SettingsService } from '../settings/settings.service';
import { OllamaService } from './ollama.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
import { LlmApiService } from './llm-api.service';
import { VertexAiService } from './vertex-ai.service';
import { AiPart, AiProvider, ChatResult, EmbeddingResult } from './interfaces/ai-provider.interface';
import CircuitBreaker from 'opossum';

@Injectable()
export class AiService implements AiProvider {
    private readonly logger = new Logger(AiService.name);
    private breakers = new Map<string, CircuitBreaker>();

    constructor(
        private readonly settings: SettingsService,
        private readonly ollama: OllamaService,
        private readonly openai: OpenAiService,
        private readonly custom: GenericOpenAiService,
        private readonly llmapi: LlmApiService,
        private readonly vertex: VertexAiService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    private async isManualOverride(): Promise<boolean> {
        const manualOff = await this.settings.getValue('ai.circuit_breaker.manual_off');
        return manualOff?.toString() === 'true';
    }

    private getBreaker(providerName: string): CircuitBreaker {
        if (!this.breakers.has(providerName)) {
            const breaker = new CircuitBreaker(async (fn: () => Promise<any>) => await fn(), {
                timeout: 120_000, // 2 minutes max per operation
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                volumeThreshold: 5,
            });
            breaker.on('open', () => this.logger.error(`🚨 Circuit Breaker OPENED for ${providerName}`));
            breaker.on('halfOpen', () => this.logger.warn(`⚠️ Circuit Breaker HALF-OPEN for ${providerName}`));
            breaker.on('close', () => this.logger.log(`✅ Circuit Breaker CLOSED for ${providerName}`));
            this.breakers.set(providerName, breaker);
        }
        return this.breakers.get(providerName)!;
    }

    private async executeWithFallback<T>(
        type: 'chat' | 'embed',
        task: string,
        operation: (provider: AiProvider) => Promise<T | null>
    ): Promise<T | null> {
        const isOverride = await this.isManualOverride();

        let primaryName = '';
        if (type === 'chat') {
            primaryName = await this.getProviderForTask(task);
        } else {
            primaryName = await this.settings.getValue('ai.embed_provider')
                || await this.settings.getValue('ai.active_provider')
                || process.env.EMBEDDING_PROVIDER?.toLowerCase()
                || 'ollama';
        }

        const fallbackName = await this.settings.getValue(type === 'chat' ? 'ai.fallback_provider' : 'ai.embed_fallback_provider');

        const providersToTry = [primaryName];
        if (fallbackName && fallbackName !== primaryName) {
            providersToTry.push(fallbackName);
        }

        let lastError = null;

        for (const pName of providersToTry) {
            try {
                const provider = await this.getProvider(pName);
                const breaker = this.getBreaker(pName);

                let result: T | null | undefined = undefined;
                if (isOverride) {
                    result = await operation(provider);
                } else {
                    result = (await breaker.fire(() => operation(provider))) as T | null | undefined;
                }

                if (result !== null && result !== undefined) {
                    return result as T;
                } else {
                    lastError = new Error('Provider returned null');
                }
            } catch (err: any) {
                lastError = err;
                this.logger.warn(`⚠️ API Error on Provider [${pName}]: ${err}`);

                if (pName === primaryName && fallbackName && fallbackName !== primaryName) {
                    this.logger.error(`🚨 SYSTEM ALERT: Primary AI Model (${primaryName}) failed. Auto-Fallback to (${fallbackName}) triggered. Error: ${err}`);
                    this.eventEmitter.emit('system.ai_fallback', {
                        primaryProvider: primaryName,
                        fallbackProvider: fallbackName,
                        task,
                        error: err instanceof Error ? err.message : String(err)
                    });
                }
            }
        }

        this.logger.error(`🚨 SYSTEM ALERT: All AI providers failed for task (${task}).`);
        if (lastError instanceof InternalServerErrorException) throw lastError;
        throw new InternalServerErrorException(lastError?.message || 'All AI providers failed');
    }

    public async getProviderByName(providerName: string | null): Promise<AiProvider | null> {
        if (providerName === 'openai') return this.openai;
        if (providerName === 'vertex') return this.vertex;
        if (providerName === 'custom' || providerName === 'xai' || providerName === 'deepseek' || providerName === 'groq') {
            this.custom.setProvider(providerName as any);
            return this.custom;
        }
        if (providerName === 'llmapi') return this.llmapi;
        if (providerName === 'ollama') return this.ollama;
        return null;
    }

    private async getActiveChatProvider(): Promise<AiProvider> {
        const chatProvider = await this.settings.getValue('ai.chat_provider');
        const legacyProvider = await this.settings.getValue('ai.active_provider');

        const provider = await this.getProviderByName(chatProvider || legacyProvider);
        if (provider) return provider;

        // Auto-upgrade logic for production
        if (process.env.OPENAI_API_KEY) return this.openai;
        if (process.env.GEMINI_API_KEY) return this.llmapi;

        return this.ollama;
    }

    private async getActiveEmbedProvider(): Promise<AiProvider> {
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


    async getActiveProviderName(): Promise<string> {
        // Return chat provider for backwards compatibility in some places
        const chatProvider = await this.settings.getValue('ai.chat_provider');
        const legacyProvider = await this.settings.getValue('ai.active_provider');

        if (chatProvider) return chatProvider;
        if (legacyProvider) return legacyProvider;

        if (process.env.OPENAI_API_KEY) return 'openai';
        if (process.env.GEMINI_API_KEY) return 'llmapi';

        return 'ollama';
    }

    getName(): string {
        return 'dispatcher';
    }

    // Backwards-compat circuit breaker helpers (opossum tracks state internally)
    private recordSuccess(): void { /* no-op: opossum handles this via breaker.fire() */ }
    private recordFailure(): void { /* no-op: opossum handles this via breaker.fire() */ }

    private async isCircuitClosed(): Promise<boolean> {
        return !await this.isManualOverride();
    }

    private get circuitOpenUntil(): number {
        return 0;
    }

    private get failureCount(): number {
        let total = 0;
        for (const breaker of this.breakers.values()) {
            total += breaker.stats.failures;
        }
        return total;
    }

    async embed(text: string): Promise<EmbeddingResult | null> {
        return this.executeWithFallback('embed', 'embedding', async (provider) => {
            return provider.embed(text);
        });
    }

    async generate(prompt: string | AiPart[], timeout?: number, attachments?: AiPart[]): Promise<string | null> {
        return this.executeWithFallback('chat', 'general', async (provider) => {
            // If attachments are provided and prompt is a string, combine them
            if (attachments && attachments.length > 0 && typeof prompt === 'string') {
                const parts: AiPart[] = [{ text: prompt }, ...attachments];
                return provider.generate(parts, timeout);
            }
            return provider.generate(prompt, timeout);
        });
    }

    async *streamGenerate(prompt: string | AiPart[], timeout?: number, attachments?: AiPart[]): AsyncGenerator<string, void, unknown> {
        if (await this.isManualOverride()) {
            // override flow is fine but stream doesn't easily compose with opossum's proxy
            // Since Opossum is Promise-based and we are streaming, we'll manually check the breaker state.
        } else {
            const primaryName = await this.getProviderForTask('chat');
            const breaker = this.getBreaker(primaryName);
            if (breaker.opened) {
                yield 'AI servisi şu anda aşırı yük altında veya hizmet dışı (Circuit Breaker devrede). Lütfen daha sonra tekrar deneyin.';
                return;
            }
        }

        const task = 'general';
        const primaryName = await this.getProviderForTask(task);
        const fallbackName = await this.settings.getValue('ai.fallback_provider');

        const providersToTry = [primaryName];
        if (fallbackName && fallbackName !== primaryName) providersToTry.push(fallbackName);

        for (const pName of providersToTry) {
            try {
                const provider = await this.getProvider(pName);
                let yieldedAnything = false;

                // Combine prompt with attachments for streaming if needed
                let combinedPrompt = prompt;
                if (attachments && attachments.length > 0 && typeof prompt === 'string') {
                    combinedPrompt = [{ text: prompt }, ...attachments];
                }

                if (provider.streamGenerate) {
                    const generator = provider.streamGenerate(combinedPrompt, timeout);
                    for await (const chunk of generator) {
                        yieldedAnything = true;
                        yield chunk;
                    }
                } else {
                    const result = await provider.generate(combinedPrompt, timeout);
                    if (result) {
                        yield result;
                        yieldedAnything = true;
                    }
                }

                if (yieldedAnything) {
                    this.recordSuccess();
                    return;
                }
            } catch (err) {
                this.recordFailure();
                this.logger.warn(`⚠️ API Error on Provider [${pName}] during streamGenerate: ${err}`);

                if (pName === primaryName && fallbackName && fallbackName !== primaryName) {
                    this.logger.error(`🚨 SYSTEM ALERT: Primary AI Model (${primaryName}) failed during streamGenerate. Auto-Fallback to (${fallbackName}) triggered.`);
                }
            }
        }
    }

    async getActiveModelName(): Promise<string> {
        const providerName = await this.settings.getValue('ai.chat_provider');
        if (providerName === 'ollama') return (await this.settings.getValue('ai.ollama.chat_model')) || 'llama3';
        if (providerName === 'openai') return (await this.settings.getValue('ai.openai.chat_model')) || 'gpt-4o-mini';
        if (providerName === 'llmapi' || providerName === 'vertex') {
            return (await this.settings.getValue(`ai.${providerName}.chat_model`)) || 'gemini-1.5-flash';
        }
        return (await this.settings.getValue(`ai.${providerName}.chat_model`)) || 'unknown';
    }

    private async getProvider(name: string): Promise<AiProvider> {
        return (await this.getProviderByName(name)) || this.getActiveChatProvider();
    }

    /**
     * Returns the appropriate provider for a specific task based on specialized settings.
     * Falls back to the global chat_provider.
     */
    private async getProviderForTask(task: string): Promise<string> {
        const specialized = await this.settings.getValue(`ai.specialized.${task}_provider`);
        if (specialized && specialized !== 'global') {
            return specialized;
        }
        return (await this.settings.getValue('ai.chat_provider')) || 'ollama';
    }

    async reformat(systemPrompt: string, userQuery: string, sourceContext: string, attachments?: AiPart[], task: string = 'reformatting'): Promise<{ response: string; model: string } | null> {
        return this.executeWithFallback('chat', task, async (provider) => {
            const result = await provider.reformat(systemPrompt, userQuery, sourceContext, attachments);
            return result?.response ? result : null;
        });
    }

    async *streamReformat(systemPrompt: string, userQuery: string, sourceContext: string, attachments?: AiPart[], task: string = 'reformatting'): AsyncGenerator<string, void, unknown> {
        if (!await this.isCircuitClosed()) {
            yield 'AI servisi şu anda devre dışı (Circuit Breaker).';
            return;
        }

        const primaryName = await this.getProviderForTask(task);
        const fallbackName = await this.settings.getValue('ai.fallback_provider');

        const providersToTry = [primaryName];
        if (fallbackName && fallbackName !== primaryName) providersToTry.push(fallbackName);

        for (const pName of providersToTry) {
            try {
                const provider = await this.getProvider(pName);
                let yieldedAnything = false;

                if (provider.streamReformat) {
                    const generator = provider.streamReformat(systemPrompt, userQuery, sourceContext, attachments);
                    for await (const chunk of generator) {
                        yieldedAnything = true;
                        yield chunk;
                    }
                } else {
                    const result = await provider.reformat(systemPrompt, userQuery, sourceContext, attachments);
                    if (result?.response) {
                        yield result.response;
                        yieldedAnything = true;
                    } else {
                        throw new Error('Provider returned null');
                    }
                }

                this.recordSuccess();
                return;

            } catch (err) {
                this.recordFailure();
                this.logger.warn(`⚠️ API Error on Provider [${pName}] during stream: ${err}`);

                if (pName === primaryName && fallbackName && fallbackName !== primaryName) {
                    this.logger.error(`🚨 SYSTEM ALERT: Primary AI Model (${primaryName}) failed during stream. Auto-Fallback to (${fallbackName}) triggered. Error: ${err}`);
                    this.eventEmitter.emit('system.ai_fallback', {
                        primaryProvider: primaryName,
                        fallbackProvider: fallbackName,
                        task,
                        isStreaming: true,
                        error: err instanceof Error ? err.message : String(err)
                    });
                } else {
                    yield 'AI yanıtı oluşturulurken bir hata oluştu.';
                }
            }
        }
    }

    async suggestCategory(title: string, content: string, categories: string[]): Promise<string | null> {
        return this.executeWithFallback('chat', 'categorization', async (provider) => {
            return provider.suggestCategory(title, content, categories);
        });
    }

    async summarizeTicket(subject: string, conversation: string): Promise<string | null> {
        return this.executeWithFallback('chat', 'summarization', async (provider) => {
            return provider.summarizeTicket(subject, conversation);
        });
    }

    async cleanKnowledgeDocument(content: string): Promise<string | null> {
        return this.executeWithFallback('chat', 'clean_knowledge', async (provider) => {
            const prompt = `You are an expert technical writer and AI data engineer. 
I am providing you with a raw, unstructured technical document (could be a PDF extract, a raw log file, or messy notes).
Your task is to extract the core technical knowledge, errors, solutions, and symptoms, and format them into a clean, structured Markdown format 
that is highly optimized for a RAG (Retrieval-Augmented Generation) system.

Rules:
1. Remove all noise (page numbers, headers, footers, irrelevant intro/outro).
2. Group information logically using Markdown headers (##).
3. If it contains QA pairs or Errors/Solutions, format them clearly (e.g., **Symptom:** ..., **Solution:** ...).
4. Do NOT make up information. Only use the provided text.
5. Provide ONLY the final markdown text without any conversational wrapper.

RAW DOCUMENT:
${content}
`;
            return provider.generate(prompt, 60000);
        });
    }

    async analyzeSentiment(text: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> {
        const result = await this.executeWithFallback('chat', 'analyze_sentiment', async (provider) => {
            return provider.analyzeSentiment(text);
        });
        return result || 'NEUTRAL';
    }

    async translate(text: string, targetLanguage: string): Promise<string | null> {
        return this.executeWithFallback('chat', 'translate', async (provider) => {
            return provider.translate(text, targetLanguage);
        });
    }

    async isAvailable(): Promise<boolean> {
        if (!await this.isCircuitClosed()) return false;
        const provider = await this.getActiveChatProvider();
        return provider.isAvailable();
    }

    async testProvider(providerName: string): Promise<{ success: boolean; message: string }> {
        try {
            switch (providerName) {
                case 'ollama': return await this.ollama.testConnection();
                case 'openai': return await this.openai.testConnection();
                case 'llmapi': return await this.llmapi.testConnection();
                case 'vertex': return await this.vertex.testConnection();
                case 'xai':
                    this.custom.setProvider('xai');
                    return await this.custom.testConnection();
                case 'deepseek':
                    this.custom.setProvider('deepseek');
                    return await this.custom.testConnection();
                case 'groq':
                    this.custom.setProvider('groq');
                    return await this.custom.testConnection();
                case 'custom':
                    this.custom.setProvider('custom');
                    return await this.custom.testConnection();
                default:
                    return { success: false, message: 'Bilinmeyen AI sağlayıcısı.' };
            }
        } catch (e: any) {
            this.logger.error(`Error testing provider ${providerName}:`, e);
            return { success: false, message: `Beklenmeyen bir hata oluştu: ${e.message}` };
        }
    }

    async testConnection(): Promise<{ success: boolean; message: string }> {
        const provider = await this.getActiveChatProvider();
        return provider.testConnection();
    }

    getProviderKeyMappings(provider: string): string[] {
        switch (provider) {
            case 'openai':
                return ['ai.openai.api_key', 'ai.openai.chat_model', 'ai.openai.embed_model'];
            case 'ollama':
                return ['ai.ollama.url', 'ai.ollama.chat_model', 'ai.ollama.embed_model'];
            case 'llmapi':
                return ['ai.llmapi.api_key', 'ai.llmapi.chat_model', 'ai.llmapi.embed_model'];
            case 'xai':
                return ['ai.xai.api_key', 'ai.xai.url', 'ai.xai.chat_model', 'ai.xai.embed_model'];
            case 'deepseek':
                return ['ai.deepseek.api_key', 'ai.deepseek.url', 'ai.deepseek.chat_model', 'ai.deepseek.embed_model'];
            case 'groq':
                return ['ai.groq.api_key', 'ai.groq.url', 'ai.groq.chat_model', 'ai.groq.embed_model'];
            case 'custom':
                return ['ai.custom.api_key', 'ai.custom.url', 'ai.custom.chat_model', 'ai.custom.embed_model'];
            default:
                return [];
        }
    }
    async getHealthStatus(): Promise<{
        status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
        chatProvider: string;
        embedProvider: string;
        circuitBreaker: {
            open: boolean;
            openUntil: number | null;
            failureCount: number;
        };
        providers: Record<string, { available: boolean; message: string }>;
    }> {
        const chatProvider = await this.getActiveProviderName();
        const embedProviderName = await this.settings.getValue('ai.embed_provider') || chatProvider;
        const isClosed = await this.isCircuitClosed();

        const providers = ['ollama', 'openai', 'llmapi', 'xai', 'deepseek', 'groq', 'custom'];
        const healthResults: Record<string, { available: boolean; message: string }> = {};

        for (const p of providers) {
            const test = await this.testProvider(p);
            healthResults[p] = {
                available: test.success,
                message: test.message,
            };
        }

        const activeProviderHealthy = healthResults[chatProvider]?.available;
        let status: 'HEALTHY' | 'DEGRADED' | 'DOWN' = 'HEALTHY';

        if (!isClosed) {
            status = 'DOWN';
        } else if (!activeProviderHealthy) {
            status = 'DEGRADED';
        }

        return {
            status,
            chatProvider,
            embedProvider: embedProviderName,
            circuitBreaker: {
                open: !isClosed,
                openUntil: this.circuitOpenUntil > 0 ? this.circuitOpenUntil : null,
                failureCount: this.failureCount,
            },
            providers: healthResults,
        };
    }
}
