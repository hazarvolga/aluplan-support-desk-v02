const { test } = require('node:test');
const assert = require('node:assert/strict');
const { selectCandidates, hashBoundedBody, verifyGetHeaders, backendRequire } = require('./release-r2-body-canary.cjs');

test('loads runtime dependencies from the backend package', () => {
    assert.equal(typeof backendRequire()('pg').Client, 'function');
    assert.equal(typeof backendRequire()('@aws-sdk/client-s3').GetObjectCommand, 'function');
});

test('selects at most three active, listed, small attachment objects', () => {
    const listed = new Map([
        ['a', 10], ['b', 20], ['c', 30], ['d', 40],
    ]);
    const rows = [
        { url: 'missing', file_size: 10 },
        { url: 'FAILED_STORAGE_UPLOAD_x', file_size: 10 },
        { url: 'a', file_size: 11 },
        { url: 'b', file_size: 20 },
        { url: 'c', file_size: 30 },
        { url: 'd', file_size: 40 },
    ];
    assert.deepEqual(selectCandidates(rows, listed, 1024).map(x => x.url), ['b', 'c', 'd']);
});

test('hashes stream only when exact expected byte count is received', async () => {
    const result = await hashBoundedBody((async function* () {
        yield Buffer.from('ab');
        yield Buffer.from('cd');
    })(), 4, 10);
    assert.equal(result.bytes, 4);
    assert.match(result.sha256, /^[a-f0-9]{64}$/);
    await assert.rejects(hashBoundedBody((async function* () {
        yield Buffer.alloc(11);
    })(), 11, 10), /budget/);
    await assert.rejects(hashBoundedBody((async function* () {
        yield Buffer.from('a');
    })(), 2, 10), /length/);
});

test('rejects and closes changed or unbounded GET responses', () => {
    let closed = 0;
    const body = { destroy: () => { closed += 1; } };
    const head = { ETag: '"abc"', ContentLength: 4 };
    assert.throws(() => verifyGetHeaders({ Body: body, ContentLength: 4, ContentRange: 'bytes 0-3/5', ETag: '"abc"' }, head, 4));
    assert.throws(() => verifyGetHeaders({ Body: body, ContentLength: 5, ContentRange: 'bytes 0-3/4', ETag: '"abc"' }, head, 4));
    assert.throws(() => verifyGetHeaders({ Body: body, ContentLength: 4, ContentRange: 'bytes 0-3/4', ETag: '"changed"' }, head, 4));
    assert.equal(closed, 3);
    assert.doesNotThrow(() => verifyGetHeaders({ Body: body, ContentLength: 4, ContentRange: 'bytes 0-3/4', ETag: '"abc"' }, head, 4));
});
