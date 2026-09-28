const assert = require('node:assert/strict');
const { AsyncLocalStorage } = require('node:async_hooks');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// Resolve Prisma's consumer edge without executing Prisma/config files or loading .env.
const root = createRequire(path.resolve(__dirname, '../package.json'));
const prisma = createRequire(root.resolve('prisma/package.json'));
const config = createRequire(prisma.resolve('@prisma/config'));
const { Schema, Either } = config('effect');
const { pipe } = config('effect/Function');
// Representative Schema/Either operations used by @prisma/config, not its complete contract.
const shape = Schema.Struct({
    schema: Schema.optional(Schema.String),
    datasource: Schema.optional(Schema.Struct({ url: Schema.optional(Schema.String) })),
    migrations: Schema.optional(Schema.Struct({ seed: Schema.optional(Schema.NonEmptyString) })),
    experimental: Schema.optional(Schema.Struct({ externalTables: Schema.optional(Schema.Boolean) })),
    tables: Schema.optional(Schema.Struct({
        external: Schema.optional(Schema.mutable(Schema.Array(Schema.String))),
    })),
    loadedFromFile: Schema.NullOr(Schema.String),
});
const decode = (input) => Schema.decodeUnknownEither(shape)(input, { onExcessProperty: 'error' });

test('Prisma config resolves reviewed Effect 3.20.0 without changing Prisma', () => {
    assert.equal(config('effect/package.json').version, '3.20.0');
    assert.equal(prisma('./package.json').version, '7.4.2');
});

test('config-shaped Schema decoding preserves optional fields and input', () => {
    const input = { schema: 'prisma/schema.prisma', datasource: { url: 'fixture-only' },
        migrations: { seed: 'fixture-only' }, experimental: { externalTables: true },
        tables: { external: ['Çağrı'] }, loadedFromFile: null };
    const before = structuredClone(input);
    const result = decode(input);
    assert.equal(Either.isRight(result), true);
    assert.deepEqual(result.right, before);
    assert.deepEqual(input, before);
    assert.deepEqual(decode({ loadedFromFile: null }).right, { loadedFromFile: null });
    assert.deepEqual(decode({ loadedFromFile: 'fixture.ts' }).right, { loadedFromFile: 'fixture.ts' });
});

test('config-shaped Schema rejects excess fields, invalid types and empty seed', () => {
    for (const input of [
        { loadedFromFile: null, unexpected: true },
        { loadedFromFile: null, datasource: { url: 42 } },
        { loadedFromFile: null, migrations: { seed: '' } },
        { loadedFromFile: null, tables: { external: [42] } },
    ]) assert.equal(Either.isLeft(decode(input)), true);
});

test('pipe and Either preserve feature-gate failure propagation', () => {
    const validate = (value) => value.tables?.external && !value.experimental?.externalTables
        ? Either.left(new Error('fixture gate')) : Either.right(value);
    const rejected = pipe(decode({ loadedFromFile: null, tables: { external: ['fixture'] } }),
        Either.flatMap(validate), Either.map(() => 'accepted'));
    assert.equal(Either.isLeft(rejected), true);
    assert.equal(rejected.left.message, 'fixture gate');
    assert.equal(pipe(decode({ loadedFromFile: null }), Either.flatMap(validate),
        Either.map(() => 'accepted')).right, 'accepted');
});

test('two yielded fibers preserve separate async contexts', { timeout: 2000 }, async () => {
    // Synthetic library regression only: no RPC server, auth provider or real requests.
    const { Effect } = config('effect');
    const storage = new AsyncLocalStorage();
    try {
        const observed = await Promise.all(['alpha', 'beta'].map((id) => storage.run(id,
            () => Effect.runPromise(Effect.gen(function* () {
                yield* Effect.yieldNow();
                return storage.getStore();
            })))));
        assert.deepEqual(observed, ['alpha', 'beta']);
        assert.equal(storage.getStore(), undefined);
    } finally {
        storage.disable();
    }
});
