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

    describe('get', () => {
        it('should return exact match from Redis', async () => {
            // Arrange
            mockRedisService.get.mockResolvedValue(JSON.stringify(mockResult));

            // Act
            const result = await cache.get('test query', 'tenant-1');

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
            const result = await cache.get('test query', 'tenant-1');

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
            const result = await cache.get('test query', 'tenant-1');

            // Assert
            expect(result).toEqual(mockResult);
        });

        it('should normalize non-UUID tenants for semantic cache storage', async () => {
            mockRedisService.get.mockResolvedValue(null);
            mockEmbeddingService.embedText.mockResolvedValue([1, 0, 0]);
            mockPrismaService.$queryRaw.mockResolvedValue([]);

            await cache.get('test query', 'system');

            const sqlCall = mockPrismaService.$queryRaw.mock.calls[0]?.[0];
            expect(String(sqlCall.values ?? sqlCall)).toContain('00000000-0000-0000-0000-000000000000');
        });

        it('should reject semantic match below threshold', async () => {
            // Arrange
            mockRedisService.get.mockResolvedValue(null);
            mockEmbeddingService.embedText.mockResolvedValue([1, 0, 0]);
            mockPrismaService.$queryRaw.mockResolvedValue([
                { id: '1', response: mockResult, distance: '0.1' }, // similarity = 0.90
            ]);

            // Act
            const result = await cache.get('test query', 'tenant-1');

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
            await cache.set('test query', 'tenant-1', mockResult);

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

    describe('invalidateTenant', () => {
        it('should clear all cache for a tenant', async () => {
            // Arrange
            mockPrismaService.$executeRaw.mockResolvedValue({ count: 5 });
            mockRedisService.getClient.mockReturnValue({
                eval: jest.fn().mockResolvedValue(10),
            });

            // Act
            await cache.invalidateTenant('tenant-1');

            // Assert
            expect(mockPrismaService.$executeRaw).toHaveBeenCalled();
        });
    });
});
