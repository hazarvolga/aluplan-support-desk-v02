import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { AiPart, AiProvider, ChatResult, EmbeddingResult } from './interfaces/ai-provider.interface';

@Injectable()
export class OpenAiService implements AiProvider {
    private readonly logger = new Logger(OpenAiService.name);

    constructor(
        private readonly config: ConfigService,
        private readonly settings: SettingsService,
    ) { }

    private async getApiKey(): Promise<string | null> {
        const val = await this.settings.getValue('ai.openai.api_key');
        return val || this.config.get<string>('OPENAI_API_KEY') || null;
    }

    private async getModel(): Promise<string> {
        return (await this.settings.getValue('ai.openai.chat_model')) ||
            'gpt-4o-mini';
    }

    private async getEmbedModel(): Promise<string> {
        return (await this.settings.getValue('ai.openai.embed_model')) ||
            'text-embedding-3-small';
    }

    getName(): string {
        return 'openai';
    }

    private async fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> {
        try {
            const response = await fetch(url, options);
            if (response.status === 429 && retries > 0) {
                this.logger.warn(`⚠️ OpenAI Rate Limit (429) hit. Retrying in ${backoff}ms... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            return response;
        } catch (error: any) {
            if (retries > 0 && (error.name === 'AbortError' || error.name === 'TimeoutError' || error.message.includes('fetch failed'))) {
                this.logger.warn(`⚠️ OpenAI Fetch failed: ${error.message}. Retrying in ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            throw error;
        }
    }

    async embed(text: string): Promise<EmbeddingResult | null> {
        const apiKey = await this.getApiKey();
        if (!apiKey) return null;

        try {
            const model = await this.getEmbedModel();
            const response = await this.fetchWithRetry('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    input: text,
                    dimensions: parseInt(this.config.get('EMBEDDING_DIMENSIONS') || '1536', 10),
                }),
                signal: AbortSignal.timeout(60000),
            });

            if (!response.ok) throw new Error(`OpenAI HTTP ${response.status}`);
            const data = await response.json();
            return { embedding: data.data[0].embedding, model };
        } catch (err: any) {
            this.logger.error(`🚨 OpenAI embed EXCEPTION: ${err.message}`, err.stack);
            throw err; // Throw instead of returning null to stop silent failure
        }
    }

    private mapParts(prompt: string | AiPart[]): any {
        if (typeof prompt === 'string') return prompt;
        return prompt.map(p => {
            if (p.inlineData) {
                return {
                    type: 'image_url',
                    image_url: { url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}` }
                };
            }
            return { type: 'text', text: p.text || '' };
        });
    }

    async generate(prompt: string | AiPart[], timeout = 30_000): Promise<string | null> {
        const apiKey = await this.getApiKey();
        if (!apiKey) return null;

        try {
            const model = await this.getModel();
            const content = this.mapParts(prompt);

            const response = await this.fetchWithRetry('https://api.openai.com/v1/chat/completions', {
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

            if (!response.ok) throw new Error(`OpenAI HTTP ${response.status}`);
            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (err: any) {
            this.logger.warn(`⚠️ OpenAI generate failed: ${err.message}`);
            return null;
        }
    }

    async *streamGenerate(prompt: string | AiPart[], timeout = 30_000): AsyncGenerator<string, void, unknown> {
        const apiKey = await this.getApiKey();
        if (!apiKey) {
            yield 'API Key missing.';
            return;
        }

        try {
            const model = await this.getModel();
            const content = this.mapParts(prompt);

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content }],
                    temperature: 0.2,
                    stream: true,
                }),
                signal: AbortSignal.timeout(timeout),
            });

            if (!response.ok) throw new Error(`OpenAI HTTP ${response.status}`);

            const reader = response.body?.getReader();
            if (!reader) return;

            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') break;
                        try {
                            const json = JSON.parse(data);
                            const text = json.choices[0]?.delta?.content;
                            if (text) yield text;
                        } catch (e) {
                            // Skip parse errors for non-json chunks
                        }
                    }
                }
            }
        } catch (err: any) {
            this.logger.warn(`⚠️ OpenAI streamGenerate failed: ${err.message}`);
            yield 'OpenAI streaming error.';
        }
    }

    async reformat(systemPrompt: string, userQuery: string, kbContent: string, attachments?: AiPart[]): Promise<ChatResult | null> {
        const apiKey = await this.getApiKey();
        if (!apiKey) return null;

        try {
            const model = await this.getModel();

            const userContent: any[] = [
                { type: 'text', text: `KULLANICI SORUSU:\n${userQuery}` }
            ];

            if (attachments && attachments.length > 0) {
                userContent.push(...this.mapParts(attachments) as any[]);
            }

            userContent.push({
                type: 'text', text: `\n\n---
                
ONAYLI BİLGİ KAYNAĞI:
${kbContent}

Yukarıdaki bilgi kaynağına dayanarak teknik bir dille özetle ve doğrudan soruyu yanıtla. Metni birebir kopyalama.`
            });

            const response = await this.fetchWithRetry('https://api.openai.com/v1/chat/completions', {
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
        if (!apiKey) return null;
        try {
            const model = await this.getModel();
            const response = await this.fetchWithRetry('https://api.openai.com/v1/chat/completions', {
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
            if (!response.ok) throw new Error(`OpenAI HTTP ${response.status}`);
            const data = await response.json();
            return data.choices[0]?.message?.content?.trim() || null;
        } catch (error: any) {
            this.logger.error(`OpenAI Translation API error: ${error.message}`);
            return null;
        }
    }

    async getActiveModelName(): Promise<string> {
        return this.getModel();
    }

    async isAvailable(): Promise<boolean> {
        const apiKey = await this.getApiKey();
        return !!apiKey;
    }

    async testConnection(): Promise<{ success: boolean; message: string }> {
        const apiKey = await this.getApiKey();
        if (!apiKey) {
            return { success: false, message: 'API Key bulunamadı veya çözülemedi (ENCRYPTION_KEY x API Key uyumsuzluğu olabilir).' };
        }

        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
                signal: AbortSignal.timeout(10_000), // 10 saniye timeout
            });

            if (response.ok) {
                return { success: true, message: 'OpenAI bağlantısı başarılı. Modeller listelendi.' };
            }

            // Hata detayını yakalamaya çalış
            let errorDetail = '';
            try {
                const errorData = await response.json();
                errorDetail = errorData?.error?.message || response.statusText;
            } catch (_e) {
                errorDetail = response.statusText;
            }

            if (response.status === 401) {
                return { success: false, message: `Yetkisiz Erişim (401). API Key yanlış veya iptal edilmiş olabilir. Detay: ${errorDetail}` };
            }
            if (response.status === 429) {
                return { success: false, message: `Kota/Limit Aşıldı (429). OpenAI faturanızı kontrol edin. Detay: ${errorDetail}` };
            }

            return { success: false, message: `Bağlantı hatası: ${response.status} - ${errorDetail}` };

        } catch (error: any) {
            this.logger.error(`OpenAI Test Connection error: ${error.message}`);
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                return { success: false, message: 'OpenAI sunucusuna bağlanılamadı (Timeout). Ağ bağlantınızı kontrol edin.' };
            }
            return { success: false, message: `Erişim sağlanamadı: ${error.message}` };
        }
    }
}
