import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../ai/embedding.service';
import * as fs from 'fs';
import * as path from 'path';
import { KnowledgePoolParserService } from './knowledge-pool-parser.service';
import * as crypto from 'crypto';
import { KnowledgeSourceStatus, KnowledgeSourceType, Prisma } from '@aluplan/database';

import { CrawlService } from './crawl.service';
import { StorageService } from '../common/services/storage.service';
import { hierarchicalChunk } from '../knowledge-base/utils/smart-chunker';
import { AiService } from '../ai/ai.service';
import { OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { countTokens } from '../ai/utils/token-counter';
import { VisualContentService } from './visual-content.service';

const parseWorkerNumber = (value: string | undefined, fallback: number): number => {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const buildKnowledgeSyncWorkerOptions = (env: NodeJS.ProcessEnv = process.env) => ({
    concurrency: parseWorkerNumber(env.KNOWLEDGE_SYNC_QUEUE_CONCURRENCY, 1),
    limiter: {
        max: parseWorkerNumber(env.KNOWLEDGE_SYNC_RATE_MAX, 1),
        duration: parseWorkerNumber(env.KNOWLEDGE_SYNC_RATE_DURATION_MS, 15000),
    },
});

class KnowledgeSyncBudgetPausedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'KnowledgeSyncBudgetPausedError';
    }
}

@Processor('knowledge-sync', buildKnowledgeSyncWorkerOptions())
export class KnowledgePoolProcessor extends WorkerHost implements OnModuleInit {
    private readonly logger = new Logger(KnowledgePoolProcessor.name);
    private turndown: any;

    constructor(
        private readonly prisma: PrismaService,
        private readonly embeddingService: EmbeddingService,
        private readonly parserService: KnowledgePoolParserService,
        private readonly crawlService: CrawlService,
        private readonly visualContentService: VisualContentService,
        private readonly aiService: AiService,
        private readonly storageService: StorageService,
        private readonly config: ConfigService,
        private readonly redis: RedisService,
        @InjectQueue('knowledge-sync') private readonly syncQueue: Queue,
    ) {
        super();
    }

    async onModuleInit() {
        let TurndownConstructor: any;
        try {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const TurndownLib: any = await require('turndown');
            TurndownConstructor = typeof TurndownLib === 'function' ? TurndownLib : (TurndownLib.default || TurndownLib);
        } catch (e) {
            this.logger.error(`🚨 Turndown library LOAD FAILURE: ${e.message}`);
            // Fallback to dummy to prevent complete processor failure
            TurndownConstructor = class { addRule() { } turndown(h: string) { return h; } };
        }

        this.turndown = new TurndownConstructor();
    }

    async process(job: Job<{ sourceId: string }>): Promise<any> {
        const { sourceId } = job.data;
        const source = await this.prisma.knowledgeSource.findUnique({
            where: { id: sourceId },
            include: { product: true }
        });

        if (!source) {
            this.logger.error(`❌ Source not found: ${sourceId}`);
            return;
        }

        this.logger.log(`🏗️ Processing sync for: ${source.name} (${source.type})`);

        const log = await this.prisma.knowledgeSourceSyncLog.create({
            data: {
                sourceId,
                status: 'SYNCING',
            },
        });

        try {
            if (source.type === KnowledgeSourceType.URL) {
                await this.handleUrlSync(source, log.id);
            } else {
                await this.handleFileSync(source, log.id);
            }

            await this.prisma.knowledgeSourceSyncLog.update({
                where: { id: log.id },
                data: { status: 'SUCCESS', syncFinishedAt: new Date() },
            });

            this.logger.log(`✅ Completed sync for source: ${source.name} (${sourceId})`);
        } catch (error) {
            this.logger.error(`❌ Sync failed for source ${sourceId}: ${error.message}`, error.stack);
            const budgetPaused = error instanceof KnowledgeSyncBudgetPausedError;

            await this.prisma.knowledgeSource.update({
                where: { id: sourceId },
                data: { status: budgetPaused ? KnowledgeSourceStatus.PENDING_REVIEW : KnowledgeSourceStatus.FAILED },
            });

            await this.prisma.knowledgeSourceSyncLog.update({
                where: { id: log.id },
                data: { status: budgetPaused ? 'PAUSED_BUDGET' : 'FAILED', error: error.message, syncFinishedAt: new Date() },
            });

            throw error;
        }
    }

    private async handleUrlSync(source: { id: string; url?: string | null; name?: string; language?: string; metadata?: unknown }, logId: string) {
        if (!source.url) throw new Error('URL is required for URL sync');
        const { content, title, provider, metadata, images } = await this.crawlService.fetch(source.url);
        const sourceMetadata = (source.metadata as Record<string, unknown>) || {};
        const displayName = this.resolveUrlSourceDisplayName(source.name, title, sourceMetadata);
        const visualResult = await this.visualContentService.enrichUrlContent({
            sourceUrl: source.url,
            title,
            content,
            images,
            language: source.language,
            existingMetadata: sourceMetadata,
        });
        const enrichedContent = visualResult.content;
        const finalHash = crypto.createHash('sha256').update(enrichedContent).digest('hex');

        // Section 3.5.3: Change Monitor
        // If content length changes significantly (>30%), mark as major
        const oldLength = sourceMetadata.lastContentLength as number | undefined || 0;
        const newLength = enrichedContent.length;
        const delta = oldLength > 0 ? Math.abs(newLength - oldLength) / oldLength : 0;
        const isMajorChange = delta > 0.30;

        if (isMajorChange) {
            this.logger.warn(`🚨 Major change detected (${(delta * 100).toFixed(1)}%) for ${source.url}. Mark for review.`);
        }

        const hierarchies = hierarchicalChunk(enrichedContent, { title });
        this.logger.log(`🧩 Content split into ${hierarchies.length} hierarchies for ${source.url}`);

        const totalChunks = hierarchies.reduce((sum, h) => sum + h.children.length, 0);
        await this.reserveEmbeddingBudgetOrPause(enrichedContent, source.id);
        await this.embeddingService.indexPoolContent(source.id, enrichedContent, {
            url: source.url,
            title,
            sourceType: 'url',
            crawlerProvider: provider ?? 'basic',
            status: isMajorChange ? 'PENDING_REVIEW' : 'ACTIVE',
            visualSummaryCount: visualResult.summaries.length,
        });

        const category = (source.metadata as any)?.category || 'General';

        await this.prisma.knowledgeSource.update({
            where: { id: source.id },
            data: {
                lastHash: finalHash,
                name: displayName,
                status: isMajorChange ? KnowledgeSourceStatus.PENDING_REVIEW : KnowledgeSourceStatus.ACTIVE,
                lastSyncedAt: new Date(),
                metadata: {
                    ...sourceMetadata,
                    lastContentLength: newLength,
                    isMajorChange,
                    category: category,
                    pageTitle: title,
                    crawlerTitle: title,
                    displayNameSource: displayName === title ? 'crawler_title' : 'user_provided_name',
                    crawlerProvider: provider ?? 'basic',
                    crawler: metadata ?? {},
                    images: images ?? [],
                    ...visualResult.metadata,
                } as unknown as Prisma.InputJsonValue
            }
        });

        await this.prisma.knowledgeSourceSyncLog.update({
            where: { id: logId },
            data: { chunksProcessed: totalChunks, newHash: finalHash }
        });
    }

    private resolveUrlSourceDisplayName(
        currentName: string | undefined,
        crawlerTitle: string,
        metadata: Record<string, unknown>,
    ): string {
        const userProvidedName = typeof metadata.userProvidedName === 'string'
            ? metadata.userProvidedName.trim()
            : '';
        const existingName = currentName?.trim() ?? '';
        const genericCrawlerTitle = /^(learnnow\s+allplan|allplan|untitled source)$/i.test(crawlerTitle.trim());

        if (userProvidedName) return userProvidedName;
        if (existingName && (genericCrawlerTitle || existingName !== crawlerTitle.trim())) return existingName;
        return crawlerTitle.trim() || existingName || 'Untitled URL Source';
    }

    private async handleFileSync(source: { id: string; filePath?: string | null; fileName?: string | null; lastHash?: string | null; type?: string; name?: string; language?: string; metadata?: unknown }, logId: string) {
        if (!source.filePath) throw new Error('File path/key missing for source');

        this.logger.log(`📄 Retrieving file content for: ${source.fileName} (Key: ${source.filePath})`);

        let fileBuffer: Buffer | null = null;
        let targetPath = source.filePath;

        // Try getting from StorageService first (handles S3 and local relatively)
        fileBuffer = await this.storageService.getFile(source.filePath);

        if (!fileBuffer) {
            this.logger.warn(`⚠️ File not found in primary storage [${source.filePath}]. Attempting local fallback resolution...`);

            // 1. Try absolute path directly if it exists
            if (targetPath.startsWith('/') && fs.existsSync(targetPath)) {
                this.logger.log(`✅ Found file at absolute path: ${targetPath}`);
                fileBuffer = fs.readFileSync(targetPath);
            } 
            // 2. Smart Local Path Resolution (for legacy dataset files)
            else if (targetPath.startsWith('/') && !fs.existsSync(targetPath)) {
                const datasetIndex = targetPath.indexOf('dataset');
                if (datasetIndex !== -1) {
                    const relativePath = targetPath.substring(datasetIndex);
                    const candidate = path.resolve(process.cwd(), relativePath);
                    if (fs.existsSync(candidate)) {
                        this.logger.log(`✅ Resolved path to: ${candidate}`);
                        targetPath = candidate;
                        fileBuffer = fs.readFileSync(targetPath);
                    }
                }
            } 
            // 3. Relative path check
            else if (!targetPath.startsWith('/') && fs.existsSync(path.resolve(process.cwd(), targetPath))) {
                targetPath = path.resolve(process.cwd(), targetPath);
                fileBuffer = fs.readFileSync(targetPath);
            }
        }

        if (!fileBuffer) {
            throw new Error(`File not found after all resolution attempts: ${source.filePath}`);
        }

        if (!source.type) throw new Error('Source type is required for file sync');
        let content = await this.parserService.parseFile(source.type, fileBuffer);
        if (!content || content.trim().length === 0) {
            throw new Error(`Parsed content is empty for source ${source.fileName || source.id}`);
        }
        const hash = crypto.createHash('sha256').update(content).digest('hex');

        if (hash === source.lastHash) {
            this.logger.log(`⏩ File unchanged (Hash match): ${source.fileName}`);

            const existingEmbeddingCount = await this.prisma.knowledgePoolEmbedding.count({
                where: { sourceId: source.id },
            });

            if (existingEmbeddingCount === 0) {
                this.logger.warn(`⚠️ File unchanged but has no embeddings; forcing re-index for ${source.fileName}`);
            } else {
                // Still update status to ACTIVE if it was SYNCING
                await this.prisma.knowledgeSource.update({
                    where: { id: source.id },
                    data: { status: KnowledgeSourceStatus.ACTIVE, lastSyncedAt: new Date() }
                });
                return;
            }
        }

        // Apply AI Pre-processing if enabled in metadata
        let category = (source.metadata as any)?.category || 'General';
        
        if ((source.metadata as Record<string, unknown>)?.useAiPreprocessing === true) {
            this.logger.log(`🧠 Applying AI for categorization and cleaning: ${source.fileName}`);
            try {
                // 1. Categorize & Clean
                const aiResult = await this.aiService.analyzeAndCleanDocument(content, source.fileName || source.name || 'document');
                content = aiResult.cleanedContent ?? content;
                category = aiResult.category ?? category;
                this.logger.log(`🏷️ Document categorized as: ${category}`);
            } catch (aiError: any) {
                this.logger.warn(`⚠️ AI Pre-processing failed: ${aiError.message}. Continuing with raw content.`);
            }
        }

        const hierarchies = hierarchicalChunk(content, { title: source.name || source.fileName || 'Untitled' });
        const totalChunks = hierarchies.reduce((sum, h) => sum + h.children.length, 0);

        await this.reserveEmbeddingBudgetOrPause(content, source.id);
        await this.embeddingService.indexPoolContent(source.id, content, {
            fileName: source.fileName,
            sourceType: 'file',
            status: 'ACTIVE',
            language: source.language,
            category,
        });


        // Section 3.5.3: Change Monitor (Partial for files - size track)
        const _oldLength = (source.metadata as Record<string, unknown>)?.lastContentLength as number | undefined || 0;
        const newLength = content.length;

        await this.prisma.knowledgeSource.update({
            where: { id: source.id },
            data: {
                lastHash: hash,
                status: KnowledgeSourceStatus.ACTIVE,
                lastSyncedAt: new Date(),
                metadata: {
                    ...((source.metadata as Record<string, unknown>) || {}),
                    lastContentLength: newLength,
                    category: category
                }
            }
        });

        await this.prisma.knowledgeSourceSyncLog.update({
            where: { id: logId },
            data: { chunksProcessed: totalChunks, newHash: hash }
        });
    }

    private async reserveEmbeddingBudgetOrPause(content: string, sourceId: string): Promise<void> {
        if (this.config.get<string>('KNOWLEDGE_SYNC_EMBED_BUDGET_GUARD', 'true') === 'false') {
            return;
        }

        const model = this.resolveEmbedModel();
        const usdPerMillion = this.resolveEmbedUsdPerMillion(model);
        if (usdPerMillion <= 0) {
            return;
        }

        const estimatedTokens = countTokens(content, model);
        const multiplier = this.parsePositiveNumber(
            this.config.get<string>('KNOWLEDGE_SYNC_EMBED_COST_MULTIPLIER'),
            1.5,
        );
        const estimatedCostUsd = (estimatedTokens * usdPerMillion * multiplier) / 1_000_000;
        const capUsd = this.resolveDailyEmbedCapUsd();

        const today = new Date().toISOString().split('T')[0];
        const globalKey = `ai:quota:global:cost:${today}`;
        const embedKey = `ai:quota:knowledge_sync_embed:cost:${today}`;
        const currentCostUsd = Number.parseFloat((await this.redis.get(globalKey)) || '0');
        const projectedCostUsd = currentCostUsd + estimatedCostUsd;

        if (projectedCostUsd > capUsd) {
            await this.syncQueue.pause();
            const message = [
                `Knowledge sync embedding budget cap reached; queue paused.`,
                `sourceId=${sourceId}`,
                `current=$${currentCostUsd.toFixed(4)}`,
                `estimated=$${estimatedCostUsd.toFixed(4)}`,
                `cap=$${capUsd.toFixed(2)}`,
            ].join(' ');
            this.logger.error(`🧯 ${message}`);
            throw new KnowledgeSyncBudgetPausedError(message);
        }

        const client = this.redis.getClient();
        await Promise.all([
            client.incrbyfloat(globalKey, estimatedCostUsd),
            client.incrbyfloat(embedKey, estimatedCostUsd),
            client.expire(globalKey, 86400),
            client.expire(embedKey, 86400),
        ]);

        this.logger.log(
            `💸 Reserved embedding budget source=${sourceId} model=${model} tokens≈${estimatedTokens} cost≈$${estimatedCostUsd.toFixed(5)} projected≈$${projectedCostUsd.toFixed(5)}/$${capUsd.toFixed(2)}`,
        );
    }

    private resolveEmbedModel(): string {
        return (
            this.config.get<string>('LLMAPI_EMBED_MODEL') ||
            this.config.get<string>('GEMINI_EMBED_MODEL') ||
            this.config.get<string>('OPENAI_EMBED_MODEL') ||
            'gemini-embedding-2'
        );
    }

    private resolveEmbedUsdPerMillion(model: string): number {
        const explicit = this.config.get<string>('KNOWLEDGE_SYNC_EMBED_USD_PER_MILLION_TOKENS');
        const explicitValue = explicit ? Number.parseFloat(explicit) : Number.NaN;
        if (Number.isFinite(explicitValue) && explicitValue >= 0) {
            return explicitValue;
        }

        const normalized = model.toLowerCase().replace(/^models\//, '');
        if (normalized === 'gemini-embedding-2') return 0.20;
        if (normalized === 'gemini-embedding-001') return 0.15;
        if (normalized === 'text-embedding-3-small') return 0.02;
        if (normalized === 'text-embedding-3-large') return 0.13;
        if (normalized === 'text-embedding-ada-002') return 0.10;

        return 0.20;
    }

    private parsePositiveNumber(value: string | undefined, fallback: number): number {
        const parsed = Number.parseFloat(value ?? '');
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    }

    private resolveDailyEmbedCapUsd(): number {
        const explicit = this.config.get<string>('KNOWLEDGE_SYNC_DAILY_EMBED_USD_CAP');
        const explicitCap = explicit ? Number.parseFloat(explicit) : Number.NaN;
        if (Number.isFinite(explicitCap) && explicitCap > 0) {
            return explicitCap;
        }

        const global = this.config.get<string>('AI_GLOBAL_DAILY_CAP');
        const globalCap = global ? Number.parseFloat(global) : Number.NaN;
        if (Number.isFinite(globalCap) && globalCap > 0) {
            return Math.min(globalCap, 2);
        }

        return 2;
    }
}
