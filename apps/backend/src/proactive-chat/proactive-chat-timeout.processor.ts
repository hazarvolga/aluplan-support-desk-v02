import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProactiveChatService } from './proactive-chat.service';
import { PROACTIVE_CHAT_QUEUE } from './proactive-chat.constants';

@Processor(PROACTIVE_CHAT_QUEUE)
export class ProactiveChatTimeoutProcessor extends WorkerHost {
    private readonly logger = new Logger(ProactiveChatTimeoutProcessor.name);

    constructor(private readonly proactiveChatService: ProactiveChatService) {
        super();
    }

    async process(job: Job): Promise<void> {
        this.logger.log(`Processing job "${job.name}" for session ${job.data.sessionId}`);

        switch (job.name) {
            case 'pending-timeout':
                await this.proactiveChatService.handlePendingTimeout(job.data.sessionId);
                break;
            case 'disconnect-timeout':
                await this.proactiveChatService.handleDisconnectTimeout(
                    job.data.sessionId,
                    job.data.userId,
                );
                break;
            default:
                this.logger.warn(`Unknown job name: ${job.name}`);
        }
    }
}
