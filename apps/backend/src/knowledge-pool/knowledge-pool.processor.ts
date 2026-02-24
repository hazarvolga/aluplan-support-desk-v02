import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../ai/embedding.service';
import { KnowledgePoolParserService } from './knowledge-pool-parser.service';
import axios from 'axios';
import * as crypto from 'crypto';
const TurndownService = require('turndown');
import { KnowledgeSourceStatus, KnowledgeSourceType } from '@aluplan/database';

import { CrawlService } from './crawl.service';

@Processor('knowledge-sync')
export class KnowledgePoolProcessor extends WorkerHost {
    private readonly logger = new Logger(KnowledgePoolProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly embeddingService: EmbeddingService,
        private readonly parserService: KnowledgePoolParserService,
        private readonly crawlService: CrawlService,
    ) {
        super();
    }

    async process(job: Job<{ sourceId: string }>): Promise<any> {
        // ... same logic ...
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

        const { hierarchicalChunk } = await import('../knowledge-base/utils/smart-chunker');
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

        // @ts-ignore
        await this.prisma.knowledgeSource.update({
            where: { id: source.id },
            data: {
                lastHash: hash,
                name: title,
                status: isMajorChange ? KnowledgeSourceStatus.INACTIVE : KnowledgeSourceStatus.ACTIVE, // Or mapped to review
                metadata: {
                    ...(source.metadata as any || {}),
                    lastContentLength: newLength,
                    isMajorChange
                }
            }
        });

        // @ts-ignore
        await this.prisma.knowledgeSourceSyncLog.update({
            where: { id: logId },
            data: { chunksProcessed: totalChunks, newHash: hash }
        });
    }

    private async handleFileSync(source: any, logId: string) {
        if (!source.filePath) throw new Error('File path missing for source');
        const content = await this.parserService.parseFile(source.type, source.filePath);
        const hash = crypto.createHash('sha256').update(content).digest('hex');

        if (hash === source.lastHash) {
            this.logger.log(`⏩ File unchanged (Hash match): ${source.fileName}`);
            return;
        }

        const { hierarchicalChunk } = await import('../knowledge-base/utils/smart-chunker');
        const hierarchies = hierarchicalChunk(content, { title: source.name || source.fileName });

        await this.prisma.$executeRawUnsafe(
            `DELETE FROM knowledge_pool_embeddings WHERE source_id = '${source.id}'::uuid`
        );

        let totalChunks = 0;
        for (const h of hierarchies) {
            await this.embeddingService.indexPoolContent(source.id, h.parent, { fileName: source.fileName, type: 'parent' });
            for (const child of h.children) {
                await this.embeddingService.indexPoolContent(source.id, child, { fileName: source.fileName, type: 'child' });
                totalChunks++;
            }
        }

        // @ts-ignore
        await this.prisma.knowledgeSource.update({
            where: { id: source.id },
            data: { lastHash: hash }
        });

        // @ts-ignore
        await this.prisma.knowledgeSourceSyncLog.update({
            where: { id: logId },
            data: { chunksProcessed: totalChunks, newHash: hash }
        });
    }
}
