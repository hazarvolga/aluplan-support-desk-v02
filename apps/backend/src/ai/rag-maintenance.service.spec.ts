import { RagMaintenanceService } from './rag-maintenance.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { KnowledgePoolService } from '../knowledge-pool/knowledge-pool.service';
import { EmbeddingVersionRegistry } from './embedding-version.registry';

describe('RagMaintenanceService', () => {
    let service: RagMaintenanceService;
    let prisma: {
        $queryRaw: jest.Mock;
        $queryRawUnsafe: jest.Mock;
        $executeRawUnsafe: jest.Mock;
    };
    let settings: {
        getValue: jest.Mock;
        upsert: jest.Mock;
    };
    let poolService: {
        syncLocalDataset: jest.Mock;
    };
    let registry: {
        getActiveVersionConfig: jest.Mock;
    };

    beforeEach(() => {
        prisma = {
            $queryRaw: jest.fn(),
            $queryRawUnsafe: jest.fn(),
            $executeRawUnsafe: jest.fn(),
        };
        settings = {
            getValue: jest.fn().mockResolvedValue('3'),
            upsert: jest.fn(),
        };
        poolService = {
            syncLocalDataset: jest.fn().mockResolvedValue(undefined),
        };
        registry = {
            getActiveVersionConfig: jest.fn().mockResolvedValue({ version: 'v3s', dimension: 1536, provider: 'openai', model: 'text-embedding-3-small' }),
        };

        service = new RagMaintenanceService(
            prisma as unknown as PrismaService,
            settings as unknown as SettingsService,
            poolService as unknown as KnowledgePoolService,
            registry as unknown as EmbeddingVersionRegistry,
        );
    });

    it('rebuilds non-hnsw vector indexes and keeps valid ones', async () => {
        prisma.$queryRaw.mockResolvedValue([{ extname: 'vector' }]);
        prisma.$queryRawUnsafe
            .mockResolvedValueOnce([{ formatted_type: 'vector(1536)' }])
            .mockResolvedValueOnce([{ indexdef: 'CREATE INDEX knowledge_embeddings_vector_hnsw_idx ON public.knowledge_embeddings USING btree (embedding)' }])
            .mockResolvedValueOnce([{ formatted_type: 'vector(1536)' }])
            .mockResolvedValueOnce([{ indexdef: 'CREATE INDEX knowledge_pool_embeddings_vector_hnsw_idx ON public.knowledge_pool_embeddings USING hnsw (embedding vector_cosine_ops)' }])
            .mockResolvedValueOnce([{ formatted_type: 'vector(1536)' }])
            .mockResolvedValueOnce([]);
        prisma.$executeRawUnsafe.mockResolvedValue(0);

        await (service as any).optimizeIndexes();

        const executedSql = prisma.$executeRawUnsafe.mock.calls.map((call) => String(call[0]));
        expect(executedSql.some((sql) => sql.includes('DROP INDEX IF EXISTS "knowledge_embeddings_vector_hnsw_idx"'))).toBe(true);
        expect(executedSql.some((sql) => sql.includes('CREATE INDEX "knowledge_embeddings_vector_hnsw_idx"'))).toBe(true);
        expect(executedSql.some((sql) => sql.includes('CREATE INDEX "ticket_embeddings_vector_hnsw_idx"'))).toBe(true);
        expect(executedSql.some((sql) => sql.includes('DROP INDEX IF EXISTS "knowledge_pool_embeddings_vector_hnsw_idx"'))).toBe(false);
    });

    it('drops vector indexes and skips HNSW when active dimension exceeds pgvector limit', async () => {
        prisma.$queryRaw.mockResolvedValue([{ extname: 'vector' }]);
        prisma.$queryRawUnsafe
            .mockResolvedValueOnce([{ formatted_type: 'vector(3072)' }])
            .mockResolvedValueOnce([{ indexdef: 'CREATE INDEX knowledge_embeddings_vector_hnsw_idx ON public.knowledge_embeddings USING btree (embedding)' }])
            .mockResolvedValueOnce([{ formatted_type: 'vector(3072)' }])
            .mockResolvedValueOnce([{ indexdef: 'CREATE INDEX knowledge_pool_embeddings_vector_hnsw_idx ON public.knowledge_pool_embeddings USING btree (embedding)' }])
            .mockResolvedValueOnce([{ formatted_type: 'vector(3072)' }])
            .mockResolvedValueOnce([]);
        prisma.$executeRawUnsafe.mockResolvedValue(0);

        registry = { getActiveVersionConfig: jest.fn().mockResolvedValue({ version: 'v2_2', dimension: 3072, provider: 'gemini', model: 'gemini-embedding-2' }) };
        service = new RagMaintenanceService(
            prisma as unknown as PrismaService,
            settings as unknown as SettingsService,
            poolService as unknown as KnowledgePoolService,
            registry as unknown as EmbeddingVersionRegistry,
        );

        await (service as any).optimizeIndexes();

        const executedSql = prisma.$executeRawUnsafe.mock.calls.map((call) => String(call[0]));
        expect(executedSql.some((sql) => sql.includes('DROP INDEX IF EXISTS "knowledge_embeddings_vector_hnsw_idx"'))).toBe(true);
        expect(executedSql.some((sql) => sql.includes('DROP INDEX IF EXISTS "knowledge_pool_embeddings_vector_hnsw_idx"'))).toBe(true);
        expect(executedSql.some((sql) => sql.includes('CREATE INDEX "knowledge_embeddings_vector_hnsw_idx"'))).toBe(false);
        expect(executedSql.some((sql) => sql.includes('CREATE INDEX "knowledge_pool_embeddings_vector_hnsw_idx"'))).toBe(false);
    });

    it('skips optimization when pgvector is unavailable', async () => {
        prisma.$queryRaw.mockResolvedValue([]);

        await (service as any).optimizeIndexes();

        expect(prisma.$queryRawUnsafe).not.toHaveBeenCalled();
        expect(prisma.$executeRawUnsafe).not.toHaveBeenCalled();
    });
});
