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
import { AiDiagnosisService } from './ai-diagnosis.service';
import { DocumentParserService } from '../common/services/document-parser.service';
import { MetricsService } from '../metrics/metrics.service';
import { StorageService } from '../common/services/storage.service';
import { AiSemanticCache } from './ai-semantic-cache.service';
import { getQueueToken } from '@nestjs/bullmq';
import { SupportAnswerOrchestrator } from './support-answer-orchestrator.service';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';


describe('AiQueryService', () => {
    let service: AiQueryService;
    let prisma: any;
    let aiService: any;
    let embeddingService: any;
    let redis: any;
    let diagnosisService: any;
    let storageService: any;
    let maintenanceWork: MaintenanceWorkService;
    let semanticCache: any;

    const mockInteraction = { id: 'int-1', confidence: 'HIGH' };

    const mockPrismaService = {
        user: { findUnique: jest.fn() },
        aiInteraction: {
            create: jest.fn().mockResolvedValue(mockInteraction),
            findUnique: jest.fn(),
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
        trainingQueue: { upsert: jest.fn(), create: jest.fn().mockResolvedValue(undefined) },
        aiShiftDetection: { create: jest.fn().mockResolvedValue({ id: 'shift-id' }) },
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
        getClient: jest.fn(() => {
            const mockPipeline = {
                incrbyfloat: jest.fn().mockReturnThis(),
                incr: jest.fn().mockReturnThis(),
                expire: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([]),
            };
            return {
                get: jest.fn().mockResolvedValue(null),
                mget: jest.fn().mockResolvedValue([]),
                incrbyfloat: jest.fn().mockResolvedValue(1.0),
                incr: jest.fn().mockResolvedValue(1),
                expire: jest.fn().mockResolvedValue(1),
                pipeline: jest.fn(() => mockPipeline),
            };
        }),
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
        addEvent: jest.fn().mockResolvedValue(undefined),
        traceRetrieval: jest.fn().mockResolvedValue(undefined),
    };

    const mockRagObservabilityService = {
        recordQuery: jest.fn(),
    };

    const mockStorageService = {
        getFile: jest.fn(),
    };

    const mockEventEmitter = {
        emit: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiQueryService,
                SupportAnswerOrchestrator,
                MaintenanceWorkService,
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
                { provide: AiDiagnosisService, useValue: { analyze: jest.fn().mockResolvedValue({ categoryNames: [], matchedKeywords: [] }) } },
                { provide: DocumentParserService, useValue: { parse: jest.fn(), extractText: jest.fn().mockResolvedValue('') } },
                { provide: MetricsService, useValue: { increment: jest.fn(), gauge: jest.fn(), recordCacheOp: jest.fn() } },
                { provide: StorageService, useValue: mockStorageService },
                { provide: AiSemanticCache, useValue: {
                    get: jest.fn().mockResolvedValue(null),
                    set: jest.fn().mockResolvedValue(undefined),
                    getKnowledgeEpoch: jest.fn().mockResolvedValue('0'),
                    advanceKnowledgeEpoch: jest.fn().mockResolvedValue('1'),
                    purgeAll: jest.fn().mockResolvedValue(undefined),
                } },
                { provide: getQueueToken('ai-query-processing'), useValue: {} },
            ],
        }).compile();

        service = module.get<AiQueryService>(AiQueryService);
        prisma = module.get<PrismaService>(PrismaService);
        aiService = module.get<AiService>(AiService);
        embeddingService = module.get<EmbeddingService>(EmbeddingService);
        redis = module.get<RedisService>(RedisService);
        diagnosisService = module.get<AiDiagnosisService>(AiDiagnosisService);
        storageService = module.get<StorageService>(StorageService);
        maintenanceWork = module.get(MaintenanceWorkService);
        semanticCache = module.get(AiSemanticCache);

        jest.clearAllMocks();
        mockAiService.generate.mockReset();
        mockAiService.reformat.mockReset();
        mockAiService.streamReformat.mockReset();
        mockPrismaService.aiInteraction.create.mockResolvedValue(mockInteraction);
        mockRedisService.get.mockResolvedValue(null);
        mockAiService.getActiveProviderName.mockResolvedValue('ollama');
        mockAiService.getActiveModelName.mockResolvedValue('llama3');
        mockLangfuseService.traceRetrieval.mockReset().mockResolvedValue(undefined);
        mockPrismaService.trainingQueue.create.mockReset().mockResolvedValue(undefined);
    });

    describe('query maintenance completion', () => {
        it.each(['query', 'queryInternal'] as const)(
            '%s rejects new work with 503 before external IO when admission is closed',
            async (entrypoint) => {
                mockPrismaService.user.findUnique.mockResolvedValue(null);
                mockEmbeddingService.search.mockResolvedValue({
                    results: [],
                    diagnostics: { topScore: 0.5, passedThreshold: 0, queryEmbeddingModel: 'nomic', thresholdUsed: 0.78 },
                });
                maintenanceWork.closeAdmission();
                await expect(service[entrypoint]({
                    userQuery: 'how to install?',
                    userId: '11111111-1111-4111-8111-111111111111',
                })).rejects.toMatchObject({ status: 503 });
                expect(prisma.user.findUnique).not.toHaveBeenCalled();
                expect(mockRedisService.getClient).not.toHaveBeenCalled();
                expect(mockRedisService.get).not.toHaveBeenCalled();
                expect(semanticCache.get).not.toHaveBeenCalled();
                expect(mockEmbeddingService.search).not.toHaveBeenCalled();
                expect(prisma.aiInteraction.create).not.toHaveBeenCalled();
            },
        );

        describe.each(['retrieval trace', 'training review', 'semantic cache'] as const)(
            '%s child',
            (operation) => {
                it.each(['success', 'failure'] as const)(
                    'does not delay the response but remains counted until %s',
                    async (outcome) => {
                        let release!: () => void;
                        let reject!: (reason: Error) => void;
                        const held = new Promise<void>((resolve, fail) => {
                            release = resolve;
                            reject = fail;
                        });
                        // Observe rejection even if a regression skips invoking this child.
                        void held.catch(() => undefined);
                        const target = operation === 'retrieval trace'
                            ? mockLangfuseService.traceRetrieval
                            : operation === 'training review'
                                ? prisma.trainingQueue.create
                                : semanticCache.set;
                        target.mockReturnValueOnce(held);
                        const highConfidence = operation === 'semantic cache';
                        // A retrieved but unclassified result reaches late NO_MATCH
                        // escalation; empty results take the earlier return instead.
                        const hasContext = operation !== 'retrieval trace';
                        prisma.user.findUnique.mockResolvedValue(null);
                        mockEmbeddingService.search.mockResolvedValue({
                            results: hasContext ? [{
                                articleId: 'art-1', sourceType: 'ARTICLE',
                                title: 'Installation Guide', content: 'Step 1: install.',
                                similarity: 0.95, confidence: highConfidence ? 'HIGH' : 'NO_MATCH',
                            }] : [],
                            diagnostics: {
                                topScore: hasContext ? 0.95 : 0.5,
                                passedThreshold: hasContext ? 1 : 0,
                                queryEmbeddingModel: 'nomic', thresholdUsed: 0.78,
                            },
                        });
                        mockAiService.generate.mockResolvedValue('Formatted AI answer');
                        const response = service.queryInternal({
                            userQuery: 'how to install?',
                            userId: '11111111-1111-4111-8111-111111111111',
                        });
                        try {
                            // A scheduling turn, not a sleep: fully mocked query IO settles
                            // while the selected real service branch is deliberately held.
                            const result = await Promise.race([
                                response,
                                new Promise<'response-still-pending'>((resolve) =>
                                    setImmediate(() => resolve('response-still-pending'))),
                            ]);
                            expect(result).not.toBe('response-still-pending');
                            expect(result).toMatchObject({
                                confidence: highConfidence ? 'HIGH' : 'NO_MATCH',
                            });
                            expect(target).toHaveBeenCalledTimes(1);
                            maintenanceWork.closeAdmission();
                            const heldWork = await maintenanceWork.waitForIdle(0);
                            expect(heldWork.drained).toBe(false);
                            expect(heldWork.activeCount).toBeGreaterThan(0);
                            if (outcome === 'failure') reject(new Error('Synthetic child failure'));
                            else release();
                            await expect(maintenanceWork.waitForIdle(1000)).resolves.toEqual({
                                drained: true, activeCount: 0,
                            });
                        } finally {
                            release();
                            await response;
                        }
                    },
                );
            },
        );
    });

    describe('query — Cache', () => {
        it('builds different cache keys when requester scope changes', () => {
            const buildScope = (service as any).buildCacheScope.bind(service);
            const buildHash = (service as any).buildQueryHash.bind(service);
            const baseOptions = {
                userQuery: 'test query',
                userId: '11111111-1111-4111-8111-111111111111',
                productId: 'allplan',
                language: 'tr',
                routeLocale: 'tr',
                history: [{ role: 'user' as const, content: 'ilk bağlam' }],
                hotinfoContext: { version: '2026' },
            };
            const baseScope = buildScope(baseOptions, false, 'tr');
            const changedScope = buildScope({
                ...baseOptions,
                userId: '22222222-2222-4222-8222-222222222222',
                routeLocale: 'en',
            }, false, 'tr');

            expect(buildHash('test query', baseScope, 'generation-1')).not.toEqual(buildHash('test query', changedScope, 'generation-1'));
            expect(buildHash('test query', baseScope, 'generation-1')).not.toEqual(buildHash('test query', baseScope, 'generation-2'));
            expect(buildScope(baseOptions, false, 'tr').contextFingerprint).not.toEqual(
                buildScope({ ...baseOptions, privacySafeContext: true }, false, 'tr').contextFingerprint,
            );
        });

        it('omits profile and raw Hotinfo inputs from prompt context in privacy-safe mode', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockEmbeddingService.search.mockResolvedValue({
                results: [{
                    articleId: 'art-1', sourceType: 'ARTICLE', title: 'License guide',
                    content: 'Use the license settings screen.', similarity: 0.95, confidence: 'HIGH',
                }],
                diagnostics: { topScore: 0.95, passedThreshold: 1, queryEmbeddingModel: 'nomic', thresholdUsed: 0.78 },
            });

            await (service as any).prepareQueryContext({
                userQuery: 'License issue',
                userId: 'customer-1',
                hotinfoContext: { rawSecret: 'PRIVATE HOTINFO' },
                privacySafeContext: true,
                history: [{ role: 'user', content: 'Public masked history' }],
            });

            expect(mockPromptContextBuilder.buildContext).toHaveBeenCalledWith(expect.objectContaining({
                userId: undefined,
                hotinfoSnapshot: undefined,
            }));
        });

        it('should return cached result without hitting DB when cache exists', async () => {
            // Arrange
            const cached: AiQueryResult = {
                query: 'test', answer: 'cached answer', confidence: 'HIGH',
                sources: [], interactionId: 'int-cached', suggestTicket: false,
            };
            mockRedisService.get.mockResolvedValue(JSON.stringify(cached));

            // Act
            const result = await service.query({
                userQuery: 'test query',
                userId: '11111111-1111-4111-8111-111111111111',
            });

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
            expect(result.answer).toContain('Bu konu için bilgi kaynağında yeterince güvenilir bilgi bulunamadı');
            expect(mockAiService.reformat).not.toHaveBeenCalled();
        });
    });

    describe('query — HIGH confidence', () => {
        it('does not run RAG for URL-only ticket-opening text', async () => {
            const result = await service.query({
                userQuery: 'https://allplan.net.tr/en/tickets/new',
                userId: null,
                language: 'en',
                strictLanguage: true,
                wait: true,
            });

            expect(result.confidence).toBe('NO_MATCH');
            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('could not identify a support question');
            expect(result.suggestTicket).toBe(true);
            expect(mockEmbeddingService.search).not.toHaveBeenCalled();
            expect(diagnosisService.analyze).not.toHaveBeenCalled();
            expect(mockAiService.generate).not.toHaveBeenCalled();
            expect(mockPrismaService.aiInteraction.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    responseGenerated: expect.stringContaining('could not identify a support question'),
                    confidenceBand: null,
                    autoAnswered: false,
                    similarityScore: 0,
                    userContext: expect.objectContaining({
                        generationState: 'INPUT_GUARD',
                        inputGuard: 'URL_ONLY_OR_NAVIGATION_TEXT',
                    }),
                }),
            });
        });

        it('still allows support questions that include a URL as context', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockEmbeddingService.search.mockResolvedValue({
                results: [],
                diagnostics: { topScore: 0.5, passedThreshold: 0, queryEmbeddingModel: 'nomic', thresholdUsed: 0.78 },
            });

            await service.query({
                userQuery: 'Allplan freezes after opening https://allplan.net.tr/en/tickets/new',
                userId: null,
                language: 'en',
                strictLanguage: true,
                wait: true,
            });

            expect(mockEmbeddingService.search).toHaveBeenCalled();
            expect(diagnosisService.analyze).toHaveBeenCalled();
        });

        it('blocks ticket-opening AI when query language does not match the selected UI language', async () => {
            const result = await service.query({
                userQuery: 'What should I check if license server installation failed?',
                userId: null,
                language: 'tr',
                strictLanguage: true,
                wait: true,
            });

            expect(result.languageMismatch).toBe(true);
            expect(result.answer).toContain('Seçili arayüz diliniz Türkçe');
            expect(result.answer).toContain('sorunuz İngilizce');
            expect(result.suggestTicket).toBe(false);
            expect(mockEmbeddingService.search).not.toHaveBeenCalled();
            expect(diagnosisService.analyze).not.toHaveBeenCalled();
            expect(mockAiService.generate).not.toHaveBeenCalled();
            expect(mockAiService.reformat).not.toHaveBeenCalled();
        });

        it('should call shared support synthesis and return HIGH confidence answer', async () => {
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
            mockAiService.generate.mockResolvedValue('Formatted AI answer');

            // Act
            const result = await service.query({ userQuery: 'how to install?', userId: null });

            // Assert
            expect(result.confidence).toBe('HIGH');
            expect(result.answer).toBe('Formatted AI answer');
            expect(result.suggestTicket).toBe(false);
            expect(mockAiService.generate).toHaveBeenCalledTimes(1);
            expect(mockAiService.generate.mock.calls[0][0]).toContain('RESPONSE DRAFT:');
            expect(mockAiService.generate.mock.calls[0][0]).toContain('Audience: customer self-service answer');
            expect(mockAiService.generate.mock.calls[0][0]).toContain('[TICKET_OPENING_ANSWER_MODE]');
            expect(mockAiService.generate.mock.calls[0][0]).toContain('same analytical depth as the admin ANN draft');
            expect(mockAiService.reformat).not.toHaveBeenCalled();
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
            mockAiService.reformat.mockResolvedValue({ response: 'This is a medium confidence answer that provides adequate detail for the user query.' });

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
            expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
                where: { id: 'p1', isActive: true, deletedAt: null },
                include: { categories: { where: { isActive: true, deletedAt: null } } },
            });
        });

        it('should not search or call AI when the selected product is archived', async () => {
            mockPrismaService.product.findUnique.mockResolvedValue(null);

            const result = await service.smartTagTicket('archived-product', 'license issue');

            expect(result.tags).toEqual([]);
            expect(mockEmbeddingService.searchTickets).not.toHaveBeenCalled();
            expect(mockEmbeddingService.search).not.toHaveBeenCalled();
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

    describe('queryInternal — answer mode', () => {
        beforeEach(() => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockEmbeddingService.search.mockResolvedValue({
                results: [{
                    articleId: 'art-1',
                    sourceType: 'ARTICLE',
                    title: 'Graphics Driver Guide',
                    content: 'Use the certified graphics driver package.',
                    similarity: 0.95,
                    confidence: 'HIGH',
                }],
                diagnostics: { topScore: 0.95, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.generate.mockResolvedValue('{"rankings":[{"id":0,"score":95}]}');
            jest.spyOn(diagnosisService, 'analyze').mockResolvedValue({
                isProblemShift: false,
                categoryNames: ['Performance'],
                matchedKeywords: ['driver'],
                productName: 'Allplan',
            } as any);
        });

        it('returns answerMode=LLM when diagnosis generation succeeds', async () => {
            mockAiService.reformat.mockResolvedValue({ response: 'Install the latest certified GPU driver.', model: 'gpt-4o-mini' });

            const result = await service.queryInternal({ userQuery: 'How do I update the graphics driver?' });

            expect(result.answerMode).toBe('LLM');
            expect(result.answer).toContain('Install the latest certified GPU driver.');
            expect(mockPrismaService.aiInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    userContext: expect.objectContaining({ answerMode: 'LLM' }),
                }),
            }));
        });

        it('returns answerMode=FALLBACK when diagnosis generation times out or returns null', async () => {
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.queryInternal({ userQuery: 'How do I update the graphics driver?' });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('Grafik kartı sürücüsü güncellemesi');
            expect(mockPrismaService.aiInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    userContext: expect.objectContaining({
                        answerMode: 'FALLBACK',
                        fallbackStrategy: 'DETERMINISTIC_STRUCTURED',
                        source: expect.objectContaining({
                            id: 'art-1',
                            type: 'ARTICLE',
                            title: 'Graphics Driver Guide',
                        }),
                    }),
                }),
            }));
        });

        it('recovers customer no-knowledge answers with ANN-style synthesis before deterministic fallback', async () => {
            mockAiService.generate.mockResolvedValue('The knowledge base does not contain enough reliable information for this exact question yet.');
            mockAiService.reformat.mockResolvedValue({
                response: '## 📌 Issue Summary\nCreate the fixture, then place the reinforcement with the documented reinforcement workflow.',
                model: 'gemini-2.5-flash',
            });

            const result = await service.queryInternal({
                userQuery: 'How to create a fixture with reinforcement?',
                language: 'en',
                wait: true,
            });

            expect(result.answerMode).toBe('LLM');
            expect(result.answer).toContain('Create the fixture');
            expect(result.answer).not.toContain('This looks like a support question about');
            expect(mockAiService.reformat).toHaveBeenCalledWith(
                expect.stringContaining('[SECOND_PASS_SYNTHESIS]'),
                'How to create a fixture with reinforcement?',
                expect.stringContaining('Use the certified graphics driver package.'),
                [],
            );
            expect(mockPrismaService.aiInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    userContext: expect.objectContaining({
                        answerMode: 'LLM',
                        fallbackStrategy: null,
                    }),
                }),
            }));
        });

        it('merges direct retrieval with HyDE so exact visual sources reach customer answers', async () => {
            const genericLicenseResult = {
                articleId: 'generic-license',
                sourceType: 'DOCUMENT' as const,
                title: 'FAQ_EN_Controlling_license_selection',
                content: 'Use CodeMeter Control Center to inspect local license containers.',
                similarity: 0.96,
                confidence: 'HIGH' as const,
            };
            const friloVisualResult = {
                articleId: 'frilo-trial',
                sourceType: 'URL' as const,
                title: 'Activating a FRILO trial version',
                content: 'Answer: Select FRILO in the trial version page, then choose FRILO TRIAL in the license selection dialog and confirm with OK.',
                similarity: 0.88,
                confidence: 'HIGH' as const,
                visualSummaries: [
                    {
                        url: 'https://learnnow.allplan.com/pluginfile.php/frilo-trial.png',
                        alt: 'FRILO trial license selection',
                        caption: 'License selection dialog',
                        summary: 'The license selection dialog shows FRILO TRIAL and the OK button.',
                    },
                ],
            };
            mockEmbeddingService.search
                .mockResolvedValueOnce({
                    results: [genericLicenseResult],
                    diagnostics: { topScore: 0.96, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
                })
                .mockResolvedValueOnce({
                    results: [friloVisualResult],
                    diagnostics: { topScore: 0.88, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
                });
            mockAiService.generate.mockResolvedValue([
                '## 📌 Issue Summary',
                'To activate a FRILO trial version, use the FRILO trial page and the FRILO TRIAL license selection shown in the source images.',
                '',
                '## 🛠️ Solution Steps',
                '1. Select FRILO on the trial page.',
                '2. Select FRILO TRIAL in the license selection dialog and confirm with OK.',
            ].join('\n'));

            const result = await service.query({
                userQuery: 'How can I activate a FRILO trial version?',
                wait: true,
                language: 'en',
            });

            expect(mockEmbeddingService.search).toHaveBeenCalledTimes(2);
            expect(result.answerMode).toBe('LLM');
            expect(result.visuals).toEqual([
                expect.objectContaining({
                    url: 'https://learnnow.allplan.com/pluginfile.php/frilo-trial.png',
                    sourceTitle: 'Activating a FRILO trial version',
                    summary: expect.stringContaining('FRILO TRIAL'),
                }),
            ]);
            expect(mockPrismaService.aiInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    userContext: expect.objectContaining({
                        visuals: expect.arrayContaining([
                            expect.objectContaining({
                                url: 'https://learnnow.allplan.com/pluginfile.php/frilo-trial.png',
                                sourceTitle: 'Activating a FRILO trial version',
                            }),
                        ]),
                    }),
                }),
            }));
            expect(mockPromptContextBuilder.buildContext).toHaveBeenCalledWith(expect.objectContaining({
                visualEvidence: expect.arrayContaining([
                    expect.objectContaining({
                        sourceTitle: 'Activating a FRILO trial version',
                        summary: expect.stringContaining('FRILO TRIAL'),
                    }),
                ]),
            }));
        });

        it('keeps visual LearnNow sources above generic HyDE hits when no query signal group matches', async () => {
            const genericDocumentResult = {
                articleId: 'generic-license-doc',
                sourceType: 'DOCUMENT' as const,
                title: 'FAQ_EN_Controlling_license_selection',
                content: 'Use CodeMeter Control Center to inspect local license containers and license selection.',
                similarity: 0.927,
                confidence: 'HIGH' as const,
            };
            const friloVisualResult = {
                articleId: 'frilo-trial-learnnow',
                sourceType: 'URL' as const,
                title: 'Activating a FRILO trial version',
                content: 'Answer: Select FRILO on the trial version page, then choose FRILO TRIAL in the license selection dialog and confirm with OK.',
                similarity: 0.706,
                confidence: 'MEDIUM' as const,
                visualSummaries: [
                    {
                        url: 'https://learnnow.allplan.com/pluginfile.php/5/engage_howto/salesforce_content/11851/0EMRD00000R9tgt.png',
                        alt: 'FRILO trial page',
                        caption: 'FRILO trial activation page',
                        summary: 'The trial version page shows the FRILO option and the Get FRILO Trial button.',
                    },
                    {
                        url: 'https://learnnow.allplan.com/pluginfile.php/5/engage_howto/salesforce_content/11851/0EMRD00000RAHBJ.png',
                        alt: 'FRILO TRIAL license selection',
                        caption: 'License selection dialog',
                        summary: 'The license selection dialog shows FRILO TRIAL selected and the OK button.',
                    },
                ],
            };
            mockEmbeddingService.search
                .mockResolvedValueOnce({
                    results: [genericDocumentResult],
                    diagnostics: { topScore: 0.927, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
                })
                .mockResolvedValueOnce({
                    results: [friloVisualResult],
                    diagnostics: { topScore: 0.706, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
                });
            mockAiService.generate.mockResolvedValue([
                '## 📌 Sorun Özeti',
                'FRILO deneme sürümünü etkinleştirmek için LearnNow kaynağındaki deneme sayfası ve lisans seçim görselleri izlenmelidir.',
                '',
                '## 🛠️ Çözüm Adımları',
                '1. FRILO seçeneğinin yanındaki Get FRILO Trial düğmesini kullanın.',
                '2. License selection ekranında FRILO TRIAL lisansını seçip OK ile onaylayın.',
            ].join('\n'));

            const result = await service.query({
                userQuery: 'FRILO TRIAL ACTIVATION LEARNNOW VISUAL SMOKE TEST',
                wait: true,
                language: 'tr',
                routeLocale: 'tr',
                strictLanguage: true,
                hotinfoContext: {
                    allplanVersion: 'Allplan 2026-0-3 Unicode 64-bit',
                    allplanBuildId: '39.1605.8421.537',
                    licenseType: '⚠ Lisans dosyası okunamadı',
                    errorTrace: 'SEC Hata: C:\\ProgramData\\Nemetschek\\Allplan\\2026\\License\\_SEC.NSE',
                },
            });

            for (const call of mockEmbeddingService.search.mock.calls) {
                const searchArg = call[0] as string;
                expect(searchArg).not.toContain('HOTINFO SAFE SEARCH SIGNALS');
                expect(searchArg).not.toContain('Lisans telemetrisi');
                expect(searchArg).not.toContain('_SEC.NSE');
            }
            expect(result.answerMode).toBe('LLM');
            expect(result.confidence).not.toBe('NO_MATCH');
            expect(result.visuals).toEqual(expect.arrayContaining([
                expect.objectContaining({
                    url: 'https://learnnow.allplan.com/pluginfile.php/5/engage_howto/salesforce_content/11851/0EMRD00000R9tgt.png',
                    sourceTitle: 'Activating a FRILO trial version',
                }),
                expect.objectContaining({
                    url: 'https://learnnow.allplan.com/pluginfile.php/5/engage_howto/salesforce_content/11851/0EMRD00000RAHBJ.png',
                    sourceTitle: 'Activating a FRILO trial version',
                }),
            ]));

            const interactionCreateArg = mockPrismaService.aiInteraction.create.mock.calls.at(-1)?.[0];
            expect(interactionCreateArg.data.userContext.source).toEqual(expect.objectContaining({
                id: 'frilo-trial-learnnow',
                type: 'URL',
                title: 'Activating a FRILO trial version',
            }));
            expect(Number.isNaN(interactionCreateArg.data.userContext.source.similarity)).toBe(false);
        });

        it('skips LLM re-ranking for synchronous wait queries', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'art-1',
                        sourceType: 'ARTICLE',
                        title: 'Graphics Driver Guide',
                        content: 'Use the certified graphics driver package.',
                        similarity: 0.95,
                        confidence: 'HIGH',
                    },
                    {
                        articleId: 'art-2',
                        sourceType: 'DOCUMENT',
                        title: 'Display Troubleshooting',
                        content: 'Check display settings and certified hardware.',
                        similarity: 0.9,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.95, passedThreshold: 2, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.generate.mockResolvedValue('Use the certified GPU driver package.');

            const result = await service.query({ userQuery: 'How do I update the graphics driver?', wait: true });

            expect(result.answerMode).toBe('LLM');
            expect(mockAiService.generate).toHaveBeenCalledTimes(1);
            expect(mockAiService.reformat).not.toHaveBeenCalled();
        });

        it('keeps synchronous customer diagnosis open long enough for admin-grade synthesis', async () => {
            jest.useFakeTimers();
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'license-move',
                        sourceType: 'DOCUMENT',
                        title: 'Moving license server to a new server',
                        content: 'Return licenses on the old server. Install the license server on the new machine. Activate licenses with the Product Key. Verify clients can connect.',
                        similarity: 0.96,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.96, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockImplementation(() =>
                new Promise((resolve) => setTimeout(() => resolve({
                    response: '## 📌 Sorun Yorumu\nLisans sunucusu taşıma süreci için sentezlenmiş yanıt.',
                }), 30_000)),
            );

            const resultPromise = service.query({
                userQuery: 'Lisans sunucusunu yeni bir makineye taşımak istiyorum, süreç nedir?',
                wait: true,
                language: 'tr',
            });

            await jest.advanceTimersByTimeAsync(30_000);
            const result = await resultPromise;

            expect(result.answerMode).toBe('LLM');
            expect(result.answer).toContain('Lisans sunucusu taşıma süreci');
            jest.useRealTimers();
        });

        it('does not cut off customer synthesis when retrieved context is usable at the threshold', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'axis-grid-3d',
                        sourceType: 'DOCUMENT',
                        title: 'Axis grid',
                        content: 'Use the Grid task area to create an axis grid. Axis lines and planes can be created in the z-direction for a 3D grid.',
                        similarity: 0.72,
                        confidence: 'MEDIUM',
                    },
                ],
                diagnostics: { topScore: 0.8034, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.8 },
            });
            mockAiService.generate.mockResolvedValue([
                '## 📌 Sorun Yorumu',
                'Allplan içinde 3B grid için Axis Grid aracını kullanarak z yönündeki eksen çizgileri ve düzlemleri oluşturabilirsiniz.',
                '',
                '## 🛠️ Çözüm Adımları',
                '1. Grid görev alanını açın.',
                '2. Axis Grid aracını seçin ve z yönü ayarlarını kontrol edin.',
            ].join('\n'));

            const result = await service.query({
                userQuery: "Allplan'da 3B grid yapmak istiyorum",
                wait: true,
                language: 'tr',
                routeLocale: 'tr',
            });

            expect(result.confidence).not.toBe('NO_MATCH');
            expect(result.answerMode).toBe('LLM');
            expect(result.answer).toContain('Axis Grid');
            expect(mockAiService.generate).toHaveBeenCalled();
            expect(mockPrismaService.aiInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    confidenceBand: 'MEDIUM',
                    autoAnswered: true,
                    similarityScore: expect.any(Number),
                }),
            }));
        });

        it('uses query-aware fallback excerpts when synchronous generation is unavailable', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'slow-faq',
                        sourceType: 'DOCUMENT',
                        title: 'Allplan is running slow',
                        content: 'Why is Allplan running so slow? Check the current version. You can find information about graphics cards at https://connect.allplan.com/de/support/grafikkarten.html',
                        similarity: 0.95,
                        confidence: 'HIGH',
                    },
                    {
                        articleId: 'gpu-driver',
                        sourceType: 'ARTICLE',
                        title: 'Graphics card driver update',
                        content: 'For graphics card driver updates, download the current NVIDIA Studio or AMD Pro driver from the official vendor website and restart Windows after installation.',
                        similarity: 0.82,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.95, passedThreshold: 2, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'Allplanda grafik kartları sürüm güncelleme nasıl yapılır?',
                wait: true,
                language: 'tr',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('Grafik kartı sürücüsü güncellemesi');
            expect(result.answer).toContain('NVIDIA Studio');
            expect(result.answer).not.toContain('Kaynak:');
            expect(result.answer).not.toContain('İlgili pasaj:');
            expect(result.answer).not.toContain('Why is Allplan running so slow?');
        });

        it('does not build a customer fallback from an unrelated high-scoring source', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'layout-printing',
                        sourceType: 'DOCUMENT',
                        title: 'Allplan_2020_SbS_LayoutsPrinting-57xgv7qhci0',
                        content: 'Open the Ports tab. Enter copy /b C:\\Print\\Test01.prn LPT1. If the printer is connected to a computer on the network, enter the UNC name instead of the port.',
                        similarity: 0.95,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.95, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'Loopback adapter hangi durumda gerekir?',
                wait: true,
                language: 'tr',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('yeterince güvenilir ve doğrudan eşleşen içerik bulunamadı');
            expect(result.answer).toContain('destek talebi');
            expect(result.answer).not.toContain('Allplan_2020_SbS_LayoutsPrinting');
            expect(result.answer).not.toContain('copy /b');
            expect(result.answer).not.toContain('LPT1');
            expect(result.answer).not.toContain('en güçlü eşleşme');
            expect(result.confidence).toBe('NO_MATCH');
            expect(result.suggestTicket).toBe(true);
            expect(mockPrismaService.aiInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    confidenceBand: null,
                    autoAnswered: false,
                    userContext: expect.objectContaining({
                        noKnowledgeAnswer: true,
                        source: null,
                    }),
                }),
            }));
        });

        it('returns safe crash/freeze triage instead of treating an unrelated high-scoring source as an answer', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'home-office-license',
                        sourceType: 'DOCUMENT',
                        title: 'FAQ_EN_Allplan_in_the_home-office',
                        content: 'Allplan in the home office. Workgroup Manager can be used over VPN. If licensing is unavailable, check CodeMeter and the local license file before starting Allplan.',
                        similarity: 0.96,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.96, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'Allplan kilitleniyor',
                wait: true,
                language: 'tr',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.confidence).toBe('LOW');
            expect(result.suggestTicket).toBe(true);
            expect(result.answer).toContain('Allplan’ın kilitlenmesi');
            expect(result.answer).toContain('Hotinfo');
            expect(result.answer).toContain('ekran kartı sürücüsü');
            expect(result.answer).not.toContain('CodeMeter');
            expect(result.answer).not.toContain('home-office');
            expect(mockPrismaService.aiInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    confidenceBand: 'LOW',
                    autoAnswered: false,
                    matchedArticleId: undefined,
                    userContext: expect.objectContaining({
                        safeOperationalTriage: true,
                        source: null,
                    }),
                }),
            }));
        });

        it('does not infer BIMPLUS storage limits from unrelated license telemetry evidence', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'home-office-license',
                        sourceType: 'DOCUMENT',
                        title: 'FAQ_EN_Allplan_in_the_home-office',
                        content: 'Allplan in the home office. Workgroup Manager can be used over VPN. If licensing is unavailable, check CodeMeter and the local license file before starting Allplan.',
                        similarity: 0.96,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.96, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'BIMPLUS depolama alanı yetersiz uyarısı alıyoruz',
                wait: true,
                language: 'tr',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('yeterince güvenilir ve doğrudan eşleşen içerik bulunamadı');
            expect(result.answer).not.toContain('Lisans dosyası okunamadı');
            expect(result.answer).not.toContain('CodeMeter');
            expect(result.answer).not.toContain('home-office');
            expect(result.answer).not.toContain('en güçlü eşleşme');
        });

        it('returns a safe localized fallback in the selected UI language when generation is unavailable', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'license-move',
                        sourceType: 'DOCUMENT',
                        title: 'FAQ_EN_Moving_license_server_to_a_new_server.pdf',
                        content: 'Moving license server to a new server. Return the license on the old server. Install license server on the new machine. Activate with Product Key. Verify Allplan clients connect to the new license server.',
                        similarity: 0.96,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.96, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            diagnosisService.analyze.mockResolvedValue({
                productId: null,
                productName: 'Allplan',
                categoryNames: ['Sistem, Lisans & Abonelik'],
                matchedKeywords: ['lisans', 'taşıma'],
                suggestedCauses: [],
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'Lisans sunucusunu yeni bir makineye taşımak istiyorum, süreç nedir?',
                wait: true,
                language: 'en',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('The knowledge base does not contain enough reliable information');
            expect(result.answer).not.toContain('## 📌 Sorun Yorumu');
            expect(result.answer).not.toContain('## 🛠️ Çözüm Adımları');
            expect(result.answer).not.toContain('FAQ_EN_Moving_license_server');
            expect(result.answer).not.toContain('best matching knowledge base');
            expect(mockAiService.reformat.mock.calls[0][0]).toContain('## 📌 Issue Summary');
            expect(mockAiService.reformat.mock.calls[0][0]).toContain('## 🛠️ Solution Steps');
        });

        it('persists the active UI language on the AI interaction for downstream admin drafts', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({
                role: { name: 'CUSTOMER' },
                language: 'de',
                fullName: 'Test User',
            });
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'loopback',
                        sourceType: 'DOCUMENT',
                        title: 'FAQ_EN_Loopback_adapter_for_Workgroup_Manager',
                        content: 'A loopback adapter is used for Workgroup Manager offline or standalone network scenarios. Run hdwwiz as administrator and install Microsoft KM-TEST Loopback Adapter.',
                        similarity: 0.96,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.96, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue({
                response: '## 📌 Issue Summary\nLoopback adapter guidance.\n\n## 🎯 Most Probable Cause\nNetwork dependency.\n\n## ⚠️ Critical Checks\n- Admin rights.\n\n## 🛠️ Solution Steps\n1. Run hdwwiz.\n\n## ✅ Verification\n- Check Device Manager.',
            });

            const result = await service.query({
                userQuery: 'When is a loopback adapter needed?',
                userId: 'user-1',
                wait: true,
                language: 'en',
                routeLocale: 'en',
                strictLanguage: true,
            });

            expect(result.responseLanguage).toBe('en');
            expect(mockPrismaService.aiInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    userContext: expect.objectContaining({
                        responseLanguage: 'en',
                        requestLocale: 'en',
                        routeLocale: 'en',
                        profileLanguage: 'de',
                        languageSource: 'ui',
                        strictLanguage: true,
                    }),
                }),
            }));
        });

        it('returns a structured English loopback fallback without leaking the source title', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'loopback',
                        sourceType: 'DOCUMENT',
                        title: 'FAQ_EN_Loopback_adapter_for_Workgroup_Manager',
                        content: 'Answer: A loopback adapter is used for Allplan Workgroup Manager when the workstation is disconnected from the network. Run hdwwiz as administrator. Select Network adapters, Microsoft, and Microsoft KM-TEST Loopback Adapter.',
                        similarity: 0.96,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.96, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'When is a loopback adapter needed for Workgroup Manager?',
                wait: true,
                language: 'en',
                strictLanguage: true,
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('## 📌 Issue Summary');
            expect(result.answer).toContain('Microsoft KM-TEST Loopback Adapter');
            expect(result.answer).not.toContain('FAQ_EN_Loopback_adapter');
            expect(result.answer).not.toContain('best matching knowledge base');
        });

        it('returns a Turkish actionable IFC fallback instead of raw headings when generation is unavailable', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'ifc-export',
                        sourceType: 'DOCUMENT',
                        title: '[Dataset] ifc_aktarim_el_kitabi.pdf',
                        content: `#### 2.2.2 IFC Export Stages

Allplan models can be exported via two menus.
Advanced IFC Export Settings consist of Exchange Profiles, Attribute Mapping, Coordinates and Length Parameters, Element Filter, and Advanced Options for geometry conversion, Quantity Data, and Elements.`,
                        similarity: 0.95,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.95, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'IFC aktarımında hangi ayarlar kritik?',
                wait: true,
                language: 'tr-TR',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('IFC aktarımında kritik kontroller');
            expect(result.answer).toContain('Alışveriş profilini');
            expect(result.answer).toContain('Nitelik atamasını');
            expect(result.answer).toContain('Eleman filtresini');
            expect(result.answer).not.toContain('Kaynak:');
            expect(result.answer).not.toContain('İlgili pasaj:');
            expect(result.answer).not.toContain('The model response was delayed');
            expect(result.answer).not.toContain('####');
        });

        it('does not produce IFC fallback from an unrelated licensing source', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'license-service',
                        sourceType: 'DOCUMENT',
                        title: 'FAQ_EN_Windows_service_for_licensing_is_blocked_by_virus_scanner',
                        content: 'Answer: If the Windows service for licensing is blocked by virus scanner, check CodeMeter runtime, antivirus exclusions, and licensing service access.',
                        similarity: 0.96,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.96, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'IFC aktarımında hangi ayarlar kritik?',
                wait: true,
                language: 'tr',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('yeterince güvenilir ve doğrudan eşleşen içerik bulunamadı');
            expect(result.answer).not.toContain('IFC aktarımında kritik kontroller');
            expect(result.answer).not.toContain('FAQ_EN_Windows_service_for_licensing');
            expect(result.answer).not.toContain('Kaynak:');
            expect(result.answer).not.toContain('en güçlü eşleşme');
        });

        it('does not expose source labels in staff deterministic fallback answers', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({ role: { name: 'ADMIN' } });
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'ifc-export',
                        sourceType: 'DOCUMENT',
                        title: '[Dataset] ifc_aktarim_el_kitabi.pdf',
                        content: 'IFC Export Settings include Exchange Profiles, Attribute Mapping, Coordinates and Length Parameters, Element Filter, and Advanced Options.',
                        similarity: 0.95,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.95, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'IFC aktarımında hangi ayarlar kritik?',
                userId: 'admin-1',
                wait: true,
                language: 'tr',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('IFC aktarımında kritik kontroller');
            expect(result.answer).not.toContain('Kaynak:');
            expect(result.answer).not.toContain('[Dataset] ifc_aktarim_el_kitabi.pdf');
        });

        it('returns a Turkish DWG/DXF fallback without leaking customer source details or drifting to IFC', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'mixed-ifc-dwg',
                        sourceType: 'DOCUMENT',
                        title: '[Dataset] ifc_aktarim_el_kitabi.pdf',
                        content: 'Example screenshots show how Allplan IFC export appears in Solibri, demonstrating the layer structure. DWG/DXF export should preserve layers and reference files when the export profile and XRef settings are checked.',
                        similarity: 0.95,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.95, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'DWG/DXF export sırasında layer ve referans dosyaları nasıl korunur?',
                wait: true,
                language: 'tr-TR',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('DWG/DXF aktarımında layer ve referans yapısını korumak');
            expect(result.answer).toContain('Export profilinde layer/katman eşlemesini');
            expect(result.answer).toContain('Referans dosyalar veya XRef');
            expect(result.answer).not.toContain('IFC aktarımında kritik kontroller');
            expect(result.answer).not.toContain('Kaynak:');
            expect(result.answer).not.toContain('İlgili pasaj:');
        });

        it('returns a Turkish Workgroup Manager fallback instead of leaking German source text', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'workgroup-de',
                        sourceType: 'DOCUMENT',
                        title: 'Allplan 2023',
                        content: 'So richten Sie eine Allplan Workgroup ein. Sie sind als Allplan Administrator angemeldet. Allplan 2023 ist auf allen Arbeitsplätzen installiert, die in die Workgroup aufgenommen werden sollen. Der Workgroupmanager ist aktiviert. Starten Sie Allmenu 2023.',
                        similarity: 0.95,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.95, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'Workgroup Manager’da bilgisayar eklenemiyor, sebep ne olabilir?',
                wait: true,
                language: 'tr-TR',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('Aluplan AI Destek');
            expect(result.answer).toContain('## 📌 Sorun Yorumu');
            expect(result.answer).toContain('Workgroup Manager’da bilgisayar ekleme');
            expect(result.answer).toContain('Allplan Administrator');
            expect(result.answer).toContain('DNS/isim çözümleme');
            expect(result.answer).not.toContain('So richten Sie');
            expect(result.answer).not.toContain('Arbeitsplätzen');
            expect(result.answer).not.toContain('İlgili pasaj:');
        });

        it('returns a structured customer-safe license borrowing fallback in the selected UI language when generation is unavailable', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'license-borrow',
                        sourceType: 'DOCUMENT',
                        title: 'FAQ_EN_License_server_-_borrowing_licenses_temporarily.pdf',
                        content: 'License server - borrowing licenses temporarily. Open Allmenu or Services application. Go to Utilities and License settings. Select the license in License selection. Choose the period in Borrow licenses for and click Borrow. To return it early, select End borrowing.',
                        similarity: 0.96,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.96, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'How do I borrow a license temporarily from the license server?',
                wait: true,
                language: 'tr-TR',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('geçici lisans ödünç almak');
            expect(result.answer).toContain('## 🛠️ Çözüm Adımları');
            expect(result.answer).toContain('License settings');
            expect(result.answer).toContain('Ausleihen');
            expect(result.answer).toContain('## ✅ Doğrulama');
            expect(result.answer).not.toContain('Kaynak:');
            expect(result.answer).not.toContain('İlgili pasaj:');
            expect(result.answer).not.toContain('License server - borrowing licenses temporarily.');
        });

        it('returns a structured English license borrowing fallback when the requested language is English', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'license-borrow',
                        sourceType: 'DOCUMENT',
                        title: 'FAQ_EN_License_server_-_borrowing_licenses_temporarily.pdf',
                        content: 'License server - borrowing licenses temporarily. Open Allmenu or Services application. Go to Utilities and License settings. Select the license in License selection. Choose the period in Borrow licenses for and click Borrow. To return it early, select End borrowing.',
                        similarity: 0.96,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.96, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'How do I borrow a license temporarily from the license server?',
                wait: true,
                language: 'en',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('## 🛠️ Solution Steps');
            expect(result.answer).toContain('License settings');
            expect(result.answer).toContain('Borrow / Ausleihen');
            expect(result.answer).toContain('## ✅ Verification');
            expect(result.answer).not.toContain('License server - borrowing licenses temporarily.');
        });

        it('returns a structured English generic fallback for license server installation failures', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'license-install-failed',
                        sourceType: 'DOCUMENT',
                        title: 'FAQ_EN_License_server_installation_failed.pdf',
                        content: `License server installation failed Technical Support FAQ Category: Technical Services->Licensing->Wibu Lizenzserver Programs: Allplan 2021 Document ID: 20160113164538 Internet: https://connect.allplan.com/en/faqid/20160113164538.html Question: During installation of license server the message appears installation failed. Answer: Check whether the Wibu CodeMeter Runtime is installed. Run the license server setup as administrator. Temporarily disable antivirus protection during installation if it blocks setup files. Check the installation log for the exact error message.`,
                        similarity: 0.96,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.96, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            diagnosisService.analyze.mockResolvedValue({
                productId: null,
                productName: 'Allplan',
                categoryNames: ['License Server & CodeMeter'],
                matchedKeywords: ['license', 'server', 'wibu', 'installation'],
                suggestedCauses: [],
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'What should I check if license server installation failed?',
                wait: true,
                language: 'en',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('## 📌 Problem Interpretation');
            expect(result.answer).toContain('## ⚠️ Critical Checks');
            expect(result.answer).toContain('## 🛠️ Solution Steps');
            expect(result.answer).toContain('CodeMeter');
            expect(result.answer).toContain('administrator');
            expect(result.answer).not.toContain('[Dataset]');
            expect(result.answer).not.toContain('FAQ_EN_License_server_installation_failed.pdf');
            expect(result.answer).not.toContain('Document ID');
            expect(result.answer).not.toContain('https://');
            expect(result.answer).not.toContain('most relevant excerpts');
        });

        it('uses diagnosis keywords when selecting generic fallback evidence', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'generic-license',
                        sourceType: 'DOCUMENT',
                        title: 'General license server notes',
                        content: 'License server setup includes many unrelated notes.',
                        similarity: 0.96,
                        confidence: 'HIGH',
                    },
                    {
                        articleId: 'access-rights',
                        sourceType: 'FAQ',
                        title: 'License server - assigning access rights for seats to individual users',
                        content: 'Answer: Open CodeMeter WebAdmin and go to Server access permissions. Assign the required users or groups to the license seats. Deny access for users who should not select those seats. Restart or refresh the license service if changes are not visible.',
                        similarity: 0.82,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.96, passedThreshold: 2, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            diagnosisService.analyze.mockResolvedValue({
                productId: null,
                productName: 'Allplan',
                categoryNames: ['License Server & CodeMeter'],
                matchedKeywords: ['access rights', 'seats', 'users', 'license server'],
                suggestedCauses: [],
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'How can I assign license server access rights to individual users?',
                wait: true,
                language: 'en',
            });

            expect(result.answerMode).toBe('FALLBACK');
            expect(result.answer).toContain('Server access permissions');
            expect(result.answer).toContain('users or groups');
            expect(result.answer).not.toContain('General license server notes');
            expect(result.answer).not.toContain('most relevant excerpts');
        });

        it('keeps Hotinfo error traces out of the retrieval query', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [{
                    articleId: 'slow-faq',
                    sourceType: 'DOCUMENT',
                    title: 'Allplan is running slow',
                    content: 'If Allplan takes several minutes to start, name resolution on the network may not work.',
                    similarity: 0.95,
                    confidence: 'HIGH',
                }],
                diagnostics: { topScore: 0.95, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            await service.query({
                userQuery: 'Allplan açılışta birkaç dakika bekliyor, ağ veya isim çözümleme kaynaklı olabilir mi?',
                wait: true,
                language: 'tr',
                hotinfoContext: {
                    osVersion: 'Windows 11',
                    gpu: 'NVIDIA RTX',
                    errorTrace: 'SEC Hata: C:\\ProgramData\\Nemetschek\\Allplan\\2026\\License\\_SEC.NSE',
                },
            });

            const searchArg = mockEmbeddingService.search.mock.calls[0][0] as string;
            expect(searchArg).not.toContain('_SEC.NSE');
            expect(searchArg).not.toContain('License');
            expect(searchArg).not.toContain('Lisans');
            expect(searchArg).toContain('isim çözümleme');
        });

        it('adds safe Hotinfo signals for explicit Hotinfo analysis without leaking raw traces', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [{
                    articleId: 'performance-faq',
                    sourceType: 'DOCUMENT',
                    title: 'Allplan performance diagnostics',
                    content: 'Check graphics driver, security software, and system requirements.',
                    similarity: 0.95,
                    confidence: 'HIGH',
                }],
                diagnostics: { topScore: 0.95, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            await service.query({
                userQuery: 'Hotinfo dosyamı analiz eder misin?',
                wait: true,
                language: 'tr',
                hotinfoContext: {
                    allplanVersion: '2026',
                    osVersion: 'Windows 11',
                    gpu: 'NVIDIA RTX 4070',
                    gpuDriverVersion: '551.86',
                    securityServices: ['Windows Defender'],
                    conflictingProcesses: ['onedrive.exe'],
                    errorTrace: 'SEC Hata: C:\\ProgramData\\Nemetschek\\Allplan\\2026\\License\\_SEC.NSE',
                },
            });

            const searchArg = mockEmbeddingService.search.mock.calls[0][0] as string;
            expect(searchArg).toContain('HOTINFO SAFE SEARCH SIGNALS');
            expect(searchArg).toContain('Windows 11');
            expect(searchArg).toContain('NVIDIA RTX 4070');
            expect(searchArg).toContain('Windows Defender');
            expect(searchArg).toContain('onedrive.exe');
            expect(searchArg).toContain('Hotinfo hata kaydi mevcut');
            expect(searchArg).not.toContain('_SEC.NSE');
            expect(searchArg).not.toContain('License');
            expect(searchArg).not.toContain('Lisans');
        });

        it('adds Hotinfo version and low-trust license signals for license retrieval without leaking sensitive fields', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [{
                    articleId: 'license-transfer',
                    sourceType: 'DOCUMENT',
                    title: 'License transfer with CodeMeter',
                    content: 'Return the Product Key license and activate it on the new computer.',
                    similarity: 0.91,
                    confidence: 'HIGH',
                }],
                diagnostics: { topScore: 0.91, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            await service.query({
                userQuery: 'Bilgisayarıma format attım, lisansımı yeni bilgisayarıma nasıl aktarabilirim?',
                wait: true,
                language: 'tr',
                hotinfoContext: {
                    allplanVersion: 'Allplan 2026-1-3 Unicode 64-bit',
                    allplanBuildId: '39.1613.8530.664',
                    licenseType: '⚠ Lisans dosyası okunamadı',
                    hotinfoLicense: '1014361a',
                    errorTrace: 'SEC Hata: C:\\ProgramData\\Nemetschek\\Allplan\\2026\\License\\_SEC.NSE',
                },
            });

            const searchArg = mockEmbeddingService.search.mock.calls[0][0] as string;
            expect(searchArg).toContain('HOTINFO SAFE SEARCH SIGNALS');
            expect(searchArg).toContain('Allplan 2026-1-3');
            expect(searchArg).toContain('Allplan build id: 39.1613.8530.664');
            expect(searchArg).toContain('dusuk guvenli legacy sinyal');
            expect(searchArg).not.toContain('1014361a');
            expect(searchArg).not.toContain('_SEC.NSE');
            expect(searchArg).not.toContain('C:\\ProgramData');
        });

        it('demotes license sources for network startup questions when the query is not about licensing', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({ role: { name: 'ADMIN' } });
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'license-offline',
                        sourceType: 'DOCUMENT',
                        title: 'License server activating a license offline',
                        category: 'License & Activation',
                        content: 'License server setup and CodeMeter activation instructions for offline licensing.',
                        similarity: 0.93,
                        confidence: 'HIGH',
                    },
                    {
                        articleId: 'network-startup',
                        sourceType: 'DOCUMENT',
                        title: 'Allplan is running slow',
                        category: 'Performance & Hardware',
                        content: 'Name resolution on the network If Allplan takes several minutes to start, name resolution may not work.',
                        similarity: 0.88,
                        confidence: 'HIGH',
                    },
                    {
                        articleId: 'workgroup-network',
                        sourceType: 'DOCUMENT',
                        title: 'Workgroup manager network setup',
                        category: 'Network & Workgroup',
                        content: 'Network server and DNS checks for Allplan startup in workgroup environments.',
                        similarity: 0.82,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.93, passedThreshold: 3, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'Allplan açılışta birkaç dakika bekliyor, ağ veya isim çözümleme kaynaklı olabilir mi?',
                wait: true,
                language: 'tr',
                userId: 'admin-1',
            });

            expect(result.sources.map((source: { articleId: string }) => source.articleId)).toEqual([
                'network-startup',
                'workgroup-network',
                'license-offline',
            ]);
        });

        it('prioritizes Workgroup checkout evidence over unrelated high-scoring manuals', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({ role: { name: 'ADMIN' } });
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'visual-scripting',
                        sourceType: 'DOCUMENT',
                        title: 'Allplan_2020_eL_VisualScripting',
                        category: 'Manuals & Tutorials',
                        content: 'Visual scripting examples for nodes, graphs, and automation workflows in Allplan.',
                        similarity: 0.91,
                        confidence: 'HIGH',
                    },
                    {
                        articleId: 'workgroup-checkout',
                        sourceType: 'DOCUMENT',
                        title: 'Allplan 2023 Workgroupmanager',
                        category: 'Network & Workgroup',
                        content: 'Projekte und Benutzerordner können auf allen Arbeitsplätzen im Netzwerk abgelegt werden, die im Workgroupmanager aufgenommen wurden. Über Allmenu - Workgroupmanager - Benutzer verwalten können Benutzerordner verschoben werden. *.lck Dateien steuern den Projektzugriff.',
                        similarity: 0.78,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.91, passedThreshold: 2, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue(null);

            const result = await service.query({
                userQuery: 'Workgroup ortamında bilgisayarı checkout edip dışarıda çalışabilir miyim?',
                wait: true,
                language: 'tr',
                userId: 'admin-1',
            });

            expect(result.sources.map((source: { articleId: string }) => source.articleId)).toEqual([
                'workgroup-checkout',
                'visual-scripting',
            ]);
            expect(result.answer).toContain('Workgroup');
            expect(result.answer).toMatch(/dışarıda çalışma/i);
            expect(result.answer).not.toContain('Visual scripting');
        });

        it('overrides no-knowledge LLM output when reliable context was retrieved', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'license-access',
                        sourceType: 'DOCUMENT',
                        title: 'Allplan License Server Access Rights',
                        category: 'License & Activation',
                        content: 'CodeMeter WebAdmin lisans sunucusunda kullanıcı, bilgisayar veya IP bazlı erişim kuralları tanımlanabilir.',
                        similarity: 0.86,
                        confidence: 'HIGH',
                    },
                ],
                diagnostics: { topScore: 0.86, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue({
                response: 'Bu konu mevcut bilgi kaynağında yer almıyor. Lütfen destek talebi oluşturunuz.',
            });

            const result = await service.query({
                userQuery: 'Lisans sunucusunda erişim haklarını kullanıcı bazlı nasıl ayarlarım?',
                wait: true,
                language: 'tr',
                userId: null,
            });

            expect(result.answer).toContain('Lisans sunucusunda kullanıcı bazlı erişim');
            expect(result.answer).toContain('CodeMeter');
            expect(result.answer).not.toContain('Bu konu mevcut bilgi kaynağında yer almıyor');
            expect(result.answerMode).toBe('FALLBACK');
        });

        it('repairs LLM answers that leak Turkish prose into an English UI answer', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockEmbeddingService.search.mockResolvedValue({
                results: [
                    {
                        articleId: 'license-upgrade',
                        sourceType: 'DOCUMENT',
                        title: 'FAQ_EN_First_steps_-_activating_the_license_using_the_Product_Key',
                        category: 'License & Activation',
                        content: 'When upgrading Allplan, activate the license using the Product Key and verify the license status in License Settings.',
                        similarity: 0.96,
                        confidence: 'HIGH',
                        language: 'en',
                    },
                ],
                diagnostics: { topScore: 0.96, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue({
                response: [
                    '## 📌 Issue Summary',
                    'Kullanıcı, Allplan 2024 yükseltmesinde lisansların nasıl yönetileceğini soruyor.',
                    '',
                    '## 🎯 Most Probable Cause',
                    'Bu prosedürel bir lisans aktivasyonu sorusudur.',
                    '',
                    '## ⚠️ Critical Checks',
                    '- Ürün anahtarını kontrol edin.',
                    '',
                    '## 🛠️ Solution Steps',
                    '1. Lisans ayarlarını açın ve ürün anahtarını doğrulayın.',
                    '',
                    '## ✅ Verification',
                    '- Lisansın etkin olduğunu doğrulayın.',
                ].join('\n'),
            });
            mockAiService.generate
                .mockResolvedValueOnce('{"rankings":[]}')
                .mockResolvedValueOnce([
                    '## 📌 Issue Summary',
                    'The user asks how to manage licenses during an Allplan 2024 upgrade.',
                    '',
                    '## 🎯 Most Probable Cause',
                    'This is a procedural license activation question.',
                    '',
                    '## ⚠️ Critical Checks',
                    '- Check the Product Key and license activation status.',
                    '',
                    '## 🛠️ Solution Steps',
                    '1. Open License Settings and verify the Product Key activation.',
                    '',
                    '## ✅ Verification',
                    '- Confirm that the license is active.',
                ].join('\n'));

            const result = await service.query({
                userQuery: 'How should licenses be handled when upgrading to Allplan 2024?',
                wait: true,
                language: 'en',
                strictLanguage: true,
            });

            expect(result.answerMode).toBe('LLM');
            expect(result.languageMismatch).toBe(true);
            expect(result.answer).toContain('The user asks how to manage licenses');
            expect(result.answer).not.toContain('Kullanıcı');
            expect(mockAiService.generate).toHaveBeenCalledWith(expect.stringContaining('Rewrite the support answer below entirely in English.'), 12000);
            expect(mockPrismaService.aiInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    userContext: expect.objectContaining({
                        answerLanguageRepaired: true,
                        answerLanguageMismatch: true,
                    }),
                }),
            }));
        });
    });

    describe('submitTelemetry', () => {
        it('should update aiInteraction with accepted status', async () => {
            mockPrismaService.aiInteraction.findUnique.mockResolvedValue({ id: 'int-1', userId: 'user-1' });
            mockPrismaService.aiInteraction.update.mockResolvedValue({ id: 'int-1', isAccepted: true });

            await service.submitTelemetry('int-1', 'user-1', true, 'edited response');

            expect(mockPrismaService.aiInteraction.findUnique).toHaveBeenCalledWith({
                where: { id: 'int-1' },
                select: { id: true, userId: true },
            });

            expect(mockPrismaService.aiInteraction.update).toHaveBeenCalledWith({
                where: { id: 'int-1' },
                data: { isAccepted: true, editedResponse: 'edited response' },
            });
        });

        it('should reject telemetry updates for another user interaction', async () => {
            mockPrismaService.aiInteraction.findUnique.mockResolvedValue({ id: 'int-1', userId: 'owner-1' });

            await expect(service.submitTelemetry('int-1', 'attacker-1', true, 'edited response'))
                .rejects.toThrow('AI_INTERACTION_FORBIDDEN');

            expect(mockPrismaService.aiInteraction.update).not.toHaveBeenCalled();
        });

        it('should reject telemetry updates when the interaction does not exist', async () => {
            mockPrismaService.aiInteraction.findUnique.mockResolvedValue(null);

            await expect(service.submitTelemetry('missing', 'user-1', true))
                .rejects.toThrow('AI_INTERACTION_NOT_FOUND');

            expect(mockPrismaService.aiInteraction.update).not.toHaveBeenCalled();
        });
    });

    describe('event-driven cache invalidation (debounced)', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('advances the shared knowledge epoch immediately, then debounces physical cache cleanup', async () => {
            await Promise.all([
                service.handleArticleChange({}),
                service.handleKnowledgePoolChange({}),
                service.handleFaqChange({}),
            ]);

            expect(semanticCache.advanceKnowledgeEpoch).toHaveBeenCalledTimes(3);
            expect(semanticCache.purgeAll).not.toHaveBeenCalled();

            // Fast-forward timers by 500ms -> should not have called invalidate yet
            await jest.advanceTimersByTimeAsync(500);
            expect(semanticCache.purgeAll).not.toHaveBeenCalled();

            // Fast-forward another 500ms -> total 1000ms, should trigger invalidation once
            await jest.advanceTimersByTimeAsync(500);
            expect(semanticCache.purgeAll).toHaveBeenCalledTimes(1);
        });

        it('disables cache reads and writes when the durable epoch cannot advance', async () => {
            semanticCache.advanceKnowledgeEpoch.mockRejectedValueOnce(new Error('settings unavailable'));

            await service.handleFaqChange({ faqId: 'faq-1' });

            expect(semanticCache.purgeAll).toHaveBeenCalledTimes(1);
            await expect((service as any).getKnowledgeCacheEpoch()).resolves.toBeNull();

            await service.handleArticleChange({ articleId: 'article-1' });

            await expect((service as any).getKnowledgeCacheEpoch()).resolves.toBe('0');
        });

        it('rejects an epoch read that resolves after an invalidation cycle', async () => {
            let resolveEpoch!: (epoch: string) => void;
            semanticCache.getKnowledgeEpoch.mockImplementationOnce(() => new Promise<string>((resolve) => {
                resolveEpoch = resolve;
            }));

            const staleRead = (service as any).getKnowledgeCacheEpoch();
            await Promise.resolve();
            await service.handleFaqChange({ faqId: 'faq-1' });
            resolveEpoch('stale-epoch');

            await expect(staleRead).resolves.toBeNull();
        });

        it('does not let an older successful invalidation recover a newer failed one', async () => {
            let resolveOlder!: (epoch: string) => void;
            let rejectNewer!: (error: Error) => void;
            semanticCache.advanceKnowledgeEpoch
                .mockImplementationOnce(() => new Promise<string>((resolve) => {
                    resolveOlder = resolve;
                }))
                .mockImplementationOnce(() => new Promise<string>((_resolve, reject) => {
                    rejectNewer = reject;
                }));

            const older = service.handleArticleChange({ articleId: 'article-1' });
            const newer = service.handleFaqChange({ faqId: 'faq-1' });
            rejectNewer(new Error('newer invalidation failed'));
            await newer;
            resolveOlder('older-success');
            await older;

            await expect((service as any).getKnowledgeCacheEpoch()).resolves.toBeNull();
        });
    });

    describe('queryInternal — Shift Detection Block', () => {
        /** Shared helper: set up a HIGH-confidence embedding result so the pipeline
         *  reaches the interaction-creation step and returns a valid AiQueryResult. */
        function setupHighConfidenceEmbedding() {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockEmbeddingService.search.mockResolvedValue({
                results: [{
                    articleId: 'art-1', sourceType: 'ARTICLE', title: 'Test',
                    content: 'Content', similarity: 0.95, confidence: 'HIGH',
                }],
                diagnostics: { topScore: 0.95, passedThreshold: 1, queryEmbeddingModel: 'test', thresholdUsed: 0.72 },
            });
            mockAiService.reformat.mockResolvedValue({ response: 'AI answer', model: 'gpt-4o-mini' });
            mockAiService.generate.mockResolvedValue('{"rankings": [{"id": 0, "score": 90}]}');
        }

        it('should still return a valid AiQueryResult when DB write throws', async () => {
            // Arrange
            mockPrismaService.aiShiftDetection.create.mockRejectedValue(new Error('DB error'));
            jest.spyOn(diagnosisService, 'analyze').mockResolvedValue({
                isProblemShift: true,
                categoryNames: [],
                matchedKeywords: ['keyword1'],
                productName: 'Test',
            } as any);
            setupHighConfidenceEmbedding();

            // Act
            const result = await service.queryInternal({
                userQuery: 'test',
                history: [{ role: 'user', content: 'prev' }],
            });

            // Assert — pipeline must complete despite DB failure
            expect(result).toBeDefined();
            expect(result.query).toBeDefined();
            expect(result.confidence).toBeDefined();
            expect(result.interactionId).toBeDefined();
        });

        it('should still return a valid AiQueryResult when Langfuse addEvent throws', async () => {
            // Arrange
            mockLangfuseService.addEvent.mockRejectedValue(new Error('Langfuse error'));
            jest.spyOn(diagnosisService, 'analyze').mockResolvedValue({
                isProblemShift: true,
                categoryNames: [],
                matchedKeywords: ['keyword1'],
                productName: 'Test',
            } as any);
            setupHighConfidenceEmbedding();

            // Act
            const result = await service.queryInternal({
                userQuery: 'test',
                history: [{ role: 'user', content: 'prev' }],
            });

            // Assert — pipeline must complete despite Langfuse failure
            expect(result).toBeDefined();
            expect(result.query).toBeDefined();
            expect(result.confidence).toBeDefined();
            expect(result.interactionId).toBeDefined();
        });

        it('should NOT call prisma.aiShiftDetection.create when isProblemShift=false', async () => {
            // Arrange
            jest.spyOn(diagnosisService, 'analyze').mockResolvedValue({
                isProblemShift: false,
                categoryNames: [],
                matchedKeywords: [],
                productName: 'Test',
            } as any);
            setupHighConfidenceEmbedding();

            // Act
            await service.queryInternal({
                userQuery: 'test',
                history: [{ role: 'user', content: 'prev' }],
            });

            // Assert — shift log must NOT be written when no shift detected
            expect(mockPrismaService.aiShiftDetection.create).not.toHaveBeenCalled();
        });

        it('should resolve with a valid AiQueryResult when options.history is undefined', async () => {
            // Arrange — no history provided; history clearing step should be skipped
            jest.spyOn(diagnosisService, 'analyze').mockResolvedValue({
                isProblemShift: true,
                categoryNames: [],
                matchedKeywords: ['keyword1'],
                productName: 'Test',
            } as any);
            setupHighConfidenceEmbedding();

            // Act — no history field passed
            const result = await service.queryInternal({ userQuery: 'test' });

            // Assert — pipeline must not crash and must return a valid result
            expect(result).toBeDefined();
            expect(result.query).toBeDefined();
            expect(result.confidence).toBeDefined();
            expect(result.interactionId).toBeDefined();
        });
    });

    describe('normalizeImageAttachments', () => {
        // Access the private method via type cast
        const callNormalize = (svc: AiQueryService, attachments: any[]) =>
            (svc as any).normalizeImageAttachments(attachments);

        it('URL-based image → StorageService.getFile() called, result is inlineData part', async () => {
            const fakeBuffer = Buffer.from('fake-image-data');
            mockStorageService.getFile.mockResolvedValue(fakeBuffer);

            const result = await callNormalize(service, [
                { mimeType: 'image/png', url: 'uploads/test.png' },
            ]);

            expect(mockStorageService.getFile).toHaveBeenCalledWith('uploads/test.png');
            expect(result).toHaveLength(1);
            expect(result[0].inlineData).toBeDefined();
            expect(result[0].inlineData.mimeType).toBe('image/png');
            expect(result[0].inlineData.data).toBe(fakeBuffer.toString('base64'));
            expect(result[0].fileData).toBeUndefined();
        });

        it('StorageService.getFile() throws → attachment skipped, no exception propagated', async () => {
            mockStorageService.getFile.mockRejectedValue(new Error('S3 connection failed'));

            const result = await callNormalize(service, [
                { mimeType: 'image/jpeg', url: 'uploads/error.jpg' },
            ]);

            expect(result).toHaveLength(0);
        });

        it('StorageService.getFile() returns null → attachment skipped', async () => {
            mockStorageService.getFile.mockResolvedValue(null);

            const result = await callNormalize(service, [
                { mimeType: 'image/png', url: 'uploads/missing.png' },
            ]);

            expect(result).toHaveLength(0);
        });

        it('Already-data attachment → pass-through, StorageService NOT called', async () => {
            const base64Data = Buffer.from('inline-image').toString('base64');

            const result = await callNormalize(service, [
                { mimeType: 'image/png', data: base64Data },
            ]);

            expect(mockStorageService.getFile).not.toHaveBeenCalled();
            expect(result).toHaveLength(1);
            expect(result[0].inlineData).toEqual({ mimeType: 'image/png', data: base64Data });
        });

        it('Mixed array (image with URL + non-image) → correct inlineData count, zero fileData parts', async () => {
            const fakeBuffer = Buffer.from('image-bytes');
            mockStorageService.getFile.mockResolvedValue(fakeBuffer);

            const result = await callNormalize(service, [
                { mimeType: 'image/png', url: 'uploads/img.png' },
                { mimeType: 'application/pdf', url: 'uploads/doc.pdf' },
                { mimeType: 'text/plain', data: 'dGV4dA==' },
            ]);

            // Only the image/png with url should produce an inlineData part
            expect(result).toHaveLength(1);
            expect(result[0].inlineData).toBeDefined();
            expect(result.every((p: { fileData?: unknown }) => !p.fileData)).toBe(true);
        });

        it('StorageService.getFile() returns empty buffer → attachment skipped', async () => {
            mockStorageService.getFile.mockResolvedValue(Buffer.alloc(0));

            const result = await callNormalize(service, [
                { mimeType: 'image/png', url: 'uploads/empty.png' },
            ]);

            expect(result).toHaveLength(0);
        });
    });

    describe('streamQuery', () => {
        async function* asyncChunks(chunks: string[]) {
            for (const c of chunks) yield c;
        }

        beforeEach(() => {
            // Default: no cache, HIGH confidence search result
            mockRedisService.get.mockResolvedValue(null);
            mockEmbeddingService.search.mockResolvedValue({
                results: [{
                    articleId: 'a1', title: 'Article', similarity: 0.92,
                    content: 'relevant context', confidence: 'HIGH', sourceType: 'ARTICLE',
                }],
                diagnostics: { topScore: 0.92 },
            });
            mockAiService.streamReformat.mockReturnValue(asyncChunks(['hello ', 'world']));
        });

        it('should yield cached chunk and return early on stream cache hit', async () => {
            mockRedisService.get.mockResolvedValue('cached stream answer');

            const chunks: any[] = [];
            for await (const c of service.streamQuery({
                userQuery: 'test query',
                userId: '11111111-1111-4111-8111-111111111111',
            })) {
                chunks.push(c);
            }

            expect(chunks).toEqual([{ chunk: 'cached stream answer' }]);
            expect(mockRedisService.get).toHaveBeenCalledWith(expect.stringContaining(':0:'));
            expect(mockEmbeddingService.search).not.toHaveBeenCalled();
        });

        it('should yield done with suggestTicket=true when topScore is below threshold', async () => {
            mockEmbeddingService.search.mockResolvedValue({
                results: [],
                diagnostics: { topScore: 0.10 },
            });

            const chunks: any[] = [];
            for await (const c of service.streamQuery({ userQuery: 'unknown topic' })) {
                chunks.push(c);
            }

            const doneChunk = chunks.find(c => c.done === true);
            expect(doneChunk).toBeDefined();
            expect(doneChunk.suggestTicket).toBe(true);
            expect(mockAiService.streamReformat).not.toHaveBeenCalled();
        });

        it('should stream text chunks then yield done with interactionId on HIGH confidence', async () => {
            const chunks: any[] = [];
            for await (const c of service.streamQuery({ userQuery: 'how do I reset my password' })) {
                chunks.push(c);
            }

            const textChunks = chunks.filter(c => c.chunk !== undefined && !c.done);
            const doneChunk = chunks.find(c => c.done === true);

            expect(textChunks.length).toBeGreaterThan(0);
            expect(textChunks.map(c => c.chunk).join('')).toBe('hello world');
            expect(doneChunk).toBeDefined();
            expect(doneChunk.interactionId).toBe('int-1');
            expect(doneChunk.suggestTicket).toBe(false);
        });

        it('should pass history through rewriteQueryWithHistory and call embeddingService.search', async () => {
            const history = [
                { role: 'user' as const, content: 'previous question' },
                { role: 'assistant' as const, content: 'previous answer' },
            ];

            const chunks: any[] = [];
            for await (const c of service.streamQuery({ userQuery: 'follow up', history })) {
                chunks.push(c);
            }

            // embeddingService.search must be called with the HyDE document (not the raw query)
            expect(mockEmbeddingService.search).toHaveBeenCalledTimes(1);
            // The search arg is the hypothetical doc — verify it's a non-empty string
            const searchArg = mockEmbeddingService.search.mock.calls[0][0];
            expect(typeof searchArg).toBe('string');
            expect(searchArg.length).toBeGreaterThan(0);
        });
    });
});
