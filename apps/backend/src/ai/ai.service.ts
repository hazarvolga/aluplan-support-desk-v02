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

    private async getActiveProvider(): Promise<AiProvider> {
        const providerName = await this.settings.getValue('ai.active_provider');

        switch (providerName) {
            case 'openai':
                return this.openai;
            case 'custom':
                return this.custom;
            case 'ollama':
                return this.ollama;
            case 'llmapi':
                return this.llmapi;
            default:
                return this.ollama;
        }
    }

    getName(): string {
        return 'dispatcher';
    }

    async embed(text: string): Promise<EmbeddingResult | null> {
        return this.runSafe(async () => {
            const provider = await this.getActiveProvider();
            let result = await provider.embed(text);

            // AUTO-FALLBACK: If primary provider fails to embed, try Ollama
            if (!result && provider.getName() !== 'ollama') {
                this.logger.warn(`🔄 Active provider [${provider.getName()}] failed to embed. Falling back to Ollama...`);
                result = await this.ollama.embed(text);
            }

            return result;
        });
    }

    async generate(prompt: string, timeout?: number): Promise<string | null> {
        return this.runSafe(async () => {
            const provider = await this.getActiveProvider();
            return provider.generate(prompt, timeout);
        });
    }

    async reformat(systemPrompt: string, userQuery: string, kbContent: string): Promise<ChatResult | null> {
        return this.runSafe(async () => {
            const provider = await this.getActiveProvider();
            return provider.reformat(systemPrompt, userQuery, kbContent);
        });
    }

    async *streamReformat(systemPrompt: string, userQuery: string, kbContent: string): AsyncGenerator<string, void, unknown> {
        const closed = await this.isCircuitClosed();
        if (!closed) {
            yield 'AI servisi şu anda devre dışı (Circuit Breaker).';
            return;
        }

        const provider = await this.getActiveProvider();
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
            const provider = await this.getActiveProvider();
            return provider.suggestCategory(title, content, categories);
        });
    }

    async summarizeTicket(subject: string, conversation: string): Promise<string | null> {
        return this.runSafe(async () => {
            const provider = await this.getActiveProvider();
            return provider.summarizeTicket(subject, conversation);
        });
    }

    async analyzeSentiment(text: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> {
        const res = await this.runSafe(async () => {
            const provider = await this.getActiveProvider();
            return provider.analyzeSentiment(text);
        });
        return res || 'NEUTRAL';
    }

    async translate(text: string, targetLanguage: string): Promise<string | null> {
        return this.runSafe(async () => {
            const provider = await this.getActiveProvider();
            return provider.translate(text, targetLanguage);
        });
    }

    async getActiveModelName(): Promise<string> {
        const provider = await this.getActiveProvider();
        return provider.getActiveModelName();
    }

    async isAvailable(): Promise<boolean> {
        if (!await this.isCircuitClosed()) return false;
        const provider = await this.getActiveProvider();
        return provider.isAvailable();
    }
}
