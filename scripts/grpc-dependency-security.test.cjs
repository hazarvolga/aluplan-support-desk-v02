const assert = require('node:assert/strict');
const http2 = require('node:http2');
const { createRequire } = require('node:module');
const path = require('node:path');
const test = require('node:test');
const { gzipSync } = require('node:zlib');

const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const documentai = backend('@google-cloud/documentai');
const documentaiRequire = createRequire(backend.resolve('@google-cloud/documentai'));
const gaxRequire = createRequire(documentaiRequire.resolve('google-gax'));
const grpc = gaxRequire('@grpc/grpc-js');
const { ProcessRequest, ProcessResponse } = documentai.protos.google.cloud.documentai.v1;
const rpcPath = '/google.cloud.documentai.v1.DocumentProcessorService/ProcessDocument';
const text = 'Ölçü & çizim: şğüıöç İstanbul';
const content = Buffer.from(text, 'utf8');
const request = {
    name: 'projects/synthetic/locations/test/processors/offline',
    rawDocument: { content, mimeType: 'text/plain', displayName: 'Ölçüler.txt' },
    skipHumanReview: true, labels: { fixture: 'offline' },
};
const response = { document: { text, mimeType: 'text/plain', content } };
const serializeRequest = value => Buffer.from(ProcessRequest.encode(value).finish());
const serializeResponse = value => Buffer.from(ProcessResponse.encode(value).finish());
const options = {
    'grpc.enable_http_proxy': 0,
    'grpc.max_receive_message_length': 1024,
    'grpc.max_send_message_length': 1024,
};

function call(client, metadata = new grpc.Metadata(), timeout = 1000) {
    return new Promise((resolve, reject) => client.makeUnaryRequest(
        rpcPath, serializeRequest, bytes => ProcessResponse.decode(bytes), request,
        metadata, { deadline: Date.now() + timeout },
        (error, value) => error ? reject(error) : resolve(value),
    ));
}

async function withGrpcServer(handler, run) {
    const server = new grpc.Server(options);
    server.addService({ processDocument: {
        path: rpcPath, requestStream: false, responseStream: false,
        requestSerialize: serializeRequest, requestDeserialize: bytes => ProcessRequest.decode(bytes),
        responseSerialize: serializeResponse, responseDeserialize: bytes => ProcessResponse.decode(bytes),
    } }, { processDocument: handler });
    let client;
    try {
        const port = await new Promise((resolve, reject) => server.bindAsync(
            '127.0.0.1:0', grpc.ServerCredentials.createInsecure(),
            (error, value) => error ? reject(error) : resolve(value),
        ));
        client = new grpc.Client(`127.0.0.1:${port}`, grpc.credentials.createInsecure(), options);
        return await run(client);
    } finally {
        client?.close();
        server.forceShutdown();
    }
}

test('Document AI resolves google-gax and reviewed grpc-js 1.14.4', t => {
    t.diagnostic(`Document AI gRPC entry: ${gaxRequire.resolve('@grpc/grpc-js')}`);
    assert.equal(gaxRequire('@grpc/grpc-js/package.json').version, '1.14.4');
});

test('actual Google protos preserve Turkish content bytes and request fields', () => {
    const encoded = serializeRequest(request);
    assert.ok(encoded.length < 256);
    const decoded = ProcessRequest.decode(encoded);
    assert.equal(decoded.name, request.name);
    assert.equal(decoded.rawDocument.displayName, 'Ölçüler.txt');
    assert.equal(decoded.rawDocument.mimeType, 'text/plain');
    assert.deepEqual(Buffer.from(decoded.rawDocument.content), content);
    assert.equal(decoded.skipHumanReview, true);
    assert.deepEqual(decoded.labels, { fixture: 'offline' });
    assert.equal(ProcessResponse.decode(serializeResponse(response)).document.text, text);
});

test('real loopback unary gRPC preserves Google payload and binary metadata', { timeout: 4000 }, async () => {
    const metadata = new grpc.Metadata();
    metadata.set('x-fixture', 'synthetic-only');
    metadata.set('x-turkish-bin', content);
    let received;
    await withGrpcServer((incoming, callback) => {
        received = { request: incoming.request, metadata: incoming.metadata };
        callback(null, response);
    }, async client => {
        const result = await call(client, metadata);
        assert.equal(result.document.text, text);
        assert.deepEqual(Buffer.from(result.document.content), content);
        assert.equal(received.request.name, request.name);
        assert.deepEqual(Buffer.from(received.request.rawDocument.content), content);
        assert.deepEqual(received.metadata.get('x-fixture'), ['synthetic-only']);
        assert.deepEqual(received.metadata.get('x-turkish-bin'), [content]);
    });
});

test('real loopback unary gRPC enforces a bounded deadline', { timeout: 4000 }, async () => {
    let received = false;
    await withGrpcServer(() => { received = true; }, async client => {
        // Warm the channel first so the deadline exercises the unanswered RPC.
        await new Promise((resolve, reject) => client.waitForReady(Date.now() + 1000,
            error => error ? reject(error) : resolve()));
        await assert.rejects(call(client, new grpc.Metadata(), 100), error => {
            assert.equal(error.code, grpc.status.DEADLINE_EXCEEDED);
            return true;
        });
        assert.equal(received, true);
    });
});

test('real gRPC client decodes a tiny gzip Google-proto response', { timeout: 4000 }, async () => {
    // grpc-js servers do not emit compressed responses; this tiny HTTP/2 fixture
    // sends one normal gRPC gzip frame, without oversized or malicious input.
    const compressed = gzipSync(serializeResponse(response));
    assert.ok(compressed.length < 256);
    const prefix = Buffer.alloc(5);
    prefix.writeUInt8(1, 0);
    prefix.writeUInt32BE(compressed.length, 1);
    const server = http2.createServer();
    const sessions = new Set();
    const requests = [];
    const fixtureErrors = [];
    server.on('session', session => {
        sessions.add(session);
        session.on('close', () => sessions.delete(session));
    });
    server.on('stream', (stream, headers) => {
        requests.push(headers[':path']);
        stream.on('error', error => fixtureErrors.push(error));
        stream.resume();
        stream.respond({ ':status': 200, 'content-type': 'application/grpc', 'grpc-encoding': 'gzip' }, { waitForTrailers: true });
        stream.on('wantTrailers', () => stream.sendTrailers({ 'grpc-status': '0' }));
        stream.end(Buffer.concat([prefix, compressed]));
    });
    let client;
    try {
        await new Promise((resolve, reject) => {
            server.once('error', reject);
            server.listen(0, '127.0.0.1', resolve);
        });
        client = new grpc.Client(`127.0.0.1:${server.address().port}`, grpc.credentials.createInsecure(), options);
        const result = await call(client);
        assert.equal(result.document.text, text);
        assert.deepEqual(Buffer.from(result.document.content), content);
        assert.deepEqual(requests, [rpcPath]);
        assert.deepEqual(fixtureErrors, []);
    } finally {
        client?.close();
        for (const session of sessions) session.destroy();
        await new Promise(resolve => server.close(resolve));
    }
});
