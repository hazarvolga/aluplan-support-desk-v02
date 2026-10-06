import { LearnNowCrawlRunService } from './learnnow-crawl-run.service';

const candidate = {
    sourceUrl: 'https://learnnow.allplan.com/totara/engage/resources/howto/index.php?id=42&source=howto',
    title: 'Public Allplan article',
    format: 'KNOWLEDGE_ARTICLE',
    language: 'en',
    categorySlug: 'uncategorized',
    crawlFilter: 'knowledge_article',
    metadata: { source: 'allplan_learnnow' },
};

const makeService = (enabled = true) => {
    const prisma = {
        learnNowCrawlRun: {
            create: jest.fn(),
            findFirst: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        $queryRaw: jest.fn(),
    };
    const queue = { add: jest.fn() };
    const crawler = {
        discover: jest.fn(),
        stageCandidate: jest.fn(),
        getStageResult: jest.fn().mockResolvedValue(null),
    };
    const config = {
        get: jest.fn((key: string) => ({
            LEARNNOW_CRAWL_ENABLED: enabled,
            LEARNNOW_CRAWL_PACING_MS: 60_000,
            LEARNNOW_CRAWL_DAILY_CANDIDATE_LIMIT: 10,
            LEARNNOW_CRAWL_RUN_CANDIDATE_LIMIT: 5,
        } as Record<string, unknown>)[key]),
    };

    return {
        service: new LearnNowCrawlRunService(prisma as any, queue as any, crawler as any, config as any),
        prisma,
        queue,
        crawler,
    };
};

describe('LearnNowCrawlRunService', () => {
    beforeEach(() => jest.clearAllMocks());

    it('returns 503 semantics when the feature is disabled without writing or enqueueing', async () => {
        const { service, prisma, queue } = makeService(false);

        await expect(service.start({})).rejects.toMatchObject({
            status: 503,
            response: expect.objectContaining({ code: 'LEARNNOW_CRAWLER_DISABLED' }),
        });
        expect(prisma.learnNowCrawlRun.create).not.toHaveBeenCalled();
        expect(queue.add).not.toHaveBeenCalled();
    });

    it('creates a durable run and enqueues a separate crawl job', async () => {
        const { service, prisma, queue } = makeService();
        prisma.learnNowCrawlRun.create.mockResolvedValue({ id: 'run-1', status: 'QUEUED' });

        await expect(service.start({ maxCandidates: 5 })).resolves.toEqual({ id: 'run-1', status: 'QUEUED' });
        expect(queue.add).toHaveBeenCalledWith(
            'learnnow-crawl-step',
            { runId: 'run-1' },
            expect.objectContaining({ jobId: 'learnnow-run-run-1-catalog' }),
        );
    });

    it('rejects a second active run', async () => {
        const { service, prisma, queue } = makeService();
        prisma.learnNowCrawlRun.findFirst.mockResolvedValue({ id: 'active-run' });

        await expect(service.start({})).rejects.toMatchObject({ status: 409 });
        expect(prisma.learnNowCrawlRun.create).not.toHaveBeenCalled();
        expect(queue.add).not.toHaveBeenCalled();
    });

    it('persists discovery before processing one candidate per paced step', async () => {
        const { service, prisma, queue, crawler } = makeService();
        prisma.learnNowCrawlRun.findUnique.mockResolvedValueOnce({
            id: 'run-1',
            status: 'QUEUED',
            search: null,
            formats: ['knowledge_article'],
            maxCandidates: 5,
            processedCount: 0,
            insertedCount: 0,
            checkpoint: null,
        });
        prisma.learnNowCrawlRun.findUnique.mockResolvedValueOnce({ status: 'QUEUED' });
        prisma.learnNowCrawlRun.findUnique.mockResolvedValueOnce({
            id: 'run-1',
            status: 'RUNNING',
            search: null,
            formats: ['knowledge_article'],
            maxCandidates: 5,
            processedCount: 0,
            insertedCount: 0,
            checkpoint: { candidates: [candidate, { ...candidate, sourceUrl: `${candidate.sourceUrl}&second=1` }], nextCandidateIndex: 0, notBefore: 0 },
        });
        prisma.learnNowCrawlRun.findUnique.mockResolvedValueOnce({ status: 'RUNNING' });
        prisma.$queryRaw.mockResolvedValue([{ attempt_count: 1 }]);
        crawler.discover.mockResolvedValue({ dryRun: true, candidates: [candidate, { ...candidate, sourceUrl: `${candidate.sourceUrl}&second=1` }] });
        crawler.stageCandidate.mockResolvedValue({ inserted: true });
        prisma.learnNowCrawlRun.update.mockResolvedValue({
            id: 'run-1',
            status: 'RUNNING',
            processedCount: 1,
            insertedCount: 1,
        });

        await service.processStep('run-1');
        expect(crawler.stageCandidate).not.toHaveBeenCalled();
        expect(queue.add).toHaveBeenCalledWith(
            'learnnow-crawl-step',
            { runId: 'run-1' },
            expect.objectContaining({ delay: 60_000, jobId: 'learnnow-run-run-1-candidate-0' }),
        );

        await service.processStep('run-1');

        expect(crawler.stageCandidate).toHaveBeenCalledTimes(1);
        expect(queue.add).toHaveBeenCalledWith(
            'learnnow-crawl-step',
            { runId: 'run-1' },
            expect.objectContaining({ delay: 60_000, jobId: 'learnnow-run-run-1-candidate-1' }),
        );
    });

    it('does no work for a paused run', async () => {
        const { service, prisma, crawler, queue } = makeService();
        prisma.learnNowCrawlRun.findUnique.mockResolvedValue({ id: 'run-1', status: 'PAUSED' });

        await service.processStep('run-1');

        expect(crawler.discover).not.toHaveBeenCalled();
        expect(crawler.stageCandidate).not.toHaveBeenCalled();
        expect(queue.add).not.toHaveBeenCalled();
    });

    it('stops before outbound work when the atomic daily attempt bucket is exhausted', async () => {
        const { service, prisma, crawler, queue } = makeService();
        prisma.learnNowCrawlRun.findUnique.mockResolvedValue({
            id: 'run-1', status: 'RUNNING', maxCandidates: 5, processedCount: 0, insertedCount: 0,
        });
        prisma.$queryRaw.mockResolvedValue([]);

        await service.processStep('run-1');

        expect(crawler.discover).not.toHaveBeenCalled();
        expect(crawler.stageCandidate).not.toHaveBeenCalled();
        expect(queue.add).not.toHaveBeenCalled();
        expect(prisma.learnNowCrawlRun.updateMany).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ status: 'COMPLETED', lastError: 'DAILY_BUDGET_REACHED', activeKey: null }),
        }));
    });

    it('preserves PAUSED when pause wins during candidate processing', async () => {
        const { service, prisma, crawler, queue } = makeService();
        prisma.learnNowCrawlRun.findUnique
            .mockResolvedValueOnce({
            id: 'run-1',
            status: 'RUNNING',
            search: null,
            formats: ['knowledge_article'],
            maxCandidates: 5,
            processedCount: 0,
            insertedCount: 0,
            checkpoint: { candidates: [candidate, { ...candidate, sourceUrl: `${candidate.sourceUrl}&second=1` }], nextCandidateIndex: 0, notBefore: 0 },
            })
            .mockResolvedValueOnce({ status: 'RUNNING' });
        prisma.$queryRaw.mockResolvedValue([{ attempt_count: 1 }]);
        prisma.learnNowCrawlRun.updateMany
            .mockResolvedValueOnce({ count: 1 })
            .mockResolvedValueOnce({ count: 0 });
        crawler.stageCandidate.mockResolvedValue({ inserted: true });

        await service.processStep('run-1');

        expect(prisma.learnNowCrawlRun.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'run-1' },
            data: expect.not.objectContaining({ status: expect.anything() }),
        }));
        expect(queue.add).not.toHaveBeenCalled();
    });

    it('reconciles a previously staged candidate before applying the attempt budget', async () => {
        const { service, prisma, crawler } = makeService();
        prisma.learnNowCrawlRun.findUnique.mockResolvedValue({
            id: 'run-1',
            status: 'RUNNING',
            search: null,
            formats: ['knowledge_article'],
            maxCandidates: 1,
            attemptCount: 1,
            processedCount: 0,
            insertedCount: 0,
            checkpoint: { candidates: [candidate], nextCandidateIndex: 0, notBefore: 0 },
        });
        crawler.getStageResult.mockResolvedValue(true);
        prisma.$queryRaw.mockResolvedValue([{ attempt_count: 10 }]);

        await service.processStep('run-1');

        expect(crawler.stageCandidate).not.toHaveBeenCalled();
        expect(prisma.$queryRaw).not.toHaveBeenCalled();
        expect(prisma.learnNowCrawlRun.updateMany).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                status: 'COMPLETED',
                processedCount: { increment: 1 },
                insertedCount: { increment: 1 },
            }),
        }));
    });

    it('counts a failed outbound stage as an attempt without completing the candidate', async () => {
        const { service, prisma, crawler } = makeService();
        prisma.learnNowCrawlRun.findUnique
            .mockResolvedValueOnce({
            id: 'run-1',
            status: 'RUNNING',
            search: null,
            formats: ['knowledge_article'],
            maxCandidates: 5,
            attemptCount: 0,
            processedCount: 0,
            insertedCount: 0,
            checkpoint: { candidates: [candidate], nextCandidateIndex: 0, notBefore: 0 },
            })
            .mockResolvedValueOnce({ status: 'RUNNING' });
        prisma.$queryRaw.mockResolvedValue([{ attempt_count: 1 }]);
        crawler.stageCandidate.mockRejectedValue(new Error('network failed'));

        await expect(service.processStep('run-1')).rejects.toThrow('network failed');
        expect(prisma.learnNowCrawlRun.updateMany).toHaveBeenCalledWith(expect.objectContaining({
            data: { attemptCount: { increment: 1 } },
        }));
        expect(prisma.learnNowCrawlRun.updateMany).not.toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ processedCount: { increment: 1 } }),
        }));
    });

    it('returns the resumed run directly for the frontend contract', async () => {
        const { service, prisma, queue } = makeService();
        prisma.learnNowCrawlRun.findFirst.mockResolvedValue({ id: 'run-1', status: 'QUEUED', processedCount: 2 });

        await expect(service.resume('run-1')).resolves.toEqual({
            id: 'run-1',
            status: 'QUEUED',
            processedCount: 2,
        });
        expect(queue.add).toHaveBeenCalledWith(
            'learnnow-crawl-step',
            { runId: 'run-1' },
            expect.objectContaining({ jobId: expect.stringContaining('learnnow-run-run-1-resume-2-') }),
        );
    });

    it('returns a failed resume to PAUSED when enqueueing fails', async () => {
        const { service, prisma, queue } = makeService();
        prisma.learnNowCrawlRun.findFirst.mockResolvedValue({ id: 'run-1', status: 'QUEUED', processedCount: 2 });
        queue.add.mockRejectedValue(new Error('redis unavailable'));

        await expect(service.resume('run-1')).rejects.toThrow('redis unavailable');
        expect(prisma.learnNowCrawlRun.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({
            where: { id: 'run-1', status: 'QUEUED' },
            data: expect.objectContaining({ status: 'PAUSED', lastError: 'redis unavailable' }),
        }));
    });
});
