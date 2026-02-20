import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmbeddingResult {
    embedding: number[];
    model: string;
}

export interface ChatResult {
    response: string;
    model: string;
}

@Injectable()
export class OllamaService {
    private readonly logger = new Logger(OllamaService.name);
    private readonly baseUrl: string;
    private readonly embedModel: string;
    private readonly chatModel: string;

    constructor(private readonly config: ConfigService) {
        this.baseUrl = config.get<string>('OLLAMA_BASE_URL', 'http://localhost:11434');
        this.embedModel = config.get<string>('OLLAMA_MODEL', 'nomic-embed-text');
        this.chatModel = config.get<string>('OLLAMA_CHAT_MODEL', 'llama3.2:3b');
    }

    /**
     * Generate a vector embedding for given text.
     * Returns null on failure (graceful degradation — system falls back to keyword search).
     */
    async embed(text: string): Promise<EmbeddingResult | null> {
        try {
            const response = await fetch(`${this.baseUrl}/api/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: this.embedModel, prompt: text }),
                signal: AbortSignal.timeout(10_000),
            });

            if (!response.ok) throw new Error(`Ollama embed HTTP ${response.status}`);
            const data = await response.json() as { embedding: number[] };
            return { embedding: data.embedding, model: this.embedModel };
        } catch (err: any) {
            this.logger.warn(`⚠️ Ollama embed failed (graceful degradation): ${err.message}`);
            return null;
        }
    }

    /**
     * Reformat approved KB article content into a clear, context-aware answer.
     * AI only reformats — it does NOT make up new information.
     */
    async reformat(systemPrompt: string, userQuery: string, kbContent: string): Promise<ChatResult | null> {
        try {
            const prompt = `${systemPrompt}\n\n---\nONAYLI BİLGİ KAYNAGI:\n${kbContent}\n\n---\nKULLANICI SORUSU:\n${userQuery}\n\nYUKARIDAKİ ONAYLI BİLGİYE DAYANARAK YANIT VER. Bilgi dışına çıkma.`;

            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.chatModel,
                    prompt,
                    stream: false,
                    options: { temperature: 0.1, top_p: 0.9 }, // Low temp = controlled output
                }),
                signal: AbortSignal.timeout(30_000),
            });

            if (!response.ok) throw new Error(`Ollama chat HTTP ${response.status}`);
            const data = await response.json() as { response: string };
            return { response: data.response.trim(), model: this.chatModel };
        } catch (err: any) {
            this.logger.warn(`⚠️ Ollama reformat failed: ${err.message}`);
            return null;
        }
    }

    async suggestCategory(title: string, content: string, categories: string[]): Promise<string | null> {
        try {
            const prompt = `Görevin: Aşağıdaki döküman için en uygun kategoriyi seçmek.

KATEGORİ LİSTESİ:
${categories.join(', ')}

DÖKÜMAN BAŞLIĞI: ${title}
DÖKÜMAN İÇERİĞİ: ${content.substring(0, 500)}...

Yalnızca kategori adını yaz. Başka bir şey yazma. Eğer uygun kategori yoksa "GENEL" yaz.`;

            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.chatModel,
                    prompt,
                    stream: false,
                    options: { temperature: 0 },
                }),
                signal: AbortSignal.timeout(15_000),
            });

            if (!response.ok) throw new Error(`Ollama HTTP ${response.status}`);
            const data = await response.json() as { response: string };
            return data.response.trim();
        } catch (err: any) {
            this.logger.warn(`⚠️ Ollama category suggestion failed: ${err.message}`);
            return null;
        }
    }

    /**
     * Option C: Synthesize a raw ticket conversation into a formal KB article formatting, with PII masked.
     */
    async summarizeTicket(subject: string, conversation: string): Promise<string | null> {
        try {
            const prompt = `Görevin: Aşağıdaki müşteri destek bileti (ticket) konuşmasını okuyup, diğer müşterilerin faydalanabileceği resmi ve anlaşılır bir "Nasıl Yapılır" (How-To) veya "Sık Sorulan Soru" (FAQ) makalesi haline getirmektir.
        
KURALLAR:
1. Kişisel verileri (isim, e-posta, IP adresi, şifre) kesinlikle maskele ([GİZLENDİ] yaz).
2. Sadece teknik çözüme odaklan. "Merhaba, nasılsınız" gibi gereksiz konuşmaları at.
3. Çıktıyı şu formatta ver: 
Soru: [Sorunu tek cümlede özetle]
Cevap: [Adım adım çözüm]

KONUŞMA BAŞLIĞI: ${subject}
KONUŞMA GEÇMİŞİ:
${conversation.substring(0, 3000)}`; // limit content to prevent context blown

            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.chatModel,
                    prompt,
                    stream: false,
                    options: { temperature: 0.1 },
                }),
                signal: AbortSignal.timeout(60_000),
            });

            if (!response.ok) throw new Error(`Ollama chat HTTP ${response.status}`);
            const data = await response.json() as { response: string };
            return data.response.trim();
        } catch (err: any) {
            this.logger.warn(`⚠️ Ollama ticket summarization failed: ${err.message}`);
            return null;
        }
    }

    async isAvailable(): Promise<boolean> {
        try {
            const res = await fetch(`${this.baseUrl}/api/tags`, { signal: AbortSignal.timeout(3_000) });
            return res.ok;
        } catch {
            return false;
        }
    }
}
