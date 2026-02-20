import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../ai/embedding.service';
import { KnowledgePoolParserService } from './knowledge-pool-parser.service';
import axios from 'axios';
import * as crypto from 'crypto';
import * as TurndownService from 'turndown';
import { KnowledgeSourceStatus, KnowledgeSourceType } from '@aluplan/database';

@Processor('knowledge-sync')
export class KnowledgePoolProcessor extends WorkerHost {
    private readonly logger = new Logger(KnowledgePoolProcessor.name);
    private readonly turndown = new (TurndownService as any)();

    constructor(
        private readonly prisma: PrismaService,
        private readonly embeddingService: EmbeddingService,
        private readonly parserService: KnowledgePoolParserService,
    ) {
        super();
    }

    async process(job: Job<{ sourceId: string }>): Promise<any> {
        const { sourceId } = job.data;
        // @ts-ignore
        const source = await this.prisma.knowledgeSource.findUnique({ where: { id: sourceId } });
        if (!source) return;

        this.logger.log(`🏗️ Processing sync for: ${source.name} (${source.type})`);

        // @ts-ignore
        const log = await this.prisma.knowledgeSourceSyncLog.create({
            data: {
                sourceId,
                status: 'SYNCING',
            },
        });

        try {
            if (source.type === KnowledgeSourceType.URL) {
                await this.handleUrlSync(source, log.id);
            } else if (source.type.startsWith('FILE_')) {
                await this.handleFileSync(source, log.id);
            } else {
                throw new Error(`Source type ${source.type} parser not yet implemented`);
            }

            // @ts-ignore
            await this.prisma.knowledgeSourceSyncLog.update({
                where: { id: log.id },
                data: { status: 'SUCCESS', syncFinishedAt: new Date() },
            });

            // @ts-ignore
            await this.prisma.knowledgeSource.update({
                where: { id: sourceId },
                data: { status: KnowledgeSourceStatus.ACTIVE, lastSyncedAt: new Date() },
            });

        } catch (error) {
            this.logger.error(`❌ Sync failed for ${sourceId}: ${error.message}`);
            // @ts-ignore
            await this.prisma.knowledgeSourceSyncLog.update({
                where: { id: log.id },
                data: { status: 'FAILED', error: error.message, syncFinishedAt: new Date() },
            });
            // @ts-ignore
            await this.prisma.knowledgeSource.update({
                where: { id: sourceId },
                data: { status: KnowledgeSourceStatus.FAILED },
            });
        }
    }

    private async handleUrlSync(source: any, logId: string) {
        const head = await axios.head(source.url, { timeout: 10000 }).catch(() => null);
        const etag = head?.headers?.etag;

        if (etag && etag === source.lastEtag) {
            this.logger.log(`⏩ URL unchanged (ETag match): ${source.url}`);
            return;
        }

        const response = await axios.get(source.url, { timeout: 30000 });
        const html = response.data;
        const markdown = this.turndown.turndown(html);
        const hash = crypto.createHash('sha256').update(markdown).digest('hex');

        if (hash === source.lastHash) {
            this.logger.log(`⏩ URL unchanged (Hash match): ${source.url}`);
            return;
        }

        await this.prisma.$executeRawUnsafe(
            `DELETE FROM knowledge_pool_embeddings WHERE source_id = '${source.id}'::uuid`
        );

        const chunks = this.chunkText(markdown, 1000, 200);
        for (const chunk of chunks) {
            await this.embeddingService.indexPoolContent(source.id, chunk, { url: source.url });
        }

        // @ts-ignore
        await this.prisma.knowledgeSource.update({
            where: { id: source.id },
            data: { lastEtag: etag, lastHash: hash }
        });

        // @ts-ignore
        await this.prisma.knowledgeSourceSyncLog.update({
            where: { id: logId },
            data: { chunksProcessed: chunks.length, newHash: hash }
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

        await this.prisma.$executeRawUnsafe(
            `DELETE FROM knowledge_pool_embeddings WHERE source_id = '${source.id}'::uuid`
        );

        const chunks = this.chunkText(content, 1000, 200);
        for (const chunk of chunks) {
            await this.embeddingService.indexPoolContent(source.id, chunk, { fileName: source.fileName });
        }

        // @ts-ignore
        await this.prisma.knowledgeSource.update({
            where: { id: source.id },
            data: { lastHash: hash }
        });

        // @ts-ignore
        await this.prisma.knowledgeSourceSyncLog.update({
            where: { id: logId },
            data: { chunksProcessed: chunks.length, newHash: hash }
        });
    }

    private chunkText(text: string, size: number, overlap: number): string[] {
        const chunks: string[] = [];
        let start = 0;
        while (start < text.length) {
            const end = start + size;
            chunks.push(text.slice(start, end));
            start += size - overlap;
        }
        return chunks;
    }
}
