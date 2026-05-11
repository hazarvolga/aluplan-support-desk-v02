import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { AiPart } from './interfaces/ai-provider.interface';
import { EmbeddingService, SearchResult, SearchResponse } from './embedding.service';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma, TicketMessage, CommunicationChannel, ConfidenceBand } from '@aluplan/database';
import { ConfigService } from '@nestjs/config';
import { PromptContextBuilderService } from './prompt-context-builder.service';
import { PromptsService } from './prompts.service';
import { SettingsService } from '../settings/settings.service';
import { LangfuseService } from './langfuse.service';
import { RedisService } from '../redis/redis.service';
import { RAG_CONFIG } from '../config/rag.config';
import { expandQueryWithSynonyms } from './utils/synonym-dictionary';
import { RagObservabilityService } from './rag-observability.service';
import { AiDiagnosisService, DiagnosisResult } from './ai-diagnosis.service';
import { createHash } from 'crypto';

// local type with NO_MATCH
export type LocalConfidenceBand = 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_MATCH';

export interface AiQueryOptions {
    userQuery: string;
    userId?: string | null;
    channel?: CommunicationChannel;
    hotinfoContext?: any;
    attachments?: any[];
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    language?: string; // tr, en, de or auto
    productId?: string | null;
    wait?: boolean;
}

export interface AiQueryResult {
    query: string;
    answer: string | null;
    confidence: LocalConfidenceBand;
    sources: Array<{ articleId: string; title: string; similarity: number }>;
    interactionId: string;
    suggestTicket: boolean;
    translations?: Record<string, string>;
    diagnosis?: DiagnosisResult;
}

export const MASTER_DIAGNOSIS_PROMPT = `
You are a senior AI system designer and technical support architect specializing in engineering software ecosystems.
You are powering an intelligent support ticket diagnosis engine.

Your job is NOT just to answer — but to reach a technical diagnosis using the 7-STEP engine below.

---

## STEP 1 — CONTEXT ANALYSIS
- Analyze the FULL conversation history.
- Identify the LAST user message (the active query).
- Detect if the problem has changed from previous messages.
- Internal check: problem_shift (true/false).
- Rule: If problem_shift = true → IGNORE old problem context.

## STEP 2 — CLASSIFICATION
Using [TECHNICAL DIAGNOSIS] metadata:
- Product: {{PRODUCT}}
- Category: {{CATEGORIES}}
- Keywords: {{KEYWORDS}}

## STEP 3 — KNOWLEDGE VALIDATION
- CRITICAL RULE: Check if the provided [CONTEXT] actually contains technical information about "{{PRODUCT}}".
- If {{PRODUCT}} is "GENERIC" or "Unknown" AND the context is unrelated, proceed to STEP 6 with a "No Knowledge" state.
- DO NOT hallucinate features from other software (like Allplan) if the user is asking about a different product.

## STEP 4 — PROBLEM TYPE DETECTION
Map symptoms to a specific problem type (e.g., licensing_failure, fem_mesh_instability, crash_on_startup).

## STEP 5 — ROOT CAUSE GENERATION
Based on Product, Problem Type, and [ATTACHMENTS] or [KULLANICI EKLERİ İÇERİĞİ]:
- If image attachments exist, ANALYZE THEM for errors, UI messages, or structural cues.
- If parsed document texts (PDF/DOCX/Logs) exist, EXTRACT technical clues, error stack traces, and configurations directly from the text.
- If hardware query and [MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)] missing: ASK user for OS/GPU/RAM.
- If no specific technical knowledge exists in [CONTEXT] for {{PRODUCT}}: State this clearly and ask for logs or specific details.
- Generate the MOST LIKELY causes for this context.
- Explain WHY it happens (technical depth required).

## STEP 6 — PRIORITIZATION & REPORTING
Sort causes by likelihood (1 = highest).
Generate a PROFESSIONAL, EXPERT-LEVEL diagnostic report.
- Focus ONLY on the current problem.
- Be technical (NOT generic).
- Provide ordered troubleshooting steps.
- Provide a validation checklist.

## STEP 7 — OUTPUT
Output ONLY in the requested language: [{{LANGUAGE}}]
Use strict headers:
## 📌 Sorun Yorumu
{{Current problem interpretation}}

## 🔄 Problem Değişimi
{{Only if shift = true: short explanation}}

## 🎯 En Olası Neden
{{Top cause + technical explanation}}

## ⚠️ Kritik Kontroller (Öncelik Sırasıyla)
{{Technical validation checklist}}

## 🛠️ Çözüm Adımları
{{Step-by-step solution}}

## ✅ Doğrulama
{{Checklist to verify fix}}

## HARD RULES
- NEVER give generic support answers.
- ALWAYS behave like a senior engineer.
- If knowledge base is empty/irrelevant for {{PRODUCT}}, explicitly say: "Bu ürün ({{PRODUCT}}) hakkında henüz dökümantasyonumda bilgi bulunmuyor."
- Output ONLY Markdown.
- Output ONLY in the language specified in STEP 7.
- Analyze image attachments first if they exist.
`;
import { DocumentParserService } from '../common/services/document-parser.service';
import { MetricsService } from '../metrics/metrics.service';
import { StorageService } from '../common/services/storage.service';

@Injectable()
export class AiQueryService {
    private readonly logger = new Logger(AiQueryService.name);
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
        private readonly ragObs: RagObservabilityService,
        private readonly diagnosisService: AiDiagnosisService,
        private readonly documentParser: DocumentParserService,
        @InjectQueue('ai-query-processing') private readonly aiQueue: Queue,
        private readonly metrics: MetricsService,
        private readonly storage: StorageService,
    ) { }

    async query(options: AiQueryOptions): Promise<any> {
        const { userQuery, userId, channel = 'WEB', hotinfoContext, wait = true } = options;
        const startTime = Date.now();
        const isStaff = await this.isStaff(userId);
        const lang = options.language || 'tr';

        // --- GAP-05: AI Quota & Budget Check ---
        const today = new Date().toISOString().split('T')[0];
        const globalCostKey = `ai:quota:global:cost:${today}`;
        const userQueryKey = `ai:quota:user:${userId || 'guest'}:count:${today}`;
        const client = this.redis.getClient();

        const globalCost = parseFloat(await client.get(globalCostKey) || '0');
        const userQueries = parseInt(await client.get(userQueryKey) || '0', 10);
        const globalCap = parseFloat(this.config.get('AI_GLOBAL_DAILY_CAP', '50.0'));
        const userQuota = parseInt(this.config.get('AI_USER_DAILY_QUOTA', '50'), 10);

        if (globalCost >= globalCap) {
            this.logger.error(`🚨 Global AI Budget Cap Exceeded ($${globalCost})`);
            throw new Error('Ai hizmeti geçici olarak sınırlandırılmıştır. (Bütçe aşımı)');
        }
        if (!isStaff && userQueries >= userQuota) {
            throw new Error('Günlük maksimum akıllı asistan kullanım kotasına ulaştınız.');
        }
        // --- END QUOTA CHECK ---

        // 1. Precise unique cache key
        const queryHash = createHash('sha256').update(userQuery + isStaff + lang + (hotinfoContext ? JSON.stringify(hotinfoContext) : '')).digest('hex');
        const cacheKey = `ai:query:cache:${RAG_CONFIG.CACHE.VERSION}:${queryHash}`;
        const cached = await this.redis.get(cacheKey);

        if (cached) {
            const result = JSON.parse(cached);
            this.metrics.recordCacheOp('AI_QUERY', 'HIT');
            this.logger.log(`⚡ [Cache Hit] interactionId=${result.interactionId} (v5)`);
            return result;
        }

        this.metrics.recordCacheOp('AI_QUERY', 'MISS');

        // 2. Decide Execution Mode
        // If not forcing wait, and it's a web channel, push to queue
        if (!wait && channel === 'WEB') {
            const jobId = `ai-query-${Date.now()}-${userId || 'guest'}`;
            await this.aiQueue.add('process-query', { options, jobId }, {
                jobId,
                removeOnComplete: true,
                attempts: 2
            });
            this.logger.log(`🚀 AI Query Enqueued: ${jobId}`);
            return { jobId, status: 'PENDING' };
        }

        // Otherwise process directly
        return this.queryInternal(options);
    }

    /**
     * The actual core logic for RAG + Diagnosis + Generation.
     * Exported as public for the Processor to call, but prefixed with internal for clarity.
     */
    async queryInternal(options: AiQueryOptions): Promise<AiQueryResult> {
        const { userQuery, userId, channel = 'WEB', hotinfoContext, attachments } = options;
        const startTime = Date.now();
        const isStaff = await this.isStaff(userId);
        const lang = options.language || 'tr';

        // Setup cache key for later saving
        const queryHash = createHash('sha256').update(userQuery + isStaff + lang + (hotinfoContext ? JSON.stringify(hotinfoContext) : '')).digest('hex');
        const cacheKey = `ai:query:cache:${RAG_CONFIG.CACHE.VERSION}:${queryHash}`;

        // Phase 3: Immediate Adaptive Analysis for Thresholding
        const diagnosisForThreshold = await this.diagnosisService.analyze(userQuery, options.history?.map(h => h.content), options.productId);
        const adaptiveThreshold = this.calculateAdaptiveThreshold(userQuery, diagnosisForThreshold, isStaff);
        this.logger.debug(`🎯 Adaptive threshold calculated: ${adaptiveThreshold.toFixed(3)} (Query: "${userQuery.slice(0, 30)}...", isStaff: ${isStaff})`);

        // --- SHIFT DETECTION: DB log + history clear + Langfuse event ---
        if (diagnosisForThreshold.isProblemShift) {
            // 1. DB log (non-blocking)
            try {
                await this.prisma.aiShiftDetection.create({
                    data: {
                        userId: userId ?? null,
                        previousKeywords: options.history?.flatMap(h =>
                            diagnosisForThreshold.matchedKeywords.filter(k =>
                                h.content.toLowerCase().includes(k.toLowerCase())
                            )
                        ) ?? [],
                        newKeywords: diagnosisForThreshold.matchedKeywords,
                        historyLength: options.history?.length ?? 0,
                        confirmed: false,
                    }
                });
            } catch (shiftLogErr) {
                this.logger.error('⚠️ Failed to log shift detection to DB', (shiftLogErr as Error).message);
            }

            // 2. History temizleme
            if (options.history && options.history.length > 0) {
                this.logger.warn('🔄 Problem shift detected — history cleared for clean context');
                options.history = [];
            }

            // 3. Langfuse event (non-blocking)
            try {
                const traceId = `shift-${Date.now()}-${userId ?? 'guest'}`;
                await this.langfuse.addEvent(traceId, 'problem-shift', {
                    previousKeywords: diagnosisForThreshold.matchedKeywords,
                    newKeywords: diagnosisForThreshold.matchedKeywords,
                    historyLength: options.history?.length ?? 0,
                    userId: userId ?? null,
                });
            } catch (langfuseErr) {
                this.logger.error('⚠️ Failed to write shift event to Langfuse', (langfuseErr as Error).message);
            }
        }
        // --- END SHIFT DETECTION ---

        let expandedQuery = userQuery;

        // Parse Document Attachments
        let parsedDocumentTexts = '';
        const aiParts: AiPart[] = await this.normalizeImageAttachments(attachments ?? []);
        if (attachments && attachments.length > 0) {
            for (const att of attachments) {
                if (!att.mimeType?.startsWith('image/') && att.data) {
                    // Try parsing non-image base64 directly
                    try {
                        const buffer = Buffer.from(att.data, 'base64');
                        const parsedText = await this.documentParser.extractText(att.mimeType || 'application/octet-stream', buffer);
                        if (parsedText) {
                            parsedDocumentTexts += `\n[EK DÖKÜMAN: ${att.fileName || 'Dosya'}]\n${parsedText}\n[DÖKÜMAN SONU]\n`;
                        }
                    } catch (e) {
                        this.logger.warn(`Failed to parse inline document attachment: ${e.message}`);
                    }
                }
            }
        }

        // Append parsed docs to the expanded query so they participate in search & diagnosis
        if (parsedDocumentTexts) {
            expandedQuery += `\n\n[KULLANICI EKLERİ İÇERİĞİ]:\n${parsedDocumentTexts}`;
        }

        // Only inject Hotinfo into search query for PERFORMANS/CRASH queries
        const isHardwareQuery = /çökme|crash|donma|freeze|yavaş|slow|performans|hata|error|gpu|driver|sürücü|ram|bellek/i.test(expandedQuery);
        if (hotinfoContext && isHardwareQuery) {
            const h = hotinfoContext;
            expandedQuery += `\n[Hotinfo Sistem Özeti]: İşletim Sistemi: ${h.osVersion || ''}, Ekran Kartı: ${h.gpu || ''}, Hata: ${h.errorTrace || ''}, Çakışan İşlemler: ${h.conflictingProcesses?.join(', ') || ''}`;
            this.logger.log(`🔍 AI Query Expanded with Hotinfo (hardware query detected): Error [${h.errorTrace || 'None'}]`);
        } else if (hotinfoContext) {
            this.logger.log(`ℹ️ Hotinfo available but NOT injected into search query (non-hardware query)`);
        }


        // 1. Synonym-based query expansion
        const { expanded: synonymExpanded, matchedGroups } = expandQueryWithSynonyms(expandedQuery);
        if (matchedGroups.length > 0) {
            this.logger.log(`🔍 Synonym expansion matched: [${matchedGroups.join(', ')}]`);
            expandedQuery = synonymExpanded;
        }

        // 2. Semantic search
        // Use productId if provided explicitly or derived from diagnosis (if we moved diagnosis earlier- but we keep it product-agnostic for first pass intentionally)
        const searchStartTime = Date.now();
        const searchResponse: SearchResponse = await this.embeddingService.search(expandedQuery, RAG_CONFIG.SEARCH.PRE_RERANK_LIMIT, options.productId, isStaff);
        this.logger.log(`🔍 [Phase: Search] Found ${searchResponse.results.length} results in ${Date.now() - searchStartTime}ms. TopScore: ${searchResponse.diagnostics.topScore.toFixed(3)}`);
        let results = searchResponse.results;

        /* 
        // 3. Vertex AI Data Store Hybrid Merge (DEACTIVATED FOR COST OPTIMIZATION)
        try {
            const vertexSearch = await this.ai.getProviderByName('vertex');
            if (vertexSearch && typeof vertexSearch.searchDataStore === 'function') {
                const vertexResults = await vertexSearch.searchDataStore(userQuery);
                if (vertexResults && vertexResults.length > 0) {
                    // Prepend Vertex results with supreme priority
                    results = [...vertexResults, ...results];
                    this.logger.log(`🔗 Hybrid Merge: Extracted ${vertexResults.length} precise chunks from Vertex Data Store`);
                }
            }
        } catch (e) {
            this.logger.warn(`⚠️ Vertex Hybrid Merge skipped: ${e.message}`);
        }
        */

        // Heuristic Re-ranking
        results = this.rerankResults(results);

        // Advanced LLM Re-ranking (Cross-Encoder)
        const rankStartTime = Date.now();
        results = await this.rankResultsWithLLM(userQuery, results);
        this.logger.log(`🔍 [Phase: Re-ranking] Completed in ${Date.now() - rankStartTime}ms.`);

        // Lowered floor for response generation
        // Ensure threshold alignment: topScore must be >= search floor to be valid
        const FALLBACK_THRESHOLD = adaptiveThreshold;

        if (searchResponse.diagnostics.topScore < FALLBACK_THRESHOLD || results.length === 0) {
            this.logger.warn(`🚫 No reliable context found (topScore = ${searchResponse.diagnostics.topScore.toFixed(3)}, threshold = ${FALLBACK_THRESHOLD}). Routing to human agent.`);

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
                confidence: 'NO_MATCH' as LocalConfidenceBand,
                sources: [],
                interactionId: interaction.id,
                suggestTicket: true,
            };
        }

        // 2. Determine confidence band
        const topResult = results[0] ?? null;
        let confidence: LocalConfidenceBand = 'NO_MATCH';
        let answer: string | null = null;
        let translations: Record<string, string> | undefined;
        let diagnosis: DiagnosisResult | undefined;

        if (topResult) {
            confidence = topResult.confidence as LocalConfidenceBand;
        }

        if (topResult && (confidence === 'HIGH' || confidence === 'MEDIUM' || confidence === 'LOW')) {
            // Re-use already completed diagnosis
            diagnosis = diagnosisForThreshold;

            const systemPromptRaw = await this.promptsService.getPrompt('SYSTEM_PROMPT_SUPPORT', MASTER_DIAGNOSIS_PROMPT);
            let dynamicSystemPrompt = systemPromptRaw
                .replace('{{PRODUCT}}', diagnosis?.productName || 'General')
                .replace('{{CATEGORIES}}', diagnosis?.categoryNames.join(', ') || 'N/A')
                .replace('{{KEYWORDS}}', diagnosis?.matchedKeywords.join(', ') || 'N/A')
                .replace('{{LANGUAGE}}', options.language === 'tr' ? 'Turkish' : (options.language === 'de' ? 'German' : 'English'));

            const contextPrompt = await this.promptContextBuilder.buildContext({
                userId: userId ?? undefined,
                userQuery,
                kbContent: results.slice(0, 10).map(r => r.content).join('\n\n---\n\n'),
                hotinfoSnapshot: hotinfoContext,
                messages: options.history,
                diagnosis,
            });
            // aiParts is already prepared at the beginning of the query func
            const finalPrompt = `${dynamicSystemPrompt} \n\n${contextPrompt} `;

            const genStartTime = Date.now();
            const aiResult = await this.ai.reformat(finalPrompt, userQuery, results.slice(0, 10).map(r => r.content).join('\n\n'), aiParts);
            this.logger.log(`🔍 [Phase: Generation] Completed in ${Date.now() - genStartTime}ms.`);

            const rawAnswer = aiResult?.response ?? results[0].content;

            // Split response by languages (TR, EN, DE)
            const splitResponse = this.parseMultiLangResponse(rawAnswer, options.language || 'auto');
            answer = splitResponse.main; // The active language content
            translations = splitResponse.translations;

            options.hotinfoContext = options.hotinfoContext || {}; // ensure for consistency below

            // Interaction logging happens below

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
        const suggestTicket = (confidence as LocalConfidenceBand) === 'NO_MATCH' || confidence === 'LOW' || topTrustScore < 0.4;

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
                estimatedCost,
                userContext: {
                    translations,
                    diagnosis
                } as Prisma.InputJsonValue
            }
        });

        // --- GAP-05: Increment Quota Counters ---
        const today = new Date().toISOString().split('T')[0];
        const globalCostKey = `ai:quota:global:cost:${today}`;
        const userQueryKey = `ai:quota:user:${userId || 'guest'}:count:${today}`;
        const rClient = this.redis.getClient();

        await Promise.all([
            rClient.incrbyfloat(globalCostKey, estimatedCost).catch(() => { }),
            rClient.incr(userQueryKey).catch(() => { }),
            rClient.expire(globalCostKey, 86400).catch(() => { }),
            rClient.expire(userQueryKey, 86400).catch(() => { })
        ]);
        // --- END INCREMENT ---

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
            translations,
            diagnosis
        };

        // Cache with centralized TTL
        await this.redis.set(cacheKey, JSON.stringify(finalResult), RAG_CONFIG.CACHE.DEFAULT_TTL);

        this.ragObs.recordQuery(Date.now() - startTime, false);

        return finalResult;
    }

    private async rankResultsWithLLM(query: string, results: SearchResult[]): Promise<SearchResult[]> {
        if (results.length <= 1) return results;

        try {
            // Take top 8 candidates for re-ranking to manage cost/latency
            const candidates = results.slice(0, 8);
            const contextForRanker = candidates.map((r, i) => `ID: ${i}\nTITLE: ${r.title}\nCONTENT: ${r.content.substring(0, 300)}...`).join('\n\n');

            const rankerPrompt = `You are a precision ranking agent.
Given the user query below and a list of internal knowledge results, rank each result by its actual helpfulness in answering the query exactly.
Assign a score from 0 to 100 for each result ID.

USER QUERY: "${query}"

RESULTS TO RANK:
${contextForRanker}

Format your response strictly as JSON: {"rankings": [{"id": 0, "score": 95}, {"id": 1, "score": 20}]}`;

            const response = await this.ai.generate(rankerPrompt, 15000);
            if (!response) return results;

            // Simple extract JSON in case AI wraps it
            const jsonStr = response.match(/\{.*\}/s)?.[0];
            if (!jsonStr) return results;

            const parsed = JSON.parse(jsonStr);
            const rankings: Array<{ id: number; score: number }> = parsed.rankings;

            // Merge LLM scores into original results
            const updatedResults = candidates.map((res, i) => {
                const rank = rankings.find(rk => rk.id === i);
                const llmScore = rank ? rank.score / 100 : 0.5; // fallback to mid-score
                // Final score: 40% original hybrid, 60% LLM judgment
                return {
                    ...res,
                    similarity: (res.similarity * 0.4) + (llmScore * 0.6)
                };
            });

            // Re-sort and add back filtered results
            return [...updatedResults, ...results.slice(8)].sort((a, b) => b.similarity - a.similarity);

        } catch (error) {
            this.logger.warn(`⚠️ LLM Re-ranking failed, falling back to hybrid scores: ${error.message}`);
            return results;
        }
    }

    /**
     * Heuristic Re-ranking (Cohort Search)
     * Section 5.3: Re-ranking with weights
     */
    private rerankResults(results: SearchResult[]): SearchResult[] {
        if (results.length === 0) return [];

        const RERANK = RAG_CONFIG.RERANK.FACTORS;
        const WEIGHTS = RAG_CONFIG.RERANK.WEIGHTS;
        const RERANK_URL_HARD_FLOOR = parseFloat(process.env.RERANK_URL_HARD_FLOOR || '0.75');

        return results
            .map(res => {
                let sourceBoost = 1.0;

                if (res.sourceType === 'ARTICLE') sourceBoost *= RERANK.ARTICLE;
                if (res.sourceType === 'DOCUMENT') sourceBoost *= RERANK.DOCUMENT;
                if (res.sourceType === 'URL') sourceBoost *= RERANK.URL;
                if (res.sourceType === 'TICKET') sourceBoost *= RERANK.TICKET;

                // 1. Semantic Component (Weighted)
                const semanticScore = res.similarity * sourceBoost;

                // 2. Recency Component (Weighted)
                let recencyScore = 0.5; // Neutral
                if (res.updatedAt) {
                    const daysOld = (Date.now() - new Date(res.updatedAt).getTime()) / (1000 * 3600 * 24);
                    const decay = RAG_CONFIG.RERANK.RECENCY_DECAY_DAYS;
                    // Linear decay from 1.0 to 0.0 over 30 days
                    recencyScore = Math.max(0, 1 - (daysOld / decay));
                }

                // 3. Rating Component (Placeholder for future implementation)
                const ratingScore = 0.7; // Default "trusted" score

                // Combined Multi-Factor Score
                const finalSimilarity =
                    (semanticScore * WEIGHTS.SEMANTIC) +
                    (recencyScore * WEIGHTS.RECENCY) +
                    (ratingScore * WEIGHTS.RATING);

                return {
                    ...res,
                    similarity: finalSimilarity
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

    async * streamQuery(options: AiQueryOptions): AsyncGenerator<any, void, unknown> {
        const { userQuery, userId, channel = 'WEB', hotinfoContext, attachments } = options;
        // 0. Cache lookup (simplified for internal/external aware caching)
        const isStaff = await this.isStaff(userId);
        const lang = options.language || 'tr';
        const queryHash = createHash('sha256').update(userQuery + isStaff + lang + (hotinfoContext ? JSON.stringify(hotinfoContext) : '')).digest('hex');
        const cacheKey = `ai:query:stream_cache:${queryHash}`;
        const cached = await this.redis.get(cacheKey);

        if (cached) {
            this.logger.log(`🎯 AI Stream Query Cache Hit: ${userQuery.slice(0, 40)}...`);
            yield { chunk: cached };
            return;
        }

        // Phase 3: Adaptive Analysis for Thresholding
        const diagnosisForThreshold = await this.diagnosisService.analyze(userQuery, options.history?.map(h => h.content), options.productId);
        const adaptiveThreshold = this.calculateAdaptiveThreshold(userQuery, diagnosisForThreshold, isStaff);
        this.logger.debug(`🎯 [Streaming] Adaptive threshold calculated: ${adaptiveThreshold.toFixed(3)}, isStaff: ${isStaff}`);

        let expandedQuery = userQuery;
        // Conditional Hotinfo expansion (same logic as query())
        const isHardwareQuery = /çökme|crash|donma|freeze|yavaş|slow|performans|hata|error|gpu|driver|sürücü|ram|bellek/i.test(userQuery);
        if (hotinfoContext && isHardwareQuery) {
            const h = hotinfoContext;
            expandedQuery += `\n[Hotinfo Sistem Özeti]: İşletim Sistemi: ${h.osVersion || ''}, Ekran Kartı: ${h.gpu || ''}, Hata: ${h.errorTrace || ''}, Çakışan İşlemler: ${h.conflictingProcesses?.join(', ') || ''}`;
        }

        const searchResponse = await this.embeddingService.search(expandedQuery, RAG_CONFIG.SEARCH.PRE_RERANK_LIMIT, null, isStaff);
        let results = searchResponse.results;

        // Apply Re-ranking
        results = this.rerankResults(results);
        results = await this.rankResultsWithLLM(userQuery, results);

        const topResult = results[0] ?? null;

        let confidence: LocalConfidenceBand = 'NO_MATCH';
        let fullAnswer = '';

        const FALLBACK_THRESHOLD = adaptiveThreshold;

        // If no results pass the floor, yield no matches early
        if (searchResponse.diagnostics.topScore < FALLBACK_THRESHOLD || results.length === 0) {
            fullAnswer = 'Bu konu mevcut bilgi kaynağında yer almıyor. Sistem analizi için lütfen destek talebi oluşturun ve \'_hotinf_.hxl\' dosyanızı ekleyiniz.';
            yield { chunk: fullAnswer };

            // Interaction logging for NO_MATCH stream
            const providerName = await this.ai.getActiveProviderName();
            const modelName = await this.ai.getActiveModelName();
            const interaction = await this.prisma.aiInteraction.create({
                data: {
                    userId,
                    userQuery,
                    responseGenerated: fullAnswer,
                    confidenceBand: null,
                    autoAnswered: false,
                    similarityScore: searchResponse.diagnostics.topScore,
                    provider: providerName,
                    model: modelName,
                    inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCost: 0
                }
            });
            yield { done: true, interactionId: interaction.id, suggestTicket: true };
            return;
        }

        if (topResult) {
            confidence = topResult.confidence as LocalConfidenceBand;
        }

        let usedPrompt = userQuery;
        let diagnosis: DiagnosisResult | undefined;


        if (topResult) {
            diagnosis = diagnosisForThreshold;

            const systemPromptRaw = await this.promptsService.getPrompt('SYSTEM_PROMPT_SUPPORT', MASTER_DIAGNOSIS_PROMPT);
            let dynamicSystemPrompt = systemPromptRaw
                .replace('{{PRODUCT}}', diagnosis?.productName || 'General')
                .replace('{{CATEGORIES}}', diagnosis?.categoryNames.join(', ') || 'N/A')
                .replace('{{KEYWORDS}}', diagnosis?.matchedKeywords.join(', ') || 'N/A')
                .replace('{{LANGUAGE}}', options.language === 'tr' ? 'Turkish' : (options.language === 'de' ? 'German' : 'English'));


            const contextPrompt = await this.promptContextBuilder.buildContext({
                userId: userId ?? undefined,
                userQuery,
                kbContent: results.slice(0, 10).map(r => r.content).join('\n\n---\n\n'),
                hotinfoSnapshot: hotinfoContext,
                messages: options.history?.map(h => ({ role: h.role, content: h.content })),
                diagnosis
            });
            const finalPrompt = `${dynamicSystemPrompt} \n\n${contextPrompt} `;
            usedPrompt = finalPrompt;

            const aiParts: AiPart[] = await this.normalizeImageAttachments(attachments ?? []);

            const stream = this.ai.streamReformat(finalPrompt, userQuery, results.slice(0, 10).map(r => r.content).join('\n\n'), aiParts);
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
                estimatedCost,
                userContext: {
                    diagnosis: diagnosis
                } as Prisma.InputJsonValue
            },
        });

        // --- GAP-05: Increment Quota Counters (Stream) ---
        const today = new Date().toISOString().split('T')[0];
        const globalCostKey = `ai:quota:global:cost:${today}`;
        const userQueryKey = `ai:quota:user:${userId || 'guest'}:count:${today}`;
        const rClient = this.redis.getClient();

        await Promise.all([
            rClient.incrbyfloat(globalCostKey, estimatedCost).catch(() => { }),
            rClient.incr(userQueryKey).catch(() => { }),
            rClient.expire(globalCostKey, 86400).catch(() => { }),
            rClient.expire(userQueryKey, 86400).catch(() => { })
        ]);
        // --- END INCREMENT ---

        // Cache for 1 hour
        await this.redis.set(cacheKey, fullAnswer, 3600);

        yield { done: true, interactionId: interaction.id, suggestTicket: (confidence as LocalConfidenceBand) === 'LOW' || confidence === 'NO_MATCH' };
    }

    /**
     * Fetches URL-based image attachments via StorageService and converts them
     * to inlineData AiParts. Already-inlineData parts (with `data` field) are
     * passed through unchanged. Failed fetches are skipped with a WARN log.
     *
     * @param attachments - Raw attachment records from the ticket.
     * @returns Array of inlineData AiParts (zero fileData parts).
     */
    private async normalizeImageAttachments(
        attachments: Array<{ mimeType?: string; url?: string; data?: string; fileName?: string }>,
    ): Promise<AiPart[]> {
        const result: AiPart[] = [];
        for (const att of attachments) {
            if (!att.mimeType?.startsWith('image/')) continue;

            if (att.data) {
                // Already inline — pass through without fetching
                result.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
            } else if (att.url) {
                try {
                    const buffer = await this.storage.getFile(att.url);
                    if (buffer && buffer.length > 0) {
                        const base64 = buffer.toString('base64');
                        this.logger.debug(`📎 Image attachment fetched: url=${att.url.substring(0, 100)}, mimeType=${att.mimeType}, size=${buffer.length}B`);
                        result.push({ inlineData: { mimeType: att.mimeType, data: base64 } });
                    } else {
                        this.logger.warn(`⚠️ Image attachment returned empty buffer: url=${att.url}`);
                    }
                } catch (e) {
                    this.logger.warn(`⚠️ Failed to fetch image attachment: url=${att.url?.substring(0, 100)}, error=${(e as Error).message}`);
                }
            }
        }
        return result;
    }

    private async isStaff(userId?: string | null): Promise<boolean> {
        if (!userId) return false;
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: { select: { name: true } } }
        });

        if (!user || !user.role) return false;
        // Case-insensitive role check to handle 'CUSTOMER' vs 'customer'
        const roleName = user.role.name.toUpperCase();
        return roleName !== 'CUSTOMER';
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

    /**
     * Parses the multi-language response from the Master Prompt.
     * Expects sections like "### 🇹🇷 Türkçe", "### 🇬🇧 English", "### 🇩🇪 Deutsch".
     * Resilient against horizontal rules (---) and emoji variations.
     */
    private parseMultiLangResponse(raw: string, requestedLang: string): { main: string; translations: Record<string, string> } {
        const sections: Record<string, string> = {};

        // Define flexible marker patterns that stop at the next section header or horizontal rule
        const patterns = {
            tr: /###\s*(?:🇹🇷|)\s*(?:Türkçe|Turkish)([\s\S]*?)(?=(?:###|---|$))/i,
            en: /###\s*(?:🇬🇧|)\s*English([\s\S]*?)(?=(?:###|---|$))/i,
            de: /###\s*(?:🇩🇪|)\s*(?:Deutsch|German)([\s\S]*?)(?=(?:###|---|$))/i
        };

        let foundAny = false;
        for (const [lang, regex] of Object.entries(patterns)) {
            const match = raw.match(regex);
            if (match && match[1].trim()) {
                // Strip noise and horizontal rules
                sections[lang] = match[1].trim();
                foundAny = true;
            }
        }

        // If parser failed to find any structured sections, return raw as main
        if (!foundAny) {
            this.logger.warn(`⚠️ parseMultiLangResponse: Failed to detect structured language sections in raw output. Returning raw.`);
            return { main: raw.trim(), translations: {} };
        }

        // Determine main language
        const mainLang = requestedLang === 'auto' ? 'tr' : (requestedLang?.toLowerCase() || 'tr');

        // Extract main content with fallback cascade
        const mainContent = sections[mainLang] || sections['tr'] || sections['en'] || raw;

        // Populate translations for non-requested languages
        const translations: Record<string, string> = {};
        for (const [l, content] of Object.entries(sections)) {
            if (l !== mainLang) {
                translations[l] = content;
            }
        }

        return { main: mainContent, translations };
    }

    @OnEvent('ai.translate_message', { async: true })
    async handleTranslationRequest(payload: { ticketId: string; messageId: string; targetLanguage: string }) {
        try {
            const message = await this.prisma.ticketMessage.findUnique({ where: { id: payload.messageId } });
            if (!message) return;

            const translated = await this.ai.translate(message.message, payload.targetLanguage);
            if (translated) {
                const currentMetadata = (message.metadata as Prisma.JsonObject) || {};
                await this.prisma.ticketMessage.update({
                    where: { id: message.id },
                    data: {
                        metadata: {
                            ...currentMetadata,
                            translations: {
                                ...((currentMetadata.translations as Prisma.JsonObject) || {}),
                                [payload.targetLanguage]: translated
                            }
                        } as Prisma.InputJsonValue
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

    /**
     * Dynamically calculates the similarity threshold based on query complexity.
     */
    private calculateAdaptiveThreshold(query: string, diagnosis?: DiagnosisResult, isStaff = false): number {
        let threshold: number = RAG_CONFIG.SIMILARITY.FLOOR; // 0.45

        const isTechnical = diagnosis?.categoryNames.some(c => c.toLowerCase().includes('tech')) || (diagnosis?.matchedKeywords.length || 0) > 2;

        // 1. Technical Depth Adjustment
        if (diagnosis && isTechnical) {
            // High technical density might warrant lower floor to be more helpful with sparse but specific matches
            threshold -= 0.05;
        }

        // 2. Query Length Adjustment (Short queries are ambiguous, requiring higher precision)
        if (query.length < 15) {
            threshold += 0.08;
        }

        // 3. Product-Aware Adjustment (CRITICAL FIX)
        // If product is GENERIC, we should be STRICTOR to avoid hallucinations.
        // But if it's GENERIC and TECHNICAL, we can be slightly more relaxed.
        if (diagnosis?.productName === 'GENERIC') {
            if (!isTechnical) {
                threshold = Math.max(threshold, 0.60); // Strict for non-technical generic
            } else {
                threshold = Math.max(threshold, 0.48); // Revit/IFC technical queries
            }
        }

        // 4. Staff Adjustment (Staff can see slightly less confident matches)
        if (isStaff) {
            threshold -= 0.05;
        }

        return Math.max(0.35, Math.min(0.80, threshold));
    }

    async submitFeedback(
        interactionId: string,
        userId: string,
        rating: number,
        comment?: string,
    ) {
        const feedback = await this.prisma.interactionFeedback.create({
            data: {
                interactionId,
                userId,
                rating,
                comment,
                isHelpful: rating >= 4,
            },
        });

        // 3. Automate Knowledge Gap (Step 3 of Phase 30)
        // If user gives 1 or 2 stars, automatically push to TrainingQueue for review
        if (rating <= 2) {
            await this.prisma.trainingQueue.upsert({
                where: { feedbackId: feedback.id },
                update: {},
                create: {
                    interactionId,
                    feedbackId: feedback.id,
                    status: 'PENDING'
                }
            });
        }

        return feedback;
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
        type HotinfoSnapshot = {
            allplanVersion?: string;
            allplanBuildId?: string;
            osVersion?: string;
            gpu?: string;
            vram?: string;
            ram?: string;
            screenResolution?: string;
            errorTrace?: string;
            conflictingProcesses?: string[];
        };
        let hotinfoContext = '';
        let hotinfoAllplanVersion = '...';
        if (h && typeof h === 'object') {
            const data = h as HotinfoSnapshot;
            hotinfoAllplanVersion = data.allplanVersion || '...';
            hotinfoContext = `\n[MÜŞTERİ SİSTEM BİLGİLERİ (HOTINFO)]:
- Allplan: ${data.allplanVersion || 'Bilinmiyor'} (Build: ${data.allplanBuildId || 'N/A'})
- OS: ${data.osVersion || 'Bilinmiyor'}
- GPU: ${data.gpu || 'Bilinmiyor'} (VRAM: ${data.vram || 'N/A'})
- RAM: ${data.ram || 'Bilinmiyor'}
- Çözünürlük: ${data.screenResolution || 'Bilinmiyor'}
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
2. Özetinde bu bilgileri kullanarak "Müşteri Allplan ${hotinfoAllplanVersion} versiyonu kullanıyor" gibi net ifadeler kullan.
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
                confidenceBand: topResult ? (topResult.confidence as ConfidenceBand) : null,
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
                    { confidenceBand: null },
                    {
                        feedbacks: {
                            some: {
                                rating: { lte: 2 }
                            }
                        }
                    }
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

    /**
     * Get Advanced Strategic Intelligence Metrics (Phase 29)
     */
    async getIntelligenceMetrics(days: number = 30) {
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        const stats = await this.prisma.$queryRaw<any[]>`
            SELECT 
                COUNT(id)::int as total_interactions,
                COUNT(CASE WHEN (user_context->'diagnosis'->>'isProblemShift')::boolean = true THEN 1 END)::int as problem_shifts,
                COUNT(CASE WHEN user_context->'diagnosis'->'matchedKeywords' @@ '$' THEN 1 END)::int as metadata_informed,
                AVG((user_context->'diagnosis'->>'confidenceScore')::float) as avg_diagnosis_score,
                COUNT(CASE WHEN confidence_band = 'HIGH' THEN 1 END)::int as high_confidence,
                COUNT(CASE WHEN confidence_band = 'MEDIUM' THEN 1 END)::int as medium_confidence,
                COUNT(CASE WHEN confidence_band = 'LOW' THEN 1 END)::int as low_confidence,
                COUNT(CASE WHEN confidence_band IS NULL THEN 1 END)::int as no_match
            FROM ai_interactions
            WHERE created_at >= ${startDate}
        `;

        const distribution = [
            { label: 'High Confidence', value: stats[0].high_confidence, color: '#10b981' },
            { label: 'Medium Confidence', value: stats[0].medium_confidence, color: '#f59e0b' },
            { label: 'Low Confidence', value: stats[0].low_confidence, color: '#ef4444' },
            { label: 'No Match', value: stats[0].no_match, color: '#6b7280' },
        ];

        return {
            period: `${days}d`,
            summary: stats[0],
            confidenceDistribution: distribution,
            shiftRate: stats[0].total_interactions > 0
                ? (stats[0].problem_shifts / stats[0].total_interactions) * 100
                : 0,
        };
    }

    async *queryInternalStream(options: AiQueryOptions): AsyncGenerator<string, void, unknown> {
        const { context, diagnosis, results, topResult, userId, channel, userQuery } = await this.prepareQueryContext(options);
        const generator = this.ai.streamGenerate(context, 60_000);

        let fullAnswer = '';
        for await (const chunk of generator) {
            fullAnswer += chunk;
            yield chunk;
        }

        // Save interaction at the end
        if (fullAnswer) {
            const inputTokens = Math.ceil(userQuery.length / 4);
            const outputTokens = Math.ceil(fullAnswer.length / 4);
            await this.prisma.aiInteraction.create({
                data: {
                    userId: userId || undefined,
                    channel: channel || CommunicationChannel.WEB,
                    userQuery,
                    responseGenerated: fullAnswer,
                    confidenceBand: this.mapConfidence(results[0]?.similarity),
                    autoAnswered: (results[0]?.similarity || 0) > 0.4,
                    similarityScore: topResult?.similarity,
                    matchedArticleId: topResult?.sourceType === 'ARTICLE' ? topResult.articleId : undefined,
                    provider: await this.ai.getActiveProviderName(),
                    model: await this.ai.getActiveModelName(),
                    inputTokens,
                    outputTokens,
                    totalTokens: inputTokens + outputTokens,
                    estimatedCost: (inputTokens * 0.00000015) + (outputTokens * 0.0000006),
                    userContext: { diagnosis } as unknown as Prisma.InputJsonValue
                }
            });
        }
    }

    private mapConfidence(similarity?: number): ConfidenceBand | null {
        if (!similarity || similarity < 0.2) return null;
        if (similarity >= RAG_CONFIG.SIMILARITY.HIGH) return ConfidenceBand.HIGH;
        if (similarity >= RAG_CONFIG.SIMILARITY.MEDIUM) return ConfidenceBand.MEDIUM;
        return ConfidenceBand.LOW;
    }

    private async prepareQueryContext(options: AiQueryOptions) {
        const { userQuery, userId, hotinfoContext, attachments, history, productId } = options;
        const isStaff = await this.isStaff(userId);
        const lang = options.language || 'tr';

        const queryHash = createHash('sha256').update(userQuery + isStaff + lang + (hotinfoContext ? JSON.stringify(hotinfoContext) : '')).digest('hex');
        const cacheKey = `ai:query:cache:${RAG_CONFIG.CACHE.VERSION}:${queryHash}`;

        let expandedQuery = userQuery;
        let parsedDocs = '';
        const aiParts: AiPart[] = await this.normalizeImageAttachments(attachments ?? []);

        if (attachments) {
            for (const att of attachments) {
                if (!att.mimeType?.startsWith('image/') && att.data) {
                    try {
                        const buffer = Buffer.from(att.data, 'base64');
                        const text = await this.documentParser.extractText(att.mimeType || 'application/octet-stream', buffer);
                        if (text) parsedDocs += `\n[EK DÖKÜMAN: ${att.fileName}]\n${text}\n[DÖKÜMAN SONU]\n`;
                    } catch (e) {
                        this.logger.warn(`Failed to parse doc: ${e.message}`);
                    }
                }
            }
        }

        if (parsedDocs) expandedQuery += `\n\n[KULLANICI EKLERİ İÇERİĞİ]:\n${parsedDocs}`;

        const isHardware = /çökme|crash|donma|freeze|yavaş|slow|performans|hata|error|gpu|driver|sürücü|ram|bellek/i.test(expandedQuery);
        if (hotinfoContext && isHardware) {
            const h = hotinfoContext;
            expandedQuery += `\n[Hotinfo]: OS: ${h.osVersion || ''}, GPU: ${h.gpu || ''}, Error: ${h.errorTrace || ''}`;
        }

        const { expanded } = expandQueryWithSynonyms(expandedQuery);
        const searchResponse = await this.embeddingService.search(expanded, RAG_CONFIG.SEARCH.PRE_RERANK_LIMIT, productId, isStaff);
        let results = searchResponse.results;

        if (results.length > 1) {
            results = await this.rankResultsWithLLM(expanded, results);
        }

        const topResult = results[0];
        const kbContent = results.length > 0 ? results.map(r => r.content).join('\n\n---\n\n') : 'No specific knowledge found.';

        const historyTexts = history?.map(h => h.content) || [];
        const diagnosis = await this.diagnosisService.analyze(userQuery, historyTexts, productId);

        const context = await this.promptContextBuilder.buildContext({
            userId: userId || undefined,
            userQuery,
            kbContent,
            hotinfoSnapshot: hotinfoContext,
            messages: history,
            diagnosis
        });

        const systemPromptRaw = await this.promptsService.getPrompt('SYSTEM_PROMPT_SUPPORT', MASTER_DIAGNOSIS_PROMPT);
        const systemPrompt = systemPromptRaw
            .replace('{{PRODUCT}}', diagnosis?.productName || 'General')
            .replace('{{CATEGORIES}}', diagnosis?.categoryNames.join(', ') || 'N/A')
            .replace('{{KEYWORDS}}', diagnosis?.matchedKeywords.join(', ') || 'N/A')
            .replace('{{LANGUAGE}}', lang === 'tr' ? 'Turkish' : (lang === 'de' ? 'German' : 'English'));

        return {
            context: `${systemPrompt}\n\n[CONTEXT]\n${context}\n${parsedDocs}`,
            diagnosis,
            results,
            topResult,
            isStaff,
            cacheKey,
            userId: userId || undefined,
            channel: options.channel,
            userQuery
        };
    }
}
