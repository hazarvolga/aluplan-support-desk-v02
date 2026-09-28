// Executed through stdin inside the frozen backend image against synthetic DMS only.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const imaps = require('imap-simple');
const nodemailer = require('nodemailer');
const { SmtpProvider } = require('./dist/email/smtp.provider.js');
const { EmailInboundService } = require('./dist/email/email-inbound.service.js');

const account = 'rehearsal@example.invalid';
const password = 'SyntheticRehearsalOnly';
const bytes = Buffer.from([0, 1, 127, 128, 255, 10, 13]);
const values = {
    'email.smtp.host': 'localhost', 'email.smtp.port': '587', 'email.smtp.secure': 'false',
    'email.smtp.user': account, 'email.smtp.pass': password,
    'email.imap.host': 'localhost', 'email.imap.port': '993', 'email.imap.tls': 'true',
    'email.imap.user': account, 'email.imap.pass': password,
};

function fixture() {
    const rows = new Map();
    const calls = { ticket: 0, upload: 0, attachment: 0, bytes: [] };
    const prisma = {
        inboundEmailLog: {
            async create({ data }) {
                if (rows.has(data.messageId)) throw Object.assign(new Error('Unique conflict'), { code: 'P2002' });
                const row = { id: randomUUID(), ...data };
                rows.set(data.messageId, row);
                return row;
            },
            async findUnique({ where }) { return rows.get(where.messageId) ?? null; },
            async updateMany({ where, data }) {
                const row = [...rows.values()].find(item => Object.entries(where).every(([key, value]) => item[key] === value));
                if (!row) return { count: 0 };
                rows.set(row.messageId, { ...row, ...data });
                return { count: 1 };
            },
        },
        user: { async findUnique() { return { id: 'synthetic-user', status: 'ACTIVE', role: { name: 'CUSTOMER' } }; } },
        ticketMessage: { async create() { return { id: 'synthetic-message' }; } },
        attachment: { async create() { calls.attachment++; return { id: 'synthetic-attachment' }; } },
    };
    const settings = { async getValue(key) { return values[key]; } };
    const tickets = { async create() { calls.ticket++; return { id: 'synthetic-ticket' }; } };
    const storage = { async uploadFile(file) {
        calls.upload++;
        calls.bytes.push(file.buffer);
        return 'synthetic-object';
    } };
    const inbound = new EmailInboundService(prisma, settings, tickets, storage, { maskSensitiveData: text => text });
    return { rows, calls, tickets, inbound, smtp: new SmtpProvider(settings) };
}

async function mailbox(action) {
    const connection = await imaps.connect({ imap: {
        host: 'localhost', port: 993, user: account, password, tls: true, authTimeout: 8000,
        tlsOptions: { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
    } });
    try { await connection.openBox('INBOX'); return await action(connection); }
    finally { await connection.end(); }
}

const find = id => mailbox(connection => connection.search([['HEADER', 'MESSAGE-ID', id]], { bodies: ['HEADER'], markSeen: false }));

async function send(id) {
    const transport = nodemailer.createTransport({
        host: 'localhost', port: 587, secure: false, requireTLS: true,
        auth: { user: account, pass: password },
        tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
    });
    try {
        await transport.sendMail({ from: account, to: account, messageId: id, subject: 'Synthetic intake',
            text: 'Synthetic body', attachments: [{ filename: 'probe.bin', content: bytes }] });
    } finally { transport.close(); }
    for (let attempt = 0; attempt < 20; attempt++) {
        if ((await find(id)).length) return;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('Synthetic delivery timeout');
}

(async () => {
    assert.equal(process.env.NODE_EXTRA_CA_CERTS, '/fixture-ca.pem');
    assert.equal((await mailbox(c => c.search(['ALL'], { bodies: ['HEADER'], markSeen: false }))).length, 0);
    const h = fixture();
    assert.equal(await h.smtp.healthCheck(), true);
    assert.equal((await h.inbound.verifyImap()).available, true);
    const providerSent = await h.smtp.send({ from: account, to: account, subject: 'Synthetic provider', text: 'Synthetic' });
    assert(providerSent.messageId);
    let providerDelivered = false;
    for (let attempt = 0; attempt < 20; attempt++) {
        const found = await find(providerSent.messageId);
        if (found.length === 1) {
            await mailbox(c => c.addFlags(found[0].attributes.uid, '\\Seen'));
            providerDelivered = true;
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert(providerDelivered, 'Compiled provider message was not delivered');

    const id = `<${randomUUID()}@example.invalid>`;
    await send(id);
    await h.inbound.handleInboundEmails();
    assert.equal(h.calls.ticket, 1);
    assert.equal(h.calls.upload, 1);
    assert.equal(h.calls.attachment, 1);
    assert.deepEqual(h.calls.bytes[0], bytes);
    assert.equal(h.rows.get(id)?.processed, true);
    const [source] = await find(id);
    assert(source.attributes.flags.includes('\\Seen'));
    await mailbox(c => c.delFlags(source.attributes.uid, '\\Seen'));
    await h.inbound.handleInboundEmails();
    assert.equal(h.calls.ticket, 1);
    assert.equal(h.calls.upload, 1);
    assert((await find(id))[0].attributes.flags.includes('\\Seen'));

    const failed = `<${randomUUID()}@example.invalid>`;
    h.tickets.create = async () => { h.calls.ticket++; throw new Error('Synthetic write failure'); };
    await send(failed);
    await h.inbound.handleInboundEmails();
    assert.equal(h.rows.get(failed)?.processed, false);
    assert.match(h.rows.get(failed)?.error ?? '', /PROCESSING_FAILED/);
    assert(!(await find(failed))[0].attributes.flags.includes('\\Seen'));
    await h.inbound.handleInboundEmails();
    assert.equal(h.calls.ticket, 2);
    assert(!(await find(failed))[0].attributes.flags.includes('\\Seen'));
    console.log(JSON.stringify({ compiledServices: true, trustedTls: true, attachmentParity: true,
        inMemoryDedup: true, failedSourceHeldUnread: true }));
})().catch(error => { console.error(`${error.name}: ${error.message}`); process.exitCode = 1; });
