import { ForbiddenException } from '@nestjs/common';
import { TicketsService } from './tickets.service';

function fixture() {
    const prisma = {
        ticketMessage: { create: jest.fn(async ({ data }) => ({ id: 'synthetic-message', ...data })) },
        ticket: { update: jest.fn() },
    };
    const events = { emit: jest.fn() };
    const service = new TicketsService(
        prisma as any, {} as any, { maskSensitiveData: (text: string) => text } as any,
        events as any, {} as any, {} as any, {} as any,
    );
    const find = jest.spyOn(service, 'findOne').mockResolvedValue({
        id: 'synthetic-ticket', userId: 'synthetic-sender', status: 'OPEN',
    } as any);
    return { service, prisma, events, find };
}

describe('Internal note creation boundary', () => {
    it.each(['CUSTOMER', 'customer', ' CUSTOMER ', 'VIEWER', ' viewer '])(
        'rejects %s internal notes before reads or writes', async role => {
            const f = fixture();
            await expect(f.service.addMessage('synthetic-ticket', { message: 'Private note', isInternal: true }, 'synthetic-sender', role))
                .rejects.toThrow(ForbiddenException);
            expect(f.find).not.toHaveBeenCalled();
            expect(f.prisma.ticketMessage.create).not.toHaveBeenCalled();
            expect(f.prisma.ticket.update).not.toHaveBeenCalled();
            expect(f.events.emit).not.toHaveBeenCalled();
        },
    );

    it.each([false, undefined])('keeps ordinary customer replies working with isInternal=%p', async isInternal => {
        const f = fixture();
        const message = await f.service.addMessage('synthetic-ticket', { message: 'Public reply', isInternal }, 'synthetic-sender', 'CUSTOMER');
        expect(message.isInternal).toBe(false);
        expect(f.events.emit).toHaveBeenCalledTimes(1);
    });

    it.each(['ADMIN', 'SUPER_ADMIN', 'SUPERUSER', 'SUPPORT_AGENT', 'support-agent', 'SUPPORT_MANAGER', 'AGENT'])(
        'preserves %s internal notes after the existing ownership/staff check', async role => {
            const f = fixture();
            const message = await f.service.addMessage('synthetic-ticket', { message: 'Staff note', isInternal: true }, 'synthetic-sender', role);
            expect(message.isInternal).toBe(true);
            expect(f.find).toHaveBeenCalledWith('synthetic-ticket', { id: 'synthetic-sender', role });
        },
    );

    it('retains rejection from the existing access boundary for unknown roles', async () => {
        const f = fixture();
        f.find.mockRejectedValue(new ForbiddenException());
        await expect(f.service.addMessage('synthetic-ticket', { message: 'Private note', isInternal: true }, 'synthetic-sender', 'UNKNOWN'))
            .rejects.toThrow(ForbiddenException);
        expect(f.prisma.ticketMessage.create).not.toHaveBeenCalled();
        expect(f.events.emit).not.toHaveBeenCalled();
    });
});
