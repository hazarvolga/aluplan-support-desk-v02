import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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
export class CrmDeltaSyncService {
    private readonly logger = new Logger(CrmDeltaSyncService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly crypto: CryptoService,
        private readonly dynamics365: Dynamics365Adapter,
        private readonly recordSync: CrmRecordSyncService,
        private readonly notifications: NotificationsGateway,
    ) { }

    @Cron(process.env.CRM_DELTA_SYNC_INTERVAL || '*/15 * * * *')
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
        return (this.prisma as any).crmChangeLog.findMany({
            where: connectionId ? { connectionId } : undefined,
            orderBy: { changedAt: 'desc' },
            take: Math.min(Math.max(limit, 1), 200),
        });
    }

    private async syncEntity(connection: any, entityType: EntityType): Promise<DeltaResult> {
        const state = await (this.prisma as any).crmDeltaSyncState.findUnique({
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
            const before = await (this.prisma as any).crmChangeLog.count({
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
                    if (this.dynamics365.isDeletedDeltaRecord(record) || record.statecode === 1) {
                        await this.handleDeletedOrInactive(connection.id, entityType, record);
                    } else if (entityType === 'account') {
                        await this.recordSync.upsertAccountFromDynamics(record, connection, {
                            connectionId: connection.id,
                            source: 'DELTA_SYNC',
                            recordChanges: true,
                        });
                    } else {
                        await this.recordSync.upsertContactFromDynamics(record, connection, {
                            connectionId: connection.id,
                            source: 'DELTA_SYNC',
                            recordChanges: true,
                        });
                    }
                    successCount++;
                } catch (error) {
                    errorCount++;
                    this.logger.error(`CRM delta ${entityType} record failed: ${error.message}`, error.stack);
                }
            }

            await (this.prisma as any).crmDeltaSyncState.upsert({
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

            const after = await (this.prisma as any).crmChangeLog.count({
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
            await (this.prisma as any).crmDeltaSyncState.upsert({
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

    private async handleDeletedOrInactive(connectionId: string, entityType: EntityType, record: any) {
        const externalId = record.id || record.accountid || record.contactid;
        if (!externalId) return;

        if (entityType === 'account') {
            const existing = await this.prisma.crmAccount.findUnique({
                where: { externalAccountId: externalId },
            });
            if (!existing) return;

            await this.prisma.crmAccount.update({
                where: { id: existing.id },
                data: { crmVerified: false },
            });
            await (this.prisma as any).crmChangeLog.create({
                data: {
                    connectionId,
                    entityType,
                    entityId: externalId,
                    localRecordId: existing.id,
                    fieldName: 'crmVerified',
                    oldValue: String(existing.crmVerified),
                    newValue: 'false',
                    source: 'DELTA_SYNC',
                    status: 'SUCCESS',
                },
            });
            return;
        }

        const profile = await this.prisma.customerProfile.findUnique({
            where: { externalContactId: externalId },
            include: { user: true },
        });
        if (!profile) return;

        await this.prisma.$transaction(async (tx) => {
            await tx.customerProfile.update({
                where: { id: profile.id },
                data: { deletedAt: new Date(), crmVerified: false },
            });

            if (profile.user?.passwordHash === 'CRM_SYNCED') {
                const adminEmails = (process.env.ADMIN_BYPASS_EMAILS || '')
                    .split(',')
                    .map(e => e.trim().toLowerCase())
                    .filter(Boolean);
                if (!adminEmails.includes(profile.user.email.toLowerCase())) {
                    await tx.user.update({
                        where: { id: profile.user.id },
                        data: { status: 'INACTIVE' },
                    });
                }
            }

            await (tx as any).crmChangeLog.create({
                data: {
                    connectionId,
                    entityType,
                    entityId: externalId,
                    localRecordId: profile.id,
                    fieldName: 'deletedAt',
                    oldValue: profile.deletedAt?.toISOString() ?? null,
                    newValue: new Date().toISOString(),
                    source: 'DELTA_SYNC',
                    status: 'SUCCESS',
                },
            });
        });
    }
}
