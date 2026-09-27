const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// Resolve actual consumer edges without importing Prisma, config loaders or CLIs.
const root = createRequire(path.resolve(__dirname, '../package.json'));
const prisma = createRequire(root.resolve('prisma/package.json'));
const config = createRequire(prisma.resolve('@prisma/config'));
const c12 = createRequire(config.resolve('c12'));
const consumers = [
    ['Prisma config -> c12', c12],
    ['Prisma config -> c12 -> giget', createRequire(c12.resolve('giget'))],
    ['Prisma config -> c12 -> rc9', createRequire(c12.resolve('rc9'))],
];

function resolvedVersion(consumer) {
    let directory = path.dirname(consumer.resolve('defu'));
    while (directory !== path.dirname(directory)) {
        const manifest = path.join(directory, 'package.json');
        if (existsSync(manifest)) {
            const metadata = JSON.parse(readFileSync(manifest, 'utf8'));
            if (metadata.name === 'defu') return metadata.version;
        }
        directory = path.dirname(directory);
    }
    throw new Error('Resolved defu package manifest missing');
}

for (const [label, consumer] of consumers) {
    test(`${label} resolves reviewed defu 6.1.5`, (t) => {
        t.diagnostic(consumer.resolve('defu'));
        assert.equal(resolvedVersion(consumer), '6.1.5');
    });

    test(`${label} preserves defaults, nullish fallback, arrays and inputs`, () => {
        const { defu } = consumer('defu');
        const preferred = {
            nested: { label: 'Çağrı', missing: null },
            entries: ['selected'], enabled: false, retries: 0, text: '', absent: undefined,
        };
        const defaults = {
            nested: { label: 'default', missing: 'fallback', extra: true },
            entries: ['default'], enabled: true, retries: 3, text: 'default', absent: 'fallback',
        };
        const before = structuredClone([preferred, defaults]);
        assert.deepEqual(defu(preferred, defaults), {
            nested: { label: 'Çağrı', missing: 'fallback', extra: true },
            entries: ['selected', 'default'], enabled: false, retries: 0, text: '', absent: 'fallback',
        });
        assert.deepEqual([preferred, defaults], before);
        assert.deepEqual(defu(), {});
        assert.deepEqual(defu(null, undefined, {}, { label: 'fallback' }), { label: 'fallback' });
    });

    test(`${label} keeps JSON prototype data from overriding safe defaults`, () => {
        const { defu } = consumer('defu');
        // Bounded local regression for GHSA-737v-mqg7-c878; no global prototype writes.
        const input = JSON.parse('{"__proto__":{"defuFixtureMode":"poison"}}');
        const before = JSON.stringify(input);
        const result = defu(input, { defuFixtureMode: 'safe' });
        assert.equal(result.defuFixtureMode, 'safe');
        assert.equal(Object.getPrototypeOf(result), Object.prototype);
        assert.equal(Object.hasOwn(result, 'defuFixtureMode'), true);
        assert.equal(Object.hasOwn(Object.prototype, 'defuFixtureMode'), false);
        assert.equal(JSON.stringify(input), before);
    });
}
