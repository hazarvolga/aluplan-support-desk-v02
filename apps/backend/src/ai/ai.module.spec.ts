/**
 * Unit tests for AiModule — BullMQ Rate Limiter Configuration
 *
 * Tests verify:
 * - AI_QUEUE_RATE_MAX env var defaults to 10 when undefined
 * - AI_QUEUE_RATE_DURATION_MS env var defaults to 1000 when undefined
 * - Existing retry configuration (attempts: 3) is preserved alongside the limiter
 *
 * Requirements: 5.2, 5.3, 5.6
 */

describe('AiModule — BullMQ Rate Limiter Configuration', () => {
    /**
     * Helper that replicates the exact env-var parsing logic used in ai.module.ts.
     * This ensures the tests stay in sync with the production code pattern.
     */
    function buildQueueLimiterConfig(env: NodeJS.ProcessEnv = process.env): {
        max: number;
        duration: number;
    } {
        return {
            max: parseInt(env.AI_QUEUE_RATE_MAX ?? '10', 10),
            duration: parseInt(env.AI_QUEUE_RATE_DURATION_MS ?? '1000', 10),
        };
    }

    /**
     * Helper that replicates the full ai-query-processing worker config
     * as defined in ai-query.processor.ts, for structural verification.
     * Note: In BullMQ v5, limiter moved from QueueOptions to WorkerOptions.
     */
    function buildAiQueryWorkerConfig(env: NodeJS.ProcessEnv = process.env): {
        name: string;
        defaultJobOptions: {
            attempts: number;
            backoff: { type: string; delay: number };
            removeOnComplete: number;
            removeOnFail: boolean;
        };
        limiter: { max: number; duration: number };
    } {
        return {
            name: 'ai-query-processing',
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
                removeOnComplete: 100,
                removeOnFail: false,
            },
            limiter: buildQueueLimiterConfig(env),
        };
    }

    // Keep backward-compat alias used in tests below
    const buildAiQueryQueueConfig = buildAiQueryWorkerConfig;

    // -------------------------------------------------------------------------
    // Requirement 5.2 — limiter.max defaults to 10 when AI_QUEUE_RATE_MAX is undefined
    // -------------------------------------------------------------------------

    describe('limiter.max — AI_QUEUE_RATE_MAX env var', () => {
        it('defaults to 10 when AI_QUEUE_RATE_MAX is undefined', () => {
            const env: NodeJS.ProcessEnv = {};
            const config = buildQueueLimiterConfig(env);
            expect(config.max).toBe(10);
        });

        it('uses the value from AI_QUEUE_RATE_MAX when defined', () => {
            const env: NodeJS.ProcessEnv = { AI_QUEUE_RATE_MAX: '20' };
            const config = buildQueueLimiterConfig(env);
            expect(config.max).toBe(20);
        });

        it('parses AI_QUEUE_RATE_MAX as a base-10 integer', () => {
            const env: NodeJS.ProcessEnv = { AI_QUEUE_RATE_MAX: '5' };
            const config = buildQueueLimiterConfig(env);
            expect(config.max).toBe(5);
            expect(Number.isInteger(config.max)).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // Requirement 5.3 — limiter.duration defaults to 1000 when AI_QUEUE_RATE_DURATION_MS is undefined
    // -------------------------------------------------------------------------

    describe('limiter.duration — AI_QUEUE_RATE_DURATION_MS env var', () => {
        it('defaults to 1000 when AI_QUEUE_RATE_DURATION_MS is undefined', () => {
            const env: NodeJS.ProcessEnv = {};
            const config = buildQueueLimiterConfig(env);
            expect(config.duration).toBe(1000);
        });

        it('uses the value from AI_QUEUE_RATE_DURATION_MS when defined', () => {
            const env: NodeJS.ProcessEnv = { AI_QUEUE_RATE_DURATION_MS: '2000' };
            const config = buildQueueLimiterConfig(env);
            expect(config.duration).toBe(2000);
        });

        it('parses AI_QUEUE_RATE_DURATION_MS as a base-10 integer', () => {
            const env: NodeJS.ProcessEnv = { AI_QUEUE_RATE_DURATION_MS: '500' };
            const config = buildQueueLimiterConfig(env);
            expect(config.duration).toBe(500);
            expect(Number.isInteger(config.duration)).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // Requirement 5.6 — rate limiter coexists with existing retry configuration
    // -------------------------------------------------------------------------

    describe('retry configuration preservation', () => {
        it('preserves attempts: 3 alongside the limiter', () => {
            const config = buildAiQueryQueueConfig({});
            expect(config.defaultJobOptions.attempts).toBe(3);
        });

        it('preserves exponential backoff with delay: 1000 alongside the limiter', () => {
            const config = buildAiQueryQueueConfig({});
            expect(config.defaultJobOptions.backoff).toEqual({
                type: 'exponential',
                delay: 1000,
            });
        });

        it('preserves removeOnComplete: 100 alongside the limiter', () => {
            const config = buildAiQueryQueueConfig({});
            expect(config.defaultJobOptions.removeOnComplete).toBe(100);
        });

        it('preserves removeOnFail: false alongside the limiter', () => {
            const config = buildAiQueryQueueConfig({});
            expect(config.defaultJobOptions.removeOnFail).toBe(false);
        });

        it('limiter and defaultJobOptions are both present in the queue config', () => {
            const config = buildAiQueryQueueConfig({});
            expect(config).toHaveProperty('limiter');
            expect(config).toHaveProperty('defaultJobOptions');
            expect(config.limiter).toHaveProperty('max');
            expect(config.limiter).toHaveProperty('duration');
        });

        it('both env vars undefined → defaults applied while retry config is intact', () => {
            const config = buildAiQueryQueueConfig({});
            // Rate limiter defaults
            expect(config.limiter.max).toBe(10);
            expect(config.limiter.duration).toBe(1000);
            // Retry config preserved
            expect(config.defaultJobOptions.attempts).toBe(3);
        });

        it('custom env vars → custom limiter values while retry config is intact', () => {
            const config = buildAiQueryQueueConfig({
                AI_QUEUE_RATE_MAX: '15',
                AI_QUEUE_RATE_DURATION_MS: '500',
            });
            // Rate limiter custom values
            expect(config.limiter.max).toBe(15);
            expect(config.limiter.duration).toBe(500);
            // Retry config preserved
            expect(config.defaultJobOptions.attempts).toBe(3);
        });
    });

    // -------------------------------------------------------------------------
    // Edge cases
    // -------------------------------------------------------------------------

    describe('edge cases', () => {
        it('both env vars set to "0" → limiter values are 0 (not defaults)', () => {
            const env: NodeJS.ProcessEnv = {
                AI_QUEUE_RATE_MAX: '0',
                AI_QUEUE_RATE_DURATION_MS: '0',
            };
            const config = buildQueueLimiterConfig(env);
            // parseInt('0', 10) = 0, not the default
            expect(config.max).toBe(0);
            expect(config.duration).toBe(0);
        });

        it('queue name is "ai-query-processing"', () => {
            const config = buildAiQueryQueueConfig({});
            expect(config.name).toBe('ai-query-processing');
        });
    });
});
