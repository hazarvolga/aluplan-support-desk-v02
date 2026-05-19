import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Dynamics365Adapter } from './adapters/dynamics365.adapter';
import { ICrmAdapter, SyncResult } from './adapters/crm-adapter.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CrmProvider, SyncStatus, Prisma } from '@aluplan/database';
import { CryptoService } from '../utils/crypto.service';

interface FailedRecord {
    externalId: string;
    entityType: 'account' | 'contact';
    errorMessage: string;
    errorCode?: string;
}

interface SkippedRecord {
    externalId: string;
    reason: string;
}

interface SkippedLink {
    contactExternalId: string;
    missingAccountExternalId: string;
}

interface SyncDetails {
    failedRecords: FailedRecord[];
    skippedRecords: SkippedRecord[];
    skippedLinks: SkippedLink[];
    summary: {
        successCount: number;
        errorCount: number;
        skippedCount: number;
    };
}

function buildSyncDetails(
    accountResult: SyncResult,
    contactResult: SyncResult,
): SyncDetails {
    const failedRecords: FailedRecord[] = [
        ...(accountResult.failedRecords ?? []).map(r => ({
            externalId: r.externalId,
            entityType: 'account' as const,
            errorMessage: r.errorMessage,
            errorCode: r.errorCode,
        })),
        ...(contactResult.failedRecords ?? []).map(r => ({
            externalId: r.externalId,
            entityType: 'contact' as const,
            errorMessage: r.errorMessage,
            errorCode: r.errorCode,
        })),
    ];

    const skippedRecords: SkippedRecord[] = [
        ...(accountResult.skippedRecords ?? []),
        ...(contactResult.skippedRecords ?? []),
    ];

    const skippedLinks: SkippedLink[] = [
        ...(accountResult.skippedLinks ?? []),
        ...(contactResult.skippedLinks ?? []),
    ];

    return {
        failedRecords,
        skippedRecords,
        skippedLinks,
        summary: {
            successCount: accountResult.successCount + contactResult.successCount,
            errorCount: accountResult.errorCount + contactResult.errorCount,
            skippedCount: (accountResult.skippedRecords?.length ?? 0) + (contactResult.skippedRecords?.length ?? 0),
        },
    };
}

import { PiiMaskingService } from '../common/services/pii-masking.service';
import { CrmRecordSyncService } from './services/crm-record-sync.service';
import { CrmDeltaSyncService } from './services/crm-delta-sync.service';

export interface CrmContact {
    contactId: string;           // CustomerProfile.id
    externalContactId?: string;  // CustomerProfile.externalContactId
    emailAddress: string;        // User.email
    firstName?: string;
    lastName?: string;
    companyName?: string;
    crmVerified: boolean;
}

@Injectable()
export class CrmService {
    private readonly logger = new Logger(CrmService.name);
    private adapters: Map<CrmProvider, ICrmAdapter> = new Map();

    constructor(
        @InjectQueue('crm-sync') private crmQueue: Queue,
        private prisma: PrismaService,
        private dynamics365: Dynamics365Adapter,
        private crypto: CryptoService,
        private piiMasking: PiiMaskingService,
        private recordSync: CrmRecordSyncService,
        private deltaSync: CrmDeltaSyncService,
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

    /**
     * Looks up a CRM contact by email address using the locally-synced database.
     *
     * Queries CustomerProfile joined with User where user.email matches (case-insensitive)
     * and crmVerified = true. Returns null when no matching contact is found.
     *
     * @param email - The email address to look up
     * @returns CrmContact if found, null otherwise
     */
    async findContactByEmail(email: string): Promise<CrmContact | null> {
        const maskedEmail = this.piiMasking.maskSensitiveData(email);
        this.logger.debug(`CRM contact lookup initiated for: ${maskedEmail}`);

        const profile = await this.prisma.customerProfile.findFirst({
            where: {
                crmVerified: true,
                user: {
                    email: {
                        equals: email,
                        mode: 'insensitive',
                    },
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
            },
        });

        if (!profile) {
            this.logger.debug(`CRM contact not found for: ${maskedEmail}`);
            return null;
        }

        this.logger.debug(`CRM contact found for: ${maskedEmail}`);

        return {
            contactId: profile.id,
            externalContactId: profile.externalContactId ?? undefined,
            emailAddress: profile.user.email,
            firstName: profile.firstName ?? undefined,
            lastName: profile.lastName ?? undefined,
            companyName: profile.companyName ?? undefined,
            crmVerified: profile.crmVerified,
        };
    }

    private maskSecret(val: string | null | undefined): string | null {
        if (!val) return null;
        return '********';
    }

    async getAllConnections() {
        const connections = await this.prisma.crmConnection.findMany({
            where: { deletedAt: null },
            include: {
                _count: {
                    select: { syncLogs: true }
                }
            }
        });

        // Use standard masking utility (Security Fix)
        return connections.map(conn => ({
            ...conn,
            clientSecret: this.maskSecret(conn.clientSecret),
            webhookSecret: this.maskSecret(conn.webhookSecret)
        }));
    }

    async upsertConnection(dto: any) {
        const { provider, ...config } = dto;

        // Fetch existing to handle masked secrets
        const existing = await this.prisma.crmConnection.findFirst({
            where: { provider: provider as CrmProvider, deletedAt: null }
        });

        if (config.clientSecret === '********' && existing?.clientSecret) {
            config.clientSecret = this.crypto.decrypt(existing.clientSecret);
        }
        if (config.webhookSecret === '********' && existing?.webhookSecret) {
            config.webhookSecret = this.crypto.decrypt(existing.webhookSecret);
        }

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

        if (existing) {
            return this.prisma.crmConnection.update({
                where: { id: existing.id },
                data: {
                    ...encryptedConfig,
                    isActive: true,
                    syncStatus: SyncStatus.IDLE
                }
            });
        }
        return this.prisma.crmConnection.create({
            data: {
                provider,
                ...encryptedConfig,
                isActive: true,
                syncStatus: SyncStatus.IDLE
            }
        });
    }

    async verifyConnectionById(id: string) {
        const connection = await this.prisma.crmConnection.findFirst({
            where: { id, deletedAt: null }
        });

        if (!connection) throw new NotFoundException('CRM bağlantısı bulunamadı.');

        const adapter = this.getAdapter(connection.provider);
        const config = {
            ...connection,
            clientSecret: connection.clientSecret ? this.crypto.decrypt(connection.clientSecret) : null,
            webhookSecret: connection.webhookSecret ? this.crypto.decrypt(connection.webhookSecret) : null
        };

        try {
            const isValid = await adapter.verifyConnection(config);
            return { success: isValid, provider: connection.provider };
        } catch (error) {
            this.logger.error(`CRM verification failed for ${connection.provider}: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async triggerSync(id: string) {
        const connection = await this.prisma.crmConnection.findFirst({
            where: { id, deletedAt: null }
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

        // Enqueue the sync job instead of fire-and-forget logic
        const job = await this.crmQueue.add('execute-sync', {
            connectionId: connection.id,
            logId: log.id
        }, {
            jobId: `crm-sync-${connection.id}-${log.id}`,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 }
        });

        this.logger.log(`✅ CRM Sync job enqueued: ${job.id} for connection ${connection.id}`);

        return { message: 'Senkronizasyon kuyruğa alındı.', logId: log.id, jobId: job.id };
    }

    public decryptSecret(encrypted: string): string {
        return this.crypto.decrypt(encrypted);
    }

    public async executeSyncProcess(connection: any, adapter: ICrmAdapter, logId: string) {
        let totalAccountRecords = 0;
        let successAccountRecords = 0;
        let errorAccountRecords = 0;

        let totalContactRecords = 0;
        let successContactRecords = 0;
        let errorContactRecords = 0;

        const emptyResult: SyncResult = {
            status: SyncStatus.SUCCESS,
            totalRecords: 0,
            successCount: 0,
            errorCount: 0,
        };

        let accountResult: SyncResult = { ...emptyResult };
        let contactResult: SyncResult = { ...emptyResult };

        try {
            // 1. Sync Accounts (Companies)
            accountResult = await adapter.syncAccounts(connection, (stats) => {
                totalAccountRecords = stats.total;
                successAccountRecords = stats.success;
                errorAccountRecords = stats.error;

                // Update progress every 10 records or at the end
                if ((stats.success + stats.error) % 10 === 0 || stats.success + stats.error === stats.total) {
                    this.prisma.crmSyncLog.update({
                        where: { id: logId },
                        data: {
                            totalRecords: stats.total,
                            successCount: stats.success,
                            errorCount: stats.error,
                        }
                    }).catch(err => this.logger.error(`Failed to update partial account sync log`, err.stack));
                }
            });

            if (accountResult.status === SyncStatus.ERROR) {
                throw new Error(`Account Sync Error: ${accountResult.errorMessage}`);
            }

            // 2. Sync Contacts (People)
            contactResult = await adapter.syncContacts(connection, (stats) => {
                totalContactRecords = stats.total;
                successContactRecords = stats.success;
                errorContactRecords = stats.error;

                // Update progress every 20 records or at the end
                if ((stats.success + stats.error) % 20 === 0 || stats.success + stats.error === stats.total) {
                    this.prisma.crmSyncLog.update({
                        where: { id: logId },
                        data: {
                            totalRecords: totalAccountRecords + stats.total,
                            successCount: successAccountRecords + stats.success,
                            errorCount: errorAccountRecords + stats.error,
                        }
                    }).catch(err => this.logger.error(`Failed to update partial contact sync log`, err.stack));
                }
            });

            if (contactResult.status === SyncStatus.ERROR) {
                throw new Error(`Contact Sync Error: ${contactResult.errorMessage}`);
            }

            // 3. Build details and finalize Log
            const details = buildSyncDetails(accountResult, contactResult);

            await this.prisma.crmSyncLog.update({
                where: { id: logId },
                data: {
                    status: SyncStatus.SUCCESS,
                    completedAt: new Date(),
                    totalRecords: accountResult.totalRecords + contactResult.totalRecords,
                    successCount: accountResult.successCount + contactResult.successCount,
                    errorCount: accountResult.errorCount + contactResult.errorCount,
                    details: details as unknown as Prisma.InputJsonValue,
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
            this.logger.error(`CRM sync process failed: ${error.message}`, error.stack);

            const details = buildSyncDetails(accountResult, contactResult);

            await this.prisma.crmSyncLog.update({
                where: { id: logId },
                data: {
                    status: SyncStatus.ERROR,
                    completedAt: new Date(),
                    errorMessage: error.message,
                    // Keep current counts in the log even on error
                    totalRecords: totalAccountRecords + totalContactRecords,
                    successCount: successAccountRecords + successContactRecords,
                    errorCount: errorAccountRecords + errorContactRecords,
                    details: details as unknown as Prisma.InputJsonValue,
                }
            });

            await this.prisma.crmConnection.update({
                where: { id: connection.id },
                data: { syncStatus: SyncStatus.ERROR }
            });
        }
    }

    async getFieldDefinitions() {
        return {
            account: [
                { key: 'accountNumber', label: 'sync.mapping.fields.account.customerNo', defaultCrmField: 'accountnumber' },
                { key: 'name', label: 'sync.mapping.fields.account.name', defaultCrmField: 'name', isRequired: true },
                { key: 'industry', label: 'sync.mapping.fields.account.industry', defaultCrmField: 'industrycode@OData.Community.Display.V1.FormattedValue' },
                { key: 'clientIdFrilo', label: 'sync.mapping.fields.account.client_id_frilo', defaultCrmField: 'new_clientidfrilo' },
                { key: 'phone', label: 'sync.mapping.fields.account.phone', defaultCrmField: 'telephone1' },
                { key: 'fax', label: 'sync.mapping.fields.account.fax', defaultCrmField: 'fax' },
                { key: 'licenseManagerName', label: 'sync.mapping.fields.account.license_manager_name', defaultCrmField: 'new_lisansyoneticisiisimsoyisim' },
                { key: 'website', label: 'sync.mapping.fields.account.website', defaultCrmField: 'websiteurl' },
                { key: 'address', label: 'sync.mapping.fields.account.address', defaultCrmField: 'address1_composite' },
                { key: 'serviceAddress', label: 'sync.mapping.fields.account.service_address', defaultCrmField: 'address1_composite' },
                { key: 'crmVerified', label: 'sync.mapping.fields.account.crm_verification', defaultCrmField: '' },
                { key: 'externalAccountId', label: 'sync.mapping.fields.account.system_id', defaultCrmField: 'accountid' },
            ],
            contact: [
                { key: 'customerNo', label: 'sync.mapping.fields.contact.customerNo', defaultCrmField: 'new_customerid' },
                { key: 'fullName', label: 'sync.mapping.fields.contact.fullName', defaultCrmField: 'fullname', isRequired: true },
                { key: 'email', label: 'sync.mapping.fields.contact.email', defaultCrmField: 'emailaddress1', isRequired: true },
                { key: 'jobTitle', label: 'sync.mapping.fields.contact.jobTitle', defaultCrmField: 'jobtitle' },
                { key: 'companyName', label: 'sync.mapping.fields.contact.companyName', defaultCrmField: 'parentcustomerid_account.name' },
                { key: 'phoneNumber', label: 'sync.mapping.fields.contact.phoneNumber', defaultCrmField: 'telephone1' },
                { key: 'fax', label: 'sync.mapping.fields.contact.fax', defaultCrmField: 'fax' },
                { key: 'mobilePhone', label: 'sync.mapping.fields.contact.mobile_phone', defaultCrmField: 'mobilephone' },
                { key: 'address', label: 'sync.mapping.fields.contact.address', defaultCrmField: 'address1_composite' },
                { key: 'primaryTimeZone', label: 'sync.mapping.fields.contact.primary_time_zone', defaultCrmField: 'timezoneruleversionnumber' },
                { key: 'preferredContactMethod', label: 'sync.mapping.fields.contact.preferred_contact_method', defaultCrmField: 'preferredcontactmethodcode' },
                { key: 'contractStatus', label: 'sync.mapping.fields.contact.contractStatus', defaultCrmField: 'new_musteridurumu@OData.Community.Display.V1.FormattedValue' },
                { key: 'subscriptionModel', label: 'sync.mapping.fields.contact.subscriptionModel', defaultCrmField: 'new_AbonelikModeli' },
                { key: 'industry', label: 'sync.mapping.fields.contact.industry', defaultCrmField: 'parentcustomerid_account.industrycode@OData.Community.Display.V1.FormattedValue' },
                { key: 'status', label: 'sync.mapping.fields.contact.status', defaultCrmField: '' },
                { key: 'externalContactId', label: 'sync.mapping.fields.contact.system_id', defaultCrmField: 'contactid' },
            ]
        };
    }

    async getSyncLogs(connectionId: string) {
        return this.prisma.crmSyncLog.findMany({
            where: { connectionId },
            orderBy: { startedAt: 'desc' },
            take: 20
        });
    }

    async triggerDeltaSync(id: string) {
        await this.prisma.crmConnection.update({
            where: { id },
            data: { syncStatus: SyncStatus.SYNCING },
        });

        try {
            const result = await this.deltaSync.runDeltaSync(id);
            const errorCount = result.account.errorCount + result.contact.errorCount;
            await this.prisma.crmConnection.update({
                where: { id },
                data: {
                    syncStatus: errorCount > 0 ? SyncStatus.ERROR : SyncStatus.SUCCESS,
                    lastSyncAt: new Date(),
                },
            });
            return result;
        } catch (error) {
            await this.prisma.crmConnection.update({
                where: { id },
                data: { syncStatus: SyncStatus.ERROR },
            });
            throw error;
        }
    }

    async getChangeLogs(connectionId?: string, limit = 50) {
        return this.deltaSync.getRecentChanges(connectionId, limit);
    }

    async getDiscoveryData(connectionId: string) {
        const connection = await this.prisma.crmConnection.findUnique({
            where: { id: connectionId }
        });

        if (!connection) {
            throw new Error('CRM connection not found');
        }

        const adapter = this.adapters.get(connection.provider);
        if (!adapter) {
            throw new Error(`No adapter found for provider ${connection.provider}`);
        }

        // Decrypt secrets for the adapter
        const decryptedConnection = {
            ...connection,
            clientSecret: connection.clientSecret ? this.crypto.decrypt(connection.clientSecret) : null,
            webhookSecret: connection.webhookSecret ? this.crypto.decrypt(connection.webhookSecret) : null
        };

        return adapter.getDiscoveryData(decryptedConnection);
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

        // Mask PII in returned customers (SEC-002)
        if (account.customers) {
            account.customers = account.customers.map(customer => ({
                ...customer,
                phoneNumber: this.piiMasking.maskSensitiveData(customer.phoneNumber || ''),
                user: customer.user ? {
                    ...customer.user,
                    email: this.piiMasking.maskSensitiveData(customer.user.email || '')
                } : null
            })) as typeof account.customers;
        }

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
        const _adapter = this.getAdapter(CrmProvider.DYNAMICS_365) as Dynamics365Adapter;

        if (payload.entity === 'account') {
            return this.syncSingleAccount(payload.data);
        } else if (payload.entity === 'contact') {
            return this.syncSingleContact(payload.data);
        } else {
            throw new BadRequestException(`Unsupported entity type: ${payload.entity}`);
        }
    }

    private async syncSingleAccount(data: any) {
        const connection = await this.prisma.crmConnection.findFirst({
            where: { provider: CrmProvider.DYNAMICS_365, isActive: true, deletedAt: null },
        });
        return this.recordSync.upsertAccountFromDynamics(data, connection, {
            connectionId: connection?.id,
            source: 'WEBHOOK',
            recordChanges: true,
        });
    }

    private async syncSingleContact(data: any) {
        const connection = await this.prisma.crmConnection.findFirst({
            where: { provider: CrmProvider.DYNAMICS_365, isActive: true, deletedAt: null },
        });
        return this.recordSync.upsertContactFromDynamics(data, connection, {
            connectionId: connection?.id,
            source: 'WEBHOOK',
            recordChanges: true,
        });
    }
}
