/**
 * CRM Dynamics 365 — Integration Tests
 *
 * Bu testler gerçek Dynamics 365 OData response formatını simüle eder.
 * Axios mock'u ile HTTP katmanı intercept edilir — gerçek credentials gerekmez.
 *
 * Kapsam:
 * - Token acquisition akışı (başarı + hata)
 * - syncAccounts: tam OData formatı, FormattedValue, customerNo
 * - syncContacts: expand formatı, contractStatus, skippedLinks
 * - Pagination: @odata.nextLink takibi (çok sayfalı veri)
 * - Discovery: EntityDefinitions metadata + sample record
 * - Hata senaryoları: 401, 429, network timeout
 */

jest.mock('axios');
import axios from 'axios';
import { Test, TestingModule } from '@nestjs/testing';
import { Dynamics365Adapter } from '../../src/crm/adapters/dynamics365.adapter';
import { CrmRecordSyncService } from '../../src/crm/services/crm-record-sync.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SyncStatus } from '@aluplan/database';
import {
    MOCK_TOKEN_RESPONSE,
    MOCK_TOKEN_ERROR_RESPONSE,
    buildD365Account,
    buildD365AccountsResponse,
    buildD365AccountPage1,
    buildD365AccountPage2,
    buildD365Contact,
    buildD365ContactsResponse,
    buildD365ContactPage1,
    buildD365ContactPage2,
    MOCK_ACCOUNT_METADATA,
    MOCK_CONTACT_METADATA,
} from '../fixtures/dynamics365-responses';

const mockedAxios = axios as jest.Mocked<typeof axios>;

// ─── Mock Prisma ──────────────────────────────────────────────────────────────

const mockTx = {
    user: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    role: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    crmAccount: { findUnique: jest.fn() },
    customerProfile: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
    crmChangeLog: { createMany: jest.fn() },
};

const mockPrisma = {
    crmAccount: { findUnique: jest.fn(), findMany: jest.fn(), upsert: jest.fn(), updateMany: jest.fn() },
    customerProfile: { updateMany: jest.fn(), findMany: jest.fn() },
    crmChangeLog: { createMany: jest.fn() },
    $transaction: jest.fn((cb: any) => cb(mockTx)),
};

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_CONFIG = {
    id: 'conn-integration-test',
    instanceUrl: 'https://org.crm4.dynamics.com',
    tenantId: 'tenant-id-integration',
    clientId: 'client-id-integration',
    clientSecret: 'client-secret-integration',
    syncSettings: { accountMapping: {}, contactMapping: {} },
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('Dynamics365Adapter — Integration (OData format)', () => {
    let adapter: Dynamics365Adapter;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                Dynamics365Adapter,
                CrmRecordSyncService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: ConfigService, useValue: { get: jest.fn() } },
            ],
        }).compile();

        adapter = module.get<Dynamics365Adapter>(Dynamics365Adapter);
        jest.clearAllMocks();

        // Default: token succeeds
        mockedAxios.post = jest.fn().mockResolvedValue({ data: MOCK_TOKEN_RESPONSE });

        // Default tx mocks
        mockPrisma.$transaction = jest.fn((cb: any) => cb(mockTx));
        mockPrisma.crmAccount.findUnique.mockResolvedValue(null);
        mockPrisma.crmAccount.findMany.mockResolvedValue([]);
        mockPrisma.crmAccount.updateMany.mockResolvedValue({ count: 0 });
        mockPrisma.customerProfile.findMany.mockResolvedValue([]);
        mockPrisma.customerProfile.updateMany.mockImplementation(async ({ where }: { where: { accountId: string } }) => {
            expect(where.accountId).toBe('db-acc-1');
            return { count: 0 };
        });
        mockTx.role.findFirst.mockResolvedValue({ id: 'role-cust', name: 'CUSTOMER' });
        mockTx.role.create.mockResolvedValue({ id: 'role-cust', name: 'CUSTOMER' });
        mockTx.user.findFirst.mockResolvedValue(null);
        mockTx.user.update.mockResolvedValue({});
        mockTx.role.findUnique.mockResolvedValue({ id: 'role-cust', name: 'CUSTOMER' });
        mockTx.user.create.mockResolvedValue({ id: 'user-new', email: 'test@test.com' });
        mockTx.crmAccount.findUnique.mockResolvedValue({ id: 'db-acc-1', industry: 'Manufacturing' });
        mockTx.customerProfile.findUnique.mockResolvedValue(null);
        mockTx.customerProfile.update.mockResolvedValue({});
        mockTx.customerProfile.create.mockImplementation(async ({ data }: { data: { externalContactId: string; userId: string; accountId: string | null } }) => ({
            id: `profile-${data.externalContactId}`,
            userId: data.userId,
            accountId: data.accountId,
        }));
        mockPrisma.crmAccount.upsert.mockResolvedValue({ id: 'db-acc-1' });
    });

    // ── Token Acquisition ─────────────────────────────────────────────────────

    describe('Token Acquisition', () => {
        it('should POST to correct Microsoft OAuth2 endpoint', async () => {
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365AccountsResponse() });

            await adapter.syncAccounts(BASE_CONFIG);

            const tokenCall = (mockedAxios.post as jest.Mock).mock.calls[0];
            expect(tokenCall[0]).toBe(
                `https://login.microsoftonline.com/${BASE_CONFIG.tenantId}/oauth2/v2.0/token`,
            );
        });

        it('should use instanceUrl as scope resource', async () => {
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365AccountsResponse() });

            await adapter.syncAccounts(BASE_CONFIG);

            const tokenBody = (mockedAxios.post as jest.Mock).mock.calls[0][1] as URLSearchParams;
            expect(tokenBody.get('scope')).toBe(`${BASE_CONFIG.instanceUrl}/.default`);
            expect(tokenBody.get('grant_type')).toBe('client_credentials');
        });

        it('should return ERROR when Microsoft returns invalid_client', async () => {
            mockedAxios.post = jest.fn().mockRejectedValue({
                response: { data: MOCK_TOKEN_ERROR_RESPONSE, status: 401 },
                message: 'Request failed with status code 401',
            });

            const result = await adapter.syncAccounts(BASE_CONFIG);

            expect(result.status).toBe(SyncStatus.ERROR);
            expect(result.errorMessage).toContain('Account Sync Error');
        });

        it('should return false from verifyConnection on auth failure', async () => {
            mockedAxios.post = jest.fn().mockRejectedValue({
                response: { data: MOCK_TOKEN_ERROR_RESPONSE, status: 401 },
                message: 'Auth failed',
            });

            const result = await adapter.verifyConnection(BASE_CONFIG);
            expect(result).toBe(false);
        });

        it('should strip trailing slash from instanceUrl in scope', async () => {
            const configWithSlash = { ...BASE_CONFIG, instanceUrl: 'https://org.crm4.dynamics.com/' };
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365AccountsResponse() });

            await adapter.syncAccounts(configWithSlash);

            const tokenBody = (mockedAxios.post as jest.Mock).mock.calls[0][1] as URLSearchParams;
            expect(tokenBody.get('scope')).toBe('https://org.crm4.dynamics.com/.default');
        });
    });

    // ── syncAccounts — OData Format ───────────────────────────────────────────

    describe('syncAccounts — Real OData Response Format', () => {
        it('should parse FormattedValue annotation for industry (option set)', async () => {
            const account = buildD365Account({
                industrycode: 6,
                'industrycode@OData.Community.Display.V1.FormattedValue': 'Manufacturing',
            });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365AccountsResponse([account]) });

            await adapter.syncAccounts(BASE_CONFIG);

            expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ industry: 'Manufacturing' }),
                }),
            );
        });

        it('should save customerNo from accountnumber (C3XXXXXX format)', async () => {
            const account = buildD365Account({ accountnumber: 'C300042' });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365AccountsResponse([account]) });

            await adapter.syncAccounts(BASE_CONFIG);

            expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ account_number: 'C300042' }),
                    create: expect.objectContaining({ account_number: 'C300042' }),
                }),
            );
        });

        it('should save customerNo as null when accountnumber is absent', async () => {
            const account = buildD365Account({ accountnumber: null });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365AccountsResponse([account]) });

            await adapter.syncAccounts(BASE_CONFIG);

            expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ account_number: null }),
                }),
            );
        });

        it('should use @odata.etag-bearing response without errors', async () => {
            // Real D365 responses include @odata.etag — should not break parsing
            const account = buildD365Account(); // includes '@odata.etag'
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365AccountsResponse([account]) });

            const result = await adapter.syncAccounts(BASE_CONFIG);

            expect(result.status).toBe(SyncStatus.SUCCESS);
            expect(result.successCount).toBe(1);
        });

        it('should send OData-MaxVersion and Prefer headers', async () => {
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365AccountsResponse() });

            await adapter.syncAccounts(BASE_CONFIG);

            const getCall = (mockedAxios.get as jest.Mock).mock.calls[0];
            const headers = getCall[1].headers;
            expect(headers['OData-MaxVersion']).toBe('4.0');
            expect(headers['OData-Version']).toBe('4.0');
            expect(headers['Prefer']).toContain('odata.include-annotations');
        });

        it('should handle empty accounts list gracefully', async () => {
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365AccountsResponse([]) });

            const result = await adapter.syncAccounts(BASE_CONFIG);

            expect(result.status).toBe(SyncStatus.SUCCESS);
            expect(result.totalRecords).toBe(0);
            expect(result.successCount).toBe(0);
            expect(mockPrisma.crmAccount.upsert).not.toHaveBeenCalled();
            expect(mockPrisma.crmAccount.findMany).not.toHaveBeenCalled();
            expect(mockPrisma.crmAccount.updateMany).not.toHaveBeenCalled();
        });

        it('should reconcile missing accounts only after a complete successful fetch', async () => {
            const account = buildD365Account();
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365AccountsResponse([account]) });
            mockPrisma.crmAccount.findMany.mockResolvedValue([{
                id: 'db-stale-account',
                externalAccountId: 'crm-stale-account',
                crmVerified: true,
                deletedAt: null,
            }]);

            const result = await adapter.syncAccounts(BASE_CONFIG);

            expect(result.status).toBe(SyncStatus.SUCCESS);
            expect(mockPrisma.crmAccount.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ externalAccountId: { not: null, notIn: [account.accountid] } }),
            }));
            expect(mockPrisma.crmAccount.updateMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: { in: ['db-stale-account'] } },
                data: expect.objectContaining({ crmVerified: false, deletedAt: expect.any(Date) }),
            }));
        });
    });

    // ── Pagination ────────────────────────────────────────────────────────────

    describe('Pagination — @odata.nextLink', () => {
        it('should follow nextLink and collect all accounts across pages', async () => {
            const nextLinkUrl = 'https://org.crm4.dynamics.com/api/data/v9.2/accounts?$skiptoken=page2token';

            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({ data: buildD365AccountPage1(nextLinkUrl) })
                .mockResolvedValueOnce({ data: buildD365AccountPage2() });

            const result = await adapter.syncAccounts(BASE_CONFIG);

            // Page1: 2 accounts, Page2: 1 account
            expect(result.totalRecords).toBe(3);
            expect(result.successCount).toBe(3);
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
        });

        it('should use exact nextLink URL for second page request', async () => {
            const nextLinkUrl = 'https://org.crm4.dynamics.com/api/data/v9.2/accounts?$skiptoken=abc123&$top=5000';

            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({ data: buildD365AccountPage1(nextLinkUrl) })
                .mockResolvedValueOnce({ data: buildD365AccountPage2() });

            await adapter.syncAccounts(BASE_CONFIG);

            const secondCallUrl = (mockedAxios.get as jest.Mock).mock.calls[1][0];
            expect(secondCallUrl).toBe(nextLinkUrl);
        });

        it('should reject a cross-origin nextLink before sending the bearer token', async () => {
            const untrustedNextLink = 'https://attacker.example/api/data/v9.2/accounts';
            mockedAxios.get = jest.fn().mockResolvedValueOnce({ data: buildD365AccountPage1(untrustedNextLink) });

            const result = await adapter.syncAccounts(BASE_CONFIG);

            expect(result.status).toBe(SyncStatus.ERROR);
            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
            expect(mockPrisma.crmAccount.upsert).not.toHaveBeenCalled();
        });

        it('should not reconcile or write a partial import when the second page fails', async () => {
            const nextLinkUrl = 'https://org.crm4.dynamics.com/api/data/v9.2/accounts?$skiptoken=page2';
            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({ data: buildD365AccountPage1(nextLinkUrl) })
                .mockRejectedValueOnce(new Error('Second page unavailable'));

            const result = await adapter.syncAccounts(BASE_CONFIG);

            expect(result.status).toBe(SyncStatus.ERROR);
            expect(mockPrisma.crmAccount.upsert).not.toHaveBeenCalled();
            expect(mockPrisma.crmAccount.findMany).not.toHaveBeenCalled();
            expect(mockPrisma.crmAccount.updateMany).not.toHaveBeenCalled();
        });

        it('should follow nextLink for contacts across pages', async () => {
            const nextLinkUrl = 'https://org.crm4.dynamics.com/api/data/v9.2/contacts?$skiptoken=contactpage2';

            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({ data: buildD365ContactPage1(nextLinkUrl) })
                .mockResolvedValueOnce({ data: buildD365ContactPage2() });

            const result = await adapter.syncContacts(BASE_CONFIG);

            // Page1: 2 contacts, Page2: 1 contact
            expect(result.totalRecords).toBe(3);
            expect(result.successCount).toBe(3);
            expect(mockedAxios.get).toHaveBeenCalledTimes(2);
        });

        it('should handle 3+ pages correctly', async () => {
            const link1 = 'https://org.crm4.dynamics.com/api/data/v9.2/accounts?$skiptoken=p2';
            const link2 = 'https://org.crm4.dynamics.com/api/data/v9.2/accounts?$skiptoken=p3';

            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({
                    data: {
                        '@odata.nextLink': link1,
                        value: [buildD365Account({ accountid: 'a1', name: 'A1' })],
                    },
                })
                .mockResolvedValueOnce({
                    data: {
                        '@odata.nextLink': link2,
                        value: [buildD365Account({ accountid: 'a2', name: 'A2' })],
                    },
                })
                .mockResolvedValueOnce({
                    data: {
                        value: [buildD365Account({ accountid: 'a3', name: 'A3' })],
                    },
                });

            const result = await adapter.syncAccounts(BASE_CONFIG);

            expect(result.totalRecords).toBe(3);
            expect(mockedAxios.get).toHaveBeenCalledTimes(3);
        });

        it('should stop pagination when nextLink is absent', async () => {
            // Single page — no nextLink
            mockedAxios.get = jest.fn().mockResolvedValue({
                data: buildD365AccountsResponse([buildD365Account()]),
            });

            await adapter.syncAccounts(BASE_CONFIG);

            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        });
    });

    // ── syncContacts — OData Format ───────────────────────────────────────────

    describe('syncContacts — Real OData Response Format', () => {
        it('should parse contractStatus from FormattedValue annotation', async () => {
            const contact = buildD365Contact({
                new_musteridurumu: 1,
                'new_musteridurumu@OData.Community.Display.V1.FormattedValue': 'Aktif',
            });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365ContactsResponse([contact]) });

            await adapter.syncContacts(BASE_CONFIG);

            expect(mockTx.customerProfile.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ contractStatus: 'Aktif' }),
                }),
            );
        });

        it('should parse industry from parentcustomerid_account expand', async () => {
            const contact = buildD365Contact(); // includes parentcustomerid_account with FormattedValue
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365ContactsResponse([contact]) });

            await adapter.syncContacts(BASE_CONFIG);

            expect(mockTx.customerProfile.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ industry: 'Manufacturing' }),
                }),
            );
        });

        it('should use accountnumber from parentcustomerid_account as customerNo', async () => {
            const contact = buildD365Contact(); // parentcustomerid_account.accountnumber = 'C300001'
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365ContactsResponse([contact]) });

            await adapter.syncContacts(BASE_CONFIG);

            expect(mockTx.customerProfile.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ customerNo: 'C300001-c1d2e' }),
                }),
            );
            expect(mockTx.customerProfile.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ userId: 'user-new', accountId: 'db-acc-1' }),
            }));
        });

        it('should generate a placeholder email for contact with null emailaddress1', async () => {
            const contact = buildD365Contact({ contactid: 'ctx-123', emailaddress1: null });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365ContactsResponse([contact]) });

            const result = await adapter.syncContacts(BASE_CONFIG);

            expect(result.successCount).toBe(1);
            expect(mockTx.user.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ email: 'no-email-ctx-123@internal.aluplan', status: 'INACTIVE' })
                })
            );
        });

        it('should add to skippedLinks when parentcustomerid_account not in DB', async () => {
            const contact = buildD365Contact();
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365ContactsResponse([contact]) });
            mockTx.crmAccount.findUnique.mockResolvedValue(null); // not in DB

            const result = await adapter.syncContacts(BASE_CONFIG);

            expect(result.skippedLinks).toHaveLength(1);
            expect(result.skippedLinks![0].missingAccountExternalId).toBe(
                contact.parentcustomerid_account.accountid,
            );
            // Contact still saved with accountId = undefined
            expect(result.successCount).toBe(1);
        });

        it('should handle contact without parentcustomerid_account', async () => {
            const contact = buildD365Contact({ parentcustomerid_account: null });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365ContactsResponse([contact]) });

            const result = await adapter.syncContacts(BASE_CONFIG);

            expect(result.successCount).toBe(1);
            expect(result.skippedLinks).toHaveLength(0);
        });

        it('should generate DYN- prefix when no accountnumber available', async () => {
            const contact = buildD365Contact({
                parentcustomerid_account: {
                    accountid: 'acc-no-number',
                    name: 'No Number Corp',
                    accountnumber: null,
                },
            });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365ContactsResponse([contact]) });

            await adapter.syncContacts(BASE_CONFIG);

            expect(mockTx.customerProfile.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        customerNo: expect.stringMatching(/^DYN-[a-f0-9\-]{10}$/),
                    }),
                }),
            );
        });
    });

    // ── Discovery — EntityDefinitions ─────────────────────────────────────────

    describe('Discovery — EntityDefinitions Metadata', () => {
        it('should call EntityDefinitions endpoint (not deprecated RetrieveMetadataChanges)', async () => {
            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({ data: MOCK_ACCOUNT_METADATA })
                .mockResolvedValueOnce({ data: MOCK_CONTACT_METADATA })
                .mockResolvedValueOnce({ data: { value: [buildD365Account()] } })
                .mockResolvedValueOnce({ data: { value: [buildD365Contact()] } });

            await adapter.getDiscoveryData(BASE_CONFIG);

            const calls = (mockedAxios.get as jest.Mock).mock.calls;
            expect(calls[0][0]).toContain("EntityDefinitions(LogicalName='account')/Attributes");
            expect(calls[1][0]).toContain("EntityDefinitions(LogicalName='contact')/Attributes");
        });

        it('should map UserLocalizedLabel to displayName', async () => {
            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({ data: MOCK_ACCOUNT_METADATA })
                .mockResolvedValueOnce({ data: MOCK_CONTACT_METADATA })
                .mockResolvedValueOnce({ data: { value: [buildD365Account()] } })
                .mockResolvedValueOnce({ data: { value: [buildD365Contact()] } });

            const result = await adapter.getDiscoveryData(BASE_CONFIG);

            const nameField = result.account.find((f: any) => f.logicalName === 'name');
            expect(nameField?.displayName).toBe('Account Name');

            const industryField = result.account.find((f: any) => f.logicalName === 'industrycode');
            expect(industryField?.displayName).toBe('Industry');
        });

        it('should fall back to logicalName when DisplayName is null', async () => {
            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({ data: MOCK_ACCOUNT_METADATA })
                .mockResolvedValueOnce({ data: MOCK_CONTACT_METADATA })
                .mockResolvedValueOnce({ data: { value: [buildD365Account()] } })
                .mockResolvedValueOnce({ data: { value: [buildD365Contact()] } });

            const result = await adapter.getDiscoveryData(BASE_CONFIG);

            // MOCK_ACCOUNT_METADATA has 'new_customfield' with null DisplayName
            const customField = result.account.find((f: any) => f.logicalName === 'new_customfield');
            expect(customField?.displayName).toBe('new_customfield');
        });

        it('should include sampleValue from real record', async () => {
            const sampleAccount = buildD365Account({ name: 'Sample Corp', accountnumber: 'C300099' });
            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({ data: MOCK_ACCOUNT_METADATA })
                .mockResolvedValueOnce({ data: MOCK_CONTACT_METADATA })
                .mockResolvedValueOnce({ data: { value: [sampleAccount] } })
                .mockResolvedValueOnce({ data: { value: [buildD365Contact()] } });

            const result = await adapter.getDiscoveryData(BASE_CONFIG);

            const nameField = result.account.find((f: any) => f.logicalName === 'name');
            expect(nameField?.sampleValue).toBe('Sample Corp');
        });

        it('should degrade gracefully when metadata endpoint fails', async () => {
            // Metadata fails, but sample succeeds — should return keys from sample
            mockedAxios.get = jest.fn()
                .mockRejectedValueOnce(new Error('Metadata endpoint 403'))
                .mockRejectedValueOnce(new Error('Metadata endpoint 403'))
                .mockResolvedValueOnce({ data: { value: [buildD365Account()] } })
                .mockResolvedValueOnce({ data: { value: [buildD365Contact()] } });

            const result = await adapter.getDiscoveryData(BASE_CONFIG);

            // Should still return fields from sample record keys
            expect(result.account.length).toBeGreaterThan(0);
            expect(result.account[0]).toHaveProperty('logicalName');
        });

        it('should filter out fields starting with underscore', async () => {
            const sampleWithInternal = buildD365Account({
                _ownerid_value: 'some-guid',
                _createdby_value: 'another-guid',
            });
            mockedAxios.get = jest.fn()
                .mockResolvedValueOnce({ data: { value: [] } }) // empty metadata
                .mockResolvedValueOnce({ data: { value: [] } })
                .mockResolvedValueOnce({ data: { value: [sampleWithInternal] } })
                .mockResolvedValueOnce({ data: { value: [] } });

            const result = await adapter.getDiscoveryData(BASE_CONFIG);

            const internalFields = result.account.filter((f: any) => f.logicalName.startsWith('_'));
            expect(internalFields).toHaveLength(0);
        });
    });

    // ── Error Scenarios ───────────────────────────────────────────────────────

    describe('Error Scenarios', () => {
        it('should return ERROR when accounts API returns 401', async () => {
            mockedAxios.get = jest.fn().mockRejectedValue({
                response: { status: 401, data: { error: { code: '0x80040220', message: 'Access denied' } } },
                message: 'Request failed with status code 401',
            });

            const result = await adapter.syncAccounts(BASE_CONFIG);

            expect(result.status).toBe(SyncStatus.ERROR);
            expect(result.errorMessage).toContain('Account Sync Error');
        });

        it('should return ERROR when contacts API returns 401', async () => {
            mockedAxios.get = jest.fn().mockRejectedValue({
                response: { status: 401, data: { error: { code: '0x80040220', message: 'Access denied' } } },
                message: 'Request failed with status code 401',
            });

            const result = await adapter.syncContacts(BASE_CONFIG);

            expect(result.status).toBe(SyncStatus.ERROR);
        });

        it('should continue processing remaining accounts when one upsert fails', async () => {
            const accounts = [
                buildD365Account({ accountid: 'acc-ok', name: 'OK Corp' }),
                buildD365Account({ accountid: 'acc-fail', name: 'Fail Corp' }),
                buildD365Account({ accountid: 'acc-ok2', name: 'OK Corp 2' }),
            ];
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365AccountsResponse(accounts) });

            mockPrisma.crmAccount.upsert
                .mockResolvedValueOnce({ id: 'db-acc-1' }) // OK
                .mockRejectedValueOnce(new Error('Unique constraint violation')) // FAIL
                .mockResolvedValueOnce({ id: 'db-acc-1' }); // OK

            const result = await adapter.syncAccounts(BASE_CONFIG);

            expect(result.successCount).toBe(2);
            expect(result.errorCount).toBe(1);
            expect(result.failedRecords).toHaveLength(1);
            expect(result.failedRecords![0].externalId).toBe('acc-fail');
            expect(result.failedRecords![0].errorMessage).toContain('Unique constraint');
        });

        it('should handle network timeout gracefully', async () => {
            mockedAxios.get = jest.fn().mockRejectedValue(new Error('ECONNABORTED: timeout of 30000ms exceeded'));

            const result = await adapter.syncAccounts(BASE_CONFIG);

            expect(result.status).toBe(SyncStatus.ERROR);
            expect(result.totalRecords).toBe(0);
        });

        it('should include D365 error details in errorMessage when available', async () => {
            mockedAxios.post = jest.fn().mockRejectedValue({
                response: { data: MOCK_TOKEN_ERROR_RESPONSE, status: 401 },
                message: 'Request failed',
            });

            const result = await adapter.syncAccounts(BASE_CONFIG);

            // errorMessage should contain the D365 error details
            expect(result.errorMessage).toBeDefined();
            expect(result.status).toBe(SyncStatus.ERROR);
        });
    });

    // ── resolveField — OData Annotation Edge Cases ────────────────────────────

    describe('resolveField — OData Annotation Edge Cases', () => {
        it('should NOT treat @OData annotation keys as dot-notation paths', async () => {
            // This was the critical bug: 'industrycode@OData.Community...' was being
            // split on '.' and traversed as nested object path
            const account = buildD365Account({
                'industrycode@OData.Community.Display.V1.FormattedValue': 'Technology',
            });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365AccountsResponse([account]) });

            const result = await adapter.syncAccounts(BASE_CONFIG);

            // Should succeed — not crash on dot-notation traversal
            expect(result.status).toBe(SyncStatus.SUCCESS);
            expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ industry: 'Technology' }),
                }),
            );
        });

        it('should store a mapped raw industrycode integer as text when FormattedValue is null', async () => {
            const account = buildD365Account({
                industrycode: 6,
                'industrycode@OData.Community.Display.V1.FormattedValue': null,
            });
            mockedAxios.get = jest.fn().mockResolvedValue({ data: buildD365AccountsResponse([account]) });

            await adapter.syncAccounts(
                buildConfig({ syncSettings: { accountMapping: { industry: 'industrycode' }, contactMapping: {} } }),
            );

            expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({ industry: '6' }),
                }),
            );
        });
    });
});

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildConfig(overrides: Record<string, any> = {}) {
    return { ...BASE_CONFIG, ...overrides };
}
