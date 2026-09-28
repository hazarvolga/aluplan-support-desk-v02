import { CrmRecordSyncService } from './crm-record-sync.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CrmRecordSyncService', () => {
    let service: CrmRecordSyncService;
    const mockPrisma = {
        crmAccount: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            upsert: jest.fn(),
        },
        customerProfile: {
            findMany: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
        user: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        crmChangeLog: {
            create: jest.fn(),
            createMany: jest.fn(),
        },
        $transaction: jest.fn((callback) => callback(mockPrisma)),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new CrmRecordSyncService(mockPrisma as unknown as PrismaService);
    });

    it('normalizes numeric Dynamics industry values before saving account records', async () => {
        mockPrisma.crmAccount.findUnique.mockResolvedValue(null);
        mockPrisma.crmAccount.upsert.mockResolvedValue({ id: 'acc-1' });

        await service.upsertAccountFromDynamics(
            {
                accountid: 'dyn-acc-1',
                name: 'AffeXAI',
                industrycode: 8,
            },
            { syncSettings: { accountMapping: { industry: 'industrycode' } } },
        );

        expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                update: expect.objectContaining({ industry: '8' }),
                create: expect.objectContaining({ industry: '8' }),
            }),
        );
    });

    it('cascades account name and industry snapshots to linked customer profiles', async () => {
        mockPrisma.crmAccount.findUnique.mockResolvedValue({
            id: 'acc-1',
            name: 'XYZ Demo Company',
            industry: '7',
        });
        mockPrisma.crmAccount.upsert.mockResolvedValue({ id: 'acc-1' });

        await service.upsertAccountFromDynamics(
            {
                accountid: 'dyn-acc-1',
                name: 'AffeXAI',
                industrycode: 8,
            },
            { syncSettings: { accountMapping: { industry: 'industrycode' } } },
        );

        expect(mockPrisma.customerProfile.updateMany).toHaveBeenCalledWith({
            where: { accountId: 'acc-1' },
            data: {
                companyName: 'AffeXAI',
                industry: '8',
            },
        });
    });

    it('restores a previously soft-deleted CRM account when Dynamics sends it again', async () => {
        mockPrisma.crmAccount.findUnique.mockResolvedValue({
            id: 'acc-1',
            externalAccountId: 'dyn-acc-1',
            deletedAt: new Date('2026-05-01T00:00:00.000Z'),
            crmVerified: false,
        });
        mockPrisma.crmAccount.upsert.mockResolvedValue({ id: 'acc-1' });

        await service.upsertAccountFromDynamics({
            accountid: 'dyn-acc-1',
            name: 'Restored Account',
        });

        expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                update: expect.objectContaining({
                    crmVerified: true,
                    deletedAt: null,
                }),
                create: expect.objectContaining({
                    crmVerified: true,
                    deletedAt: null,
                }),
            }),
        );
    });

    it('persists extended CRM account detail fields', async () => {
        mockPrisma.crmAccount.findUnique.mockResolvedValue(null);
        mockPrisma.crmAccount.upsert.mockResolvedValue({ id: 'acc-1' });

        await service.upsertAccountFromDynamics({
            accountid: 'dyn-acc-1',
            name: 'Betaş Beton ve Prefabrike',
            accountnumber: 'C300905890',
            new_clientidfrilo: 'FR-42',
            industrycode: 'Prefabrik',
            telephone1: '0352 322 20 50',
            fax: '0352 322 20 51',
            new_lisansyoneticisiisimsoyisim: 'Meriç Dinekli',
            websiteurl: 'https://example.com',
            address1_composite: 'Organize Sanayi Bölgesi 37. Cad.',
        });

        expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                update: expect.objectContaining({
                    account_number: 'C300905890',
                    clientIdFrilo: 'FR-42',
                    phone: '0352 322 20 50',
                    fax: '0352 322 20 51',
                    licenseManagerName: 'Meriç Dinekli',
                    serviceAddress: 'Organize Sanayi Bölgesi 37. Cad.',
                    rawCrmPayload: expect.objectContaining({ accountid: 'dyn-acc-1' }),
                }),
            }),
        );
    });

    it('honors lowercase CRM mapping keys saved by the mapping UI', async () => {
        mockPrisma.crmAccount.findUnique.mockResolvedValue(null);
        mockPrisma.crmAccount.upsert.mockResolvedValue({ id: 'acc-1' });

        await service.upsertAccountFromDynamics(
            {
                accountid: 'dyn-acc-1',
                name: 'Mapped Account',
                accountnumber: 'LEGACY-ACCOUNT-NO',
                new_customerid: 'ALLPLAN-CLIENT-ID',
            },
            { syncSettings: { accountMapping: { accountnumber: 'new_customerid' } } },
        );

        expect(mockPrisma.crmAccount.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                update: expect.objectContaining({
                    account_number: 'ALLPLAN-CLIENT-ID',
                }),
                create: expect.objectContaining({
                    account_number: 'ALLPLAN-CLIENT-ID',
                }),
            }),
        );
    });

    it('reconciles stale linked customer profile snapshots', async () => {
        (mockPrisma.crmAccount as any).findMany = jest.fn().mockResolvedValue([
            {
                id: 'acc-1',
                name: 'AffeXAI',
                industry: '8',
                customers: [
                    { id: 'profile-1', companyName: 'XYZ Demo Company', industry: '7' },
                    { id: 'profile-2', companyName: 'AffeXAI', industry: '8' },
                ],
            },
        ]);
        mockPrisma.customerProfile.updateMany.mockResolvedValue({ count: 1 });

        const result = await service.reconcileLinkedCustomerProfileSnapshots();

        expect(result).toBe(1);
        expect(mockPrisma.customerProfile.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ['profile-1'] } },
            data: {
                companyName: 'AffeXAI',
                industry: '8',
            },
        });
    });

    it('soft-deletes missing CRM accounts after a trusted full import', async () => {
        mockPrisma.crmAccount.findMany.mockResolvedValue([
            { id: 'acc-missing', externalAccountId: 'dyn-missing', crmVerified: true, deletedAt: null },
        ]);
        mockPrisma.crmAccount.updateMany.mockResolvedValue({ count: 1 });
        mockPrisma.crmChangeLog.createMany.mockResolvedValue({ count: 1 });

        const result = await service.reconcileMissingAccountsFromFullImport(['dyn-active'], {
            connectionId: 'conn-1',
            source: 'FULL_IMPORT',
            recordChanges: true,
        });

        expect(result).toBe(1);
        expect(mockPrisma.crmAccount.updateMany).toHaveBeenCalledWith({
            where: { id: { in: ['acc-missing'] } },
            data: {
                deletedAt: expect.any(Date),
                crmVerified: false,
            },
        });
    });

    it('soft-deletes missing CRM contacts and inactivates CRM-synced users after a trusted full import', async () => {
        mockPrisma.customerProfile.findMany.mockResolvedValue([
            {
                id: 'profile-missing',
                externalContactId: 'dyn-contact-missing',
                deletedAt: null,
                user: {
                    id: 'user-missing',
                    email: 'crm-user@example.com',
                    passwordHash: 'CRM_SYNCED',
                },
            },
        ]);
        mockPrisma.customerProfile.update.mockResolvedValue({});
        mockPrisma.user.update.mockResolvedValue({});
        mockPrisma.crmChangeLog.createMany.mockResolvedValue({ count: 1 });

        const result = await service.reconcileMissingContactsFromFullImport(['dyn-contact-active'], {
            connectionId: 'conn-1',
            source: 'FULL_IMPORT',
            recordChanges: true,
        });

        expect(result).toBe(1);
        expect(mockPrisma.customerProfile.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                externalContactId: { not: null, notIn: ['dyn-contact-active'] },
            }),
        }));
        expect(mockPrisma.customerProfile.update).toHaveBeenCalledWith({
            where: { id: 'profile-missing' },
            data: {
                deletedAt: expect.any(Date),
                crmVerified: false,
            },
        });
        expect(mockPrisma.user.update).toHaveBeenCalledWith({
            where: { id: 'user-missing' },
            data: { status: 'INACTIVE' },
        });
    });

    it('does not inactivate a manually managed test user during CRM reconciliation', async () => {
        mockPrisma.customerProfile.findMany.mockResolvedValue([{
            id: 'profile-test',
            externalContactId: 'dyn-contact-test',
            deletedAt: null,
            user: {
                id: 'user-test',
                email: 'local-test@example.com',
                passwordHash: 'local-password-hash',
            },
        }]);

        await service.reconcileMissingContactsFromFullImport(['dyn-contact-active']);

        expect(mockPrisma.customerProfile.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'profile-test' },
        }));
        expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('updates an existing profile by CRM contact id before creating a new one', async () => {
        const tx = {
            role: {
                findFirst: jest.fn().mockResolvedValue({ id: 'role-customer', name: 'CUSTOMER' }),
                findUnique: jest.fn().mockResolvedValue({ id: 'role-customer', name: 'CUSTOMER' }),
            },
            user: {
                findFirst: jest.fn().mockResolvedValue(null),
                update: jest.fn().mockImplementation(({ data }) =>
                    Promise.resolve({
                        id: 'user-existing',
                        email: data.email || 'old@example.com',
                        roleId: 'role-customer',
                        status: 'ACTIVE',
                        passwordHash: 'CRM_SYNCED',
                    }),
                ),
                create: jest.fn(),
            },
            crmAccount: {
                findUnique: jest.fn().mockResolvedValue({
                    id: 'account-1',
                    name: 'Promer',
                    industry: 'Engineering',
                    account_number: 'C300160737',
                }),
            },
            customerProfile: {
                findUnique: jest.fn().mockResolvedValueOnce({
                    id: 'profile-existing',
                    userId: 'user-existing',
                    externalContactId: 'crm-contact-1',
                    firstName: 'Old',
                    lastName: 'Name',
                    companyName: 'Old Company',
                    user: {
                        id: 'user-existing',
                        email: 'old@example.com',
                        roleId: 'role-customer',
                        status: 'ACTIVE',
                        passwordHash: 'CRM_SYNCED',
                    },
                }),
                update: jest.fn().mockResolvedValue({ id: 'profile-existing' }),
                create: jest.fn(),
            },
            crmChangeLog: {
                createMany: jest.fn(),
            },
        };
        const prisma = {
            $transaction: jest.fn((callback) => callback(tx)),
        };
        service = new CrmRecordSyncService(prisma as unknown as PrismaService);

        await service.upsertContactFromDynamics({
            contactid: 'crm-contact-1',
            emailaddress1: 'new@example.com',
            firstname: 'Cem',
            lastname: 'Sayar',
            telephone1: '+90 555',
            fax: '+90 216',
            mobilephone: '+90 532',
            address1_composite: 'Istanbul',
            preferredcontactmethodcode: 'Email',
            parentcustomerid_account: {
                accountid: 'crm-account-1',
                name: 'Promer',
                accountnumber: 'C300160737',
            },
        });

        expect(tx.customerProfile.findUnique).toHaveBeenCalledWith({
            where: { externalContactId: 'crm-contact-1' },
            include: { user: true },
        });
        expect(tx.customerProfile.create).not.toHaveBeenCalled();
        expect(tx.customerProfile.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'profile-existing' },
                data: expect.objectContaining({
                    phoneNumber: '+90 555',
                    fax: '+90 216',
                    mobilePhone: '+90 532',
                    address: 'Istanbul',
                    preferredContactMethod: 'Email',
                    rawCrmPayload: expect.objectContaining({
                        contactid: 'crm-contact-1',
                    }),
                }),
            }),
        );
    });
});
