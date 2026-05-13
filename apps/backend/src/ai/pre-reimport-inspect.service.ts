import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as fs from 'fs';
import * as path from 'path';

type SampleRecord = Record<string, unknown>;

@Injectable()
export class PreReimportInspectService {
    private readonly logger = new Logger(PreReimportInspectService.name);
    private readonly DEFAULT_SAMPLE_SIZE = 10;
    private readonly STALE_CACHE_DAYS = 30;
    private readonly DATASET_EXTENSIONS = new Set(['.md', '.json', '.csv', '.pdf', '.txt', '.msg']);

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    async inspect(sampleSize = this.DEFAULT_SAMPLE_SIZE) {
        const safeSampleSize = this.normalizeSampleSize(sampleSize);

        const [
            legacyArticles,
            legacyEmbeddings,
            staleCache,
            orphanFiles,
            relationSafety,
        ] = await Promise.all([
            this.inspectLegacyArticles(safeSampleSize),
            this.inspectLegacyEmbeddings(safeSampleSize),
            this.inspectStaleCache(safeSampleSize),
            this.inspectOrphanFiles(safeSampleSize),
            this.inspectRelationSafety(),
        ]);

        return {
            mode: 'inspect',
            generatedAt: new Date().toISOString(),
            sampleSize: safeSampleSize,
            legacyArticles,
            legacyEmbeddings,
            staleCache,
            orphanFiles,
            relationSafety,
            readiness: this.buildReadinessSummary({
                legacyArticles: legacyArticles.total,
                legacyEmbeddings: legacyEmbeddings.total,
                staleCache: staleCache.total,
                orphanFiles: orphanFiles.total,
            }),
        };
    }

    private normalizeSampleSize(sampleSize?: number): number {
        if (!sampleSize || Number.isNaN(sampleSize)) return this.DEFAULT_SAMPLE_SIZE;
        return Math.min(Math.max(sampleSize, 1), 50);
    }

    private async inspectLegacyArticles(sampleSize: number) {
        const where = {
            OR: [
                { isAutoImported: true },
                { source: 'notebooklm' },
            ],
        } as const;

        const [total, samples, autoImportedCount, notebookLmCount] = await Promise.all([
            this.prisma.knowledgeArticle.count({ where }),
            this.prisma.knowledgeArticle.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    source: true,
                    isAutoImported: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: sampleSize,
            }),
            this.prisma.knowledgeArticle.count({ where: { isAutoImported: true } }),
            this.prisma.knowledgeArticle.count({ where: { source: 'notebooklm' } }),
        ]);

        return {
            total,
            autoImportedCount,
            notebookLmCount,
            samples,
        };
    }

    private async inspectLegacyEmbeddings(sampleSize: number) {
        const legacyEmbeddingWhere = {
            OR: [
                { embeddingVersion: 'v1' },
                { embeddingDim: 1536 },
            ],
        } as const;

        const [
            knowledgeEmbeddingsCount,
            knowledgeEmbeddingsSample,
            knowledgePoolEmbeddingsCount,
            knowledgePoolEmbeddingsSample,
        ] = await Promise.all([
            this.prisma.knowledgeEmbedding.count({ where: legacyEmbeddingWhere }),
            this.prisma.knowledgeEmbedding.findMany({
                where: legacyEmbeddingWhere,
                select: {
                    id: true,
                    articleId: true,
                    embeddingVersion: true,
                    embeddingDim: true,
                    migratedAt: true,
                },
                orderBy: { embeddingGeneratedAt: 'desc' },
                take: sampleSize,
            }),
            this.prisma.knowledgePoolEmbedding.count({ where: legacyEmbeddingWhere }),
            this.prisma.knowledgePoolEmbedding.findMany({
                where: legacyEmbeddingWhere,
                select: {
                    id: true,
                    sourceId: true,
                    embeddingVersion: true,
                    embeddingDim: true,
                    migratedAt: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: sampleSize,
            }),
        ]);

        return {
            total: knowledgeEmbeddingsCount + knowledgePoolEmbeddingsCount,
            knowledgeEmbeddings: {
                count: knowledgeEmbeddingsCount,
                samples: knowledgeEmbeddingsSample,
            },
            knowledgePoolEmbeddings: {
                count: knowledgePoolEmbeddingsCount,
                samples: knowledgePoolEmbeddingsSample,
            },
        };
    }

    private async inspectStaleCache(sampleSize: number) {
        const staleBefore = new Date();
        staleBefore.setDate(staleBefore.getDate() - this.STALE_CACHE_DAYS);

        const [redisCache, dbCount, dbSamples] = await Promise.all([
            this.scanRedisKeys('ai:query:cache:v6:*', sampleSize),
            this.prisma.aiResponseCache.count({
                where: {
                    createdAt: { lt: staleBefore },
                },
            }),
            this.prisma.aiResponseCache.findMany({
                where: {
                    createdAt: { lt: staleBefore },
                },
                select: {
                    id: true,
                    tenantId: true,
                    embeddingVersion: true,
                    createdAt: true,
                    expiresAt: true,
                },
                orderBy: { createdAt: 'asc' },
                take: sampleSize,
            }),
        ]);

        return {
            total: redisCache.count + dbCount,
            staleThresholdDays: this.STALE_CACHE_DAYS,
            redis: redisCache,
            aiResponseCache: {
                count: dbCount,
                samples: dbSamples,
            },
        };
    }

    private async inspectOrphanFiles(sampleSize: number) {
        const datasetDir = this.resolveDatasetDir();
        if (!datasetDir) {
            return {
                datasetDir: null,
                total: 0,
                scannedFiles: 0,
                orphanedFiles: [] as string[],
                missingDbSources: [] as SampleRecord[],
                note: 'Dataset directory not found',
            };
        }

        const datasetFiles = this.collectDatasetFiles(datasetDir);
        const normalizedDatasetPaths = new Set(datasetFiles.map((file) => path.resolve(file)));

        const knowledgeSources = await this.prisma.knowledgeSource.findMany({
            where: {
                filePath: { not: null },
            },
            select: {
                id: true,
                name: true,
                filePath: true,
                type: true,
                status: true,
                createdAt: true,
            },
        });

        const orphanedFileMatches = datasetFiles
            .filter((filePath) => !knowledgeSources.some((source) => source.filePath === filePath));

        const missingDbSourceMatches = knowledgeSources
            .filter((source) => source.filePath && this.looksLikeDatasetPath(source.filePath) && !normalizedDatasetPaths.has(path.resolve(source.filePath)));

        const orphanedFiles = orphanedFileMatches.slice(0, sampleSize);
        const missingDbSources = missingDbSourceMatches
            .slice(0, sampleSize)
            .map((source) => ({
                id: source.id,
                name: source.name,
                filePath: source.filePath,
                type: source.type,
                status: source.status,
                createdAt: source.createdAt,
            }));

        return {
            datasetDir,
            total: orphanedFileMatches.length + missingDbSourceMatches.length,
            scannedFiles: datasetFiles.length,
            orphanedFiles,
            missingDbSources,
        };
    }

    private async inspectRelationSafety() {
        const [
            sourceCount,
            sourceEmbeddingCount,
            sourceSyncLogCount,
            articleVersionCount,
            articleEmbeddingCount,
        ] = await Promise.all([
            this.prisma.knowledgeSource.count(),
            this.prisma.knowledgePoolEmbedding.count(),
            this.prisma.knowledgeSourceSyncLog.count(),
            this.prisma.knowledgeArticleVersion.count(),
            this.prisma.knowledgeEmbedding.count(),
        ]);

        return {
            checks: [
                {
                    relation: 'KnowledgeSource -> KnowledgePoolEmbedding',
                    expectedBehavior: 'cascade-delete at schema level',
                    parentCount: sourceCount,
                    childCount: sourceEmbeddingCount,
                },
                {
                    relation: 'KnowledgeSource -> KnowledgeSourceSyncLog',
                    expectedBehavior: 'cascade-delete at schema level',
                    parentCount: sourceCount,
                    childCount: sourceSyncLogCount,
                },
                {
                    relation: 'KnowledgeArticle -> KnowledgeArticleVersion',
                    expectedBehavior: 'cascade-delete at schema level',
                    childCount: articleVersionCount,
                },
                {
                    relation: 'KnowledgeArticle -> KnowledgeEmbedding',
                    expectedBehavior: 'cascade-delete at schema level',
                    childCount: articleEmbeddingCount,
                },
            ],
            notes: [
                'Inspect mode is read-only and does not execute transactional delete probes.',
                'KnowledgeArticle reads go through the global soft-delete filter, so this report reflects active legacy records.',
            ],
        };
    }

    private buildReadinessSummary(counts: { legacyArticles: number; legacyEmbeddings: number; staleCache: number; orphanFiles: number }) {
        const blockers = Object.entries(counts)
            .filter(([, value]) => value > 0)
            .map(([key, value]) => ({ key, count: value }));

        return {
            status: blockers.length === 0 ? 'READY' : 'NOT_READY',
            blockers,
        };
    }

    private async scanRedisKeys(pattern: string, sampleSize: number) {
        const client = this.redis.getClient();
        let cursor = '0';
        let count = 0;
        const samples: string[] = [];

        do {
            const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 250);
            cursor = nextCursor;
            count += keys.length;

            for (const key of keys) {
                if (samples.length < sampleSize) {
                    samples.push(key);
                }
            }
        } while (cursor !== '0');

        return { pattern, count, samples };
    }

    private resolveDatasetDir(): string | null {
        const candidates = [
            path.resolve(process.cwd(), 'dataset'),
            path.resolve(process.cwd(), '../../dataset'),
        ];

        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                return candidate;
            }
        }

        return null;
    }

    private collectDatasetFiles(root: string): string[] {
        const found: string[] = [];

        const walk = (dir: string) => {
            for (const entry of fs.readdirSync(dir)) {
                const filePath = path.join(dir, entry);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    if (entry === '.quarantine') continue;
                    walk(filePath);
                    continue;
                }

                if (this.DATASET_EXTENSIONS.has(path.extname(entry).toLowerCase())) {
                    found.push(path.resolve(filePath));
                }
            }
        };

        walk(root);
        return found;
    }

    private looksLikeDatasetPath(filePath: string): boolean {
        return filePath.includes(`${path.sep}dataset${path.sep}`) || filePath.startsWith('dataset/');
    }
}
