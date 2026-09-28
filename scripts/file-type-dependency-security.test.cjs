const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const nest = createRequire(backend.resolve('@nestjs/common'));
const fileTypeEntry = nest.resolve('file-type');
// Load only the framework validator, never the application or its environment.
const validatorEntry = nest.resolve('./pipes/file/file-type.validator.js');
backend('reflect-metadata');
const { FileTypeValidator } = require(validatorEntry);

// Embedded 1x1 white images generated and decode-checked locally with the
// existing sharp dependency; the test itself does not load an image codec.
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAADElEQVQImWP4//8/AAX+Av5Y8msOAAAAAElFTkSuQmCC', 'base64');
const jpeg = Buffer.from(
    '/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/' +
    '2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/' +
    'wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/' +
    '8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKpAB//Z', 'base64');

function minimalPdf() {
    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 1 1] /Resources << >> >>',
    ];
    const chunks = ['%PDF-1.4\n'];
    const offsets = [];
    for (const [index, object] of objects.entries()) {
        offsets.push(Buffer.byteLength(chunks.join('')));
        chunks.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
    }
    const xref = Buffer.byteLength(chunks.join(''));
    chunks.push('xref\n0 4\n0000000000 65535 f \n');
    chunks.push(...offsets.map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`));
    chunks.push(`trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return Buffer.from(chunks.join(''));
}

test('Nest resolves file-type at the reviewed patched 21.3.2 floor within major 21', t => {
    t.diagnostic(fileTypeEntry);
    const { version } = JSON.parse(readFileSync(path.join(path.dirname(fileTypeEntry), 'package.json'), 'utf8'));
    assert.match(version, /^21\.\d+\.\d+$/);
    const [, minor, patch] = version.split('.').map(Number);
    assert.ok(minor > 3 || (minor === 3 && patch >= 2), `Unreviewed old file-type ${version}`);
});

for (const [label, mime, buffer] of [
    ['PNG', 'image/png', png],
    ['JPEG', 'image/jpeg', jpeg],
    ['PDF', 'application/pdf', minimalPdf()],
]) {
    test(`actual Nest FileTypeValidator accepts the bounded ${label} fixture by magic bytes`, async () => {
        assert.ok(buffer.length < 1024);
        const validator = new FileTypeValidator({ fileType: new RegExp(`^${mime}$`) });
        assert.equal(await validator.isValid({ buffer, mimetype: mime }), true);
        // Detection must rely on the bytes even when client metadata is generic.
        assert.equal(await validator.isValid({ buffer, mimetype: 'application/octet-stream' }), true);
    });
}

test('actual Nest validator rejects mismatched, unknown, empty and missing buffers without MIME fallback', async () => {
    const validator = new FileTypeValidator({ fileType: /^image\/png$/ });
    for (const buffer of [jpeg, minimalPdf(), Buffer.from('not an image'), Buffer.alloc(0)]) {
        assert.equal(await validator.isValid({ buffer, mimetype: 'image/png' }), false);
    }
    assert.equal(await validator.isValid({ mimetype: 'image/png' }), false);
    assert.equal(await validator.isValid(undefined), false);
});

test('actual Nest validator recognizes a tiny empty ZIP archive without extraction', async () => {
    const buffer = Buffer.from('504b0506000000000000000000000000000000000000', 'hex');
    const validator = new FileTypeValidator({ fileType: /^application\/zip$/ });
    assert.equal(await validator.isValid({ buffer, mimetype: 'application/octet-stream' }), true);
});

test('malformed ASF zero-size sub-header terminates and is rejected as an image in an isolated child', () => {
    // GHSA-5v7r-6r5c-r473 / upstream fix 319abf8. Never parse this fixture in
    // the parent: old versions starve the event loop, defeating promise timers.
    const source = `
        const assert = require('node:assert/strict');
        const { pathToFileURL } = require('node:url');
        require(process.argv[3]);
        const { FileTypeValidator } = require(process.argv[2]);
        (async () => {
            const { fileTypeFromBuffer } = await import(pathToFileURL(process.argv[1]).href);
            const buffer = Buffer.alloc(55);
            Buffer.from('3026b2758e66cf11a6d9', 'hex').copy(buffer);
            // 21.3.2 rejects the malformed negative payload instead of the
            // generic ASF result used by the original 21.3.1 loop fix.
            assert.equal(await fileTypeFromBuffer(buffer), undefined);
            const validator = new FileTypeValidator({ fileType: /^image\\/(png|jpeg)$/ });
            assert.equal(await validator.isValid({ buffer, mimetype: 'image/png' }), false);
            process.stdout.write('bounded-asf-ok');
        })().catch(error => { console.error(error); process.exitCode = 1; });
    `;
    const child = spawnSync(process.execPath, ['--max-old-space-size=64', '-e', source, fileTypeEntry, validatorEntry, backend.resolve('reflect-metadata')], {
        cwd: __dirname,
        env: {},
        timeout: 2000,
        killSignal: 'SIGKILL',
        maxBuffer: 4096,
        encoding: 'utf8',
    });
    assert.equal(child.error, undefined, `Isolated detector failed: ${child.error?.code}`);
    assert.equal(child.signal, null);
    assert.equal(child.status, 0, child.stderr);
    assert.equal(child.stdout, 'bounded-asf-ok');
});

// No ZIP bomb fixture: this suite proves bounded signature compatibility and the
// ASF regression only, not ZIP expansion resource limits or end-to-end uploads.
