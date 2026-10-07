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
        const visualContentService = {
            enrichUrlContent: jest.fn(),
        };
        const configService = {
            get: jest.fn().mockImplementation((key: string, fallback?: string) => {
                if (key === 'KNOWLEDGE_SYNC_EMBED_BUDGET_GUARD') return 'false';
                return fallback;
            }),
        };
        const redisService = {
            get: jest.fn(),
            getClient: jest.fn(),
        };
        const syncQueue = {
            pause: jest.fn(),
        };

        const processor = new KnowledgePoolProcessor(
            prisma as any,
            embeddingService as any,
            parserService as any,
            {} as any,
            visualContentService as any,
            {} as any,
            storageService as any,
            configService as any,
            redisService as any,
            syncQueue as any,
        );

        return { processor, prisma, embeddingService, parserService, storageService, visualContentService };
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

    it('stores crawler metadata for URL sync results', async () => {
        const prisma = {
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
        const crawlService = {
            fetch: jest.fn().mockResolvedValue({
                content: 'Crawl4AI markdown content with enough detail for URL indexing.',
                title: 'Activating ALLPLAN license using Product Key',
                provider: 'crawl4ai',
                metadata: { crawl4aiSuccess: true },
            }),
        };
        const visualContentService = {
            enrichUrlContent: jest.fn().mockImplementation(({ content }) => Promise.resolve({
                content,
                summaries: [],
                metadata: { visualEnrichment: { enabled: false, selectedImageCount: 0, summarizedImageCount: 0 } },
            })),
        };
        const processor = new KnowledgePoolProcessor(
            prisma as any,
            embeddingService as any,
            {} as any,
            crawlService as any,
            visualContentService as any,
            {} as any,
            {} as any,
            { get: jest.fn((key: string, fallback?: string) => key === 'KNOWLEDGE_SYNC_EMBED_BUDGET_GUARD' ? 'false' : fallback) } as any,
            { get: jest.fn(), getClient: jest.fn() } as any,
            { pause: jest.fn() } as any,
        );

        await (processor as any).handleUrlSync({
            id: '8551f74c-e2e1-432c-af47-8ee988f86d14',
            url: 'https://example.com/help',
            name: 'Help',
            metadata: {
                source: 'allplan_learnnow',
                categorySlug: 'license-server-codemeter',
            },
        }, 'log-2');

        expect(embeddingService.indexPoolContent).toHaveBeenCalledWith(
            '8551f74c-e2e1-432c-af47-8ee988f86d14',
            expect.stringContaining('Crawl4AI markdown content'),
            expect.objectContaining({
                crawlerProvider: 'crawl4ai',
                category: 'License & Activation',
                categorySlug: 'license-activation',
            }),
        );
        expect(prisma.knowledgeSource.update).toHaveBeenCalledWith({
            where: { id: '8551f74c-e2e1-432c-af47-8ee988f86d14' },
            data: expect.objectContaining({
                name: 'Help',
                metadata: expect.objectContaining({
                    category: 'License & Activation',
                    categorySlug: 'license-activation',
                    pageTitle: 'Activating ALLPLAN license using Product Key',
                    displayNameSource: 'user_provided_name',
                    crawlerProvider: 'crawl4ai',
                    crawler: { crawl4aiSuccess: true },
                    visualEnrichment: expect.objectContaining({ enabled: false }),
                }),
            }),
        });
    });

    it('indexes visual summaries together with URL text content', async () => {
        const prisma = {
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
        const crawlService = {
            fetch: jest.fn().mockResolvedValue({
                content: 'Article body text.',
                title: 'Visual Article',
                provider: 'basic',
                metadata: {},
                images: [{ url: 'https://example.com/images/dialog.png', alt: 'Settings dialog' }],
            }),
        };
        const visualContentService = {
            enrichUrlContent: jest.fn().mockResolvedValue({
                content: 'Article body text.\n\nVISUAL EVIDENCE EXTRACTED FROM SOURCE IMAGES\nVisual 1:\nSummary: Dialog shows the Wireframe option.',
                summaries: [{
                    url: 'https://example.com/images/dialog.png',
                    alt: 'Settings dialog',
                    summary: 'Dialog shows the Wireframe option.',
                }],
                metadata: {
                    visualEnrichment: { enabled: true, selectedImageCount: 1, summarizedImageCount: 1 },
                    visualSummaries: [{
                        url: 'https://example.com/images/dialog.png',
                        alt: 'Settings dialog',
                        summary: 'Dialog shows the Wireframe option.',
                    }],
                },
            }),
        };
        const processor = new KnowledgePoolProcessor(
            prisma as any,
            embeddingService as any,
            {} as any,
            crawlService as any,
            visualContentService as any,
            {} as any,
            {} as any,
            { get: jest.fn((key: string, fallback?: string) => key === 'KNOWLEDGE_SYNC_EMBED_BUDGET_GUARD' ? 'false' : fallback) } as any,
            { get: jest.fn(), getClient: jest.fn() } as any,
            { pause: jest.fn() } as any,
        );

        await (processor as any).handleUrlSync({
            id: '8551f74c-e2e1-432c-af47-8ee988f86d14',
            url: 'https://example.com/help',
            name: 'Visual Article',
            metadata: {},
        }, 'log-visual');

        expect(embeddingService.indexPoolContent).toHaveBeenCalledWith(
            '8551f74c-e2e1-432c-af47-8ee988f86d14',
            expect.stringContaining('Dialog shows the Wireframe option.'),
            expect.objectContaining({ visualSummaryCount: 1 }),
        );
        expect(prisma.knowledgeSource.update).toHaveBeenCalledWith({
            where: { id: '8551f74c-e2e1-432c-af47-8ee988f86d14' },
            data: expect.objectContaining({
                metadata: expect.objectContaining({
                    visualEnrichment: expect.objectContaining({ summarizedImageCount: 1 }),
                    visualSummaries: expect.arrayContaining([
                        expect.objectContaining({ summary: 'Dialog shows the Wireframe option.' }),
                    ]),
                }),
            }),
        });
    });

    it('preserves a user supplied URL source name when crawler title is generic', async () => {
        const prisma = {
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
        const crawlService = {
            fetch: jest.fn().mockResolvedValue({
                content: 'Learn Now article content with enough detail for URL indexing.',
                title: 'LEARNNOW Allplan',
                provider: 'crawl4ai',
                metadata: { crawl4aiSuccess: true },
            }),
        };
        const visualContentService = {
            enrichUrlContent: jest.fn().mockImplementation(({ content }) => Promise.resolve({
                content,
                summaries: [],
                metadata: {},
            })),
        };
        const processor = new KnowledgePoolProcessor(
            prisma as any,
            embeddingService as any,
            {} as any,
            crawlService as any,
            visualContentService as any,
            {} as any,
            {} as any,
            { get: jest.fn((key: string, fallback?: string) => key === 'KNOWLEDGE_SYNC_EMBED_BUDGET_GUARD' ? 'false' : fallback) } as any,
            { get: jest.fn(), getClient: jest.fn() } as any,
            { pause: jest.fn() } as any,
        );

        await (processor as any).handleUrlSync({
            id: '8551f74c-e2e1-432c-af47-8ee988f86d14',
            url: 'https://learnnow.allplan.com/mod/page/view.php?id=42',
            name: 'License server manual add article',
            metadata: {
                userProvidedName: 'License server manual add article',
                category: 'License Server & CodeMeter',
            },
        }, 'log-3');

        expect(prisma.knowledgeSource.update).toHaveBeenCalledWith({
            where: { id: '8551f74c-e2e1-432c-af47-8ee988f86d14' },
            data: expect.objectContaining({
                name: 'License server manual add article',
                metadata: expect.objectContaining({
                    crawlerTitle: 'LEARNNOW Allplan',
                    displayNameSource: 'user_provided_name',
                }),
            }),
        });
    });

    it('pauses the queue before embedding when the estimated budget cap would be exceeded', async () => {
        const prisma = {
            knowledgePoolEmbedding: {
                count: jest.fn().mockResolvedValue(0),
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
            parseFile: jest.fn().mockResolvedValue(content.repeat(20)),
        };
        const storageService = {
            getFile: jest.fn().mockResolvedValue(Buffer.from('pdf bytes')),
        };
        const configService = {
            get: jest.fn().mockImplementation((key: string, fallback?: string) => {
                if (key === 'KNOWLEDGE_SYNC_EMBED_BUDGET_GUARD') return 'true';
                if (key === 'KNOWLEDGE_SYNC_DAILY_EMBED_USD_CAP') return '0.00001';
                if (key === 'LLMAPI_EMBED_MODEL') return 'gemini-embedding-2';
                return fallback;
            }),
        };
        const redisClient = {
            incrbyfloat: jest.fn(),
            expire: jest.fn(),
        };
        const redisService = {
            get: jest.fn().mockResolvedValue('0'),
            getClient: jest.fn().mockReturnValue(redisClient),
        };
        const syncQueue = {
            pause: jest.fn().mockResolvedValue(undefined),
        };
        const processor = new KnowledgePoolProcessor(
            prisma as any,
            embeddingService as any,
            parserService as any,
            {} as any,
            { enrichUrlContent: jest.fn() } as any,
            {} as any,
            storageService as any,
            configService as any,
            redisService as any,
            syncQueue as any,
        );

        await expect((processor as any).handleFileSync({
            ...source,
            lastHash: null,
        }, 'log-3')).rejects.toThrow(/budget cap reached/i);

        expect(syncQueue.pause).toHaveBeenCalled();
        expect(embeddingService.indexPoolContent).not.toHaveBeenCalled();
    });
});
