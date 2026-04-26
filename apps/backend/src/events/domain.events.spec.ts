import {
    TicketCreatedEvent,
    TicketStatusChangedEvent,
    TicketAssignedEvent,
    TicketMessageAddedEvent,
} from './domain.events';

describe('Domain events', () => {
    it('TicketCreatedEvent stores its payload as readonly fields', () => {
        const t0 = new Date('2026-04-26T10:00:00Z');
        const evt = new TicketCreatedEvent('ticket-1', 'customer-1', t0);
        expect(evt.ticketId).toBe('ticket-1');
        expect(evt.customerId).toBe('customer-1');
        expect(evt.createdAt).toBe(t0);
    });

    it('TicketCreatedEvent defaults createdAt to "now" when omitted', () => {
        const before = Date.now();
        const evt = new TicketCreatedEvent('t', 'c');
        const after = Date.now();
        expect(evt.createdAt.getTime()).toBeGreaterThanOrEqual(before);
        expect(evt.createdAt.getTime()).toBeLessThanOrEqual(after);
    });

    it('TicketStatusChangedEvent records old → new transition with actor', () => {
        const evt = new TicketStatusChangedEvent('t-1', 'OPEN', 'RESOLVED', 'agent-7');
        expect(evt).toMatchObject({
            ticketId: 't-1',
            oldStatus: 'OPEN',
            newStatus: 'RESOLVED',
            changedBy: 'agent-7',
        });
        expect(evt.changedAt).toBeInstanceOf(Date);
    });

    it('TicketAssignedEvent captures both assignee and assigner', () => {
        const evt = new TicketAssignedEvent('t-2', 'agent-A', 'admin-1');
        expect(evt.assignedToId).toBe('agent-A');
        expect(evt.assignedBy).toBe('admin-1');
    });

    it('TicketMessageAddedEvent flags internal vs public messages', () => {
        const internal = new TicketMessageAddedEvent('t-3', 'm-1', 'agent', true);
        const reply = new TicketMessageAddedEvent('t-3', 'm-2', 'customer', false);
        expect(internal.isInternal).toBe(true);
        expect(reply.isInternal).toBe(false);
    });

    it('events serialize to JSON without losing data', () => {
        const evt = new TicketCreatedEvent('t-1', 'c-1', new Date('2026-01-01T00:00:00Z'));
        const json = JSON.parse(JSON.stringify(evt));
        expect(json).toEqual({
            ticketId: 't-1',
            customerId: 'c-1',
            createdAt: '2026-01-01T00:00:00.000Z',
        });
    });
});
