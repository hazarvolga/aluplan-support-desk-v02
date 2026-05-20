import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SlaCronService } from './sla.cron';

@Processor('sla-processing')
export class SlaProcessor extends WorkerHost {
    private readonly logger = new Logger(SlaProcessor.name);

    constructor(private readonly slaCronService: SlaCronService) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        this.logger.debug(`🚀 Processing SLA job: ${job.name} (Job ID: ${job.id})`);

        try {
            switch (job.name) {
                case 'check-warnings':
                    await this.slaCronService.checkSlaWarnings();
                    return { status: 'completed', job: 'check-warnings' };
                case 'check-breaches':
                    await this.slaCronService.checkSlaBreaches();
                    return { status: 'completed', job: 'check-breaches' };
                case 'auto-close-tickets':
                    await this.slaCronService.autoCloseResolvedTickets();
                    return { status: 'completed', job: 'auto-close-tickets' };
                default:
                    throw new Error(`Unknown SLA job name: ${job.name}`);
            }
        } catch (error) {
            this.logger.error(`❌ SLA job ${job.name} failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`✅ SLA Job ${job.name} completed successfully`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        this.logger.error(`❌ SLA Job ${job.name} failed: ${error.message}`);
    }
}
