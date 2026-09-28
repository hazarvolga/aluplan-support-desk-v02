import { CrmProvider } from '@aluplan/database';
import { CrmDeltaSyncService } from './crm-delta-sync.service';

describe('CrmDeltaSyncService', () => {
    const mockQueue = {
        add: jest.fn(),
    };
    const mockPrisma = {
        crmConnection: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
        },
        crmDeltaSyncState: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
        },
        crmSyncLog: {
            findFirst: jest.fn(),
        },
        crmAccount: {
            findMany: jest.fn(),
        },
        customerProfile: {
            findMany: jest.fn(),
        },
        crmChangeLog: {
            count: jest.fn(),
        },
    };
    const mockCrypto = {
        decrypt: jest.fn((value: string) => value.replace('enc:', '')),
    };
    const mockDynamics365 = {
        fetchDeltaRecords: jest.fn(),
        isDeletedDeltaRecord: jest.fn(),
    };
    const mockRecordSync = {
        upsertAccountFromDynamics: jest.fn(),
        upsertContactFromDynamics: jest.fn(),
        markAccountDeletedOrInactive: jest.fn(),
        markContactDeletedOrInactive: jest.fn(),
        resolveExternalIdFromDynamics: jest.fn(),
        reconcileLinkedCustomerProfileSnapshots: jest.fn(),
    };
    const mockNotifications = {
        emitCrmChanges: jest.fn(),
        emitCrmSyncError: jest.fn(),
    };

    let service: CrmDeltaSyncService;

    beforeEach(() => {
        jest.resetAllMocks();
        service = new CrmDeltaSyncService(
            mockQueue as any,
            mockPrisma as any,
            mockCrypto as any,
            mockDynamics365 as any,
            mockRecordSync as any,
            mockNotifications as any,
        );

        mockPrisma.crmConnection.findFirst.mockResolvedValue({
            id: 'conn-1',
            provider: CrmProvider.DYNAMICS_365,
            clientSecret: 'enc:secret',
            webhookSecret: 'enc:webhook',
        });
        mockPrisma.crmDeltaSyncState.findUnique.mockResolvedValue(null);
        mockPrisma.crmDeltaSyncState.upsert.mockResolvedValue({});
        mockPrisma.crmSyncLog.findFirst.mockResolvedValue(null);
        mockPrisma.crmAccount.findMany.mockResolvedValue([{ externalAccountId: 'acc-current' }]);
        mockPrisma.customerProfile.findMany.mockResolvedValue([]);
        mockPrisma.crmChangeLog.count.mockResolvedValue(0);
        mockRecordSync.reconcileLinkedCustomerProfileSnapshots.mockResolvedValue(0);
        mockRecordSync.markAccountDeletedOrInactive.mockResolvedValue({});
        mockRecordSync.markContactDeletedOrInactive.mockResolvedValue({});
        mockRecordSync.resolveExternalIdFromDynamics.mockImplementation(
            (record: any, _config: any, entityType: 'account' | 'contact') =>
                entityType === 'account' ? record.accountid || null : record.contactid || null,
        );
        mockRecordSync.upsertAccountFromDynamics.mockResolvedValue({});
        mockRecordSync.upsertContactFromDynamics.mockResolvedValue({});
        mockDynamics365.fetchDeltaRecords.mockImplementation(async (_connection, entityType: 'account' | 'contact') => {
            if (entityType === 'account') {
                return {
                    records: [{ id: 'acc-deleted', reason: 'deleted' }],
                    deltaLink: 'https://delta/accounts',
                };
            }
            return {
                records: [{ contactid: 'contact-inactive', statecode: 1 }],
                deltaLink: 'https://delta/contacts',
            };
        });
        mockDynamics365.isDeletedDeltaRecord.mockImplementation((record: any) => record.reason === 'deleted');
    });

    it('routes deleted and inactive delta records to the shared CRM delete handlers', async () => {
        await service.runDeltaSync('conn-1');

        expect(mockRecordSync.markAccountDeletedOrInactive).toHaveBeenCalledWith(
            { id: 'acc-deleted', reason: 'deleted' },
            expect.objectContaining({
                connectionId: 'conn-1',
                source: 'DELTA_SYNC',
                recordChanges: true,
            }),
        );
        expect(mockRecordSync.markContactDeletedOrInactive).toHaveBeenCalledWith(
            { contactid: 'contact-inactive', statecode: 1 },
            expect.objectContaining({
                connectionId: 'conn-1',
                source: 'DELTA_SYNC',
                recordChanges: true,
            }),
        );
        expect(mockRecordSync.upsertAccountFromDynamics).not.toHaveBeenCalled();
        expect(mockRecordSync.upsertContactFromDynamics).not.toHaveBeenCalled();
    });

    it('rebases a stale 400 delta cursor only after a clean newer full import', async () => {
        const staleAt = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000);
        mockPrisma.crmDeltaSyncState.findUnique.mockResolvedValue({
            deltaLink: 'https://delta/accounts?$deltatoken=old',
            lastSuccessfulSyncAt: staleAt,
        });
        mockPrisma.crmSyncLog.findFirst.mockResolvedValue({
            status: 'SUCCESS',
            errorCount: 0,
            completedAt: new Date(),
        });
        mockDynamics365.fetchDeltaRecords
            .mockRejectedValueOnce({ response: { status: 400 }, message: 'Request failed with status code 400' })
            .mockResolvedValueOnce({ records: [{ accountid: 'acc-current' }], deltaLink: 'https://delta/accounts?$deltatoken=new' })
            .mockResolvedValueOnce({ records: [], deltaLink: 'https://delta/contacts?$deltatoken=new' });

        await service.runDeltaSync('conn-1');

        expect(mockDynamics365.fetchDeltaRecords).toHaveBeenNthCalledWith(1, expect.anything(), 'account', 'https://delta/accounts?$deltatoken=old');
        expect(mockDynamics365.fetchDeltaRecords).toHaveBeenNthCalledWith(2, expect.anything(), 'account', null);
        expect(mockPrisma.crmAccount.findMany).toHaveBeenCalled();
        expect(mockPrisma.crmDeltaSyncState.upsert).toHaveBeenCalledWith(expect.objectContaining({
            update: expect.objectContaining({ deltaLink: 'https://delta/accounts?$deltatoken=new' }),
        }));
    });

    it('does not replace an old cursor from an empty recovery snapshot', async () => {
        mockPrisma.crmDeltaSyncState.findUnique.mockResolvedValue({
            deltaLink: 'https://delta/accounts?$deltatoken=old',
            lastSuccessfulSyncAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        });
        mockPrisma.crmSyncLog.findFirst.mockResolvedValue({
            status: 'SUCCESS', errorCount: 0, completedAt: new Date(),
        });
        mockDynamics365.fetchDeltaRecords
            .mockRejectedValueOnce({ response: { status: 400 }, message: 'Request failed with status code 400' })
            .mockResolvedValueOnce({ records: [], deltaLink: 'https://delta/accounts?$deltatoken=new' });

        await expect(service.runDeltaSync('conn-1')).rejects.toThrow(/empty recovery snapshot/);
        expect(mockPrisma.crmAccount.findMany).not.toHaveBeenCalled();
        expect(mockPrisma.crmDeltaSyncState.upsert).toHaveBeenCalledWith(expect.objectContaining({
            update: { lastError: expect.stringMatching(/empty recovery snapshot/) },
        }));
    });

    it('does not advance the cursor when a recovered record fails to sync', async () => {
        mockPrisma.crmDeltaSyncState.findUnique.mockResolvedValue({
            deltaLink: 'https://delta/accounts?$deltatoken=old',
            lastSuccessfulSyncAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        });
        mockPrisma.crmSyncLog.findFirst.mockResolvedValue({
            status: 'SUCCESS', errorCount: 0, completedAt: new Date(),
        });
        mockDynamics365.fetchDeltaRecords
            .mockRejectedValueOnce({ response: { status: 400 }, message: 'Request failed with status code 400' })
            .mockResolvedValueOnce({ records: [{ accountid: 'acc-current' }], deltaLink: 'https://delta/accounts?$deltatoken=new' });
        mockRecordSync.upsertAccountFromDynamics.mockRejectedValueOnce(new Error('bad account'));

        await expect(service.runDeltaSync('conn-1')).rejects.toThrow(/record processing failed/);
        expect(mockPrisma.crmAccount.findMany).toHaveBeenCalled();
        expect(mockPrisma.crmDeltaSyncState.upsert).toHaveBeenCalledWith(expect.objectContaining({
            update: { lastError: expect.stringMatching(/record processing failed/) },
        }));
    });

    it('does not reconcile or replace the cursor when a recovery record has no CRM ID', async () => {
        mockPrisma.crmDeltaSyncState.findUnique.mockResolvedValue({
            deltaLink: 'https://delta/accounts?$deltatoken=old',
            lastSuccessfulSyncAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        });
        mockPrisma.crmSyncLog.findFirst.mockResolvedValue({
            status: 'SUCCESS', errorCount: 0, completedAt: new Date(),
        });
        mockDynamics365.fetchDeltaRecords
            .mockRejectedValueOnce({ response: { status: 400 }, message: 'Request failed with status code 400' })
            .mockResolvedValueOnce({
                records: [{ accountid: 'acc-current' }, { name: 'missing ID' }],
                deltaLink: 'https://delta/accounts?$deltatoken=new',
            });

        await expect(service.runDeltaSync('conn-1')).rejects.toThrow(/missing CRM record IDs/);
        expect(mockPrisma.crmAccount.findMany).not.toHaveBeenCalled();
        expect(mockPrisma.crmDeltaSyncState.upsert).toHaveBeenCalledWith(expect.objectContaining({
            update: { lastError: expect.stringMatching(/missing CRM record IDs/) },
        }));
    });

    it('keeps the old cursor when the new snapshot omits an existing verified CRM record', async () => {
        mockPrisma.crmDeltaSyncState.findUnique.mockResolvedValue({
            deltaLink: 'https://delta/accounts?$deltatoken=old',
            lastSuccessfulSyncAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        });
        mockPrisma.crmSyncLog.findFirst.mockResolvedValue({
            status: 'SUCCESS', errorCount: 0, completedAt: new Date(),
        });
        mockPrisma.crmAccount.findMany.mockResolvedValue([
            { externalAccountId: 'acc-current' },
            { externalAccountId: 'acc-missing' },
        ]);
        mockDynamics365.fetchDeltaRecords
            .mockRejectedValueOnce({ response: { status: 400 }, message: 'Request failed with status code 400' })
            .mockResolvedValueOnce({ records: [{ accountid: 'acc-current' }], deltaLink: 'https://delta/accounts?$deltatoken=new' });

        await expect(service.runDeltaSync('conn-1')).rejects.toThrow(/missing previously verified CRM records/);
        expect(mockRecordSync.upsertAccountFromDynamics).not.toHaveBeenCalled();
        expect(mockPrisma.crmDeltaSyncState.upsert).toHaveBeenCalledWith(expect.objectContaining({
            update: { lastError: expect.stringMatching(/missing previously verified CRM records/) },
        }));
    });

    it('rebuilds the contact cursor when all previously verified contacts remain in the snapshot', async () => {
        mockPrisma.crmDeltaSyncState.findUnique
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                deltaLink: 'https://delta/contacts?$deltatoken=old',
                lastSuccessfulSyncAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            });
        mockPrisma.crmSyncLog.findFirst.mockResolvedValue({
            status: 'SUCCESS', errorCount: 0, completedAt: new Date(),
        });
        mockPrisma.customerProfile.findMany.mockResolvedValue([{ externalContactId: 'contact-current' }]);
        mockDynamics365.fetchDeltaRecords
            .mockResolvedValueOnce({ records: [], deltaLink: 'https://delta/accounts?$deltatoken=current' })
            .mockRejectedValueOnce({ response: { status: 400 }, message: 'Request failed with status code 400' })
            .mockResolvedValueOnce({ records: [{ contactid: 'contact-current' }], deltaLink: 'https://delta/contacts?$deltatoken=new' });

        await service.runDeltaSync('conn-1');

        expect(mockDynamics365.fetchDeltaRecords).toHaveBeenNthCalledWith(3, expect.anything(), 'contact', null);
        expect(mockPrisma.customerProfile.findMany).toHaveBeenCalled();
    });

    it('preserves a stale cursor when no clean newer full import exists', async () => {
        mockPrisma.crmDeltaSyncState.findUnique.mockResolvedValue({
            deltaLink: 'https://delta/accounts?$deltatoken=old',
            lastSuccessfulSyncAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        });
        mockPrisma.crmSyncLog.findFirst.mockResolvedValue({
            status: 'SUCCESS',
            errorCount: 1,
            completedAt: new Date(),
        });
        mockDynamics365.fetchDeltaRecords.mockRejectedValueOnce({
            response: { status: 400 },
            message: 'Request failed with status code 400',
        });

        await expect(service.runDeltaSync('conn-1')).rejects.toMatchObject({ response: { status: 400 } });
        expect(mockDynamics365.fetchDeltaRecords).toHaveBeenCalledTimes(1);
        expect(mockPrisma.crmDeltaSyncState.upsert).toHaveBeenCalledWith(expect.objectContaining({
            update: { lastError: 'Request failed with status code 400' },
        }));
    });
});
