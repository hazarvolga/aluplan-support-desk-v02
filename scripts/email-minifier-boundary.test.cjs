const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { test } = require('node:test');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const backend = createRequire(path.join(root, 'apps/backend/package.json'));
const mjmlEntry = backend.resolve('mjml');
const realMjml = backend('mjml');
const mjmlRequire = createRequire(mjmlEntry);
const mjmlPackage = require(path.resolve(path.dirname(mjmlEntry), '../package.json'));
const coreEntry = mjmlRequire.resolve('mjml-core');
const corePackage = require(path.resolve(path.dirname(coreEntry), '../package.json'));
const lockfile = fs.readFileSync(path.join(root, 'pnpm-lock.yaml'), 'utf8');
const sourcePath = path.join(root, 'apps/backend/src/email/email.templates.ts');

function loadRenderer(optionsSeen) {
    const allowed = new Set([sourcePath,
        path.join(root, 'apps/backend/src/email/contracts/base.contract.ts'),
        path.join(root, 'apps/backend/src/common/utils/public-url.util.ts')]);
    function load(file) {
        assert.ok(allowed.has(file), 'Only reviewed renderer sources may execute');
        const module = { exports: {} };
        const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
                esModuleInterop: true },
        }).outputText;
        const localRequire = (name) => {
            if (name.startsWith('.')) return load(path.resolve(path.dirname(file), `${name}.ts`));
            if (name === '@nestjs/common') return { Logger: class { log() {} warn() {} error() {} } };
            if (name === 'mjml') return (input, options) => {
                optionsSeen.push(options);
                return realMjml(input, options);
            };
            assert.ok(['fs', 'path', 'crypto', 'handlebars', 'html-to-text', 'zod'].includes(name));
            return backend(name);
        };
        vm.runInNewContext(code, { module, exports: module.exports, require: localRequire,
            __dirname: path.dirname(file), Buffer, URL,
            process: { cwd: () => root, env: { NODE_ENV: 'test' } } }, { filename: file });
        return module.exports;
    }
    return load(sourcePath).TemplateService;
}

test('production MJML dependencies do not include the unmaintained CLI or vulnerable html-minifier', () => {
    assert.equal(mjmlPackage.dependencies['mjml-cli'], undefined);
    assert.equal(corePackage.dependencies['html-minifier'], undefined);
    const mjmlSnapshot = lockfile.match(/^  mjml@4\.18\.0\(patch_hash=[^\n]+\n(?:(?!^  [^ ])[^\n]*\n)*/m)?.[0];
    const coreSnapshot = lockfile.match(/^  mjml-core@4\.18\.0\(patch_hash=[^\n]+\n(?:(?!^  [^ ])[^\n]*\n)*/m)?.[0];
    assert.ok(mjmlSnapshot, 'The patched MJML snapshot must be present in the lockfile');
    assert.ok(coreSnapshot, 'The patched MJML core snapshot must be present in the lockfile');
    assert.doesNotMatch(mjmlSnapshot, /^      mjml-cli:/m);
    assert.doesNotMatch(coreSnapshot, /^      html-minifier:/m);
});

test('deprecated core minification fails closed instead of loading an unsafe minifier', () => {
    const input = '<mjml><mj-body><mj-section><mj-column><mj-text>Fixture</mj-text></mj-column></mj-section></mj-body></mjml>';
    assert.throws(() => realMjml(input, { minify: true }), /minify option is not supported/i);
});

test('real transactional and raw templates preserve rendering with minification disabled', () => {
    const optionsSeen = [];
    const renderer = loadRenderer(optionsSeen);
    const brand = { name: 'Synthetic Brand', email: 'support@example.test',
        help_center_url: 'https://example.test', api_base_url: 'https://api.example.test/api/v1',
        logo_url: 'https://example.test/logo.png' };
    for (const template of ['ticket-created', 'password-reset', 'raw']) {
        const result = renderer.compile(template, { locale: 'tr', dynamicSubject: 'Çağrı testi',
            ticketNumber: 'FIXTURE-1', ticketSubject: 'Ölçü kontrolü', customerName: 'Çağrı',
            ticketUrl: 'https://example.test/ticket/fixture', resetUrl: 'https://example.test/reset/fixture',
            mjml: '<mjml><mj-body><mj-section><mj-column><mj-text>Çağrı testi</mj-text></mj-column></mj-section></mj-body></mjml>' }, brand);
        assert.ok(result.html.length > 500);
        assert.ok(result.text.length > 5);
        assert.equal(result.subject, 'Çağrı testi');
        if (template === 'password-reset') assert.ok(result.html.includes('https://example.test/reset/fixture'));
        else assert.match(result.text, /Çağrı/);
    }
    assert.equal(optionsSeen.length, 3);
    for (const options of optionsSeen) {
        assert.equal(options.minify, false, 'Do not rely on a dependency default');
        assert.equal(options.beautify, false);
    }
});
