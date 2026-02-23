import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { OllamaService } from './ollama.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
import { AiProvider, ChatResult, EmbeddingResult } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService implements AiProvider {
    private readonly logger = new Logger(AiService.name);

    constructor(
        private readonly settings: SettingsService,
        private readonly ollama: OllamaService,
        private readonly openai: OpenAiService,
        private readonly custom: GenericOpenAiService,
    ) { }

    private async getActiveProvider(): Promise<AiProvider> {
        const providerName = await this.settings.getValue('ai.active_provider');

        switch (providerName) {
            case 'openai':
                return this.openai;
            case 'custom':
                return this.custom;
            case 'ollama':
                return this.ollama;
            default:
                this.logger.log('No AI provider specified or invalid provider. Falling back to Ollama.');
                return this.ollama;
        }
    }

    getName(): string {
        return 'dispatcher';
    }

    async embed(text: string): Promise<EmbeddingResult | null> {
        const provider = await this.getActiveProvider();
        this.logger.log(`Using AI provider: ${provider.getName()} for embedding`);
        return provider.embed(text);
    }

    async generate(prompt: string, timeout?: number): Promise<string | null> {
        const provider = await this.getActiveProvider();
        this.logger.log(`Using AI provider: ${provider.getName()} for generation`);
        return provider.generate(prompt, timeout);
    }

    async reformat(systemPrompt: string, userQuery: string, kbContent: string): Promise<ChatResult | null> {
        const provider = await this.getActiveProvider();
        return provider.reformat(systemPrompt, userQuery, kbContent);
    }

    async *streamReformat(systemPrompt: string, userQuery: string, kbContent: string): AsyncGenerator<string, void, unknown> {
        const provider = await this.getActiveProvider();
        if (provider.streamReformat) {
            yield* provider.streamReformat(systemPrompt, userQuery, kbContent);
        } else {
            // Fallback: yield the whole reformat at once
            const result = await provider.reformat(systemPrompt, userQuery, kbContent);
            if (result?.response) {
                yield result.response;
            }
        }
    }

    async suggestCategory(title: string, content: string, categories: string[]): Promise<string | null> {
        const provider = await this.getActiveProvider();
        return provider.suggestCategory(title, content, categories);
    }

    async summarizeTicket(subject: string, conversation: string): Promise<string | null> {
        const provider = await this.getActiveProvider();
        return provider.summarizeTicket(subject, conversation);
    }

    async analyzeSentiment(text: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> {
        const provider = await this.getActiveProvider();
        return provider.analyzeSentiment(text);
    }

    async translate(text: string, targetLanguage: string): Promise<string | null> {
        const provider = await this.getActiveProvider();
        return provider.translate(text, targetLanguage);
    }

    async getActiveModelName(): Promise<string> {
        const provider = await this.getActiveProvider();
        return provider.getActiveModelName();
    }

    async isAvailable(): Promise<boolean> {
        const provider = await this.getActiveProvider();
        return provider.isAvailable();
    }
}
