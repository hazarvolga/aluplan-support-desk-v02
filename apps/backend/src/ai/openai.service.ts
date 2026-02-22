import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { AiProvider, ChatResult, EmbeddingResult } from './interfaces/ai-provider.interface';

@Injectable()
export class OpenAiService implements AiProvider {
    private readonly logger = new Logger(OpenAiService.name);

    constructor(
        private readonly config: ConfigService,
        private readonly settings: SettingsService,
    ) { }

    private async getApiKey(): Promise<string | null> {
        const val = await this.settings.getValue('ai.openai.api_key');
        return val ?? this.config.get<string>('OPENAI_API_KEY') ?? null;
    }

    private async getModel(): Promise<string> {
        return (await this.settings.getValue('ai.openai.chat_model')) ??
            'gpt-4o-mini';
    }

    private async getEmbedModel(): Promise<string> {
        return (await this.settings.getValue('ai.openai.embed_model')) ??
            'text-embedding-3-small';
    }

    getName(): string {
        return 'openai';
    }

    async embed(text: string): Promise<EmbeddingResult | null> {
        const apiKey = await this.getApiKey();
        if (!apiKey) return null;

        try {
            const model = await this.getEmbedModel();
            const response = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    input: text,
                }),
            });

            if (!response.ok) throw new Error(`OpenAI HTTP ${response.status}`);
            const data = await response.json();
            return { embedding: data.data[0].embedding, model };
        } catch (err: any) {
            this.logger.warn(`⚠️ OpenAI embed failed: ${err.message}`);
            return null;
        }
    }

    async generate(prompt: string, timeout = 30_000): Promise<string | null> {
        const apiKey = await this.getApiKey();
        if (!apiKey) return null;

        try {
            const model = await this.getModel();
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.2,
                }),
                signal: AbortSignal.timeout(timeout),
            });

            if (!response.ok) throw new Error(`OpenAI HTTP ${response.status}`);
            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (err: any) {
            this.logger.warn(`⚠️ OpenAI generate failed: ${err.message}`);
            return null;
        }
    }

    async reformat(systemPrompt: string, userQuery: string, kbContent: string): Promise<ChatResult | null> {
        const apiKey = await this.getApiKey();
        if (!apiKey) return null;

        try {
            const model = await this.getModel();
            const prompt = `${systemPrompt}\n\n---\nONAYLI BİLGİ KAYNAGI:\n${kbContent}\n\n---\nKULLANICI SORUSU:\n${userQuery}`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: 'Sen bir destek asistanısın. Yalnızca sağlanan bilgiye dayanarak yanıt ver.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.1,
                }),
                signal: AbortSignal.timeout(60_000),
            });

            if (!response.ok) throw new Error(`OpenAI HTTP ${response.status}`);
            const data = await response.json();
            const content = data.choices[0].message.content.trim();
            return { response: content, model };
        } catch (err: any) {
            this.logger.warn(`⚠️ OpenAI reformat failed: ${err.message}`);
            return null;
        }
    }

    async suggestCategory(title: string, content: string, categories: string[]): Promise<string | null> {
        const prompt = `Görevin: Aşağıdaki döküman için en uygun kategoriyi seçmek.
KATEGORİ LİSTESİ: ${categories.join(', ')}
DÖKÜMAN BAŞLIĞI: ${title}
DÖKÜMAN İÇERİĞİ: ${content.substring(0, 500)}...
Yalnızca kategori adını yaz. Başka bir şey yazma. Eğer uygun kategori yoksa "GENEL" yaz.`;
        return this.generate(prompt, 30_000);
    }

    async summarizeTicket(subject: string, conversation: string): Promise<string | null> {
        const prompt = `Aşağıdaki destek bileti konuşmasını profesyonelce özetle.
KONUŞMA BAŞLIĞI: ${subject}
KONUŞMA GEÇMİŞİ: ${conversation.substring(0, 3000)}`;
        return this.generate(prompt, 60_000);
    }

    async isAvailable(): Promise<boolean> {
        const apiKey = await this.getApiKey();
        return !!apiKey;
    }
}
