import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SettingsService } from '../settings/settings.service';
import { OllamaService } from './ollama.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
import { GeminiService } from './gemini.service';
import { LlmApiService } from './llm-api.service';
import { AiPart, AiProvider, ChatResult, EmbeddingResult } from './interfaces/ai-provider.interface';
import { AiCircuitBreakerService } from './ai-circuit-breaker.service';
import { AiProviderRouter } from './ai-provider-router.service';
import CircuitBreaker from 'opossum';

@Injectable()
export class AiService implements AiProvider {
    private readonly logger = new Logger(AiService.name);

    constructor(
        private readonly settings: SettingsService,
        private readonly ollama: OllamaService,
        private readonly openai: OpenAiService,
        private readonly custom: GenericOpenAiService,
        private readonly llmapi: LlmApiService,
        private readonly gemini: GeminiService,
        private readonly eventEmitter: EventEmitter2,
        private readonly circuitBreaker: AiCircuitBreakerService,
        private readonly providerRouter: AiProviderRouter,
    ) { }

    private getBreaker(providerName: string): CircuitBreaker {
        return this.circuitBreaker.getBreaker(providerName);
    }

    private async isManualOverride(): Promise<boolean> {
        return this.providerRouter.isManualOverride();
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
            } catch (err: unknown) {
                lastError = err;
                const errMsg = err instanceof Error ? err.message : String(err);
                const is429 = errMsg.includes('429') || errMsg.toLowerCase().includes('rate limit') || errMsg.toLowerCase().includes('too many requests');

                if (is429 && pName === primaryName) {
                    this.logger.warn(`🔄 Rate limited (429) on primary provider ${primaryName}. Retrying after delay...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    try {
                        const retryProvider = await this.getProvider(pName);
                        const retryResult = await operation(retryProvider);
                        if (retryResult !== null && retryResult !== undefined) {
                            this.logger.log(`✅ Retry succeeded after 429`);
                            return retryResult as T;
                        }
                    } catch (retryErr) {
                        this.logger.warn(`⚠️ Retry failed after 429: ${retryErr}`);
                    }
                }

                this.logger.warn(`⚠️ API Error on Provider [${pName}]: ${err}`);

                if (pName === primaryName && fallbackName && fallbackName !== primaryName) {
                    this.logger.error(`🚨 SYSTEM ALERT: Primary AI Model (${primaryName}) failed. Auto-Fallback to (${fallbackName}) triggered. Error: ${err}`);
                    this.eventEmitter.emit('system.ai_fallback', {
                        primaryProvider: primaryName,
                        fallbackProvider: fallbackName,
                        task,
                        error: errMsg
                    });
                }
            }
        }

        this.logger.error(`🚨 SYSTEM ALERT: All AI providers failed for task (${task}).`);
        if (lastError instanceof InternalServerErrorException) throw lastError;
        throw new InternalServerErrorException((lastError instanceof Error ? lastError.message : undefined) || 'All AI providers failed');
    }

    private async getActiveChatProvider(): Promise<AiProvider> {
        return this.providerRouter.getActiveChatProvider();
    }

    /**
     * Public wrapper for provider lookup - delegates to router
     */
    async getProviderByName(providerName: string | null): Promise<AiProvider | null> {
        return this.providerRouter.getProviderByName(providerName);
    }

    private async getActiveEmbedProvider(): Promise<AiProvider> {
        return this.providerRouter.getActiveEmbedProvider();
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
        return this.circuitBreaker.getTotalFailureCount();
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
        if (providerName === 'llmapi') {
            return (await this.settings.getValue(`ai.${providerName}.chat_model`)) || 'gemini-1.5-flash';
        }
        return (await this.settings.getValue(`ai.${providerName}.chat_model`)) || 'unknown';
    }

    private async getProvider(name: string): Promise<AiProvider> {
        return (await this.providerRouter.getProviderByName(name)) || this.providerRouter.getActiveChatProvider();
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
            // First attempt: full parts including images
            const result = await provider.reformat(systemPrompt, userQuery, sourceContext, attachments);
            if (result?.response) return result;

            // If null and there were image parts, retry with text-only parts (graceful degradation)
            const imageParts = attachments?.filter(p => p.inlineData || p.fileData) ?? [];
            if (imageParts.length > 0) {
                const textOnlyAttachments = attachments?.filter(p => !p.inlineData && !p.fileData);
                this.logger.log(JSON.stringify({
                    provider: provider.getName(),
                    droppedImageCount: imageParts.length,
                    retryWithTextOnly: true,
                }));
                const retryResult = await provider.reformat(systemPrompt, userQuery, sourceContext, textOnlyAttachments);
                if (retryResult?.response) return retryResult;
            }

            return null;
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

    async analyzeAndCleanDocument(content: string, fileName: string): Promise<{ cleanedContent: string; category: string }> {
        const result = await this.executeWithFallback<{ cleanedContent: string; category: string }>('chat', 'analyze_knowledge', async (provider) => {
            const prompt = `You are an expert technical writer and AI data engineer for Allplan (BIM software).
I am providing you with a raw technical document: "${fileName}".

Your task is:
1. **Clean & Structure:** Extract core technical knowledge, errors, solutions, and symptoms. Format in clean Markdown. Remove noise (headers, footers).
2. **Categorize:** Choose the most appropriate category from this list:
   - Installation & Setup
   - Licensing & Wibu
   - Graphics & Hardware
   - Export & Import (IFC, DWG, etc.)
   - Modeling & Architecture
   - Project & Data Management
   - Engineering & Reinforcement
   - General Technical
3. **Output Format:** You MUST return a valid JSON object with exactly two keys: "cleanedContent" and "category". Do not include any other text.

RAW DOCUMENT CONTENT:
${content}
`;
            const result = await provider.generate(prompt, 60000);
            if (!result) return { cleanedContent: content, category: 'General Technical' };

            try {
                // Try to parse JSON from the response
                const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
                const parsed = JSON.parse(jsonStr);
                return {
                    cleanedContent: parsed.cleanedContent || content,
                    category: parsed.category || 'General Technical'
                };
            } catch (e) {
                this.logger.warn(`Failed to parse AI categorization JSON: ${e.message}. Using raw output.`);
                return { cleanedContent: result, category: 'General Technical' };
            }
        });
        return result || { cleanedContent: content, category: 'General Technical' };
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
                case 'gemini':
                    return await this.gemini.testConnection();
                default:
                    return { success: false, message: 'Bilinmeyen AI sağlayıcısı.' };
            }
        } catch (e: unknown) {
            this.logger.error(`Error testing provider ${providerName}:`, e);
            return { success: false, message: `Beklenmeyen bir hata oluştu: ${(e as Error).message}` };
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
            case 'gemini':
                return ['ai.gemini.api_key', 'ai.gemini.chat_model', 'ai.gemini.embed_model'];
            case 'vertex':
                return ['ai.vertex.project_id', 'ai.vertex.location', 'ai.vertex.chat_model', 'ai.vertex.embed_model'];
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

        const providers = ['ollama', 'openai', 'llmapi', 'xai', 'deepseek', 'groq', 'custom', 'gemini', 'vertex'];
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
