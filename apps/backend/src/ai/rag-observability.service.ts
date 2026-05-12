/**
 * RAG Observability Service
 * =========================
 * Collects RAG pipeline metrics for monitoring, diagnostics, and continuous improvement.
 * Provides both programmatic metrics and a REST-accessible health endpoint.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SettingsService } from '../settings/settings.service';

export interface RAGMetrics {
    // Performance
    avgLatencyMs: number;
    totalQueries24h: number;

    // Quality Distribution
    highConfidenceRate: number;
    mediumConfidenceRate: number;
    lowConfidenceRate: number;
    noMatchRate: number;

    // Business Impact
    deflectionRate: number;      // AI solved, no ticket created
    avgSimilarityScore: number;

    // Knowledge Base Health
    totalArticleEmbeddings: number;
    totalPoolEmbeddings: number;
    embeddingModelDistribution: Record<string, number>;

    // Cache Performance
    cacheHitRate: number;

    // Timestamp
    collectedAt: string;
}

export interface FailedQueryPattern {
    query: string;
    count: number;
    lastSeen: string;
    sampleInteractionId: string;
}

@Injectable()
export class RagObservabilityService {
    private readonly logger = new Logger(RagObservabilityService.name);

    // In-memory counters (reset each hour)
    private queryCount = 0;
    private cacheHits = 0;
    private totalLatencyMs = 0;

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly settings: SettingsService,
    ) { }

    /** Record a query execution for metrics */
    recordQuery(latencyMs: number, cacheHit: boolean) {
        this.queryCount++;
        this.totalLatencyMs += latencyMs;
        if (cacheHit) this.cacheHits++;
    }

    /** Collect comprehensive RAG metrics from database */
    async collectMetrics(): Promise<RAGMetrics> {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Query confidence distribution
        const interactions = await this.prisma.aiInteraction.findMany({
            where: { createdAt: { gte: last24h } },
            select: { confidenceBand: true, autoAnswered: true, similarityScore: true },
        });

        const total = interactions.length || 1;
        const high = interactions.filter(i => i.confidenceBand === 'HIGH').length;
        const medium = interactions.filter(i => i.confidenceBand === 'MEDIUM').length;
        const low = interactions.filter(i => i.confidenceBand === 'LOW').length;
        const noMatch = interactions.filter(i => i.confidenceBand === null).length;
        const autoAnswered = interactions.filter(i => i.autoAnswered).length;

        const avgSimilarity = interactions
            .filter(i => i.similarityScore)
            .reduce((sum, i) => sum + Number(i.similarityScore), 0) / (interactions.filter(i => i.similarityScore).length || 1);

        // Embedding counts
        const [articleEmbCount, poolEmbCount] = await Promise.all([
            this.prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM knowledge_embeddings`,
            this.prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM knowledge_pool_embeddings`,
        ]);

        // Model distribution
        const modelDist = await this.prisma.$queryRaw<Array<{ model_name: string; count: bigint }>>`
      SELECT model_name, COUNT(*) as count FROM knowledge_embeddings GROUP BY model_name
      UNION ALL
      SELECT model_name, COUNT(*) as count FROM knowledge_pool_embeddings GROUP BY model_name
    `;

        const embeddingModelDistribution: Record<string, number> = {};
        for (const row of modelDist) {
            embeddingModelDistribution[row.model_name] = (embeddingModelDistribution[row.model_name] || 0) + Number(row.count);
        }

        const metrics: RAGMetrics = {
            avgLatencyMs: this.queryCount > 0 ? Math.round(this.totalLatencyMs / this.queryCount) : 0,
            totalQueries24h: total,
            highConfidenceRate: Math.round((high / total) * 100),
            mediumConfidenceRate: Math.round((medium / total) * 100),
            lowConfidenceRate: Math.round((low / total) * 100),
            noMatchRate: Math.round((noMatch / total) * 100),
            deflectionRate: Math.round((autoAnswered / total) * 100),
            avgSimilarityScore: Math.round(avgSimilarity * 1000) / 1000,
            totalArticleEmbeddings: Number(articleEmbCount[0]?.count || 0),
            totalPoolEmbeddings: Number(poolEmbCount[0]?.count || 0),
            embeddingModelDistribution,
            cacheHitRate: this.queryCount > 0 ? Math.round((this.cacheHits / this.queryCount) * 100) : 0,
            collectedAt: new Date().toISOString(),
        };

        return metrics;
    }

    /** Detect frequently failing queries (no match patterns) */
    async detectFailedQueryPatterns(hours = 24): Promise<FailedQueryPattern[]> {
        const since = new Date(Date.now() - hours * 60 * 60 * 1000);

        const failedQueries = await this.prisma.aiInteraction.findMany({
            where: {
                confidenceBand: null,
                createdAt: { gte: since },
            },
            select: { id: true, userQuery: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
        });

        // Group by normalized query, track first interaction ID per pattern
        const queryMap = new Map<string, { count: number; lastSeen: Date; sampleInteractionId: string }>();
        for (const fq of failedQueries) {
            const normalized = fq.userQuery.toLowerCase().trim().substring(0, 100);
            const existing = queryMap.get(normalized);
            if (existing) {
                existing.count++;
                if (fq.createdAt > existing.lastSeen) existing.lastSeen = fq.createdAt;
            } else {
                queryMap.set(normalized, { count: 1, lastSeen: fq.createdAt, sampleInteractionId: fq.id });
            }
        }

        return Array.from(queryMap.entries())
            .map(([query, data]) => ({
                query,
                count: data.count,
                lastSeen: data.lastSeen.toISOString(),
                sampleInteractionId: data.sampleInteractionId,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);
    }

    /** Hourly cron: log metrics and detect knowledge gaps */
    @Cron(CronExpression.EVERY_HOUR)
    async hourlyMetricsCollection() {
        try {
            const metrics = await this.collectMetrics();
            const failedPatterns = await this.detectFailedQueryPatterns(1);

            // Store in Redis for dashboard access
            await this.redis.set('rag:metrics:latest', JSON.stringify(metrics), 7200);

            this.logger.log(`📊 RAG Metrics [${metrics.totalQueries24h} queries/24h]: ` +
                `HIGH=${metrics.highConfidenceRate}% MED=${metrics.mediumConfidenceRate}% ` +
                `LOW=${metrics.lowConfidenceRate}% NO_MATCH=${metrics.noMatchRate}% ` +
                `Deflection=${metrics.deflectionRate}% AvgSim=${metrics.avgSimilarityScore}`);

            if (failedPatterns.length > 0) {
                this.logger.warn(`⚠️ Knowledge gaps detected (${failedPatterns.length} patterns): ` +
                    failedPatterns.slice(0, 3).map(p => `"${p.query}" (${p.count}x)`).join(', '));

                // Push recurring patterns (seen 2+ times) to TrainingQueue for admin review
                // R-T1: status defaults to PENDING — admin approval required before any action
                const significant = failedPatterns.filter(p => p.count >= 2);
                let queued = 0;
                for (const pattern of significant) {
                    const already = await this.prisma.trainingQueue.findFirst({
                        where: { interactionId: pattern.sampleInteractionId },
                        select: { id: true },
                    });
                    if (!already) {
                        await this.prisma.trainingQueue.create({
                            data: { interactionId: pattern.sampleInteractionId },
                        }).catch(err => this.logger.warn(`TrainingQueue create failed: ${err.message}`));
                        queued++;
                    }
                }
                if (queued > 0) {
                    this.logger.log(`📚 ${queued} recurring no-match patterns queued for training review`);
                }
            }

            // Reset in-memory counters
            this.queryCount = 0;
            this.cacheHits = 0;
            this.totalLatencyMs = 0;

        } catch (err) {
            this.logger.error(`Failed to collect RAG metrics: ${err}`);
        }
    }

    /** Detect duplicate embeddings across tables */
    async detectDuplicateEmbeddings(): Promise<{ articles: number; pool: number }> {
        const articleDups = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) - COUNT(DISTINCT content) as count
      FROM knowledge_embeddings
      WHERE parent_id IS NOT NULL
    `;

        const poolDups = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) - COUNT(DISTINCT content) as count
      FROM knowledge_pool_embeddings
      WHERE parent_id IS NOT NULL
    `;

        const result = {
            articles: Number(articleDups[0]?.count || 0),
            pool: Number(poolDups[0]?.count || 0),
        };

        if (result.articles > 0 || result.pool > 0) {
            this.logger.warn(`⚠️ Duplicate embeddings: articles=${result.articles}, pool=${result.pool}`);
        }

        return result;
    }

    /** Get embedding migration status for observability */
    async getMigrationStatus(): Promise<{
        isRunning: boolean;
        activeVersion: string;
        pendingVersion: string | null;
        versionDistribution: Record<string, number>;
    }> {
        try {
            const activeVersionSetting = await this.settings.getValue('rag.embedding_active_version');
            const pendingVersionSetting = await this.settings.getValue('rag.embedding_pending_version');

            const activeVersion = activeVersionSetting || 'v1';
            const pendingVersion = pendingVersionSetting || null;

            const articleVersions = await this.prisma.$queryRaw<[{ version: string; count: bigint }]>`
                SELECT embedding_version as version, COUNT(*) as count
                FROM knowledge_embeddings
                WHERE embedding_version IS NOT NULL
                GROUP BY embedding_version
            `;

            const poolVersions = await this.prisma.$queryRaw<[{ version: string; count: bigint }]>`
                SELECT embedding_version as version, COUNT(*) as count
                FROM knowledge_pool_embeddings
                WHERE embedding_version IS NOT NULL
                GROUP BY embedding_version
            `;

            const versionDistribution: Record<string, number> = {};
            for (const row of articleVersions) {
                versionDistribution[`articles_${row.version}`] = Number(row.count);
            }
            for (const row of poolVersions) {
                versionDistribution[`pool_${row.version}`] = Number(row.count);
            }

            const isRunning = pendingVersion !== null && pendingVersion !== activeVersion;

            return {
                isRunning,
                activeVersion,
                pendingVersion,
                versionDistribution,
            };
        } catch (err) {
            this.logger.error(`Failed to get migration status: ${err}`);
            return {
                isRunning: false,
                activeVersion: 'unknown',
                pendingVersion: null,
                versionDistribution: {},
            };
        }
    }
}
