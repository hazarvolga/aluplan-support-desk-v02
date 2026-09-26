const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const path = require('node:path');
const test = require('node:test');

const frontend = createRequire(path.resolve(__dirname, '../apps/frontend/package.json'));
const autoprefixer = createRequire(frontend.resolve('autoprefixer/package.json'));
const sentry = createRequire(frontend.resolve('@sentry/nextjs/package.json'));
const webpack = createRequire(sentry.resolve('webpack/package.json'));
const browserslist = autoprefixer('browserslist');

test('Autoprefixer and webpack resolve the reviewed standalone Browserslist patch', () => {
    assert.equal(autoprefixer('browserslist/package.json').version, '4.28.7');
    assert.equal(webpack('browserslist'), browserslist);
});

test('explicit targets and exclusion preserve deterministic browser selection', () => {
    assert.deepEqual(browserslist(['chrome 100', 'firefox 100']), ['chrome 100', 'firefox 100']);
    assert.deepEqual(browserslist(['chrome 100', 'firefox 100', 'not firefox 100']), ['chrome 100']);
});

test('invalid prototype-like queries fail without affecting later valid queries', () => {
    for (const query of ['__proto__', 'constructor', 'not-a-real-browser']) {
        assert.throws(() => browserslist(query), { name: 'BrowserslistError' });
        assert.deepEqual(browserslist('chrome 100'), ['chrome 100']);
    }
});
