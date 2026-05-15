#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_BASE_URL = 'http://localhost:4000/api/v1';
const DEFAULT_CUSTOMER_EMAIL = 'e2e-customer@aluplan.test';
const DEFAULT_CUSTOMER_PASSWORD = 'E2eCustomer!Pass123';
const DEFAULT_ADMIN_EMAIL = 'e2e-admin@aluplan.test';
const DEFAULT_ADMIN_PASSWORD = 'E2eAdmin!Pass123';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (!arg.startsWith('--')) continue;
  const [key, inlineValue] = arg.slice(2).split('=');
  const value = inlineValue ?? (process.argv[i + 1]?.startsWith('--') ? 'true' : process.argv[++i]);
  args.set(key, value);
}

const baseUrl = args.get('base-url') || process.env.PRODUCT_FLOW_BASE_URL || DEFAULT_BASE_URL;
const outputFile = args.get('output') || `.ai/product-flow/results-${new Date().toISOString().slice(0, 10)}.json`;
const customerEmail = args.get('customer-email') || process.env.PRODUCT_FLOW_CUSTOMER_EMAIL || DEFAULT_CUSTOMER_EMAIL;
const customerPassword = args.get('customer-password') || process.env.PRODUCT_FLOW_CUSTOMER_PASSWORD || DEFAULT_CUSTOMER_PASSWORD;
const adminEmail = args.get('admin-email') || process.env.PRODUCT_FLOW_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
const adminPassword = args.get('admin-password') || process.env.PRODUCT_FLOW_ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

const cookieParts = (setCookieHeader) => (setCookieHeader || '')
  .split(/,(?=[^;]+=)/)
  .map(part => part.split(';')[0])
  .filter(Boolean);
const cookieHeader = (setCookieHeader) => cookieParts(setCookieHeader).join('; ');
const cookieValue = (cookies, name) => cookies.match(new RegExp(`${name}=([^;]+)`))?.[1] || '';
const has = (value, needle) => String(value || '').toLowerCase().includes(String(needle || '').toLowerCase());

const hotinfoXml = `<?xml version="1.0" encoding="utf-8"?>
<hotinfo>
  <cadinfo>
    <allplanversion>
      <item name="Version">Allplan 2026</item>
      <item name="Build-ID">39.1.1</item>
      <item name="Hotfix">2026-1-2</item>
    </allplanversion>
    <license type="CodeMeter Network" />
    <modules>
      <module name="Architecture" />
      <module name="IFC" />
    </modules>
  </cadinfo>
  <system>
    <platform name="Windows 11"><build>26100</build></platform>
    <processor name="Intel Core i9" />
    <video>
      <card-description>NVIDIA RTX 4070</card-description>
      <driver-version>555.99</driver-version>
      <opengl-version>4.6</opengl-version>
      <dedicated-memory>8589934592</dedicated-memory>
    </video>
    <display resolution="2560x1440" />
    <processes>
      <process>C:\\Windows\\System32\\onedrive.exe</process>
    </processes>
    <security>
      <service>Windows Defender</service>
    </security>
  </system>
  <traceinfo>
    <trace>SEC Hata: C:\\ProgramData\\Nemetschek\\Allplan\\2026\\License\\_SEC.NSE</trace>
  </traceinfo>
</hotinfo>`;

async function request(pathname, options = {}, session) {
  const headers = {
    'x-requested-with': 'XMLHttpRequest',
    ...(session?.token ? { authorization: `Bearer ${session.token}` } : {}),
    ...(session?.cookies ? { cookie: session.cookies } : {}),
    ...(session?.xsrf ? { 'x-xsrf-token': session.xsrf } : {}),
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData) && !headers['content-type']) {
    headers['content-type'] = 'application/json';
  }

  const response = await fetch(`${baseUrl}${pathname}`, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text();
  return { response, body, text: typeof body === 'string' ? body : JSON.stringify(body) };
}

async function login(email, password) {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-requested-with': 'XMLHttpRequest',
    },
    body: JSON.stringify({ email, password }),
  });
  const cookies = cookieHeader(response.headers.get('set-cookie'));
  const body = await response.json();
  const token = body.access_token || body.accessToken || body.token || body.data?.accessToken;
  if (!response.ok || !token) {
    throw new Error(`Login failed for ${email}: HTTP ${response.status}`);
  }
  return { email, token, cookies, xsrf: cookieValue(cookies, 'XSRF-TOKEN') };
}

function check(id, ok, details = {}) {
  return { id, ok: Boolean(ok), ...details };
}

async function run() {
  const startedAt = new Date().toISOString();
  const runId = `pf-${Date.now()}`;
  const customer = await login(customerEmail, customerPassword);
  const admin = await login(adminEmail, adminPassword);
  const results = [];

  const health = await fetch(`${baseUrl}/health`);
  results.push(check('product-health-001', health.ok, { status: health.status }));

  const hotinfoForm = new FormData();
  hotinfoForm.append('file', new Blob([hotinfoXml], { type: 'application/octet-stream' }), '_hotinf_.hxl');
  const upload = await request('/customers/me/hotinfo', {
    method: 'POST',
    body: hotinfoForm,
    headers: {},
  }, customer);
  const hotinfo = upload.body?.hotinfo || {};
  results.push(check('product-hotinfo-upload-001', upload.response.ok && upload.body?.success === true && has(hotinfo.gpu, 'NVIDIA RTX 4070'), {
    status: upload.response.status,
    allplanVersion: hotinfo.allplanVersion || null,
    gpu: hotinfo.gpu || null,
    osVersion: hotinfo.osVersion || null,
    conflictingProcesses: hotinfo.conflictingProcesses || [],
  }));

  const profile = await request('/auth/me', { method: 'GET' }, customer);
  const profileHotinfo = profile.body?.customerProfile?.hotinfoData || {};
  results.push(check('product-hotinfo-profile-001', profile.response.ok && has(profileHotinfo.gpu, 'NVIDIA RTX 4070'), {
    status: profile.response.status,
    hasHotinfoUpdatedAt: Boolean(profile.body?.customerProfile?.hotinfoUpdatedAt),
  }));

  const aiQuery = await request('/ai/query?wait=true', {
    method: 'POST',
    body: JSON.stringify({
      query: 'Hotinfo raporuma göre ekran kartı ve sistem bilgilerimde dikkat etmem gereken bir sorun var mı?',
      language: 'tr',
      hotinfoContext: hotinfo,
    }),
  }, customer);
  const aiAnswer = String(aiQuery.body?.answer || '');
  results.push(check('product-hotinfo-ai-context-001', aiQuery.response.ok && aiAnswer.length > 0 && !has(aiAnswer, '_SEC.NSE'), {
    status: aiQuery.response.status,
    confidence: aiQuery.body?.confidence || null,
    answerMode: aiQuery.body?.answerMode || null,
    rawTraceLeaked: has(aiAnswer, '_SEC.NSE') || has(aiAnswer, 'ProgramData\\\\Nemetschek'),
  }));

  const subject = `[PF_ACCEPTANCE] AI opsiyonel ticket ${runId}`;
  const ticketBody = {
    subject,
    description: 'AI kullanmadan doğrudan destek talebi açma kabul testi. Hotinfo snapshot ticket üzerinde kalmalı.',
    priority: 'MEDIUM',
    tags: ['product-flow-acceptance', runId],
    hotinfoContext: hotinfo,
    channel: 'WEB',
  };
  const created = await request('/tickets', {
    method: 'POST',
    body: JSON.stringify(ticketBody),
  }, customer);
  const ticket = created.body || {};
  results.push(check('product-ticket-no-ai-001', created.response.status === 201 && Boolean(ticket.ticketNumber) && !ticket.interactionId, {
    status: created.response.status,
    ticketId: ticket.id || null,
    ticketNumber: ticket.ticketNumber || null,
    interactionId: ticket.interactionId || null,
  }));

  const customerTicket = ticket.id
    ? await request(`/tickets/${ticket.id}`, { method: 'GET' }, customer)
    : { response: { ok: false, status: 0 }, body: {} };
  results.push(check('product-ticket-customer-read-001', customerTicket.response.ok && customerTicket.body?.id === ticket.id, {
    status: customerTicket.response.status,
  }));

  const adminTicket = ticket.id
    ? await request(`/tickets/${ticket.id}`, { method: 'GET' }, admin)
    : { response: { ok: false, status: 0 }, body: {} };
  const snapshot = adminTicket.body?.hotinfoSnapshot || customerTicket.body?.hotinfoSnapshot || ticket.hotinfoSnapshot || {};
  results.push(check('product-ticket-hotinfo-snapshot-001', adminTicket.response.ok && has(snapshot.gpu, 'NVIDIA RTX 4070'), {
    status: adminTicket.response.status,
    snapshotGpu: snapshot.gpu || null,
    snapshotAllplanVersion: snapshot.allplanVersion || null,
  }));

  const forbiddenDownload = await request(`/customers/${profile.body?.id}/hotinfo/download`, { method: 'GET' }, customer);
  results.push(check('product-hotinfo-rbac-customer-download-001', forbiddenDownload.response.status === 403, {
    status: forbiddenDownload.response.status,
  }));

  const adminDownload = await request(`/customers/${profile.body?.id}/hotinfo/download`, { method: 'GET' }, admin);
  results.push(check('product-hotinfo-rbac-admin-download-001', adminDownload.response.ok && has(adminDownload.text, '<hotinfo>'), {
    status: adminDownload.response.status,
    contentType: adminDownload.response.headers.get('content-type') || null,
  }));

  const summary = {
    startedAt,
    finishedAt: new Date().toISOString(),
    baseUrl,
    runId,
    total: results.length,
    pass: results.filter(result => result.ok).length,
    fail: results.filter(result => !result.ok).length,
  };
  const output = { summary, results };
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, `${JSON.stringify(output, null, 2)}\n`);

  for (const result of results) {
    console.log(`${result.ok ? 'PASS' : 'FAIL'} ${result.id}`);
  }
  console.log('\nSUMMARY', JSON.stringify(summary, null, 2));
  console.log(`Wrote ${outputFile}`);

  if (summary.fail > 0) process.exitCode = 1;
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
