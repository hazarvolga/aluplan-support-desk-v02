const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

// Source-contract tests only: do not build an image or execute cleanup/migrations.
const root = path.resolve(__dirname, '../../..');
const dockerfile = readFileSync(path.join(root, 'apps/backend/Dockerfile'), 'utf8');
const instructions = dockerfile.replace(/\\\n\s*/g, ' ').split('\n');
const runner = instructions.slice(instructions.findIndex(line => line.endsWith(' AS runner')));
const cleanupPrefix = 'RUN rm -rf /usr/local/lib/node_modules/npm';

test('runner removes only reviewed global package-manager paths', () => {
  const cleanups = runner.filter(line => line.startsWith(cleanupPrefix));
  assert.equal(cleanups.length, 1, 'exactly one bounded package-manager cleanup is required');
  assert.deepEqual(cleanups[0].slice('RUN rm -rf '.length).trim().split(/\s+/), [
    '/usr/local/lib/node_modules/npm',
    '/usr/local/lib/node_modules/pnpm',
    '/usr/local/lib/node_modules/corepack',
    '/opt/yarn-v1.22.22',
    ...['npm', 'npx', 'pnpm', 'pnpx', 'corepack', 'yarn', 'yarnpkg'].map(name => `/usr/local/bin/${name}`),
  ]);
});

test('cleanup follows production installation and Prisma generation without reinstalling tools', () => {
  const cleanupIndex = runner.findIndex(line => line.startsWith(cleanupPrefix));
  assert.ok(cleanupIndex >= 0, 'package-manager cleanup must exist');
  for (const command of ['npm install -g prisma@7.4.2', 'pnpm install --prod --frozen-lockfile', 'prisma generate --schema']) {
    const index = runner.findIndex(line => line.startsWith('RUN ') && line.includes(command));
    assert.ok(index >= 0 && index < cleanupIndex, `${command} must precede cleanup`);
  }
  assert.ok(cleanupIndex < runner.indexOf('USER node'));
  assert.doesNotMatch(runner.slice(cleanupIndex + 1).join('\n'), /(?:npm|pnpm) install|prisma generate/);
});

test('explicit migration command retains global Prisma and workspace dependencies', () => {
  const migration = readFileSync(path.join(root, 'apps/backend/scripts/migrate-once.sh'), 'utf8');
  const parity = readFileSync(path.join(root, 'scripts/verify-schema-parity.mjs'), 'utf8');
  assert.match(migration, /prisma migrate deploy/);
  assert.match(migration, /node \.\/scripts\/verify-schema-parity\.mjs/);
  assert.match(parity, /spawnSync\(\s*'prisma',/);
  assert.match(dockerfile, /npm install -g prisma@7\.4\.2/);
  for (const line of runner.filter(value => /^RUN .*\brm\b/.test(value))) {
    assert.doesNotMatch(line, /\/usr\/local\/(?:lib\/node_modules\/prisma|bin\/prisma)(?:\s|$)/);
    assert.doesNotMatch(line, /(?:\/app\/|\s(?:\.\/)?)(?:packages|node_modules)(?:\/|\s|$)/);
  }
  assert.ok(runner.includes('CMD ["./apps/backend/scripts/deploy.sh"]'));
});

test('existing PostgreSQL 17 package and both client guards remain', () => {
  const apk = runner.find(line => line.startsWith('RUN apk add'));
  assert.match(apk, /\bpostgresql17-client\b/);
  assert.doesNotMatch(apk, /\bpostgresql-client\b/);
  const guards = runner.find(line => line.startsWith('RUN ') && line.includes('pg_dump --version'));
  assert.ok(guards.includes("pg_dump --version | grep -E 'PostgreSQL\\) 17\\.'"));
  assert.ok(guards.includes("pg_restore --version | grep -E 'PostgreSQL\\) 17\\.'"));
  assert.doesNotMatch(guards, /\|\|/);
});
