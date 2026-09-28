const assert = require('node:assert/strict');
const http = require('node:http');
const { readFileSync } = require('node:fs');
const { createRequire, Module } = require('node:module');
const path = require('node:path');
const test = require('node:test');
const { gzipSync } = require('node:zlib');

const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const consumers = ['cheerio', 'jsdom'].map(name => {
    const consumer = createRequire(backend.resolve(name));
    return { name, consumer, undici: consumer('undici') };
});
const text = 'Ölçü & çizim şğüıöç İstanbul';
const html = `<main><h1>${text.replace('&', '&amp;')}</h1><p data-status="hazır">Çağrı</p></main>`;

test('Cheerio and JSDOM resolve the reviewed npm Undici 7.30.0 release', t => {
    for (const { name, consumer } of consumers) {
        t.diagnostic(`${name} Undici entry: ${consumer.resolve('undici')}`);
    }
    assert.deepEqual(consumers.map(({ name, consumer }) => ({
        name, version: consumer('undici/package.json').version,
    })), [{ name: 'cheerio', version: '7.30.0' }, { name: 'jsdom', version: '7.30.0' }]);
});

test('actual backend Cheerio preserves Turkish HTML text and attributes', () => {
    const $ = backend('cheerio').load(html);
    assert.equal($('h1').text(), text);
    assert.equal($('p').attr('data-status'), 'hazır');
    assert.equal($('p').text(), 'Çağrı');
});

test('actual backend rich-text sanitizer preserves Turkish formatting and removes active markup', () => {
    const filename = path.resolve(__dirname, '../apps/backend/src/common/utils/rich-text-sanitizer.ts');
    const ts = backend('typescript');
    const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
        fileName: filename,
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    }).outputText;
    const loaded = new Module(filename, module);
    loaded.filename = filename;
    loaded.paths = Module._nodeModulePaths(path.dirname(filename));
    loaded._compile(compiled, filename);
    const input = '<p onclick="synthetic()">Ölçü <strong>çizim</strong></p><script>synthetic()</script>';
    assert.equal(loaded.exports.sanitizeRichTextHtml(input), '<p>Ölçü <strong>çizim</strong></p>');
    assert.equal(loaded.exports.stripHtml(input), 'Ölçü çizim');
    assert.equal(loaded.exports.isRichTextEffectivelyEmpty('<p><br></p>'), true);
    assert.equal(loaded.exports.isRichTextEffectivelyEmpty('<p>Ölçü</p>'), false);
});

test('actual backend JSDOM preserves Turkish DOM without running scripts or loading resources', () => {
    const { JSDOM } = backend('jsdom');
    // No runScripts/resources options: the document remains inert.
    const dom = new JSDOM(`${html}<script>window.syntheticExecuted = true;</script>`);
    try {
        assert.equal(dom.window.document.querySelector('h1').textContent, text);
        assert.equal(dom.window.document.querySelector('p').getAttribute('data-status'), 'hazır');
        assert.equal(dom.window.syntheticExecuted, undefined);
        assert.equal(dom.window.document.URL, 'about:blank');
    } finally {
        dom.window.close();
    }
});

async function withServer(undici, handler, run) {
    const server = http.createServer(handler);
    server.requestTimeout = 1500;
    server.headersTimeout = 1500;
    // Explicit Agent ignores environment proxy configuration; never global fetch.
    const dispatcher = new undici.Agent({
        connect: { timeout: 500 }, headersTimeout: 1000, bodyTimeout: 1000,
        maxResponseSize: 1024,
    });
    let deadline;
    try {
        await new Promise((resolve, reject) => {
            server.once('error', reject);
            server.listen(0, '127.0.0.1', resolve);
        });
        deadline = setTimeout(() => server.closeAllConnections(), 1000);
        return await run(`http://127.0.0.1:${server.address().port}`, dispatcher);
    } finally {
        clearTimeout(deadline);
        await dispatcher.destroy();
        server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
    }
}

test('JSDOM fromURL exercises its real Undici handler without scripts or subresources', { timeout: 4000 }, async () => {
    const { JSDOM } = backend('jsdom');
    const { undici } = consumers.find(consumer => consumer.name === 'jsdom');
    const visited = [];
    await withServer(undici, (request, response) => {
        visited.push(request.url);
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.end(`${html}<script>window.syntheticExecuted = true;</script><img src="/must-not-load.png">`);
    }, async (url, dispatcher) => {
        // Library adapter compatibility only; this does not prove an app flow.
        // resources: { dispatcher } enables subresources in JSDOM 28. Keep its
        // inert defaults and scope the owned dispatcher to this serial test.
        const previousDispatcher = undici.getGlobalDispatcher();
        let dom;
        try {
            undici.setGlobalDispatcher(dispatcher);
            dom = await JSDOM.fromURL(`${url}/document`);
            assert.equal(dom.window.document.querySelector('h1').textContent, text);
            assert.equal(dom.window.syntheticExecuted, undefined);
            assert.equal(dom.window.document.URL, `${url}/document`);
            assert.deepEqual(visited, ['/document']);
        } finally {
            undici.setGlobalDispatcher(previousDispatcher);
            dom?.window.close();
        }
    });
});

for (const { name, undici } of consumers) {
    test(`${name} npm Undici fetch preserves JSON and decodes a tiny gzip response`, { timeout: 4000 }, async () => {
        const payload = { text, count: 0, enabled: true, optional: null };
        const compressed = gzipSync(Buffer.from(text));
        assert.ok(compressed.length < 256);
        const visited = [];
        await withServer(undici, (request, response) => {
            visited.push(request.url);
            if (request.url === '/json') {
                response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                response.end(JSON.stringify(payload));
            } else {
                response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Content-Encoding': 'gzip' });
                response.end(compressed);
            }
        }, async (url, dispatcher) => {
            const json = await undici.fetch(`${url}/json`, { dispatcher, signal: AbortSignal.timeout(1000) });
            assert.equal(json.status, 200);
            assert.deepEqual(await json.json(), payload);
            const gzip = await undici.fetch(`${url}/gzip`, { dispatcher, signal: AbortSignal.timeout(1000) });
            assert.equal(gzip.status, 200);
            assert.equal(gzip.headers.get('content-encoding'), 'gzip');
            assert.equal(await gzip.text(), text);
            assert.deepEqual(visited, ['/json', '/gzip']);
        });
    });

    test(`${name} npm Undici aborts an unanswered loopback request within a deadline`, { timeout: 4000 }, async () => {
        let received = false;
        await withServer(undici, () => { received = true; }, async (url, dispatcher) => {
            await assert.rejects(undici.fetch(`${url}/timeout`, {
                dispatcher, signal: AbortSignal.timeout(200),
            }), error => {
                assert.equal(error.name, 'TimeoutError');
                return true;
            });
            assert.equal(received, true);
        });
    });
}
