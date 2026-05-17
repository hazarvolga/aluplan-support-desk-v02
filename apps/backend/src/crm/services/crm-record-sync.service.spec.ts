import { CrmRecordSyncService } from './crm-record-sync.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CrmRecordSyncService', () => {
    let service: CrmRecordSyncService;
    const mockPrisma = {
        crmAccount: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
        },
        customerProfile: {
            updateMany: jest.fn(),
        },
        crmChangeLog: {
            createMany: jest.fn(),
        },
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

    it('updates an existing profile by CRM contact id before creating a new one', async () => {
        const tx = {
            role: {
                findFirst: jest.fn().mockResolvedValue({ id: 'role-customer', name: 'CUSTOMER' }),
                findUnique: jest.fn().mockResolvedValue({ id: 'role-customer', name: 'CUSTOMER' }),
            },
            user: {
                findUnique: jest.fn().mockResolvedValue(null),
                update: jest.fn().mockImplementation(({ data }) => Promise.resolve({
                    id: 'user-existing',
                    email: data.email || 'old@example.com',
                    roleId: 'role-customer',
                    status: 'ACTIVE',
                    passwordHash: 'CRM_SYNCED',
                })),
                create: jest.fn(),
            },
            crmAccount: {
                findUnique: jest.fn().mockResolvedValue({ id: 'account-1', name: 'Promer', industry: 'Engineering', account_number: 'C300160737' }),
            },
            customerProfile: {
                findUnique: jest.fn()
                    .mockResolvedValueOnce({
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
        expect(tx.customerProfile.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'profile-existing' },
        }));
    });
});
