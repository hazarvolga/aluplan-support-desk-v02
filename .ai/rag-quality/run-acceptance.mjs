#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_BASE_URL = 'http://localhost:4000/api/v1';
const DEFAULT_EMAIL = 'e2e-admin@aluplan.test';
const DEFAULT_PASSWORD = 'E2eAdmin!Pass123';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (!arg.startsWith('--')) continue;
  const [key, inlineValue] = arg.slice(2).split('=');
  const value = inlineValue ?? (process.argv[i + 1]?.startsWith('--') ? 'true' : process.argv[++i]);
  args.set(key, value);
}

const baseUrl = args.get('base-url') || process.env.RAG_ACCEPTANCE_BASE_URL || DEFAULT_BASE_URL;
const email = args.get('email') || process.env.RAG_ACCEPTANCE_EMAIL || DEFAULT_EMAIL;
const password = args.get('password') || process.env.RAG_ACCEPTANCE_PASSWORD || DEFAULT_PASSWORD;
const delayMs = Number(args.get('delay-ms') || process.env.RAG_ACCEPTANCE_DELAY_MS || 15000);
const limit = Number(args.get('limit') || 5);
const questionFile = args.get('file') || '.ai/rag-quality/acceptance-questions.json';
const outputFile = args.get('output') || `.ai/rag-quality/results-${new Date().toISOString().slice(0, 10)}.json`;
const onlyIds = new Set((args.get('ids') || '').split(',').map(id => id.trim()).filter(Boolean));

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const normalize = (value) => String(value || '').toLowerCase();
const cookieParts = (setCookieHeader) => (setCookieHeader || '')
  .split(/,(?=[^;]+=)/)
  .map(part => part.split(';')[0])
  .filter(Boolean);
const cookieHeader = (setCookieHeader) => cookieParts(setCookieHeader).join('; ');
const cookieValue = (cookies, name) => {
  const match = cookies.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1] || '';
};

const hasHint = (text, hints = []) => {
  const normalizedText = normalize(text);
  return hints.some(hint => {
    const normalizedHint = normalize(hint);
    return normalizedText.includes(normalizedHint) || normalizedText.includes(normalizedHint.replace(/_/g, ' '));
  });
};

async function login() {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const cookies = cookieHeader(response.headers.get('set-cookie'));
  const body = await response.json();
  const token = body.access_token || body.accessToken || body.token || body.data?.accessToken;
  if (!response.ok || !token) {
    throw new Error(`Login failed: HTTP ${response.status}`);
  }

  return {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`,
    cookie: cookies,
    'x-xsrf-token': cookieValue(cookies, 'XSRF-TOKEN'),
    'x-requested-with': 'XMLHttpRequest',
  };
}

function evaluate(question, responseStatus, results) {
  const top = results[0];
  const joinedTopFive = results
    .slice(0, 5)
    .map(result => `${result.title || ''} ${result.category || ''} ${JSON.stringify(result.metadata || {})}`)
    .join('\n');
  const categoryOk = (question.expectedCategories || []).some(category =>
    results.slice(0, 3).some(result => normalize(result.category).includes(normalize(category))),
  );
  const sourceOk = hasHint(joinedTopFive, question.expectedSourceHints);
  const forbiddenHit = hasHint(joinedTopFive, question.forbiddenSourceHints);
  const ok = responseStatus === 200 && results.length > 0 && categoryOk && sourceOk && !forbiddenHit;

  return {
    ok,
    status: responseStatus,
    categoryOk,
    sourceOk,
    forbiddenHit,
    top: top
      ? {
          title: top.title,
          category: top.category || top.metadata?.category || null,
          similarity: Number(top.similarity || 0),
        }
      : null,
    top3: results.slice(0, 3).map(result => ({
      title: result.title,
      category: result.category || result.metadata?.category || null,
      similarity: Number(result.similarity || 0),
    })),
  };
}

async function run() {
  const input = JSON.parse(await fs.readFile(questionFile, 'utf8'));
  const questions = onlyIds.size > 0
    ? input.questions.filter(question => onlyIds.has(question.id))
    : input.questions;
  const headers = await login();
  const startedAt = new Date().toISOString();
  const results = [];

  for (const question of questions) {
    const response = await fetch(`${baseUrl}/ai/search`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: question.query, limit }),
    });
    const body = await response.json().catch(() => ({}));
    const searchResults = body.results || body.data?.results || [];
    const evaluation = evaluate(question, response.status, searchResults);
    results.push({ id: question.id, query: question.query, language: question.language, ...evaluation });
    console.log(`${evaluation.ok ? 'PASS' : 'FAIL'} ${question.id} :: ${evaluation.top?.title || `HTTP ${response.status}`}`);
    if (question !== questions.at(-1)) await sleep(delayMs);
  }

  const summary = {
    startedAt,
    finishedAt: new Date().toISOString(),
    baseUrl,
    delayMs,
    total: results.length,
    pass: results.filter(result => result.ok).length,
    fail: results.filter(result => !result.ok).length,
    throttle: results.filter(result => result.status === 429).length,
  };
  const output = { summary, results };
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, `${JSON.stringify(output, null, 2)}\n`);
  console.log('\nSUMMARY', JSON.stringify(summary, null, 2));
  console.log(`Wrote ${outputFile}`);

  if (summary.fail > 0) process.exitCode = 1;
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
