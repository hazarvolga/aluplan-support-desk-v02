// Opt-in local SIGTERM acceptance. Real Nest/current inbound service; all IO is synthetic.
// Receipt ordering is NOT PostgreSQL, ticket durability, full AppModule or socket-close proof.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { createRequire } = require('node:module');
const { fork } = require('node:child_process');

const optIn = 'synthetic-local-only';
const sourceFile = path.resolve(__dirname, '../src/email/email-inbound.service.ts');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const unexpected = () => { throw new Error('Unexpected synthetic IO path'); };

async function childMain(phase) {
    assert(process.send && ['configuration', 'search'].includes(phase));
    // Bound orphan lifetime too if the parent itself disappears unexpectedly.
    setTimeout(() => process.exit(1), 18000).unref();
    const dependencyRoot = process.env.MAIL_SHUTDOWN_DEPENDENCIES || path.resolve(__dirname, '../node_modules');
    assert(path.isAbsolute(dependencyRoot), 'Dependencies must be an explicit absolute local path');
    const dependency = createRequire(path.join(dependencyRoot, '__local_rehearsal__.cjs'));
    dependency('reflect-metadata');
    const common = dependency('@nestjs/common');
    const { NestFactory } = dependency('@nestjs/core');
    const events = [];
    let release;
    let hostReads = 0;
    let connections = 0;
    const gate = new Promise(resolve => { release = resolve; });
    const send = type => process.send({ type, events: [...events], hostReads, connections });
    const hold = async () => { events.push('held'); send('ready'); await gate; };
    const connection = {
        openBox: async () => ({ uidvalidity: 1 }),
        search: async () => {
            if (phase === 'search') await hold();
            return [{ attributes: { uid: 1 }, parts: [
                { which: '', body: 'synthetic MIME' },
                { which: 'HEADER', body: { 'message-id': ['<synthetic@example.invalid>'] } },
            ] }];
        },
        addFlags: async () => { events.push('synthetic-ack'); },
        end: async () => { events.push('synthetic-cleanup'); },
    };
    const prisma = {
        inboundEmailLog: { findUnique: async () => null },
        user: { findUnique: async () => ({ id: 'synthetic-user', status: 'ACTIVE', role: { name: 'CUSTOMER' } }) },
        ticketMessage: { create: async () => { events.push('synthetic-message'); return { id: 'synthetic-message' }; } },
        onApplicationShutdown: async signal => {
            assert.equal(signal, 'SIGTERM');
            events.push('synthetic-db-shutdown');
            send('receipt');
        },
    };
    const imports = {
        '@nestjs/common': common,
        '@nestjs/schedule': dependency('@nestjs/schedule'),
        'node:crypto': require('node:crypto'),
        'imap-simple': { connect: async () => { connections++; return connection; } },
        mailparser: { simpleParser: async () => ({ from: { value: [{ address: 'sender@example.invalid' }] }, subject: 'Synthetic', text: 'Synthetic' }) },
        '@aluplan/database': { CommunicationChannel: { EMAIL: 'EMAIL' } },
        './email-bounce.util': { isDeliveryStatusNotification: () => false },
        './inbound-email-claim': {
            inboundHoldMessageId: value => value,
            claimInbound: async () => ({ kind: 'claimed' }),
            completeInbound: async () => { events.push('synthetic-completion'); return true; },
            holdInbound: unexpected, recordInboundHold: unexpected,
        },
    };
    for (const [file, name] of [
        ['../prisma/prisma.service', 'PrismaService'], ['../settings/settings.service', 'SettingsService'],
        ['../tickets/tickets.service', 'TicketsService'], ['../common/services/storage.service', 'StorageService'],
        ['../common/services/pii-masking.service', 'PiiMaskingService'],
    ]) imports[file] = { [name]: class {} };
    const code = dependency('@swc/core').transformSync(fs.readFileSync(sourceFile, 'utf8'), {
        filename: sourceFile, swcrc: false, configFile: false,
        jsc: { parser: { syntax: 'typescript', decorators: true },
            transform: { legacyDecorator: true, decoratorMetadata: true }, target: 'es2022' },
        module: { type: 'commonjs' },
    }).code;
    const exported = {};
    // Only this fixed candidate source is evaluated; no bootstrap or recursive source imports.
    new Function('require', 'exports', code)(name => {
        assert(Object.hasOwn(imports, name), `Non-allowlisted service import: ${name}`);
        return imports[name];
    }, exported);
    const service = new exported.EmailInboundService(prisma, {
        getValue: async key => {
            if (key !== 'email.imap.host') return undefined;
            hostReads++;
            if (phase === 'configuration') await hold();
            return 'imap.example.invalid';
        },
    }, { create: async () => { events.push('synthetic-ticket'); return { id: 'synthetic-ticket' }; } },
    { uploadFile: unexpected }, { maskSensitiveData: value => value });
    class RehearsalModule {}
    common.Module({ providers: [
        { provide: exported.EmailInboundService, useValue: service },
        { provide: 'synthetic-db', useValue: prisma },
        { provide: 'observer', useValue: { onModuleDestroy() { events.push('destroy-entered'); send('destroying'); } } },
    ] })(RehearsalModule);
    const app = await NestFactory.createApplicationContext(RehearsalModule, { logger: false });
    app.enableShutdownHooks(['SIGTERM']);
    process.on('message', async message => {
        try {
            if (message === 'probe') {
                assert.equal(service.stopping, true);
                const before = [hostReads, connections];
                await service.handleInboundEmails();
                assert.deepEqual([hostReads, connections], before);
                events.push('fenced'); send('fenced');
            } else if (message === 'release') { events.push('released'); release(); }
            else throw new Error('Unknown IPC command');
        } catch (error) { console.error(error); process.exitCode = 1; process.disconnect(); }
    });
    await service.handleInboundEmails();
}

async function runCase(phase) {
    const child = fork(__filename, ['--child', phase], {
        execArgv: [], stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
        // Never inherit production credentials, NODE_OPTIONS, module paths or preloads.
        env: { PATH: path.dirname(process.execPath), TMPDIR: os.tmpdir(),
            MAIL_SHUTDOWN_REHEARSAL: optIn,
            ...(process.env.MAIL_SHUTDOWN_DEPENDENCIES ? { MAIL_SHUTDOWN_DEPENDENCIES: process.env.MAIL_SHUTDOWN_DEPENDENCIES } : {}) },
    });
    const messages = [];
    let output = '';
    let exited = false;
    let childError;
    child.on('message', message => messages.push(message));
    child.stdout.on('data', chunk => { output = (output + chunk).slice(-4000); });
    child.stderr.on('data', chunk => { output = (output + chunk).slice(-4000); });
    const exit = new Promise(resolve => {
        child.once('exit', (code, signal) => { exited = true; resolve([code, signal]); });
        child.on('error', error => {
            childError = error;
            if (!child.pid) { exited = true; resolve([null, 'SPAWN_ERROR']); }
        });
    });
    const send = message => new Promise((resolve, reject) => {
        if (!child.connected || exited) return reject(new Error('Child IPC is unavailable'));
        child.send(message, error => error ? reject(error) : resolve());
    });
    const deadline = Date.now() + 12000;
    const watchdog = setTimeout(() => { if (!exited) child.kill('SIGKILL'); }, 15000);
    const wait = async type => {
        while (!messages.some(message => message.type === type)) {
            assert(!childError && !exited && Date.now() < deadline, `Child failed waiting for ${type}: ${output}`);
            await pause(10);
        }
        return messages.find(message => message.type === type);
    };
    try {
        await wait('ready');
        assert(child.kill('SIGTERM'));
        await wait('destroying');
        await send('probe');
        const fenced = await wait('fenced');
        await pause(150);
        assert(!exited, 'Child exited before held work was released');
        assert(!messages.some(message => message.type === 'receipt'), 'DB shutdown preceded release');
        assert.deepEqual(fenced.events, ['held', 'destroy-entered', 'fenced']);
        await send('release');
        const receipt = await wait('receipt');
        assert.deepEqual(await exit, [null, 'SIGTERM']);
        assert.deepEqual(receipt.events, ['held', 'destroy-entered', 'fenced', 'released',
            'synthetic-ticket', 'synthetic-message', 'synthetic-completion', 'synthetic-ack',
            'synthetic-cleanup', 'synthetic-db-shutdown']);
        assert.equal(receipt.hostReads, 1);
        assert.equal(receipt.connections, 1);
        return { phase, signal: 'SIGTERM', events: receipt.events };
    } finally {
        try {
            if (!exited) child.kill('SIGKILL');
            await exit;
        } finally { clearTimeout(watchdog); }
    }
}

async function main() {
    assert.equal(process.env.MAIL_SHUTDOWN_REHEARSAL, optIn, 'Explicit synthetic-local-only opt-in required');
    if (process.argv[2] === '--child') return childMain(process.argv[3]);
    assert.equal(process.argv.length, 2, 'No arbitrary source or executable arguments accepted');
    const receipts = [];
    for (const phase of ['configuration', 'search']) receipts.push(await runCase(phase));
    console.log(JSON.stringify({ passed: true, syntheticOnly: true, persistenceProof: false, receipts }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
