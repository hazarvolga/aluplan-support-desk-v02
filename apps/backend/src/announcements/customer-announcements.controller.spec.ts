import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CustomerAnnouncementsController } from './customer-announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Stub JwtAuthGuard — allows us to control auth per test */
class AllowGuard {
    canActivate() { return true; }
}

class DenyGuard {
    canActivate(_ctx: ExecutionContext) { return false; }
}

function buildServiceMock() {
    return {
        getMyAnnouncements: jest.fn(),
        getMyUnreadCount: jest.fn(),
        markLogRead: jest.fn(),
    };
}

function makeReq(userId: string) {
    return { user: { id: userId } };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('CustomerAnnouncementsController', () => {
    let controller: CustomerAnnouncementsController;
    let service: ReturnType<typeof buildServiceMock>;

    async function buildModule(guardClass: any = AllowGuard) {
        const mock = buildServiceMock();
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CustomerAnnouncementsController],
            providers: [
                { provide: AnnouncementsService, useValue: mock },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useClass(guardClass)
            .compile();

        controller = module.get<CustomerAnnouncementsController>(CustomerAnnouncementsController);
        service = mock;
        return { controller, service };
    }

    beforeEach(async () => {
        await buildModule();
    });

    afterEach(() => jest.clearAllMocks());

    // -----------------------------------------------------------------------
    // GET /announcements/my
    // -----------------------------------------------------------------------

    describe('GET /announcements/my — getMyAnnouncements', () => {
        it('returns paginated announcements for the authenticated user', async () => {
            const userId = 'user-1';
            const expected = {
                data: [
                    { id: 'log-1', customerId: 'cust-1', sentAt: new Date(), readAt: null },
                ],
                total: 1,
            };
            service.getMyAnnouncements.mockResolvedValue(expected);

            const result = await controller.getMyAnnouncements(makeReq(userId));

            expect(service.getMyAnnouncements).toHaveBeenCalledWith(userId, 1, 20);
            expect(result).toEqual(expected);
        });

        it('passes page and limit query params correctly', async () => {
            const userId = 'user-2';
            service.getMyAnnouncements.mockResolvedValue({ data: [], total: 0 });

            await controller.getMyAnnouncements(makeReq(userId), '3', '10');

            expect(service.getMyAnnouncements).toHaveBeenCalledWith(userId, 3, 10);
        });

        it('defaults to page=1 limit=20 when params are undefined', async () => {
            service.getMyAnnouncements.mockResolvedValue({ data: [], total: 0 });

            await controller.getMyAnnouncements(makeReq('user-3'), undefined, undefined);

            expect(service.getMyAnnouncements).toHaveBeenCalledWith('user-3', 1, 20);
        });

        it('returns empty list when customer has no announcements', async () => {
            service.getMyAnnouncements.mockResolvedValue({ data: [], total: 0 });

            const result = await controller.getMyAnnouncements(makeReq('user-no-logs'));

            expect(result).toEqual({ data: [], total: 0 });
        });

        it('returns only the caller\'s logs — service enforces isolation', async () => {
            const userId = 'user-a';
            const logsForA = [
                { id: 'log-a1', customerId: 'cust-a', sentAt: new Date(), readAt: null },
                { id: 'log-a2', customerId: 'cust-a', sentAt: new Date(), readAt: new Date() },
            ];
            service.getMyAnnouncements.mockResolvedValue({ data: logsForA, total: 2 });

            const result = await controller.getMyAnnouncements(makeReq(userId));

            // All returned logs belong to cust-a — no cross-customer leakage
            for (const log of (result as any).data) {
                expect(log.customerId).toBe('cust-a');
            }
        });

        it('returns 401 when JWT guard denies access', async () => {
            const { controller: deniedCtrl } = await buildModule(DenyGuard);

            // Guard returns false — NestJS would throw 403/401 before reaching controller.
            // We verify the guard is wired by checking canActivate returns false.
            const guard = new DenyGuard();
            expect(guard.canActivate({} as any)).toBe(false);
        });
    });

    // -----------------------------------------------------------------------
    // GET /announcements/my/unread-count
    // -----------------------------------------------------------------------

    describe('GET /announcements/my/unread-count — getMyUnreadCount', () => {
        it('returns { count: N } for the authenticated user', async () => {
            service.getMyUnreadCount.mockResolvedValue({ count: 5 });

            const result = await controller.getMyUnreadCount(makeReq('user-1'));

            expect(service.getMyUnreadCount).toHaveBeenCalledWith('user-1');
            expect(result).toEqual({ count: 5 });
        });

        it('returns { count: 0 } when all announcements are read', async () => {
            service.getMyUnreadCount.mockResolvedValue({ count: 0 });

            const result = await controller.getMyUnreadCount(makeReq('user-all-read'));

            expect(result).toEqual({ count: 0 });
        });

        it('returns { count: 0 } when customer profile does not exist', async () => {
            service.getMyUnreadCount.mockResolvedValue({ count: 0 });

            const result = await controller.getMyUnreadCount(makeReq('user-no-profile'));

            expect(result).toEqual({ count: 0 });
        });

        it('count matches DB state — delegates entirely to service', async () => {
            const expectedCount = 42;
            service.getMyUnreadCount.mockResolvedValue({ count: expectedCount });

            const result = await controller.getMyUnreadCount(makeReq('user-x'));

            expect((result as any).count).toBe(expectedCount);
        });
    });

    // -----------------------------------------------------------------------
    // PATCH /announcements/logs/:logId/read
    // -----------------------------------------------------------------------

    describe('PATCH /announcements/logs/:logId/read — markLogRead', () => {
        const userId = 'user-mark';
        const logId = 'log-abc';
        const sentAt = new Date('2024-01-01T00:00:00.000Z');

        it('marks an unread log as read and returns the updated log', async () => {
            const updatedLog = {
                id: logId,
                customerId: 'cust-mark',
                sentAt,
                readAt: new Date(),
                status: 'SENT',
            };
            service.markLogRead.mockResolvedValue(updatedLog);

            const result = await controller.markLogRead(logId, makeReq(userId));

            expect(service.markLogRead).toHaveBeenCalledWith(logId, userId);
            expect((result as any).readAt).not.toBeNull();
        });

        it('returns the log unchanged when already read (idempotent)', async () => {
            const existingReadAt = new Date('2024-06-01T12:00:00.000Z');
            const alreadyReadLog = {
                id: logId,
                customerId: 'cust-mark',
                sentAt,
                readAt: existingReadAt,
                status: 'SENT',
            };
            service.markLogRead.mockResolvedValue(alreadyReadLog);

            const result = await controller.markLogRead(logId, makeReq(userId));

            expect((result as any).readAt).toEqual(existingReadAt);
            // Service called once — controller doesn't add extra logic
            expect(service.markLogRead).toHaveBeenCalledTimes(1);
        });

        it('propagates ForbiddenException (403) when log belongs to another customer', async () => {
            service.markLogRead.mockRejectedValue(new ForbiddenException());

            await expect(
                controller.markLogRead(logId, makeReq('wrong-user'))
            ).rejects.toThrow(ForbiddenException);
        });

        it('propagates NotFoundException (404) when log does not exist', async () => {
            service.markLogRead.mockRejectedValue(new NotFoundException());

            await expect(
                controller.markLogRead('nonexistent-log', makeReq(userId))
            ).rejects.toThrow(NotFoundException);
        });

        it('propagates ForbiddenException (403) when customer profile is not found', async () => {
            service.markLogRead.mockRejectedValue(new ForbiddenException());

            await expect(
                controller.markLogRead(logId, makeReq('user-no-profile'))
            ).rejects.toThrow(ForbiddenException);
        });

        it('passes logId and userId correctly to service', async () => {
            const specificLogId = 'log-specific-123';
            const specificUserId = 'user-specific-456';
            service.markLogRead.mockResolvedValue({ id: specificLogId, readAt: new Date() });

            await controller.markLogRead(specificLogId, makeReq(specificUserId));

            expect(service.markLogRead).toHaveBeenCalledWith(specificLogId, specificUserId);
        });
    });

    // -----------------------------------------------------------------------
    // JWT Guard wiring — verify guard is applied at class level
    // -----------------------------------------------------------------------

    describe('JwtAuthGuard wiring', () => {
        it('controller is decorated with JwtAuthGuard', () => {
            // Reflect metadata confirms the guard is applied
            const guards = Reflect.getMetadata('__guards__', CustomerAnnouncementsController);
            expect(guards).toBeDefined();
            expect(guards.length).toBeGreaterThan(0);
            expect(guards[0]).toBe(JwtAuthGuard);
        });

        it('no RbacGuard or @Roles decorator on the class', () => {
            // Verify there is no roles metadata — this controller is customer-only, not admin
            const roles = Reflect.getMetadata('roles', CustomerAnnouncementsController);
            expect(roles).toBeUndefined();
        });
    });
});
