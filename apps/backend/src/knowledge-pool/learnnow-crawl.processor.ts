import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { LearnNowCrawlRunService } from './learnnow-crawl-run.service';

@Processor('learnnow-crawl', {
    concurrency: 1,
    limiter: {
        max: 1,
        duration: Math.max(Number(process.env.LEARNNOW_CRAWL_PACING_MS ?? 60_000), 60_000),
    },
})
export class LearnNowCrawlProcessor extends WorkerHost {
    private readonly logger = new Logger(LearnNowCrawlProcessor.name);

    constructor(private readonly runs: LearnNowCrawlRunService) {
        super();
    }

    async process(job: Job<{ runId: string }>): Promise<void> {
        this.logger.log(`🚀 Processing Learn Now crawl run ${job.data.runId} (Job: ${job.id})`);
        await this.runs.processStep(job.data.runId);
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job<{ runId: string }> | undefined, error: Error): Promise<void> {
        if (!job) return;
        this.logger.error(`❌ Learn Now crawl job ${job.id} failed: ${error.message}`, error.stack);
        const attempts = Number(job.opts.attempts ?? 1);
        if (job.attemptsMade >= attempts) {
            await this.runs.fail(job.data.runId, error.message);
        }
    }
}
