const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const frontend = createRequire(path.join(root, 'apps/frontend/package.json'));
const createDOMPurify = frontend('dompurify');
const { JSDOM } = frontend('jsdom');
const sourcePath = path.join(root, 'apps/frontend/src/lib/content-sanitizer.ts');

function fixture(t) {
    // Defaults intentionally disable script execution and subresource loading.
    // Never insert unsanitized fixture HTML into a live browser or application.
    const dom = new JSDOM('', { url: 'https://example.test/' });
    t.after(() => dom.window.close());
    const purifier = createDOMPurify(dom.window);
    const module = { exports: {} };
    const code = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
            esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(code, {
        module, exports: module.exports, window: dom.window,
        require(name) {
            assert.equal(name, 'dompurify', 'Only the reviewed sanitizer dependency may load');
            return purifier;
        },
    }, { filename: sourcePath, timeout: 1000 });
    return { window: dom.window, content: module.exports.ContentSanitizer,
        // Announcement callers use the unconfigured default DOMPurify API.
        announcement: createDOMPurify(dom.window) };
}

function parse(window, html) {
    const template = window.document.createElement('template');
    template.innerHTML = html;
    return template.content;
}

test('frontend DOMPurify meets the reviewed patched 3.4.13 floor within major 3', () => {
    const version = createDOMPurify.version;
    assert.match(version, /^3\.\d+\.\d+$/);
    const [, minor, patch] = version.split('.').map(Number);
    assert.ok(minor > 4 || (minor === 4 && patch >= 13), `Unreviewed old DOMPurify ${version}`);
});

test('actual ContentSanitizer preserves supported rich text and safe target links', t => {
    const { window, content } = fixture(t);
    const markup = '<h2>Başlık</h2><h3>Alt</h3><p><strong>Ölçü</strong> <em>😀</em><br>' +
        '<a href="https://example.test/help?q=1&amp;lang=tr" target="_blank">Yardım</a></p>' +
        '<ul><li>Bir</li></ul><ol><li>İki</li></ol><blockquote>Alıntı</blockquote>' +
        '<pre><code>&lt;safe&gt;</code></pre>';
    const result = parse(window, content.sanitize(markup));
    for (const tag of ['h2', 'h3', 'p', 'strong', 'em', 'br', 'a', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code']) {
        assert.ok(result.querySelector(tag), `${tag} must survive`);
    }
    assert.equal(result.querySelector('a').getAttribute('href'), 'https://example.test/help?q=1&lang=tr');
    assert.equal(result.querySelector('a').getAttribute('rel'), 'noopener noreferrer');
    assert.equal(result.querySelector('a').getAttribute('target'), '_blank');
    assert.equal(result.querySelector('code').textContent, '<safe>');
    assert.match(result.textContent, /Ölçü 😀/);
});

test('actual ContentSanitizer removes active tags, unsafe URL schemes and event/style attributes', t => {
    const { window, content } = fixture(t);
    const result = parse(window, content.sanitize(
        '<p onclick="void 0" style="color:red">Korunur<script>void 0</script></p>' +
        '<iframe src="https://example.test/frame"></iframe><object></object><embed><form><input></form>' +
        '<img src="https://example.test/image" onerror="void 0"><svg onload="void 0"></svg>' +
        '<a href="java&#x73;cript:void 0" target="_blank">bad</a>' +
        '<a href="data:text/html,synthetic">data</a><a href="/help">relative</a>',
    ));
    assert.equal(result.querySelector('script,iframe,object,embed,form,input,img,svg'), null);
    assert.equal(result.querySelector('[onclick],[onerror],[onload],[style]'), null);
    const links = result.querySelectorAll('a');
    assert.equal(links[0].getAttribute('href'), null);
    assert.equal(links[0].getAttribute('rel'), 'noopener noreferrer');
    assert.equal(links[1].getAttribute('href'), null);
    assert.equal(links[2].getAttribute('href'), '/help');
    assert.match(result.textContent, /Korunur/);
});

test('actual ContentSanitizer retains empty-input and editor-content behavior', t => {
    const { content } = fixture(t);
    for (const value of [null, undefined, '']) assert.equal(content.sanitize(value), '');
    for (const value of [null, undefined, '', '<p></p>', '<p><br></p>', '<p>&nbsp;</p>']) {
        assert.equal(content.isEffectivelyEmpty(value), true);
    }
    assert.equal(content.isEffectivelyEmpty('<p>Çağrı 😀</p>'), false);
    assert.equal(content.containsAllowedHtml('<strong>Çağrı</strong>'), true);
    assert.equal(content.containsAllowedHtml('Çağrı 😀'), false);
    assert.equal(content.containsAllowedHtml(null), false);
});

test('announcement default sanitation preserves table/image formatting while removing active HTML', t => {
    const { window, announcement } = fixture(t);
    const result = parse(window, announcement.sanitize(
        '<h2>Duyuru</h2><table><tbody><tr><td><strong>Güncelleme</strong></td></tr></tbody></table>' +
        '<img src="https://example.test/logo.png" alt="Logo" onerror="void 0">' +
        '<a href="https://example.test/news">Oku</a><script>void 0</script>' +
        '<iframe src="https://example.test/frame"></iframe><object data="x"></object>' +
        '<a href="javascript:void 0" onclick="void 0">bad</a>',
    ));
    assert.equal(result.querySelector('td strong').textContent, 'Güncelleme');
    assert.equal(result.querySelector('img').getAttribute('src'), 'https://example.test/logo.png');
    assert.equal(result.querySelector('img').getAttribute('alt'), 'Logo');
    assert.equal(result.querySelector('a').getAttribute('href'), 'https://example.test/news');
    assert.equal(result.querySelectorAll('a')[1].getAttribute('href'), null);
    assert.equal(result.querySelector('script,iframe,object,[onclick],[onerror]'), null);
});

test('sanitation remains stable for bounded malformed HTML without executing fixture content', t => {
    const { window, content, announcement } = fixture(t);
    const inputs = ['<p><strong>yarım', '<table><tr><td>Ölçü</table><p>end',
        '<svg><g onload="void 0"></g></svg><p>Metin</p>',
        '<p>' + 'Çağrı 😀 &amp; '.repeat(1000) + '</p>'];
    for (const input of inputs) {
        for (const sanitize of [value => content.sanitize(value), value => announcement.sanitize(value)]) {
            const clean = sanitize(input);
            assert.equal(sanitize(clean), clean);
            assert.equal(parse(window, clean).querySelector('script,[onload]'), null);
        }
    }
});
