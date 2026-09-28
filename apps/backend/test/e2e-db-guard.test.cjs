const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const guard = path.join(__dirname, 'e2e-db-guard.cjs');
const safe = {
  NODE_ENV: 'test',
  BACKEND_E2E_DISPOSABLE_DB: 'aluplan-test-ephemeral',
  DATABASE_URL: 'postgresql://postgres:testpassword@127.0.0.1:5433/aluplan_test?schema=public',
};

function check(overrides) {
  const env = { ...process.env, ...safe, ...overrides };
  return spawnSync(process.execPath, ['-e', 'require(process.argv[1])', guard], {
    env,
    encoding: 'utf8',
  });
}

test('accepts only explicitly opted-in disposable loopback E2E database', () => {
  assert.equal(check({}).status, 0);
});

for (const [label, overrides] of [
  ['no opt-in', { BACKEND_E2E_DISPOSABLE_DB: '' }],
  ['production mode', { NODE_ENV: 'production' }],
  ['production host', { DATABASE_URL: 'postgresql://postgres:pw@db.example.com:5433/aluplan_test?schema=public' }],
  ['production name', { DATABASE_URL: 'postgresql://postgres:pw@127.0.0.1:5433/aluplan_support?schema=public' }],
  ['wrong local port', { DATABASE_URL: 'postgresql://postgres:pw@127.0.0.1:5432/aluplan_test?schema=public' }],
  ['invalid URL', { DATABASE_URL: 'not-a-url' }],
]) {
  test(`rejects ${label} before any E2E write`, () => {
    assert.notEqual(check(overrides).status, 0);
  });
}
