import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, QueueEvents } from 'bullmq';

/**
 * QueueMonitorService — BullMQ health and DLQ monitoring.
 *
 * Uses QueueEvents (separate Redis connection) to listen for
 * stalled, failed, and completed events across critical queues.
 */
@Injectable()
export class QueueMonitorService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(QueueMonitorService.name);
    private readonly queueEvents: QueueEvents[] = [];

    constructor(
        @InjectQueue('ai-query-processing') private readonly aiQueue: Queue,
        @InjectQueue('email') private readonly emailQueue: Queue,
        @InjectQueue('crm-sync') private readonly crmQueue: Queue,
        @InjectQueue('document-parsing') private readonly docQueue: Queue,
    ) { }

    onModuleInit() {
        this.monitorQueue(this.aiQueue, 'ai-query-processing');
        this.monitorQueue(this.emailQueue, 'email');
        this.monitorQueue(this.crmQueue, 'crm-sync');
        this.monitorQueue(this.docQueue, 'document-parsing');
    }

    async onModuleDestroy() {
        for (const qe of this.queueEvents) {
            await qe.close();
        }
    }

    private monitorQueue(queue: Queue, name: string) {
        try {
            const queueEvents = new QueueEvents(name, {
                connection: (queue as any).opts?.connection ?? {
                    host: process.env.REDIS_HOST ?? 'localhost',
                    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
                },
            });

            this.queueEvents.push(queueEvents);

            queueEvents.on('stalled', ({ jobId }: { jobId: string }) => {
                this.logger.warn(`[${name}] Job stalled: ${jobId}`);
            });

            queueEvents.on('failed', ({ jobId, failedReason }: { jobId: string; failedReason: string }) => {
                this.logger.error(`[${name}] Job failed: ${jobId} — ${failedReason}`);
            });

            queueEvents.on('completed', ({ jobId }: { jobId: string }) => {
                this.logger.debug(`[${name}] Job completed: ${jobId}`);
            });
        } catch (err: any) {
            this.logger.error(`[${name}] Failed to attach QueueEvents: ${err.message}`);
        }
    }

    /**
     * Get DLQ (failed) jobs for a queue.
     */
    async getFailedJobs(queueName: 'ai-query-processing' | 'email' | 'crm-sync' | 'document-parsing', count = 50) {
        const queue = this.getQueueByName(queueName);
        return queue.getFailed(0, count);
    }

    private getQueueByName(name: string): Queue {
        switch (name) {
            case 'ai-query-processing': return this.aiQueue;
            case 'email': return this.emailQueue;
            case 'crm-sync': return this.crmQueue;
            case 'document-parsing': return this.docQueue;
            default: throw new Error(`Unknown queue: ${name}`);
        }
    }
}
