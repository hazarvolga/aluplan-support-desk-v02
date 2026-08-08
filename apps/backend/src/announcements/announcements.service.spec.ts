import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

function buildPrismaMock() {
    return {
        announcement: {
            findUnique: jest.fn(),
            update: jest.fn().mockResolvedValue({}),
            create: jest.fn(),
            findMany: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        customerProfile: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
        announcementLog: {
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
    } as any;
}

function buildEmailMock() {
    return {
        // Default: a real enqueue, matching EmailService.enqueueEmail's
        // contract of resolving with the created EmailLog id. Tests that
        // exercise the "skipped" (null) or "throws" paths override this.
        enqueueEmail: jest.fn().mockResolvedValue('email-log-1'),
        cancelEmail: jest.fn().mockResolvedValue(undefined),
    };
}

function buildGatewayMock() {
    return {
        sendToUser: jest.fn(),
    } as any;
}

async function buildService(
    prismaMock: any,
    emailMock: any,
    gatewayMock: any,
): Promise<AnnouncementsService> {
    const module: TestingModule = await Test.createTestingModule({
        providers: [
            AnnouncementsService,
            { provide: PrismaService, useValue: prismaMock },
            { provide: EmailService, useValue: emailMock },
            { provide: NotificationsGateway, useValue: gatewayMock },
        ],
    }).compile();
    return module.get<AnnouncementsService>(AnnouncementsService);
}

// ---------------------------------------------------------------------------
// generateExcerpt (tested indirectly via broadcast payload)
// ---------------------------------------------------------------------------

describe('AnnouncementsService — generateExcerpt', () => {
    let prisma: any;
    let service: AnnouncementsService;

    beforeEach(async () => {
        prisma = buildPrismaMock();
        service = await buildService(prisma, buildEmailMock(), buildGatewayMock());
    });

    /**
     * Helper: run broadcast with a single customer and capture the emitted excerpt.
     */
    async function excerptFor(contentMjml: string): Promise<string> {
        const gateway = buildGatewayMock();
        const p = buildPrismaMock();
        const s = await buildService(p, buildEmailMock(), gateway);

        p.announcement.findUnique.mockResolvedValue({
            id: 'ann-1',
            title: 'T',
            subject: 'S',
            contentMjml,
            targetCriteria: { industries: ['x'] },
            type: 'BROADCAST',
            status: 'DRAFT',
            createdBy: 'u',
            sentAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        p.customerProfile.findMany.mockResolvedValue([{
            id: 'cust-1',
            userId: 'user-1',
            companyName: 'ACME',
            industry: 'x',
            contractStatus: 'ACTIVE',
            tags: [],
            user: { id: 'user-1', email: 'u@example.com' },
        }]);
        p.announcementLog.create.mockResolvedValue({ id: 'log-1', readAt: null });
        p.announcementLog.update.mockResolvedValue({});
        p.announcement.update.mockResolvedValue({});

        await s.broadcast('ann-1');
        return gateway.sendToUser.mock.calls[0][2].excerpt as string;
    }

    it('returns empty string for empty input', async () => {
        const excerpt = await excerptFor('');
        expect(excerpt).toBe('');
    });

    it('returns full plain text when content is shorter than 160 chars', async () => {
        const excerpt = await excerptFor('<p>Hello world</p>');
        expect(excerpt).toBe('Hello world');
        expect(excerpt.length).toBeLessThanOrEqual(160);
    });

    it('returns full plain text when content is exactly 160 chars after stripping', async () => {
        const text = 'a'.repeat(160);
        const excerpt = await excerptFor(`<p>${text}</p>`);
        expect(excerpt).toBe(text);
        expect(excerpt.length).toBe(160);
    });

    it('truncates to 160 chars when plain text exceeds 160 chars', async () => {
        const text = 'b'.repeat(300);
        const excerpt = await excerptFor(`<p>${text}</p>`);
        expect(excerpt.length).toBe(160);
        expect(excerpt).toBe(text.slice(0, 160));
    });

    it('strips MJML tags and collapses whitespace', async () => {
        const mjml = `<mjml><mj-body><mj-section><mj-column><mj-text>Important update for all customers.</mj-text></mj-column></mj-section></mj-body></mjml>`;
        const excerpt = await excerptFor(mjml);
        expect(excerpt).toBe('Important update for all customers.');
        expect(excerpt.length).toBeLessThanOrEqual(160);
    });

    it('handles deeply nested HTML tags', async () => {
        const html = '<div><span><b><i>Nested content here</i></b></span></div>';
        const excerpt = await excerptFor(html);
        expect(excerpt).toBe('Nested content here');
    });
});

// ---------------------------------------------------------------------------
// findAll
// ---------------------------------------------------------------------------

describe('AnnouncementsService — findAll', () => {
    let prisma: any;
    let service: AnnouncementsService;

    beforeEach(async () => {
        prisma = buildPrismaMock();
        prisma.announcement.findMany.mockResolvedValue([]);
        service = await buildService(prisma, buildEmailMock(), buildGatewayMock());
    });

    it('excludes soft-deleted announcements from admin list', async () => {
        await service.findAll();

        expect(prisma.announcement.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { deletedAt: null },
        }));
    });

    // GAP report GAP-08: `contentMjml` is a legacy name; most announcements
    // actually hold rich-text HTML. Every list item should say explicitly
    // which format it is instead of leaving callers to re-guess.
    it('annotates each announcement with its detected contentFormat', async () => {
        prisma.announcement.findMany.mockResolvedValue([
            { id: 'ann-html', contentMjml: '<p>Merhaba!</p>' },
            { id: 'ann-mjml', contentMjml: '<mjml><mj-body></mj-body></mjml>' },
        ]);

        const result = await service.findAll();

        expect(result).toEqual([
            expect.objectContaining({ id: 'ann-html', contentFormat: 'RICH_HTML' }),
            expect.objectContaining({ id: 'ann-mjml', contentFormat: 'MJML' }),
        ]);
    });
});

// ---------------------------------------------------------------------------
// findOne
// ---------------------------------------------------------------------------

describe('AnnouncementsService — findOne', () => {
    let prisma: any;
    let service: AnnouncementsService;

    beforeEach(async () => {
        prisma = buildPrismaMock();
        service = await buildService(prisma, buildEmailMock(), buildGatewayMock());
    });

    it('returns null unchanged when the announcement does not exist', async () => {
        prisma.announcement.findUnique.mockResolvedValue(null);

        await expect(service.findOne('missing')).resolves.toBeNull();
    });

    it('annotates the announcement with its detected contentFormat (GAP-08)', async () => {
        prisma.announcement.findUnique.mockResolvedValue({
            id: 'ann-1',
            contentMjml: '<mj-section><mj-text>Hi</mj-text></mj-section>',
        });

        const result = await service.findOne('ann-1');

        expect(result).toEqual(expect.objectContaining({ id: 'ann-1', contentFormat: 'MJML' }));
    });
});

// ---------------------------------------------------------------------------
// markLogRead
// ---------------------------------------------------------------------------

describe('AnnouncementsService — markLogRead', () => {
    let prisma: any;
    let service: AnnouncementsService;

    const userId = 'user-mark';
    const customerId = 'cust-mark';
    const logId = 'log-mark';
    const sentAt = new Date('2024-01-01T00:00:00.000Z');

    beforeEach(async () => {
        prisma = buildPrismaMock();
        service = await buildService(prisma, buildEmailMock(), buildGatewayMock());
    });

    it('returns the log unchanged when readAt is already set (idempotent)', async () => {
        const existingReadAt = new Date('2024-06-01T12:00:00.000Z');
        const log = { id: logId, customerId, sentAt, readAt: existingReadAt, status: 'SENT' };

        prisma.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
        prisma.announcementLog.findUnique.mockResolvedValue(log);

        const result = await service.markLogRead(logId, userId);

        expect(result.readAt).toEqual(existingReadAt);
        expect(prisma.announcementLog.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when log does not exist', async () => {
        prisma.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
        prisma.announcementLog.findUnique.mockResolvedValue(null);

        await expect(service.markLogRead('nonexistent-log', userId)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when log belongs to a different customer', async () => {
        const log = { id: logId, customerId: 'other-cust', sentAt, readAt: null, status: 'SENT' };

        prisma.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
        prisma.announcementLog.findUnique.mockResolvedValue(log);

        await expect(service.markLogRead(logId, userId)).rejects.toThrow(ForbiddenException);
        expect(prisma.announcementLog.update).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when customer profile is not found', async () => {
        prisma.customerProfile.findUnique.mockResolvedValue(null);

        await expect(service.markLogRead(logId, userId)).rejects.toThrow(ForbiddenException);
    });

    it('sets readAt to current time when log is unread', async () => {
        const log = { id: logId, customerId, sentAt, readAt: null, status: 'SENT' };

        prisma.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
        prisma.announcementLog.findUnique.mockResolvedValue(log);

        const before = Date.now();
        const updatedLog = { ...log, readAt: new Date() };
        prisma.announcementLog.update.mockResolvedValue(updatedLog);

        const result = await service.markLogRead(logId, userId);
        const after = Date.now();

        expect(prisma.announcementLog.update).toHaveBeenCalledWith({
            where: { id: logId },
            data: { readAt: expect.any(Date) },
        });
        const readAtMs = (result.readAt as Date).getTime();
        expect(readAtMs).toBeGreaterThanOrEqual(before);
        expect(readAtMs).toBeLessThanOrEqual(after);
    });
});

// ---------------------------------------------------------------------------
// getMyUnreadCount
// ---------------------------------------------------------------------------

describe('AnnouncementsService — getMyUnreadCount', () => {
    let prisma: any;
    let service: AnnouncementsService;

    const userId = 'user-unread';
    const customerId = 'cust-unread';

    beforeEach(async () => {
        prisma = buildPrismaMock();
        service = await buildService(prisma, buildEmailMock(), buildGatewayMock());
    });

    it('returns { count: 0 } when customer profile does not exist', async () => {
        prisma.customerProfile.findUnique.mockResolvedValue(null);

        const result = await service.getMyUnreadCount(userId);

        expect(result).toEqual({ count: 0 });
        expect(prisma.announcementLog.count).not.toHaveBeenCalled();
    });

    it('returns { count: 0 } when all logs are read', async () => {
        prisma.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
        prisma.announcementLog.count.mockResolvedValue(0);

        const result = await service.getMyUnreadCount(userId);

        expect(result).toEqual({ count: 0 });
    });

    it('returns { count: N } when all N logs are unread', async () => {
        const n = 7;
        prisma.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
        prisma.announcementLog.count.mockResolvedValue(n);

        const result = await service.getMyUnreadCount(userId);

        expect(result).toEqual({ count: n });
        expect(prisma.announcementLog.count).toHaveBeenCalledWith({
            where: { customerId, readAt: null },
        });
    });

    it('returns correct count for mixed read/unread logs', async () => {
        // 3 unread out of 5 total
        prisma.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
        prisma.announcementLog.count.mockResolvedValue(3);

        const result = await service.getMyUnreadCount(userId);

        expect(result).toEqual({ count: 3 });
    });
});

// ---------------------------------------------------------------------------
// getMyAnnouncements
// ---------------------------------------------------------------------------

describe('AnnouncementsService — getMyAnnouncements', () => {
    let prisma: any;
    let service: AnnouncementsService;

    const userId = 'user-my';
    const customerId = 'cust-my';

    beforeEach(async () => {
        prisma = buildPrismaMock();
        service = await buildService(prisma, buildEmailMock(), buildGatewayMock());
    });

    it('returns { data: [], total: 0 } when customer profile does not exist', async () => {
        prisma.customerProfile.findUnique.mockResolvedValue(null);

        const result = await service.getMyAnnouncements(userId);

        expect(result).toEqual({ data: [], total: 0 });
        expect(prisma.announcementLog.findMany).not.toHaveBeenCalled();
    });

    it('returns paginated logs with correct skip/take for page 1', async () => {
        const logs = [{ id: 'log-1', customerId, sentAt: new Date(), readAt: null }];
        prisma.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
        prisma.announcementLog.findMany.mockResolvedValue(logs);
        prisma.announcementLog.count.mockResolvedValue(1);

        const result = await service.getMyAnnouncements(userId, 1, 20);

        expect(result.data).toEqual(logs);
        expect(result.total).toBe(1);
        expect(prisma.announcementLog.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { customerId },
                orderBy: { sentAt: 'desc' },
                skip: 0,
                take: 20,
            }),
        );
    });

    it('applies correct skip for page 2', async () => {
        prisma.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
        prisma.announcementLog.findMany.mockResolvedValue([]);
        prisma.announcementLog.count.mockResolvedValue(25);

        await service.getMyAnnouncements(userId, 2, 20);

        expect(prisma.announcementLog.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ skip: 20, take: 20 }),
        );
    });

    it('includes announcement title and contentMjml via an explicit select', async () => {
        prisma.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
        prisma.announcementLog.findMany.mockResolvedValue([]);
        prisma.announcementLog.count.mockResolvedValue(0);

        await service.getMyAnnouncements(userId);

        expect(prisma.announcementLog.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                select: expect.objectContaining({
                    announcement: { select: { title: true, contentMjml: true } },
                }),
            }),
        );
    });

    // Codex independent review (2026-08-08): the query had no select
    // allowlist, so Prisma returned every scalar column on AnnouncementLog —
    // including emailLogId (an internal EmailLog UUID) and error (raw
    // SMTP/provider failure text) — straight to the CUSTOMER-facing
    // `GET /announcements/my` response.
    describe('customer response field allowlist (Codex finding, MEDIUM)', () => {
        it('does not request emailLogId or error from the database', async () => {
            prisma.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
            prisma.announcementLog.findMany.mockResolvedValue([]);
            prisma.announcementLog.count.mockResolvedValue(0);

            await service.getMyAnnouncements(userId);

            const call = prisma.announcementLog.findMany.mock.calls[0][0];
            expect(call.select).not.toHaveProperty('emailLogId');
            expect(call.select).not.toHaveProperty('error');
            expect(call).not.toHaveProperty('include');
        });

        it('only selects the fields a customer legitimately needs to see', async () => {
            prisma.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
            prisma.announcementLog.findMany.mockResolvedValue([]);
            prisma.announcementLog.count.mockResolvedValue(0);

            await service.getMyAnnouncements(userId);

            const call = prisma.announcementLog.findMany.mock.calls[0][0];
            expect(call.select).toEqual({
                id: true,
                status: true,
                sentAt: true,
                readAt: true,
                createdAt: true,
                announcement: { select: { title: true, contentMjml: true } },
            });
        });
    });
});

// ---------------------------------------------------------------------------
// broadcast — customer email context parity (GAP report BUG-02)
// ---------------------------------------------------------------------------

describe('AnnouncementsService — broadcast customer context', () => {
    let prisma: any;
    let email: any;
    let service: AnnouncementsService;

    beforeEach(async () => {
        prisma = buildPrismaMock();
        email = buildEmailMock();
        service = await buildService(prisma, email, buildGatewayMock());

        prisma.announcement.findUnique.mockResolvedValue({
            id: 'ann-1',
            title: 'T',
            subject: 'S',
            contentMjml: '<mj-text>Hello</mj-text>',
            targetCriteria: { industries: ['x'] },
            type: 'BROADCAST',
            status: 'DRAFT',
            createdBy: 'u',
            sentAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        prisma.customerProfile.findMany.mockResolvedValue([{
            id: 'cust-1',
            userId: 'user-1',
            firstName: 'Ada',
            lastName: 'Lovelace',
            companyName: 'Analytical Engines Ltd',
            customerNo: 'CUST-001',
            industry: 'x',
            contractStatus: 'ACTIVE',
            tags: [],
            user: { id: 'user-1', email: 'ada@example.com' },
        }]);
        prisma.announcementLog.create.mockResolvedValue({ id: 'log-1', readAt: null });
        prisma.announcementLog.update.mockResolvedValue({});
        prisma.announcement.update.mockResolvedValue({});
    });

    it('sends the canonical announcement customer context, not the raw CustomerProfile row', async () => {
        await service.broadcast('ann-1');

        expect(email.enqueueEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    customer: {
                        firstName: 'Ada',
                        lastName: 'Lovelace',
                        fullName: 'Ada Lovelace',
                        companyName: 'Analytical Engines Ltd',
                        customerNo: 'CUST-001',
                        email: 'ada@example.com',
                        userEmail: 'ada@example.com',
                    },
                }),
            }),
        );
    });

    it('never leaks internal CustomerProfile fields (industry, contractStatus, tags, id) into the email context', async () => {
        await service.broadcast('ann-1');

        const call = email.enqueueEmail.mock.calls[0][0];
        expect(call.data.customer).not.toHaveProperty('industry');
        expect(call.data.customer).not.toHaveProperty('contractStatus');
        expect(call.data.customer).not.toHaveProperty('tags');
        expect(call.data.customer).not.toHaveProperty('id');
        expect(call.data.customer).not.toHaveProperty('userId');
    });
});

// ---------------------------------------------------------------------------
// broadcast — subject rendering and fail-closed content safety
// (GAP report BUG-01 / GAP-06 / GAP-03 unknown-variable check)
// ---------------------------------------------------------------------------

describe('AnnouncementsService — broadcast subject rendering and content safety', () => {
    let prisma: any;
    let email: any;
    let service: AnnouncementsService;

    function mockAnnouncement(overrides: Partial<{ subject: string; contentMjml: string }>) {
        prisma.announcement.findUnique.mockResolvedValue({
            id: 'ann-1',
            title: 'T',
            subject: overrides.subject ?? 'Static subject',
            contentMjml: overrides.contentMjml ?? '<mj-text>Static content</mj-text>',
            targetCriteria: { industries: ['x'] },
            type: 'BROADCAST',
            status: 'DRAFT',
            createdBy: 'u',
            sentAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    beforeEach(async () => {
        prisma = buildPrismaMock();
        email = buildEmailMock();
        service = await buildService(prisma, email, buildGatewayMock());

        prisma.customerProfile.findMany.mockResolvedValue([{
            id: 'cust-1',
            userId: 'user-1',
            firstName: 'Ada',
            lastName: 'Lovelace',
            companyName: 'Analytical Engines Ltd',
            customerNo: 'CUST-001',
            industry: 'x',
            contractStatus: 'ACTIVE',
            tags: [],
            user: { id: 'user-1', email: 'ada@example.com' },
        }]);
        prisma.announcementLog.create.mockResolvedValue({ id: 'log-1', readAt: null });
        prisma.announcementLog.update.mockResolvedValue({});
        prisma.announcement.update.mockResolvedValue({});
    });

    it('renders {{customer.*}} variables in the subject per recipient (BUG-01)', async () => {
        mockAnnouncement({ subject: 'Merhaba {{customer.firstName}}, ürün güncellemesi' });

        await service.broadcast('ann-1');

        expect(email.enqueueEmail).toHaveBeenCalledWith(
            expect.objectContaining({ subject: 'Merhaba Ada, ürün güncellemesi' }),
        );
    });

    it('rejects broadcast when the content has a leftover [placeholder] and never enqueues or changes status (GAP-06)', async () => {
        mockAnnouncement({ contentMjml: '<mj-text>Tahmini Yayın: [Tarih]</mj-text>' });

        await expect(service.broadcast('ann-1')).rejects.toThrow();

        expect(email.enqueueEmail).not.toHaveBeenCalled();
        expect(prisma.announcement.update).not.toHaveBeenCalled();
        expect(prisma.customerProfile.findMany).not.toHaveBeenCalled();
    });

    it('rejects broadcast when the subject has a leftover [placeholder] (GAP-06)', async () => {
        mockAnnouncement({ subject: 'Yakında: [Özellik Adı]' });

        await expect(service.broadcast('ann-1')).rejects.toThrow();
        expect(email.enqueueEmail).not.toHaveBeenCalled();
    });

    it('rejects broadcast when the content references an unknown customer variable (GAP-03)', async () => {
        mockAnnouncement({ contentMjml: '<mj-text>Merhaba {{customer.fullname}}</mj-text>' });

        await expect(service.broadcast('ann-1')).rejects.toThrow();
        expect(email.enqueueEmail).not.toHaveBeenCalled();
    });

    it('allows a known customer variable and a static subject through unchanged', async () => {
        mockAnnouncement({
            subject: 'Sistem Bakım Duyurusu',
            contentMjml: '<mj-text>Sayın {{customer.companyName}}</mj-text>',
        });

        await service.broadcast('ann-1');

        expect(email.enqueueEmail).toHaveBeenCalledWith(
            expect.objectContaining({ subject: 'Sistem Bakım Duyurusu' }),
        );
    });
});

// ---------------------------------------------------------------------------
// broadcast — AnnouncementLog reflects real enqueue outcome (GAP report BUG-04)
// ---------------------------------------------------------------------------

describe('AnnouncementsService — broadcast AnnouncementLog status accuracy', () => {
    let prisma: any;
    let email: any;
    let service: AnnouncementsService;

    beforeEach(async () => {
        prisma = buildPrismaMock();
        email = buildEmailMock();
        service = await buildService(prisma, email, buildGatewayMock());

        prisma.announcement.findUnique.mockResolvedValue({
            id: 'ann-1',
            title: 'T',
            subject: 'Static subject',
            contentMjml: '<mj-text>Static content</mj-text>',
            targetCriteria: { industries: ['x'] },
            type: 'BROADCAST',
            status: 'DRAFT',
            createdBy: 'u',
            sentAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        prisma.customerProfile.findMany.mockResolvedValue([{
            id: 'cust-1',
            userId: 'user-1',
            firstName: 'Ada',
            lastName: 'Lovelace',
            companyName: 'Analytical Engines Ltd',
            customerNo: 'CUST-001',
            user: { id: 'user-1', email: 'ada@example.com' },
        }]);
        prisma.announcementLog.create.mockResolvedValue({ id: 'log-1', readAt: null });
        prisma.announcementLog.update.mockResolvedValue({});
        prisma.announcement.update.mockResolvedValue({});
    });

    it('marks the log QUEUED (not SENT) and links emailLogId when enqueueEmail resolves with an id', async () => {
        email.enqueueEmail.mockResolvedValue('real-email-log-id');

        await service.broadcast('ann-1');

        expect(prisma.announcementLog.update).toHaveBeenCalledWith({
            where: { id: 'log-1' },
            data: { status: 'QUEUED', emailLogId: 'real-email-log-id' },
        });
        // The old behavior (marking SENT the instant enqueue resolved,
        // before any real delivery happened) must not reappear.
        expect(prisma.announcementLog.update).not.toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ status: 'SENT' }) }),
        );
    });

    it('marks the log SKIPPED (not SENT) when enqueueEmail resolves with null (opted out / blocked)', async () => {
        email.enqueueEmail.mockResolvedValue(null);

        await service.broadcast('ann-1');

        expect(prisma.announcementLog.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 'log-1' },
                data: expect.objectContaining({ status: 'SKIPPED' }),
            }),
        );
        expect(prisma.announcementLog.update).not.toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ status: 'SENT' }) }),
        );
    });

    it('still marks the log FAILED when enqueueEmail throws', async () => {
        email.enqueueEmail.mockRejectedValue(new Error('Queue unavailable'));

        await service.broadcast('ann-1');

        expect(prisma.announcementLog.update).toHaveBeenCalledWith({
            where: { id: 'log-1' },
            data: { status: 'FAILED', error: 'Queue unavailable' },
        });
    });
});
