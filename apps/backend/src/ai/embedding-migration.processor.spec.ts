import { EmbeddingMigrationProcessor } from './embedding-migration.processor';

describe('EmbeddingMigrationProcessor stabilization guard', () => {
    const approvalKey = 'EMBEDDING_MIGRATION_APPROVED';
    const config = { version: 'v3s', dimension: 1536, provider: 'openai', model: 'text-embedding-3-small' };

    afterEach(() => {
        delete process.env[approvalKey];
        jest.restoreAllMocks();
    });

    function createProcessor() {
        const prisma = {
            $executeRawUnsafe: jest.fn().mockResolvedValue(1),
            faqEntry: { findMany: jest.fn().mockResolvedValue([]) },
            knowledgePoolEmbedding: { findMany: jest.fn().mockResolvedValue([]) },
            ticketEmbedding: { findMany: jest.fn().mockResolvedValue([]) },
            knowledgeEmbedding: { findMany: jest.fn().mockResolvedValue([]) },
        };
        const embeddingService = { embedText: jest.fn().mockResolvedValue([0.1, 0.2]) };
        const registry = { getActiveVersionConfig: jest.fn().mockResolvedValue(config) };
        const migrationQueue = { add: jest.fn().mockResolvedValue({}) };
        return {
            processor: new EmbeddingMigrationProcessor(prisma as any, embeddingService as any, registry as any, migrationQueue as any),
            prisma,
            embeddingService,
            registry,
            migrationQueue,
        };
    }

    it('does not flush cache or enqueue when approval is absent', async () => {
        const { processor, prisma, registry, migrationQueue } = createProcessor();

        await expect(processor.handleProviderChange({ key: 'ai.gemini.embed_model', newValue: 'gemini-embedding-2', oldValue: 'gemini-embedding-001' }))
            .resolves.toEqual({ blocked: true, reason: 'operator-approval-required' });
        expect(registry.getActiveVersionConfig).not.toHaveBeenCalled();
        expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
        expect(migrationQueue.add).not.toHaveBeenCalled();
    });

    it('uses deterministic queue identity after explicit approval', async () => {
        process.env[approvalKey] = 'true';
        const { processor, migrationQueue } = createProcessor();

        await processor.handleProviderChange({ key: 'ai.gemini.embed_model', newValue: 'gemini-embedding-2', oldValue: 'gemini-embedding-001' });

        expect(migrationQueue.add).toHaveBeenCalledWith('migrate-vectors', expect.objectContaining({ targetVersion: 'v3s' }), expect.objectContaining({ jobId: 'migrate-v3s' }));
    });

    it('bounds dry-run processing to one batch per source and terminates', async () => {
        process.env[approvalKey] = 'true';
        const { processor, prisma, embeddingService } = createProcessor();
        prisma.faqEntry.findMany.mockResolvedValue([{ id: 'faq-1', question: 'Q' }]);
        prisma.knowledgePoolEmbedding.findMany.mockResolvedValue([{ id: 'pool-1', content: 'P' }]);
        prisma.ticketEmbedding.findMany.mockResolvedValue([{ id: 'ticket-1', ticket: { subject: 'S', description: 'D' } }]);
        prisma.knowledgeEmbedding.findMany.mockResolvedValue([{ id: 'knowledge-1', content: 'K' }]);

        await expect(processor.process({ data: { targetVersion: 'v3s', targetDimension: 1536, provider: 'openai', model: 'text-embedding-3-small', batchSize: 50, dryRun: true } } as any))
            .resolves.toEqual({ totalMigrated: 4, targetVersion: 'v3s' });
        expect(embeddingService.embedText).not.toHaveBeenCalled();
        expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
    });

    it('stops a failed batch instead of retrying the same records forever', async () => {
        process.env[approvalKey] = 'true';
        const { processor, prisma, embeddingService } = createProcessor();
        prisma.faqEntry.findMany.mockResolvedValue([{ id: 'faq-1', question: 'Q' }]);
        embeddingService.embedText.mockRejectedValue(new Error('provider unavailable'));

        await expect(processor.process({ data: { targetVersion: 'v3s', targetDimension: 1536, provider: 'openai', model: 'text-embedding-3-small', batchSize: 50, dryRun: false } } as any))
            .resolves.toEqual({ totalMigrated: 0, targetVersion: 'v3s' });
        expect(prisma.faqEntry.findMany).toHaveBeenCalledTimes(1);
    });
});
