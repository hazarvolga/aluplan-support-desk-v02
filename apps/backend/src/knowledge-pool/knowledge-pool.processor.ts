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
import { hierarchicalChunk } from '../knowledge-base/utils/smart-chunker';
import { AiService } from '../ai/ai.service';
@Processor('knowledge-sync')
export class KnowledgePoolProcessor extends WorkerHost {
    private readonly logger = new Logger(KnowledgePoolProcessor.name);
    private readonly turndown: any;

    constructor(
        private readonly prisma: PrismaService,
        private readonly embeddingService: EmbeddingService,
        private readonly parserService: KnowledgePoolParserService,
        private readonly crawlService: CrawlService,
        private readonly aiService: AiService,
    ) {
        super();
        // Import-Level Safety: Using localized require to bypass top-level property access traps
        let AnyTurndown: any;
        try {
             
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            AnyTurndown = require('turndown');
        } catch (e) {
            this.logger.error(`🚨 Turndown library LOAD FAILURE: ${e.message}`);
        }

        let TurndownConstructor: any;

        if (!AnyTurndown) {
            this.logger.error('🚨 Turndown library is UNDEFINED. Using dummy fallback to prevent crash.');
            TurndownConstructor = class { addRule() { } turndown(h: string) { return h; } };
        } else if (typeof AnyTurndown === 'function') {
            TurndownConstructor = AnyTurndown;
        } else if (AnyTurndown.default && typeof AnyTurndown.default === 'function') {
            TurndownConstructor = AnyTurndown.default;
        } else if (AnyTurndown.default?.default && typeof AnyTurndown.default.default === 'function') {
            TurndownConstructor = AnyTurndown.default.default;
        } else {
            this.logger.error('🚨 Turndown constructor NOT FOUND in export. Using dummy fallback.');
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

    private async handleUrlSync(source: any, logId: string) {
        const { content, hash, title } = await this.crawlService.fetch(source.url);

        // Section 3.5.3: Change Monitor
        // If content length changes significantly (>30%), mark as major
        const oldLength = (source.metadata as any)?.lastContentLength || 0;
        const newLength = content.length;
        const delta = oldLength > 0 ? Math.abs(newLength - oldLength) / oldLength : 0;
        const isMajorChange = delta > 0.30;

        if (isMajorChange) {
            this.logger.warn(`🚨 Major change detected (${(delta * 100).toFixed(1)}%) for ${source.url}. Mark for review.`);
        }

        const hierarchies = hierarchicalChunk(content, { title });

        await this.prisma.$executeRawUnsafe(
            `DELETE FROM knowledge_pool_embeddings WHERE source_id = '${source.id}'::uuid`
        );

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
                    ...(source.metadata as any || {}),
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

    private async handleFileSync(source: any, logId: string) {
        if (!source.filePath) throw new Error('File path missing for source');

        let targetPath = source.filePath;

        // Smart Path Resolution: 
        // If path is absolute (Mac style) and doesn't exist, try resolving relative to project root/dataset
        if (targetPath.startsWith('/') && !fs.existsSync(targetPath)) {
            this.logger.warn(`⚠️ Absolute path not found: ${targetPath}. Attempting relative resolution...`);

            // Extract relative portion (look for 'dataset' in the path)
            const datasetIndex = targetPath.indexOf('dataset');
            if (datasetIndex !== -1) {
                const relativePath = targetPath.substring(datasetIndex);
                // Try from CWD (production /app or local root)
                const candidate = path.resolve(process.cwd(), relativePath);
                if (fs.existsSync(candidate)) {
                    this.logger.log(`✅ Resolved path to: ${candidate}`);
                    targetPath = candidate;
                }
            }
        } else if (!targetPath.startsWith('/') && !fs.existsSync(targetPath)) {
            // Already relative, resolve from CWD
            targetPath = path.resolve(process.cwd(), targetPath);
        }

        if (!fs.existsSync(targetPath)) {
            throw new Error(`File not found after resolution attempts: ${targetPath}`);
        }

        let content = await this.parserService.parseFile(source.type, targetPath);
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
        if (source.metadata?.useAiPreprocessing) {
            this.logger.log(`🧠 Applying AI Pre-processing for formatting and noise reduction: ${source.fileName}`);
            content = await this.aiService.cleanKnowledgeDocument(content);
        }

        const hierarchies = hierarchicalChunk(content, { title: source.name || source.fileName });

        await this.prisma.$executeRawUnsafe(
            `DELETE FROM knowledge_pool_embeddings WHERE source_id = '${source.id}'::uuid`
        );

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
        const _oldLength = (source.metadata as any)?.lastContentLength || 0;
        const newLength = content.length;

        await this.prisma.knowledgeSource.update({
            where: { id: source.id },
            data: {
                lastHash: hash,
                status: KnowledgeSourceStatus.ACTIVE,
                lastSyncedAt: new Date(),
                metadata: {
                    ...(source.metadata as any || {}),
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
