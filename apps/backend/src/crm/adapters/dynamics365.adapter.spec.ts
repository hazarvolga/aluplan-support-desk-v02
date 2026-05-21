// P1 — Kritik iş mantığı: Dynamics365Adapter
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Dynamics365Adapter } from './dynamics365.adapter';
import { PrismaService } from '../../prisma/prisma.service';
import { CrmRecordSyncService } from '../services/crm-record-sync.service';
import { SyncStatus } from '@aluplan/database';

jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildConfig(overrides: Record<string, any> = {}) {
    return {
        id: 'conn-1',
        instanceUrl: 'https://org.crm4.dynamics.com',
        tenantId: 'tenant-id',
        clientId: 'client-id',
        clientSecret: 'client-secret',
        syncSettings: { accountMapping: {}, contactMapping: {} },
        ...overrides,
    };
}

function buildAccount(overrides: Record<string, any> = {}): Record<string, any> {
    return {
        accountid: 'acc-uuid-1',
        name: 'Aluplan GmbH',
        accountnumber: 'C300001',
        websiteurl: 'https://aluplan.com',
        address1_composite: 'Berlin, Germany',
        'industrycode@OData.Community.Display.V1.FormattedValue': 'Manufacturing',
        ...overrides,
    };
}

function buildContact(overrides: Record<string, any> = {}): Record<string, any> {
    return {
        contactid: 'con-uuid-1',
        firstname: 'Ali',
        lastname: 'Yılmaz',
        emailaddress1: 'ali@aluplan.com',
        jobtitle: 'Engineer',
        telephone1: '+49123456',
        'new_musteridurumu@OData.Community.Display.V1.FormattedValue': 'Aktif',
        parentcustomerid_account: {
            accountid: 'acc-uuid-1',
            name: 'Aluplan GmbH',
            accountnumber: 'C300001',
            'industrycode@OData.Community.Display.V1.FormattedValue': 'Manufacturing',
        },
        ...overrides,
    };
}

// ─── Mock Services ─────────────────────────────────────────────────────────

const mockPrisma = {};

const mockRecordSync = {
    upsertAccountFromDynamics: jest.fn(),
    upsertContactFromDynamics: jest.fn(),
    reconcileMissingAccountsFromFullImport: jest.fn(),
    reconcileMissingContactsFromFullImport: jest.fn(),
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Dynamics365Adapter', () => {
    let adapter: Dynamics365Adapter;

    beforeEach(async () => {
        const mockConfigService = {
            get: jest.fn((key: string) => {
                const config: Record<string, string> = {
                    'dynamics365.baseUrl': 'https://org.crm.dynamics.com',
                    'dynamics365.clientId': 'test-client-id',
                    'dynamics365.clientSecret': 'test-client-secret',
                    'dynamics365.tenantId': 'test-tenant-id',
                };
                return config[key];
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                Dynamics365Adapter,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: CrmRecordSyncService, useValue: mockRecordSync },
            ],
        }).compile();

        adapter = module.get<Dynamics365Adapter>(Dynamics365Adapter);
        jest.clearAllMocks();

        // Default: token acquisition succeeds
        mockedAxios.post = jest.fn().mockResolvedValue({ data: { access_token: 'mock-token' } });
        mockRecordSync.upsertAccountFromDynamics.mockResolvedValue({ id: 'local-acc-1' });
        mockRecordSync.upsertContactFromDynamics.mockResolvedValue({ id: 'local-profile-1', accountId: 'local-acc-1' });
        mockRecordSync.reconcileMissingAccountsFromFullImport.mockResolvedValue(0);
        mockRecordSync.reconcileMissingContactsFromFullImport.mockResolvedValue(0);
    });

    // ── syncAccounts ──────────────────────────────────────────────────────────

    describe('syncAccounts', () => {
        it('should delegate accounts syncing to CrmRecordSyncService', async () => {
            const account = buildAccount();
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [account] }, status: 200 });

            const result = await adapter.syncAccounts(buildConfig());

            expect(result.status).toBe(SyncStatus.SUCCESS);
            expect(result.successCount).toBe(1);
            expect(result.errorCount).toBe(0);
            expect(result.totalRecords).toBe(1);
            expect(mockRecordSync.upsertAccountFromDynamics).toHaveBeenCalledWith(
                account,
                expect.objectContaining({ id: 'conn-1' }),
                expect.objectContaining({
                    connectionId: 'conn-1',
                    source: 'FULL_IMPORT',
                    recordChanges: true,
                }),
            );
        });

        it('should track failedRecords when upsert throws', async () => {
            const account = buildAccount();
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [account] }, status: 200 });
            mockRecordSync.upsertAccountFromDynamics.mockRejectedValue(new Error('DB constraint violation'));

            const result = await adapter.syncAccounts(buildConfig());

            expect(result.errorCount).toBe(1);
            expect(result.failedRecords).toHaveLength(1);
            expect(result.failedRecords![0]).toMatchObject({
                externalId: 'acc-uuid-1',
                entityType: 'account',
                errorMessage: 'DB constraint violation',
            });
        });

        it('should return ERROR status when token acquisition fails', async () => {
            mockedAxios.post = jest.fn().mockRejectedValue(new Error('Auth failed'));

            const result = await adapter.syncAccounts(buildConfig());

            expect(result.status).toBe(SyncStatus.ERROR);
            expect(result.errorMessage).toContain('Account Sync Error');
        });

        it('should call onProgress callback', async () => {
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [buildAccount()] }, status: 200 });

            const onProgress = jest.fn();
            await adapter.syncAccounts(buildConfig(), onProgress);

            expect(onProgress).toHaveBeenCalledWith(
                expect.objectContaining({ success: 1, error: 0, total: 1 }),
            );
        });

        it('should follow @odata.nextLink for pagination', async () => {
            const page1 = buildAccount({ accountid: 'acc-p1', name: 'Page1 Corp' });
            const page2 = buildAccount({ accountid: 'acc-p2', name: 'Page2 Corp' });

            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({
                    data: {
                        value: [page1],
                        '@odata.nextLink': 'https://org.crm4.dynamics.com/api/data/v9.2/accounts?$skiptoken=abc',
                    },
                    status: 200,
                })
                .mockResolvedValueOnce({
                    data: { value: [page2] }, // no nextLink — last page
                    status: 200,
                });

            const result = await adapter.syncAccounts(buildConfig());

            expect(result.totalRecords).toBe(2);
            expect(result.successCount).toBe(2);
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
            // Second call should use the nextLink URL
            expect((mockedAxios.get as jest.Mock).mock.calls[1][0]).toContain('$skiptoken=abc');
            expect(mockRecordSync.upsertAccountFromDynamics).toHaveBeenCalledTimes(2);
        });

        it('reconciles local accounts missing from a trusted full import result', async () => {
            const account = buildAccount({ accountid: 'acc-active' });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [account] }, status: 200 });

            await adapter.syncAccounts(buildConfig());

            expect(mockRecordSync.reconcileMissingAccountsFromFullImport).toHaveBeenCalledWith(
                ['acc-active'],
                expect.objectContaining({
                    connectionId: 'conn-1',
                    source: 'FULL_IMPORT',
                    recordChanges: true,
                }),
            );
        });
    });

    // ── syncContacts ──────────────────────────────────────────────────────────

    describe('syncContacts', () => {
        it('should delegate contacts syncing to CrmRecordSyncService', async () => {
            const contact = buildContact();
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [contact] }, status: 200 });

            const result = await adapter.syncContacts(buildConfig());

            expect(result.status).toBe(SyncStatus.SUCCESS);
            expect(result.successCount).toBe(1);
            expect(result.errorCount).toBe(0);
            expect(result.totalRecords).toBe(1);
            expect(mockRecordSync.upsertContactFromDynamics).toHaveBeenCalledWith(
                contact,
                expect.objectContaining({ id: 'conn-1' }),
                expect.objectContaining({
                    connectionId: 'conn-1',
                    source: 'FULL_IMPORT',
                    recordChanges: true,
                }),
            );
        });

        it('reconciles local contacts missing from a trusted full import result', async () => {
            const contact = buildContact({ contactid: 'contact-active' });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [contact] }, status: 200 });

            await adapter.syncContacts(buildConfig());

            expect(mockRecordSync.reconcileMissingContactsFromFullImport).toHaveBeenCalledWith(
                ['contact-active'],
                expect.objectContaining({
                    connectionId: 'conn-1',
                    source: 'FULL_IMPORT',
                    recordChanges: true,
                }),
            );
        });

        it('should track skippedLinks when parent account is not found in local DB', async () => {
            const contact = buildContact();
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [contact] }, status: 200 });
            // Profile is upserted but accountId is missing (skipped link)
            mockRecordSync.upsertContactFromDynamics.mockResolvedValue({ id: 'local-profile-1', accountId: null });

            const result = await adapter.syncContacts(buildConfig());

            expect(result.skippedLinks).toHaveLength(1);
            expect(result.skippedLinks![0]).toMatchObject({
                contactExternalId: 'con-uuid-1',
                missingAccountExternalId: 'acc-uuid-1',
            });
        });

        it('should track skippedRecords when record sync skips a contact', async () => {
            const contact = buildContact();
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [contact] }, status: 200 });
            mockRecordSync.upsertContactFromDynamics.mockResolvedValue(null); // Skipped (e.g. admin email)

            const result = await adapter.syncContacts(buildConfig());

            expect(result.successCount).toBe(0);
            expect(result.skippedRecords).toHaveLength(1);
            expect(result.skippedRecords![0]).toMatchObject({
                externalId: 'con-uuid-1',
                reason: expect.any(String),
            });
        });

        it('should track failedRecords when upsert throws', async () => {
            const contact = buildContact();
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [contact] }, status: 200 });
            mockRecordSync.upsertContactFromDynamics.mockRejectedValue(new Error('Transaction failed'));

            const result = await adapter.syncContacts(buildConfig());

            expect(result.errorCount).toBe(1);
            expect(result.failedRecords).toHaveLength(1);
            expect(result.failedRecords![0]).toMatchObject({
                externalId: 'con-uuid-1',
                entityType: 'contact',
                errorMessage: 'Transaction failed',
            });
        });

        it('should return ERROR status when API call fails', async () => {
            mockedAxios.post = jest.fn().mockRejectedValue(new Error('Network error'));

            const result = await adapter.syncContacts(buildConfig());

            expect(result.status).toBe(SyncStatus.ERROR);
        });

        it('should follow @odata.nextLink for pagination', async () => {
            const c1 = buildContact({ contactid: 'c-p1', emailaddress1: 'p1@test.com' });
            const c2 = buildContact({ contactid: 'c-p2', emailaddress1: 'p2@test.com' });

            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({
                    data: {
                        value: [c1],
                        '@odata.nextLink': 'https://org.crm4.dynamics.com/api/data/v9.2/contacts?$skiptoken=xyz',
                    },
                    status: 200,
                })
                .mockResolvedValueOnce({
                    data: { value: [c2] },
                    status: 200,
                });

            const result = await adapter.syncContacts(buildConfig());

            expect(result.totalRecords).toBe(2);
            expect(result.successCount).toBe(2);
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
            expect((mockedAxios.get as jest.Mock).mock.calls[1][0]).toContain('$skiptoken=xyz');
            expect(mockRecordSync.upsertContactFromDynamics).toHaveBeenCalledTimes(2);
        });
    });

    // ── fetchDeltaRecords ─────────────────────────────────────────────────────

    describe('fetchDeltaRecords', () => {
        it('should start delta tracking without a fragile $select clause', async () => {
            mockedAxios.get = jest.fn().mockResolvedValue({
                data: {
                    value: [buildAccount({ industrycode: 8 })],
                    '@odata.deltaLink': 'https://org.crm4.dynamics.com/api/data/v9.2/accounts?$deltatoken=abc',
                },
                status: 200,
            });

            const result = await adapter.fetchDeltaRecords(buildConfig(), 'account', null);

            expect(result.records).toHaveLength(1);
            expect(result.deltaLink).toContain('$deltatoken=abc');
            expect((mockedAxios.get as jest.Mock).mock.calls[0][0]).toBe('https://org.crm4.dynamics.com/api/data/v9.2/accounts');
            expect((mockedAxios.get as jest.Mock).mock.calls[0][1].headers.Prefer).toBe(
                'odata.track-changes, odata.include-annotations="*"',
            );
        });

        it('should reuse saved delta links and keep annotation headers', async () => {
            mockedAxios.get = jest.fn().mockResolvedValue({
                data: { value: [], '@odata.deltaLink': 'https://delta-next' },
                status: 200,
            });

            await adapter.fetchDeltaRecords(buildConfig(), 'contact', 'https://saved-delta');

            expect((mockedAxios.get as jest.Mock).mock.calls[0][0]).toBe('https://saved-delta');
            expect((mockedAxios.get as jest.Mock).mock.calls[0][1].headers.Prefer).toBe('odata.include-annotations="*"');
        });
    });

    describe('fetchEntityMetadata (via getDiscoveryData)', () => {
        it('should call EntityDefinitions endpoint with correct URL', async () => {
            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({ data: { value: [] } }) // account metadata
                .mockResolvedValueOnce({ data: { value: [] } }) // contact metadata
                .mockResolvedValueOnce({ data: { value: [] } }) // account sample
                .mockResolvedValueOnce({ data: { value: [] } }); // contact sample

            await adapter.getDiscoveryData(buildConfig({ id: 'conn-1' }));

            const calls = (mockedAxios.get as jest.Mock).mock.calls;
            expect(calls[0][0]).toContain("EntityDefinitions(LogicalName='account')/Attributes");
            expect(calls[1][0]).toContain("EntityDefinitions(LogicalName='contact')/Attributes");
        });

        it('should use LogicalName as displayName fallback when DisplayName is missing', async () => {
            const fields = [
                { LogicalName: 'customfield', DisplayName: null },
                { LogicalName: 'anotherfield', DisplayName: { UserLocalizedLabel: { Label: 'Another Field' } } },
            ];
            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({ data: { value: fields } })
                .mockResolvedValueOnce({ data: { value: [] } })
                .mockResolvedValueOnce({ data: { value: [{ customfield: 'val' }] } })
                .mockResolvedValueOnce({ data: { value: [] } });

            const result = await adapter.getDiscoveryData(buildConfig({ id: 'conn-1' }));

            const customField = result.account.find((f: any) => f.logicalName === 'customfield');
            expect(customField?.displayName).toBe('customfield');

            const anotherField = result.account.find((f: any) => f.logicalName === 'anotherfield');
            expect(anotherField?.displayName).toBe('Another Field');
        });
    });

    // ── verifyConnection ──────────────────────────────────────────────────────

    describe('verifyConnection', () => {
        it('should return true when token acquisition succeeds', async () => {
            const result = await adapter.verifyConnection(buildConfig());
            expect(result).toBe(true);
        });

        it('should return false when token acquisition fails', async () => {
            mockedAxios.post = jest.fn().mockRejectedValue(new Error('Auth failed'));
            const result = await adapter.verifyConnection(buildConfig());
            expect(result).toBe(false);
        });
    });
});
