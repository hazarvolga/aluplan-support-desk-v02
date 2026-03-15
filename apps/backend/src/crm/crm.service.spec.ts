// P2 — Orkestrasyon: CrmService
import { Test, TestingModule } from '@nestjs/testing';
import { CrmService } from './crm.service';
import { PrismaService } from '../prisma/prisma.service';
import { Dynamics365Adapter } from './adapters/dynamics365.adapter';
import { CryptoService } from '../utils/crypto.service';
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
        findMany: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
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
    },
};

const mockAdapter = {
    provider: CrmProvider.DYNAMICS_365,
    verifyConnection: jest.fn(),
    syncAccounts: jest.fn(),
    syncContacts: jest.fn(),
    getDiscoveryData: jest.fn(),
};

const mockCrypto = {
    encrypt: jest.fn((v: string) => `enc:${v}`),
    decrypt: jest.fn((v: string) => v.replace('enc:', '')),
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

            await expect(
                service.upsertConnection({ provider: CrmProvider.DYNAMICS_365, clientSecret: 'sec' }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should encrypt secrets before saving', async () => {
            mockAdapter.verifyConnection.mockResolvedValue(true);
            mockPrisma.crmConnection.upsert.mockResolvedValue({});

            await service.upsertConnection({
                provider: CrmProvider.DYNAMICS_365,
                clientSecret: 'plain-secret',
                webhookSecret: 'plain-webhook',
            });

            expect(mockCrypto.encrypt).toHaveBeenCalledWith('plain-secret');
            expect(mockCrypto.encrypt).toHaveBeenCalledWith('plain-webhook');
        });
    });

    // ── triggerSync ───────────────────────────────────────────────────────────

    describe('triggerSync', () => {
        it('should throw NotFoundException when connection not found', async () => {
            mockPrisma.crmConnection.findUnique.mockResolvedValue(null);
            await expect(service.triggerSync('non-existent')).rejects.toThrow(NotFoundException);
        });

        it('should create sync log and return logId', async () => {
            mockPrisma.crmConnection.findUnique.mockResolvedValue({
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
            expect(mockPrisma.crmSyncLog.create).toHaveBeenCalledWith(
                expect.objectContaining({ data: expect.objectContaining({ status: SyncStatus.SYNCING }) }),
            );
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
            mockAdapter.syncAccounts.mockResolvedValue(
                makeResult({ status: SyncStatus.ERROR, errorMessage: 'API down' }),
            );

            await service.triggerSync('conn-1');
            // Give background process time to run
            await new Promise((r) => setTimeout(r, 50));

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

            await service.triggerSync('conn-1');
            await new Promise((r) => setTimeout(r, 50));

            const updateCall = mockPrisma.crmSyncLog.update.mock.calls.find(
                (call: any) => call[0].data?.status === SyncStatus.SUCCESS,
            );
            expect(updateCall).toBeDefined();
            const details = updateCall[0].data.details;
            expect(details.failedRecords).toHaveLength(1);
            expect(details.skippedRecords).toHaveLength(1);
            expect(details.skippedLinks).toHaveLength(1);
            expect(details.summary.successCount).toBe(10);
        });

        it('should save details JSON to CrmSyncLog on error', async () => {
            mockAdapter.syncAccounts.mockResolvedValue(
                makeResult({ status: SyncStatus.ERROR, errorMessage: 'fail' }),
            );

            await service.triggerSync('conn-1');
            await new Promise((r) => setTimeout(r, 50));

            const errorUpdateCall = mockPrisma.crmSyncLog.update.mock.calls.find(
                (call: any) => call[0].data?.status === SyncStatus.ERROR,
            );
            expect(errorUpdateCall).toBeDefined();
            expect(errorUpdateCall[0].data.details).toBeDefined();
        });

        it('should set connection syncStatus to SUCCESS on completion', async () => {
            mockAdapter.syncAccounts.mockResolvedValue(makeResult());
            mockAdapter.syncContacts.mockResolvedValue(makeResult());

            await service.triggerSync('conn-1');
            await new Promise((r) => setTimeout(r, 50));

            expect(mockPrisma.crmConnection.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ syncStatus: SyncStatus.SUCCESS }),
                }),
            );
        });

        it('should set connection syncStatus to ERROR when sync fails', async () => {
            mockAdapter.syncAccounts.mockResolvedValue(
                makeResult({ status: SyncStatus.ERROR, errorMessage: 'fail' }),
            );

            await service.triggerSync('conn-1');
            await new Promise((r) => setTimeout(r, 50));

            const errorConnUpdate = mockPrisma.crmConnection.update.mock.calls.find(
                (call: any) => call[0].data?.syncStatus === SyncStatus.ERROR,
            );
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
                makeResult({ successCount: 3, errorCount: 1, skippedRecords: [{ externalId: 'x', reason: 'r' }] }),
            );
            mockAdapter.syncContacts.mockResolvedValue(
                makeResult({ successCount: 7, errorCount: 2, skippedRecords: [{ externalId: 'y', reason: 'r' }] }),
            );

            await service.triggerSync('conn-1');
            await new Promise((r) => setTimeout(r, 50));

            const successUpdate = mockPrisma.crmSyncLog.update.mock.calls.find(
                (call: any) => call[0].data?.status === SyncStatus.SUCCESS,
            );
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
        it('should decrypt clientSecret and webhookSecret', async () => {
            mockPrisma.crmConnection.findMany.mockResolvedValue([
                {
                    id: 'conn-1',
                    clientSecret: 'enc:plain-secret',
                    webhookSecret: 'enc:plain-webhook',
                    _count: { syncLogs: 0 },
                },
            ]);

            const result = await service.getAllConnections();

            expect(mockCrypto.decrypt).toHaveBeenCalledWith('enc:plain-secret');
            expect(mockCrypto.decrypt).toHaveBeenCalledWith('enc:plain-webhook');
            expect(result[0].clientSecret).toBe('plain-secret');
        });
    });
});
