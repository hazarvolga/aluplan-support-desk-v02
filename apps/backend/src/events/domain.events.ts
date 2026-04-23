/**
 * Domain Events
 *
 * Standardized event classes for the Aluplan Support Desk event-driven architecture.
 * All events are immutable, type-safe, and serializable.
 *
 * Usage:
 *   this.eventEmitter.emit('ticket.created', new TicketCreatedEvent(ticketId, customerId));
 *
 *   @OnEvent('ticket.created')
 *   async handleTicketCreated(event: TicketCreatedEvent) { ... }
 */

export class TicketCreatedEvent {
    constructor(
        public readonly ticketId: string,
        public readonly customerId: string,
        public readonly createdAt: Date = new Date(),
    ) { }
}

export class TicketStatusChangedEvent {
    constructor(
        public readonly ticketId: string,
        public readonly oldStatus: string,
        public readonly newStatus: string,
        public readonly changedBy: string,
        public readonly changedAt: Date = new Date(),
    ) { }
}

export class TicketAssignedEvent {
    constructor(
        public readonly ticketId: string,
        public readonly assignedToId: string,
        public readonly assignedBy: string,
        public readonly assignedAt: Date = new Date(),
    ) { }
}

export class TicketMessageAddedEvent {
    constructor(
        public readonly ticketId: string,
        public readonly messageId: string,
        public readonly authorId: string,
        public readonly isInternal: boolean,
        public readonly createdAt: Date = new Date(),
    ) { }
}

export class TicketResolvedEvent {
    constructor(
        public readonly ticketId: string,
        public readonly resolvedBy: string,
        public readonly resolution: string,
        public readonly resolvedAt: Date = new Date(),
    ) { }
}

export class UserLoggedInEvent {
    constructor(
        public readonly userId: string,
        public readonly email: string,
        public readonly ip: string,
        public readonly userAgent: string,
        public readonly loggedInAt: Date = new Date(),
    ) { }
}

export class UserLoggedOutEvent {
    constructor(
        public readonly userId: string,
        public readonly loggedOutAt: Date = new Date(),
    ) { }
}

export class AiQueryExecutedEvent {
    constructor(
        public readonly queryId: string,
        public readonly userId: string,
        public readonly provider: string,
        public readonly tokensUsed: number,
        public readonly costUsd: number,
        public readonly cacheHit: boolean,
        public readonly executedAt: Date = new Date(),
    ) { }
}
