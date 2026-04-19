import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { AiPart, AiProvider, ChatResult, EmbeddingResult } from './interfaces/ai-provider.interface';

@Injectable()
export class GenericOpenAiService implements AiProvider {
    private readonly logger = new Logger(GenericOpenAiService.name);
    private providerPrefix = 'ai.custom';

    constructor(
        private readonly config: ConfigService,
        private readonly settings: SettingsService,
    ) { }

    setProvider(provider: 'custom' | 'xai' | 'deepseek' | 'groq') {
        this.providerPrefix = `ai.${provider}`;
    }

    private async getBaseUrl(): Promise<string | null> {
        const val = await this.settings.getValue(`${this.providerPrefix}.url`);
        return val || null;
    }

    private async getApiKey(): Promise<string | null> {
        const val = await this.settings.getValue(`${this.providerPrefix}.api_key`);

        // Auto-upgrade for GROQ_API_KEY from environment if not in settings
        if (!val && this.providerPrefix === 'ai.groq') {
            return this.config.get<string>('GROQ_API_KEY') || null;
        }

        return val || null;
    }

    private getProviderDefaultModel(baseUrl: string): string {
        if (baseUrl.includes('groq.com')) return 'llama-3.3-70b-versatile';
        if (baseUrl.includes('deepseek.com')) return 'deepseek-chat';
        if (baseUrl.includes('x.ai') || baseUrl.includes('grok.com')) return 'grok-2-latest';
        return 'gpt-4o-mini';
    }

    private async getModel(): Promise<string> {
        const customModel = await this.settings.getValue(`${this.providerPrefix}.chat_model`);
        if (customModel) return customModel;

        const baseUrl = await this.getBaseUrl();
        return this.getProviderDefaultModel(baseUrl || '');
    }

    private async getEmbedModel(): Promise<string> {
        return (await this.settings.getValue(`${this.providerPrefix}.embed_model`)) ||
            this.config.get<string>('EMBEDDING_MODEL') ||
            'text-embedding-3-small';
    }

    private validateApiKey(baseUrl: string, apiKey: string) {
        if (!apiKey) return;
        if ((baseUrl.includes('x.ai') || baseUrl.includes('grok.com')) && !apiKey.startsWith('xai-')) {
            throw new BadRequestException(
                `Hatalı xAI API Anahtarı: Anahtarınız 'xai-' ile başlamalıdır. Görünüşe göre başka bir servis anahtarı (örneğin Groq) girilmiş olabilir.`
            );
        }
        if (baseUrl.includes('groq.com') && !apiKey.startsWith('gsk_')) {
            throw new BadRequestException(
                `Hatalı Groq API Anahtarı: Anahtarınız 'gsk_' ile başlamalıdır. Görünüşe göre başka bir servis anahtarı (örneğin xAI) girilmiş olabilir.`
            );
        }
        if (baseUrl.includes('deepseek.com') && !apiKey.startsWith('sk-')) {
            throw new BadRequestException(
                `Hatalı DeepSeek API Anahtarı: Anahtarınız 'sk-' ile başlamalıdır.`
            );
        }
    }

    getName(): string {
        return this.providerPrefix.replace('ai.', '');
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
            this.validateApiKey(baseUrl, apiKey);

            const response = await fetch(`${baseUrl}/embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({ model, input: text }),
                signal: AbortSignal.timeout(60_000),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                // Special handling for xAI credit issues
                if (baseUrl.includes('x.ai') && errorBody.includes('credits')) {
                    throw new BadRequestException(
                        'xAI (Grok) hesabınızda kredi bulunmuyor. Lütfen console.x.ai/billing adresinden bakiye yükleyin.'
                    );
                }
                throw new Error(`Custom AI HTTP ${response.status} at ${baseUrl}: ${errorBody}`);
            }
            const data = await response.json();
            return { embedding: data.data[0].embedding, model };
        } catch (err: any) {
            if (err instanceof BadRequestException) throw err;
            this.logger.warn(`⚠️ Custom AI embed failed (${baseUrl}): ${err.message}`);
            throw err;
        }
    }

    async generate(prompt: string | AiPart[], timeout = 30_000): Promise<string | null> {
        const baseUrl = await this.getBaseUrl();
        const apiKey = await this.getApiKey();
        const model = await this.getModel();

        if (!baseUrl || !apiKey) return null;

        try {
            this.validateApiKey(baseUrl, apiKey);

            // Generic OpenAI handles content as string usually, but multi-part content is becoming standard.
            // For now we'll pass text-only from parts to stay safe with older standard providers.
            const content = typeof prompt === 'string' ? prompt : prompt.map(p => p.text).join('\n');

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
                const errorBody = await response.text();
                // Special handling for xAI credit issues
                if (baseUrl.includes('x.ai') && errorBody.includes('credits')) {
                    throw new BadRequestException(
                        'xAI (Grok) hesabınızda kredi bulunmuyor. Lütfen console.x.ai/billing adresinden bakiye yükleyin.'
                    );
                }
                throw new Error(`Custom AI HTTP ${response.status} at ${baseUrl}: ${errorBody}`);
            }
            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (err: any) {
            if (err instanceof BadRequestException) throw err;
            this.logger.warn(`⚠️ Custom AI generate failed (${baseUrl}): ${err.message}`);
            throw err;
        }
    }

    async reformat(systemPrompt: string, userQuery: string, kbContent: string, attachments?: AiPart[]): Promise<ChatResult | null> {
        const baseUrl = await this.getBaseUrl();
        const apiKey = await this.getApiKey();
        const model = await this.getModel();

        if (!baseUrl || !apiKey) return null;

        try {
            this.validateApiKey(baseUrl, apiKey);

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

Above information source is official. Answer the user question logicially based ONLY on the source. Do not hallucinate.` }
                    ],
                    temperature: 0.1,
                }),
                signal: AbortSignal.timeout(60_000),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                // Special handling for xAI credit issues
                if (baseUrl.includes('x.ai') && errorBody.includes('credits')) {
                    throw new BadRequestException(
                        'xAI (Grok) hesabınızda kredi bulunmuyor. Lütfen console.x.ai/billing adresinden bakiye yükleyin.'
                    );
                }
                throw new Error(`Custom AI HTTP ${response.status} at ${baseUrl}: ${errorBody}`);
            }
            const data = await response.json();
            const content = data.choices[0].message.content.trim();
            return { response: content, model };
        } catch (err: any) {
            if (err instanceof BadRequestException) throw err;
            this.logger.warn(`⚠️ Custom AI reformat failed (${baseUrl}): ${err.message}`);
            throw err;
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
        const model = await this.getModel();
        if (!baseUrl || !apiKey) return null;

        try {
            this.validateApiKey(baseUrl, apiKey);
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
            if (!response.ok) {
                const errorBody = await response.text();
                // Special handling for xAI credit issues
                if (baseUrl.includes('x.ai') && errorBody.includes('credits')) {
                    throw new BadRequestException(
                        'xAI (Grok) hesabınızda kredi bulunmuyor. Lütfen console.x.ai/billing adresinden bakiye yükleyin.'
                    );
                }
                throw new Error(`Custom OpenAI HTTP ${response.status}`);
            }
            const data = await response.json();
            return data.choices[0]?.message?.content?.trim() || null;
        } catch (error: any) {
            if (error instanceof BadRequestException) throw error;
            this.logger.error(`GenericOpenAI Translation API error: ${error.message}`);
            throw error;
        }
    }

    async getActiveModelName(): Promise<string> {
        return this.getModel();
    }

    async isAvailable(): Promise<boolean> {
        const baseUrl = await this.getBaseUrl();
        const apiKey = await this.getApiKey();
        return !!(baseUrl && apiKey);
    }

    async testConnection(): Promise<{ success: boolean; message: string }> {
        const baseUrl = await this.getBaseUrl();
        const apiKey = await this.getApiKey();

        if (!baseUrl || !apiKey) {
            return { success: false, message: 'API Key veya Base URL eksik/çözülemedi.' };
        }

        try {
            this.validateApiKey(baseUrl, apiKey);

            // OpenAI uyumlu endpointlerde /models listesini çekmeyi deneriz.
            const response = await fetch(`${baseUrl}/models`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
                signal: AbortSignal.timeout(10_000),
            });

            if (response.ok) {
                return { success: true, message: 'Bağlantı başarılı.' };
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
            if (response.status === 429 || errorDetail.includes('credits')) { // XAI bakiye kontrolü
                return { success: false, message: `Kota/Bakiye yetersiz. Faturalandırmayı kontrol edin. Detay: ${errorDetail}` };
            }

            return { success: false, message: `Hata: ${response.status} - ${errorDetail}` };

        } catch (error: any) {
            if (error instanceof BadRequestException) {
                return { success: false, message: error.message };
            }

            this.logger.error(`Generic Test Connection error: ${error.message}`);
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                return { success: false, message: 'Bağlantı zaman aşımına uğradı. Base URL yanlış olabilir.' };
            }
            return { success: false, message: `Erişim sağlanamadı: ${error.message}` };
        }
    }
}
