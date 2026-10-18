const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');

// Resolve consumer edges without executing CLIs, watchers or Sentry startup.
const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const child = (parent, name) => createRequire(parent.resolve(name));
const core = child(backend, 'mjml-core');
const beautify = child(core, 'js-beautify');
const editorconfig = child(beautify, 'editorconfig');
const glob = child(beautify, 'glob');
const editorMinimatch = child(editorconfig, 'minimatch');
const globMinimatch = child(glob, 'minimatch');
const sentryNode = child(child(backend, '@sentry/nestjs'), '@sentry/node');
const otel = child(sentryNode, '@fastify/otel');
const otelMinimatch = child(otel, 'minimatch');

function resolvedVersion(consumer, name) {
    let directory = path.dirname(consumer.resolve(name));
    while (directory !== path.dirname(directory)) {
        const manifest = path.join(directory, 'package.json');
        if (existsSync(manifest)) {
            const metadata = JSON.parse(readFileSync(manifest, 'utf8'));
            if (metadata.name === name) return metadata.version;
        }
        directory = path.dirname(directory);
    }
    throw new Error(`Package manifest missing for ${name}`);
}

for (const [label, consumer, dependency, version] of [
    ['editorconfig', editorconfig, 'minimatch', '9.0.9'],
    ['js-beautify glob', glob, 'minimatch', '9.0.9'],
    ['editorconfig minimatch', editorMinimatch, 'brace-expansion', '2.1.7'],
    ['glob minimatch', globMinimatch, 'brace-expansion', '2.1.7'],
    ['Sentry Fastify minimatch', otelMinimatch, 'brace-expansion', '5.0.12'],
]) {
    test(`${label} resolves reviewed ${dependency} ${version}`, (t) => {
        t.diagnostic(consumer.resolve(dependency));
        assert.equal(resolvedVersion(consumer, dependency), version);
    });
}

for (const [label, consumer] of [
    ['editorconfig brace2', editorMinimatch],
    ['glob brace2', globMinimatch],
    ['Sentry brace5', otelMinimatch],
]) {
    test(`${label} expands bounded alternatives, ranges and Turkish paths`, () => {
        const imported = consumer('brace-expansion');
        const expand = typeof imported === 'function' ? imported : imported.expand;
        assert.deepEqual(expand('posta/{taslak,gönderilen}/şablon{1..2}.mjml'), [
            'posta/taslak/şablon1.mjml', 'posta/taslak/şablon2.mjml',
            'posta/gönderilen/şablon1.mjml', 'posta/gönderilen/şablon2.mjml',
        ]);
        assert.deepEqual(expand('sürüm{03..01}'), ['sürüm03', 'sürüm02', 'sürüm01']);
        assert.deepEqual(expand('düz/Çağrı.mjml'), ['düz/Çağrı.mjml']);
    });
}

for (const [label, consumer] of [
    ['editorconfig', editorconfig], ['js-beautify glob', glob], ['Sentry Fastify', otel],
]) {
    test(`${label} minimatch preserves globstar, extglob and negative matches`, () => {
        const { minimatch, braceExpand } = consumer('minimatch');
        const pattern = 'posta/**/@(karşılama|yanıt).{mjml,html}';
        for (const name of ['posta/yanıt.mjml', 'posta/tr/karşılama.html']) {
            assert.equal(minimatch(name, pattern), true, name);
        }
        for (const name of ['posta/tr/diğer.mjml', 'posta/yanıt.js', 'başka/yanıt.mjml']) {
            assert.equal(minimatch(name, pattern), false, name);
        }
        assert.equal(minimatch('posta/tr/yanıt.mjml', '!**/*.js'), true);
        assert.equal(minimatch('posta/yanıt.js', '!**/*.js'), false);
        assert.deepEqual(braceExpand('şablon{1..2}.mjml'), ['şablon1.mjml', 'şablon2.mjml']);
    });
}

test('MJML renders an inline Turkish template with beautification and minification disabled', () => {
    const coreModule = backend('mjml-core');
    const preset = backend('mjml-preset-core');
    const validator = backend('mjml-validator');
    coreModule.assignComponents(coreModule.components, preset.components);
    validator.assignDependencies(validator.dependencies, preset.dependencies);
    const render = coreModule.default;
    const result = render('<mjml><mj-body><mj-section><mj-column><mj-text>Çağrı &amp; Ölçü</mj-text></mj-column></mj-section></mj-body></mjml>', {
        beautify: false, minify: false, ignoreIncludes: true, validationLevel: 'strict',
    });
    assert.deepEqual(result.errors, []);
    assert.match(result.html, /Çağrı &amp; Ölçü/);
    assert.match(result.html, /<html/);
});
