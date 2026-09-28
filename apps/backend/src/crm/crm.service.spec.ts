// P2 — Orkestrasyon: CrmService
import { Test, TestingModule } from '@nestjs/testing';
import { CrmService } from './crm.service';
import { PrismaService } from '../prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { Dynamics365Adapter } from './adapters/dynamics365.adapter';
import { CryptoService } from '../utils/crypto.service';
import { PiiMaskingService } from '../common/services/pii-masking.service';
import { CrmRecordSyncService } from './services/crm-record-sync.service';
import { CrmDeltaSyncService } from './services/crm-delta-sync.service';
import { SyncStatus, CrmProvider } from '@aluplan/database';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeResult(overrides: Record<string, any> = {}) {
    return {
        status: SyncStatus.SUCCESS,
        totalRecords: 5,
        successCount: 5,
        errorCount: 0,
        failedRecords: [],
        skippedRecords: [],
        skippedLinks: [],
        ...overrides,
    };
}

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockPrisma = {
    crmConnection: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
    },
    crmSyncLog: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
    },
    crmAccount: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
        upsert: jest.fn(),
    },
    $transaction: jest.fn(),
};

const mockAdapter = {
    provider: CrmProvider.DYNAMICS_365,
    verifyConnection: jest.fn(),
    syncAccounts: jest.fn(),
    syncContacts: jest.fn(),
    getDiscoveryData: jest.fn(),
};

const mockQueue = {
    add: jest.fn().mockResolvedValue({ id: 'job-1' }),
};

const mockCrypto = {
    encrypt: jest.fn((v: string) => `enc:${v}`),
    decrypt: jest.fn((v: string) => v.replace('enc:', '')),
};

const mockRecordSync = {
    upsertAccountFromDynamics: jest.fn(),
    upsertContactFromDynamics: jest.fn(),
    markAccountDeletedOrInactive: jest.fn(),
    markContactDeletedOrInactive: jest.fn(),
};

const mockDeltaSync = {
    runDeltaSync: jest.fn(),
    getRecentChanges: jest.fn(),
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CrmService', () => {
    let service: CrmService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CrmService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: Dynamics365Adapter, useValue: mockAdapter },
                { provide: CryptoService, useValue: mockCrypto },
                { provide: getQueueToken('crm-sync'), useValue: mockQueue },
                {
                    provide: PiiMaskingService,
                    useValue: { maskSensitiveData: jest.fn((val) => val) },
                },
                { provide: CrmRecordSyncService, useValue: mockRecordSync },
                { provide: CrmDeltaSyncService, useValue: mockDeltaSync },
            ],
        }).compile();

        service = module.get<CrmService>(CrmService);
        jest.clearAllMocks();
    });

    // ── getAdapter ────────────────────────────────────────────────────────────

    describe('getAdapter', () => {
        it('should return adapter for DYNAMICS_365', () => {
            expect(service.getAdapter(CrmProvider.DYNAMICS_365)).toBe(mockAdapter);
        });

        it('should throw BadRequestException for unsupported provider', () => {
            expect(() => service.getAdapter('SALESFORCE' as any)).toThrow(BadRequestException);
        });
    });

    // ── upsertConnection ──────────────────────────────────────────────────────

    describe('upsertConnection', () => {
        it('should throw BadRequestException when connection verification fails', async () => {
            mockAdapter.verifyConnection.mockResolvedValue(false);
            mockPrisma.crmConnection.findFirst.mockResolvedValue(null);

            await expect(
                service.upsertConnection({
                    provider: CrmProvider.DYNAMICS_365,
                    clientSecret: 'sec',
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should encrypt secrets before saving', async () => {
            mockAdapter.verifyConnection.mockResolvedValue(true);
            mockPrisma.crmConnection.findFirst.mockResolvedValue(null);
            mockPrisma.crmConnection.create.mockResolvedValue({});

            await service.upsertConnection({
                provider: CrmProvider.DYNAMICS_365,
                clientSecret: 'plain-secret',
                webhookSecret: 'plain-webhook',
            });

            expect(mockCrypto.encrypt).toHaveBeenCalledWith('plain-secret');
            expect(mockCrypto.encrypt).toHaveBeenCalledWith('plain-webhook');
        });

        it('preserves the caller payload and never returns encrypted secrets', async () => {
            const dto = {
                provider: CrmProvider.DYNAMICS_365,
                tenantId: 'tenant-id',
                clientId: 'client-id',
                clientSecret: '********',
                webhookSecret: '********',
                instanceUrl: 'https://org.crm4.dynamics.com',
            };
            const snapshot = { ...dto };
            mockAdapter.verifyConnection.mockResolvedValue(true);
            mockPrisma.crmConnection.findFirst.mockResolvedValue({
                id: 'connection-1',
                clientSecret: 'enc:existing-secret',
                webhookSecret: 'enc:existing-webhook',
            });
            mockPrisma.crmConnection.update.mockResolvedValue({
                id: 'connection-1',
                clientSecret: 'enc:existing-secret',
                webhookSecret: 'enc:existing-webhook',
            });

            const result = await service.upsertConnection(dto);

            expect(dto).toEqual(snapshot);
            expect(mockAdapter.verifyConnection).toHaveBeenCalledWith(expect.objectContaining({
                clientSecret: 'existing-secret',
                webhookSecret: 'existing-webhook',
            }));
            expect(result).toEqual(expect.objectContaining({
                clientSecret: '********',
                webhookSecret: '********',
            }));
            expect(JSON.stringify(result)).not.toContain('enc:');
        });

        it('preserves an existing webhook secret when the optional field is omitted', async () => {
            mockAdapter.verifyConnection.mockResolvedValue(true);
            mockPrisma.crmConnection.findFirst.mockResolvedValue({
                id: 'connection-1',
                clientSecret: 'enc:existing-secret',
                webhookSecret: 'enc:existing-webhook',
            });
            mockPrisma.crmConnection.update.mockResolvedValue({
                id: 'connection-1',
                clientSecret: 'enc:existing-secret',
                webhookSecret: 'enc:existing-webhook',
            });

            await service.upsertConnection({
                provider: CrmProvider.DYNAMICS_365,
                tenantId: 'tenant-id',
                clientId: 'client-id',
                clientSecret: '********',
                instanceUrl: 'https://org.crm4.dynamics.com',
            });

            expect(mockPrisma.crmConnection.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ webhookSecret: 'enc:existing-webhook' }),
            }));
        });
    });

    // ── triggerSync ───────────────────────────────────────────────────────────

    describe('triggerSync', () => {
        it('should throw NotFoundException when connection not found', async () => {
            mockPrisma.crmConnection.findFirst.mockResolvedValue(null);
            await expect(service.triggerSync('non-existent')).rejects.toThrow(NotFoundException);
        });

        it('should create sync log and return logId', async () => {
            mockPrisma.crmConnection.findFirst.mockResolvedValue({
                id: 'conn-1',
                provider: CrmProvider.DYNAMICS_365,
                clientSecret: 'enc:secret',
            });
            mockPrisma.crmSyncLog.create.mockResolvedValue({ id: 'log-1' });
            mockPrisma.crmConnection.update.mockResolvedValue({});

            // Mock background process to avoid running it
            mockAdapter.syncAccounts.mockResolvedValue(makeResult());
            mockAdapter.syncContacts.mockResolvedValue(makeResult());
            mockPrisma.crmSyncLog.update.mockResolvedValue({});

            const result = await service.triggerSync('conn-1');

            expect(result.logId).toBe('log-1');
            expect(result.jobId).toBe('job-1');
            expect(mockPrisma.crmSyncLog.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ status: SyncStatus.SYNCING }),
                }),
            );
            expect(mockQueue.add).toHaveBeenCalled();
        });
    });

    // ── executeSyncProcess (via triggerSync) ──────────────────────────────────

    describe('executeSyncProcess', () => {
        const connection = {
            id: 'conn-1',
            provider: CrmProvider.DYNAMICS_365,
            clientSecret: 'enc:secret',
        };

        beforeEach(() => {
            mockPrisma.crmConnection.findUnique.mockResolvedValue(connection);
            mockPrisma.crmSyncLog.create.mockResolvedValue({ id: 'log-1' });
            mockPrisma.crmConnection.update.mockResolvedValue({});
            mockPrisma.crmSyncLog.update.mockResolvedValue({});
        });

        it('should NOT call syncContacts when syncAccounts returns ERROR', async () => {
            mockAdapter.syncAccounts.mockResolvedValue(makeResult({ status: SyncStatus.ERROR, errorMessage: 'API down' }));

            await service.executeSyncProcess(connection, mockAdapter, 'log-1');

            expect(mockAdapter.syncContacts).not.toHaveBeenCalled();
        });

        it('should save details JSON to CrmSyncLog on success', async () => {
            mockAdapter.syncAccounts.mockResolvedValue(
                makeResult({
                    failedRecords: [{ externalId: 'a1', entityType: 'account', errorMessage: 'err' }],
                }),
            );
            mockAdapter.syncContacts.mockResolvedValue(
                makeResult({
                    skippedRecords: [{ externalId: 'c1', reason: 'missing_email' }],
                    skippedLinks: [{ contactExternalId: 'c2', missingAccountExternalId: 'a2' }],
                }),
            );

            await service.executeSyncProcess(connection, mockAdapter, 'log-1');

            const updateCall = mockPrisma.crmSyncLog.update.mock.calls.find((call: any) => call[0].data?.status === SyncStatus.SUCCESS);
            expect(updateCall).toBeDefined();
            const details = updateCall[0].data.details;
            expect(details.failedRecords).toHaveLength(1);
            expect(details.skippedRecords).toHaveLength(1);
            expect(details.skippedLinks).toHaveLength(1);
            expect(details.summary.successCount).toBe(10);
        });

        it('should save details JSON to CrmSyncLog on error', async () => {
            mockAdapter.syncAccounts.mockResolvedValue(makeResult({ status: SyncStatus.ERROR, errorMessage: 'fail' }));

            await service.executeSyncProcess(connection, mockAdapter, 'log-1');

            const errorUpdateCall = mockPrisma.crmSyncLog.update.mock.calls.find((call: any) => call[0].data?.status === SyncStatus.ERROR);
            expect(errorUpdateCall).toBeDefined();
            expect(errorUpdateCall[0].data.details).toBeDefined();
        });

        it('should set connection syncStatus to SUCCESS on completion', async () => {
            mockAdapter.syncAccounts.mockResolvedValue(makeResult());
            mockAdapter.syncContacts.mockResolvedValue(makeResult());

            await service.executeSyncProcess(connection, mockAdapter, 'log-1');

            expect(mockPrisma.crmConnection.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ syncStatus: SyncStatus.SUCCESS }),
                }),
            );
        });

        it('should set connection syncStatus to ERROR when sync fails', async () => {
            mockAdapter.syncAccounts.mockResolvedValue(makeResult({ status: SyncStatus.ERROR, errorMessage: 'fail' }));

            await service.executeSyncProcess(connection, mockAdapter, 'log-1');

            const errorConnUpdate = mockPrisma.crmConnection.update.mock.calls.find((call: any) => call[0].data?.syncStatus === SyncStatus.ERROR);
            expect(errorConnUpdate).toBeDefined();
        });


    });

    // ── buildSyncDetails (via summary counts) ────────────────────────────────

    describe('buildSyncDetails summary', () => {
        it('should aggregate counts from both account and contact results', async () => {
            const connection = {
                id: 'conn-1',
                provider: CrmProvider.DYNAMICS_365,
                clientSecret: 'enc:secret',
            };
            mockPrisma.crmConnection.findUnique.mockResolvedValue(connection);
            mockPrisma.crmSyncLog.create.mockResolvedValue({ id: 'log-1' });
            mockPrisma.crmConnection.update.mockResolvedValue({});
            mockPrisma.crmSyncLog.update.mockResolvedValue({});

            mockAdapter.syncAccounts.mockResolvedValue(
                makeResult({
                    successCount: 3,
                    errorCount: 1,
                    skippedRecords: [{ externalId: 'x', reason: 'r' }],
                }),
            );
            mockAdapter.syncContacts.mockResolvedValue(
                makeResult({
                    successCount: 7,
                    errorCount: 2,
                    skippedRecords: [{ externalId: 'y', reason: 'r' }],
                }),
            );

            await service.executeSyncProcess(connection, mockAdapter, 'log-1');

            const successUpdate = mockPrisma.crmSyncLog.update.mock.calls.find((call: any) => call[0].data?.status === SyncStatus.SUCCESS);
            const details = successUpdate[0].data.details;
            expect(details.summary.successCount).toBe(10);
            expect(details.summary.errorCount).toBe(3);
            expect(details.summary.skippedCount).toBe(2);
        });
    });

    // ── getSyncLogs ───────────────────────────────────────────────────────────

    describe('getSyncLogs', () => {
        it('should return logs ordered by startedAt desc', async () => {
            const logs = [{ id: 'l1' }, { id: 'l2' }];
            mockPrisma.crmSyncLog.findMany.mockResolvedValue(logs);

            const result = await service.getSyncLogs('conn-1');

            expect(result).toEqual(logs);
            expect(mockPrisma.crmSyncLog.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: { startedAt: 'desc' },
                    take: 20,
                }),
            );
        });
    });

    // ── bulkDeleteAccounts ────────────────────────────────────────────────────

    describe('bulkDeleteAccounts', () => {
        it('should return 0 when ids array is empty', async () => {
            const result = await service.bulkDeleteAccounts([]);
            expect(result).toEqual({ deletedCount: 0 });
            expect(mockPrisma.crmAccount.deleteMany).not.toHaveBeenCalled();
        });

        it('should delete accounts and return count', async () => {
            mockPrisma.crmAccount.deleteMany.mockResolvedValue({ count: 3 });
            const result = await service.bulkDeleteAccounts(['id1', 'id2', 'id3']);
            expect(result).toEqual({ deletedCount: 3 });
        });
    });

    // ── getAccountById ────────────────────────────────────────────────────────

    describe('getAccountById', () => {
        it('should throw NotFoundException when account not found', async () => {
            mockPrisma.crmAccount.findUnique.mockResolvedValue(null);
            await expect(service.getAccountById('non-existent')).rejects.toThrow(NotFoundException);
        });

        it('should return account with customers', async () => {
            const account = { id: 'acc-1', customers: [] };
            mockPrisma.crmAccount.findUnique.mockResolvedValue(account);
            const result = await service.getAccountById('acc-1');
            expect(result).toEqual(account);
        });
    });

    // ── getAllConnections — secret decryption ─────────────────────────────────

    describe('getAllConnections', () => {
        it('should mask clientSecret and webhookSecret', async () => {
            mockPrisma.crmConnection.findMany.mockResolvedValue([
                {
                    id: 'conn-1',
                    clientSecret: 'enc:plain-secret',
                    webhookSecret: 'enc:plain-webhook',
                    _count: { syncLogs: 0 },
                },
            ]);

            const result = await service.getAllConnections();

            expect(mockCrypto.decrypt).not.toHaveBeenCalled();
            expect(result[0].clientSecret).toBe('********');
            expect(result[0].webhookSecret).toBe('********');
        });
    });

    // ── verifyConnectionById ──────────────────────────────────────────────────

    describe('verifyConnectionById', () => {
        it('should throw NotFoundException when connection not found', async () => {
            mockPrisma.crmConnection.findFirst.mockResolvedValue(null);
            await expect(service.verifyConnectionById('non-existent')).rejects.toThrow(NotFoundException);
        });

        it('should decrypt secrets before passing to adapter', async () => {
            mockPrisma.crmConnection.findFirst.mockResolvedValue({
                id: 'conn-1',
                provider: CrmProvider.DYNAMICS_365,
                clientSecret: 'enc:plain-secret',
                webhookSecret: 'enc:plain-webhook',
            });
            mockAdapter.verifyConnection.mockResolvedValue(true);

            await service.verifyConnectionById('conn-1');

            expect(mockCrypto.decrypt).toHaveBeenCalledWith('enc:plain-secret');
            expect(mockCrypto.decrypt).toHaveBeenCalledWith('enc:plain-webhook');
        });

        it('should return success:true when adapter verifies', async () => {
            mockPrisma.crmConnection.findFirst.mockResolvedValue({
                id: 'conn-1',
                provider: CrmProvider.DYNAMICS_365,
                clientSecret: 'enc:s',
                webhookSecret: null,
            });
            mockAdapter.verifyConnection.mockResolvedValue(true);

            const result = await service.verifyConnectionById('conn-1');
            expect(result).toEqual({
                success: true,
                provider: CrmProvider.DYNAMICS_365,
            });
        });

        it('should return success:false when adapter rejects', async () => {
            mockPrisma.crmConnection.findFirst.mockResolvedValue({
                id: 'conn-1',
                provider: CrmProvider.DYNAMICS_365,
                clientSecret: 'enc:s',
                webhookSecret: null,
            });
            mockAdapter.verifyConnection.mockResolvedValue(false);

            const result = await service.verifyConnectionById('conn-1');
            expect(result.success).toBe(false);
        });

        it('should return success:false when adapter throws', async () => {
            mockPrisma.crmConnection.findFirst.mockResolvedValue({
                id: 'conn-1',
                provider: CrmProvider.DYNAMICS_365,
                clientSecret: 'enc:s',
                webhookSecret: null,
            });
            mockAdapter.verifyConnection.mockRejectedValue(new Error('Network timeout'));

            const result = await service.verifyConnectionById('conn-1');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Network timeout');
        });
    });

    // ── getDiscoveryData ──────────────────────────────────────────────────────

    describe('getDiscoveryData', () => {
        it('should throw when connection not found', async () => {
            mockPrisma.crmConnection.findUnique.mockResolvedValue(null);
            await expect(service.getDiscoveryData('non-existent')).rejects.toThrow('CRM connection not found');
        });

        it('should decrypt secrets before calling adapter', async () => {
            mockPrisma.crmConnection.findUnique.mockResolvedValue({
                id: 'conn-1',
                provider: CrmProvider.DYNAMICS_365,
                clientSecret: 'enc:plain-secret',
                webhookSecret: 'enc:plain-webhook',
            });
            mockAdapter.getDiscoveryData.mockResolvedValue({
                account: [],
                contact: [],
            });

            await service.getDiscoveryData('conn-1');

            expect(mockCrypto.decrypt).toHaveBeenCalledWith('enc:plain-secret');
            expect(mockAdapter.getDiscoveryData).toHaveBeenCalledWith(expect.objectContaining({ clientSecret: 'plain-secret' }));
        });

        it('should return adapter discovery result', async () => {
            mockPrisma.crmConnection.findUnique.mockResolvedValue({
                id: 'conn-1',
                provider: CrmProvider.DYNAMICS_365,
                clientSecret: 'enc:s',
                webhookSecret: null,
            });
            const discoveryData = {
                account: [{ logicalName: 'name', displayName: 'Name', sampleValue: 'Aluplan' }],
                contact: [
                    {
                        logicalName: 'firstname',
                        displayName: 'First Name',
                        sampleValue: 'Ali',
                    },
                ],
            };
            mockAdapter.getDiscoveryData.mockResolvedValue(discoveryData);

            const result = await service.getDiscoveryData('conn-1');
            expect(result).toEqual(discoveryData);
        });
    });

    describe('triggerDeltaSync', () => {
        it('should mark connection SUCCESS when delta sync has no record errors', async () => {
            mockPrisma.crmConnection.update.mockResolvedValue({});
            mockDeltaSync.runDeltaSync.mockResolvedValue({
                account: { errorCount: 0 },
                contact: { errorCount: 0 },
            });

            await service.triggerDeltaSync('conn-1');

            expect(mockPrisma.crmConnection.update).toHaveBeenCalledWith({
                where: { id: 'conn-1' },
                data: { syncStatus: SyncStatus.SYNCING },
            });
            expect(mockPrisma.crmConnection.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'conn-1' },
                    data: expect.objectContaining({ syncStatus: SyncStatus.SUCCESS }),
                }),
            );
        });

        it('should mark connection ERROR when delta sync throws', async () => {
            mockPrisma.crmConnection.update.mockResolvedValue({});
            mockDeltaSync.runDeltaSync.mockRejectedValue(new Error('delta failed'));

            await expect(service.triggerDeltaSync('conn-1')).rejects.toThrow('delta failed');

            expect(mockPrisma.crmConnection.update).toHaveBeenCalledWith({
                where: { id: 'conn-1' },
                data: { syncStatus: SyncStatus.ERROR },
            });
        });
    });

    // ── processDynamics365Webhook ─────────────────────────────────────────────

    describe('processDynamics365Webhook', () => {
        const mockTx = {
            user: { findUnique: jest.fn(), create: jest.fn() },
            role: { findUnique: jest.fn() },
            crmAccount: { findUnique: jest.fn() },
            customerProfile: { upsert: jest.fn() },
        };

        beforeEach(() => {
            mockPrisma.crmConnection.findFirst.mockResolvedValue({
                id: 'conn-1',
                provider: CrmProvider.DYNAMICS_365,
                isActive: true,
            });
            mockRecordSync.upsertAccountFromDynamics.mockResolvedValue({});
            mockRecordSync.upsertContactFromDynamics.mockResolvedValue({});
            mockRecordSync.markAccountDeletedOrInactive.mockResolvedValue({});
            mockRecordSync.markContactDeletedOrInactive.mockResolvedValue({});
            mockPrisma.$transaction = jest.fn((cb: any) => cb(mockTx));
            mockTx.user.findUnique.mockResolvedValue(null);
            mockTx.role.findUnique.mockResolvedValue({
                id: 'role-customer',
                name: 'customer',
            });
            mockTx.user.create.mockResolvedValue({
                id: 'user-1',
                email: 'test@test.com',
            });
            mockTx.crmAccount.findUnique.mockResolvedValue({
                id: 'db-acc-1',
                industry: 'Manufacturing',
                customerNo: 'C300001',
            });
            mockTx.customerProfile.upsert.mockResolvedValue({});
            mockPrisma.crmAccount.upsert.mockResolvedValue({});
        });

        it('should throw BadRequestException for unsupported entity type', async () => {
            await expect(service.processDynamics365Webhook({ entity: 'lead', data: {} })).rejects.toThrow(BadRequestException);
        });

        // ── syncSingleAccount (via webhook) ───────────────────────────────────

        describe('account entity', () => {
            it('should delegate account payload to shared CRM record sync service', async () => {
                const data = {
                    accountid: 'acc-ext-1',
                    name: 'Aluplan GmbH',
                    websiteurl: 'https://aluplan.com',
                    address1_composite: 'Berlin',
                    accountnumber: 'C300001',
                    'industrycode@OData.Community.Display.V1.FormattedValue': 'Manufacturing',
                };

                await service.processDynamics365Webhook({ entity: 'account', data });

                expect(mockRecordSync.upsertAccountFromDynamics).toHaveBeenCalledWith(
                    data,
                    expect.objectContaining({
                        id: 'conn-1',
                        provider: CrmProvider.DYNAMICS_365,
                    }),
                    expect.objectContaining({
                        connectionId: 'conn-1',
                        source: 'WEBHOOK',
                        recordChanges: true,
                    }),
                );
            });

            it('should route account delete webhooks to the shared delete handler', async () => {
                const data = {
                    accountid: 'acc-ext-1',
                    statecode: 1,
                };

                await service.processDynamics365Webhook({ entity: 'account', operation: 'delete', data });

                expect(mockRecordSync.markAccountDeletedOrInactive).toHaveBeenCalledWith(
                    data,
                    expect.objectContaining({
                        connectionId: 'conn-1',
                        source: 'WEBHOOK',
                        recordChanges: true,
                    }),
                );
                expect(mockRecordSync.upsertAccountFromDynamics).not.toHaveBeenCalled();
            });
        });

        // ── syncSingleContact (via webhook) ───────────────────────────────────

        describe('contact entity', () => {
            it('should delegate contact payload to shared CRM record sync service even when email is missing', async () => {
                const data = { contactid: 'con-1', emailaddress1: null };
                await service.processDynamics365Webhook({
                    entity: 'contact',
                    data,
                });

                expect(mockRecordSync.upsertContactFromDynamics).toHaveBeenCalledWith(
                    data,
                    expect.objectContaining({ id: 'conn-1' }),
                    expect.objectContaining({ source: 'WEBHOOK', recordChanges: true }),
                );
            });

            it('should route contact delete webhooks to the shared delete handler', async () => {
                const data = {
                    contactid: 'con-ext-1',
                    statecode: 1,
                };

                await service.processDynamics365Webhook({ entity: 'contact', operation: 'delete', data });

                expect(mockRecordSync.markContactDeletedOrInactive).toHaveBeenCalledWith(
                    data,
                    expect.objectContaining({
                        connectionId: 'conn-1',
                        source: 'WEBHOOK',
                        recordChanges: true,
                    }),
                );
                expect(mockRecordSync.upsertContactFromDynamics).not.toHaveBeenCalled();
            });

            it('should pass linked-account contact payload through unchanged', async () => {
                const data = {
                    contactid: 'con-ext-1',
                    emailaddress1: 'ali@aluplan.com',
                    firstname: 'Ali',
                    lastname: 'Yılmaz',
                    jobtitle: 'Engineer',
                    telephone1: '+49123456',
                    parentcustomerid_account: {
                        accountid: 'acc-ext-1',
                        name: 'Aluplan GmbH',
                    },
                    'new_musteridurumu@OData.Community.Display.V1.FormattedValue': 'Aktif',
                };

                await service.processDynamics365Webhook({ entity: 'contact', data });

                expect(mockRecordSync.upsertContactFromDynamics).toHaveBeenCalledWith(
                    data,
                    expect.objectContaining({ id: 'conn-1' }),
                    expect.objectContaining({
                        connectionId: 'conn-1',
                        source: 'WEBHOOK',
                        recordChanges: true,
                    }),
                );
            });
        });
    });
});
