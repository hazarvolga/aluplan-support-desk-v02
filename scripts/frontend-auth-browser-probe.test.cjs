'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateInvocation, allowedHttp, FRONTEND, API } = require('./frontend-auth-browser-probe.cjs');

test('execution requires explicit synthetic opt-in and exact loopback origins', () => {
  const args = ['--run-synthetic-ui', `--frontend-origin=${FRONTEND}`, `--api-origin=${API}`];
  assert.doesNotThrow(() => validateInvocation(args, { FRONTEND_AUTH_PROBE: 'synthetic-ui-only' }));
  for (const invalid of [[], args.slice(1), [...args, '--extra'], [args[0], '--frontend-origin=http://localhost:53301', args[2]]]) {
    assert.throws(() => validateInvocation(invalid, { FRONTEND_AUTH_PROBE: 'synthetic-ui-only' }));
  }
  assert.throws(() => validateInvocation(args, {}));
});

test('network guard accepts only the two exact HTTP origins without credentials', () => {
  assert.equal(allowedHttp(`${FRONTEND}/tr/login`), true);
  assert.equal(allowedHttp(`${API}/api/v1/auth/me`), true);
  for (const url of ['http://localhost:53301/', 'http://127.0.0.1:53303/', 'https://127.0.0.1:53301/',
    'ws://127.0.0.1:53301/', 'http://user@127.0.0.1:53301/', 'https://allplan.net.tr/', 'file:///tmp/a', 'data:text/plain,a', 'invalid']) {
    assert.equal(allowedHttp(url), false);
  }
});
