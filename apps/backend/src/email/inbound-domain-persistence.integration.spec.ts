import { randomUUID } from 'node:crypto';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PrismaClient } from '@aluplan/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TicketsService } from '../tickets/tickets.service';
import { TicketAccessService } from '../common/services/ticket-access.service';
import { PiiMaskingService } from '../common/services/pii-masking.service';
import { StorageService } from '../common/services/storage.service';
import { EmailInboundService } from './email-inbound.service';

jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('../settings/settings.service', () => ({ SettingsService: class {} }));
jest.mock('../tickets/sla.service', () => ({ SlaService: class {} }));
jest.mock('../ai/ai-query.service', () => ({ AiQueryService: class {} }));
jest.mock('../redis/redis.service', () => ({ RedisService: class {} }));

// Explicit opt-in, fixed synthetic database, no app bootstrap or provider listeners.
// Characterizes partial commits; passing these tests does NOT approve those states.
const run = process.env.MAIL_DOMAIN_POSTGRES === 'synthetic-local-only' ? describe : describe.skip;
run('actual inbound domain persistence and post-commit failure boundaries', () => {
    jest.setTimeout(30000);
    let db: PrismaClient;
    let directory: string;
    let userId: string;
    const email = 'synthetic-domain@example.invalid';
    let tickets: TicketsService;
    let storage: StorageService;
    let inbound: EmailInboundService;
    const events = new EventEmitter2();
    const bytes = Buffer.from('Synthetic attachment bytes only');
    const mail = (subject: string) => ({
        from: { value: [{ address: email }] }, subject, text: 'Synthetic customer message',
        attachments: [{ filename: 'proof.txt', content: bytes, contentType: 'text/plain', size: bytes.length }],
    });
    const deliver = (subject: string, messageId: string) =>
        (inbound as unknown as { processMail: (mail: unknown, id: string) => Promise<boolean> })
            .processMail(mail(subject), messageId);

    beforeAll(async () => {
        db = new PrismaClient({ adapter: new PrismaPg({
            host: '127.0.0.1', port: 15432, database: 'domain_test', user: 'domain_test',
            password: 'SyntheticDomainOnly-20260923', max: 4, connectionTimeoutMillis: 5000,
            options: '-c statement_timeout=10000 -c lock_timeout=8000',
        }) });
        const identity = await db.$queryRaw<Array<{ db: string; role: string; version: string }>>`
            SELECT current_database() AS db, current_user AS role, current_setting('server_version') AS version`;
        expect(identity[0]).toEqual({ db: 'domain_test', role: 'domain_test', version: expect.stringMatching(/^17\./) });
        expect(await db.user.count()).toBe(0);
        expect(await db.ticket.count()).toBe(0);
        expect(await db.inboundEmailLog.count()).toBe(0);
        directory = await mkdtemp(join(tmpdir(), 'aluplan-domain-proof-'));
        const role = await db.role.create({ data: { name: 'CUSTOMER' } });
        const user = await db.user.create({ data: {
            email, fullName: 'Synthetic Customer', passwordHash: 'not-a-login-hash', roleId: role.id, status: 'ACTIVE',
        } });
        userId = user.id;
        const pii = new PiiMaskingService();
        tickets = new TicketsService(db as never, {
            calculateDeadlines: async () => ({ slaResponseDue: new Date(), slaResolveDue: new Date() }),
        } as never, pii, events, {} as never, {} as never, new TicketAccessService(db as never));
        storage = new StorageService({ get: () => ({ type: 'LOCAL', localPath: directory }) } as never, {} as never);
        inbound = new EmailInboundService(db as never, {} as never, tickets, storage, pii);
    });
    afterEach(() => { events.removeAllListeners(); });
    afterAll(async () => {
        try { await db?.$disconnect(); }
        finally { if (directory) await rm(directory, { recursive: true, force: true }); }
    });

    it('persists one ticket, message and byte-exact attachment; replay creates nothing', async () => {
        const subject = `Normal ${randomUUID()}`;
        const id = `<${randomUUID()}@example.invalid>`;
        expect(await deliver(subject, id)).toBe(true);
        const ticket = await db.ticket.findFirstOrThrow({ where: { subject } });
        const messages = await db.ticketMessage.findMany({ where: { ticketId: ticket.id } });
        expect(messages).toHaveLength(1);
        const files = await db.attachment.findMany({ where: { messageId: messages[0].id } });
        expect(files).toHaveLength(1);
        expect(await storage.getFile(files[0].url)).toEqual(bytes);
        expect(await db.inboundEmailLog.findUniqueOrThrow({ where: { messageId: id } }))
            .toMatchObject({ processed: true, ticketId: ticket.id });
        expect(await deliver(subject, id)).toBe(true);
        expect(await db.ticket.count({ where: { subject } })).toBe(1);
        expect(await db.ticketMessage.count({ where: { ticketId: ticket.id } })).toBe(1);
        expect(await db.attachment.count({ where: { messageId: messages[0].id } })).toBe(1);
    });

    it('characterizes a ticket committed before a synchronous event failure, without automatic replay', async () => {
        const subject = `Ticket failure ${randomUUID()}`;
        const id = `<${randomUUID()}@example.invalid>`;
        const fail = jest.fn(() => { throw new Error('Synthetic post-insert listener failure'); });
        events.once('ticket.created', fail);
        expect(await deliver(subject, id)).toBe(false);
        expect(fail).toHaveBeenCalledTimes(1);
        const ticket = await db.ticket.findFirstOrThrow({ where: { subject } });
        expect(await db.ticketMessage.count({ where: { ticketId: ticket.id } })).toBe(0);
        const claim = await db.inboundEmailLog.findUniqueOrThrow({ where: { messageId: id } });
        expect(claim).toMatchObject({ processed: false, ticketId: null });
        expect(claim.error).toContain('PROCESSING_FAILED');
        expect(await deliver(subject, id)).toBe(false);
        expect(await db.ticket.count({ where: { subject } })).toBe(1);
    });

    it('retains the returned ticket when PostgreSQL rejects its initial message, without replay', async () => {
        const subject = `Database rejection ${randomUUID()}`;
        const id = `<${randomUUID()}@example.invalid>`;
        // Dedicated opt-in disposable database only; existing rows remain untouched.
        await db.$executeRaw`ALTER TABLE ticket_messages ADD CONSTRAINT synthetic_reject_message
            CHECK (message <> 'Synthetic customer message') NOT VALID`;
        try {
            expect(await deliver(subject, id)).toBe(false);
        } finally {
            await db.$executeRaw`ALTER TABLE ticket_messages DROP CONSTRAINT synthetic_reject_message`;
        }
        const ticket = await db.ticket.findFirstOrThrow({ where: { subject } });
        expect(await db.ticketMessage.count({ where: { ticketId: ticket.id } })).toBe(0);
        const claim = await db.inboundEmailLog.findUniqueOrThrow({ where: { messageId: id } });
        expect(claim).toMatchObject({ processed: false, ticketId: ticket.id });
        expect(claim.error).toContain('PROCESSING_FAILED');
        expect(claim.error).not.toContain('ticketMessageId');
        expect(await deliver(subject, id)).toBe(false);
        expect(await db.ticket.count({ where: { subject } })).toBe(1);
        expect(await db.ticketMessage.count({ where: { ticketId: ticket.id } })).toBe(0);
    });

    it('characterizes a reply committed and ticket reopened before event failure, with attachment still absent', async () => {
        const ticket = await tickets.create({ subject: `Thread ${randomUUID()}` } as never, userId);
        await db.ticket.update({ where: { id: ticket.id }, data: { status: 'PENDING_CUSTOMER' } });
        const subject = `[${ticket.ticketNumber}] Synthetic reply`;
        const id = `<${randomUUID()}@example.invalid>`;
        const fail = jest.fn(() => { throw new Error('Synthetic post-insert listener failure'); });
        events.once('ticket.message_added', fail);
        expect(await deliver(subject, id)).toBe(false);
        expect(fail).toHaveBeenCalledTimes(1);
        const messages = await db.ticketMessage.findMany({ where: { ticketId: ticket.id } });
        expect(messages).toHaveLength(1);
        expect(await db.ticket.findUniqueOrThrow({ where: { id: ticket.id } })).toHaveProperty('status', 'OPEN');
        expect(await db.attachment.count({ where: { messageId: messages[0].id } })).toBe(0);
        const claim = await db.inboundEmailLog.findUniqueOrThrow({ where: { messageId: id } });
        expect(claim).toMatchObject({ processed: false, ticketId: ticket.id });
        expect(claim.error).not.toContain('ticketMessageId');
        expect(claim.error).toContain('PROCESSING_FAILED');
        expect(await deliver(subject, id)).toBe(false);
        expect(await db.ticketMessage.count({ where: { ticketId: ticket.id } })).toBe(1);
    });

    it('rolls back the reply when PostgreSQL rejects the customer reopen update', async () => {
        const ticket = await tickets.create({ subject: `Reopen rejection ${randomUUID()}` } as never, userId);
        await db.ticket.update({ where: { id: ticket.id }, data: { status: 'PENDING_CUSTOMER' } });
        const id = `<${randomUUID()}@example.invalid>`;
        const subject = `[${ticket.ticketNumber}] Synthetic reply`;
        const notified = jest.fn();
        events.on('ticket.message_added', notified);
        await db.$executeRaw`ALTER TABLE tickets ADD CONSTRAINT synthetic_reject_reopen
            CHECK (status <> 'OPEN') NOT VALID`;
        try { expect(await deliver(subject, id)).toBe(false); }
        finally { await db.$executeRaw`ALTER TABLE tickets DROP CONSTRAINT synthetic_reject_reopen`; }
        expect(await db.ticketMessage.count({ where: { ticketId: ticket.id } })).toBe(0);
        expect(await db.ticket.findUniqueOrThrow({ where: { id: ticket.id } })).toHaveProperty('status', 'PENDING_CUSTOMER');
        expect(notified).not.toHaveBeenCalled();
        expect(await db.inboundEmailLog.findUniqueOrThrow({ where: { messageId: id } }))
            .toMatchObject({ processed: false, ticketId: ticket.id });
        expect(await deliver(subject, id)).toBe(false);
        expect(await db.ticketMessage.count({ where: { ticketId: ticket.id } })).toBe(0);
    });

    it('rolls back a staff reply if the first-response timestamp update is rejected', async () => {
        const role = await db.role.create({ data: { name: 'AGENT' } });
        const agent = await db.user.create({ data: { email: 'synthetic-agent@example.invalid',
            fullName: 'Synthetic Agent', passwordHash: 'not-a-login-hash', roleId: role.id, status: 'ACTIVE' } });
        const ticket = await tickets.create({ subject: `SLA rejection ${randomUUID()}` } as never, userId);
        const notified = jest.fn();
        events.on('ticket.message_added', notified);
        await db.$executeRaw`ALTER TABLE tickets ADD CONSTRAINT synthetic_reject_sla
            CHECK (sla_responded_at IS NULL) NOT VALID`;
        try {
            await expect(tickets.addMessage(ticket.id, { message: 'Synthetic staff reply' }, agent.id, 'AGENT'))
                .rejects.toThrow();
        } finally { await db.$executeRaw`ALTER TABLE tickets DROP CONSTRAINT synthetic_reject_sla`; }
        expect(await db.ticketMessage.count({ where: { ticketId: ticket.id } })).toBe(0);
        expect(await db.ticket.findUniqueOrThrow({ where: { id: ticket.id } })).toHaveProperty('slaRespondedAt', null);
        expect(notified).not.toHaveBeenCalled();
        const message = await tickets.addMessage(ticket.id, { message: 'Synthetic staff reply' }, agent.id, 'AGENT');
        expect(await db.ticketMessage.count({ where: { ticketId: ticket.id } })).toBe(1);
        expect(await db.ticket.findUniqueOrThrow({ where: { id: ticket.id } }))
            .toHaveProperty('slaRespondedAt', expect.any(Date));
        expect(notified).toHaveBeenCalledWith(expect.objectContaining({ message: expect.objectContaining({ id: message.id }) }));
        const firstResponse = (await db.ticket.findUniqueOrThrow({ where: { id: ticket.id } })).slaRespondedAt;
        await tickets.addMessage(ticket.id, { message: 'Synthetic follow-up' }, agent.id, 'AGENT');
        expect((await db.ticket.findUniqueOrThrow({ where: { id: ticket.id } })).slaRespondedAt).toEqual(firstResponse);
    });

    it('does not reopen a ticket closed between the authorized read and the write', async () => {
        const ticket = await tickets.create({ subject: `Stale reopen ${randomUUID()}` } as never, userId);
        await db.ticket.update({ where: { id: ticket.id }, data: { status: 'PENDING_CUSTOMER' } });
        const read = tickets.findOne.bind(tickets);
        const staleRead = jest.spyOn(tickets, 'findOne').mockImplementationOnce(async (...args) => {
            const snapshot = await read(...args);
            await db.ticket.update({ where: { id: ticket.id }, data: { status: 'CLOSED' } });
            return snapshot;
        });
        const notified = jest.fn();
        events.on('ticket.message_added', notified);
        try {
            await expect(tickets.addMessage(ticket.id, { message: 'Synthetic stale reply' }, userId, 'CUSTOMER'))
                .rejects.toThrow();
        } finally { staleRead.mockRestore(); }
        expect(await db.ticketMessage.count({ where: { ticketId: ticket.id } })).toBe(0);
        expect(await db.ticket.findUniqueOrThrow({ where: { id: ticket.id } })).toHaveProperty('status', 'CLOSED');
        expect(notified).not.toHaveBeenCalled();
    });

    it('accepts both distinct customer replies that read PENDING_CUSTOMER concurrently', async () => {
        const ticket = await tickets.create({ subject: `Concurrent replies ${randomUUID()}` } as never, userId);
        await db.ticket.update({ where: { id: ticket.id }, data: { status: 'PENDING_CUSTOMER' } });
        const read = tickets.findOne.bind(tickets);
        let release!: () => void;
        const gate = new Promise<void>(resolve => { release = resolve; });
        let arrivals = 0;
        const synchronizedRead = jest.spyOn(tickets, 'findOne').mockImplementation(async (...args) => {
            try {
                const snapshot = await read(...args);
                expect(snapshot.status).toBe('PENDING_CUSTOMER');
                arrivals += 1;
                if (arrivals === 2) release();
                await gate;
                return snapshot;
            } catch (error) { release(); throw error; }
        });
        const notified = jest.fn();
        events.on('ticket.message_added', notified);
        try {
            const results = await Promise.allSettled(['First concurrent reply', 'Second concurrent reply'].map(message =>
                tickets.addMessage(ticket.id, { message }, userId, 'CUSTOMER')));
            expect(results.map(result => result.status)).toEqual(['fulfilled', 'fulfilled']);
        } finally { release(); synchronizedRead.mockRestore(); }
        const messages = await db.ticketMessage.findMany({ where: { ticketId: ticket.id } });
        expect(messages.map(message => message.message).sort()).toEqual(['First concurrent reply', 'Second concurrent reply']);
        expect(await db.ticket.findUniqueOrThrow({ where: { id: ticket.id } })).toHaveProperty('status', 'OPEN');
        expect(notified).toHaveBeenCalledTimes(2);
    });
});
