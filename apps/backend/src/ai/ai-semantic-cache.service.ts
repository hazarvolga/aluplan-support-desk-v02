import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';
import { EmbeddingNormalizer } from './embedding-normalizer.service';
import { RedisService } from '../redis/redis.service';
import { AiQueryResult } from './ai-query.service';
import { createHash } from 'crypto';
import { EmbeddingVersionRegistry } from './embedding-version.registry';
import { Prisma } from '@aluplan/database';
import { RAG_CONFIG } from '../config/rag.config';

export interface AiCacheScope {
    userId: string;
    audience: 'agent' | 'customer';
    productId?: string | null;
    language: string;
    routeLocale: string;
    contextFingerprint: string;
}

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
 * - Requester and audience isolation
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
        private readonly registry: EmbeddingVersionRegistry,
    ) { }

    /**
     * Try to get a cached response (exact → semantic fallback).
     */
    async get(
        query: string,
        scope: AiCacheScope,
    ): Promise<AiQueryResult | null> {
        const scopeHash = this.buildScopeHash(scope);
        const exactKey = this.buildExactKey(query, scopeHash);

        // Tier 1: Exact match (Redis)
        const exactCached = await this.getExactMatch(exactKey);
        if (exactCached) {
            await this.recordHit('exact');
            this.logger.log(`⚡ [Exact Cache Hit] audience=${scope.audience}`);
            return exactCached;
        }

        // Tier 2: Semantic match (pgvector)
        const semanticCached = await this.getSemanticMatch(query, scopeHash);
        if (semanticCached) {
            await this.recordHit('semantic');
            this.logger.log(`🔍 [Semantic Cache Hit] audience=${scope.audience}, similarity>${this.SEMANTIC_THRESHOLD}`);
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
        scope: AiCacheScope,
        result: AiQueryResult,
    ): Promise<void> {
        const scopeHash = this.buildScopeHash(scope);
        const exactKey = this.buildExactKey(query, scopeHash);

        // Store exact match in Redis
        await this.setExact(exactKey, result);

        // Store semantic match in pgvector
        await this.setSemantic(query, scopeHash, result);
    }

    /**
     * Invalidate cache for a tenant (e.g., after KB update).
     */
    async invalidateScope(scope: AiCacheScope): Promise<void> {
        const scopeHash = this.buildScopeHash(scope);
        const scopeId = this.scopeHashToUuid(scopeHash);
        // Delete semantic cache entries
        await this.prisma.$executeRaw`DELETE FROM "ai_response_cache" WHERE "tenant_id" = ${scopeId}::uuid`;

        // Delete exact cache entries (pattern-based)
        const pattern = `ai:query:cache:*:scope:${scopeHash}:*`;
        await this.redis.getClient().eval(
            `local keys = redis.call('keys', ARGV[1])\nfor i=1,#keys do\n  redis.call('del', keys[i])\nend\nreturn #keys`,
            0,
            pattern,
        );

        this.logger.log(`🗑️ Cache invalidated for audience=${scope.audience}`);
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
            const parsed = JSON.parse(cached);
            return parsed?.cacheVersion === RAG_CONFIG.CACHE.VERSION ? parsed : null;
        } catch {
            return null;
        }
    }

    private async setExact(key: string, result: AiQueryResult): Promise<void> {
        await this.redis.set(key, JSON.stringify({ ...result, cacheVersion: RAG_CONFIG.CACHE.VERSION }), this.DEFAULT_TTL_SECONDS);
    }

    // ─── Private: Semantic Match (pgvector) ─────────────────────────────────

    private async getSemanticMatch(
        query: string,
        scopeHash: string,
    ): Promise<AiQueryResult | null> {
        try {
            const config = await this.registry.getActiveVersionConfig();
            const scopeId = this.scopeHashToUuid(scopeHash);
            const embedding = await this.embeddingService.embedText(query);
            if (!embedding) return null;

            const normalized = this.normalizer.normalize(
                embedding,
                'canonical',
                config.dimension,
            );
            const vectorStr = `[${normalized.join(',')}]`;

            const safeVector = this.sanitizeVector(vectorStr);
            const vectorCast = Prisma.raw(`'${safeVector}'::vector`);
            const results: any[] = await this.prisma.$queryRaw(
                Prisma.sql`SELECT id, response, "query_embedding" <=> ${vectorCast} AS distance
                 FROM "ai_response_cache"
                 WHERE "tenant_id" = ${scopeId}::uuid
                   AND "embedding_version" = ${config.version}
                   AND "embedding_dim" = ${config.dimension}
                   AND "expires_at" > NOW()
                 ORDER BY "query_embedding" <=> ${vectorCast}
                 LIMIT 1`
            );

            if (results.length === 0) return null;

            const similarity = 1 - parseFloat(results[0].distance);
            if (similarity >= this.SEMANTIC_THRESHOLD) {
                const response = results[0].response as AiQueryResult;
                return response?.cacheVersion === RAG_CONFIG.CACHE.VERSION ? response : null;
            }

            return null;
        } catch (error: any) {
            this.logger.warn(`Semantic cache lookup failed: ${error.message}`);
            return null;
        }
    }

    private async setSemantic(
        query: string,
        scopeHash: string,
        result: AiQueryResult,
    ): Promise<void> {
        try {
            const config = await this.registry.getActiveVersionConfig();
            const scopeId = this.scopeHashToUuid(scopeHash);
            const embedding = await this.embeddingService.embedText(query);
            if (!embedding) return;

            const normalized = this.normalizer.normalize(
                embedding,
                'canonical',
                config.dimension,
            );
            const vectorStr = `[${normalized.join(',')}]`;
            const hash = createHash('sha256').update(query + scopeHash).digest('hex');
            const expiresAt = new Date(Date.now() + this.DEFAULT_TTL_SECONDS * 1000);

            const safeVector = this.sanitizeVector(vectorStr);
            const vectorCast = Prisma.raw(`'${safeVector}'::vector`);
            const versionedResult = { ...result, cacheVersion: RAG_CONFIG.CACHE.VERSION };
            const responseJson = Prisma.raw(`'${JSON.stringify(versionedResult).replace(/'/g, "''")}'::jsonb`);
            await this.prisma.$executeRaw(
                Prisma.sql`INSERT INTO "ai_response_cache" (
                    "query_hash", "query_embedding", "embedding_version", "embedding_dim", "response", "tenant_id",
                    "confidence", "created_at", "expires_at"
                ) VALUES (
                    ${hash}, ${vectorCast}, ${config.version}, ${config.dimension},
                    ${responseJson},
                    ${scopeId}::uuid, ${result.confidence},
                    NOW(), ${expiresAt.toISOString()}
                )
                ON CONFLICT ("query_hash") DO UPDATE SET
                    "query_embedding" = EXCLUDED."query_embedding",
                    "embedding_version" = EXCLUDED."embedding_version",
                    "embedding_dim" = EXCLUDED."embedding_dim",
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

    // Validate vector contains only floats — guards against injection via Prisma.raw
    private sanitizeVector(vectorStr: string): string {
        if (!/^\[[\d.,\s\-e+]+\]$/.test(vectorStr)) {
            throw new Error(`Invalid vector format — potential injection attempt`);
        }
        return vectorStr;
    }

    private buildExactKey(
        query: string,
        scopeHash: string,
    ): string {
        const hash = createHash('sha256')
            .update(query + scopeHash)
            .digest('hex');
        return `ai:query:cache:${RAG_CONFIG.CACHE.VERSION}:exact:scope:${scopeHash}:${hash}`;
    }

    private buildScopeHash(scope: AiCacheScope): string {
        return createHash('sha256')
            .update(JSON.stringify({
                audience: scope.audience,
                contextFingerprint: scope.contextFingerprint,
                language: scope.language,
                productId: scope.productId ?? null,
                routeLocale: scope.routeLocale,
                userId: scope.userId,
            }))
            .digest('hex');
    }

    private scopeHashToUuid(scopeHash: string): string {
        return `${scopeHash.slice(0, 8)}-${scopeHash.slice(8, 12)}-${scopeHash.slice(12, 16)}-${scopeHash.slice(16, 20)}-${scopeHash.slice(20, 32)}`;
    }
}
