const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
const { pathToFileURL } = require('node:url');

// Resolve consumers without executing Prisma, c12 or repository configuration.
const root = createRequire(path.resolve(__dirname, '../package.json'));
const prisma = createRequire(root.resolve('prisma/package.json'));
const config = createRequire(prisma.resolve('@prisma/config'));
const entry = config.resolve('deepmerge-ts');
const { deepmerge } = config('deepmerge-ts');

test('Prisma config resolves the reviewed merge version without changing Prisma', () => {
    const metadata = JSON.parse(readFileSync(path.join(path.dirname(entry), '../package.json'), 'utf8'));
    assert.equal(metadata.version, '8.0.2');
    assert.equal(prisma('./package.json').version, '7.4.2');
});

test('config-shaped layers preserve arrays, callback identity, falsy values and input objects', () => {
    const adapter = () => 'never invoked';
    const base = { schema: 'schema.prisma', migrations: { path: 'migrations', seed: 'seed' },
        experimental: { enabled: true }, files: ['base'], adapter };
    const override = { migrations: { seed: '' }, experimental: { enabled: false }, files: ['next'], count: 0 };
    const result = deepmerge(base, override);
    assert.deepEqual(result, { schema: 'schema.prisma', migrations: { path: 'migrations', seed: '' },
        experimental: { enabled: false }, files: ['base', 'next'], adapter, count: 0 });
    assert.equal(result.adapter, adapter);
    assert.deepEqual(base.files, ['base']);
    assert.equal(base.migrations.seed, 'seed');
    assert.deepEqual(override.files, ['next']);
    assert.deepEqual(deepmerge(undefined, {}, base, undefined), base);
});

test('c12-style left-to-right and environment overlay order is preserved', () => {
    // c12 passes environment overlay before the base config. Preserve current
    // deepmerge behavior (later values win), not an invented precedence policy.
    const environment = { schema: 'env.prisma', migrations: { seed: 'env-seed' }, flag: false };
    const base = { schema: 'base.prisma', migrations: { path: 'migrations' } };
    assert.deepEqual(deepmerge(environment, base), {
        schema: 'base.prisma', migrations: { seed: 'env-seed', path: 'migrations' }, flag: false,
    });
    assert.deepEqual(deepmerge({}, undefined, { value: null }, { count: 0 }), { value: null, count: 0 });
});

test('ESM entry used by Prisma preserves the same configuration result', async () => {
    const esm = await import(pathToFileURL(path.join(path.dirname(entry), 'index.mjs')).href);
    const adapter = () => 'never invoked';
    const layers = [{ schema: 'base.prisma', adapter, files: ['base'] },
        { schema: 'next.prisma', files: ['next'], enabled: false }];
    assert.deepEqual(esm.deepmerge(...layers), deepmerge(...layers));
    assert.equal(esm.deepmerge(...layers).adapter, adapter);
});

test('two tiny cyclic graphs merge without stack exhaustion in a bounded child', () => {
    const code = `const assert = require('node:assert/strict');
        const { deepmerge } = require(process.argv[1]);
        const left = { label: 'left' }; left.self = left;
        const right = { label: 'right' }; right.self = right;
        const merged = deepmerge(left, right);
        assert.equal(merged.label, 'right');
        assert.equal(merged.self, merged);
        assert.equal(left.label, 'left');`;
    const result = spawnSync(process.execPath, ['--max-old-space-size=64', '-e', code, entry], {
        timeout: 2000, maxBuffer: 8192, encoding: 'utf8', env: {},
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);
});
