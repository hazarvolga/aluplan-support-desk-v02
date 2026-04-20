import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../settings/settings.service';
import { AiPart, AiProvider, ChatResult, EmbeddingResult } from './interfaces/ai-provider.interface';
import { VertexAI } from '@google-cloud/vertexai';

@Injectable()
export class VertexAiService implements AiProvider {
    private readonly logger = new Logger(VertexAiService.name);
    private vertexAi: VertexAI | null = null;
    private initialized = false;

    constructor(
        private readonly config: ConfigService,
        private readonly settings: SettingsService,
    ) { }

    private async getCredentials(): Promise<{ projectId: string, location: string, dataStoreId: string, authOptions: any }> {
        const projectId = await this.settings.getValue('ai.vertex.project_id') || this.config.get<string>('gcp.projectId') || process.env.GOOGLE_CLOUD_PROJECT;
        const location = await this.settings.getValue('ai.vertex.location') || this.config.get<string>('gcp.region') || 'europe-west4';
        const dataStoreId = await this.settings.getValue('ai.vertex.data_store_id') || this.config.get<string>('gcp.dataStoreId') || process.env.GCP_DATA_STORE_ID;
        const credentialsJson = await this.settings.getValue('ai.vertex.credentials_json');

        const authOptions: any = { scopes: 'https://www.googleapis.com/auth/cloud-platform' };
        if (credentialsJson) {
            try {
                authOptions.credentials = JSON.parse(credentialsJson);
            } catch (e) {
                this.logger.warn(`Failed to parse Vertex credentials JSON: ${e.message}`);
            }
        }

        return { projectId: projectId || '', location, dataStoreId: dataStoreId || '', authOptions };
    }

    private async initClient(): Promise<VertexAI | null> {
        if (this.initialized && this.vertexAi) return this.vertexAi;

        try {
            const { projectId, location, authOptions } = await this.getCredentials();

            if (!projectId) {
                this.logger.warn('⚠️ Vertex AI initialized without explicit GCP_PROJECT_ID. Relying on implicit ADC credentials.');
            }

            const vertexOptions: any = { project: projectId || 'auto-resolved', location };
            if (authOptions.credentials) {
                vertexOptions.googleAuthOptions = authOptions;
            }

            this.vertexAi = new VertexAI(vertexOptions);
            this.initialized = true;
            return this.vertexAi;
        } catch (error) {
            this.logger.error(`❌ Failed to initialize Vertex AI client: ${error.message}`);
            return null;
        }
    }

    private async getChatModel(): Promise<string> {
        return (await this.settings.getValue('ai.vertex.chat_model')) || 'gemini-1.5-pro-preview-0409';
    }

    private async getEmbedModel(): Promise<string> {
        // Allowing configuration for the smoke test between 004 and 002
        return (await this.settings.getValue('ai.vertex.embed_model')) || 'text-multilingual-embedding-002';
    }

    getName(): string {
        return 'vertex';
    }

    async embed(text: string): Promise<EmbeddingResult | null> {
        // NOTE: As of current @google-cloud/vertexai, embeddings aren't exposed cleanly through the Gemini-focused SDK in older versions,
        // so we often fallback to REST API with Google Auth if the VertexAI class lacks an explicit .getGenerativeModel({ model: 'text-embedding...' }) method.
        // Google recently added getGenerativeModel for embedding models in newer SDK versions, but we'll use raw fetch with Google Auth if SDK fails.
        const { projectId: project, location, authOptions } = await this.getCredentials();
        let accessToken = null;
        try {
            const { GoogleAuth } = require('google-auth-library');
            const auth = new GoogleAuth(authOptions);
            const client = await auth.getClient();
            accessToken = (await client.getAccessToken()).token;
        } catch (e) {
            this.logger.error(`GCP Auth Failed: ${e.message}`);
            return null;
        }
        const model = await this.getEmbedModel();

        if (!project || !accessToken) return null;

        try {
            const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:predict`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instances: [{ content: text }],
                }),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const data = await response.json();

            // Dimensionality Compatibility for pgvector(1536)
            // Vertex AI models typically output 768 dimensions.
            // Zero-padding preserves the exact same vector magnitude and dot product,
            // meaning Cosine Similarity remains 100% mathematically mathematically accurate
            // while satisfying the strict Postgres 1536-dimension column constraints.
            let vector = data.predictions[0].embeddings.values as number[];
            if (vector.length < 1536) {
                const padded = new Array(1536).fill(0);
                for (let i = 0; i < vector.length; i++) {
                    padded[i] = vector[i];
                }
                vector = padded;
            }

            return {
                embedding: vector,
                model
            };
        } catch (error) {
            this.logger.warn(`⚠️ Vertex AI Embed failed: ${error.message}`);
            return null;
        }
    }

    private async discoverProjectId(): Promise<string | null> {
        try {
            const { GoogleAuth } = require('google-auth-library');
            const auth = new GoogleAuth({ scopes: 'https://www.googleapis.com/auth/cloud-platform' });
            return await auth.getProjectId();
        } catch {
            return null;
        }
    }

    private mapParts(parts: string | AiPart[]): any[] {
        if (typeof parts === 'string') {
            return [{ text: parts }];
        }
        return parts.map(p => {
            if (p.inlineData) {
                return { inlineData: p.inlineData };
            }
            if (p.fileData) {
                return { fileData: { mimeType: p.fileData.mimeType, fileUri: p.fileData.fileUri } };
            }
            if (p.fileUri) {
                return { fileData: { mimeType: 'image/jpeg', fileUri: p.fileUri } };
            }
            return { text: p.text || '' };
        });
    }

    async generate(prompt: string | AiPart[], timeout = 30_000): Promise<string | null> {
        const client = await this.initClient();
        if (!client) return null;

        try {
            const modelName = await this.getChatModel();
            const generativeModel = client.getGenerativeModel({
                model: modelName,
                generationConfig: { temperature: 0.2 },
            });

            const parts = this.mapParts(prompt);

            const result = await Promise.race([
                generativeModel.generateContent({ contents: [{ role: 'user', parts }] }),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
            ]) as any;

            return result.response?.candidates?.[0]?.content?.parts?.[0]?.text || null;
        } catch (err: any) {
            this.logger.error(`❌ Vertex AI generate failed: ${err.message}`, err.stack);
            throw new Error(`Vertex AI generate error: ${err.message}`);
        }
    }

    async reformat(systemPrompt: string, userQuery: string, kbContent: string, attachments?: AiPart[]): Promise<ChatResult | null> {
        const client = await this.initClient();
        if (!client) return null;

        try {
            const modelName = await this.getChatModel();

            // Vision Guardrails explicitly prepended
            const strictSystemPrompt = `Görseldeki metni veya hata kodunu tam okuyamazsan (bulanık veya eksikse) asla tahmin etme, kullanıcıdan daha net bir ekran görüntüsü iste.\n\n${systemPrompt}`;

            const generativeModel = client.getGenerativeModel({
                model: modelName,
                systemInstruction: { role: 'system', parts: [{ text: strictSystemPrompt }] },
                generationConfig: { temperature: 0.1 },
            });

            const userMessageParts: any[] = [
                { text: `KULLANICI SORUSU:\n${userQuery}` }
            ];

            if (attachments && attachments.length > 0) {
                userMessageParts.push(...this.mapParts(attachments));
            }

            userMessageParts.push({ text: `\n\n---\n\nONAYLI BİLGİ KAYNAĞI:\n${kbContent}\n\nYukarıdaki bilgi kaynağına dayanarak teknik bir dille özetle ve doğrudan soruyu yanıtla.` });

            const result = await generativeModel.generateContent({ contents: [{ role: 'user', parts: userMessageParts }] });
            return {
                response: result.response?.candidates?.[0]?.content?.parts?.[0]?.text || '',
                model: modelName
            };
        } catch (err: any) {
            this.logger.warn(`⚠️ Vertex AI reformat failed: ${err.message}`);
            return null;
        }
    }

    async *streamReformat(systemPrompt: string, userQuery: string, kbContent: string, attachments?: AiPart[]): AsyncGenerator<string, void, unknown> {
        const client = await this.initClient();
        if (!client) {
            yield "Vertex AI initialization failed.";
            return;
        }

        try {
            const modelName = await this.getChatModel();
            const strictSystemPrompt = `Görseldeki metni veya hata kodunu tam okuyamazsan (bulanık veya eksikse) asla tahmin etme, kullanıcıdan daha net bir ekran görüntüsü iste.\n\n${systemPrompt}`;

            const generativeModel = client.getGenerativeModel({
                model: modelName,
                systemInstruction: { role: 'system', parts: [{ text: strictSystemPrompt }] },
                generationConfig: { temperature: 0.1 },
            });

            const userMessageParts: any[] = [
                { text: `KULLANICI SORUSU:\n${userQuery}` }
            ];

            if (attachments && attachments.length > 0) {
                userMessageParts.push(...this.mapParts(attachments));
            }

            userMessageParts.push({ text: `\n\n---\n\nONAYLI BİLGİ KAYNAĞI:\n${kbContent}` });

            const streamingResp = await generativeModel.generateContentStream({ contents: [{ role: 'user', parts: userMessageParts }] });
            for await (const item of streamingResp.stream) {
                if (item.candidates && item.candidates[0] && item.candidates[0].content.parts[0].text) {
                    yield item.candidates[0].content.parts[0].text;
                }
            }
        } catch (err: any) {
            this.logger.warn(`⚠️ Vertex AI stream failed: ${err.message}`);
            yield "Google Vertex AI stream error.";
        }
    }

    async suggestCategory(title: string, content: string, categories: string[]): Promise<string | null> {
        const prompt = `Görevin: Aşağıdaki döküman için en uygun kategoriyi seçmek.
KATEGORİ LİSTESİ: ${categories.join(', ')}
DÖKÜMAN BAŞLIĞI: ${title}
DÖKÜMAN İÇERİĞİ: ${content.substring(0, 500)}...
Yalnızca kategori adını yaz. Başka bir şey yazma. Eğer uygun kategori yoksa "GENEL" yaz.`;
        return this.generate(prompt);
    }

    async summarizeTicket(subject: string, conversation: string): Promise<string | null> {
        const prompt = `Aşağıdaki destek bileti konuşmasını profesyonelce özetle.
KONUŞMA BAŞLIĞI: ${subject}
KONUŞMA GEÇMİŞİ: ${conversation.substring(0, 3000)}`;
        return this.generate(prompt);
    }

    async analyzeSentiment(text: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> {
        const prompt = `Görevin: Aşağıdaki metnin duygusunu (sentiment) analiz edip, sonuç olarak 'POSITIVE', 'NEUTRAL' veya 'NEGATIVE' kelimelerinden sadece birini yazmak.
METİN:
${text.substring(0, 1000)}
SONUÇ (YALNIZCA KELİME):`;
        const result = await this.generate(prompt);
        if (!result) return 'NEUTRAL';
        const cleanResult = result.toUpperCase().trim();
        if (cleanResult.includes('POSITIVE')) return 'POSITIVE';
        if (cleanResult.includes('NEGATIVE')) return 'NEGATIVE';
        return 'NEUTRAL';
    }

    async translate(text: string, targetLanguage: string): Promise<string | null> {
        const prompt = `You are a professional translator. Translate the following text precisely to ${targetLanguage}. ONLY output the translated text with no extra commentary.

TEXT:
${text}`;
        return this.generate(prompt);
    }

    async searchDataStore(query: string): Promise<any[]> {
        const { projectId: project, location, dataStoreId, authOptions } = await this.getCredentials();

        if (!project || !dataStoreId) {
            this.logger.debug('Vertex Data Store Search skipped: No GCP_DATA_STORE_ID configured.');
            return [];
        }

        let accessToken = null;
        try {
            const { GoogleAuth } = require('google-auth-library');
            const auth = new GoogleAuth(authOptions);
            const client = await auth.getClient();
            accessToken = (await client.getAccessToken()).token;
        } catch (e) {
            this.logger.error(`GCP Auth Failed for Data Store: ${e.message}`);
            return [];
        }

        try {
            const url = `https://discoveryengine.googleapis.com/v1beta/projects/${project}/locations/${location}/collections/default_collection/dataStores/${dataStoreId}/servingConfigs/default_search:search`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query,
                    pageSize: 5,
                }),
            });

            if (!response.ok) {
                this.logger.warn(`Vertex Search failed: ${await response.text()}`);
                return [];
            }

            const data = await response.json();
            if (!data.results) return [];

            return data.results.map((res: any) => {
                // Extract snippets or derived content natively from Google Search Engine
                const snippet = res.document?.derivedStructData?.snippets?.[0]?.snippet || '';
                const title = res.document?.structData?.title || res.document?.name || 'Vertex Document';
                return {
                    articleId: res.document?.id || 'vertex-doc',
                    sourceType: 'DOCUMENT',
                    title,
                    content: snippet,
                    similarity: 0.85, // Assigned high confidence for Google-managed search results
                    confidence: 'HIGH'
                };
            });
        } catch (error) {
            this.logger.warn(`⚠️ Vertex Data Store Search failed: ${error.message}`);
            return [];
        }
    }

    async getActiveModelName(): Promise<string> {
        return this.getChatModel();
    }

    async isAvailable(): Promise<boolean> {
        const { projectId } = await this.getCredentials();
        return !!projectId;
    }

    async testConnection(): Promise<{ success: boolean; message: string }> {
        const { projectId, dataStoreId, authOptions } = await this.getCredentials();
        this.logger.debug(`Testing Vertex Connection: Project=${projectId}, DataStore=${dataStoreId}, HasCredentials=${!!authOptions.credentials}`);

        if (!projectId) {
            return { success: false, message: 'GCP_PROJECT_ID veya Application Default Credentials bulunamadı.' };
        }

        try {
            // Simple embedding test as connection check
            const res = await this.embed("connection test");
            if (res) return { success: true, message: 'Google Vertex AI bağlantısı başarılı.' };
            return { success: false, message: 'Bağlantı başarısız oldu. Lütfen Credentials JSON ve Project ID bilgilerini kontrol edin.' };
        } catch (e: any) {
            return { success: false, message: `Hata: ${e.message}` };
        }
    }
}
