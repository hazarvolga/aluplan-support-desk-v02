#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_BASE_URL = 'http://localhost:4000/api/v1';
const DEFAULT_EMAIL = 'e2e-customer@aluplan.test';
const DEFAULT_PASSWORD = 'E2eCustomer!Pass123';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (!arg.startsWith('--')) continue;
  const [key, inlineValue] = arg.slice(2).split('=');
  const value = inlineValue ?? (process.argv[i + 1]?.startsWith('--') ? 'true' : process.argv[++i]);
  args.set(key, value);
}

const baseUrl = args.get('base-url') || process.env.RAG_ACCEPTANCE_BASE_URL || DEFAULT_BASE_URL;
const email = args.get('email') || process.env.RAG_ANSWER_EMAIL || DEFAULT_EMAIL;
const password = args.get('password') || process.env.RAG_ANSWER_PASSWORD || DEFAULT_PASSWORD;
const delayMs = Number(args.get('delay-ms') || process.env.RAG_ANSWER_DELAY_MS || 15000);
const questionFile = args.get('file') || '.ai/rag-quality/acceptance-questions.json';
const outputFile = args.get('output') || `.ai/rag-quality/answer-smoke-${new Date().toISOString().slice(0, 10)}.json`;
const onlyIds = new Set((args.get('ids') || '').split(',').map(id => id.trim()).filter(Boolean));

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const normalize = (value) => String(value || '').toLowerCase();
const cookieParts = (setCookieHeader) => (setCookieHeader || '')
  .split(/,(?=[^;]+=)/)
  .map(part => part.split(';')[0])
  .filter(Boolean);
const cookieHeader = (setCookieHeader) => cookieParts(setCookieHeader).join('; ');
const cookieValue = (cookies, name) => cookies.match(new RegExp(`${name}=([^;]+)`))?.[1] || '';

function hasHint(text, hints = []) {
  const normalizedText = normalize(text);
  return hints.some(hint => normalizedText.includes(normalize(hint)));
}

async function login() {
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

function evaluate(question, responseStatus, body) {
  const answer = String(body.answer || '');
  const statusOk = responseStatus === 200;
  const answerOk = answer.trim().length > 0;
  const answerHintsOk = hasHint(answer, question.mustMentionHints);
  const sourceLeak = /(?:^|\n)(?:Kaynak|İlgili pasaj):/i.test(answer);
  const customerSourcesHidden = !Array.isArray(body.sources) || body.sources.length === 0;
  const noForbiddenSource = !hasHint(JSON.stringify(body.sources || []), question.forbiddenSourceHints);
  const noNoMatch = body.confidence !== 'NO_MATCH';
  const ok = statusOk && answerOk && answerHintsOk && !sourceLeak && customerSourcesHidden && noForbiddenSource && noNoMatch;

  return {
    ok,
    status: responseStatus,
    answerMode: body.answerMode || null,
    confidence: body.confidence || null,
    answerHintsOk,
    sourceLeak,
    customerSourcesHidden,
    noForbiddenSource,
    noNoMatch,
    answerPreview: answer.slice(0, 500),
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
    const response = await fetch(`${baseUrl}/ai/query?wait=true`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: question.query, language: question.language }),
    });
    const body = await response.json().catch(() => ({}));
    const evaluation = evaluate(question, response.status, body);
    results.push({ id: question.id, query: question.query, language: question.language, ...evaluation });
    console.log(`${evaluation.ok ? 'PASS' : 'FAIL'} ${question.id} :: ${evaluation.answerMode || `HTTP ${response.status}`} ${evaluation.confidence || ''}`);
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
    sourceLeaks: results.filter(result => result.sourceLeak).length,
    noMatch: results.filter(result => !result.noNoMatch).length,
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
