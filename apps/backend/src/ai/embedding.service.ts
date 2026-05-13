import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { hierarchicalChunk } from '../knowledge-base/utils/smart-chunker';
import { RAG_CONFIG, getConfidenceBand } from '../config/rag.config';
import { createHash } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmbeddingVersionRegistry } from './embedding-version.registry';

export interface SearchResult {
    articleId: string;
    sourceType: 'ARTICLE' | 'DOCUMENT' | 'URL' | 'TICKET';
    title: string;
    content: string;
    similarity: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
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
            const parentEmb = await this.ai.embed(h.parent);
            if (!parentEmb) continue;

            await this.prisma.$executeRaw`
                INSERT INTO knowledge_embeddings (id, article_id, article_version_id, embedding, content, sequence, parent_id, embedding_version, embedding_dim)
                VALUES (${parentId}::uuid, ${articleId}::uuid, ${versionId}::uuid,
                        ${JSON.stringify(parentEmb.embedding)}::vector, ${h.parent}, 0, NULL, ${config.version}, ${config.dimension})
            `;

            for (let i = 0; i < h.children.length; i++) {
                const childContent = h.children[i];
                const childEmb = await this.ai.embed(childContent);
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
        let embResult: Awaited<ReturnType<typeof this.ai.embed>>;
        try {
            embResult = await this.ai.embed(query);
        } catch (err: any) {
            this.logger.warn(`Semantic search unavailable — embed failed: ${err?.message ?? err}`);
            return { results: [], diagnostics: { topScore: 0, passedThreshold: 0, queryEmbeddingModel: 'unknown', thresholdUsed: 0 } };
        }
        if (!embResult) {
            this.logger.warn('Semantic search unavailable — AI offline');
            return { results: [], diagnostics: { topScore: 0, passedThreshold: 0, queryEmbeddingModel: 'unknown', thresholdUsed: 0 } };
        }

        const config = await this.registry.getActiveVersionConfig();
        const vectorStr = JSON.stringify(embResult.embedding);
        const cleanQuery = query.replace(/['"\\;]/g, '');

        const isValidUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        const validProductId = (productId && isValidUuid(productId)) ? productId : null;

        // Hybrid Arama: 
        // 1. Semantic (Vector) -> %60
        // 2. Keyword (TSVector/BM25 lite) -> %25
        // 3. Headline Match -> %15
        const rows = await this.prisma.$queryRaw<
            Array<{
                article_id: string;
                source_type: 'ARTICLE' | 'POOL' | 'URL' | 'DOCUMENT';
                title: string;
                content: string;
                similarity: number;
                trust_score: number;
                language: string;
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
            ka.updated_at
        FROM knowledge_embeddings ke
        JOIN knowledge_articles ka ON ka.id = ke.article_id
        LEFT JOIN knowledge_embeddings parent ON ke.parent_id = parent.id
        WHERE ka.status = 'PUBLISHED' 
          AND (${includeInternal} = true OR ka.is_internal = false)
          AND ke.embedding_version = ${config.version}
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
            1 - (kpe.embedding <=> ${vectorStr}::vector) AS similarity,
            ks.trust_score,
            ks.language,
            ks.updated_at
        FROM knowledge_pool_embeddings kpe
        JOIN knowledge_sources ks ON kpe.source_id = ks.id
        LEFT JOIN knowledge_pool_embeddings parent_kpe ON kpe.parent_id = parent_kpe.id
        WHERE ks.status = 'ACTIVE' 
          AND (${validProductId}::uuid IS NULL OR ks.product_id = ${validProductId}::uuid OR ks.product_id IS NULL) 
          AND kpe.embedding_version = ${config.version}
          AND 1 - (kpe.embedding <=> ${vectorStr}::vector) > ${this.SIMILARITY_THRESHOLD}
          AND kpe.parent_id IS NOT NULL
      )
      SELECT * 
      FROM combined_search 
      ORDER BY (similarity * (trust_score::float)) DESC 
      LIMIT ${limit * 2} -- Fetch more for Re-ranking
    `;

        const results = rows.map((row) => ({
            articleId: row.article_id,
            sourceType: row.source_type as any,
            title: row.title,
            content: row.content,
            similarity: Number(row.similarity),
            confidence: getConfidenceBand(row.similarity),
            updatedAt: row.updated_at,
        }));

        const diagnostics: SearchDiagnostics = {
            topScore: results.length > 0 ? results[0].similarity : 0,
            passedThreshold: results.length,
            queryEmbeddingModel: config.model,
            thresholdUsed: this.SIMILARITY_THRESHOLD,
        };

        this.logger.log(`📊 Search diagnostics: topScore = ${diagnostics.topScore.toFixed(3)}, passed = ${diagnostics.passedThreshold}, threshold = ${diagnostics.thresholdUsed}, model = ${diagnostics.queryEmbeddingModel} `);

        return { results, diagnostics };
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
                const parentEmb = await this.ai.embed(h.parent);
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
                    const childEmb = await this.ai.embed(childContent);
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
        const result = await this.ai.embed(content);
        if (!result) return;
        const config = await this.registry.getActiveVersionConfig();

        await this.prisma.$executeRaw`
      INSERT INTO ticket_embeddings(id, ticket_id, embedding, embedding_version, embedding_dim)
        VALUES(gen_random_uuid(), ${ticketId}:: uuid, ${JSON.stringify(result.embedding)}:: vector, ${config.version}, ${config.dimension})
            `;
    }

    async searchTickets(query: string, limit = 3): Promise<Array<{ ticketId: string; subject: string; similarity: number }>> {
        let embResult: Awaited<ReturnType<typeof this.ai.embed>>;
        try {
            embResult = await this.ai.embed(query);
        } catch (err: any) {
            this.logger.warn(`Ticket search unavailable — embed failed: ${err?.message ?? err}`);
            return [];
        }
        if (!embResult) return [];
        const config = await this.registry.getActiveVersionConfig();

        const vectorStr = JSON.stringify(embResult.embedding);
        const rows = await this.prisma.$queryRaw<Array<{ ticket_id: string; subject: string; similarity: number }>>`
      SELECT t.id AS ticket_id, t.subject, 1 - (te.embedding <=> ${vectorStr}::vector) AS similarity
      FROM ticket_embeddings te
      JOIN tickets t ON t.id = te.ticket_id
      WHERE te.embedding_version = ${config.version} AND 1 - (te.embedding <=> ${vectorStr}::vector) > ${this.MEDIUM_THRESHOLD}
      ORDER BY similarity DESC LIMIT ${limit}
        `;

        return rows.map((r) => ({ ticketId: r.ticket_id, subject: r.subject, similarity: Number(r.similarity) }));
    }

    /**
     * Public method to embed a single text string.
     * Used by FaqService for semantic deduplication.
     */
    async embedText(text: string): Promise<number[] | null> {
        const result = await this.ai.embed(text);
        return result ? result.embedding : null;
    }

    private async delayPoolEmbedding(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, this.POOL_EMBED_PACING_MS));
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
