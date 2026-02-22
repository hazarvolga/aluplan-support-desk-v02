import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';

export interface SearchResult {
    articleId: string;
    sourceType: 'ARTICLE' | 'POOL';
    title: string;
    content: string;
    similarity: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

@Injectable()
export class EmbeddingService {
    private readonly logger = new Logger(EmbeddingService.name);

    private readonly HIGH_THRESHOLD = 0.90;
    private readonly MEDIUM_THRESHOLD = 0.75;

    constructor(
        private readonly prisma: PrismaService,
        private readonly ai: AiService,
    ) { }

    /**
     * Store embedding for a published article version.
     */
    async indexArticle(articleId: string, versionId: string, title: string, content: string): Promise<void> {
        const { smartChunk } = await import('../knowledge-base/utils/smart-chunker');
        const chunks = smartChunk(content, { title, maxTokens: 1000, overlap: 200 });

        await this.prisma.$executeRaw`DELETE FROM knowledge_embeddings WHERE article_version_id = ${versionId}::uuid`;

        for (const chunk of chunks) {
            let result = null;
            let retries = 3;

            while (retries > 0 && !result) {
                result = await this.ai.embed(chunk.content);
                if (!result) {
                    retries--;
                    if (retries > 0) {
                        this.logger.warn(`🔄 Retrying embedding for article ${articleId} chunk ${chunk.sequence} (${retries} attempts left)...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }

            if (!result) {
                this.logger.error(`❌ Failed to index chunk ${chunk.sequence} for article ${articleId} after multiple attempts.`);
                continue;
            }

            await this.prisma.$executeRaw`
                INSERT INTO knowledge_embeddings (id, article_id, article_version_id, embedding, content, sequence, model_name)
                VALUES (gen_random_uuid(), ${articleId}::uuid, ${versionId}::uuid,
                        ${JSON.stringify(result.embedding)}::vector, ${chunk.content}, ${chunk.sequence}, ${result.model})
            `;

            await new Promise(resolve => setTimeout(resolve, 500));
        }

        this.logger.log(`📐 Indexed ${chunks.length} chunks for article ${articleId}`);
    }

    /**
     * Semantic similarity search using pgvector.
     */
    async search(query: string, limit = 5, productId?: string | null): Promise<SearchResult[]> {
        const embResult = await this.ai.embed(query);
        if (!embResult) {
            this.logger.warn('Semantic search unavailable — AI offline');
            return [];
        }

        const vectorStr = JSON.stringify(embResult.embedding);

        const rows = await this.prisma.$queryRaw<
            Array<{
                article_id: string;
                source_type: 'ARTICLE' | 'POOL';
                title: string;
                content: string;
                similarity: number;
            }>
        >`
      WITH combined_search AS (
        SELECT ka.id AS article_id, 'ARTICLE' AS source_type, ka.title, ke.content, 1 - (ke.embedding <=> ${vectorStr}::vector) AS similarity
        FROM knowledge_embeddings ke
        JOIN knowledge_articles ka ON ka.id = ke.article_id
        JOIN knowledge_article_versions kav ON kav.id = ke.article_version_id
        WHERE ka.status = 'PUBLISHED' AND ka.current_version = kav.version AND 1 - (ke.embedding <=> ${vectorStr}::vector) > ${this.MEDIUM_THRESHOLD}
        UNION ALL
        SELECT kpe.source_id AS article_id, 'POOL' AS source_type, ks.name AS title, kpe.content, 1 - (kpe.embedding <=> ${vectorStr}::vector) AS similarity
        FROM knowledge_pool_embeddings kpe
        JOIN knowledge_sources ks ON kpe.source_id = ks.id
        WHERE ks.status = 'ACTIVE' AND (${productId}::uuid IS NULL OR ks.product_id = ${productId}::uuid) AND 1 - (kpe.embedding <=> ${vectorStr}::vector) > ${this.MEDIUM_THRESHOLD}
      )
      SELECT * FROM combined_search ORDER BY similarity DESC LIMIT ${limit}
    `;

        return rows.map((row) => ({
            articleId: row.article_id,
            sourceType: row.source_type,
            title: row.title,
            content: row.content,
            similarity: Number(row.similarity),
            confidence: row.similarity >= this.HIGH_THRESHOLD ? 'HIGH' : row.similarity >= this.MEDIUM_THRESHOLD ? 'MEDIUM' : 'LOW',
        }));
    }

    async indexPoolContent(sourceId: string, content: string, metadata: any = {}): Promise<void> {
        const result = await this.ai.embed(content);
        if (!result) return;

        await this.prisma.$executeRaw`
      INSERT INTO knowledge_pool_embeddings (id, source_id, embedding, content, metadata, model_name)
      VALUES (gen_random_uuid(), ${sourceId}::uuid, ${JSON.stringify(result.embedding)}::vector, ${content}, ${JSON.stringify(metadata)}::jsonb, ${result.model})
    `;
    }

    async indexTicket(ticketId: string, content: string): Promise<void> {
        const result = await this.ai.embed(content);
        if (!result) return;

        await this.prisma.$executeRaw`
      INSERT INTO ticket_embeddings (id, ticket_id, embedding, model_name)
      VALUES (gen_random_uuid(), ${ticketId}::uuid, ${JSON.stringify(result.embedding)}::vector, ${result.model})
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
