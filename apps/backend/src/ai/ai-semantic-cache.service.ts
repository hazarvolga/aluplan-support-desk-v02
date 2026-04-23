import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';
import { EmbeddingNormalizer } from './embedding-normalizer.service';
import { RedisService } from '../redis/redis.service';
import { AiQueryResult } from './ai-query.service';
import { createHash } from 'crypto';

/**
 * AI Semantic Cache
 *
 * Two-tier caching system for AI query responses:
 *
 * Tier 1 — Exact Match (Redis + SHA-256):
 *   - Ultra-fast (<1ms)
 *   - Same query string → identical response
 *
 * Tier 2 — Semantic Match (pgvector + cosine similarity):
 *   - Slightly slower (~10-50ms)
 *   - Similar meaning → same response
 *   - Threshold: cosine similarity > 0.95
 *
 * Guarantees:
 * - Vector DB consistency via EmbeddingNormalizer (canonical space)
 * - TTL-based expiration (configurable)
 * - Tenant isolation
 * - Cache hit metrics via Redis counters
 */
@Injectable()
export class AiSemanticCache {
    private readonly logger = new Logger(AiSemanticCache.name);
    private readonly SEMANTIC_THRESHOLD = 0.95;
    private readonly DEFAULT_TTL_SECONDS = 3600; // 1 hour

    constructor(
        private readonly prisma: PrismaService,
        private readonly embeddingService: EmbeddingService,
        private readonly normalizer: EmbeddingNormalizer,
        private readonly redis: RedisService,
    ) { }

    /**
     * Try to get a cached response (exact → semantic fallback).
     */
    async get(
        query: string,
        tenantId: string,
        options?: {
            userId?: string;
            language?: string;
            hotinfoContext?: any;
        },
    ): Promise<AiQueryResult | null> {
        const exactKey = this.buildExactKey(query, tenantId, options);

        // Tier 1: Exact match (Redis)
        const exactCached = await this.getExactMatch(exactKey);
        if (exactCached) {
            await this.recordHit('exact');
            this.logger.log(`⚡ [Exact Cache Hit] tenant=${tenantId}`);
            return exactCached;
        }

        // Tier 2: Semantic match (pgvector)
        const semanticCached = await this.getSemanticMatch(query, tenantId);
        if (semanticCached) {
            await this.recordHit('semantic');
            this.logger.log(`🔍 [Semantic Cache Hit] tenant=${tenantId}, similarity>${this.SEMANTIC_THRESHOLD}`);
            // Also populate exact cache for next time
            await this.setExact(exactKey, semanticCached);
            return semanticCached;
        }

        await this.recordMiss();
        return null;
    }

    /**
     * Store a response in both cache tiers.
     */
    async set(
        query: string,
        tenantId: string,
        result: AiQueryResult,
        options?: {
            userId?: string;
            language?: string;
            hotinfoContext?: any;
        },
    ): Promise<void> {
        const exactKey = this.buildExactKey(query, tenantId, options);

        // Store exact match in Redis
        await this.setExact(exactKey, result);

        // Store semantic match in pgvector
        await this.setSemantic(query, tenantId, result);
    }

    /**
     * Invalidate cache for a tenant (e.g., after KB update).
     */
    async invalidateTenant(tenantId: string): Promise<void> {
        // Delete semantic cache entries
        await this.prisma.$executeRawUnsafe(
            `DELETE FROM "ai_response_cache" WHERE "tenant_id" = '${tenantId}'`
        );

        // Delete exact cache entries (pattern-based)
        const pattern = `ai:query:cache:*:tenant:${tenantId}:*`;
        await this.redis.getClient().eval(
            `local keys = redis.call('keys', ARGV[1])\nfor i=1,#keys do\n  redis.call('del', keys[i])\nend\nreturn #keys`,
            0,
            pattern,
        );

        this.logger.log(`🗑️ Cache invalidated for tenant ${tenantId}`);
    }

    /**
     * Get cache statistics.
     */
    async getStats(): Promise<{
        exactHits: number;
        semanticHits: number;
        misses: number;
        totalRequests: number;
        hitRate: number;
    }> {
        const exactHits = parseInt((await this.redis.get('ai:cache:exact_hits')) || '0', 10);
        const semanticHits = parseInt((await this.redis.get('ai:cache:semantic_hits')) || '0', 10);
        const misses = parseInt((await this.redis.get('ai:cache:misses')) || '0', 10);
        const total = exactHits + semanticHits + misses;
        return {
            exactHits,
            semanticHits,
            misses,
            totalRequests: total,
            hitRate: total > 0 ? (exactHits + semanticHits) / total : 0,
        };
    }

    // ─── Private: Exact Match (Redis) ───────────────────────────────────────

    private async getExactMatch(key: string): Promise<AiQueryResult | null> {
        const cached = await this.redis.get(key);
        if (!cached) return null;
        try {
            return JSON.parse(cached);
        } catch {
            return null;
        }
    }

    private async setExact(key: string, result: AiQueryResult): Promise<void> {
        await this.redis.set(key, JSON.stringify(result), this.DEFAULT_TTL_SECONDS);
    }

    // ─── Private: Semantic Match (pgvector) ─────────────────────────────────

    private async getSemanticMatch(
        query: string,
        tenantId: string,
    ): Promise<AiQueryResult | null> {
        try {
            const embedding = await this.embeddingService.embed(query);
            if (!embedding?.embedding) return null;

            const normalized = this.normalizer.normalize(
                embedding.embedding,
                'canonical',
                1536,
            );
            const vectorStr = `[${normalized.join(',')}]`;

            const results: any[] = await this.prisma.$queryRawUnsafe(
                `SELECT id, response, "query_embedding" <=> '${vectorStr}'::vector AS distance
                 FROM "ai_response_cache"
                 WHERE "tenant_id" = '${tenantId}'
                   AND "expires_at" > NOW()
                 ORDER BY "query_embedding" <=> '${vectorStr}'::vector
                 LIMIT 1`
            );

            if (results.length === 0) return null;

            const similarity = 1 - parseFloat(results[0].distance);
            if (similarity >= this.SEMANTIC_THRESHOLD) {
                return results[0].response as AiQueryResult;
            }

            return null;
        } catch (error: any) {
            this.logger.warn(`Semantic cache lookup failed: ${error.message}`);
            return null;
        }
    }

    private async setSemantic(
        query: string,
        tenantId: string,
        result: AiQueryResult,
    ): Promise<void> {
        try {
            const embedding = await this.embeddingService.embed(query);
            if (!embedding?.embedding) return;

            const normalized = this.normalizer.normalize(
                embedding.embedding,
                'canonical',
                1536,
            );
            const vectorStr = `[${normalized.join(',')}]`;
            const hash = createHash('sha256').update(query).digest('hex');
            const expiresAt = new Date(Date.now() + this.DEFAULT_TTL_SECONDS * 1000);

            await this.prisma.$executeRawUnsafe(
                `INSERT INTO "ai_response_cache" (
                    "query_hash", "query_embedding", "response", "tenant_id",
                    "confidence", "created_at", "expires_at"
                ) VALUES (
                    '${hash}', '${vectorStr}'::vector,
                    '${JSON.stringify(result).replace(/'/g, "''")}'::jsonb,
                    '${tenantId}', '${result.confidence}',
                    NOW(), '${expiresAt.toISOString()}'
                )
                ON CONFLICT ("query_hash") DO UPDATE SET
                    "query_embedding" = EXCLUDED."query_embedding",
                    "response" = EXCLUDED."response",
                    "expires_at" = EXCLUDED."expires_at"`
            );
        } catch (error: any) {
            this.logger.warn(`Semantic cache store failed: ${error.message}`);
        }
    }

    // ─── Private: Metrics ───────────────────────────────────────────────────

    private async recordHit(type: 'exact' | 'semantic'): Promise<void> {
        const key = type === 'exact' ? 'ai:cache:exact_hits' : 'ai:cache:semantic_hits';
        await this.redis.getClient().incr(key);
    }

    private async recordMiss(): Promise<void> {
        await this.redis.getClient().incr('ai:cache:misses');
    }

    private buildExactKey(
        query: string,
        tenantId: string,
        options?: { userId?: string; language?: string; hotinfoContext?: any },
    ): string {
        const hash = createHash('sha256')
            .update(query + tenantId + (options?.language || '') + JSON.stringify(options?.hotinfoContext || ''))
            .digest('hex');
        return `ai:query:cache:v6:exact:${tenantId}:${hash}`;
    }
}
