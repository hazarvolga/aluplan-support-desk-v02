import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementLogReconciliationService } from './announcement-log-reconciliation.service';
import { PrismaService } from '../prisma/prisma.service';

const ACTIONABLE_EMAIL_STATUSES = ['SENT', 'DELIVERED', 'BOUNCED', 'FAILED'];

function buildPrismaMock() {
    return {
        announcementLog: {
            findMany: jest.fn().mockResolvedValue([]),
            updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        emailLog: {
            findUnique: jest.fn(),
        },
    } as any;
}

async function buildService(prisma: any): Promise<AnnouncementLogReconciliationService> {
    const module: TestingModule = await Test.createTestingModule({
        providers: [
            AnnouncementLogReconciliationService,
            { provide: PrismaService, useValue: prisma },
        ],
    }).compile();
    return module.get<AnnouncementLogReconciliationService>(AnnouncementLogReconciliationService);
}

describe('AnnouncementLogReconciliationService', () => {
    let prisma: any;
    let service: AnnouncementLogReconciliationService;

    beforeEach(async () => {
        prisma = buildPrismaMock();
        service = await buildService(prisma);
    });

    describe('reconcileQueuedLogs', () => {
        it('queries only QUEUED logs whose linked EmailLog has an actionable outcome', async () => {
            await service.reconcileQueuedLogs();

            expect(prisma.announcementLog.findMany).toHaveBeenCalledWith({
                where: {
                    status: 'QUEUED',
                    emailLog: {
                        is: {
                            status: { in: ACTIONABLE_EMAIL_STATUSES },
                        },
                    },
                },
                select: {
                    id: true,
                    emailLog: {
                        select: { status: true, sentAt: true, error: true },
                    },
                },
                orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
                take: 200,
            });
            expect(prisma.emailLog.findUnique).not.toHaveBeenCalled();
        });

        it.each([
            ['SENT', 'SENT'],
            ['DELIVERED', 'SENT'],
        ])('maps linked EmailLog=%s to AnnouncementLog=%s', async (emailStatus, announcementStatus) => {
            const sentAt = new Date('2026-08-08T09:00:00.000Z');
            prisma.announcementLog.findMany.mockResolvedValue([
                { id: 'ann-log-1', emailLog: { status: emailStatus, sentAt, error: null } },
            ]);

            const result = await service.reconcileQueuedLogs();

            expect(prisma.announcementLog.updateMany).toHaveBeenCalledWith({
                where: {
                    id: 'ann-log-1',
                    status: 'QUEUED',
                    emailLog: { is: { status: emailStatus } },
                },
                data: { status: announcementStatus, sentAt, error: null },
            });
            expect(result.updated).toBe(1);
        });

        it('maps linked EmailLog=BOUNCED to AnnouncementLog=BOUNCED', async () => {
            const sentAt = new Date('2026-08-08T09:00:00.000Z');
            prisma.announcementLog.findMany.mockResolvedValue([
                { id: 'ann-log-1', emailLog: { status: 'BOUNCED', sentAt, error: 'Mailbox rejected' } },
            ]);

            const result = await service.reconcileQueuedLogs();

            expect(prisma.announcementLog.updateMany).toHaveBeenCalledWith({
                where: {
                    id: 'ann-log-1',
                    status: 'QUEUED',
                    emailLog: { is: { status: 'BOUNCED' } },
                },
                data: { status: 'BOUNCED', sentAt, error: 'Mailbox rejected' },
            });
            expect(result.updated).toBe(1);
        });

        it('maps linked EmailLog=FAILED to AnnouncementLog=FAILED', async () => {
            prisma.announcementLog.findMany.mockResolvedValue([
                { id: 'ann-log-1', emailLog: { status: 'FAILED', sentAt: null, error: 'SMTP timeout' } },
            ]);

            const result = await service.reconcileQueuedLogs();

            expect(prisma.announcementLog.updateMany).toHaveBeenCalledWith({
                where: {
                    id: 'ann-log-1',
                    status: 'QUEUED',
                    emailLog: { is: { status: 'FAILED' } },
                },
                data: { status: 'FAILED', error: 'SMTP timeout' },
            });
            expect(result.updated).toBe(1);
        });

        it('uses safe fallbacks when terminal EmailLog metadata is missing', async () => {
            prisma.announcementLog.findMany.mockResolvedValue([
                { id: 'sent', emailLog: { status: 'SENT', sentAt: null, error: null } },
                { id: 'failed', emailLog: { status: 'FAILED', sentAt: null, error: null } },
            ]);

            const result = await service.reconcileQueuedLogs();

            const sentCall = prisma.announcementLog.updateMany.mock.calls[0][0];
            expect(sentCall.data).toEqual({ status: 'SENT', sentAt: expect.any(Date), error: null });
            expect(prisma.announcementLog.updateMany).toHaveBeenNthCalledWith(2, {
                where: {
                    id: 'failed',
                    status: 'QUEUED',
                    emailLog: { is: { status: 'FAILED' } },
                },
                data: { status: 'FAILED', error: 'Email delivery failed' },
            });
            expect(result.updated).toBe(2);
        });

        it('does not overcount a row already changed by an overlapping reconciliation run', async () => {
            prisma.announcementLog.findMany.mockResolvedValue([
                { id: 'ann-log-1', emailLog: { status: 'SENT', sentAt: new Date(), error: null } },
            ]);
            prisma.announcementLog.updateMany.mockResolvedValue({ count: 0 });

            await expect(service.reconcileQueuedLogs()).resolves.toEqual({ updated: 0 });
        });

        it('does not let 200 nonterminal linked rows starve a later actionable row', async () => {
            const nonterminalRows = Array.from({ length: 200 }, (_, index) => ({
                id: `nonterminal-${index}`,
                status: 'QUEUED',
                createdAt: new Date(index),
                emailLog: { status: 'QUEUED', sentAt: null, error: null },
            }));
            const actionableRow = {
                id: 'actionable-201',
                status: 'QUEUED',
                createdAt: new Date(201),
                emailLog: { status: 'SENT', sentAt: new Date('2026-08-08T09:00:00.000Z'), error: null },
            };
            const rows = [...nonterminalRows, actionableRow];

            prisma.announcementLog.findMany.mockImplementation(async (query: any) => {
                const allowedStatuses = query.where.emailLog?.is?.status?.in ?? [];
                return rows
                    .filter((row) => row.status === query.where.status)
                    .filter((row) => allowedStatuses.includes(row.emailLog.status))
                    .slice(0, query.take)
                    .map((row) => ({ id: row.id, emailLog: row.emailLog }));
            });
            prisma.announcementLog.updateMany.mockImplementation(async ({ where, data }: any) => {
                const row = rows.find((candidate) => candidate.id === where.id && candidate.status === where.status);
                if (!row) return { count: 0 };
                row.status = data.status;
                return { count: 1 };
            });

            await expect(service.reconcileQueuedLogs()).resolves.toEqual({ updated: 1 });
            expect(actionableRow.status).toBe('SENT');
        });

        it('drains a 205-row actionable backlog in deterministic 200/5/0 batches', async () => {
            const rows = Array.from({ length: 205 }, (_, index) => ({
                id: `actionable-${String(index).padStart(3, '0')}`,
                status: 'QUEUED',
                createdAt: new Date(index),
                emailLog: { status: 'DELIVERED', sentAt: new Date(), error: null },
            }));

            prisma.announcementLog.findMany.mockImplementation(async (query: any) => rows
                .filter((row) => row.status === query.where.status)
                .filter((row) => query.where.emailLog.is.status.in.includes(row.emailLog.status))
                .slice(0, query.take)
                .map((row) => ({ id: row.id, emailLog: row.emailLog })));
            prisma.announcementLog.updateMany.mockImplementation(async ({ where, data }: any) => {
                const row = rows.find((candidate) => candidate.id === where.id && candidate.status === where.status);
                if (!row) return { count: 0 };
                row.status = data.status;
                return { count: 1 };
            });

            await expect(service.reconcileQueuedLogs()).resolves.toEqual({ updated: 200 });
            await expect(service.reconcileQueuedLogs()).resolves.toEqual({ updated: 5 });
            await expect(service.reconcileQueuedLogs()).resolves.toEqual({ updated: 0 });
        });
    });

    describe('reconcileSentLogsForBounces', () => {
        it('queries only recent SENT logs whose linked EmailLog is BOUNCED', async () => {
            await service.reconcileSentLogsForBounces();

            expect(prisma.announcementLog.findMany).toHaveBeenCalledWith({
                where: {
                    status: 'SENT',
                    sentAt: { gte: expect.any(Date) },
                    emailLog: { is: { status: 'BOUNCED' } },
                },
                select: { id: true },
                orderBy: [{ sentAt: 'asc' }, { id: 'asc' }],
                take: 200,
            });
            expect(prisma.emailLog.findUnique).not.toHaveBeenCalled();
        });

        it('moves a late-bounced SENT log to BOUNCED conditionally', async () => {
            prisma.announcementLog.findMany.mockResolvedValue([{ id: 'ann-log-1' }]);

            const result = await service.reconcileSentLogsForBounces();

            expect(prisma.announcementLog.updateMany).toHaveBeenCalledWith({
                where: {
                    id: 'ann-log-1',
                    status: 'SENT',
                    emailLog: { is: { status: 'BOUNCED' } },
                },
                data: { status: 'BOUNCED' },
            });
            expect(result.updated).toBe(1);
        });

        it('does not overcount a late-bounce row already changed by another run', async () => {
            prisma.announcementLog.findMany.mockResolvedValue([{ id: 'ann-log-1' }]);
            prisma.announcementLog.updateMany.mockResolvedValue({ count: 0 });

            await expect(service.reconcileSentLogsForBounces()).resolves.toEqual({ updated: 0 });
        });

        it('does not let 200 non-bounced linked rows starve a later BOUNCED row', async () => {
            const rows = [
                ...Array.from({ length: 200 }, (_, index) => ({
                    id: `delivered-${index}`,
                    status: 'SENT',
                    sentAt: new Date(index),
                    emailLog: { status: 'DELIVERED' },
                })),
                {
                    id: 'bounced-201',
                    status: 'SENT',
                    sentAt: new Date(201),
                    emailLog: { status: 'BOUNCED' },
                },
            ];

            prisma.announcementLog.findMany.mockImplementation(async (query: any) => rows
                .filter((row) => row.status === query.where.status)
                .filter((row) => row.emailLog.status === query.where.emailLog.is.status)
                .slice(0, query.take)
                .map((row) => ({ id: row.id })));
            prisma.announcementLog.updateMany.mockImplementation(async ({ where, data }: any) => {
                const row = rows.find((candidate) => candidate.id === where.id && candidate.status === where.status);
                if (!row) return { count: 0 };
                row.status = data.status;
                return { count: 1 };
            });

            await expect(service.reconcileSentLogsForBounces()).resolves.toEqual({ updated: 1 });
            expect(rows[200].status).toBe('BOUNCED');
        });
    });

    describe('reconcile (cron entrypoint)', () => {
        it('runs both reconciliation passes', async () => {
            const queuedSpy = jest.spyOn(service, 'reconcileQueuedLogs').mockResolvedValue({ updated: 2 });
            const bounceSpy = jest.spyOn(service, 'reconcileSentLogsForBounces').mockResolvedValue({ updated: 1 });

            await service.reconcile();

            expect(queuedSpy).toHaveBeenCalledTimes(1);
            expect(bounceSpy).toHaveBeenCalledTimes(1);
        });

        it('does not throw when a reconciliation pass rejects', async () => {
            jest.spyOn(service, 'reconcileQueuedLogs').mockRejectedValue(new Error('DB down'));
            jest.spyOn(service, 'reconcileSentLogsForBounces').mockResolvedValue({ updated: 0 });

            await expect(service.reconcile()).resolves.toBeUndefined();
        });
    });
});
