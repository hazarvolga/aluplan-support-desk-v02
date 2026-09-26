const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { spawnSync } = require('node:child_process');

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

const runner = instructions.slice(instructions.findIndex(line => /AS runner$/.test(line)));

test('frontend removes only explicit global package manager paths from the runner', () => {
    const expected = [
        '/usr/local/lib/node_modules/npm', '/usr/local/lib/node_modules/pnpm',
        '/usr/local/lib/node_modules/corepack', '/opt/yarn-v1.22.22',
        '/usr/local/bin/npm', '/usr/local/bin/npx', '/usr/local/bin/pnpm',
        '/usr/local/bin/pnpx', '/usr/local/bin/corepack', '/usr/local/bin/yarn', '/usr/local/bin/yarnpkg',
    ];
    const removals = runner.filter(line => line.startsWith('RUN rm '));
    assert.equal(removals.length, 1);
    assert.deepEqual(removals[0].split(/\s+/), ['RUN', 'rm', '-rf', ...expected]);
    assert.ok(runner.indexOf(removals[0]) < runner.indexOf('USER nextjs'));
    assert.equal(builder.filter(line => line.startsWith('RUN rm ')).length, 0);
    assert.ok(instructions.includes('RUN npm install -g pnpm@9.15.4'));
    assert.ok(runner.includes('CMD ["node", "apps/frontend/server.js"]'));
});

test('frontend base and runner use the same immutable Node image', () => {
    const images = instructions.filter(line => /^FROM node:/.test(line));
    assert.equal(images.length, 2);
    for (const line of images) assert.match(line, /^FROM node:20\.20\.2-alpine3\.23@sha256:[a-f0-9]{64} AS /);
    assert.equal(images[0].split(' ')[1], images[1].split(' ')[1]);
});

test('frontend records a validated source revision', () => {
    assert.ok(runner.includes('ARG VCS_REF'));
    const guard = runner.find(line => line.startsWith('RUN ') && line.includes('VCS_REF'));
    assert.ok(guard);
    for (const value of ['', 'a'.repeat(39), 'a'.repeat(41), 'A'.repeat(40), `${'a'.repeat(40)}\nextra`]) {
        const result = spawnSync('/bin/sh', ['-c', guard.slice(4)], {
            env: { PATH: '/usr/bin:/bin', VCS_REF: value }, timeout: 1000,
        });
        assert.equal(result.error, undefined);
        assert.notEqual(result.status, 0, 'invalid revision must fail');
    }
    assert.equal(spawnSync('/bin/sh', ['-c', guard.slice(4)], {
        env: { PATH: '/usr/bin:/bin', VCS_REF: 'a'.repeat(40) }, timeout: 1000,
    }).status, 0);
    assert.ok(runner.includes('LABEL org.opencontainers.image.revision="${VCS_REF}"'));
});

test('runtime code is root owned and only the cache is granted to nextjs', () => {
    const copies = runner.filter(line => line.startsWith('COPY '));
    assert.equal(copies.length, 3);
    for (const line of copies) assert.ok(line.includes('--chown=root:root '));
    assert.deepEqual(runner.filter(line => /\bchown\b/.test(line) && line.startsWith('RUN ')), [
        'RUN mkdir -p /app/apps/frontend/.next/cache && chown nextjs:nodejs /app/apps/frontend/.next/cache',
    ]);
    assert.ok(runner.includes('USER nextjs'));
    assert.ok(runner.includes('CMD ["node", "apps/frontend/server.js"]'));
});
