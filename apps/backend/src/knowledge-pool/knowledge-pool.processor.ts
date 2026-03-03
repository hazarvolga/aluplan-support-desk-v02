import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../ai/embedding.service';
import { KnowledgePoolParserService } from './knowledge-pool-parser.service';
import * as crypto from 'crypto';
import TurndownService from 'turndown';
import { KnowledgeSourceStatus, KnowledgeSourceType } from '@aluplan/database';

import { CrawlService } from './crawl.service';
import { hierarchicalChunk } from '../knowledge-base/utils/smart-chunker';
import { AiService } from '../ai/ai.service';

@Processor('knowledge-sync')
export class KnowledgePoolProcessor extends WorkerHost {
    private readonly logger = new Logger(KnowledgePoolProcessor.name);
    private readonly turndown = new (TurndownService as any)();

    constructor(
        private readonly prisma: PrismaService,
        private readonly embeddingService: EmbeddingService,
        private readonly parserService: KnowledgePoolParserService,
        private readonly crawlService: CrawlService,
        private readonly aiService: AiService,
    ) {
        super();
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
        let content = await this.parserService.parseFile(source.type, source.filePath);
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
                status: 'ACTIVE'
            });
            for (const child of h.children) {
                await this.embeddingService.indexPoolContent(source.id, child, {
                    fileName: source.fileName,
                    type: 'child',
                    status: 'ACTIVE'
                });
                totalChunks++;
            }
        }

        // Section 3.5.3: Change Monitor (Partial for files - size track)
        const oldLength = (source.metadata as any)?.lastContentLength || 0;
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
