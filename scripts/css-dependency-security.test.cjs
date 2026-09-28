const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const frontendDirectory = path.resolve(__dirname, '../apps/frontend');
// node --test isolates this file in its own process. Match the real build's cwd
// so Tailwind discovers the project configuration instead of its empty default.
process.chdir(frontendDirectory);
const frontend = createRequire(path.join(frontendDirectory, 'package.json'));
const next = createRequire(frontend.resolve('next/package.json'));
const postcss = next('postcss');
const fromPostcss = createRequire(next.resolve('postcss/package.json'));
const { lazyPostCSS } = next('next/dist/build/webpack/config/blocks/css/index.js');
const sourceMap = JSON.stringify({
    version: 3, sources: ['synthetic.css'], names: [], mappings: 'AAAA',
    sourcesContent: ['.sample { color: red }'],
});

test('Next and frontend resolve the reviewed PostCSS and nanoid versions', () => {
    assert.equal(next('postcss/package.json').version, '8.5.28');
    assert.equal(frontend('postcss/package.json').version, '8.5.28');
    assert.equal(fromPostcss('nanoid/package.json').version, '3.3.19');
});

test('actual Next PostCSS loader preserves existing Tailwind and Autoprefixer pipeline', async () => {
    const loaded = await lazyPostCSS(frontendDirectory, [], false, false);
    assert.equal(loaded.postcss, postcss);
    const result = await loaded.postcssWithPlugins.process(
        '/* Türkçe: güvenli */ .sample { @apply flex font-bold; --label: "Yanıt"; }',
        { from: undefined, map: false },
    );
    assert.match(result.css, /display:\s*flex/);
    assert.match(result.css, /font-weight:\s*700/);
    assert.match(result.css, /Türkçe: güvenli/);
    assert.match(result.css, /--label:\s*"Yanıt"/);
    assert.doesNotMatch(result.css, /@apply/);
});

test('installed Autoprefixer works with Next PostCSS and explicit browser targets', async () => {
    const result = await postcss([frontend('autoprefixer')({ overrideBrowserslist: ['Safari 12'] })])
        .process('.sample { user-select: none }', { from: undefined, map: false });
    assert.match(result.css, /-webkit-user-select:\s*none/);
    assert.match(result.css, /(?:^|[;\s])user-select:\s*none/);
});

test('source maps allow adjacent files but do not auto-load traversal or symlink escapes', t => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'aluplan-css-regression-'));
    t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
    const cssDirectory = path.join(directory, 'css');
    fs.mkdirSync(cssDirectory);
    fs.writeFileSync(path.join(cssDirectory, 'allowed.map'), sourceMap);
    fs.writeFileSync(path.join(directory, 'outside.map'), sourceMap);
    fs.symlinkSync(path.join(directory, 'outside.map'), path.join(cssDirectory, 'linked.map'));
    const parse = name => postcss.parse(`.sample { color: red }\n/*# sourceMappingURL=${name} */`,
        { from: path.join(cssDirectory, 'input.css') }).first.source.input.map;
    assert.equal(parse('allowed.map').text, sourceMap);
    assert.equal(parse('../outside.map'), undefined);
    assert.equal(parse('linked.map'), undefined);
});

test('inline and explicitly supplied source maps remain compatible', () => {
    const inline = Buffer.from(sourceMap).toString('base64');
    const parsed = postcss.parse(`.sample { color: red }\n/*# sourceMappingURL=data:application/json;base64,${inline} */`);
    assert.equal(parsed.first.source.input.map.text, sourceMap);
    const explicit = postcss.parse('.sample { color: red }', { map: { prev: sourceMap } });
    assert.equal(explicit.first.source.input.map.text, sourceMap);
});

test('PostCSS nanoid supports fixed-size IDs and bounded malformed-size handling', () => {
    const entry = fromPostcss.resolve('nanoid/non-secure');
    const { nanoid } = require(entry);
    assert.match(nanoid(6), /^[A-Za-z0-9_-]{6}$/);
    assert.match(nanoid(), /^[A-Za-z0-9_-]{21}$/);
    // Old versions loop forever on negative sizes: isolate under a hard timeout and heap cap.
    const result = spawnSync(process.execPath, ['--max-old-space-size=32', '-e',
        `const assert = require('node:assert/strict'); const n = require(${JSON.stringify(entry)});
        assert.equal(n.nanoid(-1), ''); assert.equal(n.customAlphabet('ab')(-1), '');`],
        { encoding: 'utf8', timeout: 1000, maxBuffer: 16384 });
    assert.equal(result.error, undefined, 'Nanoid child exceeded its execution bound');
    assert.equal(result.signal, null, 'Nanoid child was terminated');
    assert.equal(result.status, 0, 'Nanoid child failed its assertions');
});
