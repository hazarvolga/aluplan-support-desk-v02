const assert = require('node:assert/strict');
const test = require('node:test');

const {
    validateInventory,
    encodeCopySource,
    classifyDestination,
    requireAbsentDestination,
    selectActiveAttachments,
} = require('./release-r2-temporary-backup.cjs');

const LIMITS = Object.freeze({
    maxObjects: 1000,
    maxTotalBytes: 80e9,
    maxObjectBytes: 1e9,
});

function object(Key, Size = 10, ETag = '"0123456789abcdef0123456789abcdef"') {
    return { Key, Size, ETag };
}

test('validateInventory returns keyed inventories and total source bytes', () => {
    const source = [object('one', 10), object('nested/two', 20)];
    const destination = [object('one', 10)];

    const result = validateInventory(source, destination, LIMITS);

    assert.ok(result.source instanceof Map);
    assert.ok(result.destination instanceof Map);
    assert.deepEqual(result.source.get('nested/two'), {
        key: 'nested/two', size: 20, etag: source[1].ETag,
    });
    assert.deepEqual(result.destination.get('one'), {
        key: 'one', size: 10, etag: destination[0].ETag,
    });
    assert.equal(result.totalBytes, 30);
});

test('validateInventory accepts exact object and byte boundaries', () => {
    const rows = Array.from({ length: 1000 }, (_, index) => object(`key-${index}`, 80e6));

    const result = validateInventory(rows, [], LIMITS);

    assert.equal(result.source.size, 1000);
    assert.equal(result.totalBytes, 80e9);
});

test('validateInventory refuses an empty source inventory', () => {
    assert.throws(() => validateInventory([], [], LIMITS), /empty|source/i);
});

test('validateInventory rejects duplicate source or destination keys', () => {
    assert.throws(() => validateInventory([object('same'), object('same')], [], LIMITS), /duplicate/i);
    assert.throws(() => validateInventory([object('same')], [object('same'), object('same')], LIMITS));
});

test('validateInventory rejects missing keys, invalid sizes and invalid ETags', () => {
    for (const row of [
        { Size: 1, ETag: '"0123456789abcdef0123456789abcdef"' },
        object('negative', -1),
        object('fractional', 1.5),
        object('infinite', Infinity),
        object('no-etag', 1, ''),
        object('unquoted-etag', 1, '0123456789abcdef0123456789abcdef'),
    ]) {
        assert.throws(() => validateInventory([row], [], LIMITS));
    }
});

test('validateInventory rejects object count, per-object and aggregate byte overruns', () => {
    const tooMany = Array.from({ length: 1001 }, (_, index) => object(`key-${index}`, 1));
    assert.throws(() => validateInventory(tooMany, [], LIMITS), /budget|limit|count|objects/i);
    assert.throws(() => validateInventory([object('large', 1e9 + 1)], [], LIMITS), /invalid|limit|size|bytes/i);

    const tooLargeTogether = Array.from({ length: 81 }, (_, index) => object(`key-${index}`, 1e9));
    assert.throws(() => validateInventory(tooLargeTogether, [], LIMITS), /budget|limit|total|bytes/i);
});

test('validateInventory refuses foreign objects already present in destination', () => {
    assert.throws(
        () => validateInventory([object('expected')], [object('unexpected')], LIMITS),
        /destination|unexpected|foreign|scope/i,
    );
});

test('encodeCopySource percent-encodes each key segment without changing path separators', () => {
    assert.equal(
        encodeCopySource('aluplan-support-desk', 'tickets/a b/ü+%#?.pdf'),
        '/aluplan-support-desk/tickets/a%20b/%C3%BC%2B%25%23%3F.pdf',
    );
    assert.equal(encodeCopySource('aluplan-support-desk', 'plain.txt'), '/aluplan-support-desk/plain.txt');
    assert.throws(() => encodeCopySource('invalid/bucket', 'plain.txt'), /invalid/i);
    assert.throws(() => encodeCopySource('aluplan-support-desk', ''), /invalid/i);
});

test('classifyDestination copies only absent keys and skips exact metadata matches', () => {
    const source = validateInventory([object('same', 123)], [], LIMITS).source.get('same');
    const destination = validateInventory([object('same', 123)], [object('same', 123)], LIMITS).destination.get('same');

    assert.equal(classifyDestination(source, undefined), 'COPY');
    assert.equal(classifyDestination(source, destination), 'SKIP');
});

test('classifyDestination hashes same-size ETag differences and rejects wrong sizes', () => {
    const source = validateInventory([object('same', 123)], [], LIMITS).source.get('same');
    const sizeMismatch = { ...source, size: 124 };
    const etagMismatch = { ...source, etag: '"fedcba9876543210fedcba9876543210"' };

    assert.throws(() => classifyDestination(source, sizeMismatch), /mismatch|match|refus|conflict/i);
    assert.equal(classifyDestination(source, etagMismatch), 'VERIFY');
});

test('copy command adds the R2 destination-absent precondition', async () => {
    let middleware;
    let registration;
    const command = { middlewareStack: { add(fn, options) { middleware = fn; registration = options; } } };
    assert.equal(requireAbsentDestination(command), command);
    assert.deepEqual(registration, { step: 'build', name: 'r2DestinationMustBeAbsent' });
    const headers = await middleware(async args => args.request.headers)({ request: { headers: {} } });
    assert.equal(headers['cf-copy-destination-if-none-match'], '*');
});

test('active attachment verification selects only real unique objects and counts markers', () => {
    const source = validateInventory([object('tickets/one', 12)], [], LIMITS).source;
    const destination = validateInventory([object('tickets/one', 12)], [object('tickets/one', 12)], LIMITS).destination;
    const result = selectActiveAttachments([
        { url: 'tickets/one', file_size: 12 },
        { url: 'tickets/one', file_size: 12 },
        { url: 'FAILED_STORAGE_UPLOAD_old', file_size: 7, created_at: new Date('2026-04-21T12:00:00Z') },
    ], source, destination);
    assert.equal(result.selected.size, 1);
    assert.equal(result.totalBytes, 12);
    assert.equal(result.historicalMarkers, 1);
});

test('active attachment verification refuses missing or wrong-sized backup objects', () => {
    const source = validateInventory([object('tickets/one', 12)], [], LIMITS).source;
    const destination = validateInventory([object('tickets/one', 12)], [object('tickets/one', 12)], LIMITS).destination;
    assert.throws(() => selectActiveAttachments([{ url: 'tickets/one', file_size: 12 }], source, new Map()));
    assert.throws(() => selectActiveAttachments([{ url: 'tickets/one', file_size: 13 }], source, destination));
});

test('active attachment verification refuses new failed-upload markers', () => {
    const source = validateInventory([object('tickets/one', 12)], [], LIMITS).source;
    const destination = validateInventory([object('tickets/one', 12)], [object('tickets/one', 12)], LIMITS).destination;
    assert.throws(() => selectActiveAttachments([
        { url: 'tickets/one', file_size: 12 },
        { url: 'FAILED_STORAGE_UPLOAD_new', file_size: 7, created_at: new Date('2026-09-27T00:00:00Z') },
    ], source, destination), /marker/i);
});
