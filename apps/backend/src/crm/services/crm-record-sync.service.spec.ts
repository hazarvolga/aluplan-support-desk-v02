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
});
