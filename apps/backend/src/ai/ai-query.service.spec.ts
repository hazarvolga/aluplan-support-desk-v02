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


describe('AiQueryService', () => {
    let service: AiQueryService;
    let prisma: any;
    let aiService: any;
    let embeddingService: any;
    let redis: any;
    let diagnosisService: any;
    let storageService: any;

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
        getClient: jest.fn(() => ({
            get: jest.fn().mockResolvedValue(null),
            mget: jest.fn().mockResolvedValue([]),
            incrbyfloat: jest.fn().mockResolvedValue(1.0),
            incr: jest.fn().mockResolvedValue(1),
            expire: jest.fn().mockResolvedValue(1),
        })),
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
                { provide: AiSemanticCache, useValue: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue(undefined) } },
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
            expect(result.answer).toContain('Bu konu mevcut bilgi kaynağında yer almıyor');
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
            expect(result.answer).toContain('Use the certified graphics driver package.');
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
            mockAiService.reformat.mockResolvedValue({ response: 'Use the certified GPU driver package.' });

            const result = await service.query({ userQuery: 'How do I update the graphics driver?', wait: true });

            expect(result.answerMode).toBe('LLM');
            expect(mockAiService.generate).not.toHaveBeenCalled();
            expect(mockAiService.reformat).toHaveBeenCalledTimes(1);
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

        it('answers a Turkish customer question in Turkish even when the UI locale is English', async () => {
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
            expect(result.answer).toContain('## 📌 Sorun Yorumu');
            expect(result.answer).toContain('## 🛠️ Çözüm Adımları');
            expect(result.answer).not.toContain('## 📌 Problem Interpretation');
            expect(result.answer).not.toContain('## 🛠️ Solution Steps');
            expect(mockAiService.reformat.mock.calls[0][0]).toContain('## 📌 Sorun Yorumu');
            expect(mockAiService.reformat.mock.calls[0][0]).toContain('## 🛠️ Çözüm Adımları');
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
            expect(result.answer).toContain('## 📌 Sorun Yorumu');
            expect(result.answer).toContain('Workgroup Manager’da bilgisayar ekleme');
            expect(result.answer).toContain('Allplan Administrator');
            expect(result.answer).toContain('DNS/isim çözümleme');
            expect(result.answer).not.toContain('So richten Sie');
            expect(result.answer).not.toContain('Arbeitsplätzen');
            expect(result.answer).not.toContain('İlgili pasaj:');
        });

        it('returns a structured customer-safe license borrowing fallback in the query language when generation is unavailable', async () => {
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
            expect(result.answer).toContain('temporarily borrow an Allplan license');
            expect(result.answer).toContain('## 🛠️ Solution Steps');
            expect(result.answer).toContain('License settings');
            expect(result.answer).toContain('Ausleihen');
            expect(result.answer).toContain('## ✅ Verification');
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

            expect(result.sources.map(source => source.articleId)).toEqual([
                'network-startup',
                'workgroup-network',
                'license-offline',
            ]);
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
            expect(result.every(p => !p.fileData)).toBe(true);
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
            for await (const c of service.streamQuery({ userQuery: 'test query' })) {
                chunks.push(c);
            }

            expect(chunks).toEqual([{ chunk: 'cached stream answer' }]);
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
