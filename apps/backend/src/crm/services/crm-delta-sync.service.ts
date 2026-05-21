import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CrmProvider } from '@aluplan/database';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../../utils/crypto.service';
import { Dynamics365Adapter } from '../adapters/dynamics365.adapter';
import { CrmRecordSyncService } from './crm-record-sync.service';
import { NotificationsGateway } from '../../notifications/notifications.gateway';

type EntityType = 'account' | 'contact';

interface DeltaResult {
    entityType: EntityType;
    totalFetched: number;
    successCount: number;
    errorCount: number;
    changeCount: number;
}

@Injectable()
export class CrmDeltaSyncService implements OnApplicationBootstrap {
    private readonly logger = new Logger(CrmDeltaSyncService.name);

    constructor(
        @InjectQueue('crm-sync') private readonly crmQueue: Queue,
        private readonly prisma: PrismaService,
        private readonly crypto: CryptoService,
        private readonly dynamics365: Dynamics365Adapter,
        private readonly recordSync: CrmRecordSyncService,
        private readonly notifications: NotificationsGateway,
    ) { }

    async onApplicationBootstrap() {
        try {
            await this.crmQueue.add(
                'delta-sync',
                {},
                {
                    repeat: {
                        pattern: process.env.CRM_DELTA_SYNC_INTERVAL || '*/5 * * * *',
                    },
                    jobId: 'crm-delta-sync-repeatable',
                },
            );
            this.logger.log(`📢 CRM Delta Sync repeatable job registered successfully with interval: ${process.env.CRM_DELTA_SYNC_INTERVAL || '*/5 * * * *'}`);
        } catch (error) {
            this.logger.error(`❌ Failed to register CRM Delta Sync repeatable job: ${error.message}`, error.stack);
        }
    }

    async runScheduledDeltaSync() {
        const connections = await this.prisma.crmConnection.findMany({
            where: {
                provider: CrmProvider.DYNAMICS_365,
                isActive: true,
                deletedAt: null,
            },
        });

        for (const connection of connections) {
            try {
                await this.runDeltaSync(connection.id);
            } catch (error) {
                this.logger.error(`CRM delta sync failed for connection ${connection.id}: ${error.message}`, error.stack);
                await this.notifications.emitCrmSyncError({
                    connectionId: connection.id,
                    message: error.message,
                });
            }
        }
    }

    async runDeltaSync(connectionId: string): Promise<{ account: DeltaResult; contact: DeltaResult }> {
        const connection = await this.prisma.crmConnection.findFirst({
            where: { id: connectionId, deletedAt: null, isActive: true },
        });
        if (!connection) {
            throw new Error(`Active CRM connection ${connectionId} not found`);
        }

        const decryptedConnection = {
            ...connection,
            clientSecret: connection.clientSecret ? this.crypto.decrypt(connection.clientSecret) : null,
            webhookSecret: connection.webhookSecret ? this.crypto.decrypt(connection.webhookSecret) : null,
        };

        const account = await this.syncEntity(decryptedConnection, 'account');
        const contact = await this.syncEntity(decryptedConnection, 'contact');
        const reconciledProfiles = await this.recordSync.reconcileLinkedCustomerProfileSnapshots();
        if (reconciledProfiles > 0) {
            this.logger.log(`CRM profile snapshots reconciled for ${reconciledProfiles} linked customer profiles`);
        }
        return { account, contact };
    }

    async getRecentChanges(connectionId?: string, limit = 50) {
        return this.prisma.crmChangeLog.findMany({
            where: connectionId ? { connectionId } : undefined,
            orderBy: { changedAt: 'desc' },
            take: Math.min(Math.max(limit, 1), 200),
        });
    }

    private async syncEntity(connection: any, entityType: EntityType): Promise<DeltaResult> {
        const state = await this.prisma.crmDeltaSyncState.findUnique({
            where: {
                connectionId_entityType: {
                    connectionId: connection.id,
                    entityType,
                },
            },
        });

        const startedAt = new Date();
        let successCount = 0;
        let errorCount = 0;

        try {
            const before = await this.prisma.crmChangeLog.count({
                where: {
                    connectionId: connection.id,
                    entityType,
                    source: 'DELTA_SYNC',
                    changedAt: { gte: startedAt },
                },
            });

            const { records, deltaLink } = await this.dynamics365.fetchDeltaRecords(
                connection,
                entityType,
                state?.deltaLink ?? null,
            );

            for (const record of records) {
                try {
                    const syncOptions = {
                        connectionId: connection.id,
                        source: 'DELTA_SYNC' as const,
                        recordChanges: true,
                    };

                    if (this.dynamics365.isDeletedDeltaRecord(record) || record.statecode === 1) {
                        if (entityType === 'account') {
                            await this.recordSync.markAccountDeletedOrInactive(record, syncOptions);
                        } else {
                            await this.recordSync.markContactDeletedOrInactive(record, syncOptions);
                        }
                    } else if (entityType === 'account') {
                        await this.recordSync.upsertAccountFromDynamics(record, connection, syncOptions);
                    } else {
                        await this.recordSync.upsertContactFromDynamics(record, connection, syncOptions);
                    }
                    successCount++;
                } catch (error) {
                    errorCount++;
                    this.logger.error(`CRM delta ${entityType} record failed: ${error.message}`, error.stack);
                }
            }

            await this.prisma.crmDeltaSyncState.upsert({
                where: {
                    connectionId_entityType: {
                        connectionId: connection.id,
                        entityType,
                    },
                },
                update: {
                    deltaLink: deltaLink ?? state?.deltaLink ?? null,
                    lastSuccessfulSyncAt: startedAt,
                    lastError: null,
                },
                create: {
                    connectionId: connection.id,
                    entityType,
                    deltaLink,
                    lastSuccessfulSyncAt: startedAt,
                    lastError: null,
                },
            });

            const after = await this.prisma.crmChangeLog.count({
                where: {
                    connectionId: connection.id,
                    entityType,
                    source: 'DELTA_SYNC',
                    changedAt: { gte: startedAt },
                },
            });
            const changeCount = Math.max(after - before, 0);

            if (changeCount > 0) {
                await this.notifications.emitCrmChanges({
                    connectionId: connection.id,
                    entityType,
                    changeCount,
                });
            }

            return {
                entityType,
                totalFetched: records.length,
                successCount,
                errorCount,
                changeCount,
            };
        } catch (error) {
            await this.prisma.crmDeltaSyncState.upsert({
                where: {
                    connectionId_entityType: {
                        connectionId: connection.id,
                        entityType,
                    },
                },
                update: { lastError: error.message },
                create: {
                    connectionId: connection.id,
                    entityType,
                    deltaLink: state?.deltaLink ?? null,
                    lastError: error.message,
                },
            });
            throw error;
        }
    }
}
