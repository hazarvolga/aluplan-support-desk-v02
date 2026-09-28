import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';

/** Joins returned cron callbacks, not detached descendants or all application work. */
@Injectable()
export class CronShutdownService implements OnModuleDestroy {
    constructor(private readonly scheduler: SchedulerRegistry) {}

    async onModuleDestroy(): Promise<void> {
        const jobs = [...this.scheduler.getCronJobs().values()];
        // In the pinned cron version stop() is void, even with waitForCompletion.
        // Stop every future tick synchronously before waiting for any callback.
        for (const job of jobs) job.stop();
        if (jobs.some((job) => !job.waitForCompletion)) {
            throw new Error(
                'Cron completion tracking is required before shutdown',
            );
        }
        // Observe actual callback state; elapsed time never implies completion.
        while (jobs.some((job) => job.isCallbackRunning)) {
            await new Promise<void>((resolve) => setTimeout(resolve, 25));
        }
    }
}
