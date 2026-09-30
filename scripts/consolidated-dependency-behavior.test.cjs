const assert = require('node:assert/strict');
const { readdirSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// Explicit opt-in fixture root; never silently borrow another checkout.
const root = process.env.ALUPLAN_DEPENDENCY_ROOT || path.resolve(__dirname, '..');
assert.ok(path.isAbsolute(root), 'ALUPLAN_DEPENDENCY_ROOT must be absolute');
const workspaceRequire = createRequire(path.join(root, 'package.json'));
const backendRequire = createRequire(path.join(root, 'apps/backend/package.json'));

function protobufDependency() {
    const store = path.join(root, 'node_modules/.pnpm');
    const entries = readdirSync(store).filter(name => name.startsWith('protobufjs@'));
    const versions = entries.map(name => name.match(/^protobufjs@([^_]+)/)?.[1]).sort();
    assert.deepEqual(versions, ['7.6.5', '8.4.1'], 'both protobuf families must stay on their reviewed patched releases');
    return entries.map(entry => require(path.join(store, entry, 'node_modules/protobufjs')));
}

test('Handlebars preserves string rendering and HTML escaping', () => {
    const handlebars = workspaceRequire('handlebars');
    const render = handlebars.compile('Merhaba {{name}} / {{#if active}}aktif{{else}}pasif{{/if}}');
    assert.equal(render({ name: '<script>', active: true }), 'Merhaba &lt;script&gt; / aktif');
});

test('Handlebars rejects arithmetic text masquerading as a numeric AST literal', () => {
    const handlebars = workspaceRequire('handlebars').create();
    handlebars.registerHelper('value', value => String(value));
    assert.equal(handlebars.compile(handlebars.parse('{{value 1}}'))({}), '1');
    const source = handlebars.parse('{{value 1}}');
    const ast = {
        ...source,
        body: source.body.map(node => ({
            ...node,
            params: node.params.map(param => ({ ...param, value: '1+1' })),
        })),
    };
    // Inert arithmetic only: no process, filesystem, network or large payload.
    assert.throws(() => handlebars.compile(ast)({}));
});

test('protobufjs 7 and 8 preserve trusted descriptor encode/decode behavior', () => {
    for (const protobuf of protobufDependency()) {
        const schema = protobuf.Root.fromJSON({
            nested: { Smoke: { fields: {
                id: { type: 'string', id: 1 },
                count: { type: 'uint32', id: 2 },
            } } },
        });
        const type = schema.lookupType('Smoke');
        const input = { id: 'synthetic-case', count: 7 };
        assert.equal(type.verify(input), null);
        const bytes = type.encode(type.create(input)).finish();
        assert.deepEqual(type.toObject(type.decode(bytes)), input);
    }
});

test('direct and Nest runtime resolve patched multer', () => {
    assert.equal(backendRequire('multer/package.json').version, '2.3.0');
    const nestRequire = createRequire(backendRequire.resolve('@nestjs/platform-express/package.json'));
    assert.equal(nestRequire('multer/package.json').version, '2.3.0');
});
