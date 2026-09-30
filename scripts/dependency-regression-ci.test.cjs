const assert = require('node:assert/strict');
const { existsSync, readFileSync, readdirSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => readFileSync(path.join(root, file), 'utf8');
const scripts = JSON.parse(read('package.json')).scripts;
const reviewed = [
    'axios-dependency-security',
    'browser-target-dependency',
    'consolidated-dependency-behavior',
    'cookie-dependency-security',
    'css-dependency-security',
    'deepmerge-dependency-compatibility',
    'defu-dependency-compatibility',
    'dependency-regression-ci',
    'dompurify-dependency-security',
    'effect-dependency-compatibility',
    'email-minifier-boundary',
    'file-type-dependency-security',
    'form-data-dependency-security',
    'glob-dependency-compatibility',
    'grpc-dependency-security',
    'hono-dependency-security',
    'jaeger-dependency-security',
    'lodash-dependency-security',
    'mail-dependency-security',
    'mail-semver-compatibility',
    'minifier-dependency',
    'mysql2-dependency-security',
    'node-runtime-contract',
    'otel-resource-compatibility',
    'path-routing-dependency-security',
    'prisma-cli-packaging',
    'prometheus-dependency-security',
    'undici-dependency-security',
    'uri-dependency-security',
    'websocket-dependency-security',
    'xlsx-dependency-security',
    'xml-dependency-security',
    'yaml-dependency-security',
].map((name) => `scripts/${name}.test.cjs`);

test('dependency regression command explicitly runs the reviewed files exactly once', () => {
    assert.equal(reviewed.length, 33);
    assert.equal(new Set(reviewed).size, reviewed.length);
    for (const file of reviewed) assert.equal(existsSync(path.join(root, file)), true, file);
    // Exact command forbids glob expansion, shell chains, bypass flags and extra programs.
    assert.equal(scripts['test:security:dependencies'], `node --test --test-concurrency=1 ${reviewed.join(' ')}`);
    assert.equal(scripts['pretest:security:dependencies'], undefined);
    assert.equal(scripts['posttest:security:dependencies'], undefined);
});

test('CI runs dependency regressions as a blocking step after install and before Prisma', () => {
    const workflow = read('.github/workflows/ci.yml');
    const job = workflow.match(/^  typecheck-and-build:\n([\s\S]*?)(?=^  [\w-]+:|$(?![\s\S]))/m)?.[1];
    assert.ok(job, 'typecheck-and-build job must exist');
    assert.doesNotMatch(job, /^    (?:if|continue-on-error):/m);
    const steps = job.split(/^      - /m).slice(1);
    const matching = steps.filter((step) => step.includes('pnpm test:security:dependencies'));
    assert.equal(matching.length, 1, 'one dependency regression step is required');
    // Exact step permits no conditions, ignored failures, extra shell commands or side effects.
    assert.equal(matching[0].trimEnd(),
        'name: Dependency Regression Contracts (blocking)\n        timeout-minutes: 5\n        run: pnpm test:security:dependencies');
    const install = steps.findIndex((step) => /^run: pnpm install\s*$/.test(step));
    const regression = steps.indexOf(matching[0]);
    const generate = steps.findIndex((step) => step.startsWith('name: Prisma Generate\n'));
    const migration = steps.findIndex((step) => step.includes('pnpm exec prisma migrate deploy'));
    assert.ok(install >= 0 && install < regression, 'install must precede regressions');
    assert.ok(regression < generate, 'regressions must precede Prisma Generate');
    assert.ok(regression < migration, 'regressions must precede database migrations');
});

test('CI E2E uses isolated PostgreSQL and Redis with synthetic-only boot configuration', () => {
    const workflow = read('.github/workflows/ci.yml');
    const job = workflow.match(/^  e2e:\n([\s\S]*?)(?=^  [\w-]+:|$(?![\s\S]))/m)?.[1];
    assert.ok(job, 'e2e job must exist');
    assert.match(job, /^    services:\n/m);
    assert.match(job, /^      postgres:\n/m);
    assert.match(job, /image: pgvector\/pgvector:pg17/);
    assert.match(job, /POSTGRES_DB: aluplan_e2e/);
    assert.match(job, /pg_isready -U postgres -d aluplan_e2e/);
    assert.match(job, /^      redis:\n/m);
    assert.match(job, /image: redis:7-alpine/);
    assert.match(job, /redis-cli ping/);

    const env = job.match(/^    env:\n([\s\S]*?)(?=^    steps:)/m)?.[1];
    assert.ok(env, 'e2e job-level environment must exist');
    assert.match(env, /DATABASE_URL: postgresql:\/\/postgres:postgres@127\.0\.0\.1:5432\/aluplan_e2e/);
    assert.match(env, /REDIS_URL: redis:\/\/localhost:6379/);
    assert.match(env, /NEXT_INTERNAL_API_URL: http:\/\/localhost:4000\/api\/v1/);
    assert.doesNotMatch(job, /\$\{\{\s*secrets\./, 'E2E must not consume real service secrets');

    const secretStep = job.match(/- name: Generate disposable E2E secrets\n([\s\S]*?)(?=^      - )/m)?.[1];
    assert.ok(secretStep, 'ephemeral E2E secrets must be generated at runtime');
    assert.match(secretStep, /crypto\.randomBytes\(32\)/);
    for (const name of ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'AUTH_ACTION_JWT_SECRET', 'ENCRYPTION_KEY',
        'ADMIN_BYPASS_EMAILS', 'E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD', 'E2E_AGENT_EMAIL', 'E2E_AGENT_PASSWORD',
        'E2E_CUSTOMER_EMAIL', 'E2E_CUSTOMER_PASSWORD', 'E2E_CUSTOMER_PHONE']) {
        assert.match(secretStep, new RegExp(`${name}:`), `${name} must be generated for the isolated E2E job`);
    }
    for (const email of ['e2e-admin@aluplan.test', 'e2e-agent@aluplan.test', 'e2e-customer@aluplan.test']) {
        assert.ok(secretStep.includes(email), `only synthetic test identity ${email} is permitted`);
    }
});

test('E2E seed accepts only explicitly enabled loopback PostgreSQL databases named _e2e', () => {
    const { assertSafeE2eDatabaseUrl } = require('../apps/backend/seed-e2e-safety.cjs');
    const baseEnv = {
        E2E_SEED_ALLOWED: 'true',
        NODE_ENV: 'test',
        DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:5432/aluplan_e2e',
    };

    assert.equal(assertSafeE2eDatabaseUrl(baseEnv), baseEnv.DATABASE_URL);
    assert.equal(assertSafeE2eDatabaseUrl({
        ...baseEnv,
        DATABASE_URL: 'postgresql://postgres:postgres@[::1]:5432/aluplan_e2e',
    }), 'postgresql://postgres:postgres@[::1]:5432/aluplan_e2e');

    for (const unsafe of [
        { ...baseEnv, E2E_SEED_ALLOWED: undefined },
        { ...baseEnv, E2E_SEED_ALLOWED: 'false' },
        { ...baseEnv, NODE_ENV: 'production' },
        { ...baseEnv, DATABASE_URL: 'postgresql://postgres:postgres@db.internal:5432/aluplan_e2e' },
        { ...baseEnv, DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/aluplan_e2e' },
        { ...baseEnv, DATABASE_URL: 'postgresql://postgres:postgres@127.0.0.1:5432/production' },
        { ...baseEnv, DATABASE_URL: 'mysql://postgres:postgres@127.0.0.1:5432/aluplan_e2e' },
    ]) assert.throws(() => assertSafeE2eDatabaseUrl(unsafe));
});

test('CI E2E generates Prisma, migrates, and seeds synthetic users before Playwright', () => {
    const workflow = read('.github/workflows/ci.yml');
    const backendManifest = JSON.parse(read('apps/backend/package.json'));
    const job = workflow.match(/^  e2e:\n([\s\S]*?)(?=^  [\w-]+:|$(?![\s\S]))/m)?.[1];
    assert.ok(job, 'e2e job must exist');
    const steps = job.split(/^      - /m).slice(1);
    const commandIndex = (command) => steps.findIndex((step) => step.includes(command));
    const install = commandIndex('run: pnpm install');
    const generate = commandIndex('run: pnpm --filter @aluplan/database db:generate');
    const migrate = commandIndex('run: pnpm exec prisma migrate deploy --config packages/database/prisma.config.js');
    const seed = commandIndex('run: pnpm --filter @aluplan/backend exec tsx seed-e2e.ts');
    const secrets = commandIndex('name: Generate disposable E2E secrets');
    const browsers = commandIndex('pnpm --filter @aluplan/frontend exec playwright install --with-deps');
    const tests = commandIndex('pnpm --filter @aluplan/frontend test:e2e');
    assert.ok(install >= 0 && install < generate, 'install must precede Prisma generation');
    assert.ok(generate < migrate, 'Prisma generation must precede migration');
    assert.ok(secrets >= 0 && secrets < migrate, 'ephemeral secrets must exist before backend-related setup');
    assert.ok(migrate < seed, 'database migration must precede synthetic seeding');
    assert.ok(seed < browsers && browsers < tests, 'seed and browser install must precede E2E');
    assert.match(steps[seed], /E2E_SEED_ALLOWED: true/,
        'only the synthetic CI seed step may opt into database writes');
    assert.equal(backendManifest.devDependencies?.tsx, '^4.21.0',
        'the backend package must directly provide the TypeScript runner used by the seed step');
});

test('E2E specs use the shared synthetic users and seeded roles have explicit RBAC grants', () => {
    const e2eDirectory = path.join(root, 'apps/frontend/e2e');
    const specFiles = readdirSync(e2eDirectory).filter((file) => file.endsWith('.spec.ts'));
    const forbiddenCredentialValues = [
        'admin@example.com',
        'E2E-Only-Not-A-Secret-2026!',
        'e2e-customer@aluplan.com',
        'test_customer@aluplan.com',
        'Test1234!',
    ];

    assert.ok(specFiles.length > 0, 'Playwright specs must exist');
    for (const file of specFiles) {
        const source = read(`apps/frontend/e2e/${file}`);
        for (const credential of forbiddenCredentialValues) {
            assert.ok(!source.includes(credential), `${file} must not hardcode ${credential}`);
        }
    }

    const seed = read('apps/backend/seed-e2e.ts');
    assert.match(seed, /assertSafeE2eDatabaseUrl\(process\.env\)/,
        'the seed script must use the tested safety gate before opening a database connection');
    assert.match(seed, /roleName:\s*'SUPPORT_AGENT'/,
        'the synthetic support user must use the migration-provisioned least-privilege role');
    assert.match(seed, /rolePermission\.upsert/,
        'the synthetic administrator must receive an explicit permission grant');
    assert.match(seed, /ensurePermissionGrant\('ADMIN', '\*'\)/,
        'only the disposable E2E admin receives the explicit test-only wildcard grant');
    assert.match(seed, /ticket:read/,
        'the synthetic support user must verify migration-provisioned ticket permissions');
    assert.match(seed, /customerProfile\.upsert/,
        'the synthetic customer needs its profile row for customer-list and WhatsApp E2E paths');
    assert.match(seed, /E2E_CUSTOMER_PHONE/,
        'the WhatsApp fixture phone must come from the same isolated test configuration');
    assert.match(read('apps/frontend/e2e/omnichannel.spec.ts'), /TEST_USERS\.customer\.phone/,
        'the WhatsApp test must use the shared synthetic customer phone');
});

test('patched security dependencies are pinned and the SheetJS tarball integrity remains enforced', () => {
    const rootManifest = JSON.parse(read('package.json'));
    const backendManifest = JSON.parse(read('apps/backend/package.json'));
    const frontendManifest = JSON.parse(read('apps/frontend/package.json'));
    const lock = read('pnpm-lock.yaml');

    assert.equal(rootManifest.pnpm.overrides['picomatch@>=4.0.0 <4.0.4'], '4.0.7');
    assert.equal(rootManifest.pnpm.overrides['brace-expansion@>=2.0.0 <2.1.6'], '2.1.6');
    assert.equal(rootManifest.pnpm.overrides['brace-expansion@>=5.0.0 <5.0.11'], '5.0.11');
    assert.equal(rootManifest.pnpm.overrides['linkify-it@>=5.0.0 <5.0.2'], '5.0.2');
    assert.equal(rootManifest.pnpm.overrides['@opentelemetry/sdk-node@0.217.0>@opentelemetry/propagator-jaeger'], '2.9.0');
    assert.equal(rootManifest.pnpm.overrides['protobufjs@>=8.0.0 <8.4.1'], '8.4.1');
    for (const [name, version] of Object.entries({
        '@opentelemetry/auto-instrumentations-node': '^0.75.0',
        '@opentelemetry/sdk-node': '^0.217.0',
        '@opentelemetry/exporter-trace-otlp-http': '^0.217.0',
    })) assert.equal(backendManifest.dependencies[name], version, `${name} must be on the patched compatible line`);
    for (const name of ['@tiptap/extension-link', '@tiptap/extension-placeholder', '@tiptap/react', '@tiptap/starter-kit']) {
        assert.equal(frontendManifest.dependencies[name], '^3.30.5', `${name} must remain on the aligned patched editor line`);
    }

    const sheetJs = lock.match(/^  xlsx@https:\/\/cdn\.sheetjs\.com\/[^\n]+\n(?:    .*\n)+/m)?.[0];
    assert.ok(sheetJs, 'the pinned SheetJS tarball must remain in the lockfile');
    assert.match(sheetJs, /resolution: \{integrity: sha512-[^,}]+, tarball:/,
        'the SheetJS integrity hash must not be removed while updating the lockfile');
});
