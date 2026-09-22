'use strict';
// Local sanitized-clone acceptance only. Real UI/backend/cookies; no auth mocks or stored profiles.
const assert = require('node:assert/strict');
const ORIGIN = 'https://acceptance.allplan.net.tr:54443';
const HOST = 'acceptance.allplan.net.tr:54443';
const API = '/api/v1/auth';
const REQUEST_MS = 30_000;
let stage = 'invocation';

function validateInvocation(args, env, platform, uid) {
  assert.deepEqual(args, ['--run-real-auth-browser']);
  assert.equal(env.ALLOW_LOCAL_AUTH_BROWSER, '1');
  assert.equal(env.FRONTEND_AUTH_PROBE_RUNTIME, 'isolated-linux');
  assert.equal(platform, 'linux');
  assert.ok(Number.isInteger(uid) && uid > 0);
  assert.match(env.ALUPLAN_BROWSER_BACKEND_HOST || '', /^aluplan-customer-[a-f0-9]{12}-app$/);
  return env.ALUPLAN_BROWSER_BACKEND_HOST;
}

function validateFixture(raw) {
  assert.equal(typeof raw, 'string');
  assert.ok(Buffer.byteLength(raw) <= 8192);
  const value = JSON.parse(raw);
  assert.ok(value && !Array.isArray(value) && typeof value === 'object');
  assert.deepEqual(Object.keys(value).sort(), ['email', 'expiredToken', 'newPassword', 'password', 'resetToken', 'userId']);
  assert.match(value.userId, /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  assert.equal(value.email, `${value.userId}@example.invalid`);
  for (const key of ['password', 'newPassword']) assert.match(value[key], /^[a-f0-9]{64}$/);
  assert.notEqual(value.password, value.newPassword);
  for (const key of ['resetToken', 'expiredToken']) {
    assert.equal(typeof value[key], 'string');
    assert.ok(value[key].length <= 2048);
    assert.match(value[key], /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  }
  assert.notEqual(value.resetToken, value.expiredToken);
  return Object.freeze(value);
}

function classifyRequest(raw, method) {
  try {
    const url = new URL(raw);
    if (url.origin !== ORIGIN || url.username || url.password || url.hash || raw !== `${ORIGIN}${url.pathname}${url.search}`) return 'reject';
    if (url.pathname.startsWith('/api')) {
      if (method === 'GET' && raw === `${ORIGIN}${API}/system-requirements?locale=tr`) return 'backend';
      if (url.search) return 'reject';
      return ['GET /me', 'POST /me', 'POST /login', 'POST /refresh', 'POST /reset-password']
        .some((entry) => `${method} ${url.pathname}` === entry.replace(' /', ` ${API}/`)) ? 'backend' : 'reject';
    }
    if (raw === `${ORIGIN}/__nextjs_original-stack-frames` && method === 'POST') return 'blocked-dev-diagnostics';
    if (!['GET', 'HEAD'].includes(method)) return 'reject';
    const staticAsset = /^\/_next\/static\/[A-Za-z0-9_./%\[\]()-]+$/.test(url.pathname);
    // Verified Next development getAssetQueryString adds the millisecond request timestamp.
    if (staticAsset && /^\?v=[0-9]{13}$/.test(url.search)) return 'frontend';
    if (url.search && !/^\?_rsc=[A-Za-z0-9_-]{1,100}$/.test(url.search)) return 'reject';
    if (['/dashboard', '/my-tickets', '/tr/dashboard', '/tr/my-tickets'].includes(url.pathname)) return 'blocked-authenticated-page';
    if (['/login', '/tr/login', '/tr/register', '/tr/reset-password', '/logos/aluplan-logo-white.svg',
      '/logos/Allplan-Authorized-Partner-svg-01.svg', '/favicon.ico'].includes(url.pathname)) return 'frontend';
    return staticAsset ? 'frontend' : 'reject';
  } catch { return 'reject'; }
}

function safeLocation(raw) {
  try {
    const url = new URL(raw);
    const origin = url.username || url.password ? 'credentials' : url.origin === ORIGIN ? 'acceptance'
      : url.origin === 'http://127.0.0.1:53301' ? 'numeric-loopback'
      : url.origin === 'http://localhost:53301' ? 'localhost-loopback'
      : url.origin === ORIGIN.replace('https:', 'wss:') ? 'acceptance-websocket' : 'other-origin';
    const paths = { '/tr/login': 'login', '/login': 'login', '/tr/reset-password': 'reset',
      '/tr/register': 'register', '/tr/dashboard': 'dashboard', '/tr/my-tickets': 'my-tickets',
      '/_next/webpack-hmr': 'next-hmr', '/__nextjs_original-stack-frames': 'dev-diagnostics',
      '/favicon.ico': 'favicon', '/': 'root', '/reset-password': 'reset-unprefixed',
      '/register': 'register-unprefixed' };
    for (const name of ['me', 'login', 'refresh', 'reset-password', 'system-requirements']) paths[`${API}/${name}`] = `auth-${name}`;
    for (const locale of ['tr', 'en', 'de']) {
      paths[`/${locale}`] = paths[`/${locale}/`] = `locale-root-${locale}`;
      for (const route of ['login', 'register', 'reset-password']) {
        paths[`/${locale}/${route}`] ??= `${route}-${locale}`;
        paths[`/${locale}/${route}/`] = `${route}-${locale}-trailing`;
      }
    }
    const path = paths[url.pathname] || (url.pathname.startsWith('/_next/static/') ? 'next-static'
      : url.pathname.startsWith('/_next/') ? 'next-other' : url.pathname.startsWith('/logos/') ? 'logo'
      : url.pathname.startsWith('/api/') ? 'api-other'
      : /^\/(?:tr|en|de)\/(?:tr|en|de)\/(?:login|register|reset-password)$/.test(url.pathname) ? 'double-locale-auth'
      : url.pathname.startsWith('/tr/') ? 'turkish-other-path' : url.pathname.startsWith('/en/') ? 'english-other-path'
      : url.pathname.startsWith('/de/') ? 'german-other-path' : 'other-path');
    const query = !url.search ? 'no-query' : path === 'next-static' && /^\?v=[0-9]{13}$/.test(url.search) ? 'next-static-version-query'
      : /^\?_rsc=[A-Za-z0-9_-]{1,100}$/.test(url.search) ? 'rsc-query'
      : url.search === '?locale=tr' ? 'turkish-locale-query' : 'other-query';
    return { origin, path, query, fragment: !!url.hash };
  } catch { return { origin: 'invalid-origin', path: 'other-path', query: 'other-query', fragment: false }; }
}

function rejectionCategory(raw, method) {
  const { origin, path, query } = safeLocation(raw);
  const verb = ['GET', 'HEAD', 'POST', 'OPTIONS', 'WS'].includes(method) ? method : 'OTHER';
  return `${verb}:${origin}:${path}:${query}`;
}

function safeFailure(error) {
  if (error?.name === 'TimeoutError') return 'timeout';
  if (error?.name === 'AssertionError') return 'assertion';
  const message = typeof error?.message === 'string' ? error.message : '';
  if (message.includes('net::ERR_CERT_')) return 'certificate';
  if (message.includes('net::ERR_NAME_NOT_RESOLVED')) return 'dns';
  if (message.includes('net::ERR_CONNECTION_REFUSED')) return 'connection-refused';
  if (message.includes('net::ERR_FAILED') || message.includes('net::ERR_ABORTED')) return 'navigation-aborted';
  return 'other-error';
}

function captureFailure(previous, error, rawLocation) {
  if (previous.failure !== 'none') return previous;
  return { ...previous, failure: safeFailure(error), location: safeLocation(rawLocation) };
}

function filterHopHeaders(headers) {
  const entries = Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]);
  const connection = entries.find(([key]) => key === 'connection')?.[1];
  const omitted = new Set(['connection', 'keep-alive', 'te', 'trailer', 'transfer-encoding', 'upgrade',
    'proxy-authorization', 'proxy-authenticate', 'proxy-connection', 'forwarded',
    ...String(connection || '').split(',').map((key) => key.trim().toLowerCase())]);
  return Object.fromEntries(entries.filter(([key]) => !omitted.has(key) && !key.startsWith('x-forwarded-')));
}

async function readBounded(stream, limit) {
  let size = 0;
  const chunks = [];
  for await (const chunk of stream) {
    size += Buffer.byteLength(chunk);
    assert.ok(size <= limit);
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

function validateBody(pathname, method, raw, fixture) {
  if (method !== 'POST' || pathname === `${API}/refresh` || pathname === `${API}/me`) {
    assert.ok(raw === '' || (method === 'POST' && raw === '{}'));
    return;
  }
  const body = JSON.parse(raw);
  if (pathname === `${API}/login`) {
    assert.deepEqual(Object.keys(body).sort(), ['email', 'password']);
    assert.equal(body.email, fixture.email);
    assert.ok([fixture.password, fixture.newPassword].includes(body.password));
  } else {
    assert.equal(pathname, `${API}/reset-password`);
    assert.deepEqual(Object.keys(body).sort(), ['newPassword', 'token']);
    assert.equal(body.newPassword, fixture.newPassword);
    assert.ok([fixture.resetToken, fixture.expiredToken].includes(body.token));
  }
}

function validateLoginResponse(body, fixture) {
  assert.deepEqual(Object.keys(body), ['user']);
  assert.equal(body.user.id, fixture.userId);
  assert.ok(Object.keys(body.user).every((key) => !/password|token|secret/i.test(key)));
}

function normalizeFrontendRedirect(target, method, requestPath, statusCode, location) {
  if (target !== 'frontend' || !['GET', 'HEAD'].includes(method) || ![307, 308].includes(statusCode)
    || !/^\/login(?:\?_rsc=[A-Za-z0-9_-]{1,100})?$/.test(requestPath)
    || typeof location !== 'string' || !/^https:\/\/localhost:53301\/tr\/login(?:\?_rsc=[A-Za-z0-9_-]{1,100})?$/.test(location)) return location;
  // Next dev constructs middleware URLs from its loopback listen address, not forwarded authority.
  // This exact local transport adapter is NOT proof of production frontend redirect behavior.
  return location.replace('https://localhost:53301', ORIGIN);
}

function createProxy(tls, backendHost, fixture, counts) {
  const http = require('node:http');
  const https = require('node:https');
  const server = https.createServer(tls, async (request, response) => {
    let upstream;
    try {
      const hostCount = request.rawHeaders.filter((_, index) => index % 2 === 0 && request.rawHeaders[index].toLowerCase() === 'host').length;
      assert.equal(hostCount, 1);
      assert.equal(request.headers.host, HOST);
      assert.ok(request.url.startsWith('/') && !request.url.startsWith('//'));
      assert.equal(request.headers.authorization, undefined);
      const target = classifyRequest(`${ORIGIN}${request.url}`, request.method);
      // Both interception layers deny these routes; neither may fetch dashboard data or dev diagnostics.
      if (target === 'blocked-authenticated-page' || target === 'blocked-dev-diagnostics') {
        counts[target === 'blocked-authenticated-page' ? 'blockedAuthenticatedPages' : 'blockedDevDiagnostics'] += 1;
        response.writeHead(403);
        response.end();
        return;
      }
      assert.ok(['frontend', 'backend'].includes(target));
      const body = await readBounded(request, 8192);
      validateBody(new URL(`${ORIGIN}${request.url}`).pathname, request.method, body, fixture);
      const headers = { ...filterHopHeaders(request.headers), host: target === 'backend' ? `${backendHost}:4000` : '127.0.0.1:53301',
        'x-forwarded-proto': 'https', 'x-forwarded-host': HOST, 'x-forwarded-port': '54443' };
      const failUpstream = () => {
        // Closing an inspected UI page intentionally cancels remaining static requests.
        if (!response.destroyed) { counts.proxyErrors += 1; response.destroy(); }
      };
      upstream = http.request({ hostname: target === 'backend' ? backendHost : '127.0.0.1',
        port: target === 'backend' ? 4000 : 53301, path: request.url, method: request.method,
        headers, agent: false, timeout: REQUEST_MS }, (incoming) => {
        // Preserve Set-Cookie arrays verbatim; never rewrite Domain, Path, Secure or HttpOnly.
        const responseHeaders = filterHopHeaders(incoming.headers);
        const location = normalizeFrontendRedirect(target, request.method, request.url, incoming.statusCode, responseHeaders.location);
        if (location !== responseHeaders.location) {
          counts.normalizedDevRedirects += 1;
          responseHeaders.location = location;
        }
        response.writeHead(incoming.statusCode, responseHeaders);
        incoming.on('error', failUpstream);
        incoming.pipe(response);
      });
      upstream.on('timeout', () => upstream.destroy());
      upstream.on('error', failUpstream);
      const requestDeadline = setTimeout(() => upstream.destroy(), REQUEST_MS);
      response.on('finish', () => clearTimeout(requestDeadline));
      response.on('close', () => { clearTimeout(requestDeadline); if (!response.writableFinished) upstream.destroy(); });
      upstream.end(body);
    } catch {
      counts.unexpected += 1;
      upstream?.destroy();
      if (!response.headersSent) response.writeHead(403);
      response.end();
    }
  });
  for (const event of ['connect', 'upgrade']) server.on(event, (_request, socket) => { counts.unexpected += 1; socket.destroy(); });
  server.on('clientError', (_error, socket) => { counts.proxyErrors += 1; socket.destroy(); });
  server.requestTimeout = REQUEST_MS;
  server.headersTimeout = 10_000;
  return server;
}

async function main() {
  const backendHost = validateInvocation(process.argv.slice(2), process.env, process.platform, process.getuid?.());
  const fs = require('node:fs');
  const path = require('node:path');
  const { execFileSync } = require('node:child_process');
  const { X509Certificate, createHash } = require('node:crypto');
  let browser, server, temporary, activePage;
  const counts = { unexpected: 0, proxyErrors: 0, blockedAuthenticatedPages: 0, blockedHmr: 0, blockedDevDiagnostics: 0, normalizedDevRedirects: 0 };
  let diagnostics = { step: 'setup', failure: 'none', location: safeLocation('about:blank'), rejectedRequests: {} };
  const recordRejected = (raw, method) => {
    const key = rejectionCategory(raw, method);
    diagnostics.rejectedRequests[key] = (diagnostics.rejectedRequests[key] || 0) + 1;
    counts.unexpected += 1;
  };
  const checks = {};
  const deadline = setTimeout(() => { void browser?.close(); server?.closeAllConnections(); }, 295_000);
  const hardDeadline = setTimeout(() => {
    process.stdout.write(JSON.stringify({ scope: 'local-real-browser-auth', pass: false, stage: 'deadline' }) + '\n');
    process.exit(1);
  }, 300_000);
  try {
    stage = 'fixture';
    const fixture = validateFixture(await readBounded(process.stdin, 8192));
    stage = 'tls';
    temporary = fs.mkdtempSync('/tmp/aluplan-auth-browser-');
    fs.chmodSync(temporary, 0o700);
    const keyFile = path.join(temporary, 'key.pem'), certFile = path.join(temporary, 'cert.pem');
    // Installed openssl only; missing executable fails closed, no installation or network acquisition.
    execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
      '-subj', '/CN=acceptance.allplan.net.tr', '-addext', 'subjectAltName=DNS:acceptance.allplan.net.tr',
      '-keyout', keyFile, '-out', certFile], { timeout: 15_000, stdio: 'pipe', maxBuffer: 16384 });
    fs.chmodSync(keyFile, 0o600);
    const tls = { key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) };
    const pin = createHash('sha256').update(new X509Certificate(tls.cert).publicKey.export({ type: 'spki', format: 'der' })).digest('base64');
    server = createProxy(tls, backendHost, fixture, counts);
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(54443, '127.0.0.1', resolve); });
    stage = 'browser-launch';
    const { chromium, expect } = require('/work/apps/frontend/node_modules/@playwright/test');
    browser = await chromium.launch({ headless: true, chromiumSandbox: true, timeout: REQUEST_MS,
      args: [`--ignore-certificate-errors-spki-list=${pin}`, '--host-resolver-rules=MAP acceptance.allplan.net.tr 127.0.0.1',
        '--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-first-run', '--disable-quic'] });

    async function freshContext() {
      const context = await browser.newContext({ serviceWorkers: 'block', acceptDownloads: false });
      assert.deepEqual(await context.cookies(), []);
      await context.exposeBinding('__probeWorkerBlocked', () => { counts.unexpected += 1; });
      await context.addInitScript(() => {
        for (const name of ['Worker', 'SharedWorker']) Object.defineProperty(window, name, { configurable: false,
          value: class { constructor() { void window.__probeWorkerBlocked(); throw new Error('Worker blocked'); } } });
      });
      await context.routeWebSocket('**/*', (socket) => {
        if (socket.url() === `${ORIGIN.replace('https:', 'wss:')}/_next/webpack-hmr`) counts.blockedHmr += 1;
        else recordRejected(socket.url(), 'WS');
        socket.close();
      });
      await context.route('**/*', async (route) => {
        const target = classifyRequest(route.request().url(), route.request().method());
        if (['backend', 'frontend'].includes(target)) return route.continue();
        if (target === 'blocked-authenticated-page') counts.blockedAuthenticatedPages += 1;
        else if (target === 'blocked-dev-diagnostics') counts.blockedDevDiagnostics += 1;
        else recordRejected(route.request().url(), route.request().method());
        return route.abort();
      });
      context.on('page', (page) => {
        page.setDefaultTimeout(REQUEST_MS);
        page.setDefaultNavigationTimeout(REQUEST_MS);
        page.on('download', (download) => { counts.unexpected += 1; void download.cancel(); });
        page.on('worker', () => { counts.unexpected += 1; });
      });
      return context;
    }
    const responseFor = (page, suffix, method, status) => page.waitForResponse((response) =>
      response.url() === `${ORIGIN}${API}${suffix}` && response.request().method() === method && response.status() === status,
    { timeout: REQUEST_MS });
    async function openAnonymous(context, pathname) {
      diagnostics.step = 'anonymous-page-create';
      const page = await context.newPage();
      activePage = page;
      diagnostics.step = 'anonymous-navigation';
      const anonymous = responseFor(page, '/refresh', 'POST', 401);
      const navigation = page.goto(`${ORIGIN}${pathname}`).then(() => { diagnostics.step = 'anonymous-refresh-wait'; });
      await Promise.all([anonymous, navigation]);
      diagnostics.step = 'anonymous-ready';
      return page;
    }
    async function login(password, status) {
      const context = await freshContext();
      const page = await openAnonymous(context, '/tr/login');
      diagnostics.step = 'login-form';
      await page.getByTestId('login-email').fill(fixture.email);
      await page.getByTestId('login-password').fill(password);
      const pending = [responseFor(page, '/login', 'POST', status)];
      if (status === 200) pending.push(responseFor(page, '/me', 'GET', 200));
      diagnostics.step = 'login-response-wait';
      const responses = await Promise.all([...pending, page.getByTestId('login-submit').click()]);
      if (status === 200) {
        validateLoginResponse(await responses[0].json(), fixture);
        assert.equal((await responses[1].json()).id, fixture.userId);
      }
      if (status === 401) await expect(page.getByTestId('error-message')).toBeVisible();
      await page.close();
      // A real local static document retains the same origin/cookies without dashboard effects.
      const probePage = await context.newPage();
      activePage = probePage;
      diagnostics.step = 'static-document-navigation';
      await probePage.goto(`${ORIGIN}/logos/aluplan-logo-white.svg`);
      return { context, page: probePage };
    }
    async function fetchAuth(page, suffix, method = 'GET', csrf = false, verifyUser = false) {
      return page.evaluate(async ({ api, suffix, method, csrf, userId }) => {
        const headers = csrf ? { 'X-XSRF-TOKEN': document.cookie.split('; ').find((value) => value.startsWith('XSRF-TOKEN='))?.split('=')[1] || '',
          'X-Requested-With': 'XMLHttpRequest' } : {};
        const response = await fetch(`${api}${suffix}`, { method, credentials: 'include', headers,
          redirect: 'error', signal: AbortSignal.timeout(30_000) });
        const userMatches = userId ? (await response.json()).id === userId : true;
        return { status: response.status, userMatches };
      }, { api: API, suffix, method, csrf, userId: verifyUser ? fixture.userId : null });
    }
    async function cookieChecks(context, page) {
      const cookies = await context.cookies();
      for (const [name, cookiePath, httpOnly] of [['alu_at', '/', true], ['alu_rt', `${API}/refresh`, true], ['XSRF-TOKEN', '/', false]]) {
        const matching = cookies.filter((cookie) => cookie.name === name);
        assert.equal(matching.length, 1);
        const cookie = matching[0];
        assert.equal(cookie.domain, '.allplan.net.tr');
        assert.equal(cookie.path, cookiePath);
        assert.equal(cookie.secure, true);
        assert.equal(cookie.httpOnly, httpOnly);
        assert.equal(cookie.sameSite, 'Lax');
        assert.ok(cookie.value.length > 0);
      }
      assert.equal(await page.evaluate(() => /(?:^|;\s*)alu_(?:at|rt)=/.test(document.cookie)), false);
      assert.equal((await context.cookies(`${ORIGIN}${API}/me`)).some((cookie) => cookie.name === 'alu_rt'), false);
    }
    async function reset(token, status) {
      const context = await freshContext();
      try {
        const page = await openAnonymous(context, `/tr/reset-password#token=${token}`);
        diagnostics.step = 'reset-form';
        await expect(page.locator('input[type=password]')).toHaveCount(2);
        diagnostics.step = 'reset-fragment-stripped';
        await expect(page).toHaveURL(`${ORIGIN}/tr/reset-password`);
        await page.locator('input[type=password]').nth(0).fill(fixture.newPassword);
        await page.locator('input[type=password]').nth(1).fill(fixture.newPassword);
        diagnostics.step = 'reset-response-wait';
        await Promise.all([responseFor(page, '/reset-password', 'POST', status),
          page.getByRole('button', { name: 'ŞİFREYİ GÜNCELLE', exact: true }).click()]);
        if (status === 200) { diagnostics.step = 'reset-login-redirect'; await expect(page).toHaveURL(`${ORIGIN}/tr/login`); }
      } catch (error) {
        // Preserve the page location before context.close can replace it with about:blank.
        diagnostics = captureFailure(diagnostics, error, activePage?.url() || 'about:blank');
        throw error;
      } finally { await context.close(); }
    }
    stage = 'expired-reset';
    await reset(fixture.expiredToken, 401); checks.expiredReset401 = true;
    stage = 'initial-ui-login';
    const old = await login(fixture.password, 200); checks.initialUiLogin200 = true;
    stage = 'browser-cookies';
    await cookieChecks(old.context, old.page); checks.cookieAttributes = true;
    assert.deepEqual(await fetchAuth(old.page, '/me', 'GET', false, true), { status: 200, userMatches: true });
    checks.initialMe200 = true;
    stage = 'browser-refresh';
    assert.equal((await fetchAuth(old.page, '/refresh', 'POST')).status, 200);
    await cookieChecks(old.context, old.page); checks.browserRefresh200 = true;
    stage = 'csrf-routing-control';
    assert.equal((await fetchAuth(old.page, '/me', 'POST')).status, 403);
    assert.equal((await fetchAuth(old.page, '/me', 'POST', true)).status, 404);
    checks.csrfNegative403AndRouting404 = true;
    stage = 'valid-reset';
    await reset(fixture.resetToken, 200); checks.validUiReset200 = true;
    stage = 'old-context-revoked';
    assert.equal((await fetchAuth(old.page, '/me')).status, 401);
    assert.equal((await fetchAuth(old.page, '/refresh', 'POST')).status, 403);
    checks.oldAccess401 = true; checks.oldRefresh403 = true;
    await old.context.close();
    stage = 'reset-replay';
    await reset(fixture.resetToken, 401); checks.resetReplay401 = true;
    stage = 'old-password-rejected';
    const rejected = await login(fixture.password, 401);
    await rejected.context.close(); checks.oldPassword401 = true;
    stage = 'new-ui-login';
    const renewed = await login(fixture.newPassword, 200);
    await cookieChecks(renewed.context, renewed.page);
    assert.deepEqual(await fetchAuth(renewed.page, '/me', 'GET', false, true), { status: 200, userMatches: true });
    checks.newUiLogin200AndMe200 = true;
    await renewed.context.close();
    assert.equal(counts.unexpected, 0);
    assert.equal(counts.proxyErrors, 0);
    stage = 'complete';
    diagnostics.step = 'complete';
  } catch (error) {
    diagnostics = captureFailure(diagnostics, error, activePage?.url() || 'about:blank');
    throw error;
  } finally {
    await browser?.close();
    server?.closeAllConnections();
    if (server?.listening) await new Promise((resolve) => server.close(resolve));
    if (temporary) fs.rmSync(temporary, { recursive: true });
    clearTimeout(deadline); clearTimeout(hardDeadline);
    process.stdout.write(JSON.stringify({ scope: 'local-real-browser-auth', pass: stage === 'complete', stage,
      checks, counts, diagnostics, dashboardAcceptance: false, frontendAutomaticRefreshAcceptance: false, publicTlsAcceptance: false }) + '\n');
  }
}

module.exports = { validateInvocation, validateFixture, classifyRequest, filterHopHeaders, validateBody, validateLoginResponse, normalizeFrontendRedirect, createProxy,
  safeLocation, safeFailure, rejectionCategory, captureFailure, ORIGIN };
if (require.main === module) main().catch(() => {
  if (stage === 'invocation') process.stdout.write(JSON.stringify({ scope: 'local-real-browser-auth', pass: false, stage }) + '\n');
  process.exitCode = 1;
});
