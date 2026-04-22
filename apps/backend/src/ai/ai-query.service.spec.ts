import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiQueryService, AiQueryResult } from './ai-query.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { PromptContextBuilderService } from './prompt-context-builder.service';
import { PromptsService } from './prompts.service';
import { SettingsService } from '../settings/settings.service';
import { LangfuseService } from './langfuse.service';
import { RedisService } from '../redis/redis.service';
import { RagObservabilityService } from './rag-observability.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('AiQueryService', () => {
    let service: AiQueryService;
    let prisma: any;
    let aiService: any;
    let embeddingService: any;
    let redis: any;

    const mockInteraction = { id: 'int-1', confidence: 'HIGH' };

    const mockPrismaService = {
        user: { findUnique: jest.fn() },
        aiInteraction: {
            create: jest.fn().mockResolvedValue(mockInteraction),
            update: jest.fn(),
            aggregate: jest.fn(),
            groupBy: jest.fn(),
            count: jest.fn(),
            findMany: jest.fn(),
        },
        product: { findUnique: jest.fn() },
        ticket: { findUniqueOrThrow: jest.fn() },
        ticketMessage: { findUnique: jest.fn(), update: jest.fn() },
        interactionFeedback: { create: jest.fn() },
        knowledgeSource: { count: jest.fn() },
        knowledgeArticle: { count: jest.fn() },
        faqEntry: { count: jest.fn() },
    };

    const mockAiService = {
        embed: jest.fn(),
        generate: jest.fn(),
        reformat: jest.fn(),
        streamReformat: jest.fn(),
        getActiveProviderName: jest.fn().mockResolvedValue('ollama'),
        getActiveModelName: jest.fn().mockResolvedValue('llama3'),
        translate: jest.fn(),
    };

    const mockEmbeddingService = {
        search: jest.fn(),
        searchTickets: jest.fn(),
    };

    const mockRedisService = {
        get: jest.fn().mockResolvedValue(null), // No cache by default
        set: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn((key: string, fallback?: string) => {
            if (key === 'SIMILARITY_THRESHOLD_HIGH') return '0.90';
            if (key === 'SIMILARITY_THRESHOLD_MEDIUM') return '0.75';
            return fallback ?? 'test-value';
        }),
    };

    const mockPromptsService = {
        getPrompt: jest.fn().mockResolvedValue('You are helpful.'),
    };

    const mockPromptContextBuilder = {
        buildContext: jest.fn().mockResolvedValue('Context: relevant KB content.'),
    };

    const mockSettingsService = {
        getValue: jest.fn(),
    };

    const mockLangfuseService = {
        trace: jest.fn().mockResolvedValue(undefined),
    };

    const mockRagObservabilityService = {
        recordQuery: jest.fn(),
    };

    const mockEventEmitter = {
        emit: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiQueryService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: AiService, useValue: mockAiService },
                { provide: EmbeddingService, useValue: mockEmbeddingService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: PromptContextBuilderService, useValue: mockPromptContextBuilder },
                { provide: PromptsService, useValue: mockPromptsService },
                { provide: SettingsService, useValue: mockSettingsService },
                { provide: LangfuseService, useValue: mockLangfuseService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: RagObservabilityService, useValue: mockRagObservabilityService },
                { provide: EventEmitter2, useValue: mockEventEmitter },
            ],
        }).compile();

        service = module.get<AiQueryService>(AiQueryService);
        prisma = module.get<PrismaService>(PrismaService);
        aiService = module.get<AiService>(AiService);
        embeddingService = module.get<EmbeddingService>(EmbeddingService);
        redis = module.get<RedisService>(RedisService);

        jest.clearAllMocks();
        mockPrismaService.aiInteraction.create.mockResolvedValue(mockInteraction);
        mockRedisService.get.mockResolvedValue(null);
        mockAiService.getActiveProviderName.mockResolvedValue('ollama');
        mockAiService.getActiveModelName.mockResolvedValue('llama3');
    });

    describe('query — Cache', () => {
        it('should return cached result without hitting DB when cache exists', async () => {
            // Arrange
            const cached: AiQueryResult = {
                query: 'test', answer: 'cached answer', confidence: 'HIGH',
                sources: [], interactionId: 'int-cached', suggestTicket: false,
            };
            mockRedisService.get.mockResolvedValue(JSON.stringify(cached));

            // Act
            const result = await service.query({ userQuery: 'test query' });

            // Assert
            expect(result.answer).toBe('cached answer');
            expect(mockEmbeddingService.search).not.toHaveBeenCalled();
        });
    });

    describe('query — No Match (confidence floor)', () => {
        it('should return NO_MATCH and suggestTicket=true when topScore < LOW_CONFIDENCE_THRESHOLD', async () => {
            // Arrange — search returns LOW topScore
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockEmbeddingService.search.mockResolvedValue({
                results: [],
                diagnostics: { topScore: 0.5, passedThreshold: 0, queryEmbeddingModel: 'nomic', thresholdUsed: 0.78 },
            });

            // Act
            const result = await service.query({ userQuery: 'unknown question', userId: null });

            // Assert
            expect(result.confidence).toBe('NO_MATCH');
            expect(result.suggestTicket).toBe(true);
            expect(result.answer).toContain('No reliable source found');
            expect(mockAiService.reformat).not.toHaveBeenCalled();
        });
    });

    describe('query — HIGH confidence', () => {
        it('should call AI reformat and return HIGH confidence answer', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            const highResult = {
                articleId: 'art-1', sourceType: 'ARTICLE' as const,
                title: 'Installation Guide', content: 'Step 1: ...', similarity: 0.95, confidence: 'HIGH' as const,
            };
            mockEmbeddingService.search.mockResolvedValue({
                results: [highResult],
                diagnostics: { topScore: 0.95, passedThreshold: 1, queryEmbeddingModel: 'nomic', thresholdUsed: 0.78 },
            });
            mockAiService.reformat.mockResolvedValue({ response: 'Formatted AI answer' });

            // Act
            const result = await service.query({ userQuery: 'how to install?', userId: null });

            // Assert
            expect(result.confidence).toBe('HIGH');
            expect(result.answer).toBe('Formatted AI answer');
            expect(result.suggestTicket).toBe(false);
            expect(mockAiService.reformat).toHaveBeenCalledTimes(1);
            expect(mockLangfuseService.trace).toHaveBeenCalledTimes(1);
        });
    });

    describe('query — MEDIUM confidence', () => {
        it('should return MEDIUM confidence and suggestTicket=false', async () => {
            // Arrange
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    { articleId: 'a1', sourceType: 'DOCUMENT', title: 'Doc', content: 'Content', similarity: 0.75, confidence: 'MEDIUM' }
                ],
                diagnostics: { topScore: 0.75, passedThreshold: 1, queryEmbeddingModel: 'nomic', thresholdUsed: 0.65 },
            });
            mockAiService.reformat.mockResolvedValue({ response: 'Medium answer' });

            // Act
            const result = await service.query({ userQuery: 'partial match question', userId: null });

            // Assert
            expect(result.confidence).toBe('MEDIUM');
            expect(result.suggestTicket).toBe(false);
        });
    });

    describe('submitFeedback', () => {
        it('should create feedback record with isHelpful=true for rating >= 4', async () => {
            // Arrange
            mockPrismaService.interactionFeedback.create.mockResolvedValue({ id: 'fb-1' });

            // Act
            await service.submitFeedback('int-1', 'user-1', 5, 'Very helpful!');

            // Assert
            expect(mockPrismaService.interactionFeedback.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        isHelpful: true,
                        rating: 5,
                        comment: 'Very helpful!',
                    })
                })
            );
        });

        it('should set isHelpful=false for rating < 4', async () => {
            mockPrismaService.interactionFeedback.create.mockResolvedValue({ id: 'fb-2' });

            await service.submitFeedback('int-1', 'user-1', 2);

            expect(mockPrismaService.interactionFeedback.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ isHelpful: false })
                })
            );
        });
    });

    describe('smartTagTicket', () => {
        it('should return empty tags when product has no categories', async () => {
            // Arrange
            mockPrismaService.product.findUnique.mockResolvedValue({ id: 'p1', categories: [] });

            // Act
            const result = await service.smartTagTicket('p1', 'some text');

            // Assert
            expect(result.tags).toEqual([]);
            expect(mockAiService.reformat).not.toHaveBeenCalled();
        });

        it('should return matching tag from AI response', async () => {
            // Arrange
            mockPrismaService.product.findUnique.mockResolvedValue({
                id: 'p1', categories: [{ name: 'Kurulum' }, { name: 'Lisans' }]
            });
            mockEmbeddingService.searchTickets.mockResolvedValue([]);
            mockEmbeddingService.search.mockResolvedValue({ results: [], diagnostics: { topScore: 0 } });
            mockAiService.reformat.mockResolvedValue({ response: 'Kurulum' });

            // Act
            const result = await service.smartTagTicket('p1', 'Kurulum adımları hakkında sorum var');

            // Assert
            expect(result.tags).toContain('Kurulum');
        });

        it('should return empty tags when AI suggests an invalid tag', async () => {
            // Arrange
            mockPrismaService.product.findUnique.mockResolvedValue({
                id: 'p1', categories: [{ name: 'Kurulum' }]
            });
            mockEmbeddingService.searchTickets.mockResolvedValue([]);
            mockEmbeddingService.search.mockResolvedValue({ results: [], diagnostics: { topScore: 0 } });
            mockAiService.reformat.mockResolvedValue({ response: 'SomethingInvalid' });

            // Act
            const result = await service.smartTagTicket('p1', 'some text');

            // Assert
            expect(result.tags).toEqual([]);
        });
    });

    describe('submitTelemetry', () => {
        it('should update aiInteraction with accepted status', async () => {
            mockPrismaService.aiInteraction.update.mockResolvedValue({ id: 'int-1', isAccepted: true });

            await service.submitTelemetry('int-1', true, 'edited response');

            expect(mockPrismaService.aiInteraction.update).toHaveBeenCalledWith({
                where: { id: 'int-1' },
                data: { isAccepted: true, editedResponse: 'edited response' },
            });
        });
    });
});
