const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { createServer } = require('node:http');
const { EventEmitter } = require('node:events');
const { Readable } = require('node:stream');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// Explicit opt-in fixture root; never silently borrow another checkout.
const root = process.env.ALUPLAN_DEPENDENCY_ROOT || path.resolve(__dirname, '..');
assert.ok(path.isAbsolute(root), 'ALUPLAN_DEPENDENCY_ROOT must be absolute');
const workspaceRequire = createRequire(path.join(root, 'package.json'));
const backendRequire = createRequire(path.join(root, 'apps/backend/package.json'));
const frontendRequire = createRequire(path.join(root, 'apps/frontend/package.json'));

function protobufDependency() {
    const store = path.join(root, 'node_modules/.pnpm');
    const entries = readdirSync(store).filter(name => name.startsWith('protobufjs@'));
    const versions = entries.map(name => name.match(/^protobufjs@([^_]+)/)?.[1]).sort();
    assert.deepEqual(versions, ['7.6.5', '8.6.6'], 'both protobuf families must stay on their reviewed patched releases');
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
    assert.equal(backendRequire('multer/package.json').version, '2.4.0');
    const nestRequire = createRequire(backendRequire.resolve('@nestjs/platform-express/package.json'));
    assert.equal(nestRequire('multer/package.json').version, '2.4.0');
});

test('all production UUID consumers execute representative paths on the reviewed release', async () => {
    const lockfile = readFileSync(path.join(root, 'pnpm-lock.yaml'), 'utf8');
    const resolvedVersions = [...lockfile.matchAll(/^  uuid@(\d+\.\d+\.\d+):$/gm)].map(match => match[1]);
    assert.deepEqual(resolvedVersions, ['11.1.1']);

    const storageRequire = createRequire(backendRequire.resolve('@google-cloud/storage'));
    assert.equal(storageRequire('uuid/package.json').version, '11.1.1');
    const uuid = storageRequire('uuid');
    assert.match(uuid.v4(), /^[0-9a-f-]{36}$/);
    assert.throws(() => uuid.v5('bounded', uuid.v5.URL, new Uint8Array(8), 0), RangeError);
    assert.throws(() => uuid.v5('bounded', uuid.v5.URL, new Uint8Array(16), 1), RangeError);

    const sentryNextRequire = createRequire(frontendRequire.resolve('@sentry/nextjs/package.json'));
    const sentryPluginPath = sentryNextRequire.resolve('@sentry/webpack-plugin');
    const sentryPluginRequire = createRequire(sentryPluginPath);
    const sentryPlugin = sentryNextRequire('@sentry/webpack-plugin');
    assert.equal(sentryPluginRequire('uuid/package.json').version, '11.1.1');
    assert.equal(typeof sentryPlugin.sentryWebpackPlugin, 'function');
    assert.equal(typeof sentryPlugin.sentryWebpackPlugin({ silent: true, telemetry: false }).apply, 'function');

    class OfflineConnection extends EventEmitter {
        constructor() {
            super();
            this.client = Promise.resolve({});
            this.redisVersion = '7.2.0';
            this.databaseType = 'redis';
        }
        close() { return Promise.resolve(); }
        disconnect() {}
    }

    for (const packageRequire of [backendRequire, workspaceRequire]) {
        const bullmqPath = packageRequire.resolve('bullmq');
        const bullmqRequire = createRequire(bullmqPath);
        const bullmq = packageRequire('bullmq');
        assert.equal(bullmqRequire('uuid/package.json').version, '11.1.1');
        const queue = new bullmq.Queue('uuid-compatibility', {
            connection: {},
            skipMetasUpdate: true,
        }, OfflineConnection);
        assert.match(queue.token, /^[0-9a-f-]{36}$/);
        await queue.close();
    }

    for (const dependencyName of ['gaxios', 'teeny-request']) {
        const dependencyPath = storageRequire.resolve(dependencyName);
        const dependencyRequire = createRequire(dependencyPath);
        assert.equal(dependencyRequire('uuid/package.json').version, '11.1.1');
    }

    const { Gaxios } = storageRequire('gaxios');
    let gaxiosBoundary;
    const gaxiosResponse = await new Gaxios().request({
        url: 'https://offline.invalid/upload',
        method: 'POST',
        multipart: [
            { headers: { 'Content-Type': 'application/json' }, content: '{"ok":true}' },
            { headers: { 'Content-Type': 'text/plain' }, content: 'payload' },
        ],
        adapter: async options => {
            gaxiosBoundary = options.headers['Content-Type'];
            let body = '';
            for await (const chunk of options.body) body += chunk.toString();
            assert.match(body, /\{"ok":true\}/);
            assert.match(body, /payload/);
            return {
                config: options,
                data: 'ok',
                headers: {},
                status: 200,
                statusText: 'OK',
                request: { responseURL: options.url },
            };
        },
    });
    assert.equal(gaxiosResponse.data, 'ok');
    assert.match(gaxiosBoundary, /^multipart\/related; boundary=[0-9a-f-]{36}$/);

    let resolveServerRequest;
    let rejectServerRequest;
    const serverRequest = new Promise((resolve, reject) => {
        resolveServerRequest = resolve;
        rejectServerRequest = reject;
    });
    const server = createServer((request, response) => {
            const chunks = [];
            request.on('data', chunk => chunks.push(chunk));
            request.on('error', rejectServerRequest);
            request.on('end', () => {
                resolveServerRequest({
                    contentType: request.headers['content-type'],
                    body: Buffer.concat(chunks).toString('utf8'),
                });
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end('{"ok":true}');
            });
    });
    try {
        await new Promise((resolve, reject) => {
            server.once('listening', resolve);
            server.once('error', reject);
            server.listen(0, '127.0.0.1');
        });
        const address = server.address();
        const { teenyRequest } = storageRequire('teeny-request');
        await new Promise((resolve, reject) => teenyRequest({
            url: `http://127.0.0.1:${address.port}/upload`,
            method: 'POST',
            headers: {},
            multipart: [
                { 'Content-Type': 'application/json', body: '{"ok":true}' },
                { 'Content-Type': 'text/plain', body: Readable.from('payload') },
            ],
        }, error => error ? reject(error) : resolve()));
        const received = await serverRequest;
        assert.match(received.contentType, /^multipart\/related; boundary=[0-9a-f-]{36}$/);
        assert.match(received.body, /\{"ok":true\}/);
        assert.match(received.body, /payload/);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});
