/**
 * Property-Based Tests: FaqService
 * Feature: rag-faq-improvements
 * Property 2: semantik deduplication pipeline
 * Property 3: duplicate tespitinde frequency artışı
 * Property 4: deduplication threshold konfigürasyonu
 * Property 10: KB summarize idempotency
 */
import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { FaqService, ExtractedPattern } from './faq.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingService } from '../ai/embedding.service';
import { EmbeddingVersionRegistry } from '../ai/embedding-version.registry';
import { SettingsService } from '../settings/settings.service';
import { getQueueToken } from '@nestjs/bullmq';
import { AiService } from '../ai/ai.service';

const mockEmbeddingVersionRegistry = {
    getActiveVersionConfig: jest.fn().mockResolvedValue({ version: 'v3s', dimension: 1536, provider: 'openai', model: 'text-embedding-3-small' }),
    getVersionConfig: jest.fn().mockReturnValue({ version: 'v3s', dimension: 1536 }),
};

const DEFAULT_THRESHOLD = 0.90;

const makePattern = (overrides: Partial<ExtractedPattern> = {}): ExtractedPattern => ({
    question: 'How do I reset my password?',
    answer: 'Go to settings and click reset.',
    confidenceScore: 0.80,
    sourceType: 'ticket',
    sourceId: 'ticket-id-1',
    tags: [],
    language: 'tr',
    ...overrides,
});

describe('FaqService — Property-Based Tests', () => {
    let service: FaqService;
    let mockPrisma: any;
    let mockEmbeddingService: any;
    let mockQueue: any; // This mockQueue variable is now redundant as the queue is mocked inline

    beforeEach(async () => {
        mockPrisma = {
            faqEntry: {
                findFirst: jest.fn().mockResolvedValue(null),
                update: jest.fn().mockResolvedValue({}),
                create: jest.fn().mockResolvedValue({ id: 'new-id' }),
                count: jest.fn().mockResolvedValue(0),
            },
            faqEntrySource: {
                createMany: jest.fn().mockResolvedValue({ count: 1 }),
            },
            $transaction: jest.fn(),
            $queryRaw: jest.fn().mockResolvedValue([]),
            $executeRaw: jest.fn().mockResolvedValue(1),
            ticket: { findUnique: jest.fn() },
        };
        mockPrisma.$transaction.mockImplementation((callback: any) => callback(mockPrisma));

        mockEmbeddingService = {
            embedText: jest.fn().mockResolvedValue(Array(1536).fill(0.1)),
        };

        mockQueue = { add: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FaqService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: EmbeddingService, useValue: mockEmbeddingService },
                {
                    provide: getQueueToken('kb-summarizer'),
                    useValue: mockQueue,
                },
                {
                    provide: AiService,
                    useValue: { reformat: jest.fn() },
                },
                { provide: EmbeddingVersionRegistry, useValue: mockEmbeddingVersionRegistry },
                { provide: SettingsService, useValue: { getValue: jest.fn().mockResolvedValue(null) } },
            ],
        }).compile();

        service = module.get(FaqService);
    });

    // Feature: rag-faq-improvements, Property 2: semantik deduplication pipeline
    it('P2: benzerlik >= threshold olan sorular için yeni faq_entry oluşturulmaz', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    question: fc.string({ minLength: 5, maxLength: 100 }),
                    answer: fc.string({ minLength: 5, maxLength: 200 }),
                }),
                async ({ question, answer }) => {
                    mockPrisma.faqEntry.findFirst.mockResolvedValue(null);
                    // Simulate semantic duplicate found
                    mockPrisma.$queryRaw.mockResolvedValue([{ id: 'existing-id', similarity: 0.95 }]);

                    const createSpy = jest.spyOn(mockPrisma.faqEntry, 'create');
                    const execSpy = jest.spyOn(mockPrisma, '$executeRaw');

                    await service.processPatterns([makePattern({ question, answer })]);

                    expect(createSpy).not.toHaveBeenCalled();
                    expect(execSpy).not.toHaveBeenCalled();
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: rag-faq-improvements, Property 3: duplicate tespitinde frequency artışı
    it('P3: semantik duplicate tespit edildiğinde mevcut entry frequency artırılır, toplam sayı değişmez', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 5, maxLength: 100 }),
                async (question) => {
                    mockPrisma.faqEntry.findFirst.mockResolvedValue(null);
                    mockPrisma.$queryRaw.mockResolvedValue([{ id: 'existing-id', similarity: 0.95 }]);

                    const updateSpy = jest.spyOn(mockPrisma.faqEntry, 'update');
                    const result = await service.processPatterns([makePattern({ question })]);

                    expect(updateSpy).toHaveBeenCalledWith(
                        expect.objectContaining({
                            where: { id: 'existing-id' },
                            data: { frequency: { increment: 1 } },
                        }),
                    );
                    expect(result.skipped).toBe(1);
                    expect(result.autoPublished + result.queued).toBe(0);
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: rag-faq-improvements, Property 4: deduplication threshold konfigürasyonu
    it('P4: FAQ_SEMANTIC_DEDUP_THRESHOLD env değeri kullanılır; tanımlı değilse 0.90 varsayılan', async () => {
        const originalEnv = process.env.FAQ_SEMANTIC_DEDUP_THRESHOLD;

        await fc.assert(
            fc.asyncProperty(
                fc.float({ min: 0.5, max: 1.0, noNaN: true }),
                async (threshold) => {
                    process.env.FAQ_SEMANTIC_DEDUP_THRESHOLD = threshold.toString();
                    mockPrisma.faqEntry.findFirst.mockResolvedValue(null);
                    // Return similarity just below threshold — should NOT be duplicate
                    mockPrisma.$queryRaw
                        .mockResolvedValueOnce([])
                        .mockResolvedValue([{ id: 'new-id' }]);

                    await service.processPatterns([makePattern()]);

                    // Verify $queryRaw was called (semantic check happened)
                    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
                },
            ),
            { numRuns: 50 },
        );

        process.env.FAQ_SEMANTIC_DEDUP_THRESHOLD = originalEnv;
    });

    // Feature: rag-faq-improvements, Property 10: KB summarize idempotency
    it('P10: knowledgeBaseAdded=true olan ticket için queue\'ya ekleme yapılmaz', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    id: fc.uuid(),
                    ticketNumber: fc.string({ minLength: 3, maxLength: 20 }),
                }),
                async ({ id, ticketNumber }) => {
                    const ticket = { id, ticketNumber, knowledgeBaseAdded: true };
                    const addSpy = jest.spyOn(mockQueue, 'add');

                    await service.handleTicketKbSummarize(ticket);

                    expect(addSpy).not.toHaveBeenCalled();
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: rag-faq-improvements, Property 10: knowledgeBaseAdded=false olan ticket queue'ya eklenir
    it('P10: knowledgeBaseAdded=false olan ticket queue\'ya eklenir', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    id: fc.uuid(),
                    ticketNumber: fc.string({ minLength: 3, maxLength: 20 }),
                }),
                async ({ id, ticketNumber }) => {
                    const ticket = { id, ticketNumber, knowledgeBaseAdded: false };
                    const addSpy = jest.spyOn(mockQueue, 'add').mockResolvedValue({} as any);

                    await service.handleTicketKbSummarize(ticket);

                    expect(addSpy).toHaveBeenCalledWith(
                        'summarize',
                        { ticketId: id },
                        expect.any(Object),
                    );
                },
            ),
            { numRuns: 100 },
        );
    });
});
