import { KnowledgeSourceStatus } from '@aluplan/database';
import { KnowledgePoolProcessor } from './knowledge-pool.processor';
import { EmbeddingService } from '../ai/embedding.service';

describe('CWL-02 isolated public URL ingestion smoke', () => {
    it('crawls, chunks/indexes, activates the source, and returns the indexed content semantically', async () => {
        const source = {
            id: '8551f74c-e2e1-432c-af47-8ee988f86d14',
            url: 'https://example.com/help',
            name: 'Example public help',
            metadata: { category: 'Installation & Setup' },
        };
        const embeddingVector = Array.from({ length: 1536 }, () => 0.1);
        const indexedContent: string[] = [];
        const prisma = {
            $executeRaw: jest.fn().mockImplementation(async (...args: unknown[]) => {
                const sql = String(args[0] ?? '');
                if (sql.includes('INSERT INTO knowledge_pool_embeddings')) {
                    const content = args[5];
                    if (typeof content === 'string') indexedContent.push(content);
                }
                return 1;
            }),
            $queryRaw: jest.fn().mockImplementation(async () => indexedContent.length > 0 ? [{
                article_id: source.id,
                source_type: 'POOL',
                title: source.name,
                content: indexedContent[0],
                similarity: 0.95,
                trust_score: 0.8,
                language: 'en',
                category: 'Installation & Setup',
                updated_at: new Date(),
                visual_summaries: null,
            }] : []),
            $transaction: jest.fn().mockImplementation((callback: (tx: any) => unknown) => callback(prisma)),
            knowledgeSource: { update: jest.fn().mockResolvedValue({}) },
            knowledgeSourceSyncLog: { update: jest.fn().mockResolvedValue({}) },
        };
        const ai = {
            embed: jest.fn().mockResolvedValue({ embedding: embeddingVector, model: 'text-embedding-3-small' }),
        };
        const registry = {
            getActiveVersionConfig: jest.fn().mockResolvedValue({ version: 'v3s', dimension: 1536, provider: 'openai', model: 'text-embedding-3-small' }),
        };
        const embeddingService = new EmbeddingService(
            prisma as any,
            ai as any,
            { emit: jest.fn() } as any,
            registry as any,
        );
        const indexPoolContent = jest.spyOn(embeddingService, 'indexPoolContent');
        const crawlService = {
            fetch: jest.fn().mockResolvedValue({
                content: '# License activation\nOpen License Manager and activate the license on the workstation.',
                title: 'License activation help',
                provider: 'isolated-fixture',
                metadata: { fixture: true },
                images: [],
            }),
        };
        const visualContentService = {
            enrichUrlContent: jest.fn().mockImplementation(({ content }: { content: string }) => Promise.resolve({
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

        await (processor as any).handleUrlSync(source, 'log-cwl02');

        expect(crawlService.fetch).toHaveBeenCalledWith(source.url);
        expect(indexPoolContent).toHaveBeenCalledWith(
            source.id,
            expect.stringContaining('Open License Manager'),
            expect.objectContaining({ sourceType: 'url', crawlerProvider: 'isolated-fixture' }),
        );
        expect(prisma.knowledgeSource.update).toHaveBeenCalledWith({
            where: { id: source.id },
            data: expect.objectContaining({ status: KnowledgeSourceStatus.ACTIVE, lastSyncedAt: expect.any(Date) }),
        });
        expect(indexedContent).toEqual(expect.arrayContaining([
            expect.stringContaining('Open License Manager'),
        ]));

        const search = await embeddingService.search('activate the license');
        expect(search.results).toEqual([expect.objectContaining({ articleId: source.id, sourceType: 'POOL' })]);
        expect(search.diagnostics.passedThreshold).toBe(1);
    });
});
