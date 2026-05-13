import { buildKnowledgeSyncWorkerOptions } from './knowledge-pool.processor';

describe('KnowledgePoolProcessor queue worker options', () => {
    it('uses low-rate defaults that are safe for bulk ingestion', () => {
        const options = buildKnowledgeSyncWorkerOptions({});

        expect(options).toEqual({
            concurrency: 1,
            limiter: {
                max: 1,
                duration: 15000,
            },
        });
    });

    it('accepts explicit env overrides', () => {
        const options = buildKnowledgeSyncWorkerOptions({
            KNOWLEDGE_SYNC_QUEUE_CONCURRENCY: '2',
            KNOWLEDGE_SYNC_RATE_MAX: '3',
            KNOWLEDGE_SYNC_RATE_DURATION_MS: '45000',
        });

        expect(options).toEqual({
            concurrency: 2,
            limiter: {
                max: 3,
                duration: 45000,
            },
        });
    });

    it('falls back when env overrides are invalid', () => {
        const options = buildKnowledgeSyncWorkerOptions({
            KNOWLEDGE_SYNC_QUEUE_CONCURRENCY: '0',
            KNOWLEDGE_SYNC_RATE_MAX: '-2',
            KNOWLEDGE_SYNC_RATE_DURATION_MS: 'NaN',
        });

        expect(options).toEqual({
            concurrency: 1,
            limiter: {
                max: 1,
                duration: 15000,
            },
        });
    });
});
