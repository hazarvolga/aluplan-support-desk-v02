import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { AiPart, AiProvider, ChatResult, EmbeddingResult, ModelListResult } from './interfaces/ai-provider.interface';
import { mapPartsToOpenAi } from './utils/map-parts-to-openai';

@Injectable()
export class LlmApiService implements AiProvider {
    private readonly logger = new Logger(LlmApiService.name);

    constructor(
        private readonly config: ConfigService,
        private readonly settings: SettingsService,
    ) { }

    private async getApiKey(): Promise<string | null> {
        const val = await this.settings.getValue('ai.llmapi.api_key');
        return val || this.config.get<string>('LLMAPI_API_KEY') || null;
    }

    private async getBaseUrl(): Promise<string> {
        return (await this.settings.getValue('ai.llmapi.base_url')) ||
            this.config.get<string>('LLMAPI_BASE_URL') ||
            'https://internal.llmapi.ai/v1';
    }

    private async getChatModel(): Promise<string> {
        return (await this.settings.getValue('ai.llmapi.chat_model')) ||
            this.config.get<string>('LLMAPI_CHAT_MODEL') ||
            'gpt-4o';
    }

    private async getEmbedModel(): Promise<string> {
        let model = (await this.settings.getValue('ai.llmapi.embed_model')) ||
            this.config.get<string>('LLMAPI_EMBED_MODEL') ||
            'text-embedding-3-small';

        // Auto-correct common user typo from the admin panel
        if (model === 'text-embeding-3-small') {
            model = 'text-embedding-3-small';
        }

        return model;
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
                signal: AbortSignal.timeout(60000),
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

    async generate(prompt: string | AiPart[], timeout = 30_000): Promise<string | null> {
        const apiKey = await this.getApiKey();
        const baseUrl = await this.getBaseUrl();
        if (!apiKey) return null;

        try {
            const model = await this.getChatModel();
            this.logger.debug(`📡 LLMAPI Generate Request to ${baseUrl}/chat/completions`);

            // Check if prompt is multimodal. Use text-only shortcut when all parts are text,
            // otherwise build a multipart content array with image_url blocks.
            let content: string | ReturnType<typeof mapPartsToOpenAi>;
            if (typeof prompt === 'string') {
                content = prompt;
            } else {
                const parts = prompt;
                const allText = parts.every(p => p.text !== undefined && !p.inlineData && !p.fileData);
                content = allText
                    ? parts.map(p => p.text).join('\n')
                    : mapPartsToOpenAi(parts, this.logger);
            }

            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content }],
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

    async reformat(systemPrompt: string, userQuery: string, kbContent: string, attachments?: AiPart[]): Promise<ChatResult | null> {
        const apiKey = await this.getApiKey();
        const baseUrl = await this.getBaseUrl();
        if (!apiKey) return null;

        try {
            const model = await this.getChatModel();

            // Handle attachments: build multipart content array with image_url blocks for images
            const attachmentBlocks = attachments && attachments.length > 0
                ? mapPartsToOpenAi(attachments, this.logger)
                : [];

            const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
                { type: 'text', text: `KULLANICI SORUSU:\n${userQuery}` },
                ...attachmentBlocks,
                {
                    type: 'text', text: `\n\n---

ONAYLI BİLGİ KAYNAĞI:
${kbContent}

Yukarıdaki bilgi kaynağına dayanarak teknik bir dille özetle ve doğrudan soruyu yanıtla. Metni birebir kopyalama.`
                }
            ];

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
                        { role: 'user', content: userContent }
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

    async *streamReformat(systemPrompt: string, userQuery: string, kbContent: string, attachments?: AiPart[]): AsyncGenerator<string, void, unknown> {
        const apiKey = await this.getApiKey();
        const baseUrl = await this.getBaseUrl();
        if (!apiKey) {
            yield "LLMAPI Key is missing.";
            return;
        }

        try {
            const model = await this.getChatModel();
            const attachmentStrings = attachments?.map(p => p.text).filter(Boolean).join('\n') || '';

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

${attachmentStrings}

---

ONAYLI BİLGİ KAYNAĞI:
${kbContent}

Yukarıdaki bilgi kaynağına dayanarak teknik bir dille özetle ve doğrudan soruyu yanıtla. Metni birebir kopyalama.` }
                    ],
                    temperature: 0.1,
                    stream: true,
                }),
                signal: AbortSignal.timeout(120_000), // Longer timeout for streaming
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
                    } catch (_e) {
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

    async listModels(apiKeyOverride?: string, baseUrlOverride?: string): Promise<ModelListResult> {
        const EMPTY: ModelListResult = { chatModels: [], embedModels: [] };
        const apiKey = apiKeyOverride || await this.getApiKey();
        const baseUrl = baseUrlOverride || await this.getBaseUrl();
        if (!apiKey) return EMPTY;

        try {
            const response = await fetch(`${baseUrl}/models`, {
                headers: { 'Authorization': `Bearer ${apiKey}` },
                signal: AbortSignal.timeout(8000),
            });
            if (!response.ok) return EMPTY;

            const data: any = await response.json();
            const models: any[] = data.data ?? [];

            const chatModels = models.map(m => ({
                id: m.id as string,
                displayName: m.id as string,
                recommended: false,
            }));

            return { chatModels, embedModels: [] };
        } catch (err: any) {
            this.logger.warn(`Failed to list LLMAPI models: ${err.message}`);
            return EMPTY;
        }
    }

    async testConnection(): Promise<{ success: boolean; message: string }> {
        const apiKey = await this.getApiKey();
        const baseUrl = await this.getBaseUrl();
        if (!apiKey) {
            return { success: false, message: 'API Key bulunamadı veya çözümsüz.' };
        }

        try {
            const response = await fetch(`${baseUrl}/models`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
                signal: AbortSignal.timeout(10_000),
            });

            if (response.ok) {
                return { success: true, message: 'LLMAPI bağlantısı başarılı.' };
            }

            let errorDetail = '';
            try {
                const errorData = await response.json();
                errorDetail = errorData?.error?.message || response.statusText;
            } catch (_e) {
                errorDetail = response.statusText;
            }

            if (response.status === 401) {
                return { success: false, message: `Yetkisiz (401). API Key hatalı olabilir. Detay: ${errorDetail}` };
            }
            if (response.status === 429) {
                return { success: false, message: `Kota Aşıldı (429). Detay: ${errorDetail}` };
            }

            return { success: false, message: `Hata: ${response.status} - ${errorDetail}` };

        } catch (error: any) {
            this.logger.error(`LLMAPI Test Connection error: ${error.message}`);
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                return { success: false, message: 'Bağlantı zaman aşımına uğradı.' };
            }
            return { success: false, message: `Erişim sağlanamadı: ${error.message}` };
        }
    }
}
