import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { AiPart, AiProvider, ChatResult, EmbeddingResult, ModelListResult } from './interfaces/ai-provider.interface';
import { mapPartsToOpenAi } from './utils/map-parts-to-openai';
import { cancelResponseBody, OutboundHttpService } from '../common/http/outbound-http.service';
import { AsyncLocalStorage } from 'node:async_hooks';

class ProviderHttpError extends Error {}

@Injectable()
export class GenericOpenAiService implements AiProvider {
    private readonly logger = new Logger(GenericOpenAiService.name);
    private readonly providerContext = new AsyncLocalStorage<string>();

    constructor(
        private readonly config: ConfigService,
        private readonly settings: SettingsService,
        private readonly outboundHttp: OutboundHttpService,
    ) { }

    forProvider(provider: 'custom' | 'xai' | 'deepseek' | 'groq'): AiProvider {
        const run = <T>(operation: () => T): T => this.providerContext.run(`ai.${provider}`, operation);
        return {
            embed: (text) => run(() => this.embed(text)),
            generate: (prompt, timeout) => run(() => this.generate(prompt, timeout)),
            reformat: (systemPrompt, userQuery, kbContent, attachments) => run(() => this.reformat(systemPrompt, userQuery, kbContent, attachments)),
            suggestCategory: (title, content, categories) => run(() => this.suggestCategory(title, content, categories)),
            summarizeTicket: (subject, conversation) => run(() => this.summarizeTicket(subject, conversation)),
            analyzeSentiment: (text) => run(() => this.analyzeSentiment(text)),
            translate: (text, targetLanguage) => run(() => this.translate(text, targetLanguage)),
            isAvailable: () => run(() => this.isAvailable()),
            testConnection: () => run(() => this.testConnection()),
            getName: () => provider,
            getActiveModelName: () => run(() => this.getActiveModelName()),
            listModels: (apiKey, baseUrl) => run(() => this.listModels(apiKey, baseUrl)),
        };
    }

    private get providerPrefix(): string {
        return this.providerContext.getStore() || 'ai.custom';
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
        if (this.hostnameMatches(baseUrl, 'groq.com')) return 'llama-3.3-70b-versatile';
        if (this.hostnameMatches(baseUrl, 'deepseek.com')) return 'deepseek-chat';
        if (this.hostnameMatches(baseUrl, 'x.ai') || this.hostnameMatches(baseUrl, 'grok.com')) return 'grok-2-latest';
        return 'gpt-4o-mini';
    }

    private hostnameMatches(baseUrl: string, domain: string): boolean {
        try {
            const hostname = new URL(baseUrl).hostname.toLowerCase();
            return hostname === domain || hostname.endsWith(`.${domain}`);
        } catch {
            return false;
        }
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
        if ((this.hostnameMatches(baseUrl, 'x.ai') || this.hostnameMatches(baseUrl, 'grok.com')) && !apiKey.startsWith('xai-')) {
            throw new BadRequestException(
                `Hatalı xAI API Anahtarı: Anahtarınız 'xai-' ile başlamalıdır. Görünüşe göre başka bir servis anahtarı (örneğin Groq) girilmiş olabilir.`
            );
        }
        if (this.hostnameMatches(baseUrl, 'groq.com') && !apiKey.startsWith('gsk_')) {
            throw new BadRequestException(
                `Hatalı Groq API Anahtarı: Anahtarınız 'gsk_' ile başlamalıdır. Görünüşe göre başka bir servis anahtarı (örneğin xAI) girilmiş olabilir.`
            );
        }
        if (this.hostnameMatches(baseUrl, 'deepseek.com') && !apiKey.startsWith('sk-')) {
            throw new BadRequestException(
                `Hatalı DeepSeek API Anahtarı: Anahtarınız 'sk-' ile başlamalıdır.`
            );
        }
    }

    getName(): string {
        return this.providerPrefix.replace('ai.', '');
    }

    private safeRequestId(response: Response): string | null {
        const candidate = response.headers.get('x-request-id')
            || response.headers.get('request-id')
            || response.headers.get('x-correlation-id');
        return candidate && /^[A-Za-z0-9._:-]{1,128}$/.test(candidate) ? candidate : null;
    }

    private httpDiagnostic(response: Response): string {
        const requestId = this.safeRequestId(response);
        return `provider=${this.getName()} HTTP ${response.status}${requestId ? ` requestId=${requestId}` : ''}`;
    }

    private safeFailureKind(error: unknown): string {
        const name = error instanceof Error ? error.name : 'UnknownError';
        return ['AbortError', 'TimeoutError', 'TypeError', 'Error'].includes(name) ? name : 'ProviderError';
    }

    private async providerHttpError(response: Response, baseUrl: string): Promise<Error> {
        const body = await response.text().catch(() => '');
        if (this.hostnameMatches(baseUrl, 'x.ai') && body.toLowerCase().includes('credits')) {
            return new BadRequestException(
                'xAI (Grok) hesabınızda kredi bulunmuyor. Lütfen console.x.ai/billing adresinden bakiye yükleyin.'
            );
        }
        return new ProviderHttpError(this.httpDiagnostic(response));
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

            const response = await this.outboundHttp.fetch(`${baseUrl}/embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({ model, input: text }),
                signal: AbortSignal.timeout(60_000),
            });

            if (!response.ok) {
                throw await this.providerHttpError(response as Response, baseUrl);
            }
            const data = await response.json();
            return { embedding: data.data[0].embedding, model };
        } catch (err: any) {
            if (err instanceof BadRequestException) throw err;
            const diagnostic = err instanceof ProviderHttpError
                ? err.message
                : `provider=${this.getName()} failure=${this.safeFailureKind(err)}`;
            this.logger.warn(`⚠️ Custom AI embed failed: ${diagnostic}`);
            throw err instanceof ProviderHttpError ? err : new Error(diagnostic);
        }
    }

    async generate(prompt: string | AiPart[], timeout = 30_000): Promise<string | null> {
        const baseUrl = await this.getBaseUrl();
        const apiKey = await this.getApiKey();
        const model = await this.getModel();

        if (!baseUrl || !apiKey) return null;

        try {
            this.validateApiKey(baseUrl, apiKey);

            // Use text-only shortcut when all parts are text; otherwise build multipart content array
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

            // Warn if image parts are sent to a known non-vision provider
            const NON_VISION_HOSTS = ['deepseek.com', 'groq.com'];
            const hasImages = Array.isArray(prompt) && prompt.some(p => p.inlineData || p.fileData);
            if (hasImages && NON_VISION_HOSTS.some(h => this.hostnameMatches(baseUrl, h))) {
                this.logger.warn(`⚠️ [${this.getName()}] Image parts included but model may not support vision`);
            }

            const response = await this.outboundHttp.fetch(`${baseUrl}/chat/completions`, {
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
                throw await this.providerHttpError(response as Response, baseUrl);
            }
            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (err: any) {
            if (err instanceof BadRequestException) throw err;
            const diagnostic = err instanceof ProviderHttpError
                ? err.message
                : `provider=${this.getName()} failure=${this.safeFailureKind(err)}`;
            this.logger.warn(`⚠️ Custom AI generate failed: ${diagnostic}`);
            throw err instanceof ProviderHttpError ? err : new Error(diagnostic);
        }
    }

    async reformat(systemPrompt: string, userQuery: string, kbContent: string, attachments?: AiPart[]): Promise<ChatResult | null> {
        const baseUrl = await this.getBaseUrl();
        const apiKey = await this.getApiKey();
        const model = await this.getModel();

        if (!baseUrl || !apiKey) return null;

        try {
            this.validateApiKey(baseUrl, apiKey);

            // Build multipart content array with image_url blocks for image attachments
            const attachmentBlocks = attachments && attachments.length > 0
                ? mapPartsToOpenAi(attachments, this.logger)
                : [];

            // Warn if image parts are sent to a known non-vision provider
            const NON_VISION_HOSTS = ['deepseek.com', 'groq.com'];
            const hasImages = attachmentBlocks.some(b => b.type === 'image_url');
            if (hasImages && NON_VISION_HOSTS.some(h => this.hostnameMatches(baseUrl, h))) {
                this.logger.warn(`⚠️ [${this.getName()}] Image parts included but model may not support vision`);
            }

            const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
                { type: 'text', text: `KULLANICI SORUSU:\n${userQuery}` },
                ...attachmentBlocks,
                {
                    type: 'text', text: `\n\n---\n\nONAYLI BİLGİ KAYNAĞI:\n${kbContent}\n\nAbove information source is official. Answer the user question logicially based ONLY on the source. Do not hallucinate.`
                }
            ];

            const response = await this.outboundHttp.fetch(`${baseUrl}/chat/completions`, {
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

            if (!response.ok) {
                throw await this.providerHttpError(response as Response, baseUrl);
            }
            const data = await response.json();
            const content = data.choices[0].message.content.trim();
            return { response: content, model };
        } catch (err: any) {
            if (err instanceof BadRequestException) throw err;
            const diagnostic = err instanceof ProviderHttpError
                ? err.message
                : `provider=${this.getName()} failure=${this.safeFailureKind(err)}`;
            this.logger.warn(`⚠️ Custom AI reformat failed: ${diagnostic}`);
            throw err instanceof ProviderHttpError ? err : new Error(diagnostic);
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
            const response = await this.outboundHttp.fetch(`${baseUrl}/chat/completions`, {
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
                throw await this.providerHttpError(response as Response, baseUrl);
            }
            const data = await response.json();
            return data.choices[0]?.message?.content?.trim() || null;
        } catch (error: any) {
            if (error instanceof BadRequestException) throw error;
            const diagnostic = error instanceof ProviderHttpError
                ? error.message
                : `provider=${this.getName()} failure=${this.safeFailureKind(error)}`;
            this.logger.error(`GenericOpenAI Translation API error: ${diagnostic}`);
            throw error instanceof ProviderHttpError ? error : new Error(diagnostic);
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

    async listModels(apiKeyOverride?: string, baseUrlOverride?: string): Promise<ModelListResult> {
        const EMPTY: ModelListResult = { chatModels: [], embedModels: [] };
        const apiKey = apiKeyOverride || await this.getApiKey();
        const baseUrl = baseUrlOverride || await this.getBaseUrl();
        if (!apiKey || !baseUrl) return EMPTY;

        const isGroq = this.hostnameMatches(baseUrl, 'groq.com');
        const RECOMMENDED_GROQ_CHAT = 'llama-3.3-70b-versatile';

        try {
            const response = await this.outboundHttp.fetch(`${baseUrl}/models`, {
                headers: { 'Authorization': `Bearer ${apiKey}` },
                signal: AbortSignal.timeout(8000),
            });
            if (!response.ok) {
                await cancelResponseBody(response as Response);
                return EMPTY;
            }

            const data: any = await response.json();
            const models: any[] = data.data ?? [];

            const chatModels = models.map(m => ({
                id: m.id as string,
                displayName: m.id as string,
                recommended: isGroq ? m.id === RECOMMENDED_GROQ_CHAT : false,
            })).sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));

            return { chatModels, embedModels: [] };
        } catch (err: any) {
            this.logger.warn(`Failed to list models: provider=${this.getName()} failure=${this.safeFailureKind(err)}`);
            return EMPTY;
        }
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
            const response = await this.outboundHttp.fetch(`${baseUrl}/models`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
                signal: AbortSignal.timeout(10_000),
            });

            if (response.ok) {
                await cancelResponseBody(response as Response);
                return { success: true, message: 'Bağlantı başarılı.' };
            }

            const responseBody = await response.text().catch(() => '');
            const requestId = this.safeRequestId(response as Response);
            const requestSuffix = requestId ? ` İstek kimliği: ${requestId}.` : '';

            if (response.status === 401) {
                return { success: false, message: `Yetkisiz (401). API Key hatalı olabilir.${requestSuffix}` };
            }
            if (response.status === 429 || responseBody.toLowerCase().includes('credits')) {
                return { success: false, message: `Kota/Bakiye yetersiz. Faturalandırmayı kontrol edin.${requestSuffix}` };
            }

            return { success: false, message: `Sağlayıcı isteği başarısız (HTTP ${response.status}).${requestSuffix}` };

        } catch (error: any) {
            if (error instanceof BadRequestException) {
                return { success: false, message: error.message };
            }

            this.logger.error(`Generic Test Connection error: provider=${this.getName()} failure=${this.safeFailureKind(error)}`);
            if (error.name === 'AbortError' || error.name === 'TimeoutError') {
                return { success: false, message: 'Bağlantı zaman aşımına uğradı. Base URL yanlış olabilir.' };
            }
            return { success: false, message: 'Erişim sağlanamadı: sağlayıcı isteği başarısız.' };
        }
    }
}
