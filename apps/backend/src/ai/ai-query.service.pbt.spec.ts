/**
 * Property-Based Tests: AiQueryService.streamQuery()
 * Feature: rag-faq-improvements
 * Property 5: streamQuery erken sonlandırma
 * Property 6: query() ve streamQuery() threshold tutarlılığı
 */
import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { AiQueryService } from './ai-query.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { ConfigService } from '@nestjs/config';
import { PromptContextBuilderService } from './prompt-context-builder.service';
import { PromptsService } from './prompts.service';
import { SettingsService } from '../settings/settings.service';
import { RagObservabilityService } from './rag-observability.service';
import { AiDiagnosisService } from './ai-diagnosis.service';
import { DocumentParserService } from '../common/services/document-parser.service';
import { MetricsService } from '../metrics/metrics.service';
import { getQueueToken } from '@nestjs/bullmq';
import { LangfuseService } from './langfuse.service';
import { RedisService } from '../redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StorageService } from '../common/services/storage.service';
import { AiSemanticCache } from './ai-semantic-cache.service';

const LOW_CONFIDENCE_THRESHOLD = 0.72;

const mockPrisma = {
    aiInteraction: { create: jest.fn().mockResolvedValue({ id: 'test-id' }) },
    user: { findUnique: jest.fn().mockResolvedValue(null) },
};

const mockAiService = {
    streamReformat: jest.fn(),
    getActiveProviderName: jest.fn().mockResolvedValue('openai'),
    getActiveModelName: jest.fn().mockResolvedValue('gpt-4o-mini'),
};

const mockEmbeddingService = {
    search: jest.fn(),
};

const mockConfig = { get: jest.fn((key: string, def: string) => def) };
const mockPromptContext = { buildContext: jest.fn().mockResolvedValue('context') };
const mockPrompts = { getPrompt: jest.fn().mockResolvedValue('system prompt') };
const mockSettings = { getValue: jest.fn().mockResolvedValue(null) };
const mockLangfuse = { trace: jest.fn() };
const mockRedis = { get: jest.fn().mockResolvedValue(null), set: jest.fn() };

describe('AiQueryService.streamQuery() — Property-Based Tests', () => {
    let service: AiQueryService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiQueryService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: AiService, useValue: mockAiService },
                { provide: EmbeddingService, useValue: mockEmbeddingService },
                { provide: ConfigService, useValue: mockConfig },
                { provide: PromptContextBuilderService, useValue: mockPromptContext },
                { provide: PromptsService, useValue: mockPrompts },
                { provide: SettingsService, useValue: mockSettings },
                { provide: LangfuseService, useValue: mockLangfuse },
                { provide: RedisService, useValue: mockRedis },
                { provide: RagObservabilityService, useValue: { recordQuery: jest.fn() } },
                { provide: AiDiagnosisService, useValue: { analyze: jest.fn().mockResolvedValue({ categoryNames: [], matchedKeywords: [] }) } },
                { provide: DocumentParserService, useValue: { parse: jest.fn() } },
                { provide: MetricsService, useValue: { increment: jest.fn(), gauge: jest.fn(), recordCacheOp: jest.fn() } },
                { provide: StorageService, useValue: { getFile: jest.fn().mockResolvedValue(null) } },
                { provide: AiSemanticCache, useValue: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue(undefined) } },
                { provide: getQueueToken('ai-query-processing'), useValue: {} },
            ],
        }).compile();
        service = module.get(AiQueryService);
    });

    // Feature: rag-faq-improvements, Property 5: streamQuery erken sonlandırma
    it('P5: topScore < LOW_CONFIDENCE_THRESHOLD olduğunda LLM çağrısı yapılmaz ve suggestTicket=true döner', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.float({ min: 0, max: Math.fround(LOW_CONFIDENCE_THRESHOLD - 0.001), noNaN: true }),
                async (topScore) => {
                    mockEmbeddingService.search.mockResolvedValue({
                        results: [],
                        diagnostics: { topScore, passedThreshold: 0, queryEmbeddingModel: 'test', thresholdUsed: 0.78 },
                    });

                    const chunks: any[] = [];
                    for await (const chunk of service.streamQuery({ userQuery: 'test query' })) {
                        chunks.push(chunk);
                    }

                    expect(mockAiService.streamReformat).not.toHaveBeenCalled();
                    expect(chunks.some(c => c.done === true && c.suggestTicket === true)).toBe(true);
                },
            ),
            { numRuns: 100 },
        );
    });

    // Feature: rag-faq-improvements, Property 5: boş sonuç durumunda da erken sonlandırma
    it('P5: results.length === 0 olduğunda da erken sonlandırma uygulanır', async () => {
        mockEmbeddingService.search.mockResolvedValue({
            results: [],
            diagnostics: { topScore: 0, passedThreshold: 0, queryEmbeddingModel: 'test', thresholdUsed: 0.78 },
        });

        const chunks: any[] = [];
        for await (const chunk of service.streamQuery({ userQuery: 'test query' })) {
            chunks.push(chunk);
        }

        expect(mockAiService.streamReformat).not.toHaveBeenCalled();
        expect(chunks.some(c => c.done === true && c.suggestTicket === true)).toBe(true);
    });

    // Feature: rag-faq-improvements, Property 5: erken sonlandırmada aiInteraction kaydı oluşturulur
    it('P5: erken sonlandırmada aiInteraction autoAnswered=false ve confidenceBand=null ile kaydedilir', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.float({ min: 0, max: Math.fround(LOW_CONFIDENCE_THRESHOLD - 0.001), noNaN: true }),
                async (topScore) => {
                    mockPrisma.aiInteraction.create.mockClear();
                    mockEmbeddingService.search.mockResolvedValue({
                        results: [],
                        diagnostics: { topScore, passedThreshold: 0, queryEmbeddingModel: 'test', thresholdUsed: 0.78 },
                    });

                    const chunks: any[] = [];
                    for await (const chunk of service.streamQuery({ userQuery: 'test query' })) {
                        chunks.push(chunk);
                    }

                    expect(mockPrisma.aiInteraction.create).toHaveBeenCalledWith(
                        expect.objectContaining({
                            data: expect.objectContaining({
                                autoAnswered: false,
                                confidenceBand: null,
                            }),
                        }),
                    );
                },
            ),
            { numRuns: 50 },
        );
    });
});
