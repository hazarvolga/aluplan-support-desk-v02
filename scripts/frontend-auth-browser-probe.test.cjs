'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateInvocation, allowedHttp, resolveRuntime, FRONTEND, API } = require('./frontend-auth-browser-probe.cjs');

test('Linux runtime requires isolated-container marker and a positive integer uid', () => {
  const env = { FRONTEND_AUTH_PROBE_RUNTIME: 'isolated-linux' };
  assert.deepEqual(resolveRuntime('linux', env, 1000), {
    modulePath: '/work/apps/frontend/node_modules/@playwright/test', launchOptions: {},
  });
  for (const uid of [0, undefined, null, -1, 1.5, '1000', NaN]) {
    assert.throws(() => resolveRuntime('linux', env, uid));
  }
  for (const marker of [undefined, '', 'linux', 'isolated-linux ']) {
    assert.throws(() => resolveRuntime('linux', { FRONTEND_AUTH_PROBE_RUNTIME: marker }, 1000));
  }
});

test('runtime paths are fixed, macOS keeps cached Chromium1208, other systems are rejected', () => {
  const mac = resolveRuntime('darwin', {}, undefined);
  assert.match(mac.modulePath, /aluplan-security-candidate-20260917\/apps\/frontend\/node_modules\/@playwright\/test$/);
  assert.match(mac.launchOptions.executablePath, /chromium-1208\/chrome-mac-arm64\/Google Chrome for Testing.app\/Contents\/MacOS\/Google Chrome for Testing$/);
  const linux = resolveRuntime('linux', { FRONTEND_AUTH_PROBE_RUNTIME: 'isolated-linux',
    FRONTEND_AUTH_PROBE_MODULE: '/untrusted', FRONTEND_AUTH_PROBE_EXECUTABLE: '/untrusted' }, 1000);
  assert.equal(linux.modulePath, '/work/apps/frontend/node_modules/@playwright/test');
  assert.deepEqual(linux.launchOptions, {});
  assert.throws(() => resolveRuntime('win32', {}, 1000));
});

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
