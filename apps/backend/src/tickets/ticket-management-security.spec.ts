import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { TicketPriority, TicketStatus } from '@aluplan/database';
import { TicketsService } from './tickets.service';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';
import { TicketAccessService } from '../common/services/ticket-access.service';

function fixture() {
    const records = [
        { id: 'own', userId: 'customer-a', status: TicketStatus.NEW, ticketNumber: 'SYN-1', deletedAt: null, closedAt: null, departmentId: 'dept-1', slaRespondedAt: null },
        { id: 'open', userId: 'customer-a', status: TicketStatus.OPEN, ticketNumber: 'SYN-7', deletedAt: null, closedAt: null, departmentId: 'dept-1', slaRespondedAt: new Date('2026-09-25T10:00:00Z') },
        { id: 'in_progress', userId: 'customer-a', status: TicketStatus.IN_PROGRESS, ticketNumber: 'SYN-5', deletedAt: null, closedAt: null, departmentId: 'dept-1', slaRespondedAt: new Date('2026-09-25T10:00:00Z') },
        { id: 'other', userId: 'customer-b', status: TicketStatus.NEW, ticketNumber: 'SYN-2', deletedAt: null, closedAt: null, departmentId: 'dept-2', slaRespondedAt: null },
        { id: 'restricted_dept', userId: 'customer-a', status: TicketStatus.NEW, ticketNumber: 'SYN-6', deletedAt: null, closedAt: null, departmentId: 'restricted-dept', slaRespondedAt: null },
        { id: 'closed', userId: 'customer-a', status: TicketStatus.CLOSED, ticketNumber: 'SYN-4', deletedAt: null, closedAt: new Date('2026-09-20T10:00:00Z'), departmentId: 'dept-1', slaRespondedAt: null },
        { id: 'deleted', userId: 'customer-a', status: TicketStatus.NEW, ticketNumber: 'SYN-3', deletedAt: new Date(), closedAt: null, departmentId: 'dept-1', slaRespondedAt: null },
    ];
    const prisma = {
        ticket: {
            count: jest.fn(async ({ where }) => records.filter(row => where.id.in.includes(row.id) && row.deletedAt === null).length),
            findFirst: jest.fn(async ({ where }) => {
                const row = records.find(r => r.id === where.id && r.deletedAt === null);
                if (!row) return null;
                return {
                    ...row,
                    messages: [
                        { id: 'm1', message: 'Internal confidential note', isInternal: true },
                    ],
                    attachments: [
                        { id: 'att-1', fileName: 'confidential.pdf' },
                    ],
                    escalations: [],
                };
            }),
            findUnique: jest.fn(async ({ where }) => {
                const row = records.find(r => r.id === where.id);
                return row ? { ...row } : null;
            }),
            findMany: jest.fn(async ({ where }) => {
                return records
                    .filter(r => (!where?.id?.in || where.id.in.includes(r.id)) && (!where?.deletedAt || r.deletedAt === null))
                    .map(r => ({ ...r }));
            }),
            update: jest.fn(async ({ where, data }) => {
                const target = records.find(row => row.id === where.id);
                if (!target) {
                    const err: any = new Error('Record not found');
                    err.code = 'P2025';
                    throw err;
                }
                if (where.status && target.status !== where.status) {
                    const err: any = new Error('Record to update not found (status mismatch)');
                    err.code = 'P2025';
                    throw err;
                }
                if (where.deletedAt === null && target.deletedAt !== null) {
                    const err: any = new Error('Record to update not found (deleted)');
                    err.code = 'P2025';
                    throw err;
                }
                if (where.closedAt !== undefined && target.closedAt?.getTime() !== where.closedAt?.getTime()) {
                    const err: any = new Error('Record to update not found (closedAt mismatch)');
                    err.code = 'P2025';
                    throw err;
                }
                const updated = { ...target, ...data };
                const idx = records.findIndex(r => r.id === target.id);
                if (idx !== -1) records[idx] = updated;
                return updated;
            }),
            updateMany: jest.fn(async () => ({ count: 2 })),
        },
        user: {
            findFirst: jest.fn(async ({ where }) => {
                if (where.id === 'synthetic-staff' || where.id === 'staff-agent') {
                    const teamFilter = where.teamMembers?.some?.team;
                    if (teamFilter && teamFilter.departmentId === 'restricted-dept') {
                        return null; // Simulated staff not in restricted-dept
                    }
                    return { id: where.id, status: 'ACTIVE', role: { name: 'AGENT' } };
                }
                return null;
            }),
        },
        ticketMessage: {
            create: jest.fn(async ({ data }) => ({ id: 'msg-1', ...data })),
            createMany: jest.fn(async () => ({ count: 2 })),
        },
        $transaction: jest.fn(async (cb: any) => typeof cb === 'function' ? cb(prisma) : Promise.all(cb)),
    };
    const events = { emit: jest.fn() };
    const access = new TicketAccessService(prisma as any);
    const slaService = {
        calculateDeadlines: jest.fn().mockResolvedValue({
            slaResponseDue: new Date('2026-09-29T10:00:00Z'),
            slaResolveDue: new Date('2026-09-30T10:00:00Z'),
        }),
    };
    const service = new TicketsService(prisma as any, slaService as any, {} as any, events as any, {} as any, {} as any, access, new MaintenanceWorkService());
    const expectNoWrites = () => {
        expect(prisma.ticket.update).not.toHaveBeenCalled();
        expect(prisma.ticket.updateMany).not.toHaveBeenCalled();
        expect(prisma.ticketMessage.create).not.toHaveBeenCalled();
        expect(prisma.ticketMessage.createMany).not.toHaveBeenCalled();
        expect(events.emit).not.toHaveBeenCalled();
    };
    return { service, prisma, events, slaService, expectNoWrites };
}

describe('Ticket management authorization before mutations', () => {
    beforeEach(() => jest.clearAllMocks());

    it('requires customers to use the dedicated resolution endpoint instead of generic status management', async () => {
        const f = fixture();
        await expect(f.service.transition('own', TicketStatus.PENDING_CUSTOMER_REVIEW, { sub: 'customer-a', role: 'CUSTOMER' }))
            .rejects.toThrow(ForbiddenException);
        f.expectNoWrites();
    });

    it('denies customer review transition on another customer ticket', async () => {
        const f = fixture();
        await expect(f.service.transition('other', TicketStatus.PENDING_CUSTOMER_REVIEW, { sub: 'customer-a', role: 'CUSTOMER' }))
            .rejects.toThrow(ForbiddenException);
        f.expectNoWrites();
    });

    it.each(['CUSTOMER', ' customer ', 'VIEWER', 'UNKNOWN', '', undefined])(
        'rejects %p for own and other ticket management without writes', async role => {
            for (const id of ['own', 'other']) {
                const f = fixture();
                const requester = { sub: 'customer-a', role };
                await expect(f.service.transition(id, TicketStatus.OPEN, requester as any)).rejects.toThrow(ForbiddenException);
                await expect(f.service.linkTicket(id, id === 'own' ? 'other' : 'own', requester as any)).rejects.toThrow(ForbiddenException);
                await expect(f.service.bulkUpdate({ ticketIds: [id], status: TicketStatus.CLOSED }, requester as any)).rejects.toThrow(ForbiddenException);
                f.expectNoWrites();
            }
        },
    );

    it.each([undefined, null, 'legacy-actor-id', {}, { role: 'ADMIN' }, { sub: '', role: 'ADMIN' }])(
        'fails closed for missing authenticated identity %p', async requester => {
            const f = fixture();
            await expect(f.service.transition('own', TicketStatus.OPEN, requester as any)).rejects.toThrow(ForbiddenException);
            await expect(f.service.linkTicket('own', 'other', requester as any)).rejects.toThrow(ForbiddenException);
            await expect(f.service.bulkUpdate({ ticketIds: ['own'], status: TicketStatus.CLOSED }, requester as any)).rejects.toThrow(ForbiddenException);
            f.expectNoWrites();
        },
    );

    it.each(['ADMIN', 'SUPER_ADMIN', 'SUPERUSER', 'SUPPORT_AGENT', 'support-agent', 'AGENT', 'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'SENIOR_AGENT', 'SUPPORT_MANAGER'])(
        'preserves authorized %s transition and merge', async role => {
            const f = fixture();
            const requester = { sub: 'synthetic-staff', role };
            await expect(f.service.transition('own', TicketStatus.OPEN, requester as any)).resolves.toMatchObject({ status: 'OPEN' });
            await expect(f.service.linkTicket('own', 'other', requester as any)).resolves.toMatchObject({ parentId: 'other' });
            expect(f.prisma.ticket.update).toHaveBeenCalledTimes(2);
            const messages = f.prisma.ticketMessage.createMany.mock.calls[0] as any;
            expect(messages[0].data.every((message: any) => message.senderId === requester.sub && message.isInternal)).toBe(true);
            await expect(f.service.bulkUpdate({ ticketIds: ['own', 'other'], status: TicketStatus.OPEN }, requester)).resolves.toEqual({ count: 2 });
        },
    );

    it.each(['missing', 'deleted'])('denies staff on unavailable target %s before any mutation', async id => {
        const f = fixture();
        const requester = { sub: 'synthetic-staff', role: 'SUPPORT_AGENT' };
        await expect(f.service.transition(id, TicketStatus.OPEN, requester as any)).rejects.toThrow(ForbiddenException);
        await expect(f.service.linkTicket('own', id, requester as any)).rejects.toThrow(ForbiddenException);
        await expect(f.service.linkTicket(id, 'other', requester as any)).rejects.toThrow(ForbiddenException);
        await expect(f.service.bulkUpdate({ ticketIds: ['own', id], status: TicketStatus.OPEN }, requester)).rejects.toThrow(ForbiddenException);
        f.expectNoWrites();
    });

    it.each([{ ticketIds: [] }, { ticketIds: ['own', 'own'] }])('rejects empty or duplicate bulk targets %p', async ({ ticketIds }) => {
        const f = fixture();
        await expect(f.service.bulkUpdate({ ticketIds, status: TicketStatus.OPEN }, { sub: 'staff', role: 'SUPPORT_AGENT' }))
            .rejects.toThrow(ForbiddenException);
        f.expectNoWrites();
    });
});

describe('SEC-05: Customer generic update field restrictions', () => {
    beforeEach(() => jest.clearAllMocks());

    it.each([
        ['status', TicketStatus.CLOSED],
        ['assignedTo', 'synthetic-staff'],
        ['priority', TicketPriority.URGENT],
        ['slaPolicyId', '11111111-1111-4111-8111-111111111111'],
        ['teamId', '22222222-2222-4222-8222-222222222222'],
        ['departmentId', '33333333-3333-4333-8333-333333333333'],
        ['tags', ['custom-tag']],
    ])('rejects customer update on %s with TICKET_FIELD_AGENT_ONLY without writes', async (field, value) => {
        const f = fixture();
        const requester = { sub: 'customer-a', role: 'CUSTOMER' };
        await expect(f.service.update('own', { [field]: value } as any, requester))
            .rejects.toThrow(ForbiddenException);
        f.expectNoWrites();
    });

    it('preserves customer update on subject and description on their own ticket', async () => {
        const f = fixture();
        const requester = { sub: 'customer-a', role: 'CUSTOMER' };
        const result = await f.service.update('own', { subject: 'Updated title', description: 'Updated body' }, requester);
        expect(result).toMatchObject({ subject: 'Updated title', description: 'Updated body' });
        expect(f.prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'own', status: TicketStatus.NEW, deletedAt: null },
            data: expect.objectContaining({ subject: 'Updated title', description: 'Updated body' }),
        }));
    });
});

describe('SEC-05: Staff generic update boundaries & state machine enforcement', () => {
    beforeEach(() => jest.clearAllMocks());

    it('rejects assigning a closed ticket via generic update', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        await expect(f.service.update('closed', { assignedTo: 'synthetic-staff' }, staff))
            .rejects.toThrow(BadRequestException);
        f.expectNoWrites();
    });

    it('rejects assigning a ticket to an inactive or customer user via generic update', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        await expect(f.service.update('own', { assignedTo: 'customer-a' }, staff))
            .rejects.toThrow(BadRequestException);
        f.expectNoWrites();
    });

    it('rejects transitioning a closed ticket to IN_PROGRESS via generic update', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        await expect(f.service.update('closed', { status: TicketStatus.IN_PROGRESS }, staff))
            .rejects.toThrow(BadRequestException);
        f.expectNoWrites();
    });

    it('allows reopening a closed ticket to OPEN via generic update with atomic message and status event', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        const result = await f.service.update('closed', { status: TicketStatus.OPEN }, staff);
        expect(result).toMatchObject({ status: 'OPEN', closedAt: null });
        expect(f.prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                status: 'OPEN',
                closedAt: null,
                messages: expect.objectContaining({
                    create: expect.objectContaining({
                        isInternal: true,
                        metadata: expect.objectContaining({ action: 'TICKET_REOPENED' }),
                    }),
                }),
            }),
        }));
        expect(f.events.emit).toHaveBeenCalledWith('ticket.status_changed', expect.objectContaining({
            ticketId: 'closed',
            oldStatus: 'CLOSED',
            newStatus: 'OPEN',
            actorId: 'synthetic-staff',
        }));
    });
});

describe('SEC-05: Staff bulk update boundaries & all-or-nothing atomicity', () => {
    beforeEach(() => jest.clearAllMocks());

    it('rejects bulk update when any ticket in the batch violates status transitions without modifying any ticket', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        await expect(f.service.bulkUpdate({ ticketIds: ['own', 'closed'], status: TicketStatus.IN_PROGRESS }, staff))
            .rejects.toThrow(BadRequestException);
        f.expectNoWrites();
    });

    it('rejects bulk update when attempting to assign a closed ticket without reopening without modifying any ticket', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        await expect(f.service.bulkUpdate({ ticketIds: ['own', 'closed'], assignedTo: 'synthetic-staff' }, staff))
            .rejects.toThrow(BadRequestException);
        f.expectNoWrites();
    });

    it('rejects bulk update when assignee is not an active support team member without modifying any ticket', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        await expect(f.service.bulkUpdate({ ticketIds: ['own', 'other'], assignedTo: 'customer-a' }, staff))
            .rejects.toThrow(BadRequestException);
        f.expectNoWrites();
    });

    it('allows bulk reopening closed tickets to OPEN with atomic message and event emission', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        const result = await f.service.bulkUpdate({ ticketIds: ['closed'], status: TicketStatus.OPEN }, staff);
        expect(result).toEqual({ count: 1 });
        expect(f.prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                status: 'OPEN',
                closedAt: null,
                messages: expect.objectContaining({
                    create: expect.objectContaining({
                        isInternal: true,
                        metadata: expect.objectContaining({ action: 'TICKET_REOPENED' }),
                    }),
                }),
            }),
        }));
        expect(f.events.emit).toHaveBeenCalledWith('ticket.status_changed', expect.objectContaining({
            ticketId: 'closed',
            oldStatus: 'CLOSED',
            newStatus: 'OPEN',
            actorId: 'synthetic-staff',
        }));
    });

    it('moves NEW tickets to OPEN and records assignee in bulk update', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        const result = await f.service.bulkUpdate({ ticketIds: ['own'], assignedTo: 'synthetic-staff' }, staff);
        expect(result).toEqual({ count: 1 });
        expect(f.prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ id: 'own' }),
            data: expect.objectContaining({
                assignedTo: 'synthetic-staff',
                status: TicketStatus.OPEN,
            }),
        }));
        expect(f.events.emit).toHaveBeenCalledWith('ticket.status_changed', expect.objectContaining({
            ticketId: 'own',
            oldStatus: 'NEW',
            newStatus: 'OPEN',
            actorId: 'synthetic-staff',
        }));
    });
});

describe('SEC-05: Regressions & Edge Cases', () => {
    beforeEach(() => jest.clearAllMocks());

    it('1) P1: no-op or same-status update returns scalar Ticket without leaking internal relations', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };

        // No-op empty update
        const noOpResult = await f.service.update('own', {}, staff);
        expect(noOpResult).not.toHaveProperty('messages');
        expect(noOpResult).not.toHaveProperty('attachments');
        expect(noOpResult).not.toHaveProperty('escalations');
        expect(noOpResult).toMatchObject({ id: 'own', ticketNumber: 'SYN-1' });

        // Same-status update
        const sameStatusResult = await f.service.update('own', { status: TicketStatus.NEW }, staff);
        expect(sameStatusResult).not.toHaveProperty('messages');
        expect(sameStatusResult).not.toHaveProperty('attachments');
        expect(sameStatusResult).toMatchObject({ id: 'own', ticketNumber: 'SYN-1' });
        f.expectNoWrites();
    });

    it('2) bulk assignment-only calculates target status individually per ticket without corrupting non-NEW tickets', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        const result = await f.service.bulkUpdate({
            ticketIds: ['own', 'in_progress'],
            assignedTo: 'synthetic-staff',
        }, staff);

        expect(result).toEqual({ count: 2 });
        // own (NEW) moved to OPEN
        expect(f.prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ id: 'own' }),
            data: expect.objectContaining({ assignedTo: 'synthetic-staff', status: TicketStatus.OPEN }),
        }));
        // in_progress (IN_PROGRESS) remained IN_PROGRESS, not corrupted to OPEN
        expect(f.prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ id: 'in_progress' }),
            data: expect.not.objectContaining({ status: TicketStatus.OPEN }),
        }));
        // Only one status_changed event emitted (for 'own', not for 'in_progress')
        expect(f.events.emit).toHaveBeenCalledTimes(1);
        expect(f.events.emit).toHaveBeenCalledWith('ticket.status_changed', expect.objectContaining({
            ticketId: 'own',
            oldStatus: 'NEW',
            newStatus: 'OPEN',
        }));
    });

    it('3) bulk assignee validation enforces department team constraints across all affected departments', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        // Batch includes ticket in 'restricted-dept' where synthetic-staff is not an active team member
        await expect(f.service.bulkUpdate({
            ticketIds: ['own', 'restricted_dept'],
            assignedTo: 'synthetic-staff',
        }, staff)).rejects.toThrow(BadRequestException);
        f.expectNoWrites();
    });

    it('4) optimistic locking conditions per-ticket updates on status/deletedAt and rolls back on race', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        // Force mock to simulate ticket was concurrently modified
        f.prisma.ticket.update.mockRejectedValueOnce(Object.assign(new Error('Record to update not found'), { code: 'P2025' }));
        await expect(f.service.bulkUpdate({ ticketIds: ['own'], status: TicketStatus.OPEN }, staff))
            .rejects.toThrow('Ticket changed; refresh before updating');
        expect(f.events.emit).not.toHaveBeenCalled();
    });

    it('5) combined update validates all fields first: invalid assignee aborts before status mutation or event emission', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        // Pass valid status transition (NEW -> OPEN) together with invalid assignee
        await expect(f.service.update('own', {
            status: TicketStatus.OPEN,
            assignedTo: 'invalid-nonexistent-user',
        }, staff)).rejects.toThrow(BadRequestException);
        // Assert ZERO writes and ZERO events emitted
        f.expectNoWrites();
    });

    it('6) bulk and generic assignment preserves existing slaRespondedAt and does not overwrite with now', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        // in_progress already has slaRespondedAt
        await f.service.bulkUpdate({ ticketIds: ['in_progress'], assignedTo: 'synthetic-staff' }, staff);
        expect(f.prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ id: 'in_progress' }),
            data: expect.not.objectContaining({ slaRespondedAt: expect.anything() }),
        }));
    });

    it('7) generic update rejects unsupported management fields (slaPolicyId, teamId, departmentId) for staff with 400', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };
        for (const field of ['slaPolicyId', 'teamId', 'departmentId']) {
            await expect(f.service.update('own', { [field]: 'custom-val' } as any, staff))
                .rejects.toThrow(BadRequestException);
            f.expectNoWrites();
        }
    });

    it('8) generic assignment-only on OPEN ticket conditions on status/deletedAt and throws ConflictException on concurrent race with zero events', async () => {
        const f = fixture();
        const staff = { sub: 'synthetic-staff', role: 'AGENT' };

        // Normal assignment-only on OPEN ticket conditions whereClause on { id: 'open', status: TicketStatus.OPEN, deletedAt: null }
        await f.service.update('open', { assignedTo: 'synthetic-staff' }, staff);
        expect(f.prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
            where: { id: 'open', status: TicketStatus.OPEN, deletedAt: null },
            data: expect.objectContaining({ assignedTo: 'synthetic-staff' }),
        }));

        // Simulate concurrent race where ticket was closed/deleted after findOne read (Prisma P2025)
        const fRace = fixture();
        fRace.prisma.ticket.update.mockRejectedValueOnce(Object.assign(new Error('Record to update not found'), { code: 'P2025' }));
        await expect(fRace.service.update('open', { assignedTo: 'synthetic-staff' }, staff))
            .rejects.toThrow('Ticket changed; refresh before updating');
        expect(fRace.events.emit).not.toHaveBeenCalled();
    });
});
