import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const rootDir = resolve(new URL('../..', import.meta.url).pathname);
const require = createRequire(resolve(rootDir, 'apps/frontend/package.json'));
const { chromium, expect } = require('@playwright/test');
const resultsDir = resolve(rootDir, '.ai/product-flow');
const frontendUrl = process.env.PRODUCT_FLOW_FRONTEND_URL ?? 'http://localhost:3000';
const backendUrl = process.env.PRODUCT_FLOW_BACKEND_URL ?? 'http://localhost:4000/api/v1';
const customer = {
  email: process.env.PRODUCT_FLOW_CUSTOMER_EMAIL ?? 'e2e-customer@aluplan.com',
  password: process.env.PRODUCT_FLOW_CUSTOMER_PASSWORD ?? 'Vol1872017',
};
const admin = {
  email: process.env.PRODUCT_FLOW_ADMIN_EMAIL ?? 'admin@example.com',
  password: process.env.PRODUCT_FLOW_ADMIN_PASSWORD ?? 'Vol1872017',
};

const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
const subject = `PF UI Hotinfo direct ticket ${runId}`;
const description = [
  'UI smoke: AI kullanmadan ticket acma kabul testi.',
  'Hotinfo snapshot iceren test talebidir.',
  'Kullanici isterse AI adimini atlayabilmelidir.',
].join(' ');

const hxlBody = `<?xml version="1.0" encoding="UTF-8"?>
<hotinfo>
  <system>
    <allplanVersion>Allplan 2026</allplanVersion>
    <operatingSystem>Windows 11 Pro 24H2</operatingSystem>
    <graphics>NVIDIA RTX 4070</graphics>
    <processes>
      <process>onedrive.exe</process>
      <process>allplan.exe</process>
    </processes>
  </system>
</hotinfo>
`;

const steps = [];

function record(name, status, detail = undefined) {
  steps.push({ name, status, detail });
  const suffix = detail ? ` - ${detail}` : '';
  console.log(`${status === 'PASS' ? 'PASS' : 'FAIL'} ${name}${suffix}`);
}

async function login(page, user, label) {
  await page.goto(`${frontendUrl}/tr/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  await page.getByTestId('login-email').fill(user.email);
  await page.getByTestId('login-password').fill(user.password);
  await expect(page.getByTestId('login-submit')).toBeEnabled();
  await page.waitForTimeout(500);
  await Promise.all([
    page.waitForResponse((response) => response.url().includes('/auth/login') && response.status() === 200, { timeout: 30_000 }),
    page.getByTestId('login-submit').click(),
  ]);
  await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 20_000 }).catch(async () => {
    await page.goto(`${frontendUrl}/tr/dashboard`, { waitUntil: 'domcontentloaded' });
  });
  record(`${label} login`, 'PASS', user.email);
}

async function selectByPlaceholder(page, placeholder, optionText) {
  await page.locator('button[role="combobox"]').filter({ hasText: placeholder }).first().click();
  await page.getByRole('option', { name: new RegExp(optionText, 'i') }).click();
}

async function main() {
  mkdirSync(resultsDir, { recursive: true });

  const healthResponse = await fetch(`${backendUrl}/health`);
  if (!healthResponse.ok) {
    throw new Error(`Backend health failed: ${healthResponse.status}`);
  }
  record('backend health', 'PASS', String(healthResponse.status));

  const tempDir = mkdtempSync(join(tmpdir(), 'aluplan-hotinfo-ui-'));
  const hotinfoPath = join(tempDir, `_hotinf_ui_${runId}.hxl`);
  writeFileSync(hotinfoPath, hxlBody, 'utf8');

  const browser = await chromium.launch({ headless: true });
  const customerContext = await browser.newContext({ locale: 'tr-TR' });
  const adminContext = await browser.newContext({ locale: 'tr-TR' });

  try {
    const page = await customerContext.newPage();
    page.setDefaultTimeout(30_000);
    await login(page, customer, 'customer');

    await page.goto(`${frontendUrl}/tr/tickets/new`, { waitUntil: 'networkidle' });
    await expect(page.getByText('Yeni Destek Talebi')).toBeVisible();
    record('customer new ticket page', 'PASS');

    await selectByPlaceholder(page, /Ürün seçin|Urun secin/i, 'ALLPLAN');
    record('product selected', 'PASS', 'ALLPLAN');

    let fileInput = page.locator('input[type="file"][accept=".hxl"]').last();
    if ((await fileInput.count()) === 0) {
      const viewChange = page.getByRole('button', { name: /Görüntüle \/ Değiştir|Goruntule \/ Degistir/i });
      if (await viewChange.count()) {
        await viewChange.click();
        fileInput = page.locator('input[type="file"][accept=".hxl"]').last();
      }
    }

    if (await fileInput.count()) {
      await fileInput.setInputFiles(hotinfoPath);
      await expect(page.getByText('Sistem Bilgileri (Hotinfo) Eklendi')).toBeVisible({ timeout: 30_000 });
      record('hotinfo upload via ui', 'PASS', hotinfoPath);
    } else {
      record('hotinfo upload via ui', 'FAIL', 'file input not found');
      throw new Error('Hotinfo file input not found');
    }

    await selectByPlaceholder(page, /Öncelik seçin|Oncelik secin/i, 'ORTA|Orta');
    record('priority selected', 'PASS', 'MEDIUM');

    await page.getByPlaceholder(/Kurulum sirasinda lisans hatasi|Kurulum sırasında lisans hatası/i).fill(subject);
    await page.getByRole('button', { name: /Sonraki Adim|Sonraki Adım/i }).click();
    record('step 1 completed', 'PASS');

    await page.getByPlaceholder(/Hata mesaji|Hata mesajı/i).fill(description);
    await page.getByRole('button', { name: /Dogrudan Talep Olusturmaya Gec|Doğrudan Talep Oluşturmaya Geç/i }).click();
    record('ai skipped by customer', 'PASS');

    await expect(page.getByText(/Son Kontrol|Ekler/i)).toBeVisible();
    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        /\/api\/v1\/tickets$/.test(response.url()) &&
        response.ok(),
      { timeout: 40_000 },
    );
    await page.getByRole('button', { name: /Talebi Olustur|Talebi Oluştur/i }).click();
    const createResponse = await createResponsePromise;
    const createdTicket = await createResponse.json();
    const ticketId = createdTicket.id;
    await page.waitForURL((url) => url.pathname.endsWith(`/tickets/${ticketId}`), { timeout: 40_000 });
    await expect(page.getByText(subject)).toBeVisible({ timeout: 30_000 });
    record('direct ticket created via ui', 'PASS', ticketId);

    const adminPage = await adminContext.newPage();
    adminPage.setDefaultTimeout(30_000);
    await login(adminPage, admin, 'admin');

    await adminPage.goto(`${frontendUrl}/tr/tickets/${ticketId}`, { waitUntil: 'networkidle' });
    await expect(adminPage.getByText(subject)).toBeVisible();
    record('admin can open ticket detail', 'PASS', ticketId);

    const hotinfoMarker = adminPage.getByText(/HOTINFO_TELEMETRI_VERISI|HOTINFO_TELEMETRİ_VERİSİ|NVIDIA RTX 4070|Windows 11/i);
    await expect(hotinfoMarker.first()).toBeVisible({ timeout: 30_000 });
    record('admin sees hotinfo snapshot', 'PASS');

    const result = {
      runId,
      generatedAt: new Date().toISOString(),
      status: 'PASS',
      frontendUrl,
      backendUrl,
      ticketId,
      subject,
      checks: steps,
    };
    const jsonPath = resolve(resultsDir, `results-2026-05-15-phase-2-ui-${runId}.json`);
    const mdPath = resolve(resultsDir, `results-2026-05-15-phase-2-ui-${runId}.md`);
    writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    writeFileSync(
      mdPath,
      [
        '# Product Flow Phase 2 UI Smoke',
        '',
        `- Status: PASS`,
        `- Run ID: ${runId}`,
        `- Ticket ID: ${ticketId}`,
        `- Subject: ${subject}`,
        `- Frontend: ${frontendUrl}`,
        `- Backend: ${backendUrl}`,
        '',
        '## Checks',
        ...steps.map((step) => `- ${step.status}: ${step.name}${step.detail ? ` - ${step.detail}` : ''}`),
        '',
      ].join('\n'),
      'utf8',
    );
    console.log(`RESULT_JSON=${jsonPath}`);
    console.log(`RESULT_MD=${mdPath}`);
  } catch (error) {
    const result = {
      runId,
      generatedAt: new Date().toISOString(),
      status: 'FAIL',
      frontendUrl,
      backendUrl,
      error: error instanceof Error ? error.message : String(error),
      checks: steps,
    };
    const jsonPath = resolve(resultsDir, `results-2026-05-15-phase-2-ui-${runId}.json`);
    writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.error(`RESULT_JSON=${jsonPath}`);
    throw error;
  } finally {
    await customerContext.close().catch(() => undefined);
    await adminContext.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
  }
}

await main();
