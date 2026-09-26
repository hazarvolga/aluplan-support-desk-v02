const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const source = readFileSync(path.join(root, 'apps/frontend/Dockerfile'), 'utf8');
const instructions = source.replace(/\\\r?\n\s*/g, ' ').split(/\r?\n/)
    .map(line => line.trim()).filter(line => line && !line.startsWith('#'));
const builder = instructions.slice(instructions.indexOf('FROM base AS builder'),
    instructions.findIndex(line => /AS runner$/.test(line)));

test('frontend builds shared schema declarations before its production bundle', () => {
    const schema = builder.indexOf('RUN pnpm --filter @aluplan/shared-schemas build');
    const frontend = builder.findIndex(line => /pnpm --filter @aluplan\/frontend build$/.test(line));
    assert.ok(schema >= 0 && frontend > schema);
});

test('frontend has a separate fail-closed typecheck after schema compilation', () => {
    const schema = builder.indexOf('RUN pnpm --filter @aluplan/shared-schemas build');
    const check = builder.indexOf('RUN pnpm --filter @aluplan/frontend typecheck');
    const frontend = builder.findIndex(line => /pnpm --filter @aluplan\/frontend build$/.test(line));
    assert.ok(schema >= 0 && check > schema && frontend > check);
});

test('frontend install cannot silently rewrite the lockfile', () => {
    const installs = builder.filter(line => /^RUN pnpm install\b/.test(line));
    assert.deepEqual(installs, ['RUN pnpm install --frozen-lockfile']);
});

test('frontend uses the repository package manager version', () => {
    const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
    assert.ok(instructions.includes(`RUN npm install -g ${manifest.packageManager}`));
});
