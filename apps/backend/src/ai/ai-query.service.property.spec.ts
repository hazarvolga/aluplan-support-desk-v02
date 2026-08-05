import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiQueryService } from './ai-query.service';
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
import { SupportAnswerOrchestrator } from './support-answer-orchestrator.service';
import { getQueueToken } from '@nestjs/bullmq';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Any attachment record — mix of image/non-image, url/data/neither */
const attachmentRecordArbitrary = () =>
    fc.record({
        mimeType: fc.oneof(
            fc.constant('image/png'),
            fc.constant('image/jpeg'),
            fc.constant('image/gif'),
            fc.constant('application/pdf'),
            fc.constant('text/plain'),
        ),
        url: fc.option(fc.string({ minLength: 1, maxLength: 80 }), { nil: undefined }),
        data: fc.option(
            fc.string({ minLength: 1, maxLength: 20 }).map(s => Buffer.from(s).toString('base64')),
            { nil: undefined },
        ),
        fileName: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
    });

/** Image attachment with a URL (no inline data) */
const imageAttachmentWithUrlArbitrary = () =>
    fc.record({
        mimeType: fc.oneof(
            fc.constant('image/png'),
            fc.constant('image/jpeg'),
            fc.constant('image/webp'),
        ),
        url: fc.string({ minLength: 1, maxLength: 80 }),
        data: fc.constant(undefined as undefined),
        fileName: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
    });

/** Image attachment that already has inline data (no url) */
const inlineDataAttachmentArbitrary = () =>
    fc.record({
        mimeType: fc.oneof(
            fc.constant('image/png'),
            fc.constant('image/jpeg'),
        ),
        data: fc.string({ minLength: 1, maxLength: 20 }).map(s => Buffer.from(s).toString('base64')),
        url: fc.constant(undefined as undefined),
        fileName: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
    });

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

describe('AiQueryService — property tests (normalizeImageAttachments)', () => {
    let service: AiQueryService;
    let mockStorage: { getFile: jest.Mock };

    const callNormalize = (attachments: any[]) =>
        (service as any).normalizeImageAttachments(attachments);

    beforeEach(async () => {
        mockStorage = { getFile: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiQueryService,
                { provide: PrismaService, useValue: { user: { findUnique: jest.fn() }, aiInteraction: { create: jest.fn() }, aiShiftDetection: { create: jest.fn() } } },
                { provide: AiService, useValue: { reformat: jest.fn(), generate: jest.fn(), streamReformat: jest.fn(), getActiveProviderName: jest.fn().mockResolvedValue('test'), getActiveModelName: jest.fn().mockResolvedValue('test') } },
                { provide: EmbeddingService, useValue: { search: jest.fn(), searchTickets: jest.fn() } },
                { provide: ConfigService, useValue: { get: jest.fn((k: string, d?: any) => d ?? 'test') } },
                { provide: PromptContextBuilderService, useValue: { buildContext: jest.fn().mockResolvedValue('') } },
                { provide: PromptsService, useValue: { getPrompt: jest.fn().mockResolvedValue('') } },
                { provide: SettingsService, useValue: { getValue: jest.fn() } },
                { provide: LangfuseService, useValue: { trace: jest.fn(), addEvent: jest.fn() } },
                {
                    provide: RedisService, useValue: {
                        get: jest.fn().mockResolvedValue(null),
                        set: jest.fn(),
                        getClient: jest.fn(() => ({
                            get: jest.fn().mockResolvedValue(null),
                            incrbyfloat: jest.fn().mockResolvedValue(1),
                            incr: jest.fn().mockResolvedValue(1),
                            expire: jest.fn().mockResolvedValue(1),
                        })),
                    },
                },
                { provide: RagObservabilityService, useValue: { recordQuery: jest.fn() } },
                { provide: AiDiagnosisService, useValue: { analyze: jest.fn().mockResolvedValue({ categoryNames: [], matchedKeywords: [] }) } },
                { provide: DocumentParserService, useValue: { extractText: jest.fn().mockResolvedValue('') } },
                { provide: MetricsService, useValue: { recordCacheOp: jest.fn() } },
                { provide: StorageService, useValue: mockStorage },
                { provide: AiSemanticCache, useValue: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue(undefined) } },
                SupportAnswerOrchestrator,
                { provide: getQueueToken('ai-query-processing'), useValue: {} },
            ],
        }).compile();

        service = module.get<AiQueryService>(AiQueryService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    // Property 7: AiQueryService normalization produces zero fileData parts
    // Feature: attachment-vision-support, Property 7: AiQueryService normalization produces zero fileData parts
    // Validates: Requirements 1.4, 7.4
    // -------------------------------------------------------------------------
    it('Property 7: normalizeImageAttachments produces zero fileData parts for any input', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(attachmentRecordArbitrary(), { maxLength: 10 }),
                async (attachments) => {
                    mockStorage.getFile.mockResolvedValue(Buffer.from('fake'));

                    const parts = await callNormalize(attachments);

                    // Every part must NOT have a fileData field
                    return parts.every((p: any) => p.fileData === undefined);
                },
            ),
            { numRuns: 100 },
        );
    });

    // -------------------------------------------------------------------------
    // Property 8: inlineData count equals successful fetches
    // Feature: attachment-vision-support, Property 8: AiQueryService inlineData count equals successful fetches
    // Validates: Requirements 7.5, 1.1, 1.2
    // -------------------------------------------------------------------------
    it('Property 8: inlineData count equals number of successfully fetched image attachments', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(imageAttachmentWithUrlArbitrary(), { minLength: 0, maxLength: 8 }),
                fc.array(fc.boolean(), { minLength: 0, maxLength: 8 }),
                async (attachments, successFlags) => {
                    mockStorage.getFile.mockReset();

                    // Pad flags to match attachment count
                    const flags = attachments.map((_, i) => successFlags[i] ?? true);

                    flags.forEach((succeed) => {
                        if (succeed) {
                            mockStorage.getFile.mockResolvedValueOnce(Buffer.from('data'));
                        } else {
                            mockStorage.getFile.mockResolvedValueOnce(null);
                        }
                    });

                    const parts = await callNormalize(attachments);

                    const expectedCount = flags.filter(Boolean).length;
                    const actualCount = parts.filter((p: any) => p.inlineData !== undefined).length;

                    return actualCount === expectedCount;
                },
            ),
            { numRuns: 100 },
        );
    });

    // -------------------------------------------------------------------------
    // Property 9: Already-inlineData attachments pass through unchanged
    // Feature: attachment-vision-support, Property 9: Already-inlineData attachments pass through unchanged
    // Validates: Requirements 1.3
    // -------------------------------------------------------------------------
    it('Property 9: inlineData attachments pass through without calling StorageService', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(inlineDataAttachmentArbitrary(), { minLength: 0, maxLength: 8 }),
                async (attachments) => {
                    mockStorage.getFile.mockReset();

                    const parts = await callNormalize(attachments);

                    // StorageService must never be called for inline attachments
                    if (mockStorage.getFile.mock.calls.length !== 0) return false;

                    // Each output part must match the corresponding input
                    if (parts.length !== attachments.length) return false;

                    return parts.every((p: any, i: number) =>
                        p.inlineData?.mimeType === attachments[i].mimeType &&
                        p.inlineData?.data === attachments[i].data,
                    );
                },
            ),
            { numRuns: 100 },
        );
    });

    // -------------------------------------------------------------------------
    // Property 10: Pipeline does not throw on attachment failures
    // Feature: attachment-vision-support, Property 10: Pipeline does not throw on attachment failures
    // Validates: Requirements 1.5, 5.4
    // -------------------------------------------------------------------------
    it('Property 10: normalizeImageAttachments resolves to [] without throwing when all fetches fail', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(imageAttachmentWithUrlArbitrary(), { minLength: 1, maxLength: 8 }),
                async (attachments) => {
                    mockStorage.getFile.mockReset();
                    mockStorage.getFile.mockRejectedValue(new Error('S3 error'));

                    const parts = await callNormalize(attachments);

                    return Array.isArray(parts) && parts.length === 0;
                },
            ),
            { numRuns: 100 },
        );
    });
});
