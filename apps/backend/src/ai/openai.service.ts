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
                signal: AbortSignal.timeout(60000),
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
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
