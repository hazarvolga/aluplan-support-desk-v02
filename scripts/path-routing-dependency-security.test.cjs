const assert = require('node:assert/strict');
const { readFileSync, realpathSync } = require('node:fs');
const http = require('node:http');
const { createRequire } = require('node:module');
const path = require('node:path');
const test = require('node:test');

const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const platform = createRequire(backend.resolve('@nestjs/platform-express'));
const expressRequire = createRequire(platform.resolve('express'));
const routerRequire = createRequire(expressRequire.resolve('router'));
const consumers = [
    ...['@nestjs/core', '@nestjs/platform-express', '@nestjs/swagger'].map(name => ({
        name, require: createRequire(backend.resolve(name)),
    })),
    { name: 'Express router', require: routerRequire },
];
const express = platform('express');

test('actual Nest and Express router consumers resolve path-to-regexp 8.4.2', t => {
    const versions = consumers.map(consumer => {
        const entry = realpathSync(consumer.require.resolve('path-to-regexp'));
        const metadata = JSON.parse(readFileSync(path.resolve(path.dirname(entry), '../package.json'), 'utf8'));
        assert.equal(metadata.name, 'path-to-regexp');
        t.diagnostic(`${consumer.name}: ${entry}`);
        return { name: consumer.name, version: metadata.version };
    });
    assert.deepEqual(versions, consumers.map(({ name }) => ({ name, version: '8.4.2' })));
});

test('consumer parsers preserve representative named-parameter route patterns', () => {
    for (const consumer of consumers) {
        const parser = consumer.require('path-to-regexp');
        for (const pattern of ['/tickets/:id/messages', '/auth/reset-password', '/teams/:id/members']) {
            assert.ok(parser.parse(pattern));
            const route = parser.compile(pattern)({ id: 'Ölçü & çizim' });
            const matched = parser.match(pattern)(route);
            assert.ok(matched);
            if (pattern.includes(':id')) assert.equal(matched.params.id, 'Ölçü & çizim');
        }
    }
});

test('nonending wildcards consume the whole multi-segment path', () => {
    for (const consumer of consumers) {
        const matched = consumer.require('path-to-regexp').match('/*segments', { end: false })('/a/b');
        assert.equal(matched.path, '/a/b');
        assert.deepEqual(matched.params.segments, ['a', 'b']);
    }
});

async function withRoutes(run) {
    // Isolated representative routes only: no real controllers, auth or DB.
    const app = express();
    const echo = (request, response) => response.json({
        params: request.params, query: request.query, method: request.method,
    });
    app.get('/tickets/:id/messages', echo);
    app.post('/auth/reset-password', echo);
    app.get('/teams/:id/members', echo);
    app.get('/branding/assets/*path', echo);
    app.get('/storage/*path', echo);
    app.use((error, request, response, next) => {
        response.status(error.status || 500).json({ error: 'Synthetic route error' });
    });
    const server = http.createServer(app);
    server.requestTimeout = 1500;
    server.headersTimeout = 1500;
    try {
        await new Promise((resolve, reject) => {
            server.once('error', reject);
            server.listen(0, '127.0.0.1', resolve);
        });
        await run(server.address().port);
    } finally {
        server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
    }
}

function request(port, pathname, method = 'GET') {
    return new Promise((resolve, reject) => {
        const outgoing = http.request({
            hostname: '127.0.0.1', port, path: pathname, method, agent: false,
            signal: AbortSignal.timeout(1000),
        }, response => {
            const chunks = [];
            let length = 0;
            response.on('data', chunk => {
                length += chunk.length;
                if (length > 2048) response.destroy(new Error('Synthetic response exceeded 2 KiB'));
                else chunks.push(chunk);
            });
            response.on('error', reject);
            response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks).toString('utf8') }));
        });
        outgoing.on('error', reject);
        outgoing.end();
    });
}

test('actual Express router preserves encoded params, query text and methods', { timeout: 4000 }, async () => {
    await withRoutes(async port => {
        const id = 'Ölçü & çizim';
        const query = 'Çağrı + şğüıöç';
        for (const prefix of ['tickets', 'teams']) {
            const suffix = prefix === 'tickets' ? 'messages' : 'members';
            const result = await request(port, `/${prefix}/${encodeURIComponent(id)}/${suffix}?q=${encodeURIComponent(query)}`);
            assert.equal(result.status, 200);
            assert.deepEqual(JSON.parse(result.body), { params: { id }, query: { q: query }, method: 'GET' });
        }
        const reset = await request(port, '/auth/reset-password', 'POST');
        assert.equal(reset.status, 200);
        assert.deepEqual(JSON.parse(reset.body), { params: {}, query: {}, method: 'POST' });
        // Wildcard shape only; these fixtures have no actual storage/auth logic.
        for (const prefix of ['/branding/assets', '/storage']) {
            const wildcard = await request(port, `${prefix}/synthetic/${encodeURIComponent('Ölçü.png')}`);
            assert.equal(wildcard.status, 200);
            assert.deepEqual(JSON.parse(wildcard.body), {
                params: { path: ['synthetic', 'Ölçü.png'] }, query: {}, method: 'GET',
            });
        }
    });
});

test('actual Express router rejects mismatched paths and unsupported methods', { timeout: 4000 }, async () => {
    await withRoutes(async port => {
        for (const [pathname, method] of [
            ['/tickets/one/messages/extra', 'GET'], ['/teams/one', 'GET'],
            ['/auth/reset-password', 'GET'], ['/tickets/one/messages', 'POST'],
        ]) assert.equal((await request(port, pathname, method)).status, 404);
    });
});

test('actual Express router returns 400 for a tiny malformed percent-encoded parameter', { timeout: 4000 }, async () => {
    await withRoutes(async port => {
        const result = await request(port, '/tickets/%E0%A4%A/messages');
        assert.equal(result.status, 400);
        assert.deepEqual(JSON.parse(result.body), { error: 'Synthetic route error' });
    });
});
