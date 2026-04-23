import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

/**
 * QueueMonitorService — BullMQ health and DLQ monitoring.
 *
 * Attaches event listeners to critical queues to log stalled jobs,
 * failed jobs (for DLQ visibility), and completion metrics.
 * Extend this service to add alerting (PagerDuty, Slack, etc.)
 */
@Injectable()
export class QueueMonitorService implements OnModuleInit {
    private readonly logger = new Logger(QueueMonitorService.name);

    constructor(
        @InjectQueue('ai-query-processing') private readonly aiQueue: Queue,
        @InjectQueue('email') private readonly emailQueue: Queue,
        @InjectQueue('crm-sync') private readonly crmQueue: Queue,
        @InjectQueue('document-parsing') private readonly docQueue: Queue,
    ) {}

    onModuleInit() {
        this.monitorQueue(this.aiQueue, 'ai-query-processing');
        this.monitorQueue(this.emailQueue, 'email');
        this.monitorQueue(this.crmQueue, 'crm-sync');
        this.monitorQueue(this.docQueue, 'document-parsing');
    }

    private monitorQueue(queue: Queue, name: string) {
        const events = queue.events;
        if (!events) return;

        events.on('stalled', ({ jobId }) => {
            this.logger.warn(`[${name}] Job stalled: ${jobId}`);
        });

        events.on('failed', ({ jobId, failedReason }) => {
            this.logger.error(`[${name}] Job failed: ${jobId} — ${failedReason}`);
        });

        events.on('completed', ({ jobId, returnvalue }) => {
            this.logger.debug(`[${name}] Job completed: ${jobId}`);
        });
    }

    /**
     * Get DLQ (failed) jobs for a queue.
     */
    async getFailedJobs(queueName: 'ai-query-processing' | 'email' | 'crm-sync' | 'document-parsing', count = 50) {
        const queue = this.getQueueByName(queueName);
        return queue.getFailed(count, 0);
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
