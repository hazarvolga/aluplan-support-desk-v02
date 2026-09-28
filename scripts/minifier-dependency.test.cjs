const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const frontend = createRequire(path.resolve(__dirname, '../apps/frontend/package.json'));
const sentry = createRequire(frontend.resolve('@sentry/nextjs/package.json'));
const webpackRequire = createRequire(sentry.resolve('webpack/package.json'));
const webpack = sentry('webpack');
const TerserPlugin = webpackRequire('terser-webpack-plugin');

test('actual webpack resolves the reviewed Terser plugin release', () => {
    assert.equal(webpackRequire('terser-webpack-plugin/package.json').version, '5.5.0');
});

test('bundled serializer sanitizes spoofed RegExp flags and rejects invalid date text', () => {
    const plugin = createRequire(webpackRequire.resolve('terser-webpack-plugin/package.json'));
    const serialize = plugin('./dist/serialize-javascript.js');
    const expression = /test/g;
    Object.defineProperty(expression, 'flags', { value: 'g";SYNTHETIC_MARKER;//' });
    assert.equal(serialize(expression), 'new RegExp("test", "g")');
    const date = new Date('2020-01-01T00:00:00Z');
    Object.defineProperty(date, 'toISOString', { value: () => 'SYNTHETIC_INVALID_DATE' });
    assert.throws(() => serialize(date), { name: 'TypeError', message: 'Invalid Date ISO string' });
});

for (const parallel of [false, 1]) {
    test(`real minifier preserves functions, RegExp options and source maps; parallel=${parallel}`,
        { timeout: 30000 }, async t => {
            if (parallel) assert.equal(TerserPlugin.getAvailableNumberOfCores(1), 1);
            const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'aluplan-minifier-'));
            t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
            const entry = path.join(directory, 'entry.js');
            fs.writeFileSync(entry, '/*! keep synthetic */ function keepAnswer() { return 40 + 2; } module.exports = { value: keepAnswer(), name: keepAnswer.name };');
            const compiler = webpack({
                mode: 'production', context: directory, entry, target: 'node',
                devtool: 'source-map', cache: false,
                output: { path: path.join(directory, 'out'), filename: 'bundle.js', library: { type: 'commonjs2' } },
                optimization: { minimize: true, minimizer: [new TerserPlugin({
                    parallel, extractComments: false,
                    terserOptions: {
                        keep_fnames: /^keep/,
                        format: { comments: function (_node, comment) { return /keep synthetic/.test(comment.value); } },
                    },
                })] },
            });
            try {
                const stats = await new Promise((resolve, reject) => compiler.run((error, result) => error ? reject(error) : resolve(result)));
                assert.equal(stats.hasErrors(), false, stats.toString({ all: false, errors: true }));
                const bundle = fs.readFileSync(path.join(directory, 'out/bundle.js'), 'utf8');
                assert.match(bundle, /keep synthetic/);
                assert.match(bundle, /sourceMappingURL=bundle.js.map/);
                const map = JSON.parse(fs.readFileSync(path.join(directory, 'out/bundle.js.map'), 'utf8'));
                assert.equal(map.version, 3);
                assert.ok(map.sources.some(source => source.endsWith('entry.js')));
                assert.ok(map.mappings.length > 0);
                // Trusted synthetic fixture only: Node VM is not a security sandbox.
                const context = { module: { exports: {} } };
                vm.runInNewContext(bundle, context, { timeout: 1000 });
                assert.equal(context.module.exports.value, 42);
                assert.equal(context.module.exports.name, 'keepAnswer');
            } finally {
                await new Promise((resolve, reject) => compiler.close(error => error ? reject(error) : resolve()));
            }
        });
}
