import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { AiPart, AiProvider, ChatResult, EmbeddingResult, ModelListResult } from './interfaces/ai-provider.interface';

/**
 * Google Gemini Service (AI Studio)
 * 
 * Direct integration with Google's Generative Language API.
 * Optimized for Gemini 1.5 Pro and Flash.
 */
@Injectable()
export class GeminiService implements AiProvider {
    private readonly logger = new Logger(GeminiService.name);

    constructor(
        private readonly config: ConfigService,
        private readonly settings: SettingsService,
    ) { }

    private async getApiKey(): Promise<string | null> {
        const val = await this.settings.getValue('ai.gemini.api_key');
        return val || this.config.get<string>('GEMINI_API_KEY') || null;
    }

    private async getChatModel(): Promise<string> {
        return (await this.settings.getValue('ai.gemini.chat_model')) ||
            this.config.get<string>('GEMINI_CHAT_MODEL') ||
            'gemini-1.5-flash';
    }

    private async getEmbedModel(): Promise<string> {
        return (await this.settings.getValue('ai.gemini.embed_model')) ||
            this.config.get<string>('GEMINI_EMBED_MODEL') ||
            'gemini-embedding-2';
    }

    getName(): string {
        return 'gemini';
    }

    async getActiveModelName(): Promise<string> {
        return this.getChatModel();
    }

    async isAvailable(): Promise<boolean> {
        const apiKey = await this.getApiKey();
        return !!apiKey;
    }

    private mapParts(prompt: string | AiPart[]): any[] {
        if (typeof prompt === 'string') {
            return [{ text: prompt }];
        }

        return prompt.map(part => {
            if (part.text) {
                return { text: part.text };
            }
            if (part.inlineData) {
                return {
                    inline_data: {
                        mime_type: part.inlineData.mimeType,
                        data: part.inlineData.data
                    }
                };
            }
            if (part.fileData) {
                // For Gemini API (Studio), fileData is usually handled via File API or base64
                // We'll treat it as text-only or log a warning if not base64
                this.logger.warn('⚠️ Gemini Service: fileData URL variant not fully implemented. Use inlineData (base64) for images.');
                return { text: `[Attachment: ${part.fileData.fileUri}]` };
            }
            return { text: '' };
        });
    }

    async generate(prompt: string | AiPart[], timeout = 30_000): Promise<string> {
        const apiKey = await this.getApiKey();
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY_NOT_CONFIGURED: Gemini API key is not set in database settings (ai.gemini.api_key) or environment variable (GEMINI_API_KEY)');
        }

        try {
            const model = await this.getChatModel();
            const contents = [{
                role: 'user',
                parts: this.mapParts(prompt)
            }];

            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    generationConfig: {
                        temperature: 0.2,
                        topP: 0.8,
                        topK: 40,
                    }
                }),
                signal: AbortSignal.timeout(timeout),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Gemini API Error ${response.status}: ${error}`);
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch (err: any) {
            this.logger.error(`🚨 Gemini generate failed: ${err.message}`);
            throw err;
        }
    }

    async *streamGenerate(prompt: string | AiPart[], timeout = 30_000): AsyncGenerator<string, void, unknown> {
        const apiKey = await this.getApiKey();
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY_NOT_CONFIGURED: Gemini API key is not set in database settings (ai.gemini.api_key) or environment variable (GEMINI_API_KEY)');
        }

        try {
            const model = await this.getChatModel();
            const contents = [{
                role: 'user',
                parts: this.mapParts(prompt)
            }];

            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents,
                    generationConfig: { temperature: 0.2 }
                }),
                signal: AbortSignal.timeout(timeout),
            });

            if (!response.ok) throw new Error(`Gemini Stream Error ${response.status}`);

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
                    if (line.startsWith('data: ')) {
                        try {
                            const json = JSON.parse(line.slice(6));
                            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (text) yield text;
                        } catch (e) {}
                    }
                }
            }
        } catch (err: any) {
            this.logger.warn(`⚠️ Gemini stream failed: ${err.message}`);
            yield 'Gemini streaming error.';
        }
    }

    async embed(text: string): Promise<EmbeddingResult | null> {
        const apiKey = await this.getApiKey();
        if (!apiKey) return null;

        try {
            const model = await this.getEmbedModel();
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: `models/${model}`,
                    content: { parts: [{ text }] }
                }),
                signal: AbortSignal.timeout(10_000),
            });

            if (!response.ok) throw new Error(`Gemini Embed Error ${response.status}`);
            const data = await response.json();
            return { embedding: data.embedding.values, model };
        } catch (err: any) {
            this.logger.error(`🚨 Gemini embed failed: ${err.message}`);
            return null;
        }
    }

    async reformat(systemPrompt: string, userQuery: string, kbContent: string, attachments?: AiPart[]): Promise<ChatResult | null> {
        const model = await this.getChatModel();
        const fullPrompt = `System: ${systemPrompt}\n\nKULLANICI SORUSU:\n${userQuery}\n\nONAYLI BİLGİ KAYNAĞI:\n${kbContent}`;
        const response = await this.generate(attachments ? [{ text: fullPrompt }, ...attachments] : fullPrompt);
        return response ? { response, model } : null;
    }

    async *streamReformat(systemPrompt: string, userQuery: string, kbContent: string, attachments?: AiPart[]): AsyncGenerator<string, void, unknown> {
        const fullPrompt = `System: ${systemPrompt}\n\nKULLANICI SORUSU:\n${userQuery}\n\nONAYLI BİLGİ KAYNAĞI:\n${kbContent}`;
        yield* this.streamGenerate(attachments ? [{ text: fullPrompt }, ...attachments] : fullPrompt);
    }

    async suggestCategory(title: string, content: string, categories: string[]): Promise<string | null> {
        const prompt = `Görevin: Aşağıdaki döküman için en uygun kategoriyi seçmek.
KATEGORİ LİSTESİ: ${categories.join(', ')}
DÖKÜMAN BAŞLIĞI: ${title}
DÖKÜMAN İÇERİĞİ: ${content.substring(0, 500)}...
Yalnızca kategori adını yaz. Başka bir şey yazma.`;
        return this.generate(prompt);
    }

    async summarizeTicket(subject: string, conversation: string): Promise<string | null> {
        const prompt = `Aşağıdaki destek bileti konuşmasını özetle.\nKONU: ${subject}\nGEÇMİŞ: ${conversation.substring(0, 3000)}`;
        return this.generate(prompt);
    }

    async analyzeSentiment(text: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> {
        const prompt = `Sentiment analizi yap: POSITIVE, NEUTRAL, NEGATIVE. Sadece kelimeyi yaz.\nMETİN: ${text.substring(0, 1000)}`;
        const res = await this.generate(prompt);
        if (!res) return 'NEUTRAL';
        if (res.includes('POSITIVE')) return 'POSITIVE';
        if (res.includes('NEGATIVE')) return 'NEGATIVE';
        return 'NEUTRAL';
    }

    async translate(text: string, targetLanguage: string): Promise<string | null> {
        const prompt = `Translate to ${targetLanguage}. ONLY output the translation.\nTEXT: ${text}`;
        return this.generate(prompt);
    }

    async testConnection(): Promise<{ success: boolean; message: string }> {
        const apiKey = await this.getApiKey();
        if (!apiKey) return { success: false, message: 'Gemini API Key bulunamadı.' };

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
            const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

            if (response.ok) return { success: true, message: 'Google Gemini bağlantısı başarılı.' };
            return { success: false, message: `Bağlantı hatası: ${response.status}` };
        } catch (error: any) {
            return { success: false, message: `Hata: ${error.message}` };
        }
    }

    /**
     * Lists available Gemini models for the given (or stored) API key.
     * Returns chat models and embed models separately, with a recommended default each.
     */
    async listModels(apiKeyOverride?: string, _baseUrlOverride?: string): Promise<ModelListResult> {
        const apiKey = apiKeyOverride || await this.getApiKey();
        if (!apiKey) return { chatModels: [], embedModels: [] };

        const RECOMMENDED_CHAT = 'models/gemini-2.5-flash';
        const RECOMMENDED_EMBED = 'models/gemini-embedding-2';

        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=100`;
            const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
            if (!response.ok) return { chatModels: [], embedModels: [] };

            const data: any = await response.json();
            const models: any[] = data.models ?? [];

            const chatModels = models
                .filter(m => (m.supportedGenerationMethods ?? []).includes('generateContent'))
                .map(m => ({
                    id: (m.name as string).replace('models/', ''),
                    displayName: m.displayName ?? m.name,
                    recommended: m.name === RECOMMENDED_CHAT,
                }))
                .sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));

            const embedModels = models
                .filter(m => (m.supportedGenerationMethods ?? []).includes('embedContent'))
                .map(m => ({
                    id: (m.name as string).replace('models/', ''),
                    displayName: m.displayName ?? m.name,
                    recommended: m.name === RECOMMENDED_EMBED,
                }))
                .sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));

            return { chatModels, embedModels };
        } catch (err: any) {
            this.logger.warn(`Failed to list Gemini models: ${err.message}`);
            return { chatModels: [], embedModels: [] };
        }
    }
}
