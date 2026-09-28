const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// Resolve consumer edges without importing applications, CLIs or config loaders.
const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const frontend = createRequire(path.resolve(__dirname, '../apps/frontend/package.json'));
const cli = createRequire(backend.resolve('@nestjs/cli/package.json'));
const checker = createRequire(cli.resolve('fork-ts-checker-webpack-plugin'));
const eslint = createRequire(frontend.resolve('eslint'));
const consumers = [
    ['Swagger', createRequire(backend.resolve('@nestjs/swagger'))],
    ['CLI cosmiconfig', createRequire(checker.resolve('cosmiconfig'))],
    ['ESLint eslintrc', createRequire(eslint.resolve('@eslint/eslintrc'))],
];

for (const [label, consumer] of consumers) {
    const yaml = consumer('js-yaml');

    test(`${label} resolves reviewed js-yaml 4.3.2`, () => {
        assert.equal(consumer('js-yaml/package.json').version, '4.3.2');
    });

    test(`${label} preserves OpenAPI Unicode, refs and scalar round trips`, () => {
        const document = {
            openapi: '3.0.0', info: { title: 'Çağrı desteği', version: '1.0' },
            paths: { '/tickets/{id}': { get: { summary: 'Yanıtı gör', responses: {
                200: { description: 'Başarılı', content: { 'application/json': {
                    schema: { $ref: '#/components/schemas/Ticket' },
                } } },
            } } } },
            components: { schemas: { Ticket: { type: 'object', properties: {
                enabled: { type: 'boolean', default: false },
                count: { type: 'integer', default: 0 },
            } } } },
        };
        const before = structuredClone(document);
        assert.deepEqual(yaml.load(yaml.dump(document, { skipInvalid: true, noRefs: true })), before);
        assert.deepEqual(document, before);
        assert.deepEqual(yaml.load('enabled: false\ncount: 0\nlabel: "1_000"\n'),
            { enabled: false, count: 0, label: '1_000' });
    });

    test(`${label} preserves normal merges and rejects duplicate mapping keys`, () => {
        assert.deepEqual(yaml.load('base: &b {enabled: true, retries: 3}\njob: {<<: *b, retries: 0}'),
            { base: { enabled: true, retries: 3 }, job: { enabled: true, retries: 0 } });
        assert.throws(() => yaml.load('mode: safe\nmode: duplicate'), /duplicated mapping key/);
    });

    test(`${label} charges empty mappings against a bounded merge budget`, () => {
        // Tiny regression, not a CPU/memory stress payload; old versions ignore this option.
        const input = 'job: {<<: [{}, {}, {}]}';
        assert.deepEqual(yaml.load(input, { maxTotalMergeKeys: 3 }), { job: {} });
        assert.throws(() => yaml.load(input, { maxTotalMergeKeys: 2 }), /maxTotalMergeKeys/);
    });

    test(`${label} enforces the default merge sequence cap`, () => {
        const merge = (count) => `job: {<<: [${Array(count).fill('{}').join(',')}]} `;
        assert.deepEqual(yaml.load(merge(100)), { job: {} });
        assert.throws(() => yaml.load(merge(101)), /abnormal merge sequence size/);
    });
}
