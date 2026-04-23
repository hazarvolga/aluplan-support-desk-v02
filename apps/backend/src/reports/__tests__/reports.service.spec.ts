import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from '../reports.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ReportsService', () => {
    let service: ReportsService;
    let prisma: any;

    beforeEach(async () => {
        const mockPrismaService = {
            ticket: {
                count: jest.fn(),
                groupBy: jest.fn(),
            },
            user: {
                findMany: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<ReportsService>(ReportsService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getSlaPerformance', () => {
        it('should return SLA performance metrics', async () => {
            prisma.ticket.count.mockResolvedValueOnce(100).mockResolvedValueOnce(20);

            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-12-31');
            const result = await service.getSlaPerformance(startDate, endDate);

            expect(result).toEqual({
                total: 100,
                breached: 20,
                met: 80,
                complianceRate: '80.00',
            });
            expect(prisma.ticket.count).toHaveBeenCalledTimes(2);
        });

        it('should return 100% compliance when no tickets', async () => {
            prisma.ticket.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

            const result = await service.getSlaPerformance(new Date(), new Date());

            expect(result.complianceRate).toBe('100.00');
        });
    });

    describe('getAgentPerformance', () => {
        it('should return agent performance metrics', async () => {
            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-12-31');

            const resolvedStats = [
                { assignedTo: 'u1', _count: { id: 10 }, _avg: { satisfactionScore: 4.5 } },
            ];
            prisma.ticket.groupBy.mockResolvedValue(resolvedStats);

            const agents = [{ id: 'u1', fullName: 'Agent A', email: 'agent@example.com' }];
            prisma.user.findMany.mockResolvedValue(agents);

            const result = await service.getAgentPerformance(startDate, endDate);

            expect(result).toEqual([
                {
                    agent: agents[0],
                    ticketsResolved: 10,
                    averageCsat: '4.50',
                },
            ]);
            expect(prisma.ticket.groupBy).toHaveBeenCalledWith({
                by: ['assignedTo'],
                where: {
                    status: 'RESOLVED',
                    resolvedAt: { gte: startDate, lte: endDate },
                },
                _count: { id: true },
                _avg: { satisfactionScore: true },
            });
        });

        it('should handle null satisfactionScore', async () => {
            const resolvedStats = [
                { assignedTo: 'u1', _count: { id: 5 }, _avg: { satisfactionScore: null } },
            ];
            prisma.ticket.groupBy.mockResolvedValue(resolvedStats);
            prisma.user.findMany.mockResolvedValue([{ id: 'u1', fullName: 'Agent A' }]);

            const result = await service.getAgentPerformance(new Date(), new Date());

            expect(result[0].averageCsat).toBeNull();
        });

        it('should skip entries without assignedTo', async () => {
            const resolvedStats = [
                { assignedTo: null, _count: { id: 3 }, _avg: { satisfactionScore: 5 } },
            ];
            prisma.ticket.groupBy.mockResolvedValue(resolvedStats);
            prisma.user.findMany.mockResolvedValue([]);

            const result = await service.getAgentPerformance(new Date(), new Date());

            expect(result).toEqual([]);
        });
    });
});
