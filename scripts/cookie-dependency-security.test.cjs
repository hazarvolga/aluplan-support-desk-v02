const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createRequire } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

// Resolve the actual MJML chain without executing its renderer or any CLI.
const backend = createRequire(path.resolve(__dirname, '../apps/backend/package.json'));
const mjml = createRequire(backend.resolve('mjml'));
const core = createRequire(mjml.resolve('mjml-core'));
const beautify = createRequire(core.resolve('js-beautify'));
const entry = beautify.resolve('js-cookie');
const source = readFileSync(entry, 'utf8');

function fixture() {
    const writes = [];
    const jar = new Map();
    const document = Object.defineProperty({}, 'cookie', {
        get: () => [...jar].map(([name, value]) => `${name}=${value}`).join('; '),
        set(value) {
            writes.push(value);
            const [pair, ...attributes] = value.split('; ');
            const separator = pair.indexOf('=');
            const name = pair.slice(0, separator);
            const expires = attributes.find(attribute => attribute.startsWith('expires='));
            if (expires && Date.parse(expires.slice(8)) < Date.now()) jar.delete(name);
            else jar.set(name, pair.slice(separator + 1));
        },
    });
    const context = vm.createContext({ document });
    // Installed trusted UMD only; this VM models a cookie sink, not browser policy.
    vm.runInContext(source, context, { filename: entry, timeout: 1000 });
    return { cookies: context.Cookies, writes, context };
}

test('MJML js-beautify consumer resolves reviewed js-cookie 3.0.8', t => {
    t.diagnostic(entry);
    assert.equal(beautify('js-cookie/package.json').version, '3.0.8');
});

test('installed UMD preserves Unicode cookie set, get and remove', () => {
    const { cookies, writes } = fixture();
    const name = 'Ölçü';
    const value = 'Çağrı şğüıöç + & =';
    cookies.set(name, value, { path: '/support', sameSite: 'Strict', secure: true });
    assert.equal(cookies.get(name), value);
    assert.equal(cookies.get()[name], value);
    assert.match(writes[0], /; path=\/support; sameSite=Strict; secure$/);
    cookies.remove(name, { path: '/support' });
    assert.equal(cookies.get(name), undefined);
    assert.match(writes[1], /; path=\/support; expires=/);
});

for (const mode of ['set', 'withAttributes', 'remove']) {
    test(`${mode} ignores tiny JSON prototype attributes and preserves safe defaults`, () => {
        const { cookies, writes, context } = fixture();
        const safe = cookies.withAttributes({ path: '/support', sameSite: 'Strict', secure: true });
        const input = JSON.parse('{"__proto__":{"domain":"attacker.invalid","path":"/attacker","sameSite":"None","syntheticMarker":"injected"}}');
        const before = JSON.stringify(input);
        if (mode === 'set') safe.set('bounded', 'value', input);
        else if (mode === 'remove') safe.remove('bounded', input);
        else safe.withAttributes(input).set('bounded', 'value');
        const output = writes.at(-1);
        assert.doesNotMatch(output, /attacker|syntheticMarker|sameSite=None|__proto__/);
        assert.match(output, /; path=\/support(?:;|$)/);
        assert.match(output, /; sameSite=Strict(?:;|$)/);
        assert.match(output, /; secure(?:;|$)/);
        assert.equal(safe.attributes.path, '/support');
        assert.equal(safe.attributes.sameSite, 'Strict');
        assert.equal(JSON.stringify(input), before);
        assert.equal(vm.runInContext('Object.prototype.syntheticMarker', context), undefined);
        assert.equal(Object.prototype.syntheticMarker, undefined);
    });
}
