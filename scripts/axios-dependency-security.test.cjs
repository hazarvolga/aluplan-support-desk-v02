const assert = require('node:assert/strict');
const http = require('node:http');
const { createRequire } = require('node:module');
const path = require('node:path');
const test = require('node:test');

// Resolve the consumer's actual package, never a root hoist or Axios mock.
const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const axios = backend('axios');
const TEST_TIMEOUT = 4000;
const RESPONSE_LIMIT = 1024;

async function withServer(handler, run) {
    const server = http.createServer(handler);
    server.requestTimeout = 1500;
    server.headersTimeout = 1500;
    try {
        await new Promise((resolve, reject) => {
            server.once('error', reject);
            server.listen(0, '127.0.0.1', resolve);
        });
        const baseURL = `http://127.0.0.1:${server.address().port}`;
        const client = axios.create({
            baseURL, adapter: 'http', proxy: false, timeout: 1000,
            maxRedirects: 0, maxContentLength: RESPONSE_LIMIT, maxBodyLength: RESPONSE_LIMIT,
        });
        return await run(client, baseURL);
    } finally {
        server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
    }
}

function readBody(request) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        request.on('data', chunk => {
            size += chunk.length;
            if (size > 4096) {
                reject(new Error('Synthetic request exceeded fixture budget'));
                request.destroy();
                return;
            }
            chunks.push(chunk);
        });
        request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        request.on('error', reject);
    });
}

function json(response, data) {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(data));
}

test('backend resolves the reviewed Axios 1.20.0 release', t => {
    t.diagnostic(`backend Axios entry: ${backend.resolve('axios')}`);
    assert.equal(backend('axios/package.json').version, '1.20.0');
    assert.equal(axios.VERSION, '1.20.0');
});

test('OAuth URLSearchParams preserves Turkish, punctuation and empty fields', { timeout: TEST_TIMEOUT }, async () => {
    const fields = {
        client_id: 'synthetic-client', grant_type: 'client_credentials',
        client_secret: 'İşlem + & = % ? / şğüıöç 🔑',
        scope: 'https://crm.example.invalid/.default', optional: '',
    };
    await withServer((request, response) => {
        readBody(request).then(body => json(response, {
            method: request.method, type: request.headers['content-type'],
            fields: Object.fromEntries(new URLSearchParams(body)),
            access_token: 'synthetic-token',
        }), () => { response.writeHead(400); response.end(); });
    }, async client => {
        const response = await client.post('/oauth2/v2.0/token', new URLSearchParams(fields), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        assert.equal(response.status, 200);
        assert.equal(response.data.method, 'POST');
        assert.match(response.data.type, /^application\/x-www-form-urlencoded/);
        assert.deepEqual(response.data.fields, fields);
        assert.equal(response.data.access_token, 'synthetic-token');
    });
});

test('webhook JSON and custom secret header survive the real HTTP adapter', { timeout: TEST_TIMEOUT }, async () => {
    const payload = {
        event: 'ticket.updated', timestamp: '2026-09-26T00:00:00.000Z',
        payload: { subject: 'Ölçü & çizim güncellendi 🚀', count: 0, optional: null, tags: [] },
    };
    await withServer((request, response) => {
        readBody(request).then(body => json(response, {
            method: request.method, type: request.headers['content-type'],
            secret: request.headers['x-webhook-secret'], body: JSON.parse(body),
        }), () => { response.writeHead(400); response.end(); });
    }, async client => {
        const response = await client.post('/webhook', payload, {
            headers: { 'Content-Type': 'application/json', 'X-Webhook-Secret': 'synthetic-only' },
        });
        assert.equal(response.data.method, 'POST');
        assert.match(response.data.type, /^application\/json/);
        assert.equal(response.data.secret, 'synthetic-only');
        assert.deepEqual(response.data.body, payload);
    });
});

test('CRM OData headers, encoded queries, annotations and JSON links remain intact', { timeout: TEST_TIMEOUT }, async () => {
    const filter = "name eq 'Çağrı & Ortakları'";
    const headers = {
        Authorization: 'Bearer synthetic-only', Accept: 'application/json',
        'OData-MaxVersion': '4.0', 'OData-Version': '4.0',
        Prefer: 'odata.track-changes, odata.include-annotations="*"',
    };
    const records = [{ name: 'Çağrı & Ortakları', 'industrycode@OData.Community.Display.V1.FormattedValue': 'Üretim' }];
    await withServer((request, response) => json(response, {
        value: records, '@odata.nextLink': '/api/data/v9.2/accounts?$skiptoken=synthetic',
        '@odata.deltaLink': '/api/data/v9.2/accounts?$deltatoken=synthetic',
        query: new URL(request.url, 'http://127.0.0.1').searchParams.get('$filter'),
        headers: Object.fromEntries(Object.keys(headers).map(key => [key, request.headers[key.toLowerCase()]])),
    }), async client => {
        const response = await client.get('/api/data/v9.2/accounts', { headers, params: { $filter: filter } });
        assert.deepEqual(response.data.value, records);
        assert.deepEqual(response.data.headers, headers);
        assert.equal(response.data.query, filter);
        assert.equal(response.data['@odata.nextLink'], '/api/data/v9.2/accounts?$skiptoken=synthetic');
        assert.equal(response.data['@odata.deltaLink'], '/api/data/v9.2/accounts?$deltatoken=synthetic');
    });
});

test('CRM maxRedirects zero rejects redirects without visiting their target', { timeout: TEST_TIMEOUT }, async () => {
    const visited = [];
    await withServer((request, response) => {
        visited.push(request.url);
        if (request.url === '/redirect') {
            response.writeHead(302, { Location: '/must-not-be-requested' });
            response.end();
        } else json(response, { unexpected: true });
    }, async client => {
        await assert.rejects(client.get('/redirect', { maxRedirects: 0 }), error => {
            assert.equal(axios.isAxiosError(error), true);
            assert.equal(error.response.status, 302);
            assert.equal(error.response.headers.location, '/must-not-be-requested');
            return true;
        });
        assert.deepEqual(visited, ['/redirect']);
    });
});

test('crawler follows a permitted relative redirect and preserves arraybuffer bytes', { timeout: TEST_TIMEOUT }, async () => {
    const visited = [];
    const bytes = Buffer.from([0, 1, 127, 128, 254, 255, 13, 10]);
    await withServer((request, response) => {
        visited.push(request.url);
        if (request.url === '/download') {
            response.writeHead(302, { Location: '/synthetic.bin' });
            response.end();
        } else {
            response.writeHead(200, { 'Content-Type': 'application/octet-stream' });
            response.end(bytes);
        }
    }, async client => {
        const response = await client.get('/download', { maxRedirects: 5, responseType: 'arraybuffer' });
        assert.equal(response.status, 200);
        assert.ok(Buffer.isBuffer(response.data));
        assert.deepEqual(response.data, bytes);
        assert.deepEqual(visited, ['/download', '/synthetic.bin']);
    });
});

test('response limit accepts its byte boundary and rejects a bounded excess', { timeout: TEST_TIMEOUT }, async () => {
    await withServer((request, response) => {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('a'.repeat(request.url === '/boundary' ? RESPONSE_LIMIT : RESPONSE_LIMIT + 1));
    }, async client => {
        const response = await client.get('/boundary', { responseType: 'text' });
        assert.equal(Buffer.byteLength(response.data), RESPONSE_LIMIT);
        await assert.rejects(client.get('/excess'), error => {
            assert.equal(error.code, 'ERR_BAD_RESPONSE');
            assert.match(error.message, /maxContentLength/);
            return true;
        });
    });
});

test('request body limit accepts its boundary and rejects excess before transmission', { timeout: TEST_TIMEOUT }, async () => {
    const visited = [];
    await withServer((request, response) => {
        visited.push(request.url);
        readBody(request).then(body => json(response, { bytes: Buffer.byteLength(body) }),
            () => { response.writeHead(400); response.end(); });
    }, async client => {
        const response = await client.post('/boundary', 'a'.repeat(RESPONSE_LIMIT));
        assert.equal(response.data.bytes, RESPONSE_LIMIT);
        await assert.rejects(client.post('/excess', 'a'.repeat(RESPONSE_LIMIT + 1)), error => {
            assert.equal(error.code, 'ERR_BAD_REQUEST');
            assert.match(error.message, /maxBodyLength/);
            return true;
        });
        assert.deepEqual(visited, ['/boundary']);
    });
});

test('unanswered requests honor timeout and in-flight AbortController cancellation', { timeout: TEST_TIMEOUT }, async () => {
    const controller = new AbortController();
    const visited = [];
    await withServer((request) => {
        visited.push(request.url);
        if (request.url === '/cancel') controller.abort();
        // Deliberately unanswered; client deadline/cancellation releases the socket.
    }, async client => {
        await assert.rejects(client.get('/timeout', { timeout: 100 }), error => {
            assert.equal(error.code, 'ECONNABORTED');
            assert.match(error.message, /timeout/);
            return true;
        });
        await assert.rejects(client.get('/cancel', { signal: controller.signal }), error => {
            assert.equal(error.code, 'ERR_CANCELED');
            assert.equal(axios.isCancel(error), true);
            return true;
        });
        assert.deepEqual(visited, ['/timeout', '/cancel']);
    });
});
