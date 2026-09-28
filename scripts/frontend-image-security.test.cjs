const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const test = require('node:test');

// Resolve the dependency used by the actual frontend Next.js installation.
const frontend = createRequire(path.resolve(__dirname, '../apps/frontend/package.json'));
const next = createRequire(frontend.resolve('next/package.json'));
const sharp = next('sharp');
const { optimizeImage, getSharp, detectContentType, getImageSize } = next('next/dist/server/image-optimizer.js');
const input = () => sharp({ create: {
    width: 16, height: 12, channels: 4,
    background: { r: 20, g: 100, b: 180, alpha: 1 },
} }).png().toBuffer();
const options = { width: 8, quality: 75, concurrency: 1, limitInputPixels: 1024, timeoutInSeconds: 2 };

function atLeast(actual, minimum) {
    const a = actual.split('.').map(Number);
    const b = minimum.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        if (a[i] !== b[i]) return a[i] > b[i];
    }
    return true;
}

test('Next resolves the reviewed sharp release and patched native dependencies', t => {
    t.diagnostic(JSON.stringify({ sharp: sharp.versions.sharp, vips: sharp.versions.vips, heif: sharp.versions.heif }));
    assert.equal(sharp.versions.sharp, '0.35.4');
    assert.equal(getSharp(1), sharp);
    assert.ok(atLeast(sharp.versions.vips, '8.18.3'));
    assert.ok(atLeast(sharp.versions.heif, '1.23.2'));
});

for (const contentType of ['image/png', 'image/jpeg', 'image/webp', 'image/avif']) {
    test(`Next optimizer preserves dimensions for synthetic ${contentType}`, { timeout: 5000 }, async () => {
        const output = await optimizeImage({ ...options, buffer: await input(), contentType });
        // Next intentionally blocks some Sharp loaders; do not unblock them to inspect AVIF.
        assert.equal(await detectContentType(output), contentType);
        const metadata = await getImageSize(output);
        assert.equal(metadata.width, 8);
        assert.equal(metadata.height, 6);
        assert.ok(output.length > 0 && output.length < 16384);
    });
}

test('Next optimizer rejects a tiny non-image without network or external files', { timeout: 5000 }, async () => {
    await assert.rejects(optimizeImage({ ...options, buffer: Buffer.from('synthetic non-image'), contentType: 'image/png' }));
});

test('Next optimizer retains its explicit input-pixel limit', { timeout: 5000 }, async () => {
    await assert.rejects(optimizeImage({ ...options, limitInputPixels: 100, buffer: await input(), contentType: 'image/png' }), /pixel limit/i);
});
