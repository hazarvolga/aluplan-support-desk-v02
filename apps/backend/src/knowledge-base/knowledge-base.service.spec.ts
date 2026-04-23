import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeBaseService } from './knowledge-base.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../ai/embedding.service';
import { AiService } from '../ai/ai.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('KnowledgeBaseService', () => {
    let service: KnowledgeBaseService;
    let mockPrisma: any;
    let mockEmbedding: any;
    let mockAi: any;

    beforeEach(async () => {
        mockPrisma = {
            category: { findMany: jest.fn(), create: jest.fn() },
            knowledgeArticle: {
                findMany: jest.fn(),
                findFirst: jest.fn(),
                count: jest.fn(),
                findUnique: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
            knowledgeArticleVersion: {
                create: jest.fn(),
                findMany: jest.fn(),
            },
            articleFeedback: { create: jest.fn(), groupBy: jest.fn() },
        };
        mockEmbedding = { indexArticle: jest.fn().mockResolvedValue({}) };
        mockAi = { suggestCategory: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                KnowledgeBaseService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: EmbeddingService, useValue: mockEmbedding },
                { provide: AiService, useValue: mockAi },
            ],
        }).compile();

        service = module.get<KnowledgeBaseService>(KnowledgeBaseService);
    });

    describe('create', () => {
        it('should create article and version 1', async () => {
            const dto = { title: 'Test', content: 'Body', tags: ['t1'], categoryId: 'c1' };
            mockPrisma.knowledgeArticle.create.mockResolvedValue({ id: 'art-1', ...dto });

            const result = await service.create(dto, 'user-1');

            expect(result.id).toBe('art-1');
            expect(mockPrisma.knowledgeArticle.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        title: 'Test',
                        versions: {
                            create: expect.objectContaining({ version: 1 })
                        }
                    })
                })
            );
        });
    });

    describe('update', () => {
        it('should create new version when content is provided', async () => {
            const mockArticle = {
                id: 'art-1',
                title: 'O',
                status: 'PUBLISHED',
                versions: [{ version: 1 }]
            };
            mockPrisma.knowledgeArticle.findFirst.mockResolvedValue(mockArticle);
            mockPrisma.knowledgeArticle.update.mockResolvedValue({});
            mockPrisma.knowledgeArticleVersion.create.mockResolvedValue({});

            await service.update('art-1', { content: 'New Content' }, 'user-1');

            expect(mockPrisma.knowledgeArticleVersion.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ version: 2 })
                })
            );
            // Should revert to DRAFT if published
            expect(mockPrisma.knowledgeArticle.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ status: 'DRAFT' })
                })
            );
        });
    });

    describe('review', () => {
        it('should publish and index article on approval', async () => {
            const mockArticle = { id: 'art-1', title: 'T', status: 'REVIEW', versions: [] };
            mockPrisma.knowledgeArticle.findFirst.mockResolvedValue(mockArticle);
            mockPrisma.knowledgeArticle.update.mockResolvedValue({
                ...mockArticle,
                status: 'PUBLISHED',
                versions: [{ id: 'v1', content: 'C' }]
            });

            const result = await service.review('art-1', { approved: true }, 'rev-1');

            expect(result.status).toBe('PUBLISHED');
            expect(mockEmbedding.indexArticle).toHaveBeenCalled();
        });

        it('should revert to DRAFT on rejection', async () => {
            const mockArticle = { id: 'art-1', status: 'REVIEW' };
            mockPrisma.knowledgeArticle.findFirst.mockResolvedValue(mockArticle);
            mockPrisma.knowledgeArticle.update.mockResolvedValue({ status: 'DRAFT' });

            const result = await service.review('art-1', { approved: false }, 'rev-1');

            expect(result.status).toBe('DRAFT');
            expect(mockEmbedding.indexArticle).not.toHaveBeenCalled();
        });
    });

    describe('compareVersions', () => {
        it('should throw if fewer than 2 versions found', async () => {
            mockPrisma.knowledgeArticleVersion.findMany.mockResolvedValue([{ version: 1 }]);
            await expect(service.compareVersions('a1', 1, 2)).rejects.toThrow(BadRequestException);
        });

        it('should return older and newer versions', async () => {
            mockPrisma.knowledgeArticleVersion.findMany.mockResolvedValue([
                { version: 1, title: 'T1', content: 'C1' },
                { version: 2, title: 'T2', content: 'C2' },
            ]);

            const result = await service.compareVersions('a1', 1, 2);

            expect(result.older.version).toBe(1);
            expect(result.newer.version).toBe(2);
        });
    });
});
