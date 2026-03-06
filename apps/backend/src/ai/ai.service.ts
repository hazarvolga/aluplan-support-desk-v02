import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { OllamaService } from './ollama.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
import { LlmApiService } from './llm-api.service';
import { AiProvider, ChatResult, EmbeddingResult } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService implements AiProvider {
    private readonly logger = new Logger(AiService.name);
    private failureCount = 0;
    private circuitOpenUntil = 0;
    private readonly FAILURE_THRESHOLD = 5;
    private readonly COOLDOWN_MS = 60_000;

    constructor(
        private readonly settings: SettingsService,
        private readonly ollama: OllamaService,
        private readonly openai: OpenAiService,
        private readonly custom: GenericOpenAiService,
        private readonly llmapi: LlmApiService,
    ) { }

    private async isCircuitClosed(): Promise<boolean> {
        // Manual override check
        const manualOff = await this.settings.getValue('ai.circuit_breaker.manual_off');
        if (manualOff?.toString() === 'true') return false;

        if (Date.now() < this.circuitOpenUntil) {
            return false;
        }
        return true;
    }

    private recordFailure() {
        this.failureCount++;
        if (this.failureCount >= this.FAILURE_THRESHOLD) {
            this.circuitOpenUntil = Date.now() + this.COOLDOWN_MS;
            this.logger.error(`🚨 AI Circuit Breaker OPENED. Cooldown for ${this.COOLDOWN_MS / 1000}s due to ${this.failureCount} failures.`);
        }
    }

    private recordSuccess() {
        this.failureCount = 0;
        this.circuitOpenUntil = 0;
    }

    private async runSafe<T>(op: () => Promise<T>): Promise<T | null> {
        if (!await this.isCircuitClosed()) {
            this.logger.warn('⚠️ AI Operation skipped: Circuit Breaker is OPEN or manually disabled.');
            return null;
        }

        try {
            const result = await op();
            this.recordSuccess();
            return result;
        } catch (err) {
            this.recordFailure();
            throw err;
        }
    }

    private async getProviderByName(providerName: string | null): Promise<AiProvider | null> {
        if (providerName === 'openai') return this.openai;
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

        let provider = await this.getProviderByName(chatProvider || legacyProvider);
        if (provider) return provider;

        // Auto-upgrade logic for production
        if (process.env.OPENAI_API_KEY) return this.openai;
        if (process.env.GEMINI_API_KEY) return this.llmapi;

        return this.ollama;
    }

    private async getActiveEmbedProvider(): Promise<AiProvider> {
        const embedProvider = await this.settings.getValue('ai.embed_provider');
        const legacyProvider = await this.settings.getValue('ai.active_provider');

        let provider = await this.getProviderByName(embedProvider || legacyProvider);
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

    async embed(text: string): Promise<EmbeddingResult | null> {
        return this.runSafe(async () => {
            const provider = await this.getActiveEmbedProvider();
            return provider.embed(text);
        });
    }

    async generate(prompt: string, timeout?: number): Promise<string | null> {
        return this.runSafe(async () => {
            const provider = await this.getActiveChatProvider();
            return provider.generate(prompt, timeout);
        });
    }

    async reformat(systemPrompt: string, userQuery: string, kbContent: string): Promise<ChatResult | null> {
        return this.runSafe(async () => {
            const provider = await this.getActiveChatProvider();
            return provider.reformat(systemPrompt, userQuery, kbContent);
        });
    }

    async *streamReformat(systemPrompt: string, userQuery: string, kbContent: string): AsyncGenerator<string, void, unknown> {
        const closed = await this.isCircuitClosed();
        if (!closed) {
            yield 'AI servisi şu anda devre dışı (Circuit Breaker).';
            return;
        }

        const provider = await this.getActiveChatProvider();
        try {
            if (provider.streamReformat) {
                yield* provider.streamReformat(systemPrompt, userQuery, kbContent);
            } else {
                const result = await provider.reformat(systemPrompt, userQuery, kbContent);
                if (result?.response) yield result.response;
            }
            this.recordSuccess();
        } catch (err) {
            this.recordFailure();
            yield 'AI yanıtı oluşturulurken bir hata oluştu.';
        }
    }

    async suggestCategory(title: string, content: string, categories: string[]): Promise<string | null> {
        return this.runSafe(async () => {
            const provider = await this.getActiveChatProvider();
            return provider.suggestCategory(title, content, categories);
        });
    }

    async summarizeTicket(subject: string, conversation: string): Promise<string | null> {
        return this.runSafe(async () => {
            const provider = await this.getActiveChatProvider();
            return provider.summarizeTicket(subject, conversation);
        });
    }

    async cleanKnowledgeDocument(rawContent: string): Promise<string> {
        const result = await this.runSafe(async () => {
            const provider = await this.getActiveChatProvider();
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
${rawContent}
`;
            return provider.generate(prompt, 60000); // Allow up to 60s for large docs
        });
        return result || rawContent; // fallback to raw content if AI fails
    }

    async analyzeSentiment(text: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> {
        const res = await this.runSafe(async () => {
            const provider = await this.getActiveChatProvider();
            return provider.analyzeSentiment(text);
        });
        return res || 'NEUTRAL';
    }

    async translate(text: string, targetLanguage: string): Promise<string | null> {
        return this.runSafe(async () => {
            const provider = await this.getActiveChatProvider();
            return provider.translate(text, targetLanguage);
        });
    }

    async getActiveModelName(): Promise<string> {
        const provider = await this.getActiveChatProvider();
        return provider.getActiveModelName();
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
}
