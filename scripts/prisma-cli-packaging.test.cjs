const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const read = relative => readFileSync(path.resolve(__dirname, '..', relative), 'utf8');
const dockerfile = read('apps/backend/Dockerfile');
const commands = dockerfile.replace(/^\s*#.*$/gm, '').replace(/\\\r?\n\s*/g, ' ');
const runner = commands.split(/\bAS runner\s*\n/i)[1];
const database = JSON.parse(read('packages/database/package.json'));
const migrate = read('apps/backend/scripts/migrate-once.sh').replace(/\\\r?\n\s*/g, ' ');

test('runner reuses frozen workspace Prisma instead of installing a global copy', () => {
    assert.ok(runner, 'backend Dockerfile must contain the runner stage');
    assert.doesNotMatch(commands, /npm\s+(?:install|i|add)\b[^\n]*\bprisma(?:@|\s|$)/);
    const install = runner.indexOf('pnpm install --prod --frozen-lockfile');
    const link = runner.indexOf('ln -s /app/packages/database/node_modules/prisma/build/index.js /usr/local/bin/prisma');
    const generate = runner.indexOf('prisma generate');
    assert.ok(install >= 0, 'runner must install frozen production dependencies');
    assert.ok(link > install, 'link the direct workspace CLI entrypoint after production install');
    assert.ok(generate > link, 'workspace CLI must be available before client generation');
    assert.doesNotMatch(runner, /ln\s+-s[^\n]*node_modules\/\.bin\/prisma/);
});

test('Prisma CLI and client remain pinned production dependencies at 7.4.2', () => {
    assert.equal(database.dependencies.prisma, '7.4.2');
    assert.equal(database.dependencies['@prisma/client'], '7.4.2');
    assert.equal(database.devDependencies?.prisma, undefined);
    assert.equal(database.scripts['db:generate'], 'prisma generate');
});

test('generation and migrate-once retain the existing prisma command interface', () => {
    assert.match(runner, /RUN cd packages\/database && prisma generate --schema \.\/prisma\/schema\.prisma/);
    assert.match(migrate, /prisma migrate deploy\s+--schema \.\/packages\/database\/prisma\/schema\.prisma\s+--config \.\/packages\/database\/prisma\.config\.js/);
    assert.match(runner, /COPY --from=builder \/app\/apps\/backend\/scripts\/migrate-once\.sh \.\/apps\/backend\/scripts\/migrate-once\.sh/);
});

test('backend retains its non-root runtime and existing startup command', () => {
    const users = [...runner.matchAll(/^USER\s+(\S+)/gm)].map(match => match[1]);
    assert.equal(users.at(-1), 'node');
    assert.match(runner, /CMD \["\.\/apps\/backend\/scripts\/deploy\.sh"\]/);
});
