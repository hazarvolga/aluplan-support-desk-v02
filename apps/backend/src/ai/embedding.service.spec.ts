import { Test, TestingModule } from '@nestjs/testing';
import { EmbeddingService, SearchResponse } from './embedding.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { EmbeddingVersionRegistry } from './embedding-version.registry';
import { EventEmitter2 } from '@nestjs/event-emitter';

const mockEmbeddingVersionRegistry = {
    getActiveVersionConfig: jest.fn().mockResolvedValue({
        version: 'v3s', dimension: 1536, provider: 'openai', model: 'text-embedding-3-small',
    }),
    getVersionConfig: jest.fn().mockReturnValue({ version: 'v3s', dimension: 1536 }),
};

describe('EmbeddingService', () => {
    let service: EmbeddingService;
    let mockPrismaService: any;
    let mockAiService: any;

    const mockEmbedResult = {
        embedding: Array.from({ length: 1536 }, () => Math.random()),
        model: 'nomic-embed-text',
    };

    beforeEach(async () => {
        mockPrismaService = {
            $executeRaw: jest.fn().mockResolvedValue(1),
            $executeRawUnsafe: jest.fn().mockResolvedValue(1),
            $queryRaw: jest.fn(),
            knowledgeArticle: {
                findMany: jest.fn(),
            },
            knowledgePoolEmbedding: {
                findFirst: jest.fn(),
            }
        };

        mockAiService = {
            embed: jest.fn(),
            getActiveModelName: jest.fn().mockResolvedValue('nomic-embed-text'),
        };

        const mockEventEmitter = {
            emit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmbeddingService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: AiService, useValue: mockAiService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
                { provide: EmbeddingVersionRegistry, useValue: mockEmbeddingVersionRegistry },
            ],
        }).compile();

        service = module.get<EmbeddingService>(EmbeddingService);
    });

    describe('search', () => {
        it('should return empty results when AI is offline', async () => {
            // Arrange
            mockAiService.embed.mockResolvedValue(null);

            // Act
            const result: SearchResponse = await service.search('test query');

            // Assert
            expect(result.results).toHaveLength(0);
            expect(result.diagnostics.topScore).toBe(0);
            expect(mockPrismaService.$queryRaw).not.toHaveBeenCalled();
        });

        it('should return search results mapped from raw query', async () => {
            // Arrange
            mockAiService.embed.mockResolvedValue(mockEmbedResult);

            const rawRows = [
                {
                    article_id: 'art-1',
                    source_type: 'ARTICLE',
                    title: 'Nasıl kurulum yapılır?',
                    content: 'Kurulum adımları...',
                    similarity: 0.92,
                    trust_score: 4,
                },
                {
                    article_id: 'src-1',
                    source_type: 'DOCUMENT',
                    title: 'Kullanım Kılavuzu',
                    content: 'Detaylı kullanım...',
                    similarity: 0.81,
                    trust_score: 3,
                },
            ];
            mockPrismaService.$queryRaw.mockResolvedValue(rawRows);

            // Act
            const result: SearchResponse = await service.search('kurulum', 5);

            // Assert
            expect(result.results).toHaveLength(2);
            expect(result.results[0].articleId).toBe('art-1');
            expect(result.results[0].confidence).toBe('HIGH');
            expect(result.diagnostics.topScore).toBeCloseTo(0.92);
            expect(result.diagnostics.queryEmbeddingModel).toBe('text-embedding-3-small');
        });

        it('should apply confidence tiers correctly', async () => {
            // Arrange
            mockAiService.embed.mockResolvedValue(mockEmbedResult);
            mockPrismaService.$queryRaw.mockResolvedValue([
                { article_id: 'a1', source_type: 'ARTICLE', title: 'T1', content: 'C1', similarity: 0.90, trust_score: 5 },
                { article_id: 'a2', source_type: 'ARTICLE', title: 'T2', content: 'C2', similarity: 0.75, trust_score: 5 },
                { article_id: 'a3', source_type: 'ARTICLE', title: 'T3', content: 'C3', similarity: 0.50, trust_score: 5 },
            ]);

            // Act
            const { results } = await service.search('query');

            // Assert
            expect(results[0].confidence).toBe('HIGH');   // 0.90 >= 0.85
            expect(results[1].confidence).toBe('MEDIUM'); // 0.75 >= 0.70
            expect(results[2].confidence).toBe('LOW');    // 0.50 < 0.70
        });
    });

    describe('indexPoolContent', () => {
        it('should skip indexing when AI embed returns null', async () => {
            // Arrange
            mockAiService.embed.mockResolvedValue(null);

            // Act
            await service.indexPoolContent('src-1', 'some content');

            // Assert
            expect(mockPrismaService.$executeRawUnsafe).toHaveBeenCalledTimes(1);
        });

        it('should execute raw insert when embed succeeds', async () => {
            // Arrange
            mockAiService.embed.mockResolvedValue(mockEmbedResult);

            // Act
            await service.indexPoolContent('src-1', 'content', { type: 'parent' });

            // Assert
            expect(mockPrismaService.$executeRawUnsafe).toHaveBeenCalled();
        });
    });

    describe('indexTicket', () => {
        it('should skip when AI offline', async () => {
            mockAiService.embed.mockResolvedValue(null);
            await service.indexTicket('tik-1', 'ticket content');
            expect(mockPrismaService.$executeRaw).not.toHaveBeenCalled();
        });

        it('should insert ticket embedding when AI responds', async () => {
            mockAiService.embed.mockResolvedValue(mockEmbedResult);
            await service.indexTicket('tik-1', 'ticket content');
            expect(mockPrismaService.$executeRaw).toHaveBeenCalledTimes(1);
        });
    });

    describe('searchTickets', () => {
        it('should return empty array when AI offline', async () => {
            mockAiService.embed.mockResolvedValue(null);
            const result = await service.searchTickets('query');
            expect(result).toEqual([]);
        });

        it('should map raw ticket search results', async () => {
            mockAiService.embed.mockResolvedValue(mockEmbedResult);
            mockPrismaService.$queryRaw.mockResolvedValue([
                { ticket_id: 'tik-1', subject: 'Login Issue', similarity: 0.88 },
            ]);

            const result = await service.searchTickets('login problem');
            expect(result).toHaveLength(1);
            expect(result[0].ticketId).toBe('tik-1');
            expect(result[0].similarity).toBeCloseTo(0.88);
        });
    });

    describe('reindexAll', () => {
        it('should return indexed/failed counts', async () => {
            // Arrange
            const articles = [
                { id: 'art-1', title: 'Article 1', versions: [{ id: 'v1', content: 'Content 1', version: 1 }] },
                { id: 'art-2', title: 'Article 2', versions: [] }, // no version — should skip
            ];
            mockPrismaService.knowledgeArticle.findMany.mockResolvedValue(articles);
            mockAiService.embed.mockResolvedValue(mockEmbedResult);
            mockPrismaService.$executeRaw.mockResolvedValue(1);

            // Act
            const result = await service.reindexAll();

            // Assert
            expect(result.indexed).toBe(1);
            expect(result.failed).toBe(0);
        });
    });
});
