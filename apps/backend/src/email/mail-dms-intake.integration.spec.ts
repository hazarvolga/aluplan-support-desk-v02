import { randomUUID } from 'node:crypto';
import imaps from 'imap-simple';
import nodemailer from 'nodemailer';
import { EmailInboundService } from './email-inbound.service';
import { SmtpProvider } from './smtp.provider';

// Real DMS, SMTP, IMAP, MIME parser and intake claims; persistence is deliberately fake.
jest.mock('@aluplan/database', () => ({ CommunicationChannel: { EMAIL: 'EMAIL' } }), { virtual: true });
jest.mock('../prisma/prisma.service', () => ({ PrismaService: class {} }));
jest.mock('../settings/settings.service', () => ({ SettingsService: class {} }));
jest.mock('../tickets/tickets.service', () => ({ TicketsService: class {} }));
jest.mock('../common/services/storage.service', () => ({ StorageService: class {} }));
jest.mock('../common/services/pii-masking.service', () => ({ PiiMaskingService: class {} }));

const run = process.env.MAIL_DMS_REHEARSAL === 'synthetic-local-only' ? describe : describe.skip;
const account = 'rehearsal@example.invalid';
const password = 'SyntheticLocalOnly-20260923';
const bytes = Buffer.from([0, 1, 127, 128, 255, 10, 13]);
const values: Record<string, string> = {
    'email.smtp.host': '127.0.0.1', 'email.smtp.port': '1587', 'email.smtp.secure': 'false',
    'email.smtp.user': account, 'email.smtp.pass': password,
    'email.imap.host': '127.0.0.1', 'email.imap.port': '19993', 'email.imap.tls': 'true',
    'email.imap.user': account, 'email.imap.pass': password,
};
type Row = { id: string; messageId: string; processed: boolean; error: string; [key: string]: unknown };

function harness() {
    const rows = new Map<string, Row>();
    const prisma = {
        inboundEmailLog: {
            create: jest.fn(async ({ data }) => {
                if (rows.has(data.messageId)) throw Object.assign(new Error('Unique conflict'), { code: 'P2002' });
                const row = { id: randomUUID(), ...data };
                rows.set(data.messageId, { ...row });
                return { ...row };
            }),
            findUnique: jest.fn(async ({ where }) => rows.get(where.messageId) ?? null),
            updateMany: jest.fn(async ({ where, data }) => {
                const row = [...rows.values()].find(item => Object.entries(where).every(([key, value]) => item[key] === value));
                if (!row) return { count: 0 };
                rows.set(row.messageId, { ...row, ...data });
                return { count: 1 };
            }),
        },
        user: { findUnique: jest.fn(async () => ({ id: 'synthetic-user', status: 'ACTIVE', role: { name: 'CUSTOMER' } })) },
        ticketMessage: { create: jest.fn(async () => ({ id: 'synthetic-message' })) },
        attachment: { create: jest.fn(async () => ({ id: 'synthetic-attachment' })) },
    };
    const tickets = { create: jest.fn(async () => ({ id: 'synthetic-ticket' })) };
    const storage = { uploadFile: jest.fn(async (_file: { buffer: Buffer; originalname: string }, _path: string) => 'synthetic-object') };
    const settings = { getValue: async (key: string) => values[key] };
    return {
        rows, prisma, tickets, storage, smtp: new SmtpProvider(settings as never),
        service: new EmailInboundService(prisma as never, settings as never, tickets as never, storage as never,
            { maskSensitiveData: (text: string) => text } as never),
    };
}

async function mailbox<T>(action: (connection: imaps.ImapSimple) => Promise<T>): Promise<T> {
    const connection = await imaps.connect({ imap: {
        host: '127.0.0.1', port: 19993, user: account, password, tls: true, authTimeout: 5000,
        tlsOptions: { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
    } });
    try { await connection.openBox('INBOX'); return await action(connection); }
    finally { connection.end(); }
}

async function messages(id: string) {
    return mailbox(connection => connection.search([['HEADER', 'MESSAGE-ID', id]], { bodies: [''], markSeen: false }));
}

async function sendAttachment(id: string) {
    const transport = nodemailer.createTransport({
        host: '127.0.0.1', port: 1587, secure: false, requireTLS: true,
        auth: { user: account, pass: password },
        tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
    });
    try {
        await transport.sendMail({ from: account, to: account, messageId: id, subject: 'Synthetic intake',
            text: 'Synthetic body', attachments: [{ filename: 'probe.bin', content: bytes }] });
    } finally { transport.close(); }
    for (let attempt = 0; attempt < 20; attempt++) {
        if ((await messages(id)).length) return;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Synthetic message did not arrive within bounded polling');
}

run('isolated Docker Mailserver intake (NOT real database acceptance)', () => {
    jest.setTimeout(30000);
    let ownedIds: string[] = [];
    beforeAll(async () => {
        expect(process.env.NODE_EXTRA_CA_CERTS).toBeTruthy();
        // Refuse a reused mailbox: this suite must never process unrelated source mail.
        expect(await mailbox(c => c.search(['ALL'], { bodies: ['HEADER'], markSeen: false }))).toHaveLength(0);
    });
    beforeEach(async () => {
        ownedIds = [];
        expect(await mailbox(c => c.search(['UNSEEN'], { bodies: ['HEADER'], markSeen: false }))).toHaveLength(0);
    });
    afterEach(async () => {
        // Fixture cleanup only, AFTER assertions about held source flags. Never delete mail.
        for (const id of ownedIds) {
            await mailbox(async c => {
                const found = await c.search([['HEADER', 'MESSAGE-ID', id]], { bodies: ['HEADER'], markSeen: false });
                if (found.length) await c.addFlags(found.map(item => item.attributes.uid), '\\Seen');
            });
        }
    });

    it('uses the actual SMTP provider and verifies the actual IMAP client', async () => {
        const h = harness();
        await expect(h.smtp.healthCheck()).resolves.toBe(true);
        await expect(h.service.verifyImap()).resolves.toHaveProperty('available', true);
        const sent = await h.smtp.send({ from: account, to: account, subject: 'Synthetic provider', text: 'Synthetic', html: '<p>Synthetic</p>' });
        expect(sent.messageId).toBeTruthy();
        ownedIds = [...ownedIds, sent.messageId];
        // Only this synthetic provider smoke message is acknowledged before intake tests.
        await mailbox(async c => {
            for (let attempt = 0; attempt < 20; attempt++) {
                const found = await c.search([['HEADER', 'MESSAGE-ID', sent.messageId]], { bodies: ['HEADER'], markSeen: false });
                if (found.length) { await c.addFlags(found.map(item => item.attributes.uid), '\\Seen'); return; }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            throw new Error('Provider smoke message not delivered');
        });
    });

    it('preserves parsed attachment bytes and prevents duplicate ticket writes on re-poll', async () => {
        const h = harness();
        const id = `<${randomUUID()}@example.invalid>`;
        ownedIds = [...ownedIds, id];
        await sendAttachment(id);
        await h.service.handleInboundEmails();
        expect(h.tickets.create).toHaveBeenCalledTimes(1);
        expect(h.storage.uploadFile).toHaveBeenCalledTimes(1);
        expect(h.storage.uploadFile.mock.calls[0][0]).toEqual(expect.objectContaining({ buffer: bytes, originalname: 'probe.bin' }));
        expect(h.prisma.attachment.create).toHaveBeenCalledTimes(1);
        expect(h.rows.get(id)?.processed).toBe(true);
        const [source] = await messages(id);
        expect(source.attributes.flags).toContain('\\Seen');
        await mailbox(c => c.delFlags(source.attributes.uid, '\\Seen'));
        await h.service.handleInboundEmails();
        expect(h.tickets.create).toHaveBeenCalledTimes(1);
        expect(h.storage.uploadFile).toHaveBeenCalledTimes(1);
        expect((await messages(id))[0].attributes.flags).toContain('\\Seen');
    });

    it('holds a failed ticket write without acknowledging or automatically replaying source', async () => {
        const h = harness();
        const id = `<${randomUUID()}@example.invalid>`;
        ownedIds = [...ownedIds, id];
        h.tickets.create.mockRejectedValueOnce(new Error('Synthetic write failure'));
        await sendAttachment(id);
        await h.service.handleInboundEmails();
        expect(h.rows.get(id)?.processed).toBe(false);
        expect(h.rows.get(id)?.error).toContain('PROCESSING_FAILED');
        expect((await messages(id))[0].attributes.flags).not.toContain('\\Seen');
        await h.service.handleInboundEmails();
        expect(h.tickets.create).toHaveBeenCalledTimes(1);
        expect((await messages(id))[0].attributes.flags).not.toContain('\\Seen');
    });
});
