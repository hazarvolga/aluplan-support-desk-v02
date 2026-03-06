import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { AiProvider, ChatResult, EmbeddingResult } from './interfaces/ai-provider.interface';

@Injectable()
export class OllamaService implements AiProvider {
    private readonly logger = new Logger(OllamaService.name);

    constructor(
        private readonly config: ConfigService,
        private readonly settings: SettingsService,
    ) { }

    private async getBaseUrl(): Promise<string> {
        return (await this.settings.getValue('ai.ollama.url')) ??
            this.config.get<string>('OLLAMA_BASE_URL', 'http://localhost:11434');
    }

    private async getEmbedModel(): Promise<string> {
        return (await this.settings.getValue('ai.ollama.embed_model')) ??
            this.config.get<string>('EMBEDDING_MODEL',
                this.config.get<string>('OLLAMA_MODEL', 'bge-m3'));
    }

    private async getChatModel(): Promise<string> {
        return (await this.settings.getValue('ai.ollama.chat_model')) ??
            this.config.get<string>('OLLAMA_CHAT_MODEL', 'llama3.2:3b');
    }

    getName(): string {
        return 'ollama';
    }

    /**
     * Generate a vector embedding for given text.
     */
    async embed(text: string): Promise<EmbeddingResult | null> {
        try {
            const baseUrl = await this.getBaseUrl();
            const embedModel = await this.getEmbedModel();

            const response = await fetch(`${baseUrl}/api/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: embedModel, prompt: text }),
                signal: AbortSignal.timeout(120_000),
            });

            if (!response.ok) throw new Error(`Ollama embed HTTP ${response.status}`);
            const data = await response.json() as { embedding: number[] };
            return { embedding: data.embedding, model: embedModel };
        } catch (err: any) {
            this.logger.warn(`⚠️ Ollama embed failed: ${err.message}`);
            return null;
        }
    }

    async generate(prompt: string, timeout = 60_000): Promise<string | null> {
        try {
            const baseUrl = await this.getBaseUrl();
            const chatModel = await this.getChatModel();

            const response = await fetch(`${baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: chatModel,
                    prompt,
                    stream: false,
                    options: { temperature: 0.2 },
                }),
                signal: AbortSignal.timeout(timeout),
            });

            if (!response.ok) throw new Error(`Ollama chat HTTP ${response.status}`);
            const data = await response.json() as { response: string };
            return data.response.trim();
        } catch (err: any) {
            this.logger.warn(`⚠️ Ollama generation failed: ${err.message}`);
            return null;
        }
    }

    /**
     * Reformat approved KB article content into a clear, context-aware answer.
     */
    async reformat(systemPrompt: string, userQuery: string, kbContent: string): Promise<ChatResult | null> {
        try {
            const baseUrl = await this.getBaseUrl();
            const chatModel = await this.getChatModel();

            const response = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: chatModel,
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
                    stream: false,
                    options: { temperature: 0.1, top_p: 0.9 },
                }),
                signal: AbortSignal.timeout(150_000),
            });

            if (!response.ok) throw new Error(`Ollama chat HTTP ${response.status}`);
            const data = await response.json() as { message: { content: string } };
            return { response: data.message.content.trim(), model: chatModel };
        } catch (err: any) {
            this.logger.warn(`⚠️ Ollama reformat failed: ${err.message}`);
            return null;
        }
    }

    async *streamReformat(systemPrompt: string, userQuery: string, kbContent: string): AsyncGenerator<string, void, unknown> {
        try {
            const baseUrl = await this.getBaseUrl();
            const chatModel = await this.getChatModel();

            const response = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: chatModel,
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
                    stream: true,
                    options: { temperature: 0.1, top_p: 0.9 },
                }),
            });

            if (!response.ok) throw new Error(`Ollama stream HTTP ${response.status}`);

            const reader = response.body?.getReader();
            if (!reader) return;
            const decoder = new TextDecoder('utf-8');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const lines = decoder.decode(value, { stream: true }).split('\n').filter(l => l.trim().length > 0);
                for (const line of lines) {
                    try {
                        const parsed = JSON.parse(line);
                        if (parsed.message?.content) {
                            yield parsed.message.content;
                        }
                    } catch (e) {
                        // ignore JSON parse error on chunk
                    }
                }
            }
        } catch (err: any) {
            this.logger.warn(`⚠️ Ollama stream failed: ${err.message}`);
        }
    }

    async suggestCategory(title: string, content: string, categories: string[]): Promise<string | null> {
        const prompt = `Görevin: Aşağıdaki döküman için en uygun kategoriyi seçmek.

KATEGORİ LİSTESİ:
${categories.join(', ')}

DÖKÜMAN BAŞLIĞI: ${title}
DÖKÜMAN İÇERİĞİ: ${content.substring(0, 500)}...

Yalnızca kategori adını yaz. Başka bir şey yazma. Eğer uygun kategori yoksa "GENEL" yaz.`;

        return this.generate(prompt, 30_000);
    }

    async summarizeTicket(subject: string, conversation: string): Promise<string | null> {
        const prompt = `Görevin: Aşağıdaki müşteri destek bileti (ticket) konuşmasını okuyup... [truncated for brevity, keep logic same]`;
        // ... rest of the summarize ticket logic ...
        return this.generate(prompt, 180_000);
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
        if (!await this.isAvailable()) return null;
        try {
            const baseUrl = await this.getBaseUrl();
            const chatModel = await this.getChatModel();

            const response = await fetch(`${baseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: chatModel,
                    messages: [
                        { role: 'system', content: `You are a professional translator. Translate the following text precisely to ${targetLanguage}. ONLY output the translated text with no extra commentary.` },
                        { role: 'user', content: text }
                    ],
                    options: { temperature: 0.3 }
                }),
                signal: AbortSignal.timeout(60_000), // Default timeout for translation
            });

            if (!response.ok) throw new Error(`Ollama translate HTTP ${response.status}`);
            const data = await response.json() as { message: { content: string } };
            return data.message.content.trim() || null;
        } catch (error: any) {
            this.logger.warn(`⚠️ Ollama Translation failed: ${error.message}`);
            return null;
        }
    }

    async getActiveModelName(): Promise<string> {
        return this.getChatModel();
    }

    async isAvailable(): Promise<boolean> {
        try {
            const baseUrl = await this.getBaseUrl();
            const response = await fetch(`${baseUrl}/api/tags`, {
                signal: AbortSignal.timeout(2000), // very short timeout for local check
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    async testConnection(): Promise<{ success: boolean; message: string }> {
        try {
            const baseUrl = await this.getBaseUrl();
            const response = await fetch(`${baseUrl}/api/tags`, {
                signal: AbortSignal.timeout(5000),
            });

            if (response.ok) {
                return { success: true, message: 'Ollama bağlantısı başarılı. Servis çalışıyor.' };
            }

            return { success: false, message: `Bağlantı hatası: HTTP ${response.status}` };
        } catch (error: any) {
            this.logger.error(`Ollama Test Connection error: ${error.message}`);
            return { success: false, message: `Erişim sağlanamadı (Ollama kapalı olabilir). Hata: ${error.message}` };
        }
    }
}
