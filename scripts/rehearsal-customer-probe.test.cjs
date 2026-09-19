'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { guard, expectStatus, assertLogin, readProbeRequestTimeout } = require('./rehearsal-customer-probe.cjs');
const safe = { ALLOW_LOCAL_CUSTOMER_PROBE: '1', NODE_ENV: 'production', DATABASE_URL: 'postgresql://probe:secret@aluplan-customer-a1b2-pg:5432/working_clone' };
test('probe request timeout defaults to 5000 milliseconds when absent', () => {
  assert.equal(readProbeRequestTimeout({}), 5000);
});
test('probe request timeout accepts explicit bounded integer milliseconds', () => {
  for (const value of ['5000', '20000', '30000']) {
    assert.equal(readProbeRequestTimeout({ ALUPLAN_PROBE_REQUEST_TIMEOUT_MS: value }), Number(value));
  }
});
test('probe request timeout rejects invalid values without exposing input or environment secrets', () => {
  for (const value of ['', ' ', 'private-invalid-timeout-value', 'Infinity', 'NaN', '5000.5', '4999', '0', '-1', '30001']) {
    assert.throws(
      () => readProbeRequestTimeout({ ...safe, ALUPLAN_PROBE_REQUEST_TIMEOUT_MS: value }),
      { name: 'Error', message: 'invalid probe request timeout' },
    );
  }
});
test('stdin invocation actually executes and rejects absent opt-in', () => {
  const result = spawnSync(process.execPath, ['-'], {
    input: readFileSync(require.resolve('./rehearsal-customer-probe.cjs')),
    env: { ...process.env, ALLOW_LOCAL_CUSTOMER_PROBE: '0' }, encoding: 'utf8', timeout: 5000,
  });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr.trim(), 'customer probe failed');
});
test('only explicit disposable clone is allowed', () => {
  assert.doesNotThrow(() => guard(safe));
  for (const replacement of [{ ALLOW_LOCAL_CUSTOMER_PROBE: '0' }, { NODE_ENV: 'test' },
    { DATABASE_URL: 'postgresql://localhost/working_clone' },
    { DATABASE_URL: safe.DATABASE_URL.replace('working_clone', 'reference') },
    { DATABASE_URL: `${safe.DATABASE_URL}?host=production` }, { DATABASE_URL: 'secret' }]) {
    assert.throws(() => guard({ ...safe, ...replacement }), /^Error: probe guard rejected$/);
  }
});
test('HTTP result must match exact status without exposing body', () => {
  assert.doesNotThrow(() => expectStatus({ status: 201 }, 201));
  assert.throws(() => expectStatus({ status: 500, body: 'secret' }, 201), /^Error: unexpected HTTP status$/);
});
test('login must return user only, never bearer secrets', () => {
  assert.doesNotThrow(() => assertLogin({ user: { id: 'test' } }));
  for (const body of [{}, { user: {}, access_token: 'secret' }, { user: {}, refresh_token: 'secret' }]) {
    assert.throws(() => assertLogin(body));
  }
});
