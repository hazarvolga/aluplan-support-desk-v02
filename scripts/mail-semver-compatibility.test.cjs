const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// Resolve the actual receive dependency chain, not a root-hoisted semver.
// Only utf7 and semver are imported; no IMAP client or connection is created.
const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const imapSimple = createRequire(backend.resolve('imap-simple'));
const imap = createRequire(imapSimple.resolve('imap'));
const utf7Require = createRequire(imap.resolve('utf7'));
const utf7 = imap('utf7');
const semver = utf7Require('semver');

test('backend imap-simple -> imap -> utf7 resolves the reviewed semver release', (t) => {
    t.diagnostic(JSON.stringify({
        imapSimple: backend.resolve('imap-simple'),
        imap: imapSimple.resolve('imap'),
        utf7: imap.resolve('utf7'),
        semver: utf7Require.resolve('semver'),
    }));
    assert.equal(utf7Require('semver/package.json').version, '5.7.2');
});

test('utf7 Node Buffer branch keeps v-prefixed Node 22 and current-runtime comparisons', () => {
    for (const version of ['v22.0.0', 'v22.22.0', process.version]) {
        assert.equal(semver.gte(version, '6.0.0'), true, version);
    }
    assert.equal(semver.gte('v6.0.0', '6.0.0'), true);
    assert.equal(semver.gte('v5.12.0', '6.0.0'), false);
});

test('modified UTF-7 preserves fixed ASCII, ampersand and RFC mailbox fixtures', () => {
    const fixtures = [
        ['', ''],
        ['INBOX/Support 2026', 'INBOX/Support 2026'],
        ['A&B', 'A&-B'],
        ['~peter/mail/台北/日本語', '~peter/mail/&U,BTFw-/&ZeVnLIqe-'],
    ];
    for (const [plain, encoded] of fixtures) {
        assert.equal(utf7.imap.encode(plain), encoded);
        assert.equal(utf7.imap.decode(encoded), plain);
    }
});

test('modified UTF-7 round-trips bounded Turkish mailbox names and ASCII path segments', () => {
    for (const mailbox of ['INBOX/Çağrı/İşler/Ölçü & Çizim', 'Archive/ŞĞÜİÖÇ/şğıöçü/2026']) {
        const encoded = utf7.imap.encode(mailbox);
        assert.match(encoded, /^[\x20-\x7e]+$/);
        assert.equal(encoded.split('/')[0], mailbox.split('/')[0]);
        assert.equal(utf7.imap.decode(encoded), mailbox);
    }
});
