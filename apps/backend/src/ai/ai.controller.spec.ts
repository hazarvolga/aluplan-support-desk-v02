import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import * as fc from 'fast-check';
import { AiController } from './ai.controller';
import { AiQueryService } from './ai-query.service';
import { EmbeddingService } from './embedding.service';
import { OllamaService } from './ollama.service';
import { OpenAiService } from './openai.service';
import { GenericOpenAiService } from './generic-openai.service';
import { AiService } from './ai.service';
import { AiCopilotService } from './ai-copilot.service';
import { AiReportingService } from './ai-reporting.service';
import { AiHealthEventService } from './ai-health-event.service';
import { RagObservabilityService } from './rag-observability.service';
import { GeminiService } from './gemini.service';
import { PreReimportInspectService } from './pre-reimport-inspect.service';
import { StorageService } from '../common/services/storage.service';
import { RbacGuard } from '../rbac/rbac.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getQueueToken } from '@nestjs/bullmq';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal mock BullMQ Job object */
function makeMockJob(state: string, returnvalue: unknown = null, failedReason = '') {
    return {
        id: 'test-job-id',
        getState: jest.fn().mockResolvedValue(state),
        returnvalue,
        failedReason,
        progress: 0,
    };
}

// ---------------------------------------------------------------------------
// Shared mock factories
// ---------------------------------------------------------------------------

const mockAiQueryService = { query: jest.fn(), getTelemetryMetrics: jest.fn() };
const mockEmbeddingService = { search: jest.fn(), reindexAll: jest.fn() };
const mockOllamaService = {};
const mockOpenAiService = {};
const mockGenericOpenAiService = {};
const mockAiService = { isAvailable: jest.fn(), getHealthStatus: jest.fn(), testProvider: jest.fn(), translate: jest.fn() };
const mockAiCopilotService = { generateDraft: jest.fn() };
const mockAiReportingService = { triggerNow: jest.fn() };
const mockRagObservabilityService = { getMetrics: jest.fn(), recordQuery: jest.fn() };
const mockAiHealthEventService = { listEvents: jest.fn(), getStats: jest.fn() };
const mockPreReimportInspectService = { inspect: jest.fn() };
const mockStorageService = { testConnection: jest.fn() };
const mockGeminiService = {};
const mockAiQueue = { getJob: jest.fn() };

// Guard that always allows — used to bypass auth/throttle in unit tests
const allowAllGuard = { canActivate: () => true };

async function buildModule(): Promise<TestingModule> {
    return Test.createTestingModule({
        controllers: [AiController],
        providers: [
            { provide: AiQueryService, useValue: mockAiQueryService },
            { provide: EmbeddingService, useValue: mockEmbeddingService },
            { provide: OllamaService, useValue: mockOllamaService },
            { provide: OpenAiService, useValue: mockOpenAiService },
            { provide: GenericOpenAiService, useValue: mockGenericOpenAiService },
            { provide: AiService, useValue: mockAiService },
            { provide: AiCopilotService, useValue: mockAiCopilotService },
            { provide: AiReportingService, useValue: mockAiReportingService },
            { provide: RagObservabilityService, useValue: mockRagObservabilityService },
            { provide: AiHealthEventService, useValue: mockAiHealthEventService },
            { provide: PreReimportInspectService, useValue: mockPreReimportInspectService },
            { provide: StorageService, useValue: mockStorageService },
            { provide: GeminiService, useValue: mockGeminiService },
            { provide: getQueueToken('ai-query-processing'), useValue: mockAiQueue },
        ],
    })
        .overrideGuard(RbacGuard).useValue(allowAllGuard)
        .overrideGuard(ThrottlerGuard).useValue(allowAllGuard)
        .overrideGuard(JwtAuthGuard).useValue(allowAllGuard)
        .compile();
}

// ---------------------------------------------------------------------------
// Task 6.3 — Unit tests for getJobStatus()
// ---------------------------------------------------------------------------

describe('AiController — getJobStatus() unit tests', () => {
    let controller: AiController;

    beforeEach(async () => {
        const module = await buildModule();
        controller = module.get<AiController>(AiController);
        jest.clearAllMocks();
    });

    it('returns HTTP 404 NotFoundException when getJob returns null', async () => {
        // Arrange
        mockAiQueue.getJob.mockResolvedValue(null);

        // Act & Assert
        await expect(controller.getJobStatus('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('returns HTTP 404 with message "Job not found" when job is null', async () => {
        // Arrange
        mockAiQueue.getJob.mockResolvedValue(null);

        // Act & Assert
        await expect(controller.getJobStatus('non-existent-id')).rejects.toMatchObject({
            response: { message: 'Job not found' },
        });
    });

    it('completed job — response includes result field equal to job.returnvalue', async () => {
        // Arrange
        const returnvalue = { query: 'test', confidence: 0.9, interactionId: 'abc' };
        mockAiQueue.getJob.mockResolvedValue(makeMockJob('completed', returnvalue));

        // Act
        const response = await controller.getJobStatus('test-job-id');

        // Assert
        expect(response.status).toBe('COMPLETED');
        expect(response.result).toEqual(returnvalue);
        expect(response).not.toHaveProperty('error');
    });

    it('failed job — response includes error field equal to job.failedReason', async () => {
        // Arrange
        const failedReason = 'OpenAI rate limit exceeded';
        mockAiQueue.getJob.mockResolvedValue(makeMockJob('failed', null, failedReason));

        // Act
        const response = await controller.getJobStatus('test-job-id');

        // Assert
        expect(response.status).toBe('FAILED');
        expect(response.error).toBe(failedReason);
        expect(response).not.toHaveProperty('result');
    });

    it('waiting job — status is "PENDING"', async () => {
        // Arrange
        mockAiQueue.getJob.mockResolvedValue(makeMockJob('waiting'));

        // Act
        const response = await controller.getJobStatus('test-job-id');

        // Assert
        expect(response.status).toBe('PENDING');
        expect(response).not.toHaveProperty('result');
        expect(response).not.toHaveProperty('error');
    });

    it('delayed job — status is "PENDING"', async () => {
        // Arrange
        mockAiQueue.getJob.mockResolvedValue(makeMockJob('delayed'));

        // Act
        const response = await controller.getJobStatus('test-job-id');

        // Assert
        expect(response.status).toBe('PENDING');
    });

    it('active job — status is "PROCESSING"', async () => {
        // Arrange
        mockAiQueue.getJob.mockResolvedValue(makeMockJob('active'));

        // Act
        const response = await controller.getJobStatus('test-job-id');

        // Assert
        expect(response.status).toBe('PROCESSING');
    });
});

// ---------------------------------------------------------------------------
// Task 6.2 — Property test: Property 4: Job State → Status Enum Mapping
// Validates: Requirements 4.2, 4.3
// ---------------------------------------------------------------------------

describe('AiController — Property 4: Job State → Status Enum Mapping', () => {
    let controller: AiController;

    beforeEach(async () => {
        const module = await buildModule();
        controller = module.get<AiController>(AiController);
        jest.clearAllMocks();
    });

    it(
        'for any BullMQ state, getJobStatus() returns a status in {PENDING, PROCESSING, COMPLETED, FAILED} and never throws',
        async () => {
            /**
             * Property 4: Job State → Status Enum Mapping
             * Validates: Requirements 4.2, 4.3
             */
            const validStatuses = new Set(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']);

            await fc.assert(
                fc.asyncProperty(
                    fc.constantFrom('waiting', 'delayed', 'active', 'completed', 'failed'),
                    async (state) => {
                        // Arrange: mock queue to return a job with the given state
                        mockAiQueue.getJob.mockResolvedValue(makeMockJob(state));

                        // Act: should not throw
                        const response = await controller.getJobStatus('test-job-id');

                        // Assert: status is in the valid enum set
                        return validStatuses.has(response.status);
                    },
                ),
                { numRuns: 100 },
            );
        },
    );

    it(
        'no BullMQ state produces an error when job exists',
        async () => {
            /**
             * Property 4 (error-free assertion): Job State → Status Enum Mapping
             * Validates: Requirements 4.2, 4.3
             */
            await fc.assert(
                fc.asyncProperty(
                    fc.constantFrom('waiting', 'delayed', 'active', 'completed', 'failed'),
                    async (state) => {
                        // Arrange
                        mockAiQueue.getJob.mockResolvedValue(makeMockJob(state));

                        // Act & Assert: must not throw
                        let threw = false;
                        try {
                            await controller.getJobStatus('test-job-id');
                        } catch {
                            threw = true;
                        }
                        return !threw;
                    },
                ),
                { numRuns: 100 },
            );
        },
    );
});

describe('AiController — reindex stabilization guard', () => {
    let controller: AiController;

    beforeEach(async () => {
        delete process.env.EMBEDDING_MIGRATION_APPROVED;
        const module = await buildModule();
        controller = module.get<AiController>(AiController);
        jest.clearAllMocks();
    });

    afterEach(() => {
        delete process.env.EMBEDDING_MIGRATION_APPROVED;
    });

    it('rejects bulk reindex without explicit operator approval', () => {
        expect(() => controller.reindex()).toThrow('operator approval');
        expect(mockEmbeddingService.reindexAll).not.toHaveBeenCalled();
    });
});
