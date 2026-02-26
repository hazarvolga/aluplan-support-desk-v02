import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Dynamics365Adapter } from './adapters/dynamics365.adapter';
import { ICrmAdapter, SyncResult } from './adapters/crm-adapter.interface';
import { CrmProvider, SyncStatus } from '@prisma/client';
import { CryptoService } from '../utils/crypto.service';

@Injectable()
export class CrmService {
    private readonly logger = new Logger(CrmService.name);
    private adapters: Map<CrmProvider, ICrmAdapter> = new Map();

    constructor(
        private prisma: PrismaService,
        private dynamics365: Dynamics365Adapter,
        private crypto: CryptoService,
    ) {
        // Register available adapters
        this.adapters.set(CrmProvider.DYNAMICS_365, dynamics365);
    }

    getAdapter(provider: CrmProvider): ICrmAdapter {
        const adapter = this.adapters.get(provider);
        if (!adapter) {
            throw new BadRequestException(`CRM provider ${provider} is not supported yet.`);
        }
        return adapter;
    }

    async getAllConnections() {
        return this.prisma.crmConnection.findMany({
            include: {
                _count: {
                    select: { syncLogs: true }
                }
            }
        });
    }

    async upsertConnection(dto: any) {
        const { provider, ...config } = dto;

        // Verify connection before saving
        const adapter = this.getAdapter(provider);
        const isValid = await adapter.verifyConnection(config);

        if (!isValid) {
            throw new BadRequestException('CRM bağlantı doğrulaması başarısız oldu. Lütfen bilgileri kontrol edin.');
        }

        // Encrypt secret before saving
        const encryptedConfig = {
            ...config,
            clientSecret: config.clientSecret ? this.crypto.encrypt(config.clientSecret) : null
        };

        return this.prisma.crmConnection.upsert({
            where: { provider: provider as CrmProvider },
            update: {
                ...encryptedConfig,
                isActive: true,
                syncStatus: SyncStatus.IDLE
            },
            create: {
                provider,
                ...encryptedConfig,
                isActive: true,
                syncStatus: SyncStatus.IDLE
            }
        });
    }

    async triggerSync(id: string) {
        const connection = await this.prisma.crmConnection.findUnique({
            where: { id }
        });

        if (!connection) throw new NotFoundException('CRM bağlantısı bulunamadı.');

        const adapter = this.getAdapter(connection.provider);

        // Initial log entry
        const log = await this.prisma.crmSyncLog.create({
            data: {
                connectionId: connection.id,
                status: SyncStatus.SYNCING,
            }
        });

        // Update connection status
        await this.prisma.crmConnection.update({
            where: { id },
            data: { syncStatus: SyncStatus.SYNCING }
        });

        // Decrypt secret for the adapter
        const decryptedConnection = {
            ...connection,
            clientSecret: connection.clientSecret ? this.crypto.decrypt(connection.clientSecret) : null
        };

        // Strategy: Run sync in background (fire and forget for this request, but log internally)
        this.executeSyncProcess(decryptedConnection, adapter, log.id).catch(err => {
            this.logger.error(`Background sync failed for ${connection.provider}`, err.stack);
        });

        return { message: 'Senkronizasyon başlatıldı.', logId: log.id };
    }

    private async executeSyncProcess(connection: any, adapter: ICrmAdapter, logId: string) {
        try {
            // 1. Sync Accounts (Companies)
            const accountResult = await adapter.syncAccounts(connection);
            if (accountResult.status === SyncStatus.ERROR) {
                throw new Error(`Account Sync Error: ${accountResult.errorMessage}`);
            }

            // 2. Sync Contacts (People)
            const contactResult = await adapter.syncContacts(connection);
            if (contactResult.status === SyncStatus.ERROR) {
                throw new Error(`Contact Sync Error: ${contactResult.errorMessage}`);
            }

            // 3. Finalize Log
            await this.prisma.crmSyncLog.update({
                where: { id: logId },
                data: {
                    status: SyncStatus.SUCCESS,
                    completedAt: new Date(),
                    totalRecords: accountResult.totalRecords + contactResult.totalRecords,
                    successCount: accountResult.successCount + contactResult.successCount,
                    errorCount: accountResult.errorCount + contactResult.errorCount,
                }
            });

            await this.prisma.crmConnection.update({
                where: { id: connection.id },
                data: {
                    syncStatus: SyncStatus.SUCCESS,
                    lastSyncAt: new Date()
                }
            });

        } catch (error) {
            await this.prisma.crmSyncLog.update({
                where: { id: logId },
                data: {
                    status: SyncStatus.ERROR,
                    completedAt: new Date(),
                    errorMessage: error.message
                }
            });

            await this.prisma.crmConnection.update({
                where: { id: connection.id },
                data: { syncStatus: SyncStatus.ERROR }
            });
        }
    }

    async getSyncLogs(connectionId: string) {
        return this.prisma.crmSyncLog.findMany({
            where: { connectionId },
            orderBy: { startedAt: 'desc' },
            take: 20
        });
    }

    async getAccounts() {
        return this.prisma.crmAccount.findMany({
            include: {
                _count: {
                    select: { customers: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }
}
