import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { CrmService } from './crm.service';
import { CrmDeltaSyncService } from './services/crm-delta-sync.service';
import { PrismaService } from '../prisma/prisma.service';
import { SyncStatus } from '@aluplan/database';

@Processor('crm-sync')
export class CrmProcessor extends WorkerHost {
    private readonly logger = new Logger(CrmProcessor.name);

    constructor(
        private readonly crmService: CrmService,
        private readonly crmDeltaSyncService: CrmDeltaSyncService,
        private readonly prisma: PrismaService,
    ) {
        super();
    }

    async process(job: Job<any, any, string>): Promise<any> {
        if (job.name === 'delta-sync') {
            this.logger.log(`🚀 Starting background CRM Delta Sync (Job: ${job.id})`);
            await this.crmDeltaSyncService.runScheduledDeltaSync();
            return { status: 'completed', type: 'delta' };
        }

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
            await this.crmService.executeSyncProcess(decryptedConnection, adapter, logId);

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
        this.logger.error(`❌ CRM Sync Job ${job.id} failed (Attempt ${job.attemptsMade}/${job.opts?.attempts ?? 1}): ${error.message}`);

        try {
            const maxAttempts = job.opts?.attempts ?? 1;
            if (job.data.logId && job.attemptsMade >= maxAttempts) {
                await this.prisma.crmSyncLog.update({
                    where: { id: job.data.logId },
                    data: {
                        status: SyncStatus.ERROR,
                        errorMessage: error.message,
                        completedAt: new Date()
                    }
                });
                this.logger.log(`ℹ️ Marked CRM Sync Log ${job.data.logId} as ERROR (Final attempt failed)`);
            }
        } catch (dbError: any) {
            this.logger.error(`⚠️ Failed to update CRM sync log status in onFailed: ${dbError?.message ?? dbError}`);
        }
    }
}
