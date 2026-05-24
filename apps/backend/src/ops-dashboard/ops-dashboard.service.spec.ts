import { OpsDashboardService } from './ops-dashboard.service';

const makeAggregate = () => ({
    _sum: { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCost: null },
    _count: { id: 0 },
});

const makeModel = () => ({
    count: jest.fn().mockResolvedValue(0),
    findMany: jest.fn().mockResolvedValue([]),
    groupBy: jest.fn().mockResolvedValue([]),
    aggregate: jest.fn().mockResolvedValue(makeAggregate()),
});

const makeQueue = () => ({
    getJobCounts: jest.fn().mockResolvedValue({
        waiting: 0,
        active: 0,
        delayed: 0,
        failed: 0,
        completed: 0,
        paused: 0,
    }),
});

describe('OpsDashboardService', () => {
    let prisma: any;
    let knowledgeQueue: any;
    let crmQueue: any;
    let aiQueue: any;
    let service: OpsDashboardService;

    beforeEach(() => {
        prisma = {
            ticket: makeModel(),
            aiInteraction: makeModel(),
            crmChangeLog: makeModel(),
            crawlCandidate: makeModel(),
            knowledgeSource: makeModel(),
            knowledgeSourceSyncLog: makeModel(),
            knowledgePoolEmbedding: makeModel(),
            aiHealthEvent: makeModel(),
            user: makeModel(),
            customerProfile: makeModel(),
            crmAccount: makeModel(),
            $queryRaw: jest.fn().mockResolvedValue([]),
            $queryRawUnsafe: jest.fn().mockResolvedValue([]),
        };
        knowledgeQueue = makeQueue();
        crmQueue = makeQueue();
        aiQueue = makeQueue();
        service = new OpsDashboardService(prisma, knowledgeQueue, crmQueue, aiQueue);
    });

    it('returns deterministic empty trend data instead of fake operational values', async () => {
        const result = await service.getOverview({ requesterRole: 'SUPERUSER', days: 7 });

        expect(result.activeDesk.trend).toHaveLength(7);
        expect(result.activeDesk.trend.every((point: any) => point.created === 0 && point.resolved === 0)).toBe(true);
        expect(result.pulse.aiQuality.trend).toHaveLength(7);
        expect(result.kpis.activeTickets).toBe(0);
        expect(result.decision.code).toBe('operationally_stable');
    });

    it('includes AI cost only for admin-like roles', async () => {
        prisma.aiInteraction.aggregate.mockResolvedValue({
            _sum: { inputTokens: 10, outputTokens: 20, totalTokens: 30, estimatedCost: { toNumber: () => 0.42 } },
            _count: { id: 2 },
        });
        prisma.aiInteraction.groupBy.mockResolvedValue([
            {
                provider: 'gemini',
                model: 'gemini-2.5-flash',
                _sum: { inputTokens: 10, outputTokens: 20, totalTokens: 30, estimatedCost: { toNumber: () => 0.42 } },
                _count: { id: 2 },
            },
        ]);

        const superUserResult = await service.getOverview({ requesterRole: 'SUPERUSER' });
        expect(superUserResult.cost?.rolling30d.estimatedCost).toBe(0.42);

        jest.clearAllMocks();
        const agentResult = await service.getOverview({ requesterRole: 'AGENT' });
        expect(agentResult.cost).toBeNull();
        expect(prisma.aiInteraction.aggregate).not.toHaveBeenCalled();
    });

    it('surfaces assignment and SLA pressure in the decision summary', async () => {
        prisma.ticket.count
            .mockResolvedValueOnce(5) // active
            .mockResolvedValueOnce(2) // unassigned
            .mockResolvedValueOnce(0) // sla breaches
            .mockResolvedValueOnce(0); // resolved today

        const result = await service.getOverview({ requesterRole: 'SUPERUSER' });

        expect(result.kpis.unassignedTickets).toBe(2);
        expect(result.decision).toEqual({
            level: 'warning',
            code: 'unassigned_tickets',
            primaryAction: '/tickets?assignedTo=unassigned',
        });
    });

    it('enriches CRM change records with readable customer details and safe links', async () => {
        prisma.customerProfile.findMany.mockResolvedValue([
            {
                id: '31bf573c-6282-499c-8f85-217c5ed4911e',
                firstName: 'Deniz',
                lastName: 'Dogan',
                companyName: 'LGN Proje',
                externalContactId: 'crm-contact-1',
                user: { email: 'deniz@example.com', fullName: 'Deniz Dogan' },
            },
        ]);

        const enriched = await (service as any).enrichCrmChanges([
            {
                id: 'change-1',
                entityType: 'contact',
                entityId: 'crm-contact-1',
                localRecordId: null,
                fieldName: 'email',
                oldValue: 'old@example.com',
                newValue: 'deniz@example.com',
                source: 'DELTA_SYNC',
                status: 'SUCCESS',
                changedAt: new Date('2026-05-24T00:00:00.000Z'),
            },
        ]);

        expect(enriched[0]).toMatchObject({
            displayName: 'Deniz Dogan',
            companyName: 'LGN Proje',
            email: 'deniz@example.com',
            changeSummary: 'email: old@example.com -> deniz@example.com',
            href: '/customers/31bf573c-6282-499c-8f85-217c5ed4911e',
        });
    });
});
