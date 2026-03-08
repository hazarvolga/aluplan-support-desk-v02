import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { EmbeddingService, SearchResult, SearchResponse } from './embedding.service';
import { TicketStatus, TicketPriority, Prisma, TicketMessage, KnowledgeSourceType, CommunicationChannel } from '@aluplan/database';
import { ConfigService } from '@nestjs/config';
import { PromptContextBuilderService } from './prompt-context-builder.service';
import { PromptsService } from './prompts.service';
import { SettingsService } from '../settings/settings.service';
import { LangfuseService } from './langfuse.service';
import { RedisService } from '../redis/redis.service';
import { createHash } from 'crypto';

// Confidence bands — LOW/HIGH/MEDIUM from schema, NO_MATCH is local
export type ConfidenceBand = 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_MATCH';

export interface AiQueryResult {
    query: string;
    answer: string | null;
    confidence: ConfidenceBand;
    sources: Array<{ articleId: string; title: string; similarity: number }>;
    interactionId: string;
    suggestTicket: boolean;
}

const DEFAULT_SYSTEM_PROMPT = `ROL:
Sen Allplan yazılımı konusunda uzman seviyesinde bilgiye sahip resmi teknik destek asistanısın.
Teknik terminolojiye hakimsin ve yazılımın mantığını bilirsin.
Ancak cevap üretirken yalnızca sana verilen "ONAYLI BİLGİ KAYNAĞI" içeriğini kullanırsın.

TEMEL PRENSİP:
Uzman gibi açık, net ve teknik konuş.ASLA kaynak dışı bilgi üretme.

    KURALLAR:

1) KAYNAK ZORUNLULUĞU
    - Yanıt üretirken sadece ONAYLI BİLGİ KAYNAĞI'nda bulunan bilgileri kullan.
        - Kendi genel bilgi birikimini kullanma, yazılım hakkında tahmin yürütme.

2) HALLUCINATION KORUMASI VE KISMİ EŞLEŞME
    - Eğer kullanıcı sorusu kaynakta hiç geçmiyorsa SADECE şunu yaz: "Bu konu mevcut bilgi kaynağında yer almıyor. Lütfen destek talebi oluşturunuz."
        - Eğer sorunun yalnızca bir bölümü kaynakta yer alıyorsa, sadece doğrulanabilir kısmı yanıtla ve geri kalanı için destek talebi oluşturmasını tavsiye et.Kesinlikle eksik kısmı tahmin etme.

3) UZMAN TONU VE YANIT YAPISI
    - Gereksiz selamlama kullanma.Doğrudan çözümü ver.
- İşlem adımları varsa numaralı liste kullan.
- Maksimum 8 cümle kur.Gereksiz açıklama yapma.
- Belirsiz kelimeler(muhtemelen, genellikle, olabilir) kullanma.

4) ÖZETLEME VE SENTEZ(KRİTİK)
    - Kaynak metnin tamamını ASLA kopyalama.
- Sorulan sorunun cevabını bul ve kendi teknik cümlelerinle kısa bir özet çıkar.
- Yanıtı verirken kaynağın en can alıcı kısmını seç ve sentezle.

    AMAÇ:
Kullanıcıya hızlı, teknik olarak doğru, kontrollü ve doğrudan bir çözüm sunmak.`;

@Injectable()
export class AiQueryService {
    private readonly logger = new Logger(AiQueryService.name);
    private readonly highThreshold: number;
    private readonly mediumThreshold: number;

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
        private readonly embeddingService: EmbeddingService,
        private readonly config: ConfigService,
        private readonly promptContextBuilder: PromptContextBuilderService,
        private readonly promptsService: PromptsService,
        private readonly settings: SettingsService,
        private readonly langfuse: LangfuseService,
        private readonly redis: RedisService,
    ) {
        this.highThreshold = parseFloat(config.get('SIMILARITY_THRESHOLD_HIGH', '0.90'));
        this.mediumThreshold = parseFloat(config.get('SIMILARITY_THRESHOLD_MEDIUM', '0.75'));
    }

    async query(userQuery: string, userId?: string | null, channel: CommunicationChannel = 'WEB'): Promise<AiQueryResult> {
        // 0. Cache lookup (simplified for internal/external aware caching)
        const isStaff = await this.isStaff(userId);
        const queryHash = createHash('sha256').update(userQuery + isStaff).digest('hex');
        const cacheKey = `ai: query: cache:${queryHash} `;
        const cached = await this.redis.get(cacheKey);

        if (cached) {
            const result = JSON.parse(cached);
            this.logger.log(`🎯 AI Query Cache Hit: ${userQuery.slice(0, 40)}...`);
            return result;
        }

        // 1. Semantic search with role-based filtering
        const searchResponse: SearchResponse = await this.embeddingService.search(userQuery, 10, null, isStaff);
        let results = searchResponse.results;

        // 3. Re-ranking Phase (Section 5: Hybrid Retrieval Engine)
        results = this.rerankResults(results, userQuery);

        // CHANGE 5: No-match hard floor — if topScore < LOW_CONFIDENCE_THRESHOLD, do NOT call LLM
        const LOW_CONFIDENCE_THRESHOLD = parseFloat(process.env.LOW_CONFIDENCE_THRESHOLD || '0.72');
        if (searchResponse.diagnostics.topScore < LOW_CONFIDENCE_THRESHOLD || results.length === 0) {
            this.logger.warn(`🚫 No reliable context found(topScore = ${searchResponse.diagnostics.topScore.toFixed(3)}).Routing to human agent.`);

            const providerName = await this.ai.getActiveProviderName();
            const modelName = await this.ai.getActiveModelName();

            const interaction = await this.prisma.aiInteraction.create({
                data: {
                    userId,
                    channel,
                    userQuery,
                    responseGenerated: 'AI güvenilir bir kaynak bulamadı. Talep insan temsilciye yönlendirildi.',
                    confidenceBand: null,
                    autoAnswered: false,
                    similarityScore: searchResponse.diagnostics.topScore || undefined,
                    provider: providerName,
                    model: modelName,
                    inputTokens: 0,
                    outputTokens: 0,
                    totalTokens: 0,
                    estimatedCost: 0,
                } as any
            });

            return {
                query: userQuery,
                answer: 'Bu konuda güvenilir bir kaynak bulunamadı. Talebiniz bir destek temsilcisine yönlendirilecektir.',
                confidence: 'NO_MATCH' as ConfidenceBand,
                sources: [],
                interactionId: interaction.id,
                suggestTicket: true,
            };
        }

        // 2. Determine confidence band
        const topResult = results[0] ?? null;
        let confidence: ConfidenceBand = 'NO_MATCH';
        let answer: string | null = null;

        if (topResult) {
            if (topResult.similarity >= this.highThreshold) confidence = 'HIGH';
            else if (topResult.similarity >= this.mediumThreshold) confidence = 'MEDIUM';
            else confidence = 'LOW';
        }

        if (topResult && (confidence === 'HIGH' || confidence === 'MEDIUM')) {
            const systemPrompt = await this.promptsService.getPrompt('SYSTEM_PROMPT_SUPPORT', DEFAULT_SYSTEM_PROMPT);
            const contextPrompt = await this.promptContextBuilder.buildContext({
                userId,
                userQuery,
                kbContent: topResult.content,
            });
            const finalPrompt = `${systemPrompt} \n\n${contextPrompt} `;
            const aiResult = await this.ai.reformat(finalPrompt, userQuery, topResult.content);
            answer = aiResult?.response ?? topResult.content;

            // Langfuse trace
            await this.langfuse.trace('query-support', userQuery, answer, {
                confidence,
                similarity: topResult.similarity,
                userId,
            });
        }

        if (!answer) {
            answer = 'Bu konuda henüz bilgim yok ama yardım etmek için buradayım.';
        }

        const inputStr = userQuery;
        const inputTokens = Math.ceil(inputStr.length / 4);
        const outputTokens = Math.ceil(answer.length / 4);
        const totalTokens = inputTokens + outputTokens;
        const estimatedCost = (inputTokens * 0.00000015) + (outputTokens * 0.0000006);

        // 4. Log interaction
        // R-R1: If top trust_score < 0.4, suggest ticket (Confidence LOW or NO_MATCH usually implies this)
        // We also check the actual similarity * trust_score if possible, but status-based confidence is the current implementation.
        const topTrustScore = results[0]?.similarity || 0; // Simplified trust score check
        const suggestTicket = confidence === 'NO_MATCH' || confidence === 'LOW' || topTrustScore < 0.4;

        const providerName = await this.ai.getActiveProviderName();
        const modelName = await this.ai.getActiveModelName();

        const interaction = await this.prisma.aiInteraction.create({
            data: {
                userId,
                channel,
                userQuery,
                responseGenerated: answer,
                confidenceBand: confidence === 'NO_MATCH' ? null : (confidence as 'HIGH' | 'MEDIUM' | 'LOW'),
                autoAnswered: !suggestTicket,
                similarityScore: topResult?.similarity,
                matchedArticleId: topResult?.sourceType === 'ARTICLE' ? topResult.articleId : undefined,
                provider: providerName,
                model: modelName,
                inputTokens,
                outputTokens,
                totalTokens,
                estimatedCost
            } as any
        });

        this.logger.log(
            `🤖 AI Query: "${userQuery.slice(0, 60)}" → ${confidence} (${topResult?.similarity?.toFixed(3) ?? 'n/a'})[Src: ${topResult?.sourceType}]`,
        );

        const finalResult: AiQueryResult = {
            query: userQuery,
            answer,
            confidence,
            sources: isStaff ? results.slice(0, 3).map((r) => ({
                articleId: r.articleId,
                title: r.title,
                similarity: r.similarity,
            })) : [],
            interactionId: interaction.id,
            suggestTicket,
        };

        // Cache for 1 hour
        await this.redis.set(cacheKey, JSON.stringify(finalResult), 3600);

        return finalResult;
    }

    /**
     * Heuristic Re-ranking (Cohort Search)
     * Section 5.3: Re-ranking with weights
     */
    private rerankResults(results: SearchResult[], query: string): SearchResult[] {
        if (results.length === 0) return [];

        const RERANK_ARTICLE = parseFloat(process.env.RERANK_MULTIPLIER_ARTICLE || '1.30');
        const RERANK_DOCUMENT = parseFloat(process.env.RERANK_MULTIPLIER_DOCUMENT || '1.15');
        const RERANK_URL = parseFloat(process.env.RERANK_MULTIPLIER_URL || '0.60');
        const RERANK_URL_HARD_FLOOR = parseFloat(process.env.RERANK_URL_HARD_FLOOR || '0.75');

        return results
            .map(res => {
                let boost = 1.0;

                if (res.sourceType === 'ARTICLE') boost *= RERANK_ARTICLE;
                if (res.sourceType === 'DOCUMENT') boost *= RERANK_DOCUMENT;
                if (res.sourceType === 'URL') boost *= RERANK_URL;

                return {
                    ...res,
                    similarity: res.similarity * boost
                };
            })
            // CHANGE 3: Hard exclusion for URL sources below floor
            .filter(res => {
                if (res.sourceType === 'URL' && res.similarity < RERANK_URL_HARD_FLOOR) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5);
    }

    async *streamQuery(userQuery: string, userId?: string | null): AsyncGenerator<any, void, unknown> {
        // 0. Cache lookup (simplified for internal/external aware caching)
        const isStaff = await this.isStaff(userId);
        const queryHash = createHash('sha256').update(userQuery + isStaff).digest('hex');
        const cacheKey = `ai: query: stream_cache:${queryHash} `;
        const cached = await this.redis.get(cacheKey);

        if (cached) {
            this.logger.log(`🎯 AI Stream Query Cache Hit: ${userQuery.slice(0, 40)}...`);
            yield { chunk: cached };
            return;
        }

        const searchResponse = await this.embeddingService.search(userQuery, 5, null, isStaff);
        const results = searchResponse.results;
        const topResult = results[0] ?? null;
        // ... rest of logic stays same ...

        let confidence: ConfidenceBand = 'NO_MATCH';
        let fullAnswer = '';

        if (topResult) {
            if (topResult.similarity >= this.highThreshold) confidence = 'HIGH';
            else if (topResult.similarity >= this.mediumThreshold) confidence = 'MEDIUM';
            else confidence = 'LOW';
        }

        let usedPrompt = userQuery;

        if (topResult && (confidence === 'HIGH' || confidence === 'MEDIUM')) {
            const systemPrompt = await this.promptsService.getPrompt('SYSTEM_PROMPT_SUPPORT', DEFAULT_SYSTEM_PROMPT);
            const contextPrompt = await this.promptContextBuilder.buildContext({
                userId,
                userQuery,
                kbContent: topResult.content,
            });
            const finalPrompt = `${systemPrompt} \n\n${contextPrompt} `;
            usedPrompt = finalPrompt;

            const stream = this.ai.streamReformat(finalPrompt, userQuery, topResult.content);
            for await (const chunk of stream) {
                fullAnswer += chunk;
                yield { chunk };
            }

            // Langfuse trace for stream (after completion)
            await this.langfuse.trace('query-support-stream', userQuery, fullAnswer, {
                confidence,
                similarity: topResult.similarity,
                userId,
            });
        } else {
            fullAnswer = 'Bu konuda henüz bilgim yok, bir destek talebi oluşturmayı deneyebilirsiniz.';
            yield { chunk: fullAnswer };
        }

        const inputStr = usedPrompt;
        const inputTokens = Math.ceil(inputStr.length / 4);
        const outputTokens = Math.ceil(fullAnswer.length / 4);
        const totalTokens = inputTokens + outputTokens;

        // Rough estimate based on generic models (e.g. gpt-4o-mini equivalents)
        const estimatedCost = (inputTokens * 0.00000015) + (outputTokens * 0.0000006);

        const providerName = await this.ai.getActiveProviderName();
        const modelName = await this.ai.getActiveModelName();

        const interaction = await this.prisma.aiInteraction.create({
            data: {
                userId,
                userQuery,
                responseGenerated: fullAnswer,
                confidenceBand: confidence === 'NO_MATCH' ? null : (confidence as 'HIGH' | 'MEDIUM' | 'LOW'),
                matchedArticleId: topResult?.sourceType === 'ARTICLE' ? topResult.articleId : undefined,
                similarityScore: topResult ? topResult.similarity : undefined,
                autoAnswered: confidence === 'HIGH' || confidence === 'MEDIUM',
                provider: providerName,
                model: modelName,
                inputTokens,
                outputTokens,
                totalTokens,
                estimatedCost
            },
        });

        // Cache for 1 hour
        await this.redis.set(cacheKey, fullAnswer, 3600);

        yield { done: true, interactionId: interaction.id, suggestTicket: confidence === 'LOW' || confidence === 'NO_MATCH' };
    }

    private async isStaff(userId?: string | null): Promise<boolean> {
        if (!userId) return false;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: { select: { name: true } } }
        });

        if (!user || !user.role) return false;
        // Staff are all roles except customer
        return user.role.name !== 'customer';
    }
    @OnEvent('ai.translate_message', { async: true })
    async handleTranslationRequest(payload: { ticketId: string; messageId: string; targetLanguage: string }) {
        try {
            const message = await this.prisma.ticketMessage.findUnique({ where: { id: payload.messageId } });
            if (!message) return;

            const translated = await this.ai.translate(message.message, payload.targetLanguage);
            if (translated) {
                const currentMetadata = (message.metadata as any) || {};
                await this.prisma.ticketMessage.update({
                    where: { id: message.id },
                    data: {
                        metadata: {
                            ...currentMetadata,
                            translations: {
                                ...(currentMetadata.translations || {}),
                                [payload.targetLanguage]: translated
                            }
                        }
                    }
                });
                this.logger.log(`🌍 Translated message ${message.id} to ${payload.targetLanguage} `);
            }
        } catch (error: any) {
            this.logger.error(`❌ Translation failed for message ${payload.messageId}`, error.stack);
        }
    }
    @OnEvent('ticket.message_added', { async: true })
    async handleAutoTranslate(event: { ticket: any; message: TicketMessage }) {
        const enabled = await this.settings.getValue('ai.auto_translate.enabled');
        if (enabled?.toString() === 'true') {
            const targetLang = (await this.settings.getValue('ai.auto_translate.target_lang')) || 'en';
            await this.handleTranslationRequest({
                ticketId: event.ticket.id,
                messageId: event.message.id,
                targetLanguage: targetLang
            });
        }
    }

    async submitFeedback(
        interactionId: string,
        userId: string,
        rating: number,
        comment?: string,
    ) {
        return this.prisma.interactionFeedback.create({
            data: {
                interactionId,
                userId,
                rating,
                comment,
                isHelpful: rating >= 4,
            },
        });
    }

    async submitTelemetry(interactionId: string, accepted: boolean, editedResponse?: string) {
        return this.prisma.aiInteraction.update({
            where: { id: interactionId },
            data: {
                isAccepted: accepted,
                editedResponse: editedResponse
            },
        });
    }

    async getTelemetryMetrics(channel?: CommunicationChannel) {
        const where: Prisma.AiInteractionWhereInput = channel ? { channel } : {};

        const globalMetrics = await this.prisma.aiInteraction.aggregate({
            where,
            _sum: {
                inputTokens: true,
                outputTokens: true,
                totalTokens: true,
                estimatedCost: true
            },
            _count: {
                id: true
            }
        });

        const providersList = await this.prisma.aiInteraction.groupBy({
            by: ['provider', 'model'],
            where,
            _sum: {
                inputTokens: true,
                outputTokens: true,
                totalTokens: true,
                estimatedCost: true
            },
            _count: {
                id: true
            }
        });

        const channelBreakdown = await this.prisma.aiInteraction.groupBy({
            by: ['channel'],
            _sum: {
                totalTokens: true,
                estimatedCost: true
            },
            _count: {
                id: true
            }
        });

        return {
            global: globalMetrics,
            providers: providersList.map(p => ({
                provider: p.provider || 'unknown',
                model: p.model || 'unknown',
                metrics: {
                    inputTokens: p._sum.inputTokens || 0,
                    outputTokens: p._sum.outputTokens || 0,
                    totalTokens: p._sum.totalTokens || 0,
                    estimatedCost: p._sum.estimatedCost || 0,
                    requests: p._count.id || 0
                }
            })),
            channels: channelBreakdown.map(c => ({
                channel: c.channel,
                requests: c._count.id,
                tokens: Number(c._sum.totalTokens || 0),
                cost: Number(c._sum.estimatedCost || 0)
            }))
        };
    }

    async getPendingForReview(limit = 50): Promise<any[]> {
        return this.prisma.aiInteraction.findMany({
            where: {
                confidenceBand: 'LOW',
            },
            include: {
                user: { select: { id: true, fullName: true } },
                feedbacks: { select: { rating: true, comment: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    async summarizeTicket(ticketId: string): Promise<string> {
        const ticket = await this.prisma.ticket.findUniqueOrThrow({
            where: { id: ticketId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    include: { sender: { select: { fullName: true } } }
                }
            }
        });

        const conversation = ticket.messages.map(m =>
            `${m.sender?.fullName || 'Sistem'}: ${m.message} `
        ).join('\n');

        const prompt = `Görevin: Aşağıdaki destek talebi yazışmalarını ajanlar için kısa(en fazla 3 - 4 cümle) ve profesyonel şekilde özetlemek.
    Konu: ${ticket.subject}
Yazışmalar:
${conversation}

Özetle ve en kritik noktaları belirt: `;

        const result = await this.ai.reformat('', 'Lütfen bu talebi özetle.', prompt);
        return result?.response ?? 'Özet oluşturulamadı.';
    }

    /**
     * Hibrit RAG Mimarisi
     * Analyzes incoming ticket subject/description against:
     * 1. Static Product Categories
     * 2. Past high-rated tickets (Option A + C implementation)
     */
    async smartTagTicket(productId: string, text: string, hotinfoContext?: any): Promise<{ tags: string[] }> {
        try {
            const product = await this.prisma.product.findUnique({
                where: { id: productId },
                include: { categories: true }
            });

            if (!product || product.categories.length === 0) return { tags: [] };

            const pastMatches = await this.embeddingService.searchTickets(text, 2);
            const kbSearchResponse = await this.embeddingService.search(text, 2);
            const kbMatches = kbSearchResponse.results;
            let contextStr = '';

            if (pastMatches.length > 0) {
                contextStr += '\nBENZER GEÇMİŞ BİLETLER:\n' + pastMatches.map(m => `- ${m.subject} `).join('\n');
            }
            if (kbMatches.length > 0) {
                contextStr += '\nBİLGİ HAVUZU REFERANSLARI:\n' + kbMatches.map(m => `- ${m.title} `).join('\n');
            }

            if (hotinfoContext) {
                const h = hotinfoContext;
                contextStr += `\nMÜŞTERİ SİSTEM BİLGİLERİ(HOTINFO): `;
                contextStr += `\n - Allplan: ${h.allplanVersion}${h.allplanEdition ? ` (${h.allplanEdition})` : ''}${h.allplanHotfix ? ` Hotfix: ${h.allplanHotfix}` : ''} `;
                contextStr += `\n - OS: ${h.osVersion} `;
                contextStr += `\n - CPU: ${h.cpu} `;
                contextStr += `\n - GPU: ${h.gpu}${h.gpuDriverVersion ? ` (Driver: ${h.gpuDriverVersion})` : ''}${h.openglVersion ? ` OpenGL: ${h.openglVersion}` : ''} `;
                contextStr += `\n - RAM: ${h.ram}${h.vram ? ` | VRAM: ${h.vram}` : ''} `;
                if (h.screenResolution) contextStr += `\n - Çözünürlük: ${h.screenResolution} `;
                if (h.diskInfo) contextStr += `\n - Disk: ${h.diskInfo} `;
                if (h.licenseType) contextStr += `\n - Lisans: ${h.licenseType} `;
                if (h.dotnetVersion) contextStr += `\n - .NET: ${h.dotnetVersion} `;
                if (h.installedModules?.length) contextStr += `\n - Modüller: ${h.installedModules.join(', ')} `;
                contextStr += '\n';
            }

            const allowedTags = product.categories.map((c: { name: string }) => c.name);
            const prompt = `Görevin: Aşağıdaki Müşteri Destek talebini analiz edip, İZİN VERİLEN KATEGORİLER listesinden EN UYGUN OLANI seçmek.
İZİN VERİLEN KATEGORİLER:
${allowedTags.join(', ')}
${contextStr}
MÜŞTERİ TALEBİ:
${text.substring(0, 1000)}
SADECE en uygun kategori adını yaz.Hiçbiri uymuyorsa "GENEL" yaz.`;

            const result = await this.ai.reformat('Sen akıllı bir etiketleme asistanısın. Sadece tek kelime/kalıp dönersin.', 'Analiz et', prompt);

            if (result?.response) {
                const suggested = result.response.trim();
                const isValid = allowedTags.some((t: string) => t.toLowerCase() === suggested.toLowerCase());
                if (isValid) {
                    const originalTag = allowedTags.find((t: string) => t.toLowerCase() === suggested.toLowerCase());
                    return { tags: [originalTag!] };
                }
            }
            return { tags: [] };
        } catch (error: any) {
            this.logger.error(`Error in smartTagTicket: ${error.message} `);
            return { tags: [] };
        }
    }

    async logSearchInteraction(query: string, userId?: string, results: SearchResult[] = [], productId?: string | null, isStaff = false, channel: CommunicationChannel = 'WEB') {
        const topResult = results[0] ?? null;

        const providerName = await this.ai.getActiveProviderName();
        const modelName = await this.ai.getActiveModelName();

        return this.prisma.aiInteraction.create({
            data: {
                userId,
                channel,
                productId,
                userQuery: query,
                confidenceBand: topResult ? (topResult.confidence as any) : null,
                matchedArticleId: topResult?.sourceType === 'ARTICLE' ? topResult.articleId : undefined,
                similarityScore: topResult ? topResult.similarity : undefined,
                autoAnswered: false, // This was just a search
                provider: providerName,
                model: modelName,
                userContext: { type: 'WIZARD_SEARCH', resultCount: results.length, isStaff }
            },
        });
    }

    /**
     * Get AI System Health Metrics (Option C Implementation)
     */
    async getHealthMetrics() {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [totalInteractions, ticketCreations, confidenceStats] = await Promise.all([
            this.prisma.aiInteraction.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            this.prisma.aiInteraction.count({ where: { createdAt: { gte: thirtyDaysAgo }, ticketCreated: true } }),
            this.prisma.aiInteraction.groupBy({
                by: ['confidenceBand'],
                where: { createdAt: { gte: thirtyDaysAgo } },
                _count: { id: true }
            })
        ]);

        // Deflection Rate: Interaksiyonlardan bilete dönüşmeyenlerin oranı
        const deflectionRate = totalInteractions > 0
            ? ((totalInteractions - ticketCreations) / totalInteractions) * 100
            : 0;

        const highConf = confidenceStats.find(s => s.confidenceBand === 'HIGH')?._count.id || 0;
        const aiAccuracy = totalInteractions > 0
            ? (highConf / totalInteractions) * 100
            : 0;

        return {
            period: '30d',
            totalInteractions,
            ticketCreations,
            deflectionRate: Math.round(deflectionRate * 10) / 10,
            aiAccuracy: Math.round(aiAccuracy * 10) / 10,
            confidenceDistribution: confidenceStats.map(s => ({
                band: s.confidenceBand || 'NO_MATCH',
                count: s._count.id
            }))
        };
    }

    /**
     * Get counts for the 4 Source Pillars (PDF, Admin, URL, Ticket)
     * as defined in FAQ_Self_Learing_mimarisi.MD
     */
    async getSourcesStats() {
        const [filesCount, articlesCount, urlsCount, learnedCount] = await Promise.all([
            this.prisma.knowledgeSource.count({
                where: { type: { in: ['FILE_PDF', 'FILE_TXT', 'FILE_MD', 'FILE_CSV'] } }
            }),
            this.prisma.knowledgeArticle.count({
                where: { status: 'PUBLISHED' }
            }),
            this.prisma.knowledgeSource.count({
                where: { type: 'URL' }
            }),
            this.prisma.faqEntry.count({
                where: { status: 'PUBLISHED' }
            })
        ]);

        const pendingFaqs = await this.prisma.faqEntry.count({
            where: { status: 'PENDING_REVIEW' }
        });

        return {
            pillars: {
                DOCUMENTS: filesCount,
                ARTICLES: articlesCount,
                URLS: urlsCount,
                TICKETS: learnedCount
            },
            pendingFaqs,
            totalSources: filesCount + articlesCount + urlsCount + learnedCount
        };
    }
}
