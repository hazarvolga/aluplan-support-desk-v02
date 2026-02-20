import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OllamaService } from './ollama.service';

export interface SearchResult {
    articleId: string;
    title: string;
    content: string;
    similarity: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

@Injectable()
export class EmbeddingService {
    private readonly logger = new Logger(EmbeddingService.name);

    // Thresholds — can be moved to Settings table
    private readonly HIGH_THRESHOLD = 0.90;
    private readonly MEDIUM_THRESHOLD = 0.75;

    constructor(
        private readonly prisma: PrismaService,
        private readonly ollama: OllamaService,
    ) { }

    /**
     * Store embedding for a published article version.
     * Called asynchronously after article is approved/published.
     */
    async indexArticle(articleId: string, versionId: string, content: string): Promise<void> {
        const result = await this.ollama.embed(content);
        if (!result) {
            this.logger.warn(`⚠️ Skipping embedding for article ${articleId} — Ollama unavailable`);
            return;
        }

        // Store as pgvector via raw query (Prisma doesn't natively support vector literals)
        await this.prisma.$executeRaw`
      INSERT INTO knowledge_embeddings (id, article_id, article_version_id, embedding, model_name)
      VALUES (gen_random_uuid(), ${articleId}::uuid, ${versionId}::uuid,
              ${JSON.stringify(result.embedding)}::vector, ${result.model})
      ON CONFLICT (article_id, article_version_id) DO UPDATE
        SET embedding = EXCLUDED.embedding,
            model_name = EXCLUDED.model_name,
            updated_at = NOW()
    `;
        this.logger.log(`📐 Indexed embedding for article ${articleId}`);
    }

    /**
     * Semantic similarity search using pgvector cosine distance.
     * Returns ranked results with confidence band.
     */
    async search(query: string, limit = 5): Promise<SearchResult[]> {
        const embResult = await this.ollama.embed(query);
        if (!embResult) {
            this.logger.warn('Semantic search unavailable — Ollama offline');
            return [];
        }

        const vectorStr = JSON.stringify(embResult.embedding);

        // Cosine similarity search using pgvector <=> operator
        const rows = await this.prisma.$queryRaw<
            Array<{
                article_id: string;
                title: string;
                content: string;
                similarity: number;
            }>
        >`
      SELECT
        ka.id AS article_id,
        ka.title,
        kav.content,
        1 - (ke.embedding <=> ${vectorStr}::vector) AS similarity
      FROM knowledge_embeddings ke
      JOIN knowledge_articles ka ON ka.id = ke.article_id
      JOIN knowledge_article_versions kav ON kav.id = ke.article_version_id
      WHERE ka.status = 'PUBLISHED'
        AND 1 - (ke.embedding <=> ${vectorStr}::vector) > ${this.MEDIUM_THRESHOLD}
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;

        return rows.map((row) => ({
            articleId: row.article_id,
            title: row.title,
            content: row.content,
            similarity: Number(row.similarity),
            confidence:
                row.similarity >= this.HIGH_THRESHOLD
                    ? 'HIGH'
                    : row.similarity >= this.MEDIUM_THRESHOLD
                        ? 'MEDIUM'
                        : 'LOW',
        }));
    }
    /**
     * Store embedding for raw content from the Knowledge Pool.
     */
    async indexPoolContent(sourceId: string, content: string, metadata: any = {}): Promise<void> {
        const result = await this.ollama.embed(content);
        if (!result) {
            this.logger.warn(`⚠️ Skipping pool embedding for source ${sourceId} — Ollama unavailable`);
            return;
        }

        await this.prisma.$executeRaw`
      INSERT INTO knowledge_pool_embeddings (id, source_id, embedding, content, metadata, model_name)
      VALUES (gen_random_uuid(), ${sourceId}::uuid, ${JSON.stringify(result.embedding)}::vector, 
              ${content}, ${JSON.stringify(metadata)}::jsonb, ${result.model})
    `;
        this.logger.log(`📐 Indexed pool embedding for source ${sourceId}`);
    }

    async reindexAll(): Promise<{ indexed: number; failed: number }> {
        const articles = await this.prisma.knowledgeArticle.findMany({
            where: { status: 'PUBLISHED' },
            include: {
                versions: { orderBy: { version: 'desc' }, take: 1 },
            },
        });

        let indexed = 0;
        let failed = 0;

        for (const article of articles) {
            const version = article.versions[0];
            if (!version) continue;
            try {
                await this.indexArticle(article.id, version.id, version.content);
                indexed++;
            } catch {
                failed++;
            }
        }

        return { indexed, failed };
    }
}
