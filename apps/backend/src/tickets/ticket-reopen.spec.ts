import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { TicketStatus } from '@aluplan/database';
import { TicketsService } from './tickets.service';
import { TicketAccessService } from '../common/services/ticket-access.service';
import { MaintenanceWorkService } from '../common/services/maintenance-work.service';

function fixture() {
    const ticket = {
        id: 'ticket-1', userId: 'customer-1', ticketNumber: 'SYN-1',
        status: TicketStatus.CLOSED, deletedAt: null,
        closedAt: new Date('2026-09-20T10:00:00Z'),
        resolvedAt: new Date('2026-09-19T10:00:00Z'),
        slaSolvedAt: new Date('2026-09-19T10:00:00Z'),
        slaRespondedAt: new Date('2026-09-18T10:00:00Z'),
        slaResolveDue: new Date('2026-09-19T12:00:00Z'),
    };
    const prisma = { ticket: {
        findFirst: jest.fn(async () => ticket),
        update: jest.fn(async ({ data }) => ({ ...ticket, ...data })),
    } };
    const events = { emit: jest.fn() };
    const access = new TicketAccessService(prisma as any);
    const service = new TicketsService(prisma as any, {} as any, {} as any,
        events as any, {} as any, {} as any, access, new MaintenanceWorkService());
    jest.spyOn(service, 'findOne').mockResolvedValue(ticket as any);
    return { ticket, prisma, events, service };
}

describe('closed ticket reopening', () => {
    it.each(['ADMIN', 'SUPER_ADMIN', 'SUPPORT_AGENT', 'AGENT'])(
        'allows %s to reopen the same ticket with an atomic internal record', async role => {
            const f = fixture();
            const result = await f.service.transition('ticket-1', TicketStatus.OPEN, { sub: 'staff-1', role });
            expect(result).toMatchObject({ id: 'ticket-1', ticketNumber: 'SYN-1', status: 'OPEN', closedAt: null });
            expect(f.prisma.ticket.update).toHaveBeenCalledWith({
                where: { id: 'ticket-1', status: TicketStatus.CLOSED, deletedAt: null, closedAt: f.ticket.closedAt },
                data: {
                    status: TicketStatus.OPEN,
                    closedAt: null,
                    messages: { create: {
                        message: 'Ticket reopened by authorized support staff.',
                        isInternal: true,
                        sender: { connect: { id: 'staff-1' } },
                        metadata: { action: 'TICKET_REOPENED', previousClosedAt: '2026-09-20T10:00:00.000Z' },
                    } },
                },
            });
            expect(result.resolvedAt).toEqual(f.ticket.resolvedAt);
            expect(result.slaSolvedAt).toEqual(f.ticket.slaSolvedAt);
            expect(result.slaResolveDue).toEqual(f.ticket.slaResolveDue);
            expect(f.events.emit).toHaveBeenCalledWith('ticket.status_changed', {
                ticketId: 'ticket-1', oldStatus: 'CLOSED', newStatus: 'OPEN', actorId: 'staff-1',
            });
        },
    );

    it.each(['CUSTOMER', 'VIEWER', 'UNKNOWN', ''])(
        'denies %s before changing status or adding history', async role => {
            const f = fixture();
            await expect(f.service.transition('ticket-1', TicketStatus.OPEN, { sub: 'customer-1', role }))
                .rejects.toThrow(ForbiddenException);
            expect(f.prisma.ticket.update).not.toHaveBeenCalled();
            expect(f.events.emit).not.toHaveBeenCalled();
        },
    );

    it('does not allow CLOSED to jump directly to IN_PROGRESS', async () => {
        const f = fixture();
        await expect(f.service.transition('ticket-1', TicketStatus.IN_PROGRESS, { sub: 'staff-1', role: 'ADMIN' }))
            .rejects.toThrow(BadRequestException);
        expect(f.prisma.ticket.update).not.toHaveBeenCalled();
    });

    it('reports stale/deleted concurrent target without publishing a success event', async () => {
        const f = fixture();
        f.prisma.ticket.update.mockRejectedValueOnce(Object.assign(new Error('record changed'), { code: 'P2025' }));
        await expect(f.service.transition('ticket-1', TicketStatus.OPEN, { sub: 'staff-1', role: 'ADMIN' }))
            .rejects.toThrow(ConflictException);
        expect(f.events.emit).not.toHaveBeenCalled();
    });
});
