'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateInvocation, allowedHttp, resolveRuntime, safeLocation, unexpectedHttpCategory, FRONTEND, API } = require('./frontend-auth-browser-probe.cjs');

test('failure location diagnostics redact query, fragment, credentials and arbitrary paths', () => {
  assert.deepEqual(safeLocation(`${FRONTEND}/tr/reset-password?token=secret#token=secret`), { origin: 'frontend', pathname: '/tr/reset-password' });
  assert.deepEqual(safeLocation('http://127.0.0.1:53301/tr/login?token=secret'), { origin: 'numeric-loopback-alias', pathname: '/tr/login' });
  for (const raw of ['https://secret.invalid/private-token?secret#secret', 'invalid secret', 'file:///secret']) {
    assert.deepEqual(safeLocation(raw), { origin: 'other', pathname: 'other' });
  }
  assert.deepEqual(safeLocation('http://secret@127.0.0.1:53301/tr/login'), { origin: 'other', pathname: '/tr/login' });
  for (const pathname of ['/login', '/tr/login', '/en/login', '/de/login', '/tr/register']) {
    assert.equal(safeLocation(`${FRONTEND}${pathname}`).pathname, pathname);
  }
  assert.equal(safeLocation(`${FRONTEND}/tr/reset-password/secret`).pathname, 'other');
});

test('unexpected HTTP categories are fixed and reject diagnostic endpoint variants', () => {
  assert.equal(unexpectedHttpCategory(`${FRONTEND}/__nextjs_original-stack-frames?secret`, 'POST'), 'frontend-disallowed-method');
  assert.equal(unexpectedHttpCategory(`${FRONTEND}/__nextjs_original-stack-frames`, 'PUT'), 'frontend-disallowed-method');
  assert.equal(unexpectedHttpCategory(`${FRONTEND}/secret`, 'POST'), 'frontend-disallowed-method');
  assert.equal(unexpectedHttpCategory(`${API}/private-secret`, 'GET'), 'unmocked-api');
  assert.equal(unexpectedHttpCategory('http://127.0.0.1:53301/tr/login?secret', 'GET'), 'http-unapproved-origin');
  assert.equal(unexpectedHttpCategory('invalid-secret', 'POST'), 'http-unapproved-origin');
});

test('only exact owned POST dev-stack diagnostics receive the separately blocked category', () => {
  assert.equal(FRONTEND, 'http://localhost:53301');
  assert.equal(API, 'http://127.0.0.1:53302');
  const endpoint = `${FRONTEND}/__nextjs_original-stack-frames`;
  assert.equal(unexpectedHttpCategory(endpoint, 'POST'), 'local-dev-diagnostics');
  for (const raw of [`${endpoint}?`, `${endpoint}?x=1`, `${endpoint}#x`, `${endpoint}/`,
    endpoint.replace('localhost', 'user@localhost'), endpoint.replace('localhost', '127.0.0.1'),
    endpoint.replace(':53301', ':53303')]) {
    assert.notEqual(unexpectedHttpCategory(raw, 'POST'), 'local-dev-diagnostics');
  }
  for (const method of ['GET', 'PUT', 'OPTIONS', 'post']) {
    assert.notEqual(unexpectedHttpCategory(endpoint, method), 'local-dev-diagnostics');
  }
});

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
  for (const invalid of [[], args.slice(1), [...args, '--extra'], [args[0], '--frontend-origin=http://127.0.0.1:53301', args[2]]]) {
    assert.throws(() => validateInvocation(invalid, { FRONTEND_AUTH_PROBE: 'synthetic-ui-only' }));
  }
  assert.throws(() => validateInvocation(args, {}));
});

test('network guard accepts only the two exact HTTP origins without credentials', () => {
  assert.equal(allowedHttp(`${FRONTEND}/tr/login`), true);
  assert.equal(allowedHttp(`${API}/api/v1/auth/me`), true);
  for (const url of ['http://127.0.0.1:53301/', 'http://127.0.0.1:53303/', 'https://localhost:53301/',
    'ws://localhost:53301/', 'http://user@localhost:53301/', 'https://allplan.net.tr/', 'file:///tmp/a', 'data:text/plain,a', 'invalid']) {
    assert.equal(allowedHttp(url), false);
  }
});
