/**
 * Property-Based Tests: AI Pipeline Optimization
 * Feature: ai-pipeline-optimization
 *
 * Property 2: Shift Detection DB Persistence          — Validates: Requirements 2.2
 * Property 3: History Mutation iff isProblemShift     — Validates: Requirements 3.1, 3.3
 * Property 5: Shift Event Langfuse Payload Completeness — Validates: Requirements 6.1, 6.2
 * Property 6: Pipeline Resilience                    — Validates: Requirements 2.3, 6.3, 7.1
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
import { StorageService } from '../common/services/storage.service';
import { AiSemanticCache } from './ai-semantic-cache.service';

// ---------------------------------------------------------------------------
// Shared mock factories
// ---------------------------------------------------------------------------

const makeRedisClient = () => ({
    get: jest.fn().mockResolvedValue('0'),
    incrbyfloat: jest.fn().mockResolvedValue(0),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
});

const makePrisma = () => ({
    aiInteraction: { create: jest.fn().mockResolvedValue({ id: 'interaction-id' }) },
    aiShiftDetection: { create: jest.fn().mockResolvedValue({ id: 'shift-id' }) },
    user: { findUnique: jest.fn().mockResolvedValue(null) },
});

const makeAiService = () => ({
    reformat: jest.fn().mockResolvedValue({ response: 'AI answer', model: 'gpt-4o-mini' }),
    generate: jest.fn().mockResolvedValue('{"rankings": [{"id": 0, "score": 90}]}'),
    getActiveProviderName: jest.fn().mockResolvedValue('openai'),
    getActiveModelName: jest.fn().mockResolvedValue('gpt-4o-mini'),
    streamReformat: jest.fn(),
});

const makeEmbeddingService = () => ({
    search: jest.fn().mockResolvedValue({
        results: [
            {
                articleId: 'art-1',
                title: 'Test Article',
                content: 'Test content',
                similarity: 0.9,
                confidence: 'HIGH',
                sourceType: 'ARTICLE',
                updatedAt: new Date().toISOString(),
            },
        ],
        diagnostics: {
            topScore: 0.9,
            passedThreshold: 1,
            queryEmbeddingModel: 'text-embedding-3-small',
            thresholdUsed: 0.72,
        },
    }),
});

const makeConfig = () => ({
    get: jest.fn((key: string, def: string) => {
        if (key === 'AI_GLOBAL_DAILY_CAP') return '50.0';
        if (key === 'AI_USER_DAILY_QUOTA') return '50';
        return def;
    }),
});

const makeLangfuse = () => ({
    trace: jest.fn().mockResolvedValue(undefined),
    addEvent: jest.fn().mockResolvedValue(undefined),
    traceRetrieval: jest.fn().mockResolvedValue(undefined),
});

const makePromptContext = () => ({
    buildContext: jest.fn().mockResolvedValue('context'),
});

// ---------------------------------------------------------------------------
// Helper: build a NestJS test module with configurable mocks
// ---------------------------------------------------------------------------

async function buildModule(overrides: {
    prisma?: ReturnType<typeof makePrisma>;
    aiService?: ReturnType<typeof makeAiService>;
    embeddingService?: ReturnType<typeof makeEmbeddingService>;
    config?: ReturnType<typeof makeConfig>;
    langfuse?: ReturnType<typeof makeLangfuse>;
    promptContext?: ReturnType<typeof makePromptContext>;
    diagnosisAnalyze?: jest.Mock;
    redisClient?: ReturnType<typeof makeRedisClient>;
}) {
    const prisma = overrides.prisma ?? makePrisma();
    const aiService = overrides.aiService ?? makeAiService();
    const embeddingService = overrides.embeddingService ?? makeEmbeddingService();
    const config = overrides.config ?? makeConfig();
    const langfuse = overrides.langfuse ?? makeLangfuse();
    const promptContext = overrides.promptContext ?? makePromptContext();
    const redisClient = overrides.redisClient ?? makeRedisClient();

    const diagnosisAnalyze =
        overrides.diagnosisAnalyze ??
        jest.fn().mockResolvedValue({
            isProblemShift: false,
            matchedKeywords: [],
            categoryNames: [],
            productName: 'Test',
            productId: null,
        });

    const mockRedis = {
        getClient: jest.fn().mockReturnValue(redisClient),
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
        providers: [
            AiQueryService,
            { provide: PrismaService, useValue: prisma },
            { provide: AiService, useValue: aiService },
            { provide: EmbeddingService, useValue: embeddingService },
            { provide: ConfigService, useValue: config },
            { provide: PromptContextBuilderService, useValue: promptContext },
            { provide: PromptsService, useValue: { getPrompt: jest.fn().mockResolvedValue('system prompt') } },
            { provide: SettingsService, useValue: { getValue: jest.fn().mockResolvedValue(null) } },
            { provide: LangfuseService, useValue: langfuse },
            { provide: RedisService, useValue: mockRedis },
            { provide: RagObservabilityService, useValue: { recordQuery: jest.fn() } },
            { provide: AiDiagnosisService, useValue: { analyze: diagnosisAnalyze } },
            { provide: DocumentParserService, useValue: { extractText: jest.fn() } },
            { provide: MetricsService, useValue: { increment: jest.fn(), gauge: jest.fn(), recordCacheOp: jest.fn() } },
            { provide: StorageService, useValue: { getFile: jest.fn().mockResolvedValue(Buffer.from('fake')) } },
            { provide: AiSemanticCache, useValue: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue(undefined) } },
            { provide: getQueueToken('ai-query-processing'), useValue: { add: jest.fn() } },
        ],
    }).compile();

    return {
        service: module.get(AiQueryService),
        prisma,
        aiService,
        embeddingService,
        config,
        langfuse,
        promptContext,
        diagnosisAnalyze,
        redisClient,
    };
}

// ---------------------------------------------------------------------------
// Property 2: Shift Detection DB Persistence
// Validates: Requirements 2.2
// ---------------------------------------------------------------------------

describe('Property 2: Shift Detection DB Persistence', () => {
    /**
     * For any (userQuery, history) pair where AiDiagnosisService.analyze() returns
     * isProblemShift = true, queryInternal() should create exactly one record in
     * ai_shift_detections containing the detected newKeywords and the correct
     * historyLength matching options.history.length at the time of detection.
     *
     * **Validates: Requirements 2.2**
     */
    it('creates exactly one aiShiftDetection record with correct newKeywords and historyLength', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    userQuery: fc.string({ minLength: 5 }),
                    history: fc.array(
                        fc.record({
                            role: fc.constantFrom('user' as const, 'assistant' as const),
                            content: fc.string(),
                        }),
                        { minLength: 1 },
                    ),
                }),
                async ({ userQuery, history }) => {
                    const prisma = makePrisma();
                    const diagnosisAnalyze = jest.fn().mockResolvedValue({
                        isProblemShift: true,
                        matchedKeywords: ['keyword1'],
                        categoryNames: [],
                        productName: 'Test',
                        productId: null,
                    });

                    const { service } = await buildModule({ prisma, diagnosisAnalyze });

                    await service.queryInternal({ userQuery, history, userId: 'user-1' });

                    // Must be called exactly once
                    expect(prisma.aiShiftDetection.create).toHaveBeenCalledTimes(1);

                    const callArg = (prisma.aiShiftDetection.create as jest.Mock).mock.calls[0][0];
                    const data = callArg.data;

                    // newKeywords must be present
                    expect(Array.isArray(data.newKeywords)).toBe(true);

                    // historyLength must match the input history length
                    expect(data.historyLength).toBe(history.length);
                },
            ),
            { numRuns: 100 },
        );
    });
});

// ---------------------------------------------------------------------------
// Property 3: History Mutation iff isProblemShift
// Validates: Requirements 3.1, 3.3
// ---------------------------------------------------------------------------

describe('Property 3: History Mutation iff isProblemShift', () => {
    /**
     * For any non-empty history array passed to queryInternal():
     * - When isProblemShift = true  → history passed to buildContext must be []
     * - When isProblemShift = false → history passed to buildContext must be unchanged
     *
     * **Validates: Requirements 3.1, 3.3**
     */
    it('clears history when isProblemShift=true, preserves it when false', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(
                    fc.record({
                        role: fc.constantFrom('user' as const, 'assistant' as const),
                        content: fc.string(),
                    }),
                    { minLength: 1 },
                ),
                fc.boolean(),
                async (history, isProblemShift) => {
                    const promptContext = makePromptContext();
                    const diagnosisAnalyze = jest.fn().mockResolvedValue({
                        isProblemShift,
                        matchedKeywords: ['keyword1'],
                        categoryNames: [],
                        productName: 'Test',
                        productId: null,
                    });

                    const { service } = await buildModule({ promptContext, diagnosisAnalyze });

                    await service.queryInternal({
                        userQuery: 'test query for history mutation',
                        history: [...history],
                        userId: 'user-1',
                    });

                    expect(promptContext.buildContext).toHaveBeenCalled();
                    const buildContextCall = (promptContext.buildContext as jest.Mock).mock.calls[0][0];
                    const passedMessages: Array<{ role: string; content: string }> | undefined =
                        buildContextCall.messages;

                    if (isProblemShift) {
                        // History must be cleared
                        expect(passedMessages).toEqual([]);
                    } else {
                        // History must be preserved (same length)
                        expect(passedMessages?.length).toBe(history.length);
                    }
                },
            ),
            { numRuns: 100 },
        );
    });
});

// ---------------------------------------------------------------------------
// Property 5: Shift Event Langfuse Payload Completeness
// Validates: Requirements 6.1, 6.2
// ---------------------------------------------------------------------------

describe('Property 5: Shift Event Langfuse Payload Completeness', () => {
    /**
     * For any (userQuery, history, userId) combination where isProblemShift = true,
     * LangfuseService.addEvent() should be called with event name "problem-shift"
     * and a payload containing all four required fields:
     *   previousKeywords (array), newKeywords (array), historyLength (number), userId (string | null)
     *
     * **Validates: Requirements 6.1, 6.2**
     */
    it('calls addEvent with "problem-shift" and all required payload fields', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    userQuery: fc.string({ minLength: 5 }),
                    history: fc.array(
                        fc.record({
                            role: fc.constantFrom('user' as const, 'assistant' as const),
                            content: fc.string(),
                        }),
                        { minLength: 1 },
                    ),
                    userId: fc.option(fc.string({ minLength: 1 }), { nil: null }),
                }),
                async ({ userQuery, history, userId }) => {
                    const langfuse = makeLangfuse();
                    const diagnosisAnalyze = jest.fn().mockResolvedValue({
                        isProblemShift: true,
                        matchedKeywords: ['keyword1'],
                        categoryNames: [],
                        productName: 'Test',
                        productId: null,
                    });

                    const { service } = await buildModule({ langfuse, diagnosisAnalyze });

                    await service.queryInternal({ userQuery, history, userId });

                    expect(langfuse.addEvent).toHaveBeenCalled();

                    // Find the call with event name 'problem-shift'
                    const calls = (langfuse.addEvent as jest.Mock).mock.calls;
                    const shiftCall = calls.find((c: unknown[]) => c[1] === 'problem-shift');
                    expect(shiftCall).toBeDefined();

                    const payload = shiftCall![2] as Record<string, unknown>;

                    // All four required fields must be present
                    expect(Array.isArray(payload.previousKeywords)).toBe(true);
                    expect(Array.isArray(payload.newKeywords)).toBe(true);
                    expect(typeof payload.historyLength).toBe('number');
                    // userId can be string or null
                    expect(
                        payload.userId === null || typeof payload.userId === 'string',
                    ).toBe(true);
                },
            ),
            { numRuns: 100 },
        );
    });
});

// ---------------------------------------------------------------------------
// Property 6: Pipeline Resilience — Optional Steps Don't Block Result
// Validates: Requirements 2.3, 6.3, 7.1
// ---------------------------------------------------------------------------

describe('Property 6: Pipeline Resilience', () => {
    /**
     * For any combination of failing optional steps (DB shift log throws,
     * Langfuse addEvent throws), queryInternal() should still return a valid
     * AiQueryResult with non-null query, confidence, and interactionId fields.
     *
     * **Validates: Requirements 2.3, 6.3, 7.1**
     */
    it('resolves with valid AiQueryResult even when DB or Langfuse optional steps fail', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.record({
                    dbFails: fc.boolean(),
                    langfuseFails: fc.boolean(),
                }),
                async ({ dbFails, langfuseFails }) => {
                    const prisma = makePrisma();
                    const langfuse = makeLangfuse();

                    if (dbFails) {
                        (prisma.aiShiftDetection.create as jest.Mock).mockRejectedValue(
                            new Error('DB error'),
                        );
                    }
                    if (langfuseFails) {
                        (langfuse.addEvent as jest.Mock).mockRejectedValue(
                            new Error('Langfuse error'),
                        );
                    }

                    const diagnosisAnalyze = jest.fn().mockResolvedValue({
                        isProblemShift: true,
                        matchedKeywords: ['keyword1'],
                        categoryNames: [],
                        productName: 'Test',
                        productId: null,
                    });

                    const { service } = await buildModule({ prisma, langfuse, diagnosisAnalyze });

                    // Must resolve — not throw
                    const result = await service.queryInternal({
                        userQuery: 'test query',
                        history: [{ role: 'user', content: 'prev' }],
                    });

                    expect(result.query).toBeDefined();
                    expect(result.confidence).toBeDefined();
                    expect(result.interactionId).toBeDefined();
                },
            ),
            { numRuns: 100 },
        );
    });
});
