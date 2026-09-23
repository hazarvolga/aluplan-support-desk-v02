/**
 * Local safety regressions for shared intake claims and acknowledgement ordering.
 * Real intake methods run with synthetic IMAP, parser, storage and database doubles.
 * Post-commit counters model an ambiguous service failure, not a real DB transaction.
 */
import { Logger } from '@nestjs/common';
import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { EmailInboundService } from './email-inbound.service';
import { OmniChannelService } from '../omni-channel/omni-channel.service';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { TicketsService } from '../tickets/tickets.service';
import { StorageService } from '../common/services/storage.service';
import { PiiMaskingService } from '../common/services/pii-masking.service';

jest.mock('imap-simple', () => ({ __esModule: true, default: { connect: jest.fn() } }));
jest.mock('mailparser', () => ({ simpleParser: jest.fn() }));
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('../settings/settings.service', () => ({ SettingsService: class {} }));
jest.mock('../tickets/tickets.service', () => ({ TicketsService: class {} }));
jest.mock('../common/services/storage.service', () => ({ StorageService: class {} }));
jest.mock('../common/services/pii-masking.service', () => ({ PiiMaskingService: class {} }));
jest.mock('@aluplan/database', () => ({ CommunicationChannel: { EMAIL: 'EMAIL' } }));

const messageId = 'synthetic-intake@example.invalid';
const mail = (subject = 'Synthetic request') => ({
    from: { value: [{ address: 'customer@example.invalid' }] },
    subject,
    text: 'Synthetic body',
});
const rawItem = (uid: number) => ({
    attributes: { uid },
    parts: [
        { which: '', body: `synthetic raw ${uid}` },
        { which: 'HEADER', body: { 'message-id': [messageId] } },
    ],
});
type LogRow = { id: string; messageId: string; processed: boolean; error?: string | null };

function createHarness() {
    const logs = new Map<string, LogRow>();
    let commits = { tickets: 0, replies: 0 };
    const prisma = {
        inboundEmailLog: {
            create: jest.fn(async ({ data }) => {
                if (logs.has(data.messageId)) throw Object.assign(new Error('Synthetic unique conflict'), { code: 'P2002' });
                const row = { id: `log-${logs.size}`, ...data };
                logs.set(data.messageId, { ...row });
                return { ...row };
            }),
            updateMany: jest.fn(async ({ where, data }) => {
                const row = [...logs.values()].find((item) => Object.entries(where).every(([key, value]) => (item as Record<string, unknown>)[key] === value));
                if (!row) return { count: 0 };
                logs.set(row.messageId, { ...row, ...data });
                return { count: 1 };
            }),
            findUnique: jest.fn(async ({ where }) => {
                const row = logs.get(where.messageId);
                return row ? { ...row } : null;
            }),
            upsert: jest.fn(async ({ where, create }) => {
                const row = logs.get(where.messageId) ?? { id: 'unique-log', ...create };
                logs.set(where.messageId, { ...row });
                return { ...row };
            }),
            update: jest.fn(async ({ where, data }) => {
                const row = [...logs.values()].find((item) => item.id === where.id);
                if (!row) throw new Error('Synthetic log missing');
                const updated = { ...row, ...data };
                logs.set(row.messageId, updated);
                return { ...updated };
            }),
        },
        user: { findUnique: jest.fn().mockResolvedValue({
            id: 'customer', status: 'ACTIVE', deletedAt: null, role: { name: 'CUSTOMER' },
        }) },
        ticket: { findUnique: jest.fn().mockResolvedValue({ id: 'ticket', userId: 'customer' }) },
        ticketMessage: { create: jest.fn().mockResolvedValue({ id: 'initial-message' }) },
        attachment: { create: jest.fn().mockResolvedValue({ id: 'attachment' }) },
    };
    const commitTicket = () => {
        commits = { ...commits, tickets: commits.tickets + 1 };
        return { id: `ticket-${commits.tickets}` };
    };
    const commitReply = () => {
        commits = { ...commits, replies: commits.replies + 1 };
        return { id: `reply-${commits.replies}` };
    };
    const tickets = {
        create: jest.fn(async () => commitTicket()),
        addMessage: jest.fn(async () => commitReply()),
    };
    const storage = { uploadFile: jest.fn().mockResolvedValue('synthetic-object') };
    const connection = {
        openBox: jest.fn().mockResolvedValue({ uidvalidity: 1 }),
        search: jest.fn().mockResolvedValue([rawItem(1)]),
        addFlags: jest.fn().mockResolvedValue(undefined),
        end: jest.fn(),
    };
    const service = new EmailInboundService(
        prisma as unknown as PrismaService,
        { getValue: async (key: string) => key === 'email.imap.host' ? 'imap.example.invalid' : undefined } as unknown as SettingsService,
        tickets as unknown as TicketsService,
        storage as unknown as StorageService,
        { maskSensitiveData: (value: string) => value } as unknown as PiiMaskingService,
    );
    const webhook = new OmniChannelService(prisma as unknown as PrismaService, tickets as unknown as TicketsService);
    (imaps.connect as jest.Mock).mockResolvedValue(connection);
    (simpleParser as jest.Mock).mockResolvedValue(mail());
    const deliver = (value = mail()) =>
        (service as unknown as { processMail(value: unknown, id: string): Promise<void> }).processMail(value, messageId);
    return {
        logs, prisma, tickets, storage, connection, service, webhook, deliver,
        commitTicket, commitReply, counts: () => ({ ...commits }),
    };
}

describe('inbound reliability: shared claims and safe acknowledgement', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    });
    afterEach(() => jest.restoreAllMocks());

    it('holds malformed webhook text without domain writes', async () => {
        const h = createHarness();
        await expect(h.webhook.handleInboundEmailWebhook({
            from: 'customer@example.invalid', messageId, subject: { invalid: true }, text: 'body',
        })).resolves.toBe('held');
        expect(h.counts()).toEqual({ tickets: 0, replies: 0 });
        expect([...h.logs.values()][0].error).toContain('INVALID_INPUT');
    });

    it('holds mail when UIDVALIDITY is unavailable', async () => {
        const h = createHarness();
        h.connection.openBox.mockResolvedValue({ uidvalidity: 0 });
        await h.service.handleInboundEmails();
        expect(simpleParser).not.toHaveBeenCalled();
        expect(h.connection.addFlags).not.toHaveBeenCalled();
        expect([...h.logs.values()][0].error).toContain('MISSING_IDENTITY');
    });

    it('does not mark fetched mail seen and continues after a parser failure', async () => {
        const h = createHarness();
        h.connection.search.mockResolvedValue([rawItem(1), rawItem(2)]);
        (simpleParser as jest.Mock).mockRejectedValueOnce(new Error('Synthetic parse failure'));

        await h.service.handleInboundEmails();

        expect(h.connection.search).toHaveBeenCalledWith(['UNSEEN'], {
            bodies: ['HEADER', 'TEXT', ''], markSeen: false,
        });
        expect(h.connection.search.mock.invocationCallOrder[0]).toBeLessThan(
            (simpleParser as jest.Mock).mock.invocationCallOrder[0],
        );
        expect(simpleParser).toHaveBeenCalledTimes(2);
        expect(simpleParser).toHaveBeenCalledWith('synthetic raw 1');
        expect(h.counts()).toEqual({ tickets: 1, replies: 0 });
        expect(h.connection.addFlags).toHaveBeenCalledTimes(1);
        expect(h.connection.addFlags).toHaveBeenCalledWith(2, '\\Seen');
    });

    it.each(['search', 'parse'])('closes the connection after %s failure without acknowledgement', async (stage) => {
        const h = createHarness();
        if (stage === 'search') h.connection.search.mockRejectedValueOnce(new Error('Synthetic search failure'));
        else (simpleParser as jest.Mock).mockRejectedValueOnce(new Error('Synthetic parse failure'));

        await h.service.handleInboundEmails();

        expect(imaps.connect).toHaveBeenCalledTimes(1);
        expect(h.connection.end).toHaveBeenCalledTimes(1);
        expect(h.connection.addFlags).not.toHaveBeenCalled();
    });

    it('holds ambiguous ticket creation instead of replaying a committed write', async () => {
        const h = createHarness();
        h.tickets.create.mockImplementation(async () => {
            h.commitTicket();
            throw new Error('Synthetic post-commit failure');
        });

        await h.deliver();
        await h.deliver();

        expect(h.counts()).toEqual({ tickets: 1, replies: 0 });
        expect(h.logs.size).toBe(1);
        expect(h.logs.get(messageId)?.processed).toBe(false);
        expect(h.logs.get(messageId)?.error).toMatch(/^INBOUND_HOLD_V1:/);
    });

    it('holds ambiguous reply creation instead of replaying a committed write', async () => {
        const h = createHarness();
        h.tickets.addMessage.mockImplementation(async () => {
            h.commitReply();
            throw new Error('Synthetic post-commit failure');
        });

        await h.deliver(mail('Re: [SUP-123]'));
        await h.deliver(mail('Re: [SUP-123]'));

        expect(h.counts()).toEqual({ tickets: 0, replies: 1 });
        expect(h.logs.size).toBe(1);
        expect(h.logs.get(messageId)?.processed).toBe(false);
    });

    it('documents the existing processed-log control preventing sequential successful replay', async () => {
        const h = createHarness();

        await h.deliver();
        await h.deliver();

        expect(h.counts()).toEqual({ tickets: 1, replies: 0 });
        expect(h.prisma.ticketMessage.create).toHaveBeenCalledTimes(1);
        expect(h.logs.get(messageId)?.processed).toBe(true);
        expect(h.logs.get(messageId)?.error).toMatch(/^INBOUND_DONE_V1:/);
    });

    it('documents the existing partial-attachment marker preventing replay of an already-created message', async () => {
        const h = createHarness();
        h.storage.uploadFile.mockRejectedValue(new Error('Synthetic upload failure'));
        const attachmentMail = {
            ...mail(), attachments: [{ filename: 'fixture.txt', content: Buffer.from('fixture'), contentType: 'text/plain', size: 7 }],
        };

        await h.deliver(attachmentMail);
        await h.deliver(attachmentMail);

        expect(h.counts()).toEqual({ tickets: 1, replies: 0 });
        expect(h.storage.uploadFile).toHaveBeenCalledTimes(1);
        expect(h.prisma.attachment.create).not.toHaveBeenCalled();
        expect(h.logs.get(messageId)?.processed).toBe(true);
        expect(h.logs.get(messageId)?.error).toContain('INBOUND_ATTACHMENT_FAILURE');
    });

    it('shares one claim across concurrent IMAP and webhook delivery', async () => {
        const h = createHarness();
        let entered!: () => void;
        let release!: () => void;
        const started = new Promise<void>((resolve) => { entered = resolve; });
        const gate = new Promise<void>((resolve) => { release = resolve; });
        h.tickets.create.mockImplementation(async () => {
            entered();
            await gate;
            return h.commitTicket();
        });
        const poll = h.service.handleInboundEmails();
        await started;
        const webhook = h.webhook.handleInboundEmailWebhook({
            from: 'customer@example.invalid', subject: 'Synthetic request', text: 'Synthetic body', messageId,
        });
        // Drain a bounded event-loop turn while the first business write is blocked.
        await new Promise<void>((resolve) => setImmediate(resolve));
        release();

        await Promise.all([poll, webhook]);

        expect(h.logs.size).toBe(1);
        expect(h.counts()).toEqual({ tickets: 1, replies: 0 });
        expect(h.logs.get(messageId)?.processed).toBe(true);
    });

    it('acknowledges only after successful processing is durably recorded', async () => {
        const h = createHarness();
        let entered!: () => void;
        let release!: () => void;
        const started = new Promise<void>((resolve) => { entered = resolve; });
        const gate = new Promise<void>((resolve) => { release = resolve; });
        h.tickets.create.mockImplementation(async () => {
            entered();
            await gate;
            return h.commitTicket();
        });
        h.connection.addFlags.mockImplementation(async () => {
            expect(h.logs.get(messageId)?.processed).toBe(true);
        });
        const poll = h.service.handleInboundEmails();
        await started;
        expect(h.connection.addFlags).not.toHaveBeenCalled();
        release();
        await poll;
        expect(h.connection.addFlags).toHaveBeenCalledWith(1, '\\Seen');
    });

    it('leaves ambiguous writes unacknowledged across repeated polls', async () => {
        const h = createHarness();
        h.tickets.create.mockImplementation(async () => {
            h.commitTicket();
            throw new Error('Synthetic post-commit failure');
        });
        await h.service.handleInboundEmails();
        await h.service.handleInboundEmails();
        expect(h.counts()).toEqual({ tickets: 1, replies: 0 });
        expect(h.connection.addFlags).not.toHaveBeenCalled();
        expect(h.connection.end).toHaveBeenCalledTimes(2);
    });

    it('retries acknowledgement without replaying business writes after a flag failure', async () => {
        const h = createHarness();
        h.connection.addFlags.mockRejectedValueOnce(new Error('Synthetic flag failure'));
        await h.service.handleInboundEmails();
        await h.service.handleInboundEmails();
        expect(h.counts()).toEqual({ tickets: 1, replies: 0 });
        expect(h.connection.addFlags).toHaveBeenCalledTimes(2);
        expect(h.logs.get(messageId)?.processed).toBe(true);
        expect(h.connection.end).toHaveBeenCalledTimes(2);
    });

    it('does not acknowledge or replay a write when its completion record fails', async () => {
        const h = createHarness();
        h.prisma.inboundEmailLog.updateMany.mockRejectedValueOnce(new Error('Synthetic completion failure'));
        await h.service.handleInboundEmails();
        await h.service.handleInboundEmails();
        expect(h.counts()).toEqual({ tickets: 1, replies: 0 });
        expect(h.connection.addFlags).not.toHaveBeenCalled();
        expect(h.logs.get(messageId)?.processed).toBe(false);
        expect(h.logs.get(messageId)).toHaveProperty('ticketId', 'ticket-1');
        expect(h.logs.get(messageId)?.error).toContain('"ticketMessageId":"initial-message"');
    });

    it('retains returned ticket identity when initial message persistence fails', async () => {
        const h = createHarness();
        h.prisma.ticketMessage.create.mockRejectedValueOnce(new Error('Synthetic message failure'));
        await h.service.handleInboundEmails();
        await h.service.handleInboundEmails();
        expect(h.logs.get(messageId)).toMatchObject({ processed: false, ticketId: 'ticket-1' });
        expect(h.logs.get(messageId)?.error).not.toContain('ticketMessageId');
        expect(h.counts()).toEqual({ tickets: 1, replies: 0 });
        expect(h.connection.addFlags).not.toHaveBeenCalled();
    });

    it.each(['imap', 'webhook'])('retains authorized thread identity after ambiguous reply failure (%s)', async ingress => {
        const h = createHarness();
        h.tickets.addMessage.mockRejectedValueOnce(new Error('Synthetic ambiguous reply failure'));
        if (ingress === 'imap') await h.deliver(mail('[SUP-123]'));
        else await h.webhook.handleInboundEmailWebhook({ from: 'customer@example.invalid', messageId,
            subject: '[SUP-123]', text: 'Synthetic body' });
        expect(h.logs.get(messageId)).toMatchObject({ processed: false, ticketId: 'ticket' });
        expect(h.logs.get(messageId)?.error).not.toContain('ticketMessageId');
    });

    it('retains returned webhook reply identity when completion logging fails', async () => {
        const h = createHarness();
        h.prisma.inboundEmailLog.updateMany.mockRejectedValueOnce(new Error('Synthetic completion failure'));
        const payload = { from: 'customer@example.invalid', messageId, subject: '[SUP-123]', text: 'Synthetic body' };
        expect(await h.webhook.handleInboundEmailWebhook(payload)).toBe('held');
        expect(await h.webhook.handleInboundEmailWebhook(payload)).toBe('held');
        expect(h.logs.get(messageId)).toMatchObject({ processed: false, ticketId: 'ticket' });
        expect(h.logs.get(messageId)?.error).toContain('"ticketMessageId":"reply-1"');
        expect(h.counts()).toEqual({ tickets: 0, replies: 1 });
    });

    it('retains attachment failure evidence when finalization also fails', async () => {
        const h = createHarness();
        h.storage.uploadFile.mockRejectedValueOnce(new Error('Synthetic attachment failure'));
        h.prisma.inboundEmailLog.updateMany.mockRejectedValueOnce(new Error('Synthetic completion failure'));
        await h.deliver({ ...mail(), attachments: [{ filename: 'a.txt', content: Buffer.from('a'),
            contentType: 'text/plain', size: 1 }] } as ReturnType<typeof mail>);
        expect(h.logs.get(messageId)).toMatchObject({ processed: false, ticketId: 'ticket-1' });
        expect(JSON.parse(h.logs.get(messageId)!.error!.slice('INBOUND_HOLD_V1:'.length))).toMatchObject({
            ticketMessageId: 'initial-message', failedAttachmentCount: 1, note: 'INBOUND_ATTACHMENT_FAILURE',
        });
    });

    it.each(['imap', 'webhook'])('never links another customer ticket to a denied sender (%s)', async ingress => {
        const h = createHarness();
        h.prisma.ticket.findUnique.mockResolvedValue({ id: 'private-ticket', userId: 'other-customer' });
        if (ingress === 'imap') await h.deliver(mail('[SUP-123]'));
        else await h.webhook.handleInboundEmailWebhook({ from: 'customer@example.invalid', messageId,
            subject: '[SUP-123]', text: 'Synthetic body' });
        expect(h.logs.get(messageId)).not.toHaveProperty('ticketId');
        expect(h.logs.get(messageId)?.error).toContain('INBOUND_TICKET_OWNER_MISMATCH');
        expect(h.tickets.addMessage).not.toHaveBeenCalled();
    });

    it('documents the existing in-flight reset control allowing another poll after an error', async () => {
        const h = createHarness();
        h.connection.search.mockRejectedValueOnce(new Error('Synthetic search failure'));

        await h.service.handleInboundEmails();
        await h.service.handleInboundEmails();

        expect(imaps.connect).toHaveBeenCalledTimes(2);
        expect(h.connection.search).toHaveBeenCalledTimes(2);
        expect(h.counts()).toEqual({ tickets: 1, replies: 0 });
        expect(h.connection.end).toHaveBeenCalledTimes(2);
    });
});
