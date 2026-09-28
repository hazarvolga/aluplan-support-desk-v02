import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createPlan, copyCandidate } from './security-candidate-source.mjs';

function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'candidate-source-test-')));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const repo = path.join(root, 'repo'); fs.mkdirSync(repo);
  const put = (name, data = 'export {};\n') => {
    const target = path.join(repo, name); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, data);
  };
  execFileSync('git', ['init', '-q', repo]);
  put('apps/backend/src/main.ts', 'original');
  put('packages/database/prisma/dev.db', 'private database');
  put('apps/backend/.env', 'SECRET=not-a-real-secret');
  put('.gitignore', 'ignored.ts\nnode_modules/\n');
  execFileSync('git', ['-C', repo, 'add', '.']);
  execFileSync('git', ['-C', repo, 'add', '-f', 'apps/backend/.env', 'packages/database/prisma/dev.db']);
  put('apps/backend/src/main.ts', 'dirty bytes');
  put('apps/backend/src/new.ts', 'new bytes');
  put('apps/backend/src/ignored.ts');
  put('apps/backend/src/payload.ts', Buffer.from([0, 1, 2]));
  put('apps/backend/src/odd.bin');
  put('private/source.ts');
  fs.symlinkSync('main.ts', path.join(repo, 'apps/backend/src/link.ts'));
  const freeze = { files: [{ path: 'apps/backend/src/main.ts', sha256: 'a'.repeat(64) }] };
  return { root, repo, put, freeze };
}

test('inventory uses dirty and nonignored untracked bytes, excludes sensitive and unknown files', t => {
  const { repo } = fixture(t); const plan = createPlan(repo);
  assert.deepEqual(plan.files.map(x => x.path), ['apps/backend/src/main.ts', 'apps/backend/src/new.ts']);
  assert.equal(plan.exclusions.find(x => x.path.endsWith('dev.db')).reason, 'sensitive-or-generated');
  assert.equal(plan.exclusions.find(x => x.path.endsWith('/.env')).reason, 'sensitive-or-generated');
  assert.equal(plan.exclusions.find(x => x.path.endsWith('link.ts')).reason, 'symlink');
  assert.equal(plan.exclusions.find(x => x.path.endsWith('payload.ts')).reason, 'unknown-binary');
  assert(!JSON.stringify(plan).includes('dirty bytes'));
});

test('copy is exclusive, external, verified, and preserves source dirty state', t => {
  const { root, repo } = fixture(t); const target = path.join(root, 'candidate');
  const before = execFileSync('git', ['-C', repo, 'status', '--porcelain']).toString();
  const plan = createPlan(repo); copyCandidate(repo, target, plan);
  assert.equal(fs.readFileSync(path.join(target, 'apps/backend/src/main.ts'), 'utf8'), 'dirty bytes');
  assert.notEqual(fs.statSync(path.join(target, 'apps/backend/src/main.ts')).ino, fs.statSync(path.join(repo, 'apps/backend/src/main.ts')).ino);
  assert.equal(execFileSync('git', ['-C', repo, 'status', '--porcelain']).toString(), before);
  assert.throws(() => copyCandidate(repo, target, plan), /exist/i);
  assert.throws(() => copyCandidate(repo, path.join(repo, 'nested'), plan), /outside/);
});

test('source drift and checkpoint drift fail closed before copy', t => {
  const { root, repo, put, freeze } = fixture(t); const plan = createPlan(repo);
  put('apps/backend/src/main.ts', 'changed again');
  assert.throws(() => copyCandidate(repo, path.join(root, 'candidate'), plan), /drift/);
  const drift = createPlan(repo, freeze); assert.equal(drift.checkpoint.ok, false);
  assert.throws(() => copyCandidate(repo, path.join(root, 'candidate2'), drift), /checkpoint/);
});

test('symlinked parent destination and source ancestor are rejected', t => {
  const { root, repo, put } = fixture(t);
  fs.symlinkSync(repo, path.join(root, 'alias'));
  assert.throws(() => copyCandidate(repo, path.join(root, 'alias', 'nested'), createPlan(repo)), /symlink|outside/);
  fs.mkdirSync(path.join(root, 'external')); fs.writeFileSync(path.join(root, 'external', 'file.ts'), 'external');
  put('apps/backend/src/linked/file.ts'); execFileSync('git', ['-C', repo, 'add', 'apps/backend/src/linked/file.ts']);
  fs.rmSync(path.join(repo, 'apps/backend/src/linked'), { recursive: true });
  fs.symlinkSync(path.join(root, 'external'), path.join(repo, 'apps/backend/src/linked'));
  assert.equal(createPlan(repo).exclusions.find(x => x.path.endsWith('linked/file.ts')).reason, 'symlink');
});

test('deleted, oversized, invalid UTF8, credentials, generated and unapproved SQL are excluded', t => {
  const { repo, put } = fixture(t);
  put('apps/backend/src/huge.ts', Buffer.alloc(16 * 1024 * 1024 + 1, 'x'));
  put('apps/backend/src/invalid.ts', Buffer.from([0xff, 0xff]));
  put('packages/database/client/index.ts'); put('apps/backend/src/query.sql');
  put('.npmrc', '//registry.invalid/:_authToken=synthetic');
  put('apps/backend/src/gone.ts'); execFileSync('git', ['-C', repo, 'add', 'apps/backend/src/gone.ts']);
  fs.unlinkSync(path.join(repo, 'apps/backend/src/gone.ts'));
  const plan = createPlan(repo);
  for (const [suffix, reason] of [['huge.ts', 'oversized'], ['invalid.ts', 'unknown-binary'], ['gone.ts', 'missing'], ['client/index.ts', 'sensitive-or-generated'], ['query.sql', 'not-allowlisted'], ['.npmrc', 'sensitive-or-generated']]) assert.equal(plan.exclusions.find(x => x.path.endsWith(suffix)).reason, reason);
  assert.throws(() => createPlan(path.join(repo, 'apps')), /root/);
});

test('explicit config, migration and source allowlist keeps required runtime inputs', t => {
  const { repo, put } = fixture(t);
  const included = ['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'turbo.json', 'apps/backend/.swcrc', 'apps/frontend/next.config.ts', 'apps/frontend/messages/tr.json', 'packages/database/index.d.ts', 'packages/database/prisma.config.ts', 'packages/database/prisma/schema.prisma', 'packages/database/prisma/migration-checksums.json', 'packages/database/prisma/migrations/20260101/migration.sql', 'packages/database/prisma/migrations/migration_lock.toml', 'packages/shared-schemas/src/index.ts', 'apps/frontend/scripts/check-i18n.js', 'apps/frontend/public/icon.svg', 'scripts/verify-migration-integrity.mjs', 'scripts/frontend-api-contract-allowlist.json'];
  included.forEach(name => put(name, '{}'));
  const plan = createPlan(repo);
  included.forEach(name => assert(plan.files.some(x => x.path === name), name));
});

test('CLI defaults to plan and requires matching reviewed manifest before exclusive copy', t => {
  const { root, repo, put } = fixture(t);
  const script = fileURLToPath(new URL('./security-candidate-source.mjs', import.meta.url));
  const sha256 = createHash('sha256').update('dirty bytes').digest('hex');
  const entries = [{ path: 'apps/backend/src/main.ts', sha256 }];
  for (let i = 0; i < 51; i++) { const name = `apps/backend/src/frozen-${i}.ts`; put(name, 'dirty bytes'); entries.push({ path: name, sha256 }); }
  put('.ai/issues/2026-09-08-pause-source-fingerprints.json', JSON.stringify({ files: entries }));
  const output = execFileSync(process.execPath, [script], { cwd: repo });
  const plan = JSON.parse(output); assert.equal(plan.checkpoint.ok, true);
  const manifest = path.join(root, 'plan.json'); fs.writeFileSync(manifest, output);
  const target = path.join(root, 'candidate');
  assert.throws(() => execFileSync(process.execPath, [script, 'copy', repo, target], { stdio: 'pipe' }), /Usage/);
  assert(!fs.existsSync(target));
  assert.equal(JSON.parse(execFileSync(process.execPath, [script, 'copy', repo, target, manifest])).verified, true);
  put('apps/backend/src/new.ts', 'later');
  assert.throws(() => execFileSync(process.execPath, [script, 'copy', repo, path.join(root, 'candidate2'), manifest], { stdio: 'pipe' }), /manifest drift/);
});

test('hardlinks and forged checkpoints cannot enter a copy', t => {
  const { root, repo, put } = fixture(t);
  fs.linkSync(path.join(repo, 'apps/backend/src/new.ts'), path.join(root, 'linked.ts'));
  assert.equal(createPlan(repo).exclusions.find(f => f.path.endsWith('new.ts')).reason, 'hardlink');
  assert.throws(() => createPlan(repo, { files: [{ path: '../escape', sha256: 'a'.repeat(64) }] }), /checkpoint/);
  assert.throws(() => createPlan(repo, { files: [{ path: 'apps/backend/src/main.ts', sha256: 'invalid' }] }), /checkpoint/);
  const entry = { path: 'apps/backend/src/main.ts', sha256: 'a'.repeat(64) };
  assert.throws(() => createPlan(repo, { files: [entry, entry] }), /checkpoint/);
  put('.ai/issues/2026-09-08-pause-source-fingerprints.json', JSON.stringify({ files: [entry] }));
  const forged = createPlan(repo, { files: [entry] }); forged.checkpoint.ok = true; forged.checkpoint.drift = [];
  assert.throws(() => copyCandidate(repo, path.join(root, 'candidate'), forged), /checkpoint/);
  assert.throws(() => copyCandidate(repo, path.join(root, 'candidate'), createPlan(repo)), /checkpoint/);
});

test('required email templates and canonical RBAC data survive source copy planning', t => {
  const { repo, put } = fixture(t);
  for (const name of ['apps/backend/src/email/templates/mjml/screens/password-reset.mjml', 'packages/database/prisma/rbac-canonical.json']) {
    put(name, '{}'); assert(createPlan(repo).files.some(f => f.path === name), name);
  }
});
