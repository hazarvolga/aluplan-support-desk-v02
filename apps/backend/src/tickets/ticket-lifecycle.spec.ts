import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Prisma, TicketStatus } from '@aluplan/database';
import { TicketsService } from './tickets.service';

describe('Ticket lifecycle decisions', () => {
    const owner = { sub: 'owner', role: 'CUSTOMER' };
    let service: TicketsService;
    let prisma: any;
    let events: any;
    beforeEach(() => {
        prisma = {
            ticket: { findFirst: jest.fn(), update: jest.fn() },
            ticketMessage: { create: jest.fn().mockResolvedValue({ id: 'message' }), findFirst: jest.fn() },
            user: { findMany: jest.fn().mockResolvedValue([]) },
        };
        prisma.$transaction = jest.fn((fn) => fn(prisma));
        events = { emit: jest.fn() };
        service = new TicketsService(prisma, {} as any, { maskSensitiveData: (v) => v } as any,
            events, {} as any, {} as any, { canManageTicket: jest.fn().mockResolvedValue(true),
                canManageTickets: jest.fn().mockResolvedValue(true) } as any, {} as any);
        const ticket = { id: 'ticket', userId: 'owner', status: TicketStatus.PENDING_CUSTOMER_REVIEW,
            satisfactionScore: null, updatedAt: new Date(), resolvedAt: new Date(), closedAt: null };
        prisma.ticket.findFirst.mockResolvedValue(ticket);
        prisma.ticket.update.mockImplementation(({ data }) => Promise.resolve({ ...ticket, ...data }));
    });
    it('closes a confirmed owner resolution without requiring or fabricating a rating', async () => {
        await service.decideResolution('ticket', { decision: 'CONFIRM' }, owner);
        expect(prisma.ticket.update).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ status: 'CLOSED' }),
        }));
        expect(prisma.ticket.update.mock.calls[0][0].data).not.toHaveProperty('satisfactionScore');
    });
    it('continues with an atomic owner public reply', async () => {
        await service.decideResolution('ticket', { decision: 'CONTINUE', comment: 'Still broken' }, owner);
        expect(prisma.ticketMessage.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ isInternal: false, senderId: 'owner' }),
        }));
        expect(prisma.ticket.update.mock.calls[0][0].data.status).toBe('OPEN');
    });
    it('rejects viewer and staff owner impersonation', async () => {
        await expect(service.decideResolution('ticket', { decision: 'CONFIRM' }, { ...owner, role: 'VIEWER' }))
            .rejects.toBeInstanceOf(ForbiddenException);
        expect(prisma.ticket.update).not.toHaveBeenCalled();
    });
    it('rating a closed ticket never changes lifecycle status', async () => {
        prisma.ticket.findFirst.mockResolvedValue({ id: 'ticket', userId: 'owner', status: 'CLOSED',
            satisfactionScore: null, updatedAt: new Date(), closedAt: new Date() });
        await service.submitFeedback('ticket', 1, 'Poor service', 'owner');
        expect(prisma.ticket.update.mock.calls[0][0].data).not.toHaveProperty('status');
        expect(prisma.ticket.update.mock.calls[0][0].data.satisfactionScore).toBe(1);
    });
    it('rejects another customer even with a readable same-company ticket', async () => {
        await expect(service.decideResolution('ticket', { decision: 'CONFIRM' }, { ...owner, sub: 'outsider' }))
            .rejects.toBeInstanceOf(ForbiddenException);
        expect(prisma.ticket.update).not.toHaveBeenCalled();
    });
    it('requires an explanation to continue and prevents draft or closed owner confirmation', async () => {
        await expect(service.decideResolution('ticket', { decision: 'CONTINUE', comment: ' ' }, owner))
            .rejects.toBeInstanceOf(BadRequestException);
        for (const status of ['DRAFT', 'CLOSED']) {
            prisma.ticket.findFirst.mockResolvedValue({ id: 'ticket', userId: 'owner', status });
            await expect(service.decideResolution('ticket', { decision: 'CONFIRM' }, owner))
                .rejects.toBeInstanceOf(BadRequestException);
        }
    });
    it('allows a self-resolved active issue to close while retaining old feedback', async () => {
        prisma.ticket.findFirst.mockResolvedValue({ id: 'ticket', userId: 'owner', status: 'OPEN', satisfactionScore: 2 });
        await service.decideResolution('ticket', { decision: 'CONFIRM' }, owner);
        expect(prisma.ticket.update.mock.calls[0][0].data).not.toHaveProperty('satisfactionScore');
        expect(events.emit).not.toHaveBeenCalledWith('ticket.kb_summarize', expect.anything());
    });
    it('returns conflict without events if a concurrent close or reply changed the revision', async () => {
        prisma.ticket.update.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('changed', { code: 'P2025', clientVersion: 'test' }));
        await expect(service.decideResolution('ticket', { decision: 'CONFIRM' }, owner)).rejects.toBeInstanceOf(ConflictException);
        expect(prisma.ticketMessage.create).not.toHaveBeenCalled();
        expect(events.emit).not.toHaveBeenCalled();
    });
    it('writes an owner reopen request publicly but keeps CLOSED and notifies scoped staff', async () => {
        const ticket = { id: 'ticket', userId: 'owner', status: 'CLOSED', closedAt: new Date(), updatedAt: new Date() };
        prisma.ticket.findFirst.mockResolvedValue(ticket);
        jest.spyOn(service, 'findOne').mockResolvedValue({ ...ticket, messages: [{ metadata: { action: 'TICKET_REOPEN_REQUESTED' } }] } as any);
        await service.requestReopen('ticket', 'It failed again', owner);
        expect(prisma.ticketMessage.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({
            isInternal: false, metadata: { action: 'TICKET_REOPEN_REQUESTED', previousClosedAt: ticket.closedAt.toISOString() },
        }) }));
        expect(prisma.ticket.update.mock.calls[0][0].data).not.toHaveProperty('status');
        expect(events.emit).toHaveBeenCalledWith('ticket.message_added', expect.anything());
    });
    it('deduplicates reopen requests for one closure without duplicate notification', async () => {
        const ticket = { id: 'ticket', userId: 'owner', status: 'CLOSED', closedAt: new Date() };
        prisma.ticket.findFirst.mockResolvedValue(ticket);
        prisma.ticketMessage.findFirst.mockResolvedValue({ id: 'existing' });
        jest.spyOn(service, 'findOne').mockResolvedValue(ticket as any);
        await service.requestReopen('ticket', 'Please reopen', owner);
        expect(prisma.ticket.update).not.toHaveBeenCalled();
        expect(prisma.ticketMessage.create).not.toHaveBeenCalled();
        expect(events.emit).not.toHaveBeenCalled();
    });
    it('staff closure records reason without any customer feedback', async () => {
        await service.closeWithReason('ticket', 'Duplicate request', { sub: 'agent', role: 'AGENT' });
        const data = prisma.ticket.update.mock.calls[0][0].data;
        expect(data.messages.create.metadata.action).toBe('TICKET_CLOSED_BY_STAFF');
        expect(data).not.toHaveProperty('satisfactionScore');
    });
    it.each([undefined, '', '   '])('allows staff closure with optional explanation %p and records only the actual staff action', async reason => {
        await service.closeWithReason('ticket', reason, { sub: 'agent', role: 'AGENT' });
        const data = prisma.ticket.update.mock.calls[0][0].data;
        expect(data.messages.create.message).toBe('Ticket closed by authorized support staff.');
        expect(data.messages.create.metadata.action).toBe('TICKET_CLOSED_BY_STAFF');
        expect(data).not.toHaveProperty('satisfactionScore');
    });
    it.each([undefined, '', '  '])('generic authorized close succeeds with optional reason %p while preserving close permission', async closeReason => {
        jest.spyOn(service, 'findOne').mockResolvedValue({ id: 'ticket', status: 'OPEN' } as any);
        await service.update('ticket', { status: TicketStatus.CLOSED, closeReason }, { sub: 'agent', role: 'AGENT', permissions: ['ticket:close'] });
        expect(prisma.ticket.update.mock.calls[0][0].data.messages.create.message).toBe('Ticket closed by authorized support staff.');
        prisma.ticket.update.mockClear();
        await expect(service.update('ticket', { status: TicketStatus.CLOSED }, { sub: 'agent', role: 'AGENT', permissions: [] }))
            .rejects.toBeInstanceOf(ForbiddenException);
        expect(prisma.ticket.update).not.toHaveBeenCalled();
    });
    it.each([undefined, '', '  '])('bulk authorized close succeeds with optional reason %p while preserving close permission', async closeReason => {
        prisma.ticket.findMany = jest.fn().mockResolvedValue([{ id: 'ticket', status: 'OPEN' }]);
        await service.bulkUpdate({ ticketIds: ['ticket'], status: TicketStatus.CLOSED, closeReason },
            { sub: 'agent', role: 'AGENT', permissions: ['ticket:close'] });
        expect(prisma.ticket.update.mock.calls[0][0].data.messages.create.message).toBe('Ticket closed by authorized support staff.');
        prisma.ticket.update.mockClear();
        await expect(service.bulkUpdate({ ticketIds: ['ticket'], status: TicketStatus.CLOSED },
            { sub: 'agent', role: 'AGENT', permissions: [] })).rejects.toBeInstanceOf(ForbiddenException);
        expect(prisma.ticket.update).not.toHaveBeenCalled();
    });
    it('cannot bypass reason through generic status transition', async () => {
        await expect(service.transition('ticket', TicketStatus.CLOSED, { sub: 'agent', role: 'AGENT' }))
            .rejects.toBeInstanceOf(BadRequestException);
        expect(prisma.ticket.update).not.toHaveBeenCalled();
    });
    it('retains a rating after reopening and rejects overwrite', async () => {
        prisma.ticket.findFirst.mockResolvedValue({ id: 'ticket', userId: 'owner', status: 'CLOSED', satisfactionScore: 5 });
        await expect(service.submitFeedback('ticket', 1, 'New rating', 'owner')).rejects.toBeInstanceOf(BadRequestException);
        expect(prisma.ticket.update).not.toHaveBeenCalled();
    });
    it.each(['PENDING_CUSTOMER_REVIEW', 'RESOLVED'])('public owner reply resumes %s atomically before fanout', async status => {
        const ticket = { id: 'ticket', userId: 'owner', status, updatedAt: new Date() };
        jest.spyOn(service, 'findOne').mockResolvedValue(ticket as any);
        await service.addMessage('ticket', { message: 'It is still broken' }, 'owner', 'CUSTOMER');
        expect(prisma.ticket.update.mock.calls[0][0]).toMatchObject({
            where: { id: 'ticket', status, updatedAt: ticket.updatedAt }, data: { status: 'OPEN' },
        });
        expect(events.emit).toHaveBeenCalledWith('ticket.status_changed', expect.objectContaining({ newStatus: 'OPEN' }));
    });
    it('aborts a reply if concurrent closure wins, without orphan message or fanout', async () => {
        jest.spyOn(service, 'findOne').mockResolvedValue({ id: 'ticket', userId: 'owner', status: 'RESOLVED' } as any);
        prisma.ticket.update.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('closed', { code: 'P2025', clientVersion: 'test' }));
        await expect(service.addMessage('ticket', { message: 'Still broken' }, 'owner', 'CUSTOMER')).rejects.toBeInstanceOf(ConflictException);
        expect(prisma.ticketMessage.create).not.toHaveBeenCalled();
        expect(events.emit).not.toHaveBeenCalled();
    });
    it('rejects an older v2 survey for a new resolution without exposing private data', async () => {
        prisma.ticket.findFirst.mockResolvedValue({ ticketNumber: 'SUP-1', resolvedAt: new Date(2000) });
        await expect(service.getPublicCsatSurvey('ticket', 1000)).rejects.toThrow('earlier resolution');
        await expect(service.getPublicCsatSurvey('ticket', 2000)).resolves.toEqual({ ticketNumber: 'SUP-1' });
    });
    it('legacy v1 surveys remain available only before any reopen or continuation', async () => {
        prisma.ticket.findFirst.mockResolvedValue({ ticketNumber: 'SUP-1', resolvedAt: null });
        await expect(service.getPublicCsatSurvey('ticket')).resolves.toEqual({ ticketNumber: 'SUP-1' });
        prisma.ticketMessage.findFirst.mockResolvedValue({ id: 'reopen-audit' });
        await expect(service.getPublicCsatSurvey('ticket')).rejects.toThrow('earlier resolution');
    });
    it('rejects token submit when a resolution changed between eligibility and write', async () => {
        prisma.ticket.findFirst.mockResolvedValue({ userId: 'owner', status: 'CLOSED', resolvedAt: new Date(2000), updatedAt: new Date(3000) });
        await expect(service.submitFeedback('ticket', 5, undefined, 'owner',
            { resolvedAt: new Date(1000), updatedAt: new Date(2500) })).rejects.toBeInstanceOf(ConflictException);
        expect(prisma.ticket.update).not.toHaveBeenCalled();
    });
    it('rejects v2 token after a reopen boundary even when historical resolvedAt is retained', async () => {
        prisma.ticket.findFirst.mockResolvedValue({ ticketNumber: 'SUP-1', resolvedAt: new Date(2000) });
        prisma.ticketMessage.findFirst.mockResolvedValue({ id: 'newer-reopen' });
        await expect(service.getPublicCsatSurvey('ticket', 2000)).rejects.toThrow('earlier resolution');
    });
});
