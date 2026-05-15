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
        model: 'text-embedding-3-small',
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
            expect(result.diagnostics.topScore).toBeGreaterThanOrEqual(0.92);
            expect(result.diagnostics.queryEmbeddingModel).toBe('text-embedding-3-small');
        });

        it('should expose approved FAQ entries as first-class search results', async () => {
            mockAiService.embed.mockResolvedValue(mockEmbedResult);
            mockPrismaService.$queryRaw.mockResolvedValue([
                {
                    article_id: 'faq-1',
                    source_type: 'FAQ',
                    title: 'What should I check if license server installation failed?',
                    content: 'Check the Wibu setup, license server services, administrator rights, antivirus blocking, and installation logs.',
                    similarity: 0.91,
                    trust_score: 1.0,
                    language: 'en',
                    category: null,
                    updated_at: new Date(),
                },
            ]);

            const result = await service.search('What should I check if license server installation failed?', 5);

            expect(result.results).toHaveLength(1);
            expect(result.results[0]).toEqual(expect.objectContaining({
                articleId: 'faq-1',
                sourceType: 'FAQ',
                title: 'What should I check if license server installation failed?',
                confidence: 'HIGH',
            }));
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

        it('should de-duplicate repeated chunks from the same source and expose source metadata', async () => {
            mockAiService.embed.mockResolvedValue(mockEmbedResult);
            mockPrismaService.$queryRaw.mockResolvedValue([
                {
                    article_id: 'src-tr',
                    source_type: 'DOCUMENT',
                    title: 'TR License Transfer',
                    content: 'Lisansı yeni bilgisayara aktarma...',
                    similarity: 0.82,
                    trust_score: 0.85,
                    language: 'tr',
                    category: 'License & Activation',
                },
                {
                    article_id: 'src-tr',
                    source_type: 'DOCUMENT',
                    title: 'TR License Transfer',
                    content: 'Duplicate child chunk...',
                    similarity: 0.80,
                    trust_score: 0.85,
                    language: 'tr',
                    category: 'License & Activation',
                },
                {
                    article_id: 'src-en',
                    source_type: 'DOCUMENT',
                    title: 'EN License Server',
                    content: 'Install license server...',
                    similarity: 0.78,
                    trust_score: 0.85,
                    language: 'en',
                    category: 'License Server & CodeMeter',
                },
            ]);

            const { results } = await service.search('Allplan lisansını yeni bilgisayara nasıl aktarırım?', 3);

            expect(results.map((result) => result.articleId)).toEqual(['src-tr', 'src-en']);
            expect(results[0]).toEqual(expect.objectContaining({
                language: 'tr',
                category: 'License & Activation',
            }));
            expect(results[0].similarity).toBeGreaterThan(0.82);
        });

        it('should prefer title-specific FAQ matches within the same language and category', async () => {
            mockAiService.embed.mockResolvedValue(mockEmbedResult);
            mockPrismaService.$queryRaw.mockResolvedValue([
                {
                    article_id: 'src-transfer',
                    source_type: 'DOCUMENT',
                    title: 'FAQ_TR_Lisansı_yeni_bir_bilgisayara_veya_baska_bir_bilgisayara_aktarma.pdf',
                    content: 'Lisansı yeni bilgisayara aktarma...',
                    similarity: 0.89,
                    trust_score: 0.85,
                    language: 'tr',
                    category: 'License & Activation',
                },
                {
                    article_id: 'src-format',
                    source_type: 'DOCUMENT',
                    title: 'faq-softlock-SSS-Bilgisayarimi-formatladim-lisansimi-nasil-geri-alirim.pdf',
                    content: 'Bilgisayarı formatladıktan sonra lisansı geri alma...',
                    similarity: 0.86,
                    trust_score: 0.85,
                    language: 'tr',
                    category: 'License & Activation',
                },
            ]);

            const { results } = await service.search('Bilgisayarımı formatladım lisansımı nasıl geri alırım?', 2);

            expect(results.map((result) => result.articleId)).toEqual(['src-format', 'src-transfer']);
        });

        it('should demote license sources when the query explicitly says it is not a license issue', async () => {
            mockAiService.embed.mockResolvedValue(mockEmbedResult);
            mockPrismaService.$queryRaw.mockResolvedValue([
                {
                    article_id: 'license-register',
                    source_type: 'DOCUMENT',
                    title: 'faq-softlock-SSS-Allplan-Lisansinin-Kayitlandirma-Islemi.pdf',
                    content: 'Lisans kayitlandirma ve aktivasyon islemi.',
                    similarity: 0.90,
                    trust_score: 0.85,
                    language: 'tr',
                    category: 'General',
                },
                {
                    article_id: 'network-startup',
                    source_type: 'DOCUMENT',
                    title: 'FAQ_EN_Allplan_is_running_slow.pdf',
                    content: 'Name resolution on the network If Allplan takes several minutes to start, name resolution may not work.',
                    similarity: 0.74,
                    trust_score: 0.85,
                    language: 'en',
                    category: 'Performance & Hardware',
                },
            ]);

            const { results } = await service.search('Allplan ağ üzerinden açılırken çok bekliyor, lisans değil isim çözümleme olabilir mi?', 2);

            expect(results.map((result) => result.articleId)).toEqual(['network-startup', 'license-register']);
        });

        it('should prefer canonical FAQ sources over pilot duplicates when both match the same intent', async () => {
            mockAiService.embed.mockResolvedValue(mockEmbedResult);
            mockPrismaService.$queryRaw.mockResolvedValue([
                {
                    article_id: 'pilot-driver',
                    source_type: 'DOCUMENT',
                    title: '[Dataset] pilot-de-grafikkartentreiber-aktualisieren.pdf',
                    content: 'Grafikkartentreiber aktualisieren NVIDIA AMD Treiber.',
                    similarity: 0.64,
                    trust_score: 0.85,
                    language: 'de',
                    category: 'Performance & Hardware',
                },
                {
                    article_id: 'faq-driver',
                    source_type: 'DOCUMENT',
                    title: '[Dataset] FAQ_DE_Grafikkartentreiber_aktualisieren.pdf',
                    content: 'Grafikkartentreiber aktualisieren NVIDIA AMD Treiber.',
                    similarity: 0.62,
                    trust_score: 0.85,
                    language: 'de',
                    category: 'Performance & Hardware',
                },
            ]);

            const { results } = await service.search('Grafik kartı sürücüsü konusunda canonical FAQ kaynağı kullanılmalı mı?', 2);

            expect(results.map((result) => result.articleId)).toEqual(['faq-driver', 'pilot-driver']);
        });
    });

    describe('indexPoolContent', () => {
        it('should fail pool indexing when AI embed returns null for every chunk', async () => {
            // Arrange
            mockAiService.embed.mockResolvedValue(null);

            // Act
            await expect(service.indexPoolContent('src-1', 'some content')).rejects.toThrow(
                'No embeddings generated for pool source src-1',
            );

            // Assert
            const deleteCalls = mockPrismaService.$executeRawUnsafe.mock.calls
                .map((call: unknown[]) => String(call[0]))
                .filter((sql: string) => sql.includes('DELETE FROM knowledge_pool_embeddings'));
            expect(deleteCalls).toHaveLength(2);
        });

        it('should execute raw insert when embed succeeds', async () => {
            // Arrange
            mockAiService.embed.mockResolvedValue(mockEmbedResult);

            // Act
            await service.indexPoolContent('src-1', 'content', { type: 'parent' });

            // Assert
            expect(mockPrismaService.$executeRawUnsafe).toHaveBeenCalled();
            const insertCalls = mockPrismaService.$executeRawUnsafe.mock.calls
                .map((call: unknown[]) => String(call[0]))
                .filter((sql: string) => sql.includes('INSERT INTO knowledge_pool_embeddings'));
            expect(insertCalls.every((sql: string) => !sql.includes('model_name'))).toBe(true);
        });

        it('should clean up partial pool embeddings when indexing fails mid-run', async () => {
            mockAiService.embed
                .mockResolvedValueOnce(mockEmbedResult)
                .mockRejectedValueOnce(new Error('429 rate limit'));

            await expect(service.indexPoolContent('src-1', 'content')).rejects.toThrow('429 rate limit');

            const deleteCalls = mockPrismaService.$executeRawUnsafe.mock.calls
                .map((call: unknown[]) => String(call[0]))
                .filter((sql: string) => sql.includes('DELETE FROM knowledge_pool_embeddings'));
            expect(deleteCalls).toHaveLength(2);
        });

        it('should reject mismatched embedding dimensions before writing pool vectors', async () => {
            mockAiService.embed.mockResolvedValue({
                embedding: [0.1, 0.2, 0.3],
                model: 'wrong-dimension-model',
            });

            await expect(service.indexPoolContent('src-1', 'content')).rejects.toThrow(
                'Embedding dimension mismatch for knowledge pool parent src-1: expected 1536, got 3 from wrong-dimension-model',
            );

            const insertCalls = mockPrismaService.$executeRawUnsafe.mock.calls
                .map((call: unknown[]) => String(call[0]))
                .filter((sql: string) => sql.includes('INSERT INTO knowledge_pool_embeddings'));
            expect(insertCalls).toHaveLength(0);

            const deleteCalls = mockPrismaService.$executeRawUnsafe.mock.calls
                .map((call: unknown[]) => String(call[0]))
                .filter((sql: string) => sql.includes('DELETE FROM knowledge_pool_embeddings'));
            expect(deleteCalls).toHaveLength(2);
        });

        it('should reject same-dimension embeddings from a different model space', async () => {
            mockAiService.embed.mockResolvedValue({
                embedding: Array.from({ length: 1536 }, () => 0.1),
                model: 'text-embedding-3-large',
            });

            await expect(service.indexPoolContent('src-1', 'content')).rejects.toThrow(
                'Embedding model mismatch for knowledge pool parent src-1: expected text-embedding-3-small, got text-embedding-3-large',
            );

            const insertCalls = mockPrismaService.$executeRawUnsafe.mock.calls
                .map((call: unknown[]) => String(call[0]))
                .filter((sql: string) => sql.includes('INSERT INTO knowledge_pool_embeddings'));
            expect(insertCalls).toHaveLength(0);
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
            expect(String(mockPrismaService.$executeRaw.mock.calls[0][0])).not.toContain('model_name');
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
