const assert = require('node:assert/strict');
const { once } = require('node:events');
const { existsSync, readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// Resolve Prisma/dev only; never start its server, database or config loaders.
const root = createRequire(path.resolve(__dirname, '../package.json'));
const prisma = createRequire(root.resolve('prisma/package.json'));
const dev = createRequire(prisma.resolve('@prisma/dev'));
const { Hono } = dev('hono');
const { cors } = dev('hono/cors');
const { serveStatic } = dev('hono/serve-static');

function version(name) {
    let directory = path.dirname(dev.resolve(name));
    while (directory !== path.dirname(directory)) {
        const file = path.join(directory, 'package.json');
        if (existsSync(file)) {
            const metadata = JSON.parse(readFileSync(file, 'utf8'));
            if (metadata.name === name) return metadata.version;
        }
        directory = path.dirname(directory);
    }
    throw new Error(`Missing manifest for ${name}`);
}

test('Prisma dev resolves patched same-major Hono and Node adapter', () => {
    assert.equal(version('hono'), '4.13.9');
    assert.equal(version('@hono/node-server'), '1.19.17');
});

test('encoded slashes cannot expose protected static content', async () => {
    const app = new Hono();
    app.use('/admin/*', (c) => c.text('denied', 403));
    app.use('*', serveStatic({ root: './', getContent: (file) => {
        if (file === 'admin/fixture.txt') return 'protected-fixture';
        if (file === 'public.txt') return 'public-fixture';
        return null;
    } }));
    assert.equal(await (await app.request('/public.txt')).text(), 'public-fixture');
    assert.equal((await app.request('/admin/fixture.txt')).status, 403);
    for (const requestPath of ['/admin%2Ffixture.txt', '/admin%2ffixture.txt']) {
        const response = await app.request(requestPath);
        assert.notEqual(response.status, 200);
        assert.notEqual(await response.text(), 'protected-fixture');
    }
});

test('explicit credentialed CORS preserves allowlist and rejects other origins', async () => {
    const app = new Hono();
    app.use('*', cors({ origin: ['https://allowed.example'], credentials: true }));
    app.get('/', (c) => c.text('fixture'));
    for (const origin of ['https://allowed.example', 'https://other.example', 'null']) {
        const response = await app.request('/', { headers: { origin } });
        assert.equal(response.headers.get('access-control-allow-origin'),
            origin === 'https://allowed.example' ? origin : null);
        if (origin === 'https://allowed.example') {
            assert.equal(response.headers.get('access-control-allow-credentials'), 'true');
        }
    }
});

test('wildcard credentialed CORS does not authorize arbitrary origins', async () => {
    const app = new Hono();
    app.use('*', cors({ credentials: true }));
    app.get('/', (c) => c.text('fixture'));
    for (const origin of ['https://other.example', 'null']) {
        const response = await app.request('/', { headers: { origin } });
        const reflectsCredentials = response.headers.get('access-control-allow-origin') === origin
            && response.headers.get('access-control-allow-credentials') === 'true';
        assert.equal(reflectsCredentials, false);
    }
});

test('Node adapter preserves JSON and Unicode on an owned loopback listener', { timeout: 5000 }, async () => {
    const { serve } = dev('@hono/node-server');
    const originalRequest = globalThis.Request;
    const originalResponse = globalThis.Response;
    const app = new Hono();
    app.post('/fixture/:id', async (c) => c.json({ id: c.req.param('id'), body: await c.req.json() }));
    const server = serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0, overrideGlobalObjects: false });
    try {
        if (!server.listening) await once(server, 'listening');
        const address = server.address();
        assert.equal(address.address, '127.0.0.1');
        const response = await fetch(`http://127.0.0.1:${address.port}/fixture/123`, {
            method: 'POST', headers: { 'content-type': 'application/json', connection: 'close' },
            body: JSON.stringify({ label: 'Çağrı', count: 0 }), signal: AbortSignal.timeout(2000),
        });
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { id: '123', body: { label: 'Çağrı', count: 0 } });
        assert.equal(globalThis.Request, originalRequest);
        assert.equal(globalThis.Response, originalResponse);
    } finally {
        const closed = once(server, 'close');
        server.close();
        server.closeAllConnections();
        await closed;
    }
});
