import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { CreateKnowledgeSourceDto } from './dto/create-knowledge-source.dto';
import { KnowledgeSourceStatus, KnowledgeSourceType } from '@aluplan/database';
import * as path from 'path';
import * as fs from 'fs';

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

    async syncLocalDataset() {
        const datasetDir = path.resolve(process.cwd(), '../../dataset');

        if (!fs.existsSync(datasetDir)) {
            this.logger.error(`Dataset directory not found at ${datasetDir}`);
            return { success: false, message: 'Dataset directory not found', scanned: 0 };
        }

        const filesToSync: string[] = [];
        const validExts = ['.md', '.json', '.csv', '.pdf', '.txt'];

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

            const fileName = path.basename(filePath);

            // @ts-ignore
            const existing = await this.prisma.knowledgeSource.findFirst({
                where: { filePath }
            });

            if (existing) {
                await this.triggerSync(existing.id);
                existingCount++;
            } else {
                // @ts-ignore
                const source = await this.prisma.knowledgeSource.create({
                    data: {
                        name: `[Dataset] ${fileName}`,
                        type,
                        fileName,
                        filePath,
                        status: KnowledgeSourceStatus.ACTIVE,
                        metadata: {
                            useAiPreprocessing: true,
                        }
                    },
                });
                await this.triggerSync(source.id);
                addedCount++;
            }
        }

        return {
            success: true,
            message: `Dataset sync initiated. Added ${addedCount} new files. Checked ${existingCount} existing files.`,
            totalFiles: filesToSync.length
        };
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
