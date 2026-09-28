const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// Resolve real edges only; never execute SDKs, request clients or type packages.
const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const child = (parent, name) => createRequire(parent.resolve(name));
const storage = child(backend, '@google-cloud/storage');
const retry = child(storage, 'retry-request');
const requestTypes = child(retry, '@types/request/package.json');
const superagent = child(child(backend, 'supertest'), 'superagent');
const superagentTypes = child(child(backend, '@types/supertest/package.json'), '@types/superagent/package.json');
const axios = child(backend, 'axios');
const consumers = [
    ['Google storage -> retry-request -> @types/request (type-only edge)', requestTypes, '2.5.6'],
    ['Supertest -> superagent', superagent, '4.0.6'],
    ['@types/supertest -> @types/superagent (type-only edge)', superagentTypes, '4.0.6'],
    ['Axios', axios, '4.0.6'],
];

for (const [label, consumer, version] of consumers) {
    test(`${label} resolves reviewed form-data ${version}`, (t) => {
        t.diagnostic(consumer.resolve('form-data'));
        assert.equal(consumer('form-data/package.json').version, version);
    });

    test(`${label} preserves Unicode fields, file bytes and multipart length`, () => {
        const FormData = consumer('form-data');
        const form = new FormData();
        const bytes = Buffer.from([0, 127, 128, 255]);
        form.append('başlık[0]', 'Ölçü 🚀');
        form.append('attachment', bytes, { filename: 'çizim.bin', contentType: 'application/octet-stream' });
        const boundary = form.getBoundary();
        const expected = Buffer.concat([
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="başlık[0]"\r\n\r\nÖlçü 🚀\r\n`),
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="attachment"; filename="çizim.bin"\r\nContent-Type: application/octet-stream\r\n\r\n`),
            bytes, Buffer.from(`\r\n--${boundary}--\r\n`),
        ]);
        assert.deepEqual(form.getBuffer(), expected);
        assert.equal(form.getLengthSync(), expected.length);
        assert.equal(form.getHeaders()['content-type'], `multipart/form-data; boundary=${boundary}`);
        assert.deepEqual(bytes, Buffer.from([0, 127, 128, 255]));
    });

    test(`${label} escapes CR, LF and quotes in names and filenames`, () => {
        // Bounded in-memory GHSA-hmw2-7cc7-3qxx regression; never submit this form.
        const FormData = consumer('form-data');
        const form = new FormData();
        form.append('alan"\r\nfixture', Buffer.from('safe'), {
            filename: 'çizim"\r\nfixture.bin', contentType: 'application/octet-stream',
        });
        const boundary = form.getBoundary();
        const expected = `--${boundary}\r\nContent-Disposition: form-data; name="alan%22%0D%0Afixture"; filename="çizim%22%0D%0Afixture.bin"\r\nContent-Type: application/octet-stream\r\n\r\nsafe\r\n--${boundary}--\r\n`;
        assert.equal(form.getBuffer().toString('utf8'), expected);
        assert.equal(form.getLengthSync(), Buffer.byteLength(expected));
    });
}
