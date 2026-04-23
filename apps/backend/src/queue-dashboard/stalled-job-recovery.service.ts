import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

/**
 * StalledJobRecoveryService — Auto-recovery for stuck BullMQ jobs.
 *
 * Periodically checks for failed jobs across critical queues
 * and attempts to retry them or alert administrators.
 */
@Injectable()
export class StalledJobRecoveryService implements OnModuleInit {
    private readonly logger = new Logger(StalledJobRecoveryService.name);

    constructor(
        @InjectQueue('ai-query-processing') private readonly aiQueue: Queue,
        @InjectQueue('email') private readonly emailQueue: Queue,
        @InjectQueue('crm-sync') private readonly crmQueue: Queue,
        @InjectQueue('document-parsing') private readonly docQueue: Queue,
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    onModuleInit() {
        // Check for stalled/failed jobs every 5 minutes
        setInterval(() => this.checkStalledJobs(), 5 * 60 * 1000);
    }

    private async checkStalledJobs() {
        const queues = [
            { name: 'ai-query-processing', queue: this.aiQueue },
            { name: 'email', queue: this.emailQueue },
            { name: 'crm-sync', queue: this.crmQueue },
            { name: 'document-parsing', queue: this.docQueue },
        ];

        for (const { name, queue } of queues) {
            try {
                const failedCount = await queue.getFailedCount();
                if (failedCount > 0) {
                    this.logger.warn(`[${name}] ${failedCount} failed jobs detected`);
                    // Get failed jobs and attempt retry
                    const jobs = await queue.getFailed(0, 100);
                    for (const job of jobs) {
                        try {
                            await job.retry();
                            this.logger.log(`[${name}] Retried failed job ${job.id}`);
                        } catch (err: any) {
                            this.logger.error(`[${name}] Failed to retry job ${job.id}: ${err.message}`);
                        }
                    }
                }
            } catch (err: any) {
                this.logger.error(`[${name}] Error checking failed jobs: ${err.message}`);
            }
        }
    }
}
