import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { hierarchicalChunk } from '../knowledge-base/utils/smart-chunker';
import { RAG_CONFIG, getConfidenceBand } from '../config/rag.config';
import { createHash } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmbeddingVersionRegistry } from './embedding-version.registry';
import { classifyDatasetFile } from '../knowledge-pool/dataset-classifier';
import { EmbeddingResult } from './interfaces/ai-provider.interface';
import { expandQueryWithSynonyms } from './utils/synonym-dictionary';

export interface SearchResult {
    articleId: string;
    sourceType: 'ARTICLE' | 'DOCUMENT' | 'URL' | 'TICKET' | 'FAQ';
    title: string;
    content: string;
    similarity: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    language?: string;
    category?: string | null;
    updatedAt?: Date;
}

export interface SearchDiagnostics {
    topScore: number;
    passedThreshold: number;
    queryEmbeddingModel: string;
    thresholdUsed: number;
}

export interface SearchResponse {
    results: SearchResult[];
    diagnostics: SearchDiagnostics;
}

const normalizeSearchLimit = (limit: number): number => Math.min(Math.max(Math.floor(limit || 5), 1), 20);

const SEARCH_STOP_WORDS = new Set([
    'allplan',
    'nasil',
    'nedir',
    'icin',
    'geri',
    'how',
    'what',
    'when',
    'where',
    'which',
    'with',
    'the',
    'und',
    'oder',
    'eine',
    'einen',
    'einer',
    'einem',
    'wie',
    'was',
]);

const normalizeSearchText = (value: string | null | undefined): string => (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const tokenizeSearchText = (value: string | null | undefined): string[] => {
    const tokens = normalizeSearchText(value)
        .split(/\s+/)
        .filter((token) => token.length >= 4 && !SEARCH_STOP_WORDS.has(token));
    return Array.from(new Set(tokens));
};

const calculateTitleTokenBoost = (queryTokens: string[], title: string | null | undefined): number => {
    if (queryTokens.length < 2) return 1;

    const normalizedTitle = normalizeSearchText(title);
    if (!normalizedTitle) return 1;

    const matchCount = queryTokens.filter((token) => normalizedTitle.includes(token)).length;
    if (matchCount === 0) return 1;

    return Math.min(1 + matchCount * 0.06, 1.3);
};

const hasSignal = (normalizedQuery: string, signals: string[]): boolean =>
    signals.some((signal) => normalizedQuery.includes(signal));

const hasNegatedLicenseIntent = (normalizedQuery: string): boolean =>
    [
        'lisans degil',
        'lisans sorunu degil',
        'lisans kaynakli degil',
        'not license',
        'not licensing',
        'not a license',
        'no license issue',
        'nicht lizenz',
        'keine lizenz',
    ].some((phrase) => normalizedQuery.includes(phrase));

const calculateIntentCategoryMultiplier = (query: string, category: string | null | undefined): number => {
    if (!category) return 1;

    const normalizedQuery = normalizeSearchText(query);
    const hasLicenseIntent =
        !hasNegatedLicenseIntent(normalizedQuery) &&
        hasSignal(normalizedQuery, ['license', 'lisans', 'softlock', 'codemeter', 'product key', 'aktivasyon', 'activation', 'lizenz']);
    const hasNetworkIntent = hasSignal(normalizedQuery, ['network', 'netzwerk', 'server', 'sunucu', 'isim cozumleme', 'name resolution', 'dns', 'workgroup', 'ag']);
    const hasStartupIntent = hasSignal(normalizedQuery, ['acilis', 'baslangic', 'startup', 'start', 'bekliyor', 'waiting']);
    const hasPerformanceIntent = hasSignal(normalizedQuery, ['performans', 'performance', 'yavas', 'slow', 'langsam', 'grafik', 'graphics', 'driver', 'surucu']);

    if ((hasNetworkIntent || hasStartupIntent) && category === 'License & Activation' && !hasLicenseIntent) return 0.72;
    if (hasPerformanceIntent && category === 'License & Activation' && !hasLicenseIntent) return 0.78;
    if (hasLicenseIntent && category === 'License & Activation') return 1.18;
    if ((hasNetworkIntent || hasStartupIntent) && category === 'Network & Workgroup') return 1.22;
    if (hasPerformanceIntent && category === 'Performance & Hardware') return 1.18;

    return 1;
};

const calculateIntentSourceMultiplier = (
    query: string,
    category: string | null | undefined,
    title: string | null | undefined,
): number => {
    const normalizedQuery = normalizeSearchText(query);
    const normalizedSource = normalizeSearchText(`${category ?? ''} ${title ?? ''}`);
    const negatedLicenseIntent = hasNegatedLicenseIntent(normalizedQuery);
    const hasLicenseSourceSignal = hasSignal(normalizedSource, ['license', 'lisans', 'lizenz', 'softlock', 'codemeter']);
    const asksNetworkStartup =
        hasSignal(normalizedQuery, ['network', 'netzwerk', 'server', 'sunucu', 'isim cozumleme', 'name resolution', 'dns', 'workgroup', 'ag']) &&
        hasSignal(normalizedQuery, ['acilis', 'baslangic', 'startup', 'start', 'bekliyor', 'waiting']);

    if ((negatedLicenseIntent || asksNetworkStartup) && hasLicenseSourceSignal) return 0.5;

    return 1;
};

const calculateSourceQualityMultiplier = (title: string | null | undefined): number => {
    const normalizedTitle = normalizeSearchText(title);
    if (!normalizedTitle) return 1;

    if (normalizedTitle.includes('pilot')) return 0.68;
    if (normalizedTitle.includes('kopya') || normalizedTitle.includes(' copy ')) return 0.86;
    if (normalizedTitle.includes('faq ')) return 1.04;

    return 1;
};

const calculateContentSignalBoost = (query: string, title: string | null | undefined, content: string | null | undefined): number => {
    const normalizedQuery = normalizeSearchText(query);
    const normalizedSource = normalizeSearchText(`${title ?? ''} ${content ?? ''}`);

    const asksNetworkStartup =
        hasSignal(normalizedQuery, ['acilis', 'baslangic', 'startup', 'start', 'bekliyor', 'waiting']) &&
        hasSignal(normalizedQuery, ['isim cozumleme', 'name resolution', 'dns', 'network', 'netzwerk', 'server', 'sunucu', 'ag']);

    if (
        asksNetworkStartup &&
        hasSignal(normalizedSource, ['name resolution on the network', 'takes several minutes to start', 'several minutes to start'])
    ) {
        return 1.42;
    }

    return 1;
};

@Injectable()
export class EmbeddingService {
    private readonly logger = new Logger(EmbeddingService.name);
    private readonly POOL_EMBED_PACING_MS = 350;

    private readonly SIMILARITY_THRESHOLD = RAG_CONFIG.SIMILARITY.THRESHOLD;
    private readonly LOW_THRESHOLD = RAG_CONFIG.SIMILARITY.LOW;
    private readonly HIGH_THRESHOLD = RAG_CONFIG.SIMILARITY.HIGH;
    private readonly MEDIUM_THRESHOLD = RAG_CONFIG.SIMILARITY.MEDIUM;

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
        private readonly eventEmitter: EventEmitter2,
        private readonly registry: EmbeddingVersionRegistry,
    ) { }

    /**
     * Store embedding for a published article version using Hierarchical (Parent-Child) chunking.
     */
    async indexArticle(articleId: string, versionId: string, title: string, content: string): Promise<void> {
        const parentMax = RAG_CONFIG.CHUNKING.PARENT_MAX_TOKENS;
        const hierarchies = hierarchicalChunk(content, { title, maxTokens: parentMax });
        const config = await this.registry.getActiveVersionConfig();

        await this.prisma.$executeRaw`DELETE FROM knowledge_embeddings WHERE article_version_id = ${versionId}::uuid`;

        for (const h of hierarchies) {
            const parentId = crypto.randomUUID();
            const parentEmb = this.ensureEmbeddingCompatibility(await this.ai.embed(h.parent), config, `article parent ${articleId}`);
            if (!parentEmb) continue;

            await this.prisma.$executeRaw`
                INSERT INTO knowledge_embeddings (id, article_id, article_version_id, embedding, content, sequence, parent_id, embedding_version, embedding_dim)
                VALUES (${parentId}::uuid, ${articleId}::uuid, ${versionId}::uuid,
                        ${JSON.stringify(parentEmb.embedding)}::vector, ${h.parent}, 0, NULL, ${config.version}, ${config.dimension})
            `;

            for (let i = 0; i < h.children.length; i++) {
                const childContent = h.children[i];
                const childEmb = this.ensureEmbeddingCompatibility(await this.ai.embed(childContent), config, `article child ${articleId}`);
                if (childEmb) {
                    await this.prisma.$executeRaw`
                        INSERT INTO knowledge_embeddings (id, article_id, article_version_id, embedding, content, sequence, parent_id, embedding_version, embedding_dim)
                        VALUES (gen_random_uuid(), ${articleId}::uuid, ${versionId}::uuid,
                                ${JSON.stringify(childEmb.embedding)}::vector, ${childContent}, ${i + 1}, ${parentId}::uuid, ${config.version}, ${config.dimension})
                    `;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        this.logger.log(`📐 Indexed ${hierarchies.length} hierarchies for article ${articleId}`);
        this.eventEmitter.emit('article.published', { articleId });
    }

    /**
     * Semantic similarity search using pgvector with Trust Score re-ranking.
     */
    async search(query: string, limit = 5, productId?: string | null, includeInternal = false): Promise<SearchResponse> {
        const config = await this.registry.getActiveVersionConfig();
        let embResult: Awaited<ReturnType<typeof this.ai.embed>>;
        try {
            embResult = this.ensureEmbeddingCompatibility(await this.ai.embed(query), config, 'semantic search query');
        } catch (err: any) {
            this.logger.warn(`Semantic search unavailable — embed failed: ${err?.message ?? err}`);
            return { results: [], diagnostics: { topScore: 0, passedThreshold: 0, queryEmbeddingModel: 'unknown', thresholdUsed: 0 } };
        }
        if (!embResult) {
            this.logger.warn('Semantic search unavailable — AI offline');
            return { results: [], diagnostics: { topScore: 0, passedThreshold: 0, queryEmbeddingModel: 'unknown', thresholdUsed: 0 } };
        }

        const vectorStr = JSON.stringify(embResult.embedding);
        const expandedForSearch = expandQueryWithSynonyms(query).expanded;
        const cleanQuery = expandedForSearch.replace(/['"\\;]/g, '');
        const normalizedLimit = normalizeSearchLimit(limit);
        const candidateLimit = Math.min(Math.max(normalizedLimit * 12, 80), 200);
        const queryClassification = classifyDatasetFile(`${cleanQuery}.pdf`);
        const queryLanguage = queryClassification.language;
        const queryCategory = queryClassification.category;
        const queryTokens = tokenizeSearchText(cleanQuery);

        const isValidUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        const validProductId = (productId && isValidUuid(productId)) ? productId : null;

        // Hybrid Arama: 
        // 1. Semantic (Vector) -> %60
        // 2. Keyword (TSVector/BM25 lite) -> %25
        // 3. Headline Match -> %15
        const rows = await this.prisma.$queryRaw<
            Array<{
                article_id: string;
                source_type: 'ARTICLE' | 'POOL' | 'URL' | 'DOCUMENT' | 'FAQ';
                title: string;
                content: string;
                similarity: number;
                trust_score: number;
                language: string;
                category: string | null;
                updated_at: Date;
            }>
        >`
      WITH keyword_search AS (
        SELECT 
            ka.id,
            ts_rank_cd(to_tsvector('simple', ka.title || ' ' || kav.content_plain), websearch_to_tsquery('simple', ${cleanQuery})) as rank
        FROM knowledge_articles ka
        JOIN knowledge_article_versions kav ON ka.id = kav.article_id AND ka.current_version = kav.version
          WHERE to_tsvector('simple', ka.title || ' ' || kav.content_plain) @@ websearch_to_tsquery('simple', ${cleanQuery})
      ),
      pool_keyword_search AS (
        SELECT
            ks.id,
            MAX(ts_rank_cd(to_tsvector('simple', ks.name || ' ' || kpe.content), websearch_to_tsquery('simple', ${cleanQuery}))) AS rank
        FROM knowledge_sources ks
        JOIN knowledge_pool_embeddings kpe ON kpe.source_id = ks.id
        WHERE ks.status = 'ACTIVE'
          AND kpe.embedding_version = ${config.version}
          AND kpe.embedding_dim = ${config.dimension}
          AND to_tsvector('simple', ks.name || ' ' || kpe.content) @@ websearch_to_tsquery('simple', ${cleanQuery})
        GROUP BY ks.id
      ),
      faq_keyword_search AS (
        SELECT
            fe.id,
            ts_rank_cd(to_tsvector('simple', fe.question || ' ' || fe.answer || ' ' || array_to_string(fe.tags, ' ')), websearch_to_tsquery('simple', ${cleanQuery})) AS rank
        FROM faq_entries fe
        WHERE fe.status = 'PUBLISHED'
          AND fe.deleted_at IS NULL
          AND (${includeInternal} = true OR fe.is_internal = false)
          AND to_tsvector('simple', fe.question || ' ' || fe.answer || ' ' || array_to_string(fe.tags, ' ')) @@ websearch_to_tsquery('simple', ${cleanQuery})
      ),
      faq_semantic AS (
        SELECT
            fe.id,
            1 - (fe.question_embedding <=> ${vectorStr}::vector) AS similarity
        FROM faq_entries fe
        WHERE fe.status = 'PUBLISHED'
          AND fe.deleted_at IS NULL
          AND (${includeInternal} = true OR fe.is_internal = false)
          AND fe.question_embedding IS NOT NULL
          AND fe.embedding_version = ${config.version}
          AND fe.embedding_dim = ${config.dimension}
      ),
      combined_search AS (
        SELECT 
            ka.id AS article_id, 
            'ARTICLE' AS source_type, 
            ka.title, 
            COALESCE(parent.content, ke.content) AS content, 
            (
                (1 - (ke.embedding <=> ${vectorStr}::vector)) * 0.6 + 
                COALESCE(
                  (1 - (ke.embedding <=> ${vectorStr}::vector)), 
                  0.0
                ) * 0.15 +
                 COALESCE((SELECT rank FROM keyword_search WHERE id = ka.id LIMIT 1), 0.0) * 0.25
            ) AS similarity,
            ka.trust_score,
            ka.language,
            NULL::text AS category,
            ka.updated_at
        FROM knowledge_embeddings ke
        JOIN knowledge_articles ka ON ka.id = ke.article_id
        LEFT JOIN knowledge_embeddings parent ON ke.parent_id = parent.id
        WHERE ka.status = 'PUBLISHED' 
          AND (${includeInternal} = true OR ka.is_internal = false)
          AND ke.embedding_version = ${config.version}
          AND ke.embedding_dim = ${config.dimension}
          AND (
              (1 - (ke.embedding <=> ${vectorStr}::vector)) > ${this.SIMILARITY_THRESHOLD}
              OR EXISTS (SELECT 1 FROM keyword_search WHERE id = ka.id)
              OR ka.title ILIKE '%' || ${cleanQuery} || '%'
          )
          AND ke.parent_id IS NOT NULL
        
        UNION ALL
        
        SELECT 
            ks.id AS article_id, 
            CASE 
                WHEN ks.type = 'URL' THEN 'URL'
                ELSE 'DOCUMENT'
            END AS source_type, 
            ks.name AS title, 
            COALESCE(parent_kpe.content, kpe.content) AS content,
            (
                (1 - (kpe.embedding <=> ${vectorStr}::vector)) * 0.75 +
                COALESCE((SELECT rank FROM pool_keyword_search WHERE id = ks.id LIMIT 1), 0.0) * 0.25
            ) AS similarity,
            ks.trust_score,
            ks.language,
            ks.metadata->>'category' AS category,
            ks.updated_at
        FROM knowledge_pool_embeddings kpe
        JOIN knowledge_sources ks ON kpe.source_id = ks.id
        LEFT JOIN knowledge_pool_embeddings parent_kpe ON kpe.parent_id = parent_kpe.id
        WHERE ks.status = 'ACTIVE' 
          AND (${validProductId}::uuid IS NULL OR ks.product_id = ${validProductId}::uuid OR ks.product_id IS NULL) 
          AND kpe.embedding_version = ${config.version}
          AND kpe.embedding_dim = ${config.dimension}
          AND (
              1 - (kpe.embedding <=> ${vectorStr}::vector) > ${this.SIMILARITY_THRESHOLD}
              OR EXISTS (SELECT 1 FROM pool_keyword_search WHERE id = ks.id)
              OR ks.name ILIKE '%' || ${query} || '%'
          )
          AND kpe.parent_id IS NOT NULL

        UNION ALL

        SELECT
            fe.id AS article_id,
            'FAQ' AS source_type,
            fe.question AS title,
            fe.answer AS content,
            (
                COALESCE(fs.similarity, 0.0) * 0.65 +
                COALESCE((SELECT rank FROM faq_keyword_search WHERE id = fe.id LIMIT 1), 0.0) * 0.25 +
                CASE WHEN fe.question ILIKE '%' || ${cleanQuery} || '%' THEN 0.10 ELSE 0.0 END
            ) AS similarity,
            LEAST((fe.trust_score * fe.feedback_weight)::float, 1.2) AS trust_score,
            fe.language,
            NULL::text AS category,
            fe.updated_at
        FROM faq_entries fe
        LEFT JOIN faq_semantic fs ON fs.id = fe.id
        WHERE fe.status = 'PUBLISHED'
          AND fe.deleted_at IS NULL
          AND (${includeInternal} = true OR fe.is_internal = false)
          AND (
              COALESCE(fs.similarity, 0.0) > ${this.SIMILARITY_THRESHOLD}
              OR EXISTS (SELECT 1 FROM faq_keyword_search WHERE id = fe.id)
              OR fe.question ILIKE '%' || ${cleanQuery} || '%'
          )
      )
      SELECT * 
      FROM combined_search 
      ORDER BY (
        similarity
        * (trust_score::float)
        * CASE
            WHEN language = ${queryLanguage} THEN 1.14
            WHEN language IN ('tr', 'en', 'de') THEN 0.97
            ELSE 1.0
          END
        * CASE
            WHEN category = ${queryCategory} THEN 1.18
            WHEN category IS NULL THEN 1.0
            ELSE 0.98
          END
      ) DESC
      LIMIT ${candidateLimit} -- Fetch enough candidates for intent-aware re-ranking
    `;

        const scoredRows = rows
            .map((row) => {
                const rawSimilarity = Number(row.similarity);
                const languageMultiplier = row.language === queryLanguage ? 1.14 : row.language && ['tr', 'en', 'de'].includes(row.language) ? 0.97 : 1.0;
                const categoryMultiplier = row.category === queryCategory ? 1.18 : row.category ? 0.98 : 1.0;
                const intentCategoryMultiplier = calculateIntentCategoryMultiplier(query, row.category);
                const intentSourceMultiplier = calculateIntentSourceMultiplier(query, row.category, row.title);
                const titleBoost = calculateTitleTokenBoost(queryTokens, row.title);
                const contentSignalBoost = calculateContentSignalBoost(query, row.title, row.content);
                const sourceQualityMultiplier = calculateSourceQualityMultiplier(row.title);
                const rankScore = rawSimilarity * languageMultiplier * categoryMultiplier * intentCategoryMultiplier * intentSourceMultiplier * titleBoost * contentSignalBoost * sourceQualityMultiplier;
                const adjustedSimilarity = Math.min(rankScore, 1);

                return {
                    articleId: row.article_id,
                    sourceType: row.source_type as any,
                    title: row.title,
                    content: row.content,
                    similarity: adjustedSimilarity,
                    confidence: getConfidenceBand(adjustedSimilarity),
                    language: row.language,
                    category: row.category,
                    updatedAt: row.updated_at,
                    rankScore,
                };
            })
            .sort((a, b) => b.rankScore - a.rankScore);

        const results = this.dedupeSearchResults(scoredRows, normalizedLimit)
            .map(({ rankScore: _rankScore, ...result }) => result);

        const diagnostics: SearchDiagnostics = {
            topScore: results.length > 0 ? results[0].similarity : 0,
            passedThreshold: results.length,
            queryEmbeddingModel: config.model,
            thresholdUsed: this.SIMILARITY_THRESHOLD,
        };

        this.logger.log(`📊 Search diagnostics: topScore = ${diagnostics.topScore.toFixed(3)}, passed = ${diagnostics.passedThreshold}, threshold = ${diagnostics.thresholdUsed}, model = ${diagnostics.queryEmbeddingModel} `);

        return { results, diagnostics };
    }

    private dedupeSearchResults<T extends { articleId: string; sourceType: string }>(rows: T[], limit: number): T[] {
        const seen = new Set<string>();
        const deduped: T[] = [];

        for (const row of rows) {
            const key = `${row.sourceType}:${row.articleId}`;
            if (seen.has(key)) continue;
            seen.add(key);
            deduped.push(row);
            if (deduped.length >= limit) break;
        }

        return deduped;
    }

    async indexPoolContent(sourceId: string, content: string, metadata: any = {}): Promise<void> {
        const parentMax = RAG_CONFIG.CHUNKING.PARENT_MAX_TOKENS;
        const contentHash = createHash('md5').update(content).digest('hex');
        const config = await this.registry.getActiveVersionConfig();

        // [DEBUG] Log entry
        this.logger.log(`🧬 Starting indexing for source ${sourceId}. Content length: ${content?.length}`);

        // Use Unsafe for reliable type casting with variables
        const deleted = await this.prisma.$executeRawUnsafe(
            `DELETE FROM knowledge_pool_embeddings WHERE source_id = $1::uuid`,
            sourceId
        );
        this.logger.log(`🗑️ Deleted ${deleted} existing chunks for source ${sourceId}`);

        try {
            const hierarchies = hierarchicalChunk(content, { maxTokens: parentMax });
            this.logger.log(`🧩 Chunker produced ${hierarchies.length} hierarchies for source ${sourceId}`);

            let totalInserted = 0;
            for (const h of hierarchies) {
                const parentId = crypto.randomUUID();
                const parentEmb = this.ensureEmbeddingCompatibility(
                    await this.ai.embed(h.parent),
                    config,
                    `knowledge pool parent ${sourceId}`,
                );
                if (!parentEmb) {
                    this.logger.warn(`⚠️ Parent embedding failed for source ${sourceId}`);
                    continue;
                }
                await this.delayPoolEmbedding();

                const parentVector = JSON.stringify(parentEmb.embedding);
                const parentMeta = JSON.stringify({ ...metadata, hash: contentHash, total_children: h.children.length });

                const res = await this.prisma.$executeRawUnsafe(
                    `INSERT INTO knowledge_pool_embeddings (id, source_id, parent_id, embedding, content, metadata, embedding_version, embedding_dim)
                     VALUES ($1::uuid, $2::uuid, NULL, $3::vector, $4, $5::jsonb, $6, $7)`,
                    parentId, sourceId, parentVector, h.parent, parentMeta, config.version, config.dimension
                );
                this.logger.log(`✅ Parent Insert Res: ${res} | ID: ${parentId}`);
                totalInserted++;

                for (const childContent of h.children) {
                    const childEmb = this.ensureEmbeddingCompatibility(
                        await this.ai.embed(childContent),
                        config,
                        `knowledge pool child ${sourceId}`,
                    );
                    if (childEmb) {
                        const childVector = JSON.stringify(childEmb.embedding);
                        const childMeta = JSON.stringify(metadata);
                        const cRes = await this.prisma.$executeRawUnsafe(
                            `INSERT INTO knowledge_pool_embeddings (id, source_id, parent_id, embedding, content, metadata, embedding_version, embedding_dim)
                             VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3::vector, $4, $5::jsonb, $6, $7)`,
                            sourceId, parentId, childVector, childContent, childMeta, config.version, config.dimension
                        );
                        this.logger.log(`✅ Child Insert Res: ${cRes}`);
                        totalInserted++;
                    }
                    await this.delayPoolEmbedding();
                }
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            if (totalInserted === 0) {
                throw new Error(`No embeddings generated for pool source ${sourceId}`);
            }

            this.logger.log(`📐 FINISHED: Indexed ${totalInserted} chunks for pool source ${sourceId}`);
            this.eventEmitter.emit('knowledge-pool.synced', { sourceId });
        } catch (error) {
            await this.prisma.$executeRawUnsafe(
                `DELETE FROM knowledge_pool_embeddings WHERE source_id = $1::uuid`,
                sourceId
            );
            this.logger.warn(`🧹 Removed partial embeddings after failure for source ${sourceId}`);
            throw error;
        }
    }

    async indexTicket(ticketId: string, content: string): Promise<void> {
        const config = await this.registry.getActiveVersionConfig();
        const result = this.ensureEmbeddingCompatibility(await this.ai.embed(content), config, `ticket ${ticketId}`);
        if (!result) return;

        await this.prisma.$executeRaw`
      INSERT INTO ticket_embeddings(id, ticket_id, embedding, embedding_version, embedding_dim)
        VALUES(gen_random_uuid(), ${ticketId}:: uuid, ${JSON.stringify(result.embedding)}:: vector, ${config.version}, ${config.dimension})
            `;
    }

    async searchTickets(query: string, limit = 3): Promise<Array<{ ticketId: string; subject: string; similarity: number }>> {
        const config = await this.registry.getActiveVersionConfig();
        let embResult: Awaited<ReturnType<typeof this.ai.embed>>;
        try {
            embResult = this.ensureEmbeddingCompatibility(await this.ai.embed(query), config, 'ticket search query');
        } catch (err: any) {
            this.logger.warn(`Ticket search unavailable — embed failed: ${err?.message ?? err}`);
            return [];
        }
        if (!embResult) return [];

        const vectorStr = JSON.stringify(embResult.embedding);
        const rows = await this.prisma.$queryRaw<Array<{ ticket_id: string; subject: string; similarity: number }>>`
      SELECT t.id AS ticket_id, t.subject, 1 - (te.embedding <=> ${vectorStr}::vector) AS similarity
      FROM ticket_embeddings te
      JOIN tickets t ON t.id = te.ticket_id
      WHERE te.embedding_version = ${config.version}
        AND te.embedding_dim = ${config.dimension}
        AND 1 - (te.embedding <=> ${vectorStr}::vector) > ${this.MEDIUM_THRESHOLD}
      ORDER BY similarity DESC LIMIT ${limit}
        `;

        return rows.map((r) => ({ ticketId: r.ticket_id, subject: r.subject, similarity: Number(r.similarity) }));
    }

    /**
     * Public method to embed a single text string.
     * Used by FaqService for semantic deduplication.
     */
    async embedText(text: string): Promise<number[] | null> {
        const config = await this.registry.getActiveVersionConfig();
        const result = this.ensureEmbeddingCompatibility(await this.ai.embed(text), config, 'standalone text');
        return result ? result.embedding : null;
    }

    private async delayPoolEmbedding(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, this.POOL_EMBED_PACING_MS));
    }

    private ensureEmbeddingCompatibility(result: EmbeddingResult | null, config: { dimension: number; model: string }, context: string): EmbeddingResult | null {
        if (!result) return null;

        const actualDimension = result.embedding.length;
        if (actualDimension !== config.dimension) {
            throw new Error(`Embedding dimension mismatch for ${context}: expected ${config.dimension}, got ${actualDimension} from ${result.model}`);
        }

        if (this.normalizeEmbeddingModel(result.model) !== this.normalizeEmbeddingModel(config.model)) {
            throw new Error(`Embedding model mismatch for ${context}: expected ${config.model}, got ${result.model}`);
        }

        return result;
    }

    private normalizeEmbeddingModel(model: string): string {
        return model.replace(/^models\//, '').toLowerCase();
    }

    async reindexAll(): Promise<{ indexed: number; failed: number }> {
        const articles = await this.prisma.knowledgeArticle.findMany({
            where: { status: 'PUBLISHED' },
            include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
        });

        let indexed = 0; let failed = 0;
        for (const article of articles) {
            const version = article.versions[0];
            if (!version) continue;
            try {
                await this.indexArticle(article.id, version.id, article.title, version.content);
                indexed++;
            } catch { failed++; }
        }
        return { indexed, failed };
    }
}
