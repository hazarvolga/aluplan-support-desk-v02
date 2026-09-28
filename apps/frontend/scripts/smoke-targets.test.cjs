const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const smoke = readFileSync(join(__dirname, '..', 'e2e', 'smoke.spec.ts'), 'utf8');

test('smoke targets are fixed to local frontend and backend', () => {
    assert.match(smoke, /const FRONTEND_URL = ['"]http:\/\/localhost:3000['"]/);
    assert.match(smoke, /const API_URL = ['"]http:\/\/localhost:4000['"]/);
});

test('smoke suite has no remote target or environment override', () => {
    assert.doesNotMatch(smoke, /STAGING_URL|STAGING_API_URL|process\.env|https?:\/\/staging\./);
});

test('smoke uses correct local API and locale-prefixed login routes', () => {
    assert.match(smoke, /request\.get\(`\$\{API_URL\}\/api\/v1\/health`\)/);
    assert.match(smoke, /page\.goto\(`\$\{FRONTEND_URL\}\/tr\/login`\)/);
    assert.match(smoke, /request\.get\(`\$\{API_URL\}\/api\/docs`\)/);
});
