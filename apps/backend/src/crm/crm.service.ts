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
        const connections = await this.prisma.crmConnection.findMany({
            include: {
                _count: {
                    select: { syncLogs: true }
                }
            }
        });

        // Decrypt secrets for the UI (Admin only)
        return connections.map(conn => ({
            ...conn,
            clientSecret: conn.clientSecret ? this.crypto.decrypt(conn.clientSecret) : null,
            webhookSecret: conn.webhookSecret ? this.crypto.decrypt(conn.webhookSecret) : null
        }));
    }

    async upsertConnection(dto: any) {
        const { provider, ...config } = dto;

        // Verify connection before saving
        const adapter = this.getAdapter(provider);
        const isValid = await adapter.verifyConnection(config);

        if (!isValid) {
            throw new BadRequestException('CRM bağlantı doğrulaması başarısız oldu. Lütfen bilgileri kontrol edin.');
        }

        // Encrypt secrets before saving
        const encryptedConfig = {
            ...config,
            clientSecret: config.clientSecret ? this.crypto.encrypt(config.clientSecret) : null,
            webhookSecret: config.webhookSecret ? this.crypto.encrypt(config.webhookSecret) : null
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

    async getAccountById(id: string) {
        const account = await this.prisma.crmAccount.findUnique({
            where: { id },
            include: {
                customers: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                fullName: true,
                                status: true
                            }
                        }
                    }
                }
            }
        });

        if (!account) throw new NotFoundException('Şirket kaydı bulunamadı.');
        return account;
    }

    async bulkDeleteAccounts(ids: string[]) {
        if (!ids || ids.length === 0) return { deletedCount: 0 };

        const result = await this.prisma.crmAccount.deleteMany({
            where: { id: { in: ids } }
        });

        return { deletedCount: result.count };
    }

    async processDynamics365Webhook(payload: any) {
        this.logger.debug(`Processing Dynamics 365 Webhook payload for entity: ${payload.entity}`);
        const adapter = this.getAdapter(CrmProvider.DYNAMICS_365) as Dynamics365Adapter;

        if (payload.entity === 'account') {
            return this.syncSingleAccount(payload.data);
        } else if (payload.entity === 'contact') {
            return this.syncSingleContact(payload.data);
        } else {
            throw new BadRequestException(`Unsupported entity type: ${payload.entity}`);
        }
    }

    private async syncSingleAccount(data: any) {
        const industryFormatted = data['industrycode@OData.Community.Display.V1.FormattedValue'] || data.industrycode_display;

        return this.prisma.crmAccount.upsert({
            where: { externalAccountId: data.accountid },
            update: {
                name: data.name,
                website: data.websiteurl,
                address: data.address1_composite,
                industry: industryFormatted,
                crmVerified: true,
            },
            create: {
                name: data.name,
                externalAccountId: data.accountid,
                website: data.websiteurl,
                address: data.address1_composite,
                industry: industryFormatted,
                crmVerified: true,
            },
        });
    }

    private async syncSingleContact(data: any) {
        // This is a simplified version of the adapter logic for a single contact
        if (!data.emailaddress1) {
            this.logger.warn(`Webhook received for contact without email: ${data.contactid}`);
            return;
        }

        return this.prisma.$transaction(async (tx) => {
            // 1. Find or create User
            let user = await tx.user.findUnique({
                where: { email: data.emailaddress1 },
            });

            if (!user) {
                user = await tx.user.create({
                    data: {
                        email: data.emailaddress1,
                        fullName: `${data.firstname || ''} ${data.lastname || ''}`.trim() || 'CRM Contact',
                        role: 'VIEWER',
                        status: 'ACTIVE',
                        passwordHash: 'CRM_SYNCED',
                    },
                });
            }

            // 2. Find Linked Account if any
            let linkedAccountId: string | undefined = undefined;
            let accountInfo: any = null;

            const accountId = data.parentcustomerid_account?.accountid || data._parentcustomerid_value;

            if (accountId) {
                accountInfo = await tx.crmAccount.findUnique({
                    where: { externalAccountId: accountId },
                });
                linkedAccountId = accountInfo?.id;
            }

            const statusFormatted = data['new_musteridurumu@OData.Community.Display.V1.FormattedValue'] || data.new_musteridurumu_display;
            const clientNo = data.accountnumber || accountInfo?.customerNo || `DYN-${data.contactid.substring(0, 8)}`;
            const industryFromAccount = accountInfo?.industry;

            // 3. Upsert CustomerProfile
            return tx.customerProfile.upsert({
                where: { userId: user.id },
                update: {
                    firstName: data.firstname,
                    lastName: data.lastname,
                    jobTitle: data.jobtitle,
                    phoneNumber: data.telephone1,
                    companyName: data.parentcustomerid_account?.name || accountInfo?.name || 'Unknown',
                    accountId: linkedAccountId,
                    externalContactId: data.contactid,
                    customerNo: clientNo,
                    contractStatus: statusFormatted,
                    industry: industryFromAccount,
                    crmVerified: true,
                },
                create: {
                    userId: user.id,
                    firstName: data.firstname,
                    lastName: data.lastname,
                    customerNo: clientNo,
                    jobTitle: data.jobtitle,
                    phoneNumber: data.telephone1,
                    companyName: data.parentcustomerid_account?.name || accountInfo?.name || 'Unknown',
                    accountId: linkedAccountId,
                    externalContactId: data.contactid,
                    contractStatus: statusFormatted,
                    industry: industryFromAccount,
                    crmVerified: true,
                },
            });
        });
    }
}
