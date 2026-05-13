import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AiQueryService } from './ai-query.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Processor('ai-query-processing', {
    concurrency: 2,
    limiter: {
        max: parseInt(process.env.AI_QUEUE_RATE_MAX ?? '15', 10),
        duration: parseInt(process.env.AI_QUEUE_RATE_DURATION_MS ?? '60000', 10),
    },
})
export class AiQueryProcessor extends WorkerHost {
    private readonly logger = new Logger(AiQueryProcessor.name);

    constructor(
        private readonly aiQueryService: AiQueryService,
        private readonly notifications: NotificationsGateway,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { options, jobId } = job.data;
        this.logger.log(`⚙️ Background AI Processing: ${jobId} (User: ${options.userId})`);

        try {
            // Standardize channel to queue tracking
            options.channel = options.channel || 'WEB_ASYNC';
            const response = await this.aiQueryService.queryInternal(options);
            const result = {
                answer: response.answer,
                answerMode: response.answerMode,
                interactionId: response.interactionId,
                confidence: response.confidence,
                suggestTicket: response.suggestTicket,
                status: 'COMPLETED',
            };

            // Notify client via WebSocket completion
            if (options.userId) {
                this.notifications.sendToUser(options.userId, 'AI_QUERY_COMPLETED', {
                    jobId,
                    result
                });
            }

            this.logger.log(`✅ AI Job Completed: ${jobId}`);
            return result;

        } catch (error) {
            this.logger.error(`❌ AI Job Failed: ${jobId} - ${error.message}`);

            if (job.data.options?.userId) {
                this.notifications.sendToUser(job.data.options.userId, 'AI_QUERY_FAILED', {
                    jobId,
                    error: error.message
                });
            }
            throw error;
        }
    }
}
