import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementLogReconciliationService } from './announcement-log-reconciliation.service';
import { PrismaService } from '../prisma/prisma.service';

function buildPrismaMock() {
    return {
        announcementLog: {
            findMany: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockResolvedValue({}),
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

    it('only queries logs that are QUEUED with a linked emailLogId', async () => {
        await service.reconcileQueuedLogs();

        expect(prisma.announcementLog.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { status: 'QUEUED', emailLogId: { not: null } },
            }),
        );
    });

    it('promotes to SENT and copies sentAt when the linked EmailLog succeeded', async () => {
        const sentAt = new Date('2026-08-08T09:00:00.000Z');
        prisma.announcementLog.findMany.mockResolvedValue([
            { id: 'ann-log-1', emailLogId: 'email-log-1' },
        ]);
        prisma.emailLog.findUnique.mockResolvedValue({ status: 'SENT', sentAt, error: null });

        const result = await service.reconcileQueuedLogs();

        expect(prisma.announcementLog.update).toHaveBeenCalledWith({
            where: { id: 'ann-log-1' },
            data: { status: 'SENT', sentAt },
        });
        expect(result.updated).toBe(1);
    });

    it('falls back to now() for sentAt when the EmailLog has none', async () => {
        prisma.announcementLog.findMany.mockResolvedValue([
            { id: 'ann-log-1', emailLogId: 'email-log-1' },
        ]);
        prisma.emailLog.findUnique.mockResolvedValue({ status: 'SENT', sentAt: null, error: null });

        await service.reconcileQueuedLogs();

        const call = prisma.announcementLog.update.mock.calls[0][0];
        expect(call.data.status).toBe('SENT');
        expect(call.data.sentAt).toBeInstanceOf(Date);
    });

    it('demotes to FAILED and copies the error when the linked EmailLog failed', async () => {
        prisma.announcementLog.findMany.mockResolvedValue([
            { id: 'ann-log-1', emailLogId: 'email-log-1' },
        ]);
        prisma.emailLog.findUnique.mockResolvedValue({
            status: 'FAILED',
            sentAt: null,
            error: 'SMTP timeout',
        });

        const result = await service.reconcileQueuedLogs();

        expect(prisma.announcementLog.update).toHaveBeenCalledWith({
            where: { id: 'ann-log-1' },
            data: { status: 'FAILED', error: 'SMTP timeout' },
        });
        expect(result.updated).toBe(1);
    });

    it('leaves the log untouched while the linked EmailLog is still QUEUED', async () => {
        prisma.announcementLog.findMany.mockResolvedValue([
            { id: 'ann-log-1', emailLogId: 'email-log-1' },
        ]);
        prisma.emailLog.findUnique.mockResolvedValue({ status: 'QUEUED', sentAt: null, error: null });

        const result = await service.reconcileQueuedLogs();

        expect(prisma.announcementLog.update).not.toHaveBeenCalled();
        expect(result.updated).toBe(0);
    });

    it('does not crash when the linked EmailLog is missing (deleted / bad reference)', async () => {
        prisma.announcementLog.findMany.mockResolvedValue([
            { id: 'ann-log-1', emailLogId: 'ghost-email-log' },
        ]);
        prisma.emailLog.findUnique.mockResolvedValue(null);

        await expect(service.reconcileQueuedLogs()).resolves.toEqual({ updated: 0 });
        expect(prisma.announcementLog.update).not.toHaveBeenCalled();
    });

    it('processes multiple queued logs independently in one pass', async () => {
        prisma.announcementLog.findMany.mockResolvedValue([
            { id: 'ann-log-1', emailLogId: 'email-log-1' },
            { id: 'ann-log-2', emailLogId: 'email-log-2' },
        ]);
        prisma.emailLog.findUnique
            .mockResolvedValueOnce({ status: 'SENT', sentAt: new Date(), error: null })
            .mockResolvedValueOnce({ status: 'FAILED', sentAt: null, error: 'Bounced' });

        const result = await service.reconcileQueuedLogs();

        expect(result.updated).toBe(2);
        expect(prisma.announcementLog.update).toHaveBeenCalledTimes(2);
    });
});
