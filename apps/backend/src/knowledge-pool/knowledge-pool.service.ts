import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKnowledgeSourceDto } from './dto/create-knowledge-source.dto';
import { KnowledgeSourceStatus, KnowledgeSourceType } from '@aluplan/database';

@Injectable()
export class KnowledgePoolService {
    private readonly logger = new Logger(KnowledgePoolService.name);

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue('knowledge-sync') private readonly syncQueue: Queue,
    ) { }

    async createSource(dto: CreateKnowledgeSourceDto) {
        // @ts-ignore
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

    async createFileSource(name: string, type: KnowledgeSourceType, file: Express.Multer.File) {
        // @ts-ignore
        const source = await this.prisma.knowledgeSource.create({
            data: {
                name,
                type,
                fileName: file.originalname,
                filePath: file.path,
                status: KnowledgeSourceStatus.ACTIVE,
            },
        });

        await this.triggerSync(source.id);
        return source;
    }

    async getAllSources() {
        // @ts-ignore
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

    async triggerSync(id: string) {
        // @ts-ignore
        const source = await this.prisma.knowledgeSource.findUnique({ where: { id } });
        if (!source) throw new NotFoundException('Source not found');

        // @ts-ignore
        await this.prisma.knowledgeSource.update({
            where: { id },
            data: { status: KnowledgeSourceStatus.SYNCING },
        });

        await this.syncQueue.add('sync-source', { sourceId: id }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true,
        });

        this.logger.log(`🔄 Enqueued sync job for source: ${source.name} (${id})`);
    }

    async getSyncLogs(sourceId: string) {
        // @ts-ignore
        return this.prisma.knowledgeSourceSyncLog.findMany({
            where: { sourceId },
            orderBy: { syncStartedAt: 'desc' },
            take: 10,
        });
    }
}
