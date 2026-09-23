/**
 * KNOWN-GAP CHARACTERIZATION, NOT RELEASE ACCEPTANCE.
 * Green tests reproduce current unsafe behavior; they do not certify retry safety.
 * Real intake methods run with synthetic IMAP, parser, storage and database doubles.
 * Post-commit counters model an ambiguous service failure, not a real DB transaction.
 * Replace the corresponding gap assertions when an approved reliability fix lands.
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
        openBox: jest.fn().mockResolvedValue(undefined),
        search: jest.fn().mockResolvedValue([rawItem(1)]),
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

describe('inbound reliability: known-gap characterization, not acceptance', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    });
    afterEach(() => jest.restoreAllMocks());

    it('documents current early-seen and batch-abort gap when the first parser call fails', async () => {
        const h = createHarness();
        h.connection.search.mockResolvedValue([rawItem(1), rawItem(2)]);
        (simpleParser as jest.Mock).mockRejectedValueOnce(new Error('Synthetic parse failure'));

        await h.service.handleInboundEmails();

        expect(h.connection.search).toHaveBeenCalledWith(['UNSEEN'], {
            bodies: ['HEADER', 'TEXT', ''], markSeen: true,
        });
        expect(h.connection.search.mock.invocationCallOrder[0]).toBeLessThan(
            (simpleParser as jest.Mock).mock.invocationCallOrder[0],
        );
        expect(simpleParser).toHaveBeenCalledTimes(1);
        expect(simpleParser).toHaveBeenCalledWith('synthetic raw 1');
        expect(h.counts()).toEqual({ tickets: 0, replies: 0 });
    });

    it.each(['search', 'parse'])('documents current connection cleanup gap after %s failure', async (stage) => {
        const h = createHarness();
        if (stage === 'search') h.connection.search.mockRejectedValueOnce(new Error('Synthetic search failure'));
        else (simpleParser as jest.Mock).mockRejectedValueOnce(new Error('Synthetic parse failure'));

        await h.service.handleInboundEmails();

        expect(imaps.connect).toHaveBeenCalledTimes(1);
        expect(h.connection.end).not.toHaveBeenCalled();
    });

    it('documents current duplicate-ticket gap after a mocked write commits then throws on repeated delivery', async () => {
        const h = createHarness();
        h.tickets.create.mockImplementation(async () => {
            h.commitTicket();
            throw new Error('Synthetic post-commit failure');
        });

        await h.deliver();
        await h.deliver();

        expect(h.counts()).toEqual({ tickets: 2, replies: 0 });
        expect(h.logs.size).toBe(1);
        expect(h.logs.get(messageId)).toMatchObject({ processed: false, error: 'Synthetic post-commit failure' });
    });

    it('documents current duplicate-reply gap after a mocked write commits then throws on repeated delivery', async () => {
        const h = createHarness();
        h.tickets.addMessage.mockImplementation(async () => {
            h.commitReply();
            throw new Error('Synthetic post-commit failure');
        });

        await h.deliver(mail('Re: [SUP-123]'));
        await h.deliver(mail('Re: [SUP-123]'));

        expect(h.counts()).toEqual({ tickets: 0, replies: 2 });
        expect(h.logs.size).toBe(1);
        expect(h.logs.get(messageId)?.processed).toBe(false);
    });

    it('documents the existing processed-log control preventing sequential successful replay', async () => {
        const h = createHarness();

        await h.deliver();
        await h.deliver();

        expect(h.counts()).toEqual({ tickets: 1, replies: 0 });
        expect(h.prisma.ticketMessage.create).toHaveBeenCalledTimes(1);
        expect(h.logs.get(messageId)).toMatchObject({ processed: true, error: null });
        expect(h.prisma.inboundEmailLog.upsert).toHaveBeenCalledTimes(1);
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
        expect(h.logs.get(messageId)).toMatchObject({
            processed: true, error: 'INBOUND_ATTACHMENT_FAILURE count=1 ticketMessageId=initial-message',
        });
    });

    it('documents current cross-channel race gap: one unique log does not stop two writes', async () => {
        const h = createHarness();
        let arrivals = 0;
        let release!: () => void;
        const bothReads = new Promise<void>((resolve) => { release = resolve; });
        h.prisma.inboundEmailLog.findUnique.mockImplementation(async ({ where }) => {
            const row = h.logs.get(where.messageId);
            const snapshot = row ? { ...row } : null;
            arrivals += 1;
            if (arrivals === 2) release();
            await bothReads;
            return snapshot;
        });

        await Promise.all([
            h.service.handleInboundEmails(),
            h.webhook.handleInboundEmailWebhook({
                from: 'customer@example.invalid', subject: 'Synthetic request', text: 'Synthetic body', messageId,
            }),
        ]);

        expect(arrivals).toBe(2);
        expect(h.logs.size).toBe(1);
        expect(h.prisma.inboundEmailLog.upsert).toHaveBeenCalledTimes(2);
        expect(h.counts()).toEqual({ tickets: 2, replies: 0 });
        expect(h.logs.get(messageId)?.processed).toBe(true);
    });

    it('documents the existing in-flight reset control allowing another poll after an error', async () => {
        const h = createHarness();
        h.connection.search.mockRejectedValueOnce(new Error('Synthetic search failure'));

        await h.service.handleInboundEmails();
        await h.service.handleInboundEmails();

        expect(imaps.connect).toHaveBeenCalledTimes(2);
        expect(h.connection.search).toHaveBeenCalledTimes(2);
        expect(h.counts()).toEqual({ tickets: 1, replies: 0 });
        expect(h.connection.end).toHaveBeenCalledTimes(1);
    });
});
