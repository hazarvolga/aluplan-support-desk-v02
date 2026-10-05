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
import { EventEmitter2 } from '@nestjs/event-emitter';

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

    const mockEventEmitter = {
        emitAsync: jest.fn().mockResolvedValue([]),
    };

    const localMockPrismaService = {
        ...mockPrismaService,
        $executeRaw: jest.fn(),
        $queryRaw: jest.fn(),
        aiInteraction: {
            findMany: jest.fn(),
        },
        faqEntrySource: {
            createMany: jest.fn(),
        },
        faqEntry: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
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
                { provide: EmbeddingService, useValue: { indexPoolContent: jest.fn(), embedText: jest.fn() } },
                { provide: EmbeddingVersionRegistry, useValue: mockEmbeddingVersionRegistry },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
            ],
        }).compile();

        service = module.get<FaqService>(FaqService);
        jest.clearAllMocks();
        localMockPrismaService.$transaction.mockImplementation((callback: any) => callback(localMockPrismaService));
        mockAiService.embed.mockResolvedValue({ embedding: Array.from({ length: 1536 }, () => 0.1) });
        localMockPrismaService.$executeRaw.mockResolvedValue(1);
    });

    it('uses centralized FAQ auto-publish threshold from RAG_CONFIG', () => {
        expect((service as any).AUTO_PUBLISH_THRESHOLD).toBe(RAG_CONFIG.FAQ.AUTO_PUBLISH_THRESHOLD);
    });

    describe('FAQ provenance', () => {
        it('extracts only highly-rated tickets with a public agent solution', async () => {
            localMockPrismaService.ticket = { findFirst: jest.fn().mockResolvedValue({ status: 'CLOSED', satisfactionScore: 5, deletedAt: null, messages: [] }), findMany: jest.fn().mockResolvedValue([{
                id: 'ticket-solution', userId: 'customer-1', subject: 'License issue', tags: ['license'],
                satisfactionScore: 5,
                messages: [
                    { senderId: 'customer-1', message: 'Cannot activate', isInternal: false, deletedAt: null },
                    { senderId: 'agent-1', sender: { role: { name: 'SUPPORT_AGENT' } }, message: 'Open License Manager and activate.', isInternal: false, deletedAt: null },
                ],
            }]) };
            mockAiService.reformat.mockResolvedValue({ response: JSON.stringify({ question: 'How to activate?', answer: 'Open License Manager and activate.' }) });

            const patterns = await service.extractFromTickets();

            expect(localMockPrismaService.ticket.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ satisfactionScore: { gte: 4 }, deletedAt: null }),
            }));
            expect(patterns).toEqual([expect.objectContaining({
                sourceId: 'ticket-solution',
                answer: 'Open License Manager and activate.',
                confidenceScore: expect.any(Number),
            })]);
        });

        it('does not extract a candidate without a public agent solution', async () => {
            localMockPrismaService.ticket = { findFirst: jest.fn().mockResolvedValue({ status: 'CLOSED', satisfactionScore: 5, deletedAt: null, messages: [] }), findMany: jest.fn().mockResolvedValue([{
                id: 'ticket-unresolved', userId: 'customer-1', subject: 'Still broken', tags: [], satisfactionScore: 5,
                messages: [
                    { senderId: 'customer-1', message: 'Still broken', isInternal: false, deletedAt: null },
                    { senderId: 'agent-1', sender: { role: { name: 'SUPPORT_AGENT' } }, message: 'INTERNAL INVESTIGATION NOTE', isInternal: true, deletedAt: null },
                ],
            }]) };

            await expect(service.extractFromTickets()).resolves.toEqual([]);
            expect(mockAiService.reformat).not.toHaveBeenCalled();
        });

        it('does not treat another customer message as a verified support solution', async () => {
            localMockPrismaService.ticket = { findFirst: jest.fn().mockResolvedValue({ status: 'CLOSED', satisfactionScore: 5, deletedAt: null, messages: [] }), findMany: jest.fn().mockResolvedValue([{
                id: 'ticket-customer-cc', userId: 'customer-1', subject: 'Still broken', tags: [], satisfactionScore: 5,
                messages: [
                    { senderId: 'customer-1', sender: { role: { name: 'CUSTOMER' } }, message: 'Still broken', isInternal: false, deletedAt: null },
                    { senderId: 'customer-2', sender: { role: { name: 'CUSTOMER' } }, message: 'Try restarting', isInternal: false, deletedAt: null },
                ],
            }]) };

            await expect(service.extractFromTickets()).resolves.toEqual([]);
            expect(mockAiService.reformat).not.toHaveBeenCalled();
        });

        it('masks PII in fallback candidates when the formatter response is unusable', async () => {
            localMockPrismaService.ticket = { findFirst: jest.fn().mockResolvedValue({ status: 'CLOSED', satisfactionScore: 5, deletedAt: null, messages: [] }), findMany: jest.fn().mockResolvedValue([{
                id: 'ticket-pii', userId: 'customer-1', subject: 'Activate AB12CD34EF56 for user@example.com', tags: [], satisfactionScore: 5,
                messages: [
                    { senderId: 'customer-1', sender: { role: { name: 'CUSTOMER' } }, message: 'Please help', isInternal: false, deletedAt: null },
                    { senderId: 'agent-1', sender: { role: { name: 'SUPPORT_AGENT' } }, message: 'Use key AB12CD34EF56 and email user@example.com', isInternal: false, deletedAt: null },
                ],
            }]) };
            mockAiService.reformat.mockResolvedValue({ response: 'not-json' });

            const [pattern] = await service.extractFromTickets();

            expect(pattern.question).not.toContain('user@example.com');
            expect(pattern.answer).not.toContain('user@example.com');
            expect(pattern.question).not.toContain('AB12CD34EF56');
            expect(pattern.answer).not.toContain('AB12CD34EF56');
        });

        it('persists the source ticket for a ticket-derived candidate', async () => {
            localMockPrismaService.faqEntry.findFirst.mockResolvedValue(null);
            localMockPrismaService.$queryRaw.mockResolvedValue([]);
            const embeddingService = (service as any).embeddingService;
            embeddingService.embedText.mockResolvedValue(null);

            await service.processPatterns([{
                question: 'How do I repair this model?',
                answer: 'Follow the verified repair steps.',
                confidenceScore: 0.7,
                sourceType: 'ticket',
                sourceId: '11111111-1111-4111-8111-111111111111',
                tags: ['model'],
                language: 'en',
            }]);

            expect(localMockPrismaService.faqEntry.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    sourceTypes: ['ticket'],
                    sources: {
                        create: [{
                            sourceType: 'TICKET',
                            ticketId: '11111111-1111-4111-8111-111111111111',
                        }],
                    },
                }),
            });
        });

        it('uses the stored AI response for an interaction-derived review candidate', async () => {
            localMockPrismaService.aiInteraction.findMany.mockResolvedValue([
                {
                    id: '22222222-2222-4222-8222-222222222222',
                    userQuery: 'How can I restore the toolbar?',
                    responseGenerated: 'Open the workspace settings and restore the default layout.',
                    createdAt: new Date('2026-08-06T10:00:00Z'),
                },
                {
                    id: '22222222-2222-4222-8222-222222222223',
                    userQuery: 'How can I restore the toolbar?',
                    responseGenerated: 'Open the workspace settings and restore the default layout.',
                    createdAt: new Date('2026-08-05T10:00:00Z'),
                },
            ]);

            const patterns = await service.extractFromInteractions();

            expect(patterns).toEqual([expect.objectContaining({
                answer: 'Open the workspace settings and restore the default layout.',
                sourceType: 'interaction',
                sourceId: '22222222-2222-4222-8222-222222222222',
            })]);
        });

        it('does not create interaction candidates from blank AI responses', async () => {
            localMockPrismaService.aiInteraction.findMany.mockResolvedValue([
                {
                    id: '33333333-3333-4333-8333-333333333333',
                    userQuery: 'Unknown issue',
                    responseGenerated: '   ',
                    createdAt: new Date('2026-08-06T10:00:00Z'),
                },
                {
                    id: '33333333-3333-4333-8333-333333333334',
                    userQuery: 'Unknown issue',
                    responseGenerated: null,
                    createdAt: new Date('2026-08-05T10:00:00Z'),
                },
            ]);

            await expect(service.extractFromInteractions()).resolves.toEqual([]);
        });

        it('does not publish a FAQ with an empty answer', async () => {
            localMockPrismaService.faqEntry.findUnique.mockResolvedValue({
                id: 'faq-empty',
                question: 'Unanswered question',
                answer: '   ',
            });

            await expect(service.approveFaq('faq-empty')).rejects.toThrow('FAQ_ANSWER_REQUIRED');
            expect(localMockPrismaService.faqEntry.update).not.toHaveBeenCalled();
        });

        it('attaches new provenance when an exact FAQ candidate already exists', async () => {
            localMockPrismaService.faqEntry.findFirst.mockResolvedValue({ id: 'faq-existing' });
            localMockPrismaService.faqEntry.update.mockResolvedValue({ id: 'faq-existing' });

            await service.processPatterns([{
                question: 'How do I repair this model?',
                answer: 'Follow the verified repair steps.',
                confidenceScore: 0.7,
                sourceType: 'ticket',
                sourceId: '44444444-4444-4444-8444-444444444444',
                tags: [],
                language: 'en',
            }]);

            expect(localMockPrismaService.faqEntrySource.createMany).toHaveBeenCalledWith({
                data: [{
                    faqEntryId: 'faq-existing',
                    sourceType: 'TICKET',
                    ticketId: '44444444-4444-4444-8444-444444444444',
                }],
                skipDuplicates: true,
            });
        });

        it('emits a cache invalidation event when a FAQ is auto-published', async () => {
            localMockPrismaService.faqEntry.findFirst.mockResolvedValue(null);
            localMockPrismaService.$queryRaw.mockResolvedValue([]);
            (service as any).embeddingService.embedText.mockResolvedValue(null);

            await service.processPatterns([{
                question: 'How do I repair this model?',
                answer: 'Follow the verified repair steps.',
                confidenceScore: 1,
                sourceType: 'ticket',
                sourceId: '55555555-5555-4555-8555-555555555555',
                tags: ['model'],
                language: 'en',
            }]);

            expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith('faq.changed');
        });
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
                where: { deletedAt: null },
                include: {
                    sources: {
                        where: { deletedAt: null },
                        select: {
                            id: true,
                            sourceType: true,
                            ticket: { select: { id: true, ticketNumber: true } },
                            interaction: { select: { id: true, createdAt: true } },
                        },
                        orderBy: { createdAt: 'asc' },
                    },
                },
                orderBy: [{ frequency: 'desc' }, { createdAt: 'desc' }],
                skip: 0,
                take: 10,
            });
            expect(localMockPrismaService.faqEntry.count).toHaveBeenCalledWith({
                where: { deletedAt: null },
            });
        });

        it('combines status and active-record filters for the review queue', async () => {
            localMockPrismaService.faqEntry.findMany.mockResolvedValue([]);
            localMockPrismaService.faqEntry.count.mockResolvedValue(0);

            await service.findAll({ status: 'PENDING_REVIEW', page: 1, limit: 20 });

            expect(localMockPrismaService.faqEntry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { status: 'PENDING_REVIEW', deletedAt: null },
                }),
            );
            expect(localMockPrismaService.faqEntry.count).toHaveBeenCalledWith({
                where: { status: 'PENDING_REVIEW', deletedAt: null },
            });
        });
    });

    describe('findOne', () => {
        it('never returns a soft-deleted FAQ', async () => {
            localMockPrismaService.faqEntry.findUnique.mockResolvedValue(null);

            await service.findOne('faq-1');

            expect(localMockPrismaService.faqEntry.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({ where: { id: 'faq-1', deletedAt: null } }),
            );
        });
    });

    describe('approveFaq', () => {
        it('should update FAQ status to PUBLISHED and isInternal to false', async () => {
            // Arrange
            const updatedFaq = { id: 'faq-1', question: 'Q1', status: 'PUBLISHED', isInternal: false };
            localMockPrismaService.faqEntry.findUnique.mockResolvedValue({
                id: 'faq-1',
                question: 'Q1',
                answer: 'A1',
            });
            localMockPrismaService.faqEntry.update.mockResolvedValue(updatedFaq);

            // Act
            const result = await service.approveFaq('faq-1');

            // Assert
            expect(result).toEqual(updatedFaq);
            expect(localMockPrismaService.faqEntry.findUnique).toHaveBeenCalledWith({
                where: { id: 'faq-1', deletedAt: null },
                select: { question: true, answer: true },
            });
            expect(localMockPrismaService.faqEntry.update).toHaveBeenCalledWith({
                where: { id: 'faq-1', deletedAt: null },
                data: {
                    status: 'PUBLISHED',
                    publishedAt: expect.any(Date),
                    isInternal: false
                }
            });
            expect(mockAiService.embed).toHaveBeenCalledWith('Q1');
            expect(localMockPrismaService.$executeRaw).toHaveBeenCalled();
            expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith('faq.changed', { faqId: 'faq-1' });
        });
    });

    describe('getPublished', () => {
        it('excludes soft-deleted FAQs from the public feed', async () => {
            localMockPrismaService.faqEntry.findMany.mockResolvedValue([]);

            await service.getPublished('tr', 50, false);

            expect(localMockPrismaService.faqEntry.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        status: 'PUBLISHED',
                        language: 'tr',
                        deletedAt: null,
                        isInternal: false,
                    },
                }),
            );
        });
    });

    describe('updateFaq', () => {
        it('should update FAQ specific fields', async () => {
            // Arrange
            const updateData = {
                question: 'Updated Q',
                answer: 'Updated A',
                deletedAt: new Date(),
                status: 'PUBLISHED',
            } as any;
            const updatedFaq = { id: 'faq-1', ...updateData };
            localMockPrismaService.faqEntry.update.mockResolvedValue(updatedFaq);

            // Act
            const result = await service.updateFaq('faq-1', updateData);

            // Assert
            expect(result).toEqual(updatedFaq);
            expect(localMockPrismaService.faqEntry.update).toHaveBeenCalledWith({
                where: { id: 'faq-1', deletedAt: null },
                data: { question: 'Updated Q', answer: 'Updated A' },
            });
            expect(mockAiService.embed).toHaveBeenCalledWith('Updated Q');
            expect(localMockPrismaService.$executeRaw).toHaveBeenCalled();
            expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith('faq.changed', { faqId: 'faq-1' });
        });

        it.each([
            ['question', 'FAQ_QUESTION_REQUIRED'],
            ['answer', 'FAQ_ANSWER_REQUIRED'],
        ])('rejects a blank %s before updating Prisma', async (field, errorCode) => {
            await expect(service.updateFaq('faq-1', { [field]: '   ' } as any)).rejects.toThrow(errorCode);
            expect(localMockPrismaService.faqEntry.update).not.toHaveBeenCalled();
        });
    });

    describe('dismissFaq', () => {
        it('never mutates a soft-deleted FAQ', async () => {
            localMockPrismaService.faqEntry.update.mockResolvedValue({ id: 'faq-1', status: 'DISMISSED' });

            await service.dismissFaq('faq-1');

            expect(localMockPrismaService.faqEntry.update).toHaveBeenCalledWith({
                where: { id: 'faq-1', deletedAt: null },
                data: { status: 'DISMISSED' },
            });
            expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith('faq.changed', { faqId: 'faq-1' });
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
            expect(mockEventEmitter.emitAsync).toHaveBeenCalledWith('faq.changed', { faqId: 'faq-1' });
        });
    });
});
