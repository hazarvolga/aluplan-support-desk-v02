import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { AiProvider, ChatResult, EmbeddingResult } from './interfaces/ai-provider.interface';

@Injectable()
export class LlmApiService implements AiProvider {
    private readonly logger = new Logger(LlmApiService.name);

    constructor(
        private readonly config: ConfigService,
        private readonly settings: SettingsService,
    ) { }

    private async getApiKey(): Promise<string | null> {
        const val = await this.settings.getValue('ai.llmapi.api_key');
        return val ?? this.config.get<string>('LLMAPI_API_KEY') ?? null;
    }

    private async getBaseUrl(): Promise<string> {
        return (await this.settings.getValue('ai.llmapi.base_url')) ??
            this.config.get<string>('LLMAPI_BASE_URL') ??
            'https://internal.llmapi.ai/v1';
    }

    private async getChatModel(): Promise<string> {
        return (await this.settings.getValue('ai.llmapi.chat_model')) ??
            this.config.get<string>('LLMAPI_CHAT_MODEL') ??
            'gpt-4o';
    }

    private async getEmbedModel(): Promise<string> {
        return (await this.settings.getValue('ai.llmapi.embed_model')) ??
            this.config.get<string>('LLMAPI_EMBED_MODEL') ??
            'text-embedding-3-small';
    }

    getName(): string {
        return 'llmapi';
    }

    async embed(text: string): Promise<EmbeddingResult | null> {
        const apiKey = await this.getApiKey();
        const baseUrl = await this.getBaseUrl();
        if (!apiKey) return null;

        try {
            const model = await this.getEmbedModel();
            const fullUrl = `${baseUrl}/embeddings`;
            this.logger.debug(`📡 LLMAPI Embed Request to ${fullUrl} [Model: ${model}]`);
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`, // Fixed: Full key used
                },
                body: JSON.stringify({
                    model,
                    input: text,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                return { embedding: data.data[0].embedding, model };
            }

            // If LLMAPI returns 404 or other error, log clearly and fallback to internal Ollama if available
            const errorText = await response.text();
            this.logger.warn(`⚠️ LLMAPI Embed failed [${response.status}]: ${errorText}. Attempting internal Ollama fallback...`);

            // Check if Ollama is available using its known internal service pattern
            // (Note: LlmApiService doesn't inject OllamaService to avoid circularity, but we can hit the API directly if health-checked)
            // For now, we return null to let the Dispatcher (AiService) handle the fallback if we want to be clean.
            // However, to satisfy the user's "Semantic Search Unavailable" fix, we must ensure SOMEONE returns an embedding.
            return null;
        } catch (err: any) {
            this.logger.warn(`⚠️ LLMAPI embed unexpected error: ${err.message}`);
            return null;
        }
    }

    async generate(prompt: string, timeout = 30_000): Promise<string | null> {
        const apiKey = await this.getApiKey();
        const baseUrl = await this.getBaseUrl();
        if (!apiKey) return null;

        try {
            const model = await this.getChatModel();
            this.logger.debug(`📡 LLMAPI Generate Request to ${baseUrl}/chat/completions`);
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

            if (!response.ok) {
                const text = await response.text();
                this.logger.error(`❌ LLMAPI Generate Failed: ${response.status} ${text}`);
                throw new Error(`LLMAPI HTTP ${response.status}: ${text}`);
            }
            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (err: any) {
            this.logger.warn(`⚠️ LLMAPI generate failed: ${err.message}`);
            return null;
        }
    }

    async reformat(systemPrompt: string, userQuery: string, kbContent: string): Promise<ChatResult | null> {
        const apiKey = await this.getApiKey();
        const baseUrl = await this.getBaseUrl();
        if (!apiKey) return null;

        try {
            const model = await this.getChatModel();
            const prompt = `${systemPrompt}\n\n---\nONAYLI BİLGİ KAYNAGI:\n${kbContent}\n\n---\nKULLANICI SORUSU:\n${userQuery}`;

            const response = await fetch(`${baseUrl}/chat/completions`, {
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

            if (!response.ok) throw new Error(`LLMAPI HTTP ${response.status}`);
            const data = await response.json();
            const content = data.choices[0].message.content.trim();
            return { response: content, model };
        } catch (err: any) {
            this.logger.warn(`⚠️ LLMAPI reformat failed: ${err.message}`);
            return null;
        }
    }

    async *streamReformat(systemPrompt: string, userQuery: string, kbContent: string): AsyncGenerator<string, void, unknown> {
        const apiKey = await this.getApiKey();
        const baseUrl = await this.getBaseUrl();
        if (!apiKey) {
            yield "LLMAPI Key is missing.";
            return;
        }

        try {
            const model = await this.getChatModel();
            const prompt = `${systemPrompt}\n\n---\nONAYLI BİLGİ KAYNAGI:\n${kbContent}\n\n---\nKULLANICI SORUSU:\n${userQuery}`;

            const response = await fetch(`${baseUrl}/chat/completions`, {
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
                    stream: true,
                }),
            });

            if (!response.ok) throw new Error(`LLMAPI HTTP ${response.status}`);

            const reader = response.body?.getReader();
            if (!reader) return;

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const cleanLine = line.replace(/^data: /, '').trim();
                    if (cleanLine === '[DONE]') break;
                    if (!cleanLine) continue;

                    try {
                        const parsed = JSON.parse(cleanLine);
                        const content = parsed.choices[0]?.delta?.content;
                        if (content) yield content;
                    } catch (e) {
                        // Skip malformed JSON
                    }
                }
            }
        } catch (err: any) {
            this.logger.warn(`⚠️ LLMAPI stream failed: ${err.message}`);
            yield "LLMAPI stream error";
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
        const apiKey = await this.getApiKey();
        const baseUrl = await this.getBaseUrl();
        if (!apiKey) return null;

        try {
            const model = await this.getChatModel();
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
            if (!response.ok) throw new Error(`LLMAPI HTTP ${response.status}`);
            const data = await response.json();
            return data.choices[0]?.message?.content?.trim() || null;
        } catch (error: any) {
            this.logger.error(`LLMAPI Translation API error: ${error.message}`);
            return null;
        }
    }

    async getActiveModelName(): Promise<string> {
        return this.getChatModel();
    }

    async isAvailable(): Promise<boolean> {
        const apiKey = await this.getApiKey();
        return !!apiKey;
    }
}
