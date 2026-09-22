'use strict';
// Synthetic frontend UI only: no backend, DB, CRM, email, TLS or auth-cookie proof.
// Run only inside the separately reviewed OS network sandbox and fresh source server.
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const FRONTEND = 'http://127.0.0.1:53301';
const API = 'http://127.0.0.1:53302';
const TOKEN = 'synthetic-ui-reset-token';
const PASSWORD = 'Synthetic-Only-93!';
const EMAIL = 'synthetic-ui@example.invalid';
let failureStage = 'invocation';

function validateInvocation(args, env) {
  assert.equal(env.FRONTEND_AUTH_PROBE, 'synthetic-ui-only');
  assert.deepEqual(args, ['--run-synthetic-ui', `--frontend-origin=${FRONTEND}`, `--api-origin=${API}`]);
}
function allowedHttp(raw) {
  try {
    const url = new URL(raw);
    return !url.username && !url.password && url.protocol === 'http:' && [FRONTEND, API].includes(url.origin);
  } catch { return false; }
}
function resolveRuntime(platform, env, uid) {
  if (platform === 'linux') {
    assert.equal(env.FRONTEND_AUTH_PROBE_RUNTIME, 'isolated-linux');
    assert.ok(Number.isInteger(uid) && uid > 0);
    return { modulePath: '/work/apps/frontend/node_modules/@playwright/test', launchOptions: {} };
  }
  assert.equal(platform, 'darwin');
  return {
    modulePath: path.resolve(__dirname, '../../aluplan-security-candidate-20260917/apps/frontend/node_modules/@playwright/test'),
    launchOptions: { executablePath: path.join(os.homedir(), 'Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing') },
  };
}

async function main() {
  validateInvocation(process.argv.slice(2), process.env);
  failureStage = 'runtime-validation';
  const runtime = resolveRuntime(process.platform, process.env, process.getuid?.());
  failureStage = 'playwright-import';
  const { chromium, expect } = require(runtime.modulePath);
  let browser;
  let unexpected = 0;
  let blockedHmr = 0;
  const results = [];
  let expired = false;
  const deadline = setTimeout(() => { expired = true; void browser?.close(); }, 150_000);
  const hardDeadline = setTimeout(() => {
    process.stdout.write(JSON.stringify({ scope: 'synthetic-ui-only', pass: false, reason: 'deadline' }) + '\n');
    process.exit(1);
  }, 160_000);

  async function scenario(name, mode, run) {
    let context;
    const requests = [];
    let stage = 'setup';
    const mark = (value) => { stage = value; };
    try {
      assert.equal(expired, false);
      context = await browser.newContext({ serviceWorkers: 'block', acceptDownloads: false, viewport: { width: 1280, height: 900 } });
      assert.deepEqual(await context.cookies(), []);
      await context.exposeBinding('__probeWorkerBlocked', () => { unexpected += 1; });
      await context.addInitScript(() => {
        for (const name of ['Worker', 'SharedWorker']) {
          Object.defineProperty(window, name, { value: class {
            constructor() { void window.__probeWorkerBlocked(); throw new Error('Worker blocked by synthetic probe'); }
          }, configurable: false });
        }
      });
      await context.routeWebSocket('**/*', (socket) => {
        const url = new URL(socket.url());
        if (url.origin === 'ws://127.0.0.1:53301' && url.pathname === '/_next/webpack-hmr' && !url.username && !url.password) blockedHmr += 1;
        else unexpected += 1;
        socket.close(); // Never connect even the known local development HMR socket.
      });
      await context.route('**/*', async (route) => {
        const request = route.request();
        if (!allowedHttp(request.url())) { unexpected += 1; return route.abort(); }
        const url = new URL(request.url());
        if (url.origin === FRONTEND) {
          if (!['GET', 'HEAD'].includes(request.method())) { unexpected += 1; return route.abort(); }
          return route.continue();
        }
        const key = `${request.method()} ${url.pathname}`;
        const passive = {
          'GET /api/v1/auth/me': [401, { message: 'Synthetic anonymous' }],
          'POST /api/v1/auth/refresh': [401, { message: 'Synthetic anonymous' }],
          'GET /api/v1/auth/csrf-token': [200, { csrfToken: 'synthetic-csrf' }],
          'GET /api/v1/products': [200, []],
          'GET /api/v1/auth/system-requirements': [200, [{ title: 'Synthetic requirements', sections: [{ name: 'Synthetic', items: ['Local fixture only'] }] }]],
        };
        let response = passive[key];
        try {
          if (key === 'POST /api/v1/auth/login' && mode === 'login') {
            assert.deepEqual(request.postDataJSON(), { email: EMAIL, password: PASSWORD });
            response = [401, { message: 'Invalid credentials' }];
          } else if (key === 'POST /api/v1/auth/lookup' && ['reject', 'unavailable', 'claim'].includes(mode)) {
            assert.deepEqual(request.postDataJSON(), { email: EMAIL });
            response = mode === 'unavailable' ? [503, { message: 'Synthetic CRM unavailable' }]
              : [200, { action: mode === 'claim' ? 'CLAIM' : 'CRM_REJECTED', companyName: null }];
          } else if (key === 'POST /api/v1/auth/forgot-password' && mode === 'claim') {
            assert.deepEqual(request.postDataJSON(), { email: EMAIL });
            response = [200, { success: true }];
          } else if (key === 'POST /api/v1/auth/reset-password' && ['reset', 'failure', 'mismatch', 'query'].includes(mode)) {
            assert.deepEqual(request.postDataJSON(), { token: TOKEN, newPassword: PASSWORD });
            response = mode === 'failure' ? [400, { message: 'Synthetic reset rejected' }] : [200, { success: true }];
          }
        } catch { unexpected += 1; return route.abort(); }
        if (!response) { unexpected += 1; return route.abort(); }
        requests.push(key); // Metadata only; never retain or print bodies/passwords/tokens.
        return route.fulfill({ status: response[0], contentType: 'application/json',
          headers: { 'Access-Control-Allow-Origin': FRONTEND, 'Access-Control-Allow-Credentials': 'true' },
          body: JSON.stringify(response[1]) });
      });
      const page = await context.newPage();
      page.setDefaultTimeout(7_000);
      page.setDefaultNavigationTimeout(25_000);
      await run(page, requests, mark);
      results.push({ name, pass: true });
    } catch { results.push({ name, pass: false, stage }); }
    finally { await context?.close(); }
  }
  const countReset = (requests) => requests.filter((key) => key === 'POST /api/v1/auth/reset-password').length;
  const openReset = async (page) => {
    await page.goto(`${FRONTEND}/tr/reset-password#token=${TOKEN}`);
    await expect(page.locator('input[type=password]')).toHaveCount(2);
    await expect(page).toHaveURL(`${FRONTEND}/tr/reset-password`);
  };
  const fillReset = async (page, confirm = PASSWORD) => {
    await page.locator('input[type=password]').nth(0).fill(PASSWORD);
    await page.locator('input[type=password]').nth(1).fill(confirm);
    await page.getByRole('button', { name: 'ŞİFREYİ GÜNCELLE', exact: true }).click();
  };
  try {
    failureStage = 'browser-launch';
    browser = await chromium.launch({ headless: true, chromiumSandbox: true, timeout: 20_000,
      ...runtime.launchOptions,
      args: ['--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-first-run', '--disable-quic'],
    });
    await scenario('login-invalid-credentials', 'login', async (page, requests, mark) => {
      mark('login-form');
      await page.goto(`${FRONTEND}/tr/login`);
      await page.getByTestId('login-email').fill(EMAIL);
      await page.getByTestId('login-password').fill(PASSWORD);
      await page.getByTestId('login-submit').click();
      mark('visible-login-error');
      await expect(page.getByTestId('error-message')).toBeVisible();
      await expect(page.getByTestId('error-message')).toHaveText('Invalid credentials');
      assert.equal(requests.filter((key) => key === 'POST /api/v1/auth/login').length, 1);
    });
    for (const mode of ['reject', 'unavailable', 'claim']) {
      await scenario(`crm-${mode}`, mode, async (page, requests, mark) => {
        mark('forgot-password-entry');
        await page.goto(`${FRONTEND}/tr/login`);
        await page.getByRole('link', { name: 'Şifremi Unuttum', exact: true }).click();
        await expect(page).toHaveURL(`${FRONTEND}/tr/register`);
        await page.locator('input[name=email]').fill(EMAIL);
        await page.getByRole('button', { name: 'Devam Et' }).click();
        mark('lookup-result-visible');
        if (mode === 'reject') await expect(page.getByRole('heading', { name: 'Sisteme Erişim Sağlanamıyor' })).toBeVisible();
        if (mode === 'unavailable') await expect(page.getByText('Synthetic CRM unavailable', { exact: true })).toBeVisible();
        if (mode === 'claim') {
          await expect(page.getByRole('heading', { name: 'Sizi Tanıyoruz!' })).toBeVisible();
          await page.getByRole('button', { name: 'Şifremi Sıfırla', exact: true }).click();
          mark('reset-email-confirmation-visible');
          await expect(page.getByRole('heading', { name: 'Sıfırlama Bağlantısı Gönderildi' })).toBeVisible();
          assert.equal(requests.filter((key) => key === 'POST /api/v1/auth/forgot-password').length, 1);
        }
        assert.equal(requests.filter((key) => key === 'POST /api/v1/auth/lookup').length, 1);
      });
    }
    await scenario('fragment-stripped-and-valid-reset', 'reset', async (page, requests, mark) => {
      mark('fragment-consumed-and-stripped'); await openReset(page);
      mark('valid-reset-submit'); await fillReset(page);
      await expect(page).toHaveURL(`${FRONTEND}/tr/login`);
      assert.equal(countReset(requests), 1);
    });
    await scenario('query-token-rejected', 'query', async (page, requests, mark) => {
      mark('query-rejected-and-redirected');
      await page.goto(`${FRONTEND}/tr/reset-password?token=${TOKEN}`);
      await expect(page).toHaveURL(`${FRONTEND}/tr/login`);
      assert.equal(countReset(requests), 0);
    });
    for (const visible of [false, true]) {
      await scenario(visible ? 'mismatch-visible-feedback' : 'mismatch-no-submit', 'mismatch', async (page, requests, mark) => {
        mark('reset-form'); await openReset(page);
        mark('mismatch-submit'); await fillReset(page, 'Different-Synthetic-94!');
        // Synchronize past the event handler and next paint, without an arbitrary sleep.
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        assert.equal(countReset(requests), 0);
        await expect(page).toHaveURL(`${FRONTEND}/tr/reset-password`);
        if (visible) { mark('visible-mismatch-error'); await expect(page.getByText('Şifreler eşleşmiyor.', { exact: true })).toBeVisible(); }
      });
    }
    await scenario('reset-validation-error-visible-feedback', 'failure', async (page, requests, mark) => {
      mark('reset-form'); await openReset(page);
      mark('failure-submit'); await fillReset(page);
      await expect.poll(() => countReset(requests)).toBe(1);
      mark('visible-reset-error'); await expect(page.getByText('Synthetic reset rejected', { exact: true })).toBeVisible();
      await expect(page).toHaveURL(`${FRONTEND}/tr/reset-password`);
    });
  } finally {
    if (browser) failureStage = 'browser-cleanup';
    await browser?.close();
    clearTimeout(deadline); clearTimeout(hardDeadline);
  }
  const pass = !expired && unexpected === 0 && results.length === 9 && results.every((result) => result.pass);
  process.stdout.write(JSON.stringify({ scope: 'synthetic-ui-only', pass, results, unexpectedNetworkOrWorker: unexpected, blockedLocalHmr: blockedHmr }) + '\n');
  process.exitCode = pass ? 0 : 1;
}

module.exports = { validateInvocation, allowedHttp, resolveRuntime, FRONTEND, API };
if (require.main === module) main().catch(() => {
  process.stdout.write(JSON.stringify({ scope: 'synthetic-ui-only', pass: false, reason: 'setup-or-cleanup-failed', stage: failureStage }) + '\n');
  process.exitCode = 1;
});
