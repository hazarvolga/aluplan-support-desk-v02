import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

/**
 * StalledJobRecoveryService — Auto-recovery for stuck BullMQ jobs.
 *
 * Periodically checks for stalled jobs across critical queues
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
    ) {}

    onModuleInit() {
        // Check for stalled jobs every 5 minutes
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
                const stalled = await queue.getStalledCount();
                if (stalled > 0) {
                    this.logger.warn(`[${name}] ${stalled} stalled jobs detected`);
                    // Attempt to move stalled jobs to waiting for retry
                    const jobs = await queue.getJobs(['stalled'], 0, 100);
                    for (const job of jobs) {
                        try {
                            await job.retry();
                            this.logger.log(`[${name}] Retried stalled job ${job.id}`);
                        } catch (err: any) {
                            this.logger.error(`[${name}] Failed to retry stalled job ${job.id}: ${err.message}`);
                        }
                    }
                }
            } catch (err: any) {
                this.logger.error(`[${name}] Error checking stalled jobs: ${err.message}`);
            }
        }
    }
}
