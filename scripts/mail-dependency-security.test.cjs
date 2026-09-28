const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { existsSync, readFileSync, realpathSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
const { pathToFileURL } = require('node:url');

// Explicit anchors also allow the same controls against an immutable image.
// Never fall back to packages from a different checkout.
const packageJson = process.env.ALUPLAN_MAIL_PACKAGE_JSON
    || path.resolve(__dirname, '../apps/backend/package.json');
assert.ok(path.isAbsolute(packageJson), 'ALUPLAN_MAIL_PACKAGE_JSON must be absolute');
assert.equal(path.basename(packageJson), 'package.json');
JSON.parse(readFileSync(packageJson, 'utf8'));
const backendRequire = createRequire(packageJson);
const mailparserEntry = backendRequire.resolve('mailparser');
const directEntry = backendRequire.resolve('nodemailer');
const nestedEntry = createRequire(mailparserEntry).resolve('nodemailer');
const { simpleParser } = require(mailparserEntry);
const nodemailer = require(directEntry);
const parserEntries = [
    ['direct sender', createRequire(directEntry).resolve('./addressparser')],
    ['mailparser dependency', createRequire(nestedEntry).resolve('./addressparser')],
];

function packageInfo(entry, expectedName) {
    const source = realpathSync(entry);
    for (let directory = path.dirname(source); ; directory = path.dirname(directory)) {
        const candidate = path.join(directory, 'package.json');
        if (existsSync(candidate)) {
            const metadata = JSON.parse(readFileSync(candidate, 'utf8'));
            if (metadata.name === expectedName) {
                return { name: metadata.name, version: metadata.version, source };
            }
        }
        assert.notEqual(directory, path.dirname(directory), `Cannot identify ${expectedName}`);
    }
}

test('reports actual backend send and receive dependency resolutions', (t) => {
    for (const [role, entry, name] of [
        ['sender', directEntry, 'nodemailer'],
        ['receiver', mailparserEntry, 'mailparser'],
        ['receiver address parser', nestedEntry, 'nodemailer'],
    ]) {
        const info = packageInfo(entry, name);
        assert.match(info.version, /^\d+\.\d+\.\d+/);
        t.diagnostic(JSON.stringify({ role, ...info }));
    }
});

const subject = 'Re: [SUP-00180] Ölçü güncellemesi';
const senderName = 'Çağrı Öztürk';
const plainText = 'Merhaba,\nİşlem tamamlandı. Ş, ğ, ü, ı, ö, ç.';
const html = '<p>Merhaba, <strong>ölçü güncellendi.</strong></p>';
const attachment = Buffer.from([0, 1, 127, 128, 254, 255, 13, 10]);
const encodedWord = value => `=?UTF-8?B?${Buffer.from(value).toString('base64')}?=`;

function syntheticMime() {
    return Buffer.from([
        `From: ${encodedWord(senderName)} <customer@example.test>`,
        'To: Support <support@example.test>',
        `Subject: ${encodedWord(subject)}`,
        'Message-ID: <bounded-mail-180@example.test>',
        'In-Reply-To: <bounded-original-180@example.test>',
        'References: <bounded-original-180@example.test>',
        'MIME-Version: 1.0',
        'Content-Type: multipart/mixed; boundary="bounded-mixed"', '',
        '--bounded-mixed',
        'Content-Type: multipart/alternative; boundary="bounded-alternative"', '',
        '--bounded-alternative', 'Content-Type: text/plain; charset=utf-8',
        'Content-Transfer-Encoding: base64', '', Buffer.from(plainText).toString('base64'),
        '--bounded-alternative', 'Content-Type: text/html; charset=utf-8',
        'Content-Transfer-Encoding: base64', '', Buffer.from(html).toString('base64'),
        '--bounded-alternative--',
        '--bounded-mixed', 'Content-Type: application/octet-stream; name="drawing.bin"',
        'Content-Disposition: attachment; filename="drawing.bin"',
        'Content-Transfer-Encoding: base64', '', attachment.toString('base64'),
        '--bounded-mixed--', '',
    ].join('\r\n'));
}

test('real inbound parser preserves Turkish content, threading and exact attachment bytes', { timeout: 2000 }, async () => {
    const raw = syntheticMime();
    assert.ok(raw.length < 2048, 'Keep this fixture small and synthetic');
    const parsed = await simpleParser(raw);
    assert.equal(parsed.subject, subject);
    assert.deepEqual(parsed.from.value, [{ address: 'customer@example.test', name: senderName }]);
    assert.deepEqual(parsed.to.value, [{ address: 'support@example.test', name: 'Support' }]);
    assert.equal(parsed.messageId, '<bounded-mail-180@example.test>');
    assert.equal(parsed.inReplyTo, '<bounded-original-180@example.test>');
    assert.equal(parsed.references, '<bounded-original-180@example.test>');
    assert.equal(parsed.text.trim(), plainText);
    assert.equal(parsed.html, html);
    assert.equal(parsed.attachments.length, 1);
    assert.equal(parsed.attachments[0].filename, 'drawing.bin');
    assert.equal(parsed.attachments[0].contentType, 'application/octet-stream');
    assert.deepEqual(parsed.attachments[0].content, attachment);
});

test('HTML-only mail retains readable Turkish text through html-to-text fallback', { timeout: 2000 }, async () => {
    const parsed = await simpleParser(Buffer.from([
        'From: customer@example.test', 'To: support@example.test',
        `Subject: ${encodedWord(subject)}`, 'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8', '', html,
    ].join('\r\n')));
    assert.equal(parsed.html, html);
    assert.equal(parsed.text.trim(), 'Merhaba, ölçü güncellendi.');
    assert.equal(parsed.attachments.length, 0);
});

test('dynamic import exposes simpleParser for the knowledge email-document path', { timeout: 2000 }, async () => {
    // Resolve from the backend first, not the script directory. The knowledge
    // parser uses this named dynamic-import contract; do not bootstrap it here.
    const imported = await import(pathToFileURL(mailparserEntry).href);
    assert.equal(typeof imported.simpleParser, 'function');
    const parsed = await imported.simpleParser(syntheticMime());
    assert.equal(parsed.subject, subject);
    assert.equal(parsed.text.trim(), plainText);
    assert.deepEqual(parsed.attachments[0].content, attachment);
});

for (const [role, entry] of parserEntries) {
    test(`${role} preserves valid quoted names, groups and empty address lists`, () => {
        const parse = require(entry);
        assert.deepEqual(parse(''), []);
        assert.deepEqual(parse('"Support team": "Ayşe Çelik" <ayse@example.test>, "Ali, Veli" <ali@example.test>;'), [{
            name: 'Support team',
            group: [
                { address: 'ayse@example.test', name: 'Ayşe Çelik' },
                { address: 'ali@example.test', name: 'Ali, Veli' },
            ],
        }]);
    });
}

async function compileInMemory(message) {
    // Stream transport compiles MIME only: no SMTP socket, URL or file reads.
    const transport = nodemailer.createTransport({
        streamTransport: true, buffer: true, newline: 'windows',
        disableFileAccess: true, disableUrlAccess: true,
    });
    try {
        return await transport.sendMail({
            from: { name: 'Destek Ekibi', address: 'support@example.test' },
            to: { name: senderName, address: 'customer@example.test' },
            subject, text: plainText, html,
            messageId: '<bounded-outbound-180@example.test>',
            inReplyTo: '<bounded-original-180@example.test>',
            references: '<bounded-original-180@example.test>',
            ...message,
        });
    } finally {
        transport.close();
    }
}

test('direct sender compiles ordinary mail with intact envelope, threading and attachment', { timeout: 2000 }, async () => {
    const info = await compileInMemory({
        attachments: [{ filename: 'drawing.bin', content: attachment }],
    });
    assert.deepEqual(info.envelope, { from: 'support@example.test', to: ['customer@example.test'] });
    assert.ok(Buffer.isBuffer(info.message));
    const parsed = await simpleParser(info.message);
    assert.equal(parsed.subject, subject);
    assert.equal(parsed.from.value[0].name, 'Destek Ekibi');
    assert.equal(parsed.to.value[0].name, senderName);
    assert.equal(parsed.text.trim(), plainText);
    assert.equal(parsed.html, html);
    assert.equal(parsed.inReplyTo, '<bounded-original-180@example.test>');
    assert.equal(parsed.references, '<bounded-original-180@example.test>');
    assert.equal(parsed.attachments.length, 1);
    assert.deepEqual(parsed.attachments[0].content, attachment);
});

test('subject and ordinary header CRLF content cannot add new headers or recipients', { timeout: 2000 }, async () => {
    const info = await compileInMemory({
        subject: 'Ticket update\r\nBcc: injected@example.test',
        headers: { 'X-Harness': 'normal\r\nX-Injected: true' },
    });
    assert.deepEqual(info.envelope.to, ['customer@example.test']);
    const rawHeaders = info.message.toString('utf8').split('\r\n\r\n')[0];
    assert.doesNotMatch(rawHeaders, /(?:^|\r?\n)(?:Bcc|X-Injected):/i);
    const parsed = await simpleParser(info.message);
    assert.equal(parsed.bcc, undefined);
    assert.equal(parsed.headers.has('x-injected'), false);
    assert.match(parsed.subject, /Ticket update/);
    assert.match(parsed.headers.get('x-harness'), /normal/);
});

for (const [port, secure] of [[587, false], [465, true]]) {
    test(`SMTP ${port} retains production-shaped mandatory TLS options without connecting`, () => {
        const options = {
            host: 'smtp.example.test', port, secure, requireTLS: true,
            auth: { user: 'support@example.test', pass: 'synthetic-test-password' },
            tls: { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
        };
        const transport = nodemailer.createTransport(options);
        try {
            assert.equal(transport.transporter.name, 'SMTP');
            assert.equal(transport.transporter.options.host, options.host);
            assert.equal(transport.transporter.options.port, port);
            assert.equal(transport.transporter.options.secure, secure);
            assert.equal(transport.transporter.options.requireTLS, true);
            assert.deepEqual(transport.transporter.options.tls, options.tls);
            assert.deepEqual(transport.transporter.options.auth, options.auth);
        } finally {
            // Construct/options/close only: no sendMail, verify or socket call.
            transport.close();
        }
    });
}

test('Gmail OAuth2 retains provider options without token acquisition or connecting', () => {
    const auth = {
        type: 'OAuth2', user: 'support@example.test',
        clientId: 'synthetic-client-id', clientSecret: 'synthetic-client-secret',
        refreshToken: 'synthetic-refresh-token', accessToken: 'synthetic-access-token',
    };
    const transport = nodemailer.createTransport({ service: 'gmail', auth });
    try {
        assert.equal(transport.transporter.name, 'SMTP');
        assert.equal(transport.transporter.options.host, 'smtp.gmail.com');
        assert.equal(transport.transporter.options.port, 465);
        assert.equal(transport.transporter.options.secure, true);
        assert.deepEqual(transport.transporter.options.auth, auth);
        assert.equal(transport.transporter.auth.type, 'OAUTH2');
        assert.equal(transport.transporter.auth.method, 'XOAUTH2');
        assert.equal(transport.transporter.auth.user, auth.user);
    } finally {
        transport.close();
    }
});

// GHSA-2x7j-588g-ccc2: test the demonstrated concat-copy accumulator rather
// than running a large timed DoS payload. 128 addresses are < 4 KiB. The
// isolated child counts copied array elements while preserving concat results.
// This is a bounded root-cause regression, not a general CPU/memory benchmark.
const accumulatorProbe = String.raw`
const assert = require('node:assert/strict');
const parse = require(process.argv[1]);
const count = 128;
const addresses = Array.from({ length: count }, (_, i) => 'u' + i + '@example.test');
const payload = addresses.join(',');
assert.ok(Buffer.byteLength(payload) < 4096);
const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'concat');
let copied = 0;
let result;
try {
    Object.defineProperty(Array.prototype, 'concat', {
        ...descriptor,
        value: function (...values) {
            copied += this.length;
            for (const value of values) copied += Array.isArray(value) ? value.length : 1;
            return Reflect.apply(descriptor.value, this, values);
        },
    });
    result = parse(payload);
} finally {
    Object.defineProperty(Array.prototype, 'concat', descriptor);
}
assert.deepEqual(result.map(value => value.address), addresses);
process.stdout.write(JSON.stringify({ count, copied, inputBytes: Buffer.byteLength(payload) }));
`;

for (const [role, entry] of parserEntries) {
    test(`${role} avoids quadratic accumulator copying for a tiny distinct address list`, { timeout: 4000 }, (t) => {
        const result = spawnSync(process.execPath, [
            '--max-old-space-size=256', '-e', accumulatorProbe, entry,
        ], {
            env: {}, encoding: 'utf8', timeout: 2000,
            killSignal: 'SIGKILL', maxBuffer: 64 * 1024,
        });
        assert.ifError(result.error);
        assert.equal(result.signal, null);
        assert.equal(result.status, 0, `Bounded parser child failed: ${result.stderr}`);
        const evidence = JSON.parse(result.stdout);
        t.diagnostic(JSON.stringify({ role, ...evidence }));
        assert.equal(evidence.count, 128);
        assert.ok(evidence.copied <= evidence.count * 8,
            `concat copied ${evidence.copied} elements for ${evidence.count} addresses; expected a linear budget <= ${evidence.count * 8}`);
    });
}
