const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
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
    'effect-dependency-compatibility',
    'email-minifier-boundary',
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
    assert.equal(reviewed.length, 31);
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
