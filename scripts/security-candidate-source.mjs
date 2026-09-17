#!/usr/bin/env node
// Local source preparation only. Never executes copied code, Git hooks, installs or services.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const MAX_BYTES = 16 * 1024 * 1024;
const CHECKPOINT = '.ai/issues/2026-09-08-pause-source-fingerprints.json';
const CONFIG = /^(package\.json|tsconfig(?:\.[\w-]+)?\.json|Dockerfile|\.swcrc|\.eslintrc\.json|eslint\.config\.mjs|jest\.config\.js|jest\.setup\.ts|nest-cli\.json|next-env\.d\.ts|next\.config\.ts|postcss\.config\.js|tailwind\.config\.js|vitest\.config\.ts|playwright\.config\.ts)$/;
const TEXT = /\.(?:[cm]?[jt]sx?|json|css|scss|html|mjml|md|svg|prisma|toml|yaml|yml)$/;
const ROOT = new Set(['package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'turbo.json', 'tsconfig.json', '.dockerignore']);
const REQUIRED_SCRIPTS = /^(?:verify-|compare-database-|audit-migration-effects|measure-migration-locks|resolve-production-migration-plan|release-fingerprint-rbac|capture-release-fingerprints|release-a14-inventory-contract|security-candidate-source)[\w.-]*\.(?:mjs|json)$/;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const inside = (parent, child) => child === parent || child.startsWith(parent + path.sep);

function pathKind(repo, relative) {
  if (path.isAbsolute(relative) || relative.split('/').some(p => p === '..' || !p)) return 'unsafe-path';
  let current = repo;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    let stat; try { stat = fs.lstatSync(current); } catch { return 'missing'; }
    if (stat.isSymbolicLink()) return 'symlink';
  }
  const stat = fs.lstatSync(current);
  return stat.isFile() ? (stat.nlink === 1 ? 'regular' : 'hardlink') : 'not-regular';
}

function allowed(relative) {
  const parts = relative.split('/');
  if (parts.some(p => /^(?:\.git|\.env.*|\.npmrc|\.private.*|private|node_modules|dist|\.next|\.turbo|coverage|uploads|logs|\.auth|auth-state|playwright-report|test-results|client|generated|cache|caches|backups|temp-backups)$/i.test(p)) || /\.(?:db|sqlite\d*|dump|age|log|pem|key|p12|tsbuildinfo)(?:[-.]|$)/i.test(relative)) return 'sensitive-or-generated';
  if (ROOT.has(relative)) return null;
  if (/^scripts\//.test(relative) && REQUIRED_SCRIPTS.test(parts.at(-1)) && parts.length === 2) return null;
  if (/^scripts\/(?:frontend-api-contract-allowlist|database-schema-difference-allowlist)\.json$/.test(relative)) return null;
  if (/^(?:apps\/(?:backend|frontend)|packages\/(?:database|shared-schemas))\//.test(relative)) {
    if (parts.length === 3 && CONFIG.test(parts[2])) return null;
    if (/^packages\/database\/(?:index\.(?:js|ts|d\.ts)|prisma\.config\.(?:js|ts))$/.test(relative)) return null;
    if (/^packages\/database\/prisma\/(?:schema\.prisma|rbac-canonical\.json|migration-checksums\.json|migrations\/migration_lock\.toml|migrations\/[^/]+\/migration\.sql)$/.test(relative)) return null;
    if (/^apps\/frontend\/scripts\/check-i18n\.js$/.test(relative)) return null;
    if (/^(?:apps\/(?:backend|frontend)|packages\/shared-schemas)\/(?:src|test|__tests__|e2e|messages)\//.test(relative) && TEXT.test(relative)) return null;
    if (/^apps\/frontend\/public\//.test(relative) && /\.(?:svg|css|json|txt)$/.test(relative)) return null;
  }
  return 'not-allowlisted';
}

function readSource(repo, relative) {
  const kind = pathKind(repo, relative);
  if (kind !== 'regular') throw new Error(`Source not regular: ${kind}`);
  const fd = fs.openSync(path.join(repo, relative), fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
  try {
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.nlink !== 1) throw new Error('Source type changed');
    if (stat.size > MAX_BYTES) throw new Error('oversized');
    return fs.readFileSync(fd);
  } finally { fs.closeSync(fd); }
}

export function createPlan(directory, checkpoint = null) {
  if (checkpoint && (!Array.isArray(checkpoint.files) || !checkpoint.files.length || new Set(checkpoint.files.map(f => f.path)).size !== checkpoint.files.length || checkpoint.files.some(f => typeof f.path !== 'string' || allowed(f.path) || path.isAbsolute(f.path) || f.path.split('/').some(p => p === '..' || !p) || !/^[a-f0-9]{64}$/.test(f.sha256)))) throw new Error('Invalid checkpoint schema');
  const repo = fs.realpathSync(directory);
  const top = execFileSync('git', ['-C', repo, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  if (fs.realpathSync(top) !== repo) throw new Error('Repository root required');
  const paths = [...new Set(execFileSync('git', ['-C', repo, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'], { maxBuffer: 32 * 1024 * 1024 }).toString().split('\0').filter(Boolean))].sort();
  const files = [], exclusions = [];
  for (const relative of paths) {
    const kind = pathKind(repo, relative);
    let reason = kind === 'regular' ? allowed(relative) : kind;
    if (!reason) {
      try {
        const bytes = readSource(repo, relative);
        try { new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { reason = 'unknown-binary'; }
        if (bytes.includes(0)) reason = 'unknown-binary';
        if (!reason) files.push({ path: relative, bytes: bytes.length, sha256: hash(bytes) });
      } catch (error) { if (error.message === 'oversized') reason = 'oversized'; else throw error; }
    }
    if (reason) exclusions.push({ path: relative, reason });
  }
  const drift = (checkpoint?.files ?? []).filter(entry => !files.some(f => f.path === entry.path && f.sha256 === entry.sha256)).map(entry => entry.path);
  return { version: 1, source: repo, files, exclusions, checkpoint: { supplied: !!checkpoint, expected: checkpoint?.files.length ?? 0, ok: drift.length === 0, drift }, limitations: ['Path allowlist is not a secret-content scanner.', 'Binary assets excluded pending explicit review.', 'No concurrent filesystem mutation allowed; Node cannot guarantee ancestor openat atomicity.', 'No install, build, application or database safety proof.'] };
}

export function copyCandidate(directory, destination, plan) {
  const repo = fs.realpathSync(directory), target = path.resolve(destination);
  const parent = path.dirname(target);
  if (fs.realpathSync(parent) !== parent) throw new Error('Destination parent symlink rejected');
  if (inside(repo, target) || inside(target, repo)) throw new Error('Destination must be outside repository and cannot be its ancestor');
  if (fs.existsSync(target)) throw new Error('Destination already exists');
  if (plan.source !== repo || !plan.checkpoint.ok) throw new Error('Source/checkpoint mismatch');
  if (plan.checkpoint.supplied) {
    const actualCheckpoint = JSON.parse(fs.readFileSync(path.join(repo, CHECKPOINT), 'utf8'));
    const checked = createPlan(repo, actualCheckpoint);
    if (!checked.checkpoint.ok || JSON.stringify(checked) !== JSON.stringify(plan)) throw new Error('Source/checkpoint drift');
  } else if (fs.existsSync(path.join(repo, CHECKPOINT))) throw new Error('Repository checkpoint may not be bypassed');
  const fresh = createPlan(repo);
  if (JSON.stringify(fresh.files) !== JSON.stringify(plan.files)) throw new Error('Source drift since plan');
  fs.mkdirSync(target, { mode: 0o700 });
  // On failure preserve partial output for inspection; no completion manifest is written.
  for (const file of plan.files) {
    const bytes = readSource(repo, file.path);
    if (hash(bytes) !== file.sha256) throw new Error('Source drift during copy');
    const output = path.join(target, file.path);
    fs.mkdirSync(path.dirname(output), { recursive: true, mode: 0o700 });
    fs.writeFileSync(output, bytes, { flag: 'wx', mode: 0o600 });
    if (hash(fs.readFileSync(output)) !== file.sha256) throw new Error('Copy verification failed');
  }
  if (JSON.stringify(createPlan(repo).files) !== JSON.stringify(plan.files)) throw new Error('Source drift after copy');
  fs.writeFileSync(path.join(target, 'candidate-source-manifest.json'), JSON.stringify({ ...plan, copiedAt: new Date().toISOString(), verified: true }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  return { target, files: plan.files.length, verified: true };
}

function cli(args) {
  const [mode = 'plan', directory = process.cwd(), destination, manifest] = args;
  if (!['plan', 'copy'].includes(mode) || args.length > 4 || (mode === 'plan' && destination) || (mode === 'copy' && (!destination || !manifest))) throw new Error('Usage: security-candidate-source.mjs [plan REPO | copy REPO NEW_EXTERNAL_DIR REVIEWED_PLAN_JSON]');
  const checkpointPath = path.join(directory, CHECKPOINT);
  const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
  if (checkpoint.files?.length !== 52) throw new Error('Expected complete 52-file checkpoint');
  const plan = createPlan(directory, checkpoint);
  if (mode === 'copy') {
    const approved = JSON.parse(fs.readFileSync(manifest, 'utf8'));
    if (JSON.stringify(approved) !== JSON.stringify(plan)) throw new Error('Reviewed manifest drift; regenerate and review plan');
    console.log(JSON.stringify(copyCandidate(directory, destination, approved), null, 2));
  } else console.log(JSON.stringify(plan, null, 2));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { cli(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
