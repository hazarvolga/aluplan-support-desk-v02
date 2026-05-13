import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKnowledgeSourceDto } from './dto/create-knowledge-source.dto';
import { KnowledgeSourceStatus, KnowledgeSourceType } from '@aluplan/database';
import * as path from 'path';
import * as fs from 'fs';
import { StorageService } from '../common/services/storage.service';

const parseJobDelay = (value: string | undefined, fallback: number): number => {
    const parsed = Number.parseInt(value ?? '', 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

@Injectable()
export class KnowledgePoolService {
    private readonly logger = new Logger(KnowledgePoolService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly storageService: StorageService,
        @InjectQueue('knowledge-sync') private readonly syncQueue: Queue,
    ) { }

    async createSource(dto: CreateKnowledgeSourceDto): Promise<any> {
        const source = await this.prisma.knowledgeSource.create({
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

    async createFileSource(name: string, type: KnowledgeSourceType, file: Express.Multer.File): Promise<any> {
        const source = await this.prisma.knowledgeSource.create({
            data: {
                name,
                type,
                fileName: file.originalname,
                filePath: file.path, // Now stores MinIO object key (e.g., 'knowledge-pool/1234-doc.pdf')
                status: KnowledgeSourceStatus.ACTIVE,
                metadata: {
                    useAiPreprocessing: false,
                    ingestionMode: 'bulk-safe',
                },
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
        const source = await this.prisma.knowledgeSource.findUnique({ where: { id } });
        if (!source) throw new NotFoundException('Source not found');

        const isBulkSafe = (source.metadata as Record<string, unknown> | null)?.ingestionMode === 'bulk-safe';
        const delay = isBulkSafe
            ? parseJobDelay(process.env.KNOWLEDGE_SYNC_BULK_DELAY_MS, 15000)
            : 0;

        await this.prisma.knowledgeSource.update({
            where: { id },
            data: { status: KnowledgeSourceStatus.SYNCING },
        });

        await this.syncQueue.add('sync-source', { sourceId: id }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true,
            delay,
        });

        this.logger.log(`🔄 Enqueued sync job for source: ${source.name} (${id})${delay > 0 ? ` with ${delay}ms pacing delay` : ''}`);
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
            const validExts = ['.md', '.json', '.csv', '.pdf', '.txt', '.msg'];

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

            for (const filePath of filesToSync) {
                const ext = path.extname(filePath).toLowerCase();
                let type: KnowledgeSourceType = KnowledgeSourceType.FILE_TXT;
                if (ext === '.md') type = KnowledgeSourceType.FILE_MD;
                if (ext === '.json') type = KnowledgeSourceType.FILE_TXT;
                if (ext === '.pdf') type = KnowledgeSourceType.FILE_PDF;
                if (ext === '.csv') type = KnowledgeSourceType.FILE_CSV;
                if (ext === '.msg') type = KnowledgeSourceType.FILE_MSG;

                const fileName = path.basename(filePath);

                const existing = await this.prisma.knowledgeSource.findFirst({
                    where: { filePath }
                });

                // Basic language detection from filename or directory
                let language = 'tr';
                if (filePath.toLowerCase().includes('_de') || filePath.toLowerCase().includes('/de/') || fileName.toLowerCase().includes('germany')) language = 'de';
                else if (filePath.toLowerCase().includes('_en') || filePath.toLowerCase().includes('/en/') || fileName.toLowerCase().includes('english')) language = 'en';

                if (existing) {
                    existingCount++;
                } else {
                    const source = await this.prisma.knowledgeSource.create({
                        data: {
                            name: `[Dataset] ${fileName.substring(0, 200)}`,
                            type,
                            fileName: fileName.substring(0, 255),
                            filePath,
                            status: KnowledgeSourceStatus.ACTIVE,
                            language,
                            metadata: {
                                useAiPreprocessing: false,
                                ingestionMode: 'bulk-safe',
                            }
                        },
                    });
                    addedCount++;
                }
            }


            return {
                success: true,
                message: `Dataset scan complete. Discovered ${addedCount} new files. Checked ${existingCount} existing files. Sync must be started manually from the UI for specific items.`,
                totalFiles: filesToSync.length
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
