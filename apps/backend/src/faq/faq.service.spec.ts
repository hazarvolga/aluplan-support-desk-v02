import { Test, TestingModule } from '@nestjs/testing';
import { FaqService } from './faq.service';
import { PrismaService } from '../prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { AiService } from '../ai/ai.service';
import { EmbeddingService } from '../ai/embedding.service';
import { mockPrismaService } from '../test/mock.utils';

describe('FaqService - Knowledge Base CRUD', () => {
    let service: FaqService;

    const mockQueue = {
        add: jest.fn(),
    };

    const mockAiService = {
        reformat: jest.fn(),
    };

    const localMockPrismaService = {
        ...mockPrismaService,
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
            ],
        }).compile();

        service = module.get<FaqService>(FaqService);
        jest.clearAllMocks();
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
            const updatedFaq = { id: 'faq-1', status: 'PUBLISHED', isInternal: false };
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
