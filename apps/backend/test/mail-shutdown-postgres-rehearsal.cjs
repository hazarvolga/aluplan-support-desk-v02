// Opt-in synthetic PostgreSQL + real domain/storage graceful SIGTERM/re-entry proof.
// Not AppModule, real IMAP transport, hard-crash recovery, or version rollback proof.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createRequire } = require('node:module');
const { fork } = require('node:child_process');
const { randomUUID, createHash } = require('node:crypto');

const optIn = 'synthetic-local-only';
const sourceRoot = path.resolve(__dirname, '../src');
const bytes = Buffer.from('Synthetic SIGTERM attachment bytes only\n');
const email = 'synthetic-sigterm@example.invalid';
const subject = 'Synthetic SIGTERM persisted ticket';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const unexpected = () => { throw new Error('Unexpected external IO path'); };
function dependencies() {
    const root = process.env.MAIL_SHUTDOWN_DEPENDENCIES || path.resolve(__dirname, '../node_modules');
    assert(path.isAbsolute(root), 'Dependency root must be absolute');
    return createRequire(path.join(root, '__synthetic_postgres__.cjs'));
}
function database(dependency) {
    const { PrismaClient } = dependency('@aluplan/database');
    const { PrismaPg } = dependency('@prisma/adapter-pg');
    return new PrismaClient({ adapter: new PrismaPg({
        host: '127.0.0.1', port: 15432, database: 'domain_test', user: 'domain_test',
        password: 'SyntheticDomainOnly-20260923', ssl: false, max: 2,
        connectionTimeoutMillis: 5000, options: '-c statement_timeout=10000 -c lock_timeout=8000',
    }) });
}
async function identity(db) {
    const rows = await db.$queryRaw`SELECT current_database() AS db, current_user AS role,
        current_setting('server_version') AS version`;
    assert.equal(rows[0].db, 'domain_test');
    assert.equal(rows[0].role, 'domain_test');
    assert.match(rows[0].version, /^17\./);
}
function sourceLoader(dependency, imap) {
    dependency('reflect-metadata');
    const sourceFiles = new Set([
        'email/email-inbound.service.ts', 'email/inbound-email-claim.ts', 'email/email-bounce.util.ts',
        'tickets/tickets.service.ts', 'tickets/dto/add-message.dto.ts',
        'common/services/storage.service.ts', 'common/services/pii-masking.service.ts',
        'common/services/ticket-access.service.ts', 'common/utils/storage-path.util.ts',
        'common/utils/rich-text-sanitizer.ts',
    ].map(file => path.join(sourceRoot, file)));
    const stubs = new Map([
        ['prisma/prisma.service.ts', 'PrismaService'], ['settings/settings.service.ts', 'SettingsService'],
        ['tickets/sla.service.ts', 'SlaService'], ['redis/redis.service.ts', 'RedisService'],
        ['ai/ai-query.service.ts', 'AiQueryService'],
    ].map(([file, name]) => [path.join(sourceRoot, file), { [name]: class {} }]));
    const packages = new Set(['@nestjs/common', '@nestjs/schedule', '@nestjs/config',
        '@nestjs/event-emitter', '@nestjs/swagger', '@aluplan/database', 'class-validator',
        'fs-extra', 'sanitize-filename', 'cheerio']);
    const builtins = new Set(['node:crypto', 'node:fs', 'node:fs/promises', 'node:path', 'path']);
    const cache = new Map();
    const load = file => {
        assert(sourceFiles.has(file), `Non-allowlisted source: ${file}`);
        if (cache.has(file)) return cache.get(file);
        const output = {};
        cache.set(file, output);
        const code = dependency('@swc/core').transformSync(fs.readFileSync(file, 'utf8'), {
            filename: file, swcrc: false, configFile: false,
            jsc: { parser: { syntax: 'typescript', decorators: true }, target: 'es2022',
                transform: { legacyDecorator: true, decoratorMetadata: true } },
            module: { type: 'commonjs' },
        }).code;
        new Function('require', 'exports', code)(name => {
            if (name === 'imap-simple') return imap;
            if (name === 'mailparser') return { simpleParser: async () => ({
                from: { value: [{ address: email }] }, subject, text: 'Synthetic customer message',
                attachments: [{ filename: 'proof.txt', content: bytes, contentType: 'text/plain', size: bytes.length }],
            }) };
            if (name === '@aws-sdk/client-s3') return new Proxy({}, { get: () => unexpected });
            if (name === '@aws-sdk/s3-request-presigner') return { getSignedUrl: unexpected };
            if (packages.has(name)) return dependency(name);
            if (builtins.has(name)) return require(name);
            assert(name.startsWith('.'), `Non-allowlisted import: ${name}`);
            const resolved = path.resolve(path.dirname(file), `${name}.ts`);
            return stubs.get(resolved) || load(resolved);
        }, output);
        return output;
    };
    return relative => load(path.join(sourceRoot, relative));
}
async function snapshot(db, directory, messageId) {
    const tickets = await db.ticket.findMany();
    const messages = await db.ticketMessage.findMany();
    const attachments = await db.attachment.findMany();
    const logs = await db.inboundEmailLog.findMany();
    assert.equal(tickets.length, 1);
    assert.equal(messages.length, 1);
    assert.equal(attachments.length, 1);
    assert.equal(logs.length, 1);
    assert.equal(tickets[0].subject, subject);
    assert.equal(messages[0].ticketId, tickets[0].id);
    assert.equal(attachments[0].messageId, messages[0].id);
    assert.equal(logs[0].messageId, messageId);
    assert.equal(logs[0].processed, true);
    assert.equal(logs[0].ticketId, tickets[0].id);
    assert.match(logs[0].error, /^INBOUND_DONE_V1:/);
    const key = attachments[0].url;
    const file = path.resolve(directory, key);
    assert(file.startsWith(directory + path.sep), 'Storage key escaped owned directory');
    assert.equal(fs.realpathSync(file), file);
    const actual = fs.readFileSync(file);
    assert.deepEqual(actual, bytes);
    const storedFiles = fs.readdirSync(directory, { recursive: true, withFileTypes: true })
        .filter(entry => !entry.isDirectory())
        .map(entry => path.relative(directory, path.join(entry.parentPath || entry.path, entry.name)))
        .sort();
    assert.deepEqual(storedFiles, [key], 'Owned storage contains unexpected or orphan attachment files');
    return { ticketId: tickets[0].id, messageId: messages[0].id, attachmentId: attachments[0].id,
        logId: logs[0].id, key, sha256: createHash('sha256').update(actual).digest('hex') };
}
async function childMain(phase) {
    assert(process.send && ['drain', 'reentry'].includes(phase));
    setTimeout(() => process.exit(1), 25000).unref();
    const dependency = dependencies();
    const db = database(dependency);
    await identity(db);
    const directory = fs.realpathSync(process.env.MAIL_SHUTDOWN_STORAGE);
    assert(path.dirname(directory) === fs.realpathSync(os.tmpdir()));
    assert(path.basename(directory).startsWith('aluplan-sigterm-pg-'));
    const messageId = process.env.MAIL_SHUTDOWN_MESSAGE;
    assert.match(messageId, /^<synthetic-[a-f0-9-]+@example\.invalid>$/);
    const events = [];
    const send = type => process.send({ type, events: [...events] });
    let release;
    let connections = 0;
    const gate = new Promise(resolve => { release = resolve; });
    const connection = {
        openBox: async () => ({ uidvalidity: 1 }),
        search: async () => [{ attributes: { uid: 1 }, parts: [
            { which: '', body: 'Synthetic MIME fixture' },
            { which: 'HEADER', body: { 'message-id': [messageId] } },
        ] }],
        addFlags: async () => { await snapshot(db, directory, messageId); events.push('ack-after-durable-domain'); },
        end: async () => { events.push('imap-cleanup'); },
    };
    const load = sourceLoader(dependency, { connect: async () => { connections++; return connection; } });
    const { TicketsService } = load('tickets/tickets.service.ts');
    const { StorageService } = load('common/services/storage.service.ts');
    const { TicketAccessService } = load('common/services/ticket-access.service.ts');
    const { PiiMaskingService } = load('common/services/pii-masking.service.ts');
    const { EmailInboundService } = load('email/email-inbound.service.ts');
    const pii = new PiiMaskingService();
    const tickets = new TicketsService(db, {
        calculateDeadlines: async () => ({ slaResponseDue: new Date(), slaResolveDue: new Date() }),
    }, pii, new (dependency('@nestjs/event-emitter').EventEmitter2)(), {}, {}, new TicketAccessService(db));
    const storage = new StorageService({ get: () => ({ type: 'LOCAL', localPath: directory }) }, {});
    if (phase === 'drain') {
        const upload = storage.uploadFile.bind(storage);
        storage.uploadFile = async (...args) => {
            assert.equal(await db.ticket.count(), 1);
            assert.equal(await db.ticketMessage.count(), 1);
            assert.equal(await db.attachment.count(), 0);
            assert.equal((await db.inboundEmailLog.findUniqueOrThrow({ where: { messageId } })).processed, false);
            events.push('domain-committed-upload-held'); send('ready');
            await gate;
            const key = await upload(...args);
            events.push('attachment-bytes-written');
            return key;
        };
    }
    const service = new EmailInboundService(db, {
        getValue: async key => key === 'email.imap.host' ? 'imap.example.invalid' : undefined,
    }, tickets, storage, pii);
    const common = dependency('@nestjs/common');
    class RehearsalModule {}
    common.Module({ providers: [
        { provide: EmailInboundService, useValue: service },
        { provide: 'owned-db-lifecycle', useValue: { async onApplicationShutdown() {
            await snapshot(db, directory, messageId);
            events.push('durability-verified'); await db.$disconnect();
            events.push('db-disconnected'); send('receipt');
        } } },
        { provide: 'observer', useValue: { onModuleDestroy() { events.push('destroy-entered'); send('destroying'); } } },
    ] })(RehearsalModule);
    const app = await dependency('@nestjs/core').NestFactory.createApplicationContext(RehearsalModule, { logger: false });
    app.enableShutdownHooks(['SIGTERM']);
    process.on('message', async command => {
        try {
            if (command === 'probe') {
                assert.equal(service.stopping, true);
                const before = connections;
                await service.handleInboundEmails();
                assert.equal(connections, before);
                await identity(db);
                events.push('intake-fenced-db-alive'); send('fenced');
            } else if (command === 'release') { events.push('released'); release(); }
            else throw new Error('Unknown IPC command');
        } catch (error) { console.error(error); process.exit(1); }
    });
    await service.handleInboundEmails();
    if (phase === 'reentry') { events.push('reentry-completed'); send('ready'); }
}
async function runChild(phase, directory, messageId) {
    const child = fork(__filename, ['--child', phase], {
        execArgv: ['--max-old-space-size=256'], stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        env: { PATH: path.dirname(process.execPath), TMPDIR: os.tmpdir(),
            MAIL_SHUTDOWN_POSTGRES: optIn, MAIL_SHUTDOWN_STORAGE: directory, MAIL_SHUTDOWN_MESSAGE: messageId,
            ...(process.env.MAIL_SHUTDOWN_DEPENDENCIES ? { MAIL_SHUTDOWN_DEPENDENCIES: process.env.MAIL_SHUTDOWN_DEPENDENCIES } : {}) },
    });
    const messages = [];
    let output = '', exited = false;
    child.on('message', message => messages.push(message));
    child.stdout.on('data', chunk => { output = (output + chunk).slice(-5000); });
    child.stderr.on('data', chunk => { output = (output + chunk).slice(-5000); });
    const exit = new Promise(resolve => {
        child.once('exit', (code, signal) => { exited = true; resolve([code, signal]); });
        child.once('error', error => { output += error.message; if (!child.pid) { exited = true; resolve([1, null]); } });
    });
    const deadline = Date.now() + 20000;
    const watchdog = setTimeout(() => { if (!exited) child.kill('SIGKILL'); }, 23000);
    const wait = async type => {
        while (!messages.some(message => message.type === type)) {
            assert(!exited && Date.now() < deadline, `Child ${phase} failed waiting for ${type}: ${output}`);
            await pause(10);
        }
        return messages.find(message => message.type === type);
    };
    const send = command => new Promise((resolve, reject) => child.send(command, error => error ? reject(error) : resolve()));
    try {
        await wait('ready');
        assert(child.kill('SIGTERM'));
        await wait('destroying');
        if (phase === 'drain') {
            await send('probe'); await wait('fenced'); await pause(150);
            assert(!exited && !messages.some(message => message.type === 'receipt'), 'Shutdown skipped active drain');
            await send('release');
        }
        const receipt = await wait('receipt');
        assert.deepEqual(await exit, [null, 'SIGTERM']);
        assert.deepEqual(receipt.events, phase === 'drain'
            ? ['domain-committed-upload-held', 'destroy-entered', 'intake-fenced-db-alive', 'released',
                'attachment-bytes-written', 'ack-after-durable-domain', 'imap-cleanup', 'durability-verified', 'db-disconnected']
            : ['ack-after-durable-domain', 'imap-cleanup', 'reentry-completed', 'destroy-entered', 'durability-verified', 'db-disconnected']);
        return { phase, signal: 'SIGTERM', events: receipt.events };
    } finally {
        if (!exited) child.kill('SIGKILL');
        await exit; clearTimeout(watchdog);
    }
}
async function main() {
    assert.equal(process.env.MAIL_SHUTDOWN_POSTGRES, optIn, 'Explicit synthetic-local-only opt-in required');
    if (process.argv[2] === '--child') return childMain(process.argv[3]);
    assert.equal(process.argv.length, 2, 'No arbitrary arguments accepted');
    const db = database(dependencies());
    let directory, role, user, result;
    const messageId = `<synthetic-${randomUUID()}@example.invalid>`;
    try {
        await identity(db);
        for (const model of ['user', 'role', 'ticket', 'ticketMessage', 'attachment', 'inboundEmailLog']) {
            assert.equal(await db[model].count(), 0, `Synthetic database must initially have no ${model} rows`);
        }
        directory = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'aluplan-sigterm-pg-')));
        role = await db.role.create({ data: { name: 'CUSTOMER' } });
        user = await db.user.create({ data: { email, fullName: 'Synthetic SIGTERM Customer',
            passwordHash: 'not-a-login-hash', roleId: role.id, status: 'ACTIVE' } });
        const drain = await runChild('drain', directory, messageId);
        const before = await snapshot(db, directory, messageId);
        const reentry = await runChild('reentry', directory, messageId);
        assert.deepEqual(await snapshot(db, directory, messageId), before);
        result = { passed: true, syntheticOnly: true, postgresMajor: 17,
            gracefulReentry: true, realImap: false, fullAppModule: false, versionRollback: false,
            counts: { tickets: 1, messages: 1, attachments: 1, completedClaims: 1 },
            attachmentSha256: before.sha256, receipts: [drain, reentry] };
    } finally {
        // Exact rows owned by this run only. No truncation, migration or table-wide cleanup.
        try {
            if (user) {
                const owned = await db.ticket.findMany({ where: { userId: user.id }, select: { id: true } });
                const ids = owned.map(ticket => ticket.id);
                await db.attachment.deleteMany({ where: { message: { ticketId: { in: ids } } } });
                await db.inboundEmailLog.deleteMany({ where: { messageId } });
                await db.ticketMessage.deleteMany({ where: { ticketId: { in: ids } } });
                await db.ticket.deleteMany({ where: { id: { in: ids } } });
                await db.user.delete({ where: { id: user.id } });
            }
            if (role) await db.role.delete({ where: { id: role.id } });
        } finally {
            try { await db.$disconnect(); }
            finally { if (directory) fs.rmSync(directory, { recursive: true, force: true }); }
        }
    }
    console.log(JSON.stringify(result));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
