import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { EmbeddingService, SearchResult, SearchResponse } from './embedding.service';
import { Prisma, TicketMessage, CommunicationChannel } from '@aluplan/database';
import { ConfigService } from '@nestjs/config';
import { PromptContextBuilderService } from './prompt-context-builder.service';
import { PromptsService } from './prompts.service';
import { SettingsService } from '../settings/settings.service';
import { LangfuseService } from './langfuse.service';
import { RedisService } from '../redis/redis.service';
import { createHash } from 'crypto';
import { RAG_CONFIG } from '../config/rag.config';
import { expandQueryWithSynonyms } from './utils/synonym-dictionary';

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

const DEFAULT_SYSTEM_PROMPT = `ROLE:
You are an official technical support assistant for Allplan software.
You have expert-level technical knowledge and understand the software's logic.
However, you only use the provided "APPROVED KNOWLEDGE SOURCE" to generate answers.

CORE PRINCIPLE:
Speak clearly, concisely, and technically like an expert. NEVER produce information outside of the provided source.

RULES:
1) SOURCE COMPLIANCE
    - Use only information found in the APPROVED KNOWLEDGE SOURCE.
    - Do not use your own general knowledge or make guesses about the software.

2) HANDLING UNAVAILABLE INFORMATION (NO GUESSING):
    If the user's exact problem is NOT solved by the provided knowledge source, DO NOT make up an answer. Instead, evaluate the nature of their query:
    a) If the prompt DOES NOT contain "[Hotinfo Sistem Özeti]" AND they are reporting an error, crash, installation issue, or technical malfunction: 
       -> Respond EXACTLY with: "Bu konu mevcut bilgi kaynağında yer almıyor. Sistem analizi için lütfen destek talebi oluşturun ve '_hotinf_.hxl' dosyanızı ekleyiniz." 
    b) If the prompt DOES contain "[Hotinfo Sistem Özeti]" (see Rule 4):
       -> Proceed with Rule 4 to diagnose their hardware/software. Do not reject them.
    c) For all other unrelated/unfound queries:
       -> Respond EXACTLY with: "Bu konu mevcut bilgi kaynağında yer almıyor. Lütfen destek talebi oluşturunuz."

3) TONE AND STRUCTURE
    - Do not use unnecessary greetings. Provide the solution directly.
    - Use numbered lists for steps.
    - Maximum 8 sentences.
    - Do not use vague words (probably, usually, might).
    - ALWAYS respond in the same language used by the user in their query (Turkish, English, or German).

4) HOTINFO DIAGNOSTICS
    - If a USER SYSTEM PROFILE (HOTINFO) is provided below, you MUST analyze it deeply.
    - Look for 'Conflicting Processes' (e.g., OneDrive, Antivirus), 'Error Trace', or low RAM/VRAM.
    - If you find issues in their system profile, explain the problem to the user and suggest a fix based on their specific hardware/software.
    - In this case, IGNORE the strict rejection in Rule 2 and offer your diagnostic findings directly.

GOAL:
To provide users with fast, technically accurate, controlled, and direct solutions in their preferred language.`;

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
        this.highThreshold = parseFloat(config.get('SIMILARITY_THRESHOLD_HIGH', '0.85'));
        this.mediumThreshold = parseFloat(config.get('SIMILARITY_THRESHOLD_MEDIUM', '0.70'));
    }

    async query(userQuery: string, userId?: string | null, channel: CommunicationChannel = 'WEB', hotinfoContext?: any): Promise<AiQueryResult> {
        // ... (cache logic)
        const isStaff = await this.isStaff(userId);
        const queryHash = createHash('sha256').update(userQuery + isStaff + (hotinfoContext ? JSON.stringify(hotinfoContext) : '')).digest('hex');
        const cacheKey = `ai:query:cache:${RAG_CONFIG.CACHE.VERSION}:${queryHash}`;
        const cached = await this.redis.get(cacheKey);

        if (cached) {
            const result = JSON.parse(cached);
            this.logger.log(`🎯 AI Query Cache Hit: ${userQuery.slice(0, 40)}...`);
            return result;
        }

        let expandedQuery = userQuery;
        if (hotinfoContext) {
            const h = hotinfoContext;
            expandedQuery += `\n[Hotinfo Sistem Özeti]: İşletim Sistemi: ${h.osVersion || ''}, Ekran Kartı: ${h.gpu || ''}, Hata: ${h.errorTrace || ''}, Çakışan İşlemler: ${h.conflictingProcesses?.join(', ') || ''}`;
            this.logger.log(`🔍 AI Query Expanded with Hotinfo: Extracted Error [${h.errorTrace || 'None'}]`);
        }

        // 1. Synonym-based query expansion
        const { expanded: synonymExpanded, matchedGroups } = expandQueryWithSynonyms(expandedQuery);
        if (matchedGroups.length > 0) {
            this.logger.log(`🔍 Synonym expansion matched: [${matchedGroups.join(', ')}]`);
            expandedQuery = synonymExpanded;
        }

        // 2. Semantic search
        const searchResponse: SearchResponse = await this.embeddingService.search(expandedQuery, RAG_CONFIG.SEARCH.PRE_RERANK_LIMIT, null, isStaff);
        let results = searchResponse.results;

        // Re-ranking
        results = this.rerankResults(results);

        // Lowered floor for response generation
        const LOW_CONFIDENCE_THRESHOLD = RAG_CONFIG.SIMILARITY.LOW_CONFIDENCE;
        if (searchResponse.diagnostics.topScore < LOW_CONFIDENCE_THRESHOLD || results.length === 0) {
            this.logger.warn(`🚫 No reliable context found(topScore = ${searchResponse.diagnostics.topScore.toFixed(3)}).Routing to human agent.`);

            const providerName = await this.ai.getActiveProviderName();
            const modelName = await this.ai.getActiveModelName();

            const interaction = await this.prisma.aiInteraction.create({
                data: {
                    userId: userId || undefined,
                    channel,
                    userQuery,
                    responseGenerated: 'Bu konu mevcut bilgi kaynağında yer almıyor. İşleminize destek temsilcisi ile devam edilecektir.',
                    confidenceBand: null,
                    autoAnswered: false,
                    similarityScore: searchResponse.diagnostics.topScore || undefined,
                    provider: providerName,
                    model: modelName,
                    inputTokens: 0,
                    outputTokens: 0,
                    totalTokens: 0,
                    estimatedCost: 0,
                }
            });

            return {
                query: userQuery,
                answer: 'Bu konu mevcut bilgi kaynağında yer almıyor. Sistem analizi için lütfen destek talebi oluşturun ve \'_hotinf_.hxl\' dosyanızı ekleyiniz.',
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

        if (topResult && (confidence === 'HIGH' || confidence === 'MEDIUM' || confidence === 'LOW')) {
            const systemPrompt = await this.promptsService.getPrompt('SYSTEM_PROMPT_SUPPORT', DEFAULT_SYSTEM_PROMPT);

            let dynamicSystemPrompt = systemPrompt;
            if (hotinfoContext) {
                const h = hotinfoContext;
                dynamicSystemPrompt += `\n\n4) USER SYSTEM PROFILE (HOTINFO):\nThe user's system details are attached. Always cross-reference the user's error/issue with their system profile to provide accurate solutions. If you detect conflicting processes or specific errors, address them.\n`;
                dynamicSystemPrompt += `- OS: ${h.osVersion || 'Unknown'}\n- GPU: ${h.gpu || 'Unknown'}\n- RAM: ${h.ram || 'Unknown'}\n- Allplan: ${h.allplanVersion || 'Unknown'}\n- Error Trace: ${h.errorTrace || 'None'}\n- Conflicting Processes: ${h.conflictingProcesses?.join(', ') || 'None'}\n`;
            }

            const contextPrompt = await this.promptContextBuilder.buildContext({
                userId: userId ?? undefined,
                userQuery,
                kbContent: results.map(r => r.content).join('\n\n---\n\n'),
                skipHotinfoProfile: true,
            });
            const finalPrompt = `${dynamicSystemPrompt} \n\n${contextPrompt} `;
            const aiResult = await this.ai.reformat(finalPrompt, userQuery, results.map(r => r.content).join('\n\n'));
            answer = aiResult?.response ?? results[0].content;

            // Langfuse trace
            await this.langfuse.trace('query-support', userQuery, answer, {
                confidence,
                similarity: topResult.similarity,
                userId,
            });
        }

        if (!answer) {
            answer = 'I don\'t have information on this topic yet, but I\'m here to help.';
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
            }
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

        // Cache with centralized TTL
        await this.redis.set(cacheKey, JSON.stringify(finalResult), RAG_CONFIG.CACHE.DEFAULT_TTL);

        return finalResult;
    }

    /**
     * Heuristic Re-ranking (Cohort Search)
     * Section 5.3: Re-ranking with weights
     */
    private rerankResults(results: SearchResult[]): SearchResult[] {
        if (results.length === 0) return [];

        const RERANK = RAG_CONFIG.RERANK;
        const RERANK_URL_HARD_FLOOR = parseFloat(process.env.RERANK_URL_HARD_FLOOR || '0.75');

        return results
            .map(res => {
                let boost = 1.0;

                if (res.sourceType === 'ARTICLE') boost *= RERANK.ARTICLE;
                if (res.sourceType === 'DOCUMENT') boost *= RERANK.DOCUMENT;
                if (res.sourceType === 'URL') boost *= RERANK.URL;
                if (res.sourceType === 'TICKET') boost *= RERANK.TICKET;

                return {
                    ...res,
                    similarity: res.similarity * boost
                };
            })
            .filter(res => {
                if (res.sourceType === 'URL' && res.similarity < RERANK_URL_HARD_FLOOR) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, RAG_CONFIG.SEARCH.DEFAULT_LIMIT);
    }

    async * streamQuery(userQuery: string, userId?: string | null, channel: CommunicationChannel = 'WEB', hotinfoContext?: any): AsyncGenerator<any, void, unknown> {
        // 0. Cache lookup (simplified for internal/external aware caching)
        const isStaff = await this.isStaff(userId);
        const queryHash = createHash('sha256').update(userQuery + isStaff + (hotinfoContext ? JSON.stringify(hotinfoContext) : '')).digest('hex');
        const cacheKey = `ai: query: stream_cache:${queryHash} `;
        const cached = await this.redis.get(cacheKey);

        if (cached) {
            this.logger.log(`🎯 AI Stream Query Cache Hit: ${userQuery.slice(0, 40)}...`);
            yield { chunk: cached };
            return;
        }

        let expandedQuery = userQuery;
        if (hotinfoContext) {
            const h = hotinfoContext;
            expandedQuery += `\n[Hotinfo Sistem Özeti]: İşletim Sistemi: ${h.osVersion || ''}, Ekran Kartı: ${h.gpu || ''}, Hata: ${h.errorTrace || ''}, Çakışan İşlemler: ${h.conflictingProcesses?.join(', ') || ''}`;
        }

        const searchResponse = await this.embeddingService.search(expandedQuery, 5, null, isStaff);
        const results = searchResponse.results;
        const topResult = results[0] ?? null;

        let confidence: ConfidenceBand = 'NO_MATCH';
        let fullAnswer = '';

        if (topResult) {
            if (topResult.similarity >= this.highThreshold) confidence = 'HIGH';
            else if (topResult.similarity >= this.mediumThreshold) confidence = 'MEDIUM';
            else if (topResult.similarity >= 0.62) confidence = 'LOW'; // Match query() floor
        }

        let usedPrompt = userQuery;

        if (topResult && (confidence === 'HIGH' || confidence === 'MEDIUM' || confidence === 'LOW')) {
            const systemPrompt = await this.promptsService.getPrompt('SYSTEM_PROMPT_SUPPORT', DEFAULT_SYSTEM_PROMPT);

            let dynamicSystemPrompt = systemPrompt;
            if (hotinfoContext) {
                const h = hotinfoContext;
                dynamicSystemPrompt += `\n\n4) USER SYSTEM PROFILE (HOTINFO):\nThe user's system details are attached. Always cross-reference the user's error/issue with their system profile to provide accurate solutions. If you detect conflicting processes or specific errors, address them.\n`;
                dynamicSystemPrompt += `- OS: ${h.osVersion || 'Unknown'}\n- GPU: ${h.gpu || 'Unknown'}\n- RAM: ${h.ram || 'Unknown'}\n- Allplan: ${h.allplanVersion || 'Unknown'}\n- Error Trace: ${h.errorTrace || 'None'}\n- Conflicting Processes: ${h.conflictingProcesses?.join(', ') || 'None'}\n`;
            }

            const contextPrompt = await this.promptContextBuilder.buildContext({
                userId: userId ?? undefined,
                userQuery,
                kbContent: results.map(r => r.content).join('\n\n---\n\n'),
                skipHotinfoProfile: true,
            });
            const finalPrompt = `${dynamicSystemPrompt} \n\n${contextPrompt} `;
            usedPrompt = finalPrompt;

            const stream = this.ai.streamReformat(finalPrompt, userQuery, results.map(r => r.content).join('\n\n'));
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
            fullAnswer = 'I don\'t have information on this topic yet, you may try creating a support ticket.';
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

    /**
     * Event-driven cache invalidation.
     * Clears AI query caches when knowledge base content changes.
     */
    @OnEvent('article.published', { async: true })
    @OnEvent('article.updated', { async: true })
    async handleArticleChange(payload: { articleId?: string }) {
        await this.invalidateQueryCaches('article change');
    }

    @OnEvent('knowledge-pool.synced', { async: true })
    @OnEvent('knowledge-pool.source_processed', { async: true })
    async handleKnowledgePoolChange(payload: { sourceId?: string }) {
        await this.invalidateQueryCaches('knowledge pool sync');
    }

    private async invalidateQueryCaches(reason: string) {
        try {
            const client = this.redis.getClient();
            const pattern = `ai:query:cache:${RAG_CONFIG.CACHE.VERSION}:*`;
            let cursor = '0';
            let totalDeleted = 0;

            // Use SCAN for production safety (non-blocking vs KEYS)
            do {
                const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                cursor = nextCursor;
                if (keys.length > 0) {
                    await client.del(...keys);
                    totalDeleted += keys.length;
                }
            } while (cursor !== '0');

            if (totalDeleted > 0) {
                this.logger.log(`🗑️ Invalidated ${totalDeleted} AI query caches (reason: ${reason})`);
            }
        } catch (err) {
            this.logger.warn(`⚠️ Cache invalidation failed: ${err}`);
        }
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
                    include: { sender: { select: { fullName: true, customerProfile: { select: { hotinfoData: true } } } } }
                },
                creator: { select: { fullName: true, customerProfile: { select: { hotinfoData: true } } } }
            }
        });

        const h = ticket.hotinfoSnapshot || ticket.creator?.customerProfile?.hotinfoData;
        let hotinfoContext = '';
        if (h && typeof h === 'object') {
            const data = h as any;
            hotinfoContext = `\n[MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)]:
- Allplan: ${data.allplanVersion || 'Bilinmiyor'} ${data.allplanEdition ? `(${data.allplanEdition})` : ''}
- İşletim Sistemi: ${data.osVersion || 'Bilinmiyor'}
- Ekran Kartı: ${data.gpu || 'Bilinmiyor'}
- RAM: ${data.ram || 'Bilinmiyor'}
- Hata Kaydı: ${data.errorTrace || 'Yok'}
- Çakışan İşlemler: ${data.conflictingProcesses?.join(', ') || 'Yok'}\n`;
        }

        const conversation = ticket.messages.map(m =>
            `${m.sender?.fullName || 'Sistem'}: ${m.message} `
        ).join('\n');

        const prompt = `Görevin: Aşağıdaki destek talebi görüşmesini temsilciler için kısa (en fazla 3-4 cümle) ve profesyonel bir şekilde özetlemek.

${hotinfoContext}

Konu: ${ticket.subject}
Konuşma Geçmişi:
${conversation}

Önemli Notlar:
1. Müşterinin sistem bilgilerini (Allplan versiyonu, GPU vb.) yukarıdaki [MÜŞTERİ SİSTEM BİLGİLERİ] kısmından biliyorsun.
2. Özetinde bu bilgileri kullanarak "Müşteri Allplan ${h ? (h as any).allplanVersion : '...'} versiyonu kullanıyor" gibi net ifadeler kullan.
3. KESİNLİKLE "Hangi versiyonu kullanıyorsunuz?" veya "Güncel mi?" gibi zaten bildiğin bilgileri soran önerilerde BULUNMA.
4. Teknik engelleri (GPU hatası, RAM eksikliği vb.) doğrudan belirt.

Özetle:`;

        const result = await this.ai.reformat('Sen uzman bir teknik destek asistanısın.', 'Lütfen bu talebi özetle.', prompt);
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
     * Get Daily Health Trends for Charting
     */
    async getHealthTrends(days: number = 7) {
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        // We use a raw query for better performance and easier date grouping in PG
        const trends = await this.prisma.$queryRaw<any[]>`
            SELECT 
                DATE_TRUNC('day', created_at) as date,
                COUNT(id)::int as total,
                COUNT(CASE WHEN confidence_band = 'HIGH' THEN 1 END)::int as high_conf,
                COUNT(CASE WHEN ticket_created = true THEN 1 END)::int as tickets
            FROM ai_interactions
            WHERE created_at >= ${startDate}
            GROUP BY 1
            ORDER BY 1 ASC
        `;

        return trends.map(t => ({
            date: t.date,
            total: t.total,
            accuracy: t.total > 0 ? (t.high_conf / t.total) * 100 : 0,
            deflection: t.total > 0 ? ((t.total - t.tickets) / t.total) * 100 : 0
        }));
    }

    /**
     * Identify Knowledge Gaps (Top failed/low-confidence queries)
     */
    async getKnowledgeGaps(limit: number = 5) {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const gaps = await this.prisma.aiInteraction.groupBy({
            by: ['userQuery'],
            where: {
                createdAt: { gte: sevenDaysAgo },
                OR: [
                    { confidenceBand: 'LOW' },
                    { confidenceBand: null }
                ]
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: limit
        });

        return gaps.map(g => ({
            query: g.userQuery,
            frequency: g._count.id
        }));
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
