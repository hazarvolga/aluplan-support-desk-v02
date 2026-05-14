import { buildKnowledgeSyncWorkerOptions } from './knowledge-pool.processor';
import { KnowledgePoolProcessor } from './knowledge-pool.processor';
import { KnowledgeSourceStatus, KnowledgeSourceType } from '@aluplan/database';
import { createHash } from 'crypto';

describe('KnowledgePoolProcessor queue worker options', () => {
    it('uses low-rate defaults that are safe for bulk ingestion', () => {
        const options = buildKnowledgeSyncWorkerOptions({});

        expect(options).toEqual({
            concurrency: 1,
            limiter: {
                max: 1,
                duration: 15000,
            },
        });
    });

    it('accepts explicit env overrides', () => {
        const options = buildKnowledgeSyncWorkerOptions({
            KNOWLEDGE_SYNC_QUEUE_CONCURRENCY: '2',
            KNOWLEDGE_SYNC_RATE_MAX: '3',
            KNOWLEDGE_SYNC_RATE_DURATION_MS: '45000',
        });

        expect(options).toEqual({
            concurrency: 2,
            limiter: {
                max: 3,
                duration: 45000,
            },
        });
    });

    it('falls back when env overrides are invalid', () => {
        const options = buildKnowledgeSyncWorkerOptions({
            KNOWLEDGE_SYNC_QUEUE_CONCURRENCY: '0',
            KNOWLEDGE_SYNC_RATE_MAX: '-2',
            KNOWLEDGE_SYNC_RATE_DURATION_MS: 'NaN',
        });

        expect(options).toEqual({
            concurrency: 1,
            limiter: {
                max: 1,
                duration: 15000,
            },
        });
    });
});

describe('KnowledgePoolProcessor file sync', () => {
    const content = 'Allplan license server troubleshooting content with enough detail for indexing.';
    const contentHash = createHash('sha256').update(content).digest('hex');

    const buildProcessor = (embeddingCount: number) => {
        const prisma = {
            knowledgePoolEmbedding: {
                count: jest.fn().mockResolvedValue(embeddingCount),
            },
            knowledgeSource: {
                update: jest.fn().mockResolvedValue({}),
            },
            knowledgeSourceSyncLog: {
                update: jest.fn().mockResolvedValue({}),
            },
        };
        const embeddingService = {
            indexPoolContent: jest.fn().mockResolvedValue(undefined),
        };
        const parserService = {
            parseFile: jest.fn().mockResolvedValue(content),
        };
        const storageService = {
            getFile: jest.fn().mockResolvedValue(Buffer.from('pdf bytes')),
        };

        const processor = new KnowledgePoolProcessor(
            prisma as any,
            embeddingService as any,
            parserService as any,
            {} as any,
            {} as any,
            storageService as any,
        );

        return { processor, prisma, embeddingService, parserService, storageService };
    };

    const source = {
        id: '8551f74c-e2e1-432c-af47-8ee988f86d14',
        filePath: '/dataset/de/license-server-codemeter/batch-003/license.pdf',
        fileName: 'license.pdf',
        lastHash: contentHash,
        type: KnowledgeSourceType.FILE_PDF,
        name: '[Dataset] license.pdf',
        language: 'de',
        metadata: { category: 'License Server & CodeMeter' },
    };

    it('keeps unchanged files successful when embeddings already exist', async () => {
        const { processor, prisma, embeddingService } = buildProcessor(3);

        await (processor as any).handleFileSync(source, 'log-1');

        expect(prisma.knowledgePoolEmbedding.count).toHaveBeenCalledWith({
            where: { sourceId: source.id },
        });
        expect(embeddingService.indexPoolContent).not.toHaveBeenCalled();
        expect(prisma.knowledgeSource.update).toHaveBeenCalledWith({
            where: { id: source.id },
            data: { status: KnowledgeSourceStatus.ACTIVE, lastSyncedAt: expect.any(Date) },
        });
    });

    it('re-indexes unchanged files when embeddings are missing', async () => {
        const { processor, prisma, embeddingService } = buildProcessor(0);

        await (processor as any).handleFileSync(source, 'log-1');

        expect(embeddingService.indexPoolContent).toHaveBeenCalledWith(source.id, content, expect.objectContaining({
            fileName: source.fileName,
            sourceType: 'file',
            status: 'ACTIVE',
            language: 'de',
            category: 'License Server & CodeMeter',
        }));
        expect(prisma.knowledgeSourceSyncLog.update).toHaveBeenCalledWith({
            where: { id: 'log-1' },
            data: { chunksProcessed: expect.any(Number), newHash: contentHash },
        });
    });
});
