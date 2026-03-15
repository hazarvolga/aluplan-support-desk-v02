// P1 — Kritik iş mantığı: Dynamics365Adapter
import { Test, TestingModule } from '@nestjs/testing';
import { Dynamics365Adapter } from './dynamics365.adapter';
import { PrismaService } from '../../prisma/prisma.service';
import { SyncStatus } from '@aluplan/database';

jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildConfig(overrides: Record<string, any> = {}) {
    return {
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

// ─── Mock Prisma ─────────────────────────────────────────────────────────────

const mockTx = {
    user: { findUnique: jest.fn(), create: jest.fn() },
    role: { findUnique: jest.fn() },
    crmAccount: { findUnique: jest.fn() },
    customerProfile: { upsert: jest.fn() },
};

const mockPrisma = {
    crmAccount: { upsert: jest.fn() },
    $transaction: jest.fn((cb: any) => cb(mockTx)),
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Dynamics365Adapter', () => {
    let adapter: Dynamics365Adapter;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                Dynamics365Adapter,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        adapter = module.get<Dynamics365Adapter>(Dynamics365Adapter);
        jest.clearAllMocks();

        // Default: token acquisition succeeds
        mockedAxios.post = jest.fn().mockResolvedValue({ data: { access_token: 'mock-token' } });
    });

    // ── resolveField ──────────────────────────────────────────────────────────

    describe('resolveField (private — tested via syncAccounts)', () => {
        it('should prefer FormattedValue over raw value for option set fields', async () => {
            // industry default key is 'industrycode@OData.Community.Display.V1.FormattedValue'
            // resolveField will look for that key + '@FormattedValue' suffix — but since the
            // default key already contains the FormattedValue suffix, it falls through to raw.
            // Test the actual behavior: when the FormattedValue annotation is present on the
            // base key (industrycode), resolveField should return it.
            const account = buildAccount({
                // Default mapping key for industry is 'industrycode@OData...' — override to base key
            });
            // Use custom mapping so crmKey = 'industrycode', then FormattedValue key is checked
            const config = buildConfig({
                syncSettings: {
                    accountMapping: { industry: 'industrycode' },
                    contactMapping: {},
                },
            });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [account] }, status: 200 });
            mockPrisma.crmAccount.upsert.mockResolvedValue({});

            await adapter.syncAccounts(config);

            expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ industry: 'Manufacturing' }),
                }),
            );
        });

        it('should fall back to raw value when FormattedValue is absent', async () => {
            const account = buildAccount({
                'industrycode@OData.Community.Display.V1.FormattedValue': undefined,
                industrycode: 'raw-industry',
            });

            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [account] }, status: 200 });
            mockPrisma.crmAccount.upsert.mockResolvedValue({});

            await adapter.syncAccounts(buildConfig({
                syncSettings: {
                    accountMapping: { industry: 'industrycode' },
                    contactMapping: {},
                },
            }));

            expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ industry: 'raw-industry' }),
                }),
            );
        });

        it('should fall back to raw value when FormattedValue is empty string', async () => {
            const account = buildAccount({
                industrycode: 'raw-val',
                'industrycode@OData.Community.Display.V1.FormattedValue': '',
            });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [account] }, status: 200 });
            mockPrisma.crmAccount.upsert.mockResolvedValue({});

            await adapter.syncAccounts(buildConfig({
                syncSettings: {
                    accountMapping: { industry: 'industrycode' },
                    contactMapping: {},
                },
            }));

            expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ industry: 'raw-val' }),
                }),
            );
        });
    });

    // ── syncAccounts ──────────────────────────────────────────────────────────

    describe('syncAccounts', () => {
        it('should save customerNo from accountnumber field', async () => {
            const account = buildAccount({ accountnumber: 'C300001' });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [account] }, status: 200 });
            mockPrisma.crmAccount.upsert.mockResolvedValue({});

            await adapter.syncAccounts(buildConfig());

            expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ customerNo: 'C300001' }),
                    create: expect.objectContaining({ customerNo: 'C300001' }),
                }),
            );
        });

        it('should save customerNo as null when accountnumber is missing', async () => {
            const account = buildAccount({ accountnumber: undefined });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [account] }, status: 200 });
            mockPrisma.crmAccount.upsert.mockResolvedValue({});

            await adapter.syncAccounts(buildConfig());

            expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ customerNo: null }),
                }),
            );
        });

        it('should return SUCCESS status with correct counts', async () => {
            mockedAxios.get = jest.fn().mockResolvedValue({
                data: { value: [buildAccount(), buildAccount({ accountid: 'acc-2', name: 'B Corp' })] },
                status: 200,
            });
            mockPrisma.crmAccount.upsert.mockResolvedValue({});

            const result = await adapter.syncAccounts(buildConfig());

            expect(result.status).toBe(SyncStatus.SUCCESS);
            expect(result.successCount).toBe(2);
            expect(result.errorCount).toBe(0);
            expect(result.totalRecords).toBe(2);
        });

        it('should track failedRecords when upsert throws', async () => {
            const account = buildAccount();
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [account] }, status: 200 });
            mockPrisma.crmAccount.upsert.mockRejectedValue(new Error('DB constraint violation'));

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
            mockPrisma.crmAccount.upsert.mockResolvedValue({});

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
            mockPrisma.crmAccount.upsert.mockResolvedValue({});

            const result = await adapter.syncAccounts(buildConfig());

            expect(result.totalRecords).toBe(2);
            expect(result.successCount).toBe(2);
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
            // Second call should use the nextLink URL
            expect((mockedAxios.get as jest.Mock).mock.calls[1][0]).toContain('$skiptoken=abc');
        });
    });

    // ── syncContacts ──────────────────────────────────────────────────────────

    describe('syncContacts', () => {
        beforeEach(() => {
            // jest.clearAllMocks() resets $transaction — re-define it here
            mockPrisma.$transaction = jest.fn((cb: any) => cb(mockTx));

            mockTx.user.findUnique.mockResolvedValue(null);
            mockTx.role.findUnique.mockResolvedValue({ id: 'role-customer', name: 'customer' });
            mockTx.user.create.mockResolvedValue({ id: 'user-1', email: 'ali@aluplan.com' });
            mockTx.crmAccount.findUnique.mockResolvedValue({ id: 'db-acc-1', industry: 'Manufacturing' });
            mockTx.customerProfile.upsert.mockResolvedValue({});
        });

        it('should skip contacts without email and add to skippedRecords', async () => {
            const contact = buildContact({ emailaddress1: null });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [contact] }, status: 200 });

            const result = await adapter.syncContacts(buildConfig());

            expect(result.skippedRecords).toHaveLength(1);
            expect(result.skippedRecords![0]).toMatchObject({
                externalId: 'con-uuid-1',
                reason: 'missing_email',
            });
            expect(result.successCount).toBe(0);
        });

        it('should add to skippedLinks when parent account not found in DB', async () => {
            const contact = buildContact();
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [contact] }, status: 200 });
            // Account not found in DB
            mockTx.crmAccount.findUnique.mockResolvedValue(null);

            const result = await adapter.syncContacts(buildConfig());

            expect(result.skippedLinks).toHaveLength(1);
            expect(result.skippedLinks![0]).toMatchObject({
                contactExternalId: 'con-uuid-1',
                missingAccountExternalId: 'acc-uuid-1',
            });
            // Contact should still be saved (with accountId = null)
            expect(mockTx.customerProfile.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ accountId: undefined }),
                }),
            );
        });

        it('should save contact with linked accountId when account exists', async () => {
            const contact = buildContact();
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [contact] }, status: 200 });
            mockTx.crmAccount.findUnique.mockResolvedValue({ id: 'db-acc-1', industry: 'Manufacturing' });

            const result = await adapter.syncContacts(buildConfig());

            expect(result.successCount).toBe(1);
            expect(result.skippedLinks).toHaveLength(0);
            expect(mockTx.customerProfile.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ accountId: 'db-acc-1' }),
                }),
            );
        });

        it('should use FormattedValue for contractStatus', async () => {
            const contact = buildContact({
                new_musteridurumu: 1,
                'new_musteridurumu@OData.Community.Display.V1.FormattedValue': 'Aktif',
            });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [contact] }, status: 200 });

            await adapter.syncContacts(buildConfig());

            expect(mockTx.customerProfile.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ contractStatus: 'Aktif' }),
                }),
            );
        });

        it('should track failedRecords when transaction throws', async () => {
            const contact = buildContact();
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [contact] }, status: 200 });
            // Override $transaction to reject for this test only
            mockPrisma.$transaction = jest.fn().mockRejectedValue(new Error('Transaction failed'));

            const result = await adapter.syncContacts(buildConfig());

            expect(result.errorCount).toBe(1);
            expect(result.failedRecords).toHaveLength(1);
            expect(result.failedRecords![0]).toMatchObject({
                externalId: 'con-uuid-1',
                entityType: 'contact',
                errorMessage: 'Transaction failed',
            });
        });

        it('should return SUCCESS with correct counts for mixed batch', async () => {
            const contacts = [
                buildContact({ contactid: 'c1', emailaddress1: 'c1@test.com' }),
                buildContact({ contactid: 'c2', emailaddress1: null }), // skipped
                buildContact({ contactid: 'c3', emailaddress1: 'c3@test.com' }),
            ];
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: contacts }, status: 200 });

            const result = await adapter.syncContacts(buildConfig());

            expect(result.totalRecords).toBe(3);
            expect(result.successCount).toBe(2);
            expect(result.skippedRecords).toHaveLength(1);
        });

        it('should return ERROR status when API call fails', async () => {
            mockedAxios.post = jest.fn().mockRejectedValue(new Error('Network error'));

            const result = await adapter.syncContacts(buildConfig());

            expect(result.status).toBe(SyncStatus.ERROR);
        });

        it('should use accountnumber as clientNo when available', async () => {
            const contact = buildContact();
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [contact] }, status: 200 });

            await adapter.syncContacts(buildConfig());

            expect(mockTx.customerProfile.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ customerNo: 'C300001' }),
                }),
            );
        });

        it('should generate DYN- prefix clientNo when accountnumber is missing', async () => {
            const contact = buildContact({
                parentcustomerid_account: {
                    accountid: 'acc-uuid-1',
                    name: 'Aluplan GmbH',
                    accountnumber: null,
                },
            });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: { value: [contact] }, status: 200 });

            await adapter.syncContacts(buildConfig());

            expect(mockTx.customerProfile.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({
                        customerNo: expect.stringMatching(/^DYN-/),
                    }),
                }),
            );
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
        });
    });

    // ── fetchEntityMetadata URL ───────────────────────────────────────────────

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
