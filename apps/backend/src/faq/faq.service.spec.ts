import { Test, TestingModule } from '@nestjs/testing';
import { FaqService } from './faq.service';
import { PrismaService } from '../prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { AiService } from '../ai/ai.service';
import { EmbeddingService } from '../ai/embedding.service';
import { EmbeddingVersionRegistry } from '../ai/embedding-version.registry';
import { SettingsService } from '../settings/settings.service';
import { mockPrismaService } from '../test/mock.utils';
import { RAG_CONFIG } from '../config/rag.config';

const mockEmbeddingVersionRegistry = {
    getActiveVersionConfig: jest.fn().mockResolvedValue({ version: 'v3s', dimension: 1536, provider: 'openai', model: 'text-embedding-3-small' }),
    getVersionConfig: jest.fn().mockReturnValue({ version: 'v3s', dimension: 1536 }),
};

const mockSettingsService = {
    getValue: jest.fn().mockResolvedValue(null),
};

describe('FaqService - Knowledge Base CRUD', () => {
    let service: FaqService;

    const mockQueue = {
        add: jest.fn(),
    };

    const mockAiService = {
        reformat: jest.fn(),
        embed: jest.fn(),
    };

    const localMockPrismaService = {
        ...mockPrismaService,
        $executeRaw: jest.fn(),
        faqEntry: {
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FaqService,
                { provide: PrismaService, useValue: localMockPrismaService },
                { provide: getQueueToken('kb-summarizer'), useValue: mockQueue },
                { provide: AiService, useValue: mockAiService },
                { provide: EmbeddingService, useValue: { indexPoolContent: jest.fn() } },
                { provide: EmbeddingVersionRegistry, useValue: mockEmbeddingVersionRegistry },
                { provide: SettingsService, useValue: mockSettingsService },
            ],
        }).compile();

        service = module.get<FaqService>(FaqService);
        jest.clearAllMocks();
        mockAiService.embed.mockResolvedValue({ embedding: Array.from({ length: 1536 }, () => 0.1) });
        localMockPrismaService.$executeRaw.mockResolvedValue(1);
    });

    it('uses centralized FAQ auto-publish threshold from RAG_CONFIG', () => {
        expect((service as any).AUTO_PUBLISH_THRESHOLD).toBe(RAG_CONFIG.FAQ.AUTO_PUBLISH_THRESHOLD);
    });

    describe('findAll', () => {
        it('should return paginated FAQ entries', async () => {
            // Arrange
            const mockFaqs = [
                { id: 'faq-1', question: 'Q1', answer: 'A1', status: 'PUBLISHED' },
                { id: 'faq-2', question: 'Q2', answer: 'A2', status: 'PENDING_REVIEW' },
            ];
            localMockPrismaService.faqEntry.findMany.mockResolvedValue(mockFaqs);
            localMockPrismaService.faqEntry.count.mockResolvedValue(2);

            // Act
            const result = await service.findAll({ page: 1, limit: 10 });

            // Assert
            expect(result.data).toEqual(mockFaqs);
            expect(result.total).toBe(2);
            expect(result.pages).toBe(1);
            expect(localMockPrismaService.faqEntry.findMany).toHaveBeenCalledWith({
                where: {},
                orderBy: [{ frequency: 'desc' }, { createdAt: 'desc' }],
                skip: 0,
                take: 10,
            });
        });
    });

    describe('approveFaq', () => {
        it('should update FAQ status to PUBLISHED and isInternal to false', async () => {
            // Arrange
            const updatedFaq = { id: 'faq-1', question: 'Q1', status: 'PUBLISHED', isInternal: false };
            localMockPrismaService.faqEntry.update.mockResolvedValue(updatedFaq);

            // Act
            const result = await service.approveFaq('faq-1');

            // Assert
            expect(result).toEqual(updatedFaq);
            expect(localMockPrismaService.faqEntry.update).toHaveBeenCalledWith({
                where: { id: 'faq-1' },
                data: {
                    status: 'PUBLISHED',
                    publishedAt: expect.any(Date),
                    isInternal: false
                }
            });
            expect(mockAiService.embed).toHaveBeenCalledWith('Q1');
            expect(localMockPrismaService.$executeRaw).toHaveBeenCalled();
        });
    });

    describe('updateFaq', () => {
        it('should update FAQ specific fields', async () => {
            // Arrange
            const updateData = { question: 'Updated Q', answer: 'Updated A' };
            const updatedFaq = { id: 'faq-1', ...updateData };
            localMockPrismaService.faqEntry.update.mockResolvedValue(updatedFaq);

            // Act
            const result = await service.updateFaq('faq-1', updateData);

            // Assert
            expect(result).toEqual(updatedFaq);
            expect(localMockPrismaService.faqEntry.update).toHaveBeenCalledWith({
                where: { id: 'faq-1' },
                data: updateData
            });
            expect(mockAiService.embed).toHaveBeenCalledWith('Updated Q');
            expect(localMockPrismaService.$executeRaw).toHaveBeenCalled();
        });
    });

    describe('deleteFaq', () => {
        it('should delete FAQ by id', async () => {
            // Arrange
            localMockPrismaService.faqEntry.update.mockResolvedValue({ id: 'faq-1', deletedAt: new Date() });

            // Act
            await service.deleteFaq('faq-1');

            // Assert
            expect(localMockPrismaService.faqEntry.update).toHaveBeenCalledWith({
                where: { id: 'faq-1' },
                data: { deletedAt: expect.any(Date) }
            });
        });
    });
});
