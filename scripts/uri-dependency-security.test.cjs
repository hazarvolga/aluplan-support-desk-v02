const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const test = require('node:test');

// Follow the real frontend build dependency, never a root hoist or mock.
const frontend = createRequire(path.resolve(__dirname, '../apps/frontend/package.json'));
const sentry = createRequire(frontend.resolve('@sentry/nextjs/package.json'));
const webpack = createRequire(sentry.resolve('webpack/package.json'));
const schemaUtils = createRequire(webpack.resolve('schema-utils/package.json'));
const ajvRequire = createRequire(schemaUtils.resolve('ajv/package.json'));
const Ajv = schemaUtils('ajv');
const uri = ajvRequire('fast-uri');

test('actual schema-utils AJV uses the reviewed fast-uri release', () => {
    assert.equal(ajvRequire('fast-uri/package.json').version, '3.1.8');
    assert.equal(ajvRequire('./dist/runtime/uri.js').default, uri);
});

test('encoded uppercase hosts normalize consistently (GHSA-hrr3-gc8f-f4qj)', () => {
    assert.equal(uri.parse('//%41.com').host, 'a.com');
    assert.equal(uri.normalize('//%41.com'), uri.normalize('//a.com'));
    assert.equal(uri.equal('//%41.com', '//a.com'), true);
});

test('AJV preserves absolute IDs, relative references and escaped JSON pointers', () => {
    const ajv = new Ajv();
    ajv.addSchema({
        $id: 'https://schemas.example.invalid/parts.json',
        definitions: { 'a/b': { type: 'integer', minimum: 1 } },
    });
    const validate = ajv.compile({
        $id: 'https://schemas.example.invalid/options.json',
        type: 'object', required: ['count'], additionalProperties: false,
        properties: { count: { $ref: 'parts.json#/definitions/a~1b' } },
    });
    assert.equal(validate({ count: 2 }), true);
    for (const value of [{}, { count: 0 }, { count: '2' }, { count: 2, extra: true }]) {
        assert.equal(validate(value), false);
    }
});

test('AJV unresolved references fail without any remote schema loader', () => {
    assert.throws(() => new Ajv().compile({
        $ref: 'https://schemas.example.invalid/missing.json',
    }), /can't resolve reference/);
});

test('actual schema-utils retains positive and negative plugin-option validation', () => {
    const { validate } = webpack('schema-utils');
    const schema = {
        type: 'object', required: ['enabled'], additionalProperties: false,
        properties: { enabled: { type: 'boolean' } },
    };
    assert.doesNotThrow(() => validate(schema, { enabled: true }));
    assert.throws(() => validate(schema, { enabled: 'yes' }), /boolean/);
    assert.throws(() => validate(schema, { enabled: true, unexpected: 1 }), /unknown property/);
});
