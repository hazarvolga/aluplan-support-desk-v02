const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { existsSync, readFileSync, realpathSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test, mock } = require('node:test');

// Optional fixture anchor is explicit: never silently use another checkout.
const packageJson = process.env.ALUPLAN_WS_PACKAGE_JSON
    || path.resolve(__dirname, '../apps/backend/package.json');
assert.ok(path.isAbsolute(packageJson), 'ALUPLAN_WS_PACKAGE_JSON must be absolute');
assert.equal(path.basename(packageJson), 'package.json');
JSON.parse(readFileSync(packageJson, 'utf8'));
const backendRequire = createRequire(packageJson);
const socketEntry = backendRequire.resolve('socket.io');
const socketRequire = createRequire(socketEntry);
const engineEntry = socketRequire.resolve('engine.io');
const parserEntry = socketRequire.resolve('socket.io-parser');
const wsEntry = createRequire(engineEntry).resolve('ws');
const engine = require(engineEntry);
const parser = require(parserEntry);
const ws = require(wsEntry);

function packageInfo(entry, expectedName) {
    const source = realpathSync(entry);
    for (let directory = path.dirname(source); ; directory = path.dirname(directory)) {
        const candidate = path.join(directory, 'package.json');
        if (existsSync(candidate)) {
            const metadata = JSON.parse(readFileSync(candidate, 'utf8'));
            if (metadata.name === expectedName) {
                return { name: metadata.name, version: metadata.version, source };
            }
        }
        assert.notEqual(directory, path.dirname(directory), `Cannot identify ${expectedName}`);
    }
}

test('reports the actual Socket.IO server dependency chain', (t) => {
    for (const [entry, name] of [
        [socketEntry, 'socket.io'], [engineEntry, 'engine.io'],
        [parserEntry, 'socket.io-parser'], [wsEntry, 'ws'],
    ]) {
        const info = packageInfo(entry, name);
        assert.match(info.version, /^\d+\.\d+\.\d+/);
        t.diagnostic(JSON.stringify(info));
    }
});

test('parser rejects an eleventh attachment before receiving binary data', () => {
    const decoder = new parser.Decoder();
    try {
        assert.throws(() => decoder.add('511-["bounded-test"]'), /too many attachments/);
    } finally {
        decoder.destroy();
    }
});

test('parser rejects zero-attachment binary events and acknowledgements', () => {
    for (const encoded of ['50-["bounded-test"]', '60-[]']) {
        const decoder = new parser.Decoder();
        try {
            assert.throws(() => decoder.add(encoded), /Illegal attachments/);
        } finally {
            decoder.destroy();
        }
    }
});

for (const count of [1, 10]) {
    test(`parser reconstructs a valid event with ${count} attachments`, () => {
        const decoder = new parser.Decoder();
        const decoded = mock.fn();
        const buffers = Array.from({ length: count }, (_, index) => Buffer.from([index]));
        decoder.on('decoded', decoded);
        try {
            const data = ['bounded-test', ...buffers.map((_, num) => ({ _placeholder: true, num }))];
            decoder.add(`5${count}-${JSON.stringify(data)}`);
            for (const buffer of buffers) decoder.add(buffer);
            assert.equal(decoded.mock.callCount(), 1);
            assert.deepEqual(decoded.mock.calls[0].arguments[0], {
                type: parser.PacketType.EVENT, nsp: '/', data: ['bounded-test', ...buffers],
            });
        } finally {
            decoder.destroy();
        }
    });
}

async function receiveFrames(bytes) {
    const receiver = new ws.Receiver({ isServer: false, maxFragments: 2, maxPayload: 32 });
    const message = mock.fn();
    const error = mock.fn();
    receiver.on('message', message);
    receiver.on('error', error);
    try {
        // The write callback completes on both old and patched versions; awaiting
        // only an error event would hang when an old version accepts the input.
        const writeError = await new Promise(resolve => receiver.write(Buffer.from(bytes), resolve));
        return { writeError, message };
    } finally {
        receiver.destroy();
    }
}

test('ws rejects a third tiny fragment with a configured limit of two', { timeout: 2000 }, async () => {
    const { writeError, message } = await receiveFrames([
        0x02, 1, 0x61, 0x00, 1, 0x62, 0x80, 1, 0x63,
    ]);
    assert.equal(writeError?.code, 'WS_ERR_TOO_MANY_BUFFERED_PARTS');
    assert.equal(message.mock.callCount(), 0);
});

test('ws preserves valid binary messages at the fragment limit', { timeout: 2000 }, async () => {
    const { writeError, message } = await receiveFrames([0x02, 1, 0x61, 0x80, 1, 0x62]);
    assert.ifError(writeError);
    assert.equal(message.mock.callCount(), 1);
    assert.deepEqual(message.mock.calls[0].arguments, [Buffer.from('ab'), true]);
});

test('ws counts empty fragments toward the configured fragment limit', { timeout: 2000 }, async () => {
    const { writeError, message } = await receiveFrames([0x02, 0, 0x00, 0, 0x80, 0]);
    assert.equal(writeError?.code, 'WS_ERR_TOO_MANY_BUFFERED_PARTS');
    assert.equal(message.mock.callCount(), 0);
});

test('ws preserves an empty binary message at the fragment limit', { timeout: 2000 }, async () => {
    const { writeError, message } = await receiveFrames([0x02, 0, 0x80, 0]);
    assert.ifError(writeError);
    assert.equal(message.mock.callCount(), 1);
    assert.deepEqual(message.mock.calls[0].arguments, [Buffer.alloc(0), true]);
});

test('ws enables finite fragment and buffered-chunk limits by default', () => {
    const server = new ws.WebSocketServer({ noServer: true });
    try {
        for (const [option, upperBound] of [
            ['maxFragments', 16 * 1024], ['maxBufferedChunks', 256 * 1024],
        ]) {
            const limit = server.options[option];
            assert.ok(Number.isSafeInteger(limit) && limit > 0 && limit <= upperBound,
                `${option} must retain a positive finite cap no larger than ${upperBound}`);
        }
    } finally {
        server.close();
    }
});

function verifyUpgrade(protocolQuery) {
    const server = new engine.Server();
    const callback = mock.fn();
    server.clients = {
        'bounded-session': { protocol: 4, transport: { name: 'polling' }, close: mock.fn() },
    };
    try {
        server.verify({
            method: 'GET', headers: {},
            _query: { sid: 'bounded-session', transport: 'websocket', ...protocolQuery },
        }, true, callback);
        assert.equal(callback.mock.callCount(), 1);
        return callback.mock.calls[0].arguments;
    } finally {
        server.close();
        server.removeAllListeners();
    }
}

for (const [label, protocolQuery] of [['EIO3', { EIO: '3' }], ['missing EIO', {}]]) {
    test(`engine.io rejects ${label} on upgrade of an existing EIO4 session`, () => {
        const [errorCode, context] = verifyUpgrade(protocolQuery);
        assert.equal(errorCode, engine.Server.errors.BAD_REQUEST);
        assert.deepEqual(context, { name: 'PROTOCOL_MISMATCH', protocol: 3, previousProtocol: 4 });
    });
}

test('engine.io permits an EIO4 upgrade of an existing EIO4 session', () => {
    assert.deepEqual(verifyUpgrade({ EIO: '4' }), []);
});

function pollingFixture(contentType) {
    const transport = engine.transports.polling({ _query: { EIO: '4' } });
    const response = {
        writeHead: mock.fn(function () { return this; }),
        end: mock.fn(),
    };
    const request = Object.assign(new EventEmitter(), {
        method: 'POST', headers: { 'content-type': contentType },
        res: response, setEncoding: mock.fn(),
    });
    const error = mock.fn();
    const packet = mock.fn();
    transport.on('error', error);
    transport.on('packet', packet);
    return { transport, response, request, error, packet };
}

test('engine.io ends invalid protocol 4 binary polling requests with HTTP 400', () => {
    const { transport, response, request, error, packet } = pollingFixture('application/octet-stream');
    try {
        transport.onRequest(request);
        assert.equal(error.mock.callCount(), 1);
        assert.equal(error.mock.calls[0].arguments[0].message, 'invalid content');
        assert.equal(response.writeHead.mock.callCount(), 1);
        assert.equal(response.writeHead.mock.calls[0].arguments[0], 400);
        assert.equal(response.end.mock.callCount(), 1);
        assert.equal(packet.mock.callCount(), 0);
    } finally {
        request.removeAllListeners();
        transport.removeAllListeners();
    }
});

test('engine.io preserves a valid protocol 4 text polling message', () => {
    const { transport, response, request, error, packet } = pollingFixture('text/plain');
    try {
        transport.onRequest(request);
        request.emit('data', '4bounded-test');
        request.emit('end');
        assert.equal(error.mock.callCount(), 0);
        assert.equal(packet.mock.callCount(), 1);
        assert.deepEqual(packet.mock.calls[0].arguments[0], { type: 'message', data: 'bounded-test' });
        assert.equal(response.writeHead.mock.callCount(), 1);
        assert.equal(response.writeHead.mock.calls[0].arguments[0], 200);
        assert.equal(response.end.mock.callCount(), 1);
        assert.equal(response.end.mock.calls[0].arguments[0], 'ok');
    } finally {
        request.removeAllListeners();
        transport.removeAllListeners();
    }
});
