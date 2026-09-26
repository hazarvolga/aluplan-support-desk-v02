const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { runInNewContext } = require('node:vm');
const test = require('node:test');

const source = readFileSync(path.join(__dirname, 'verify-schema-parity.mjs'), 'utf8');
const importLine = "import { spawnSync } from 'node:child_process';";
assert.ok(source.startsWith(importLine), 'review new module imports before adapting this isolated harness');
const executable = source.slice(importLine.length);
const residual = '-- DropIndex\nDROP INDEX "idx_faq_entries_embedding_version_dim";';

// Evaluate the actual consumer with an injected subprocess recorder. No real
// child_process, database connection, environment or filesystem is exposed.
function invoke(result, databaseUrl = 'postgresql://synthetic:synthetic@example.invalid/test') {
  const calls = [];
  const output = [];
  const env = databaseUrl ? { DATABASE_URL: databaseUrl } : {};
  const context = {
    spawnSync(command, args, options) {
      calls.push({ command, args: Array.from(args), options });
      return result;
    },
    process: { env, cwd: () => '/synthetic-workspace', stderr: { write: text => output.push(text) } },
    console: { log: text => output.push(text) },
  };
  let error;
  try {
    runInNewContext(executable, context, { timeout: 1000, contextCodeGeneration: { strings: false, wasm: false } });
  } catch (caught) {
    error = caught;
  }
  return { calls, output, error, env };
}

test('runtime parity invokes retained Prisma directly with bounded unchanged arguments', () => {
  const proof = invoke({ status: 0, stdout: `[dotenv@17] injected env\n${residual}\n` });
  assert.equal(proof.error, undefined);
  assert.equal(proof.calls.length, 1);
  const { command, args, options } = proof.calls[0];
  assert.equal(command, 'prisma');
  assert.deepEqual(args, [
    'migrate', 'diff', '--config', 'packages/database/prisma.config.js',
    '--from-config-datasource', '--to-schema', 'packages/database/prisma/schema.prisma', '--script',
  ]);
  assert.equal(options.cwd, '/synthetic-workspace');
  assert.equal(options.env, proof.env);
  assert.equal(options.timeout, 60_000);
  assert.equal(options.maxBuffer, 4 * 1024 * 1024);
  assert.equal(options.encoding, 'utf8');
  assert.equal(options.shell, undefined);
  assert.match(proof.output[0], /^Schema parity verified:/);
});

test('parity refuses missing database configuration without spawning a process', () => {
  const proof = invoke({ status: 0, stdout: residual }, '');
  assert.match(proof.error?.message, /DATABASE_URL is required/);
  assert.equal(proof.calls.length, 0);
});

test('parity remains fail-closed on subprocess errors and unexpected schema drift', () => {
  for (const [result, expected] of [
    [{ error: { code: 'ENOENT' } }, /Unable to complete Prisma schema parity diff/],
    [{ status: 1, stdout: residual }, /Prisma schema parity diff failed/],
    [{ status: 0, stdout: '' }, /Unexpected schema drift/],
    [{ status: 0, stdout: 'ALTER TABLE synthetic ADD COLUMN unexpected text;' }, /Unexpected schema drift/],
  ]) {
    const proof = invoke(result);
    assert.equal(proof.calls.length, 1);
    assert.match(proof.error?.message, expected);
  }
});
