import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CrmService } from './crm.service';
import { PrismaService } from '../prisma/prisma.service';
import { SyncStatus } from '@aluplan/database';

@Processor('crm-sync')
export class CrmProcessor extends WorkerHost {
    private readonly logger = new Logger(CrmProcessor.name);

    constructor(
        private readonly crmService: CrmService,
        private readonly prisma: PrismaService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        const { connectionId, logId } = job.data;
        this.logger.log(`🚀 Starting background CRM sync for connection: ${connectionId} (Job: ${job.id})`);

        try {
            const connection = await this.prisma.crmConnection.findUnique({
                where: { id: connectionId }
            });

            if (!connection) {
                throw new Error(`CRM connection ${connectionId} not found`);
            }

            const adapter = this.crmService.getAdapter(connection.provider);

            // Use the service helper to decrypt securely
            const decryptedConnection = {
                ...connection,
                clientSecret: connection.clientSecret ? this.crmService.decryptSecret(connection.clientSecret) : null
            };

            // Use the existing internal logic but wrapped in the processor
            await (this.crmService as any).executeSyncProcess(decryptedConnection, adapter, logId);

            return { status: 'completed', connectionId };
        } catch (error) {
            this.logger.error(`❌ Background CRM sync failed: ${error.message}`, error.stack);
            throw error;
        }
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`✅ CRM Sync Job ${job.id} completed`);
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job, error: Error) {
        this.logger.error(`❌ CRM Sync Job ${job.id} failed: ${error.message}`);

        // Ensure status is updated in DB if not already handled by service
        if (job.data.logId) {
            await this.prisma.crmSyncLog.update({
                where: { id: job.data.logId },
                data: {
                    status: SyncStatus.ERROR,
                    errorMessage: error.message,
                    completedAt: new Date()
                }
            });
        }
    }
}
