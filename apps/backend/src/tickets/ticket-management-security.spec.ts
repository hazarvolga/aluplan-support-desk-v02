import { ForbiddenException } from '@nestjs/common';
import { TicketStatus } from '@aluplan/database';
import { TicketsService } from './tickets.service';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';
import { TicketAccessService } from '../common/services/ticket-access.service';

function fixture() {
    const records = [
        { id: 'own', userId: 'customer-a', status: TicketStatus.NEW, ticketNumber: 'SYN-1', deletedAt: null },
        { id: 'other', userId: 'customer-b', status: TicketStatus.NEW, ticketNumber: 'SYN-2', deletedAt: null },
        { id: 'deleted', userId: 'customer-a', status: TicketStatus.NEW, ticketNumber: 'SYN-3', deletedAt: new Date() },
    ];
    const prisma = {
        ticket: {
            count: jest.fn(async ({ where }) => records.filter(row => where.id.in.includes(row.id) && row.deletedAt === null).length),
            findFirst: jest.fn(async ({ where }) => records.find(row => row.id === where.id && row.deletedAt === null) ?? null),
            findUnique: jest.fn(async ({ where }) => records.find(row => row.id === where.id) ?? null),
            update: jest.fn(async ({ where, data }) => ({ ...records.find(row => row.id === where.id), ...data })),
            updateMany: jest.fn(async () => ({ count: 2 })),
        },
        ticketMessage: { createMany: jest.fn(async () => ({ count: 2 })) },
    };
    const events = { emit: jest.fn() };
    const access = new TicketAccessService(prisma as any);
    const service = new TicketsService(prisma as any, {} as any, {} as any, events as any, {} as any, {} as any, access, new MaintenanceWorkService());
    const expectNoWrites = () => {
        expect(prisma.ticket.update).not.toHaveBeenCalled();
        expect(prisma.ticket.updateMany).not.toHaveBeenCalled();
        expect(prisma.ticketMessage.createMany).not.toHaveBeenCalled();
        expect(events.emit).not.toHaveBeenCalled();
    };
    return { service, prisma, events, expectNoWrites };
}

describe('Ticket management authorization before mutations', () => {
    beforeEach(() => jest.clearAllMocks());

    it('preserves the customer close-button transition on their own ticket', async () => {
        const f = fixture();
        await expect(f.service.transition('own', TicketStatus.PENDING_CUSTOMER_REVIEW, { sub: 'customer-a', role: 'CUSTOMER' }))
            .resolves.toMatchObject({ status: TicketStatus.PENDING_CUSTOMER_REVIEW });
        expect(f.prisma.ticket.update).toHaveBeenCalledTimes(1);
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
