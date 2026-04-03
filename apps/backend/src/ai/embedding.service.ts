import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { hierarchicalChunk } from '../knowledge-base/utils/smart-chunker';
import { RAG_CONFIG, getConfidenceBand } from '../config/rag.config';
import { createHash } from 'crypto';

export interface SearchResult {
    articleId: string;
    sourceType: 'ARTICLE' | 'DOCUMENT' | 'URL' | 'TICKET';
    title: string;
    content: string;
    similarity: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
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

    private readonly SIMILARITY_THRESHOLD = RAG_CONFIG.SIMILARITY.THRESHOLD;
    private readonly LOW_CONFIDENCE_THRESHOLD = RAG_CONFIG.SIMILARITY.LOW_CONFIDENCE;
    private readonly HIGH_THRESHOLD = RAG_CONFIG.SIMILARITY.HIGH;
    private readonly MEDIUM_THRESHOLD = RAG_CONFIG.SIMILARITY.MEDIUM;

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
    ) { }

    /**
     * Store embedding for a published article version using Hierarchical (Parent-Child) chunking.
     */
    async indexArticle(articleId: string, versionId: string, title: string, content: string): Promise<void> {
        const parentMax = RAG_CONFIG.CHUNKING.PARENT_MAX_TOKENS;
        const hierarchies = hierarchicalChunk(content, { title, maxTokens: parentMax });
        const modelName = await this.ai.getActiveModelName();

        await this.prisma.$executeRaw`DELETE FROM knowledge_embeddings WHERE article_version_id = ${versionId}::uuid`;

        for (const h of hierarchies) {
            const parentId = crypto.randomUUID();
            const parentEmb = await this.ai.embed(h.parent);
            if (!parentEmb) continue;

            await this.prisma.$executeRaw`
                INSERT INTO knowledge_embeddings (id, article_id, article_version_id, embedding, content, sequence, model_name, parent_id)
                VALUES (${parentId}::uuid, ${articleId}::uuid, ${versionId}::uuid,
                        ${JSON.stringify(parentEmb)}::vector, ${h.parent}, 0, ${modelName}, NULL)
            `;

            for (let i = 0; i < h.children.length; i++) {
                const childContent = h.children[i];
                const childEmb = await this.ai.embed(childContent);
                if (childEmb) {
                    await this.prisma.$executeRaw`
                        INSERT INTO knowledge_embeddings (id, article_id, article_version_id, embedding, content, sequence, model_name, parent_id)
                        VALUES (gen_random_uuid(), ${articleId}::uuid, ${versionId}::uuid,
                                ${JSON.stringify(childEmb)}::vector, ${childContent}, ${i + 1}, ${modelName}, ${parentId}::uuid)
                    `;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        this.logger.log(`📐 Indexed ${hierarchies.length} hierarchies for article ${articleId}`);
    }

    /**
     * Semantic similarity search using pgvector with Trust Score re-ranking.
     */
    async search(query: string, limit = 5, productId?: string | null, includeInternal = false): Promise<SearchResponse> {
        const embResult = await this.ai.embed(query);
        if (!embResult) {
            this.logger.warn('Semantic search unavailable — AI offline');
            return { results: [], diagnostics: { topScore: 0, passedThreshold: 0, queryEmbeddingModel: 'unknown', thresholdUsed: 0 } };
        }

        const modelName = await this.ai.getActiveModelName();
        const vectorStr = JSON.stringify(embResult.embedding);
        const cleanQuery = query.replace(/['"\\;]/g, '');

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
            }>
        >`
      // Safety check: Does 'headline_embedding' exist in production knowledge_articles?
      // Since prisma.$queryRaw is sensitive to missing columns, we'll check schema or just use a safe COALESCE approach
      // but standard SQL doesn't easily handle missing columns without dynamic SQL.
      // Better strategy: We can check if we should even try based on metadata or just provide a fallback.
      
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
                /* headline_embedding booster - only active if column exists and is populated */
                COALESCE(
                  (1 - (ke.embedding <=> ${vectorStr}::vector)), /* Fallback to standard similarity if booster fails */
                  0.0
                ) * 0.15 +
                 COALESCE((SELECT rank FROM keyword_search WHERE id = ka.id LIMIT 1), 0.0) * 0.25
            ) AS similarity,
            ka.trust_score,
            ka.language
        FROM knowledge_embeddings ke
        JOIN knowledge_articles ka ON ka.id = ke.article_id
        LEFT JOIN knowledge_embeddings parent ON ke.parent_id = parent.id
        WHERE ka.status = 'PUBLISHED' 
          AND (${includeInternal} = true OR ka.is_internal = false)
          AND ke.model_name = ${modelName}
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
            ks.language
        FROM knowledge_pool_embeddings kpe
        JOIN knowledge_sources ks ON kpe.source_id = ks.id
        LEFT JOIN knowledge_pool_embeddings parent_kpe ON kpe.parent_id = parent_kpe.id
        WHERE ks.status = 'ACTIVE' 
          AND (${productId}::uuid IS NULL OR ks.product_id = ${productId}::uuid) 
          AND kpe.model_name = ${modelName}
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
        }));

        const diagnostics: SearchDiagnostics = {
            topScore: results.length > 0 ? results[0].similarity : 0,
            passedThreshold: results.length,
            queryEmbeddingModel: modelName,
            thresholdUsed: this.SIMILARITY_THRESHOLD,
        };

        this.logger.log(`📊 Search diagnostics: topScore = ${diagnostics.topScore.toFixed(3)}, passed = ${diagnostics.passedThreshold}, threshold = ${diagnostics.thresholdUsed}, model = ${diagnostics.queryEmbeddingModel} `);

        return { results, diagnostics };
    }

    async indexPoolContent(sourceId: string, content: string, metadata: any = {}): Promise<void> {
        const parentMax = RAG_CONFIG.CHUNKING.PARENT_MAX_TOKENS;
        const contentHash = createHash('md5').update(content).digest('hex');

        const existing = await this.prisma.knowledgePoolEmbedding.findFirst({
            where: { sourceId, metadata: { path: ['hash'], equals: contentHash } }
        });
        if (existing) return;

        const hierarchies = hierarchicalChunk(content, { maxTokens: parentMax });
        const modelName = await this.ai.getActiveModelName();

        await this.prisma.$executeRaw`DELETE FROM knowledge_pool_embeddings WHERE source_id = ${sourceId}:: uuid`;

        for (const h of hierarchies) {
            const parentId = crypto.randomUUID();
            const parentEmb = await this.ai.embed(h.parent);
            if (!parentEmb) continue;

            await this.prisma.$executeRaw`
                INSERT INTO knowledge_pool_embeddings(id, source_id, parent_id, embedding, content, metadata, model_name)
        VALUES(${parentId}:: uuid, ${sourceId}:: uuid, NULL,
            ${JSON.stringify(parentEmb)}:: vector, ${h.parent}, ${JSON.stringify({ ...metadata, hash: contentHash, total_children: h.children.length })}:: jsonb, ${modelName})
            `;

            for (const childContent of h.children) {
                const childEmb = await this.ai.embed(childContent);
                if (childEmb) {
                    await this.prisma.$executeRaw`
                        INSERT INTO knowledge_pool_embeddings(id, source_id, parent_id, embedding, content, metadata, model_name)
        VALUES(gen_random_uuid(), ${sourceId}:: uuid, ${parentId}:: uuid,
            ${JSON.stringify(childEmb)}:: vector, ${childContent}, ${JSON.stringify(metadata)}:: jsonb, ${modelName})
                    `;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        this.logger.log(`📐 Indexed ${hierarchies.length} hierarchies for pool source ${sourceId} `);
    }

    async indexTicket(ticketId: string, content: string): Promise<void> {
        const result = await this.ai.embed(content);
        if (!result) return;

        await this.prisma.$executeRaw`
      INSERT INTO ticket_embeddings(id, ticket_id, embedding, model_name)
        VALUES(gen_random_uuid(), ${ticketId}:: uuid, ${JSON.stringify(result.embedding)}:: vector, ${result.model})
            `;
    }

    async searchTickets(query: string, limit = 3): Promise<Array<{ ticketId: string; subject: string; similarity: number }>> {
        const embResult = await this.ai.embed(query);
        if (!embResult) return [];

        const vectorStr = JSON.stringify(embResult.embedding);
        const rows = await this.prisma.$queryRaw<Array<{ ticket_id: string; subject: string; similarity: number }>>`
      SELECT t.id AS ticket_id, t.subject, 1 - (te.embedding <=> ${vectorStr}::vector) AS similarity
      FROM ticket_embeddings te
      JOIN tickets t ON t.id = te.ticket_id
      WHERE 1 - (te.embedding <=> ${vectorStr}::vector) > ${this.MEDIUM_THRESHOLD}
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
