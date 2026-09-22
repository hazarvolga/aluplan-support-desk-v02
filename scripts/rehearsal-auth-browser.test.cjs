'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateInvocation, validateFixture, classifyRequest, filterHopHeaders, validateBody, validateLoginResponse, safeLocation, safeFailure, rejectionCategory, captureFailure, ORIGIN } = require('./rehearsal-auth-browser.cjs');
const env = { ALLOW_LOCAL_AUTH_BROWSER: '1', FRONTEND_AUTH_PROBE_RUNTIME: 'isolated-linux',
  ALUPLAN_BROWSER_BACKEND_HOST: 'aluplan-customer-012345abcdef-app' };
const fixture = { userId: '12345678-1234-4234-8234-123456789abc',
  email: '12345678-1234-4234-8234-123456789abc@example.invalid', password: 'a'.repeat(64),
  newPassword: 'b'.repeat(64), resetToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJl',
  expiredToken: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIn0.c2lnbmF0dXJl' };

test('only the exact Next dev login redirect maps back to the isolated browser origin', () => {
  const { normalizeFrontendRedirect: normalize } = require('./rehearsal-auth-browser.cjs');
  const normalizeFrontendRedirect = (status, location) => normalize('frontend', 'GET', '/login', status, location);
  for (const status of [307, 308]) {
    for (const suffix of ['', '?_rsc=abc-123_X']) {
      assert.equal(normalizeFrontendRedirect(status, 'https://localhost:53301/tr/login' + suffix), ORIGIN + '/tr/login' + suffix);
    }
  }
  for (const location of [undefined, null, ['/tr/login'], '/tr/login', 'http://localhost:53301/tr/login',
    'https://localhost:53301/tr/login?token=secret', 'https://localhost:53301/tr/login#token=secret',
    'https://localhost:53301/tr/login?', 'https://localhost:53301/tr/login?_rsc=',
    'https://localhost:53301/tr/login?_rsc=' + 'a'.repeat(101),
    'https://localhost:53301/tr/login?_rsc=a&other=b', 'https://localhost:53301/tr/login/',
    'https://localhost:53301/en/login', 'https://localhost:53301/tr/dashboard',
    'https://user@localhost:53301/tr/login', 'https://localhost:53301.example.invalid/tr/login',
    'https://other.invalid/tr/login', 'https://localhost:53301/tr/../tr/login']) {
    assert.equal(normalizeFrontendRedirect(307, location), location);
  }
  for (const status of [200, 301, 302, 303, 401, 500, undefined]) {
    assert.equal(normalizeFrontendRedirect(status, 'https://localhost:53301/tr/login'), 'https://localhost:53301/tr/login');
  }
  const location = 'https://localhost:53301/tr/login';
  for (const [target, method, requestPath] of [['backend','GET','/login'], ['frontend','POST','/login'],
    ['frontend','GET','/tr/login'], ['frontend','GET','/login?token=secret'], ['frontend','GET','/login/']]) {
    assert.equal(normalize(target, method, requestPath, 307, location), location);
  }
  assert.equal(normalize('frontend','HEAD','/login?_rsc=abc',308,location), ORIGIN+'/tr/login');
});

test('guard requires exact opt-in, Linux, nonroot uid, fixed host shape and no extra arguments', () => {
  assert.equal(validateInvocation(['--run-real-auth-browser'], env, 'linux', 1000), env.ALUPLAN_BROWSER_BACKEND_HOST);
  for (const args of [[], ['--run-real-auth-browser', '--extra'], ['--execute']]) {
    assert.throws(() => validateInvocation(args, env, 'linux', 1000));
  }
  for (const platform of ['darwin', 'win32', undefined]) assert.throws(() => validateInvocation(['--run-real-auth-browser'], env, platform, 1000));
  for (const uid of [0, -1, undefined, '1000', 1.5]) assert.throws(() => validateInvocation(['--run-real-auth-browser'], env, 'linux', uid));
  for (const key of Object.keys(env)) assert.throws(() => validateInvocation(['--run-real-auth-browser'], { ...env, [key]: '' }, 'linux', 1000));
  for (const host of ['localhost', 'aluplan-customer-012345abcdef-app.evil', 'aluplan-customer-012345abcdef-app:4000', 'aluplan-customer-012345ABCDEF-app']) {
    assert.throws(() => validateInvocation(['--run-real-auth-browser'], { ...env, ALUPLAN_BROWSER_BACKEND_HOST: host }, 'linux', 1000));
  }
});

test('fixture is bounded exact-shape synthetic identity with distinct strong passwords and JWT syntax', () => {
  assert.deepEqual(validateFixture(JSON.stringify(fixture)), fixture);
  for (const value of [null, [], {}, { ...fixture, extra: true }, { ...fixture, email: 'real@example.com' },
    { ...fixture, email: 'other@example.invalid' }, { ...fixture, userId: 'invalid' },
    { ...fixture, password: 'a'.repeat(63) }, { ...fixture, newPassword: fixture.password },
    { ...fixture, resetToken: 'secret\nwith.logs' }, { ...fixture, expiredToken: fixture.resetToken },
    { ...fixture, expiredToken: 'a'.repeat(2049) + '.b.c' }]) {
    assert.throws(() => validateFixture(JSON.stringify(value)));
  }
  assert.throws(() => validateFixture(' '.repeat(8193)));
  assert.throws(() => validateFixture('{}\n{}'));
});

test('auth forwarding allowlist is exact in origin method path and query', () => {
  assert.equal(ORIGIN, 'https://acceptance.allplan.net.tr:54443');
  for (const [method, path] of [['GET', '/me'], ['POST', '/me'], ['POST', '/login'], ['POST', '/refresh'], ['POST', '/reset-password']]) {
    assert.equal(classifyRequest(ORIGIN + '/api/v1/auth' + path, method), 'backend');
  }
  assert.equal(classifyRequest(ORIGIN + '/api/v1/auth/system-requirements?locale=tr', 'GET'), 'backend');
  for (const path of ['/api/v1/auth/logout', '/api/v1/auth/lookup', '/api/v1/auth/admin/force-logout', '/api/v1/tickets',
    '/api/v1/auth/me/', '/api/v1/auth/me?token=x', '/api/v1/auth/me#x', '/api/v1/auth/me?',
    '/api/v1/auth/%6de', '/api/v1/auth/../auth/me', '/api/v1/auth/system-requirements?locale=en']) {
    assert.equal(classifyRequest(ORIGIN + path, 'GET'), 'reject');
    assert.equal(classifyRequest(ORIGIN + path, 'POST'), 'reject');
  }
  for (const method of ['PUT', 'OPTIONS', 'CONNECT', 'post', 'DELETE']) assert.equal(classifyRequest(ORIGIN + '/api/v1/auth/login', method), 'reject');
  for (const origin of ['http://acceptance.allplan.net.tr:54443', 'https://acceptance.allplan.net.tr',
    'https://u@acceptance.allplan.net.tr:54443', 'https://127.0.0.1:54443', 'https://allplan.net.tr:54443']) {
    assert.equal(classifyRequest(origin + '/api/v1/auth/me', 'GET'), 'reject');
  }
});

test('frontend permits public auth and local assets, known authenticated pages are blocked separately', () => {
  for (const pathname of ['/tr/login', '/login', '/tr/reset-password', '/tr/register', '/logos/aluplan-logo-white.svg',
    '/logos/Allplan-Authorized-Partner-svg-01.svg', '/_next/static/chunks/app.js']) {
    assert.equal(classifyRequest(ORIGIN + pathname, 'GET'), 'frontend');
    assert.equal(classifyRequest(ORIGIN + pathname, 'POST'), 'reject');
  }
  assert.equal(classifyRequest(ORIGIN + '/tr/login?_rsc=abc', 'GET'), 'frontend');
  for (const pathname of ['/tr/dashboard', '/tr/my-tickets']) assert.equal(classifyRequest(ORIGIN + pathname + '?_rsc=abc', 'GET'), 'blocked-authenticated-page');
  for (const pathname of ['/tr/tickets/private', '/_next/image?url=https://external.invalid/x', '/api/other', '//evil.invalid', '/tr/login?token=secret']) {
    assert.equal(classifyRequest(ORIGIN + pathname, 'GET'), 'reject');
  }
  assert.equal(classifyRequest(ORIGIN + '/__nextjs_original-stack-frames', 'POST'), 'blocked-dev-diagnostics');
  assert.equal(classifyRequest(ORIGIN + '/__nextjs_original-stack-frames?x=1', 'POST'), 'reject');
});

test('hop-by-hop and caller forwarding headers are stripped including Connection-listed tokens', () => {
  const cookies = ['alu_at=a; Secure; HttpOnly', 'alu_rt=b; Secure; HttpOnly'];
  const headers = { Connection: 'keep-alive, X-Internal', 'X-Internal': 'secret', 'Keep-Alive': 'x',
    TE: 'trailers', Trailer: 'x', 'Transfer-Encoding': 'chunked', Upgrade: 'websocket',
    'Proxy-Authorization': 'secret', 'Proxy-Authenticate': 'secret', 'Proxy-Connection': 'x',
    Forwarded: 'host=evil', 'X-Forwarded-For': 'secret', 'X-Forwarded-Host': 'evil', 'X-Forwarded-Proto': 'http',
    'Set-Cookie': cookies, Cookie: 'alu_at=a', 'Content-Type': 'application/json' };
  assert.deepEqual(filterHopHeaders(headers), { 'set-cookie': cookies, cookie: 'alu_at=a', 'content-type': 'application/json' });
  assert.equal(headers['X-Internal'], 'secret');
});

test('unprefixed post-login pages remain denied with exact method and query bounds', () => {
  for (const path of ['/dashboard', '/my-tickets', '/tr/dashboard', '/tr/my-tickets']) {
    for (const method of ['GET', 'HEAD']) {
      for (const suffix of ['', '?_rsc=abc-123']) {
        assert.equal(classifyRequest(ORIGIN + path + suffix, method), 'blocked-authenticated-page');
      }
      for (const suffix of ['/', '?token=secret', '?_rsc=', '?_rsc=a&x=b', '#secret']) {
        assert.equal(classifyRequest(ORIGIN + path + suffix, method), 'reject');
      }
    }
    assert.equal(classifyRequest(ORIGIN + path, 'POST'), 'reject');
    assert.equal(classifyRequest('https://other.invalid' + path, 'GET'), 'reject');
  }
});

test('actual proxy handler denies known blocked classes without forwarding or masking other failures', async (t) => {
  const { createProxy } = require('./rehearsal-auth-browser.cjs');
  const { Readable } = require('node:stream');
  let forwarded = 0;
  t.mock.method(require('node:http'), 'request', () => { forwarded += 1; throw new Error('unexpected upstream'); });
  const counts = { unexpected: 0, proxyErrors: 0, blockedAuthenticatedPages: 0, blockedDevDiagnostics: 0 };
  const server = createProxy({}, env.ALUPLAN_BROWSER_BACKEND_HOST, fixture, counts);
  const invoke = (url, method, headers = {}) => new Promise((resolve, reject) => {
    const request = Readable.from([]);
    Object.assign(request, { url, method, rawHeaders: ['Host', 'acceptance.allplan.net.tr:54443'],
      headers: { host: 'acceptance.allplan.net.tr:54443', ...headers } });
    let status;
    const response = { headersSent: false, writeHead(code) { status = code; this.headersSent = true; },
      end() { try { assert.equal(status, 403); resolve(); } catch (error) { reject(error); } } };
    server.emit('request', request, response);
  });
  for (const path of ['/my-tickets', '/dashboard', '/tr/my-tickets', '/tr/dashboard']) {
    for (const method of ['GET', 'HEAD']) await invoke(path + '?_rsc=abc', method);
  }
  await invoke('/__nextjs_original-stack-frames', 'POST');
  assert.deepEqual(counts, { unexpected: 0, proxyErrors: 0, blockedAuthenticatedPages: 8, blockedDevDiagnostics: 1 });
  for (const [path, method, headers] of [
    ['/my-tickets?token=secret', 'GET', {}], ['/my-tickets', 'POST', {}],
    ['/__nextjs_original-stack-frames?x=1', 'POST', {}], ['/__nextjs_original-stack-frames', 'GET', {}],
    ['/my-tickets', 'GET', { authorization: 'secret' }], ['/my-tickets', 'GET', { host: 'other.invalid' }],
    ['/api/v1/auth/login', 'POST', {}],
  ]) await invoke(path, method, headers);
  assert.deepEqual(counts, { unexpected: 7, proxyErrors: 0, blockedAuthenticatedPages: 8, blockedDevDiagnostics: 1 });
  assert.equal(forwarded, 0);
  server.close();
});

test('proxy bodies are restricted to the fixture identity and approved token/password pairs', () => {
  for (const password of [fixture.password, fixture.newPassword]) {
    assert.doesNotThrow(() => validateBody('/api/v1/auth/login', 'POST', JSON.stringify({ email: fixture.email, password }), fixture));
  }
  for (const token of [fixture.resetToken, fixture.expiredToken]) {
    assert.doesNotThrow(() => validateBody('/api/v1/auth/reset-password', 'POST', JSON.stringify({ token, newPassword: fixture.newPassword }), fixture));
  }
  for (const path of ['/api/v1/auth/me', '/api/v1/auth/refresh']) {
    for (const body of ['', '{}']) assert.doesNotThrow(() => validateBody(path, 'POST', body, fixture));
    assert.throws(() => validateBody(path, 'POST', '{"userId":"other"}', fixture));
  }
  for (const body of [{ email: 'other@example.invalid', password: fixture.password }, { email: fixture.email, password: 'other' },
    { email: fixture.email, password: fixture.password, extra: true }, null, []]) {
    assert.throws(() => validateBody('/api/v1/auth/login', 'POST', JSON.stringify(body), fixture));
  }
  for (const body of [{ token: 'other', newPassword: fixture.newPassword }, { token: fixture.resetToken, newPassword: fixture.password },
    { token: fixture.resetToken, newPassword: fixture.newPassword, extra: true }]) {
    assert.throws(() => validateBody('/api/v1/auth/reset-password', 'POST', JSON.stringify(body), fixture));
  }
  assert.throws(() => validateBody('/api/v1/auth/lookup', 'POST', '{}', fixture));
  assert.throws(() => validateBody('/api/v1/auth/me', 'GET', '{}', fixture));
});

test('successful login response has only a nonsecret user envelope for the fixture user', () => {
  assert.doesNotThrow(() => validateLoginResponse({ user: { id: fixture.userId, email: fixture.email } }, fixture));
  for (const value of [{ user: { id: 'other' } }, { user: null }, { user: { id: fixture.userId }, access_token: 'secret' },
    { user: { id: fixture.userId, refreshTokenHash: 'secret' } }, { user: { id: fixture.userId, passwordHash: 'secret' } }]) {
    assert.throws(() => validateLoginResponse(value, fixture));
  }
});

test('Next development version query is admitted only on owned static assets with thirteen digits', () => {
  const raw = `${ORIGIN}/_next/static/chunks/private.js?v=1777777777777`;
  assert.equal(classifyRequest(raw, 'GET'), 'frontend');
  assert.equal(classifyRequest(`${ORIGIN}/_next/static/css/app.css?v=1777777777777`, 'GET'), 'frontend');
  assert.equal(classifyRequest(raw, 'POST'), 'reject');
  for (const pathname of ['/tr/login', '/api/v1/auth/me', '/_next/image', '/logos/aluplan-logo-white.svg']) {
    assert.equal(classifyRequest(`${ORIGIN}${pathname}?v=1777777777777`, 'GET'), 'reject');
  }
  for (const query of ['?v=secret', '?v=123&token=secret', '?v=', '?v=123', '?v=1777777777777#secret', '?v=17777777777777']) {
    assert.equal(classifyRequest(`${ORIGIN}/_next/static/chunks/private.js${query}`, 'GET'), 'reject');
  }
});

test('bounded request diagnostics distinguish asset version queries and fixed request methods', () => {
  const raw = `${ORIGIN}/_next/static/chunks/private.js?v=1777777777777`;
  assert.deepEqual(safeLocation(raw), { origin: 'acceptance', path: 'next-static', query: 'next-static-version-query', fragment: false });
  assert.equal(rejectionCategory(raw, 'GET'), 'GET:acceptance:next-static:next-static-version-query');
  assert.equal(rejectionCategory(raw, 'CUSTOM-SECRET'), 'OTHER:acceptance:next-static:next-static-version-query');
});

test('failure locations and errors never retain arbitrary paths, queries, credentials or fragments', () => {
  assert.deepEqual(safeLocation('http://localhost:53301/tr/reset-password?token=SECRET#token=SECRET'),
    { origin: 'localhost-loopback', path: 'reset', query: 'other-query', fragment: true });
  assert.equal(safeLocation('http://127.0.0.1:53301/tr/login').origin, 'numeric-loopback');
  assert.equal(safeLocation(`${ORIGIN.replace('https://', 'https://SECRET@')}/tr/login`).origin, 'credentials');
  assert.equal(safeLocation(`${ORIGIN}/api/v1/auth/me`).path, 'auth-me');
  assert.equal(safeLocation(`${ORIGIN}/tr/login?_rsc=123`).query, 'rsc-query');
  for (const raw of ['SECRET', 'https://SECRET.invalid/SECRET?SECRET#SECRET', 'file:///SECRET']) {
    assert.equal(JSON.stringify(safeLocation(raw)).includes('SECRET'), false);
  }
  assert.equal(safeFailure({ name: 'TimeoutError', message: 'SECRET' }), 'timeout');
  assert.equal(safeFailure({ name: 'AssertionError', message: 'SECRET' }), 'assertion');
  assert.equal(safeFailure({ message: 'goto net::ERR_CERT_AUTHORITY_INVALID SECRET' }), 'certificate');
  assert.equal(safeFailure({ message: 'goto net::ERR_NAME_NOT_RESOLVED SECRET' }), 'dns');
  assert.equal(safeFailure({ message: 'SECRET' }), 'other-error');
});

test('locale navigation diagnostics classify fixed public route variants without allowing them', () => {
  const paths = { '/tr': 'locale-root-tr', '/en/': 'locale-root-en', '/de': 'locale-root-de',
    '/en/login': 'login-en', '/de/login': 'login-de', '/tr/login/': 'login-tr-trailing',
    '/en/reset-password': 'reset-password-en', '/reset-password': 'reset-unprefixed',
    '/tr/tr/login': 'double-locale-auth', '/tr/SECRET': 'turkish-other-path',
    '/en/SECRET': 'english-other-path', '/de/SECRET': 'german-other-path' };
  for (const [pathname, category] of Object.entries(paths)) {
    const raw = `${ORIGIN}${pathname}?_rsc=123`;
    assert.equal(safeLocation(raw).path, category);
    assert.equal(classifyRequest(raw, 'GET'), 'reject');
    assert.equal(JSON.stringify(safeLocation(raw)).includes('SECRET'), false);
  }
});

test('first failure location is captured before context cleanup and survives a closed-page snapshot', () => {
  const before = { step: 'reset-login-redirect', failure: 'none', location: safeLocation('about:blank') };
  const captured = captureFailure(before, { name: 'TimeoutError', message: 'SECRET' }, `${ORIGIN}/en/login?token=SECRET#SECRET`);
  assert.notEqual(captured, before);
  assert.equal(before.failure, 'none');
  assert.deepEqual(captured, { step: 'reset-login-redirect', failure: 'timeout',
    location: { origin: 'acceptance', path: 'login-en', query: 'other-query', fragment: true } });
  const afterClose = captureFailure(captured, { message: 'SECRET' }, 'about:blank');
  assert.deepEqual(afterClose, captured);
  assert.equal(JSON.stringify(afterClose).includes('SECRET'), false);
});
