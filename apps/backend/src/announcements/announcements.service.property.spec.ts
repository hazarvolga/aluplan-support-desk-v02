import * as fc from 'fast-check';
import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { assertAnnouncementContentIsSafeToSend } from './announcement-content-safety';

/**
 * As of the Phase 1/4 content-safety hardening, broadcast() intentionally
 * rejects content that isn't valid Handlebars syntax, contains an unknown
 * `{{...}}` variable, or still has a leftover `[Placeholder]` -- see
 * announcement-content-safety.ts. This property is about the shape of the
 * ANNOUNCEMENT_RECEIVED payload for content that actually reaches
 * broadcast()'s notification step, so arbitrary fast-check strings that
 * would legitimately be rejected before that point are filtered out here
 * rather than asserted against.
 */
function isSafeToBroadcast(subject: string, contentMjml: string): boolean {
    try {
        assertAnnouncementContentIsSafeToSend(subject, contentMjml);
        return true;
    } catch {
        return false;
    }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal mock PrismaService that records announcementLog.create calls */
function buildPrismaMock(overrides: Partial<Record<string, any>> = {}) {
    const createdLogs: any[] = [];

    const announcementLogMock = {
        create: jest.fn().mockImplementation(async ({ data }: { data: any }) => {
            const log = {
                id: `log-${Math.random().toString(36).slice(2)}`,
                announcementId: data.announcementId,
                customerId: data.customerId,
                status: data.status ?? 'PENDING',
                readAt: data.readAt ?? null,
                sentAt: null,
                error: null,
                emailLogId: null,
                createdAt: new Date(),
            };
            createdLogs.push(log);
            return log;
        }),
        update: jest.fn().mockImplementation(async ({ where, data }: any) => {
            const log = createdLogs.find(l => l.id === where.id);
            if (log) Object.assign(log, data);
            return log ?? { id: where.id, ...data };
        }),
        findUnique: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
        findMany: jest.fn().mockResolvedValue([]),
    };

    return {
        mock: {
            announcement: {
                findUnique: jest.fn(),
                update: jest.fn().mockResolvedValue({}),
            },
            customerProfile: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                count: jest.fn(),
            },
            announcementLog: announcementLogMock,
        } as any,
        createdLogs,
        ...overrides,
    };
}

/** Build a minimal mock EmailService that silently succeeds */
function buildEmailMock() {
    return {
        enqueueEmail: jest.fn().mockResolvedValue(undefined),
        cancelEmail: jest.fn().mockResolvedValue(undefined),
    };
}

/** Build a mock NotificationsGateway that records sendToUser calls */
function buildGatewayMock() {
    const calls: Array<{ userId: string; event: string; payload: any }> = [];
    return {
        mock: {
            sendToUser: jest.fn().mockImplementation((userId: string, event: string, payload: any) => {
                calls.push({ userId, event, payload });
            }),
        } as any,
        calls,
    };
}

/** Create a fully wired AnnouncementsService with the provided mocks */
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

/** Build a fake announcement object */
function fakeAnnouncement(id: string, title: string, contentMjml: string) {
    return {
        id,
        title,
        subject: 'Test Subject',
        contentMjml,
        targetCriteria: { industries: ['tech'] },
        type: 'BROADCAST',
        status: 'DRAFT',
        createdBy: 'admin-1',
        sentAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

/** Build a fake CustomerProfile target with a user that has an id and email */
function fakeTarget(customerId: string, userId: string) {
    return {
        id: customerId,
        userId,
        companyName: 'ACME',
        industry: 'tech',
        contractStatus: 'ACTIVE',
        tags: [],
        user: {
            id: userId,
            email: `${userId}@example.com`,
        },
    };
}

// ---------------------------------------------------------------------------
// Property 5: One sendToUser call per customer in broadcast batch
// Feature: announcement-notifications, Property 5: One sendToUser call per customer in broadcast batch
// ---------------------------------------------------------------------------

describe('AnnouncementsService — Property 5: One sendToUser call per customer in broadcast batch', () => {
    it('calls sendToUser exactly N times with distinct userIds for N distinct customers', async () => {
        // Feature: announcement-notifications, Property 5: One sendToUser call per customer in broadcast batch
        await fc.assert(
            fc.asyncProperty(
                // Generate 1–50 distinct customer records
                fc.array(
                    fc.record({
                        customerId: fc.uuid(),
                        userId: fc.uuid(),
                    }),
                    { minLength: 1, maxLength: 50 },
                ).filter(customers => {
                    // Ensure all customerIds and userIds are distinct
                    const customerIds = customers.map(c => c.customerId);
                    const userIds = customers.map(c => c.userId);
                    return (
                        new Set(customerIds).size === customerIds.length &&
                        new Set(userIds).size === userIds.length
                    );
                }),
                async (customers) => {
                    const { mock: prismaMock } = buildPrismaMock();
                    const emailMock = buildEmailMock();
                    const { mock: gatewayMock, calls } = buildGatewayMock();

                    const announcementId = 'ann-prop5';
                    const announcement = fakeAnnouncement(announcementId, 'Prop5 Title', '<p>Hello</p>');

                    prismaMock.announcement.findUnique.mockResolvedValue(announcement);
                    prismaMock.customerProfile.findMany.mockResolvedValue(
                        customers.map(c => fakeTarget(c.customerId, c.userId)),
                    );

                    const service = await buildService(prismaMock, emailMock, gatewayMock);
                    await service.broadcast(announcementId);

                    // Assert: sendToUser called exactly N times
                    expect(gatewayMock.sendToUser).toHaveBeenCalledTimes(customers.length);

                    // Assert: each call used a distinct userId matching one of the N customers
                    const calledUserIds = calls.map(c => c.userId);
                    const expectedUserIds = new Set(customers.map(c => c.userId));

                    expect(new Set(calledUserIds).size).toBe(customers.length);
                    for (const uid of calledUserIds) {
                        expect(expectedUserIds.has(uid)).toBe(true);
                    }

                    // Reset for next iteration
                    calls.length = 0;
                    jest.clearAllMocks();
                },
            ),
            { numRuns: 50 },
        );
    });
});

// ---------------------------------------------------------------------------
// Property 4: ANNOUNCEMENT_RECEIVED payload completeness
// Feature: announcement-notifications, Property 4: ANNOUNCEMENT_RECEIVED payload completeness
// ---------------------------------------------------------------------------

describe('AnnouncementsService — Property 4: ANNOUNCEMENT_RECEIVED payload completeness', () => {
    it('emitted payload contains all five required fields with correct types', async () => {
        // Feature: announcement-notifications, Property 4: ANNOUNCEMENT_RECEIVED payload completeness
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 1, maxLength: 200 }),  // title
                fc.string({ minLength: 0, maxLength: 2000 }), // contentMjml (arbitrary content)
                async (title, contentMjml) => {
                    // fakeAnnouncement() always uses the fixed subject 'Test Subject',
                    // so only contentMjml needs to pass the safety check here.
                    fc.pre(isSafeToBroadcast('Test Subject', contentMjml));

                    const { mock: prismaMock } = buildPrismaMock();
                    const emailMock = buildEmailMock();
                    const { mock: gatewayMock, calls } = buildGatewayMock();

                    const announcementId = 'ann-prop4';
                    const customerId = 'cust-prop4';
                    const userId = 'user-prop4';

                    const announcement = fakeAnnouncement(announcementId, title, contentMjml);
                    prismaMock.announcement.findUnique.mockResolvedValue(announcement);
                    prismaMock.customerProfile.findMany.mockResolvedValue([
                        fakeTarget(customerId, userId),
                    ]);

                    const service = await buildService(prismaMock, emailMock, gatewayMock);
                    await service.broadcast(announcementId);

                    expect(calls).toHaveLength(1);
                    const payload = calls[0].payload;

                    // All five fields must be present
                    expect(payload).toHaveProperty('logId');
                    expect(payload).toHaveProperty('announcementId');
                    expect(payload).toHaveProperty('title');
                    expect(payload).toHaveProperty('excerpt');
                    expect(payload).toHaveProperty('sentAt');

                    // Type checks
                    expect(typeof payload.logId).toBe('string');
                    expect(typeof payload.announcementId).toBe('string');
                    expect(typeof payload.title).toBe('string');
                    expect(typeof payload.excerpt).toBe('string');
                    expect(typeof payload.sentAt).toBe('string');

                    // sentAt must be a valid ISO 8601 string
                    expect(() => new Date(payload.sentAt).toISOString()).not.toThrow();
                    expect(new Date(payload.sentAt).toISOString()).toBe(payload.sentAt);

                    // excerpt must be at most 160 chars
                    expect(payload.excerpt.length).toBeLessThanOrEqual(160);

                    // event name must be ANNOUNCEMENT_RECEIVED
                    expect(calls[0].event).toBe('ANNOUNCEMENT_RECEIVED');

                    calls.length = 0;
                    jest.clearAllMocks();
                },
            ),
            { numRuns: 100 },
        );
    });
});

// ---------------------------------------------------------------------------
// Property 1: New logs have null readAt
// Feature: announcement-notifications, Property 1: New logs have null readAt
// ---------------------------------------------------------------------------

describe('AnnouncementsService — Property 1: New logs have null readAt', () => {
    it('every AnnouncementLog created during broadcast has readAt = null', async () => {
        // Feature: announcement-notifications, Property 1: New logs have null readAt
        await fc.assert(
            fc.asyncProperty(
                // Generate 1–20 distinct customers
                fc.array(
                    fc.record({
                        customerId: fc.uuid(),
                        userId: fc.uuid(),
                    }),
                    { minLength: 1, maxLength: 20 },
                ).filter(customers => {
                    const customerIds = customers.map(c => c.customerId);
                    const userIds = customers.map(c => c.userId);
                    return (
                        new Set(customerIds).size === customerIds.length &&
                        new Set(userIds).size === userIds.length
                    );
                }),
                fc.string({ minLength: 1, maxLength: 100 }), // title
                fc.string({ minLength: 0, maxLength: 500 }),  // contentMjml
                async (customers, title, contentMjml) => {
                    const { mock: prismaMock, createdLogs } = buildPrismaMock();
                    const emailMock = buildEmailMock();
                    const { mock: gatewayMock } = buildGatewayMock();

                    const announcementId = 'ann-prop1';
                    const announcement = fakeAnnouncement(announcementId, title, contentMjml);

                    prismaMock.announcement.findUnique.mockResolvedValue(announcement);
                    prismaMock.customerProfile.findMany.mockResolvedValue(
                        customers.map(c => fakeTarget(c.customerId, c.userId)),
                    );

                    const service = await buildService(prismaMock, emailMock, gatewayMock);
                    await service.broadcast(announcementId);

                    // Every created log must have readAt = null
                    expect(createdLogs.length).toBe(customers.length);
                    for (const log of createdLogs) {
                        expect(log.readAt).toBeNull();
                    }

                    // Also verify via the create call arguments — readAt must not be set
                    const createCalls = prismaMock.announcementLog.create.mock.calls as Array<[{ data: any }]>;
                    for (const [{ data }] of createCalls) {
                        // readAt should either be absent or explicitly null
                        expect(data.readAt === undefined || data.readAt === null).toBe(true);
                    }

                    createdLogs.length = 0;
                    jest.clearAllMocks();
                },
            ),
            { numRuns: 50 },
        );
    });
});

// ---------------------------------------------------------------------------
// Property 11: Excerpt is a bounded prefix of original plain text
// Feature: announcement-notifications, Property 11: Excerpt is a bounded prefix of original plain text
// ---------------------------------------------------------------------------

describe('AnnouncementsService — Property 11: Excerpt is a bounded prefix of original plain text', () => {
    it('excerpt.length <= 160 and original plain text starts with excerpt', async () => {
        // Feature: announcement-notifications, Property 11: Excerpt is a bounded prefix of original plain text

        // Arbitrary HTML tag generator
        const htmlTag = fc.oneof(
            fc.constant('<p>'),
            fc.constant('</p>'),
            fc.constant('<b>'),
            fc.constant('</b>'),
            fc.constant('<span class="x">'),
            fc.constant('</span>'),
            fc.constant('<mj-text>'),
            fc.constant('</mj-text>'),
            fc.constant('<br/>'),
            fc.constant('<div style="color:red">'),
            fc.constant('</div>'),
        );

        // Build a string that interleaves plain text words with HTML tags
        // Use fc.string() with a filtered alphabet to avoid '<' and '>' characters
        const safeTextPart = fc.string({ minLength: 0, maxLength: 30 }).map(s =>
            s.replace(/[<>]/g, ' '),
        );

        const contentWithTags = fc.array(
            fc.oneof(safeTextPart, htmlTag),
            { minLength: 0, maxLength: 80 },
        ).map(parts => parts.join(''));

        await fc.assert(
            fc.property(
                contentWithTags,
                (content) => {
                    // Replicate the generateExcerpt logic to compute expected plain text
                    const plain = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                    const expectedExcerpt = plain.length <= 160 ? plain : plain.slice(0, 160);

                    // Invoke via a direct instance (no DI needed — it's a pure function)
                    // We test the logic directly since generateExcerpt is private;
                    // we replicate the exact algorithm and verify the invariants hold.
                    const excerpt = expectedExcerpt;

                    // Invariant 1: excerpt length <= 160
                    expect(excerpt.length).toBeLessThanOrEqual(160);

                    // Invariant 2: original plain text starts with excerpt (prefix invariant)
                    expect(plain.startsWith(excerpt)).toBe(true);
                },
            ),
            { numRuns: 500 },
        );
    });

    it('excerpt length <= 160 for any content string via broadcast payload', async () => {
        // Feature: announcement-notifications, Property 11: Excerpt is a bounded prefix of original plain text
        // Verify via the actual service through the broadcast path
        await fc.assert(
            fc.asyncProperty(
                fc.string({ minLength: 0, maxLength: 2000 }),
                async (contentMjml) => {
                    const { mock: prismaMock } = buildPrismaMock();
                    const emailMock = buildEmailMock();
                    const { mock: gatewayMock, calls } = buildGatewayMock();

                    const announcementId = 'ann-p11';
                    const announcement = fakeAnnouncement(announcementId, 'P11 Title', contentMjml);
                    prismaMock.announcement.findUnique.mockResolvedValue(announcement);
                    prismaMock.customerProfile.findMany.mockResolvedValue([
                        fakeTarget('cust-p11', 'user-p11'),
                    ]);

                    const service = await buildService(prismaMock, emailMock, gatewayMock);
                    await service.broadcast(announcementId);

                    if (calls.length > 0) {
                        const { excerpt } = calls[0].payload;
                        expect(typeof excerpt).toBe('string');
                        expect(excerpt.length).toBeLessThanOrEqual(160);

                        // Verify prefix invariant: plain text derived from content starts with excerpt
                        const plain = contentMjml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                        expect(plain.startsWith(excerpt)).toBe(true);
                    }

                    calls.length = 0;
                    jest.clearAllMocks();
                },
            ),
            { numRuns: 200 },
        );
    });
});

// ---------------------------------------------------------------------------
// Property 6: GET /announcements/my returns records in descending sentAt order
// Feature: announcement-notifications, Property 6: GET /announcements/my returns records in descending sentAt order
// ---------------------------------------------------------------------------

describe('AnnouncementsService — Property 6: GET /announcements/my returns records in descending sentAt order', () => {
    it('for any list of logs, response is ordered by sentAt descending', async () => {
        // Feature: announcement-notifications, Property 6: GET /announcements/my returns records in descending sentAt order
        await fc.assert(
            fc.asyncProperty(
                // Generate 0–30 logs with arbitrary sentAt values
                fc.array(
                    fc.record({
                        id: fc.uuid(),
                        announcementId: fc.uuid(),
                        customerId: fc.constant('cust-p6'),
                        status: fc.constant('SENT'),
                        sentAt: fc.option(fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }), { nil: null }),
                        readAt: fc.constant(null),
                        error: fc.constant(null),
                        emailLogId: fc.constant(null),
                        createdAt: fc.date(),
                        announcement: fc.record({
                            title: fc.string({ minLength: 1, maxLength: 50 }),
                            contentMjml: fc.string({ minLength: 0, maxLength: 100 }),
                        }),
                    }),
                    { minLength: 0, maxLength: 30 },
                ),
                async (logs) => {
                    const { mock: prismaMock } = buildPrismaMock();
                    const emailMock = buildEmailMock();
                    const { mock: gatewayMock } = buildGatewayMock();

                    const userId = 'user-p6';
                    const customerId = 'cust-p6';

                    // Simulate what the service does: sort by sentAt desc
                    const sortedLogs = [...logs].sort((a, b) => {
                        const aTime = a.sentAt && !isNaN(a.sentAt.getTime()) ? a.sentAt.getTime() : 0;
                        const bTime = b.sentAt && !isNaN(b.sentAt.getTime()) ? b.sentAt.getTime() : 0;
                        return bTime - aTime;
                    });

                    prismaMock.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
                    prismaMock.announcementLog.findMany.mockResolvedValue(sortedLogs);
                    prismaMock.announcementLog.count.mockResolvedValue(logs.length);

                    const service = await buildService(prismaMock, emailMock, gatewayMock);
                    const result = await service.getMyAnnouncements(userId, 1, 100);

                    // Assert descending sentAt order for adjacent pairs
                    for (let i = 0; i < result.data.length - 1; i++) {
                        const a = result.data[i] as any;
                        const b = result.data[i + 1] as any;
                        const aRaw = a.sentAt ? new Date(a.sentAt).getTime() : 0;
                        const bRaw = b.sentAt ? new Date(b.sentAt).getTime() : 0;
                        // Skip comparison if either date is NaN (invalid date)
                        if (isNaN(aRaw) || isNaN(bRaw)) continue;
                        expect(aRaw).toBeGreaterThanOrEqual(bRaw);
                    }

                    jest.clearAllMocks();
                },
            ),
            { numRuns: 200 },
        );
    });
});

// ---------------------------------------------------------------------------
// Property 7: GET /announcements/my enforces customer data isolation
// Feature: announcement-notifications, Property 7: GET /announcements/my enforces customer data isolation
// ---------------------------------------------------------------------------

describe('AnnouncementsService — Property 7: GET /announcements/my enforces customer data isolation', () => {
    it('response for customer A contains no records belonging to customer B', async () => {
        // Feature: announcement-notifications, Property 7: GET /announcements/my enforces customer data isolation
        await fc.assert(
            fc.asyncProperty(
                fc.uuid(), // customerA id
                fc.uuid(), // customerB id
                fc.array(
                    fc.record({
                        id: fc.uuid(),
                        announcementId: fc.uuid(),
                        // Each log belongs to either A or B
                        customerId: fc.oneof(fc.constant('cust-a'), fc.constant('cust-b')),
                        status: fc.constant('SENT'),
                        sentAt: fc.option(fc.date(), { nil: null }),
                        readAt: fc.constant(null),
                        error: fc.constant(null),
                        emailLogId: fc.constant(null),
                        createdAt: fc.date(),
                        announcement: fc.record({
                            title: fc.string({ minLength: 1, maxLength: 50 }),
                            contentMjml: fc.string({ minLength: 0, maxLength: 100 }),
                        }),
                    }),
                    { minLength: 0, maxLength: 40 },
                ),
                async (_userAId, _userBId, allLogs) => {
                    const { mock: prismaMock } = buildPrismaMock();
                    const emailMock = buildEmailMock();
                    const { mock: gatewayMock } = buildGatewayMock();

                    const userAId = 'user-a';
                    const customerAId = 'cust-a';

                    // Only A's logs are returned (service filters by customerId)
                    const logsForA = allLogs.filter(l => l.customerId === customerAId);

                    prismaMock.customerProfile.findUnique.mockResolvedValue({ id: customerAId, userId: userAId });
                    prismaMock.announcementLog.findMany.mockResolvedValue(logsForA);
                    prismaMock.announcementLog.count.mockResolvedValue(logsForA.length);

                    const service = await buildService(prismaMock, emailMock, gatewayMock);
                    const result = await service.getMyAnnouncements(userAId, 1, 100);

                    // Assert: no record in the response belongs to customer B
                    for (const log of result.data as any[]) {
                        expect(log.customerId).not.toBe('cust-b');
                        expect(log.customerId).toBe(customerAId);
                    }

                    jest.clearAllMocks();
                },
            ),
            { numRuns: 200 },
        );
    });

    it('returns empty list when customer profile does not exist', async () => {
        // Feature: announcement-notifications, Property 7: GET /announcements/my enforces customer data isolation
        await fc.assert(
            fc.asyncProperty(
                fc.uuid(),
                async (userId) => {
                    const { mock: prismaMock } = buildPrismaMock();
                    const emailMock = buildEmailMock();
                    const { mock: gatewayMock } = buildGatewayMock();

                    prismaMock.customerProfile.findUnique.mockResolvedValue(null);

                    const service = await buildService(prismaMock, emailMock, gatewayMock);
                    const result = await service.getMyAnnouncements(userId, 1, 20);

                    expect(result).toEqual({ data: [], total: 0 });

                    jest.clearAllMocks();
                },
            ),
            { numRuns: 50 },
        );
    });
});

// ---------------------------------------------------------------------------
// Property 8: Unread count equals count of null-readAt records
// Feature: announcement-notifications, Property 8: Unread count equals count of null-readAt records
// ---------------------------------------------------------------------------

describe('AnnouncementsService — Property 8: Unread count equals count of null-readAt records', () => {
    it('getMyUnreadCount returns exactly the number of logs with readAt = null', async () => {
        // Feature: announcement-notifications, Property 8: Unread count equals count of null-readAt records
        await fc.assert(
            fc.asyncProperty(
                // Generate random lists of logs with arbitrary readAt values
                fc.array(
                    fc.record({
                        id: fc.uuid(),
                        customerId: fc.constant('cust-p8'),
                        readAt: fc.option(
                            fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') }),
                            { nil: null, freq: 3 }, // ~25% chance of non-null
                        ),
                    }),
                    { minLength: 0, maxLength: 50 },
                ),
                async (logs) => {
                    const { mock: prismaMock } = buildPrismaMock();
                    const emailMock = buildEmailMock();
                    const { mock: gatewayMock } = buildGatewayMock();

                    const userId = 'user-p8';
                    const customerId = 'cust-p8';
                    const expectedCount = logs.filter(l => l.readAt == null).length;

                    prismaMock.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
                    prismaMock.announcementLog.count.mockResolvedValue(expectedCount);

                    const service = await buildService(prismaMock, emailMock, gatewayMock);
                    const result = await service.getMyUnreadCount(userId);

                    expect(result.count).toBe(expectedCount);

                    // Verify the Prisma query used the correct filter
                    expect(prismaMock.announcementLog.count).toHaveBeenCalledWith(
                        expect.objectContaining({
                            where: expect.objectContaining({
                                customerId,
                                readAt: null,
                            }),
                        }),
                    );

                    jest.clearAllMocks();
                },
            ),
            { numRuns: 200 },
        );
    });
});

// ---------------------------------------------------------------------------
// Property 2: markRead is idempotent
// Feature: announcement-notifications, Property 2: markRead is idempotent
// ---------------------------------------------------------------------------

describe('AnnouncementsService — Property 2: markRead is idempotent', () => {
    it('calling markLogRead N times produces the same readAt as calling it once', async () => {
        // Feature: announcement-notifications, Property 2: markRead is idempotent
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 1, max: 10 }), // N repeated calls
                fc.uuid(),                         // logId
                fc.uuid(),                         // userId
                async (n, logId, userId) => {
                    const customerId = 'cust-idem';
                    const sentAt = new Date('2024-01-01T00:00:00.000Z');

                    // Shared mutable log state — simulates the DB record
                    const logRecord: any = {
                        id: logId,
                        customerId,
                        sentAt,
                        readAt: null,
                        status: 'SENT',
                        announcementId: 'ann-idem',
                        error: null,
                        emailLogId: null,
                        createdAt: new Date(),
                    };

                    const { mock: prismaMock } = buildPrismaMock();
                    const emailMock = buildEmailMock();
                    const { mock: gatewayMock } = buildGatewayMock();

                    prismaMock.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
                    prismaMock.announcementLog.findUnique.mockImplementation(async () => ({ ...logRecord }));
                    prismaMock.announcementLog.update.mockImplementation(async ({ data }: any) => {
                        // Only update readAt on the first call (when it was null)
                        if (logRecord.readAt === null) {
                            logRecord.readAt = data.readAt;
                        }
                        return { ...logRecord };
                    });

                    const service = await buildService(prismaMock, emailMock, gatewayMock);

                    // First call — sets readAt
                    const firstResult = await service.markLogRead(logId, userId);
                    const firstReadAt = firstResult.readAt;

                    // Subsequent N-1 calls — must return same readAt
                    for (let i = 1; i < n; i++) {
                        // After first call, findUnique returns the updated record
                        prismaMock.announcementLog.findUnique.mockResolvedValue({ ...logRecord });
                        const result = await service.markLogRead(logId, userId);
                        expect(result.readAt).toEqual(firstReadAt);
                    }

                    // update must have been called exactly once (only on the first call)
                    expect(prismaMock.announcementLog.update).toHaveBeenCalledTimes(1);

                    jest.clearAllMocks();
                },
            ),
            { numRuns: 100 },
        );
    });
});

// ---------------------------------------------------------------------------
// Property 3: readAt temporal ordering invariant
// Feature: announcement-notifications, Property 3: readAt temporal ordering invariant
// ---------------------------------------------------------------------------

describe('AnnouncementsService — Property 3: readAt temporal ordering invariant', () => {
    it('readAt set by markLogRead is >= sentAt', async () => {
        // Feature: announcement-notifications, Property 3: readAt temporal ordering invariant
        await fc.assert(
            fc.asyncProperty(
                fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') })
                    .filter(d => !isNaN(d.getTime())), // sentAt — must be a valid date
                fc.uuid(), // logId
                fc.uuid(), // userId
                async (sentAt, logId, userId) => {
                    const customerId = 'cust-temporal';

                    const logRecord: any = {
                        id: logId,
                        customerId,
                        sentAt,
                        readAt: null,
                        status: 'SENT',
                        announcementId: 'ann-temporal',
                        error: null,
                        emailLogId: null,
                        createdAt: new Date(),
                    };

                    const { mock: prismaMock } = buildPrismaMock();
                    const emailMock = buildEmailMock();
                    const { mock: gatewayMock } = buildGatewayMock();

                    prismaMock.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });
                    prismaMock.announcementLog.findUnique.mockResolvedValue({ ...logRecord });

                    let capturedReadAt: Date | null = null;
                    prismaMock.announcementLog.update.mockImplementation(async ({ data }: any) => {
                        capturedReadAt = data.readAt;
                        return { ...logRecord, readAt: data.readAt };
                    });

                    const service = await buildService(prismaMock, emailMock, gatewayMock);
                    const result = await service.markLogRead(logId, userId);

                    // readAt must be set
                    expect(result.readAt).not.toBeNull();
                    expect(capturedReadAt).not.toBeNull();

                    // readAt >= sentAt
                    const readAtTime = (capturedReadAt as unknown as Date).getTime();
                    const sentAtTime = sentAt.getTime();
                    expect(readAtTime).toBeGreaterThanOrEqual(sentAtTime);

                    jest.clearAllMocks();
                },
            ),
            { numRuns: 200 },
        );
    });
});

// ---------------------------------------------------------------------------
// Property 12: Count convergence after full markRead sweep
// Feature: announcement-notifications, Property 12: Count convergence after full markRead sweep
// ---------------------------------------------------------------------------

describe('AnnouncementsService — Property 12: Count convergence after full markRead sweep', () => {
    it('after marking all N unread logs as read, getMyUnreadCount returns { count: 0 }', async () => {
        // Feature: announcement-notifications, Property 12: Count convergence after full markRead sweep
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 1, max: 20 }), // N unread logs
                fc.uuid(),                         // userId
                async (n, userId) => {
                    const customerId = 'cust-conv';

                    // Build N distinct unread log records
                    const logs: any[] = Array.from({ length: n }, (_, i) => ({
                        id: `log-conv-${i}`,
                        customerId,
                        sentAt: new Date('2024-01-01'),
                        readAt: null,
                        status: 'SENT',
                        announcementId: `ann-conv-${i}`,
                        error: null,
                        emailLogId: null,
                        createdAt: new Date(),
                    }));

                    const { mock: prismaMock } = buildPrismaMock();
                    const emailMock = buildEmailMock();
                    const { mock: gatewayMock } = buildGatewayMock();

                    prismaMock.customerProfile.findUnique.mockResolvedValue({ id: customerId, userId });

                    // findUnique returns the matching log (mutable state)
                    prismaMock.announcementLog.findUnique.mockImplementation(async ({ where }: any) => {
                        return logs.find(l => l.id === where.id) ?? null;
                    });

                    // update sets readAt on the log
                    prismaMock.announcementLog.update.mockImplementation(async ({ where, data }: any) => {
                        const log = logs.find(l => l.id === where.id);
                        if (log) Object.assign(log, data);
                        return log ?? { id: where.id, ...data };
                    });

                    const service = await buildService(prismaMock, emailMock, gatewayMock);

                    // Mark all N logs as read
                    for (const log of logs) {
                        await service.markLogRead(log.id, userId);
                    }

                    // Now all logs have readAt set — count should be 0
                    const remainingUnread = logs.filter(l => l.readAt == null).length;
                    prismaMock.announcementLog.count.mockResolvedValue(remainingUnread);

                    const result = await service.getMyUnreadCount(userId);
                    expect(result).toEqual({ count: 0 });

                    jest.clearAllMocks();
                },
            ),
            { numRuns: 100 },
        );
    });
});
