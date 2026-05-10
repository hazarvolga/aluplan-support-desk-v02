import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../ai/embedding.service';
import * as fs from 'fs';
import * as path from 'path';
import { KnowledgePoolParserService } from './knowledge-pool-parser.service';
import * as crypto from 'crypto';
import { KnowledgeSourceStatus, KnowledgeSourceType } from '@aluplan/database';

import { CrawlService } from './crawl.service';
import { StorageService } from '../common/services/storage.service';
import { hierarchicalChunk } from '../knowledge-base/utils/smart-chunker';
import { AiService } from '../ai/ai.service';
import { OnModuleInit } from '@nestjs/common';

@Processor('knowledge-sync')
export class KnowledgePoolProcessor extends WorkerHost implements OnModuleInit {
    private readonly logger = new Logger(KnowledgePoolProcessor.name);
    private turndown: any;

    constructor(
        private readonly prisma: PrismaService,
        private readonly embeddingService: EmbeddingService,
        private readonly parserService: KnowledgePoolParserService,
        private readonly crawlService: CrawlService,
        private readonly aiService: AiService,
        private readonly storageService: StorageService,
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

            await this.prisma.knowledgeSource.update({
                where: { id: sourceId },
                data: { status: KnowledgeSourceStatus.FAILED },
            });

            await this.prisma.knowledgeSourceSyncLog.update({
                where: { id: log.id },
                data: { status: 'FAILED', error: error.message, syncFinishedAt: new Date() },
            });

            throw error;
        }
    }

    private async handleUrlSync(source: { id: string; url?: string | null; name?: string; language?: string; metadata?: unknown }, logId: string) {
        if (!source.url) throw new Error('URL is required for URL sync');
        const { content, hash, title } = await this.crawlService.fetch(source.url);

        // Section 3.5.3: Change Monitor
        // If content length changes significantly (>30%), mark as major
        const oldLength = (source.metadata as Record<string, unknown>)?.lastContentLength as number | undefined || 0;
        const newLength = content.length;
        const delta = oldLength > 0 ? Math.abs(newLength - oldLength) / oldLength : 0;
        const isMajorChange = delta > 0.30;

        if (isMajorChange) {
            this.logger.warn(`🚨 Major change detected (${(delta * 100).toFixed(1)}%) for ${source.url}. Mark for review.`);
        }

        const hierarchies = hierarchicalChunk(content, { title });
        this.logger.log(`🧩 Content split into ${hierarchies.length} hierarchies for ${source.url}`);

        await this.prisma.$executeRaw`DELETE FROM knowledge_pool_embeddings WHERE source_id = ${source.id}::uuid`;
        this.logger.log(`🗑️ Existing embeddings cleared for source ${source.id}`);

        let totalChunks = 0;
        for (const h of hierarchies) {
            // Index the parent (full context)
            await this.embeddingService.indexPoolContent(source.id, h.parent, {
                url: source.url,
                title,
                type: 'parent',
                status: isMajorChange ? 'PENDING_REVIEW' : 'ACTIVE'
            });

            // Index each child (precise search)
            for (const child of h.children) {
                await this.embeddingService.indexPoolContent(source.id, child, {
                    url: source.url,
                    title,
                    type: 'child',
                    status: isMajorChange ? 'PENDING_REVIEW' : 'ACTIVE'
                });
                totalChunks++;
                if (totalChunks % 10 === 0) {
                    this.logger.log(`⏳ Indexed ${totalChunks} chunks so far...`);
                }
            }
        }

        await this.prisma.knowledgeSource.update({
            where: { id: source.id },
            data: {
                lastHash: hash,
                name: title,
                status: isMajorChange ? KnowledgeSourceStatus.PENDING_REVIEW : KnowledgeSourceStatus.ACTIVE,
                lastSyncedAt: new Date(),
                metadata: {
                    ...((source.metadata as Record<string, unknown>) || {}),
                    lastContentLength: newLength,
                    isMajorChange
                }
            }
        });

        await this.prisma.knowledgeSourceSyncLog.update({
            where: { id: logId },
            data: { chunksProcessed: totalChunks, newHash: hash }
        });
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

            // Smart Local Path Resolution (for legacy dataset files)
            if (targetPath.startsWith('/') && !fs.existsSync(targetPath)) {
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
            } else if (!targetPath.startsWith('/') && fs.existsSync(path.resolve(process.cwd(), targetPath))) {
                targetPath = path.resolve(process.cwd(), targetPath);
                fileBuffer = fs.readFileSync(targetPath);
            }
        }

        if (!fileBuffer) {
            throw new Error(`File not found after all resolution attempts: ${source.filePath}`);
        }

        if (!source.type) throw new Error('Source type is required for file sync');
        let content = await this.parserService.parseFile(source.type, fileBuffer);
        const hash = crypto.createHash('sha256').update(content).digest('hex');

        if (hash === source.lastHash) {
            this.logger.log(`⏩ File unchanged (Hash match): ${source.fileName}`);

            // Still update status to ACTIVE if it was SYNCING
            await this.prisma.knowledgeSource.update({
                where: { id: source.id },
                data: { status: KnowledgeSourceStatus.ACTIVE, lastSyncedAt: new Date() }
            });
            return;
        }

        // Apply AI Pre-processing if enabled in metadata
        if ((source.metadata as Record<string, unknown>)?.useAiPreprocessing) {
            this.logger.log(`🧠 Applying AI Pre-processing for formatting and noise reduction: ${source.fileName}`);
            try {
                content = (await this.aiService.cleanKnowledgeDocument(content)) ?? content;
            } catch (aiError: any) {
                this.logger.warn(`⚠️ AI Pre-processing failed (${aiError.message}), falling back to raw content for ${source.fileName}`);
            }
        }

        const hierarchies = hierarchicalChunk(content, { title: source.name || source.fileName || 'Untitled' });

        await this.prisma.$executeRaw`DELETE FROM knowledge_pool_embeddings WHERE source_id = ${source.id}::uuid`;

        let totalChunks = 0;
        for (const h of hierarchies) {
            await this.embeddingService.indexPoolContent(source.id, h.parent, {
                fileName: source.fileName,
                type: 'parent',
                status: 'ACTIVE',
                language: source.language
            });
            for (const child of h.children) {
                await this.embeddingService.indexPoolContent(source.id, child, {
                    fileName: source.fileName,
                    type: 'child',
                    status: 'ACTIVE',
                    language: source.language
                });
                totalChunks++;
            }
        }


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
                    lastContentLength: newLength
                }
            }
        });

        await this.prisma.knowledgeSourceSyncLog.update({
            where: { id: logId },
            data: { chunksProcessed: totalChunks, newHash: hash }
        });
    }
}
