import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKnowledgeSourceDto } from './dto/create-knowledge-source.dto';
import { KnowledgeSourceStatus, KnowledgeSourceType, Prisma } from '@aluplan/database';
import * as path from 'path';
import * as fs from 'fs';
import { StorageService } from '../common/services/storage.service';
import {
    classifyDatasetFile,
    DATASET_CATEGORY_BY_SLUG,
    DatasetCategorySlug,
    DatasetFileClassification,
    getDatasetSourceClass,
    isDatasetCategorySlug,
} from './dataset-classifier';
import { canonicalizeKnowledgeSourceUrl, INVALID_KNOWLEDGE_SOURCE_URL } from './knowledge-source-url';

const DUPLICATE_KNOWLEDGE_SOURCE_URL = 'KNOWLEDGE_SOURCE_URL_DUPLICATE';

type ImportedUrlSourceOptions = {
    language?: string;
    lastHash?: string | null;
    metadata?: Prisma.InputJsonObject;
};

type UrlSourceCreationResult = {
    source: any;
    created: boolean;
};

const parseJobDelay = (value: string | undefined, fallback: number): number => {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const buildDatasetMetadata = (
    classification: DatasetFileClassification,
    existing?: Record<string, unknown> | null,
): Prisma.InputJsonObject => {
    const manualCategorySlug = existing?.categoryAssignment === 'manual'
        && isDatasetCategorySlug(existing.categorySlug)
        ? existing.categorySlug
        : null;
    const categorySlug = manualCategorySlug ?? classification.categorySlug;

    return {
        ...(existing ?? {}),
        useAiPreprocessing: existing?.useAiPreprocessing ?? false,
        ingestionMode: existing?.ingestionMode ?? 'bulk-safe',
        category: DATASET_CATEGORY_BY_SLUG[categorySlug],
        categorySlug,
        sourceClass: getDatasetSourceClass(categorySlug),
        canonicalSource: classification.canonicalSource,
        importBatch: classification.importBatch,
        versionFamily: classification.versionFamily,
        licenseEra: classification.licenseEra,
        versionRange: classification.versionRange,
        licenseMethods: classification.licenseMethods,
        scenarios: classification.scenarios,
        requiresHumanReview: classification.requiresHumanReview,
    };
};

@Injectable()
export class KnowledgePoolService {
    private readonly logger = new Logger(KnowledgePoolService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
        @InjectQueue('knowledge-sync') private readonly syncQueue: Queue,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async createSource(dto: CreateKnowledgeSourceDto): Promise<any> {
        const source = dto.type === KnowledgeSourceType.URL
            ? await this.createManualUrlSource(dto)
            : await this.prisma.knowledgeSource.create({
                data: {
                    name: dto.name,
                    type: dto.type,
                    url: dto.url,
                    status: KnowledgeSourceStatus.ACTIVE,
                },
            });

        // Trigger initial sync
        await this.triggerSync(source.id);
        return source;
    }

    private async createManualUrlSource(dto: CreateKnowledgeSourceDto): Promise<any> {
        const result = await this.createUrlSourceRecord(dto);
        if (!result.created) {
            throw new ConflictException({
                code: DUPLICATE_KNOWLEDGE_SOURCE_URL,
                message: DUPLICATE_KNOWLEDGE_SOURCE_URL,
            });
        }
        return result.source;
    }

    async createImportedUrlSource(
        dto: CreateKnowledgeSourceDto,
        options: ImportedUrlSourceOptions,
    ): Promise<UrlSourceCreationResult> {
        const result = await this.createUrlSourceRecord(dto, options);
        if (result.created) {
            await this.triggerSync(result.source.id);
        }
        return result;
    }

    private async createUrlSourceRecord(
        dto: CreateKnowledgeSourceDto,
        options: ImportedUrlSourceOptions = {},
    ): Promise<UrlSourceCreationResult> {
        if (!dto.url) {
            throw new BadRequestException(INVALID_KNOWLEDGE_SOURCE_URL);
        }

        let canonicalUrl: string;
        try {
            canonicalUrl = canonicalizeKnowledgeSourceUrl(dto.url);
        } catch {
            throw new BadRequestException(INVALID_KNOWLEDGE_SOURCE_URL);
        }

        if (this.isLearnNowCourseUrl(canonicalUrl)) {
            throw new BadRequestException('LEARNNOW_COURSE_URLS_REQUIRE_ENROLLMENT');
        }

        return this.prisma.$transaction(async (tx) => {
            await tx.$queryRaw(Prisma.sql`
                SELECT pg_advisory_xact_lock(hashtextextended(${canonicalUrl}, 0)) IS NULL AS locked
            `);

            // Legacy rows predate canonical storage. Compare their normalized forms under
            // the same transaction lock so equivalent concurrent submissions cannot race.
            const existingUrlSources = await tx.knowledgeSource.findMany({
                where: {
                    url: { not: null },
                },
                select: { id: true, url: true },
            });
            const duplicate = existingUrlSources.find((candidate) => {
                if (!candidate.url) return false;
                try {
                    return canonicalizeKnowledgeSourceUrl(candidate.url) === canonicalUrl;
                } catch {
                    return false;
                }
            });

            if (duplicate) {
                return { source: duplicate, created: false };
            }

            const source = await tx.knowledgeSource.create({
                data: {
                    name: dto.name,
                    type: KnowledgeSourceType.URL,
                    url: canonicalUrl,
                    status: KnowledgeSourceStatus.ACTIVE,
                    language: options.language,
                    lastHash: options.lastHash ?? undefined,
                    metadata: {
                        ...(options.metadata ?? {}),
                        userProvidedName: dto.name,
                        sourceName: dto.name,
                        sourceUrl: canonicalUrl,
                        ingestionMode: 'bulk-safe',
                        useAiPreprocessing: false,
                    },
                },
            });
            return { source, created: true };
        });
    }

    private isLearnNowCourseUrl(value: string): boolean {
        try {
            const url = new URL(value);
            return url.hostname === 'learnnow.allplan.com' && /^\/course(?:\/|$)/i.test(url.pathname);
        } catch {
            return false;
        }
    }

    async createFileSource(name: string, type: KnowledgeSourceType, file: Express.Multer.File): Promise<any> {
        const classificationPath = file.path ? path.join(file.path, file.originalname) : file.originalname;
        const classification = classifyDatasetFile(classificationPath);
        const source = await this.prisma.knowledgeSource.create({
            data: {
                name,
                type,
                fileName: file.originalname,
                filePath: file.path, // Now stores MinIO object key (e.g., 'knowledge-pool/1234-doc.pdf')
                status: KnowledgeSourceStatus.ACTIVE,
                language: classification.language,
                metadata: buildDatasetMetadata(classification),
            },
        });

        await this.triggerSync(source.id);
        return source;
    }

    async getAllSources(): Promise<any> {
        return this.prisma.knowledgeSource.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                product: {
                    select: { id: true, name: true }
                },
                _count: {
                    select: { embeddings: true }
                }
            }
        });
    }

    async updateSourceCategory(id: string, categorySlug: DatasetCategorySlug): Promise<any> {
        const { updated, previousCategory } = await this.prisma.$transaction(async (tx) => {
            await tx.$queryRaw(Prisma.sql`
                SELECT "id"
                FROM "knowledge_sources"
                WHERE "id" = ${id}::uuid
                FOR UPDATE
            `);

            const source = await tx.knowledgeSource.findUnique({ where: { id } });
            if (!source) throw new NotFoundException('Source not found');
            if (source.status === KnowledgeSourceStatus.SYNCING) {
                throw new ConflictException('SOURCE_CATEGORY_UPDATE_BLOCKED_WHILE_SYNCING');
            }

            const existingMetadata = (source.metadata as Record<string, unknown> | null) ?? {};
            const metadata: Prisma.InputJsonObject = {
                ...existingMetadata,
                category: DATASET_CATEGORY_BY_SLUG[categorySlug],
                categorySlug,
                sourceClass: getDatasetSourceClass(categorySlug),
                categoryAssignment: 'manual',
            };
            const updated = await tx.knowledgeSource.update({
                where: { id },
                data: { metadata },
            });

            return {
                updated,
                previousCategory: String(existingMetadata.category ?? 'General'),
            };
        });

        await this.eventEmitter.emitAsync('knowledge-pool.source_processed', { sourceId: id });
        this.logger.log(
            `🏷️ Updated knowledge source category: ${updated.name} (${id}) ${previousCategory} → ${DATASET_CATEGORY_BY_SLUG[categorySlug]}`,
        );
        return updated;
    }

    async deleteSource(id: string): Promise<{ success: boolean; message: string }> {
        const source = await this.prisma.knowledgeSource.findUnique({
            where: { id }
        });

        if (!source) {
            throw new NotFoundException('Source not found');
        }

        // 1. Delete physical file from storage if it exists and is not a URL
        if (source.filePath && source.type !== 'URL') {
            try {
                this.logger.log(`🗑️ Deleting physical file from storage: ${source.filePath}`);
                await this.storageService.deleteFile(source.filePath);
            } catch (error) {
                this.logger.warn(`⚠️ Failed to delete physical file (may already be deleted): ${error.message}`);
                // Proceed with DB deletion anyway to avoid orphan records
            }
        }

        // 2. Delete the record from the database.
        // Due to `onDelete: Cascade` in schema, this will automatically delete:
        // - KnowledgePoolEmbedding
        // - KnowledgeSourceSyncLog
        await this.prisma.knowledgeSource.delete({
            where: { id }
        });

        this.logger.log(`✅ Successfully deleted knowledge source and all related data: ${source.name} (${id})`);
        
        return { success: true, message: 'Source deleted successfully' };
    }

    async bulkDeleteSources(ids: string[]): Promise<{ success: boolean; count: number }> {
        const sources = await this.prisma.knowledgeSource.findMany({
            where: { id: { in: ids } }
        });

        let deletedCount = 0;
        for (const source of sources) {
            try {
                await this.deleteSource(source.id);
                deletedCount++;
            } catch (error) {
                this.logger.error(`Failed to bulk delete source ${source.id}: ${error.message}`);
            }
        }
        
        return { success: true, count: deletedCount };
    }

    async triggerSync(id: string) {
        const { source, delay } = await this.prisma.$transaction(async (tx) => {
            await tx.$queryRaw(Prisma.sql`
                SELECT "id"
                FROM "knowledge_sources"
                WHERE "id" = ${id}::uuid
                FOR UPDATE
            `);

            const lockedSource = await tx.knowledgeSource.findUnique({ where: { id } });
            if (!lockedSource) throw new NotFoundException('Source not found');

            const existingMetadata = (lockedSource.metadata as Record<string, unknown> | null) ?? null;
            const classificationPath = lockedSource.filePath && lockedSource.fileName
                ? path.join(lockedSource.filePath, lockedSource.fileName)
                : null;
            const classification = classificationPath ? classifyDatasetFile(classificationPath) : null;
            const metadata = classification
                ? buildDatasetMetadata(classification, existingMetadata)
                : undefined;
            const isBulkSafe = existingMetadata?.ingestionMode === 'bulk-safe';
            const syncDelay = isBulkSafe
                ? parseJobDelay(process.env.KNOWLEDGE_SYNC_BULK_DELAY_MS, 15000)
                : 0;

            await tx.knowledgeSource.update({
                where: { id },
                data: {
                    status: KnowledgeSourceStatus.SYNCING,
                    ...(metadata ? { metadata } : {}),
                },
            });

            return { source: lockedSource, delay: syncDelay };
        });

        try {
            await this.enqueueOrResumeSync(id, delay);
        } catch (error) {
            try {
                await this.prisma.knowledgeSource.update({
                    where: { id },
                    data: { status: KnowledgeSourceStatus.FAILED },
                });
            } catch (statusError) {
                this.logger.error(`❌ Failed to mark source ${id} FAILED after enqueue error: ${statusError.message}`, statusError.stack);
            }
            try {
                await this.prisma.knowledgeSourceSyncLog.create({
                    data: {
                        sourceId: id,
                        status: 'FAILED',
                        error: 'KNOWLEDGE_SYNC_ENQUEUE_FAILED',
                        syncFinishedAt: new Date(),
                    },
                });
            } catch (logError) {
                this.logger.error(`❌ Failed to persist enqueue error for source ${id}: ${logError.message}`, logError.stack);
            }
            this.logger.error(`❌ Failed to enqueue sync job for source ${id}: ${error.message}`, error.stack);
            throw error;
        }

        this.logger.log(`🔄 Enqueued sync job for source: ${source.name} (${id})${delay > 0 ? ` with ${delay}ms pacing delay` : ''}`);
    }

    private async enqueueOrResumeSync(sourceId: string, delay: number): Promise<void> {
        const jobId = `knowledge-sync-${sourceId}`;
        const existingJob = await this.syncQueue.getJob(jobId);

        if (existingJob) {
            const state = await existingJob.getState();
            if (state === 'failed' || state === 'completed') {
                try {
                    await existingJob.remove();
                } catch (removeError) {
                    // A concurrent operator retry may already have replaced the
                    // retained job. Re-read before treating the source as failed.
                    const replacementJob = await this.syncQueue.getJob(jobId);
                    if (!replacementJob) {
                        // The old job disappeared between calls; adding below is safe.
                    } else {
                        const replacementState = await replacementJob.getState();
                        if (!['failed', 'completed', 'unknown'].includes(replacementState)) {
                            return;
                        }
                        if (replacementState !== 'unknown') {
                            throw removeError;
                        }
                    }
                }
            } else if (state !== 'unknown') {
                // An existing deterministic job is already queued or running.
                // Treat repeated operator clicks as an idempotent request.
                return;
            }
        }

        await this.syncQueue.add('sync-source', { sourceId }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true,
            delay,
            // BullMQ custom job IDs cannot contain a colon. Keep this
            // deterministic so repeated sync requests remain idempotent.
            jobId,
        });
    }

    async syncLocalDataset() {
        try {
            // Find dataset directory: try local root, then container root
            let datasetDir = path.resolve(process.cwd(), 'dataset');
            if (!fs.existsSync(datasetDir)) {
                datasetDir = path.resolve(process.cwd(), '../../dataset');
            }

            if (!fs.existsSync(datasetDir)) {
                this.logger.error(`Dataset directory not found at ${datasetDir}`);
                return { success: false, message: 'Dataset directory not found', scanned: 0 };
            }

            const filesToSync: string[] = [];
            const validExts = ['.md', '.json', '.csv', '.pdf', '.txt', '.msg', '.doc', '.docx'];

            const walkSync = (dir: string) => {
                const files = fs.readdirSync(dir);
                for (const file of files) {
                    const filePath = path.join(dir, file);
                    const stat = fs.statSync(filePath);
                    if (stat.isDirectory()) {
                        walkSync(filePath);
                    } else if (validExts.includes(path.extname(file).toLowerCase())) {
                        filesToSync.push(filePath);
                    }
                }
            };

            walkSync(datasetDir);

            let addedCount = 0;
            let existingCount = 0;
            let updatedCount = 0;

            for (const filePath of filesToSync) {
                const ext = path.extname(filePath).toLowerCase();
                let type: KnowledgeSourceType = KnowledgeSourceType.FILE_TXT;
                if (ext === '.md') type = KnowledgeSourceType.FILE_MD;
                if (ext === '.json') type = KnowledgeSourceType.FILE_TXT;
                if (ext === '.pdf') type = KnowledgeSourceType.FILE_PDF;
                if (ext === '.csv') type = KnowledgeSourceType.FILE_CSV;
                if (ext === '.msg') type = KnowledgeSourceType.FILE_MSG;
                if (ext === '.doc' || ext === '.docx') type = KnowledgeSourceType.FILE_DOCX;

                const fileName = path.basename(filePath);
                const classification = classifyDatasetFile(filePath);

                const outcome = await this.prisma.$transaction(async (tx) => {
                    await tx.$queryRaw(Prisma.sql`
                        SELECT "id"
                        FROM "knowledge_sources"
                        WHERE "file_path" = ${filePath}
                        FOR UPDATE
                    `);
                    const existing = await tx.knowledgeSource.findFirst({ where: { filePath } });
                    const existingMetadata = (existing?.metadata as Record<string, unknown> | null) ?? null;
                    const metadata = buildDatasetMetadata(classification, existingMetadata);

                    if (existing) {
                        const needsUpdate =
                            existing.language !== classification.language ||
                            existingMetadata?.category !== metadata.category ||
                            existingMetadata?.categorySlug !== metadata.categorySlug ||
                            existingMetadata?.sourceClass !== metadata.sourceClass ||
                            existingMetadata?.canonicalSource !== classification.canonicalSource ||
                            existingMetadata?.importBatch !== classification.importBatch ||
                            existingMetadata?.versionFamily !== classification.versionFamily ||
                            existingMetadata?.licenseEra !== classification.licenseEra ||
                            existingMetadata?.versionRange !== classification.versionRange ||
                            JSON.stringify(existingMetadata?.licenseMethods ?? []) !== JSON.stringify(classification.licenseMethods) ||
                            JSON.stringify(existingMetadata?.scenarios ?? []) !== JSON.stringify(classification.scenarios) ||
                            existingMetadata?.requiresHumanReview !== classification.requiresHumanReview;
                        if (needsUpdate) {
                            await tx.knowledgeSource.update({
                                where: { id: existing.id },
                                data: { language: classification.language, metadata },
                            });
                            return 'updated' as const;
                        }
                        return 'existing' as const;
                    }

                    await tx.knowledgeSource.create({
                        data: {
                            name: `[Dataset] ${fileName.substring(0, 200)}`,
                            type,
                            fileName: fileName.substring(0, 255),
                            filePath,
                            status: KnowledgeSourceStatus.ACTIVE,
                            language: classification.language,
                            metadata,
                        },
                    });
                    return 'added' as const;
                });

                if (outcome === 'added') {
                    addedCount++;
                } else {
                    existingCount++;
                    if (outcome === 'updated') updatedCount++;
                }
            }


            return {
                success: true,
                message: `Dataset scan complete. Discovered ${addedCount} new files. Checked ${existingCount} existing files. Updated ${updatedCount} existing files. Sync must be started manually from the UI for specific items.`,
                totalFiles: filesToSync.length,
                added: addedCount,
                existing: existingCount,
                updated: updatedCount,
            };
        } catch (error: any) {
            this.logger.error(`Error syncing local dataset: ${error.message}`, error.stack);
            return {
                success: false,
                message: `Dataset sync failed: ${error.message || 'Unknown error'}`,
                scanned: 0
            };
        }
    }

    async getSyncLogs(sourceId: string) {
        return this.prisma.knowledgeSourceSyncLog.findMany({
            where: { sourceId },
            orderBy: { syncStartedAt: 'desc' },
            take: 10,
        });
    }

    async syncExternalDocs(docs: { title: string; content: string; originalId: string; url?: string }[]) {
        let addedCount = 0;
        let skippedCount = 0;

        // Ensure a placeholder source exists for external API syncs
        let extSource = await this.prisma.knowledgeSource.findFirst({
            where: { name: 'NotebookLM Sync', type: KnowledgeSourceType.FILE_MD }
        });

        if (!extSource) {
            extSource = await this.prisma.knowledgeSource.create({
                data: {
                    name: 'NotebookLM Sync',
                    type: KnowledgeSourceType.FILE_MD,
                    status: KnowledgeSourceStatus.ACTIVE,
                    fileName: 'notebooklm_virtual.md',
                }
            });
        }

        for (const doc of docs) {
            // Check if exact originalId already exists to prevent duplication
            const existing = await this.prisma.knowledgeArticle.findFirst({
                where: { originalId: doc.originalId }
            });

            if (existing) {
                skippedCount++;
                continue;
            }

            // Create the article
            const article = await this.prisma.knowledgeArticle.create({
                data: {
                    title: doc.title,
                    slug: `ext-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                    status: 'PUBLISHED', // Auto-published for internal RAG
                    isInternal: true,
                    isAutoImported: true,
                    source: 'notebooklm',
                    originalId: doc.originalId,
                }
            });

            // Create the initial version
            await this.prisma.knowledgeArticleVersion.create({
                data: {
                    articleId: article.id,
                    version: 1,
                    title: doc.title,
                    content: doc.content,
                    contentPlain: doc.content, // Map content to contentPlain for now
                    changeSummary: 'Initial sync from NotebookLM',
                }
            });

            addedCount++;
        }

        this.logger.log(`External Sync Complete: ${addedCount} added, ${skippedCount} skipped.`);

        // Force embeddings processing if articles were added
        // Trigger a background task to process newly added documents or existing source
        if (addedCount > 0) {
            await this.triggerSync(extSource.id);
        }

        return {
            success: true,
            added: addedCount,
            skipped: skippedCount,
            total: docs.length
        };
    }
}
