import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { AiProvider, ChatResult, EmbeddingResult } from './interfaces/ai-provider.interface';

@Injectable()
export class GenericOpenAiService implements AiProvider {
    private readonly logger = new Logger(GenericOpenAiService.name);

    constructor(
        private readonly settings: SettingsService,
    ) { }

    private async getBaseUrl(): Promise<string | null> {
        return await this.settings.getValue('ai.custom.url');
    }

    private async getApiKey(): Promise<string | null> {
        return await this.settings.getValue('ai.custom.api_key');
    }

    private async getChatModel(): Promise<string> {
        return (await this.settings.getValue('ai.custom.chat_model')) ?? 'gpt-4o';
    }

    private async getEmbedModel(): Promise<string> {
        return (await this.settings.getValue('ai.custom.embed_model')) ?? 'text-embedding-3-small';
    }

    getName(): string {
        return 'custom';
    }

    async embed(text: string): Promise<EmbeddingResult | null> {
        const baseUrl = await this.getBaseUrl();
        const apiKey = await this.getApiKey();
        const model = await this.getEmbedModel();

        if (!baseUrl || !apiKey) {
            this.logger.warn('⚠️ Custom AI provider misconfigured: Missing URL or API Key');
            return null;
        }

        try {
            const response = await fetch(`${baseUrl}/embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({ model, input: text }),
                signal: AbortSignal.timeout(60_000),
            });

            if (!response.ok) throw new Error(`Custom AI HTTP ${response.status}`);
            const data = await response.json();
            return { embedding: data.data[0].embedding, model };
        } catch (err: any) {
            this.logger.warn(`⚠️ Custom AI embed failed: ${err.message}`);
            return null;
        }
    }

    async generate(prompt: string, timeout = 30_000): Promise<string | null> {
        const baseUrl = await this.getBaseUrl();
        const apiKey = await this.getApiKey();
        const model = await this.getChatModel();

        if (!baseUrl || !apiKey) return null;

        try {
            const response = await fetch(`${baseUrl}/chat/completions`, {
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

            if (!response.ok) throw new Error(`Custom AI HTTP ${response.status}`);
            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (err: any) {
            this.logger.warn(`⚠️ Custom AI generate failed: ${err.message}`);
            return null;
        }
    }

    async reformat(systemPrompt: string, userQuery: string, kbContent: string): Promise<ChatResult | null> {
        const baseUrl = await this.getBaseUrl();
        const apiKey = await this.getApiKey();
        const model = await this.getChatModel();

        if (!baseUrl || !apiKey) return null;

        try {
            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        {
                            role: 'user', content: `KULLANICI SORUSU:
${userQuery}

---

ONAYLI BİLGİ KAYNAĞI:
${kbContent}

Yukarıdaki bilgi kaynağına dayanarak teknik bir dille özetle ve doğrudan soruyu yanıtla. Metni birebir kopyalama.` }
                    ],
                    temperature: 0.1,
                }),
                signal: AbortSignal.timeout(60_000),
            });

            if (!response.ok) throw new Error(`Custom AI HTTP ${response.status}`);
            const data = await response.json();
            const content = data.choices[0].message.content.trim();
            return { response: content, model };
        } catch (err: any) {
            this.logger.warn(`⚠️ Custom AI reformat failed: ${err.message}`);
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

    async analyzeSentiment(text: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> {
        const prompt = `Görevin: Aşağıdaki metnin duygusunu (sentiment) analiz edip, sonuç olarak 'POSITIVE', 'NEUTRAL' veya 'NEGATIVE' kelimelerinden sadece birini yazmak.
        
METİN:
${text.substring(0, 1000)}

SONUÇ (YALNIZCA KELİME):`;
        const result = await this.generate(prompt, 30_000);
        if (!result) return 'NEUTRAL';
        const cleanResult = result.toUpperCase().trim();
        if (cleanResult.includes('POSITIVE')) return 'POSITIVE';
        if (cleanResult.includes('NEGATIVE')) return 'NEGATIVE';
        return 'NEUTRAL';
    }

    async translate(text: string, targetLanguage: string): Promise<string | null> {
        const baseUrl = await this.getBaseUrl();
        const apiKey = await this.getApiKey();
        const model = await this.getChatModel();
        if (!baseUrl || !apiKey) return null;

        try {
            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: `You are a professional translator. Translate the following text precisely to ${targetLanguage}. ONLY output the translated text with no extra commentary.` },
                        { role: 'user', content: text }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000,
                }),
                signal: AbortSignal.timeout(60_000),
            });
            if (!response.ok) throw new Error(`Custom OpenAI HTTP ${response.status}`);
            const data = await response.json();
            return data.choices[0]?.message?.content?.trim() || null;
        } catch (error: any) {
            this.logger.error(`GenericOpenAI Translation API error: ${error.message}`);
            return null;
        }
    }

    async getActiveModelName(): Promise<string> {
        return this.getChatModel();
    }

    async isAvailable(): Promise<boolean> {
        const baseUrl = await this.getBaseUrl();
        const apiKey = await this.getApiKey();
        return !!(baseUrl && apiKey);
    }
}
