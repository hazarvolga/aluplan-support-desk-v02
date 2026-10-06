import { LearnNowCrawlProcessor } from './learnnow-crawl.processor';

describe('LearnNowCrawlProcessor', () => {
    it('delegates one durable step to the run service', async () => {
        const runs = { processStep: jest.fn().mockResolvedValue(undefined) };
        const processor = new LearnNowCrawlProcessor(runs as any);

        await processor.process({ id: 'job-1', data: { runId: 'run-1' } } as any);

        expect(runs.processStep).toHaveBeenCalledWith('run-1');
    });

    it('marks a run failed only after the final retained retry', async () => {
        const runs = { processStep: jest.fn(), fail: jest.fn().mockResolvedValue(undefined) };
        const processor = new LearnNowCrawlProcessor(runs as any);
        const job = {
            id: 'job-1',
            data: { runId: 'run-1' },
            opts: { attempts: 3 },
            attemptsMade: 3,
        } as any;

        await processor.onFailed(job, new Error('upstream unavailable'));

        expect(runs.fail).toHaveBeenCalledWith('run-1', 'upstream unavailable');
    });
});
