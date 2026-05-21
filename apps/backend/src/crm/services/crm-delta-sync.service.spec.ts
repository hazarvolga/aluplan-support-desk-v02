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
        reconcileLinkedCustomerProfileSnapshots: jest.fn(),
    };
    const mockNotifications = {
        emitCrmChanges: jest.fn(),
        emitCrmSyncError: jest.fn(),
    };

    let service: CrmDeltaSyncService;

    beforeEach(() => {
        jest.clearAllMocks();
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
        mockPrisma.crmChangeLog.count.mockResolvedValue(0);
        mockRecordSync.reconcileLinkedCustomerProfileSnapshots.mockResolvedValue(0);
        mockRecordSync.markAccountDeletedOrInactive.mockResolvedValue({});
        mockRecordSync.markContactDeletedOrInactive.mockResolvedValue({});
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
});
