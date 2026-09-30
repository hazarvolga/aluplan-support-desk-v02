import { Test, TestingModule } from '@nestjs/testing';
import { AiSemanticCache } from './ai-semantic-cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';
import { EmbeddingNormalizer } from './embedding-normalizer.service';
import { EmbeddingVersionRegistry } from './embedding-version.registry';
import { RedisService } from '../redis/redis.service';
import { mockPrismaService, mockRedisService } from '../test/mock.utils';
import { RAG_CONFIG } from '../config/rag.config';

const mockVersionConfig = { version: 'v3s', dimension: 3, provider: 'openai', model: 'text-embedding-3-small' };

const mockEmbeddingVersionRegistry = {
    getActiveVersionConfig: jest.fn().mockResolvedValue(mockVersionConfig),
    getVersionConfig: jest.fn().mockReturnValue({ version: 'v3s', dimension: 3 }),
};

describe('AiSemanticCache', () => {
    let cache: AiSemanticCache;
    let prisma: any;
    let embeddingService: any;
    let normalizer: EmbeddingNormalizer;
    let redis: any;

    const mockEmbeddingService = {
        embed: jest.fn(),
        embedText: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiSemanticCache,
                EmbeddingNormalizer,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: EmbeddingService, useValue: mockEmbeddingService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: EmbeddingVersionRegistry, useValue: mockEmbeddingVersionRegistry },
            ],
        }).compile();

        cache = module.get<AiSemanticCache>(AiSemanticCache);
        prisma = module.get<PrismaService>(PrismaService);
        embeddingService = module.get<EmbeddingService>(EmbeddingService);
        normalizer = module.get<EmbeddingNormalizer>(EmbeddingNormalizer);
        redis = module.get<RedisService>(RedisService);

        jest.clearAllMocks();
    });

    const mockResult: any = {
        query: 'test query',
        answer: 'test answer',
        confidence: 'HIGH',
        sources: [],
        interactionId: 'int-1',
        suggestTicket: false,
        cacheVersion: RAG_CONFIG.CACHE.VERSION,
    };
    const defaultScope = {
        userId: '11111111-1111-4111-8111-111111111111',
        audience: 'customer' as const,
        productId: 'allplan',
        language: 'tr',
        routeLocale: 'tr',
        contextFingerprint: 'default-context',
    };

    it('uses centralized cache thresholds from RAG_CONFIG', () => {
        expect((cache as any).SEMANTIC_THRESHOLD).toBe(RAG_CONFIG.CACHE.SEMANTIC_THRESHOLD);
        expect((cache as any).DEFAULT_TTL_SECONDS).toBe(RAG_CONFIG.CACHE.DEFAULT_TTL);
    });

    describe('get', () => {
        it('uses a different semantic namespace for each knowledge cache generation', async () => {
            mockRedisService.get.mockResolvedValue(null);
            mockEmbeddingService.embedText.mockResolvedValue([1, 0, 0]);
            mockPrismaService.$queryRaw.mockResolvedValue([
                { id: '1', response: mockResult, distance: '0.02' },
            ]);

            await cache.get('test query', defaultScope, 'generation-1');
            await cache.get('test query', defaultScope, 'generation-2');

            const firstQuery = mockPrismaService.$queryRaw.mock.calls[0]?.[0];
            const secondQuery = mockPrismaService.$queryRaw.mock.calls[1]?.[0];
            expect(firstQuery.values).not.toEqual(secondQuery.values);
        });

        it('does not return a cached response to a different requester or audience scope', async () => {
            const cachedEntries = new Map<string, string>();
            mockRedisService.get.mockImplementation((key: string) => cachedEntries.get(key) ?? null);
            mockRedisService.set.mockImplementation((key: string, value: string) => {
                cachedEntries.set(key, value);
                return Promise.resolve('OK');
            });
            mockEmbeddingService.embedText.mockResolvedValue(null);

            await cache.set('test query', {
                userId: '11111111-1111-4111-8111-111111111111',
                audience: 'agent',
                productId: 'allplan',
                language: 'tr',
                routeLocale: 'tr',
                contextFingerprint: 'staff-context',
            }, mockResult, 'generation-1');

            const customerResult = await cache.get('test query', {
                userId: '22222222-2222-4222-8222-222222222222',
                audience: 'customer',
                productId: 'allplan',
                language: 'tr',
                routeLocale: 'tr',
                contextFingerprint: 'customer-context',
            }, 'generation-1');

            expect(customerResult).toBeNull();
        });

        it.each([
            ['product', { productId: 'allplan-connect' }],
            ['route locale', { routeLocale: 'en' }],
            ['language', { language: 'en' }],
            ['request context', { contextFingerprint: 'different-context' }],
        ])('does not reuse an exact cache entry when %s changes', async (_label, changedScope) => {
            const cachedEntries = new Map<string, string>();
            mockRedisService.get.mockImplementation((key: string) => cachedEntries.get(key) ?? null);
            mockRedisService.set.mockImplementation((key: string, value: string) => {
                cachedEntries.set(key, value);
                return Promise.resolve('OK');
            });
            mockEmbeddingService.embedText.mockResolvedValue(null);

            await cache.set('test query', defaultScope, mockResult, 'generation-1');

            const result = await cache.get('test query', {
                ...defaultScope,
                ...changedScope,
            }, 'generation-1');

            expect(result).toBeNull();
        });

        it('should return exact match from Redis', async () => {
            // Arrange
            mockRedisService.get.mockResolvedValue(JSON.stringify(mockResult));

            // Act
            const result = await cache.get('test query', defaultScope, 'generation-1');

            // Assert
            expect(result).toEqual(mockResult);
            expect(mockRedisService.get).toHaveBeenCalled();
        });

        it('should return null when no cache exists', async () => {
            // Arrange
            mockRedisService.get.mockResolvedValue(null);
            mockPrismaService.$queryRaw.mockResolvedValue([]);
            mockEmbeddingService.embedText.mockResolvedValue([1, 0, 0]);

            // Act
            const result = await cache.get('test query', defaultScope, 'generation-1');

            // Assert
            expect(result).toBeNull();
        });

        it('should fallback to semantic match when exact miss', async () => {
            // Arrange
            mockRedisService.get.mockResolvedValue(null);
            mockEmbeddingService.embedText.mockResolvedValue([1, 0, 0]);
            mockPrismaService.$queryRaw.mockResolvedValue([
                { id: '1', response: mockResult, distance: '0.02' }, // similarity = 0.98
            ]);

            // Act
            const result = await cache.get('test query', defaultScope, 'generation-1');

            // Assert
            expect(result).toEqual(mockResult);
        });

        it('should use a deterministic isolated namespace for semantic cache storage', async () => {
            mockRedisService.get.mockResolvedValue(null);
            mockEmbeddingService.embedText.mockResolvedValue([1, 0, 0]);
            mockPrismaService.$queryRaw.mockResolvedValue([]);

            await cache.get('test query', defaultScope, 'generation-1');

            const sqlCall = mockPrismaService.$queryRaw.mock.calls[0]?.[0];
            expect(String(sqlCall.values ?? sqlCall)).not.toContain('00000000-0000-0000-0000-000000000000');
        });

        it('uses different semantic database namespaces for different requester scopes', async () => {
            mockRedisService.get.mockResolvedValue(null);
            mockEmbeddingService.embedText.mockResolvedValue([1, 0, 0]);
            mockPrismaService.$queryRaw.mockResolvedValue([]);

            await cache.get('test query', defaultScope, 'generation-1');
            await cache.get('test query', {
                ...defaultScope,
                userId: '22222222-2222-4222-8222-222222222222',
                audience: 'agent',
            }, 'generation-1');

            const firstQuery = mockPrismaService.$queryRaw.mock.calls[0]?.[0];
            const secondQuery = mockPrismaService.$queryRaw.mock.calls[1]?.[0];
            expect(String(firstQuery.values ?? firstQuery)).not.toEqual(String(secondQuery.values ?? secondQuery));
        });

        it('should reject semantic match below threshold', async () => {
            // Arrange
            mockRedisService.get.mockResolvedValue(null);
            mockEmbeddingService.embedText.mockResolvedValue([1, 0, 0]);
            mockPrismaService.$queryRaw.mockResolvedValue([
                { id: '1', response: mockResult, distance: '0.1' }, // similarity = 0.90
            ]);

            // Act
            const result = await cache.get('test query', defaultScope, 'generation-1');

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('set', () => {
        it('should store in both exact and semantic cache', async () => {
            // Arrange
            mockEmbeddingService.embedText.mockResolvedValue([1, 0, 0]);
            mockPrismaService.$executeRaw.mockResolvedValue({ count: 1 });
            mockRedisService.set.mockResolvedValue('OK');

            // Act
            await cache.set('test query', defaultScope, mockResult, 'generation-1');

            // Assert
            expect(mockRedisService.set).toHaveBeenCalled();
            expect(mockPrismaService.$executeRaw).toHaveBeenCalled();
        });
    });

    describe('getStats', () => {
        it('should return cache statistics', async () => {
            // Arrange
            mockRedisService.get.mockImplementation((key: string) => {
                if (key === 'ai:cache:exact_hits') return '10';
                if (key === 'ai:cache:semantic_hits') return '5';
                if (key === 'ai:cache:misses') return '15';
                return '0';
            });

            // Act
            const stats = await cache.getStats();

            // Assert
            expect(stats.exactHits).toBe(10);
            expect(stats.semanticHits).toBe(5);
            expect(stats.misses).toBe(15);
            expect(stats.totalRequests).toBe(30);
            expect(stats.hitRate).toBe(0.5);
        });
    });

    describe('knowledge cache epochs', () => {
        it('uses generation zero before the durable epoch is created', async () => {
            mockPrismaService.$queryRaw.mockResolvedValueOnce([]);

            await expect(cache.getKnowledgeEpoch()).resolves.toBe('0');
        });

        it('atomically increments the durable settings epoch', async () => {
            mockPrismaService.$queryRaw.mockResolvedValueOnce([{ value: '5' }]);

            await expect(cache.advanceKnowledgeEpoch()).resolves.toBe('5');

            const sql = mockPrismaService.$queryRaw.mock.calls[0][0].join('');
            expect(sql).toContain('ON CONFLICT');
            expect(sql).toContain('RETURNING');
        });
    });

    describe('invalidateScope', () => {
        it('should clear all cache for a scope', async () => {
            // Arrange
            mockPrismaService.$executeRaw.mockResolvedValue({ count: 5 });
            const scan = jest.fn().mockResolvedValue(['0', []]);
            const del = jest.fn().mockResolvedValue(0);
            mockRedisService.getClient.mockReturnValue({
                scan,
                del,
            });

            // Act
            await cache.invalidateScope(defaultScope);

            // Assert
            expect(mockPrismaService.$executeRaw).toHaveBeenCalled();
            expect(scan).toHaveBeenCalledWith('0', 'MATCH', expect.any(String), 'COUNT', 100);
            expect(del).not.toHaveBeenCalled();
        });
    });

    describe('invalidateAll', () => {
        it('clears semantic responses and scans all current-version Redis query keys', async () => {
            const scan = jest.fn()
                .mockResolvedValueOnce(['7', ['query-key-1']])
                .mockResolvedValueOnce(['0', ['query-key-2']]);
            const del = jest.fn().mockResolvedValue(1);
            mockRedisService.getClient.mockReturnValue({ scan, del });
            mockPrismaService.$executeRaw.mockResolvedValue(3);
            mockPrismaService.$queryRaw.mockResolvedValueOnce([{ value: 'epoch-next' }]);

            await cache.invalidateAll();

            const deleteSql = mockPrismaService.$executeRaw.mock.calls[0][0].join('');
            expect(deleteSql).toContain('DELETE FROM "ai_response_cache"');
            expect(deleteSql).not.toMatch(/WHERE/i);
            expect(scan).toHaveBeenNthCalledWith(1, '0', 'MATCH', 'ai:query:*cache:*', 'COUNT', 100);
            expect(scan).toHaveBeenNthCalledWith(2, '7', 'MATCH', 'ai:query:*cache:*', 'COUNT', 100);
            expect(del).toHaveBeenNthCalledWith(1, 'query-key-1');
            expect(del).toHaveBeenNthCalledWith(2, 'query-key-2');
        });
    });
});
