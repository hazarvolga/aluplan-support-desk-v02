import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { stat } from 'node:fs/promises';
import test from 'node:test';

const deployScript = await readFile(
    new URL('../apps/backend/scripts/deploy.sh', import.meta.url),
    'utf8',
);
const backendDockerfile = await readFile(
    new URL('../apps/backend/Dockerfile', import.meta.url),
    'utf8',
);
const backendPackage = JSON.parse(
    await readFile(
        new URL('../apps/backend/package.json', import.meta.url),
        'utf8',
    ),
);
const rootPackage = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
);
const productionSync = await readFile(
    new URL(
        '../packages/database/scripts/production-sync.js',
        import.meta.url,
    ),
    'utf8',
);
const databaseSeed = await readFile(
    new URL('../packages/database/prisma/seed.ts', import.meta.url),
    'utf8',
);
const rbacSeed = await readFile(
    new URL('../packages/database/prisma/seed-rbac.ts', import.meta.url),
    'utf8',
);
const createAdmin = await readFile(
    new URL('../apps/backend/create-admin.js', import.meta.url),
    'utf8',
);
const dockerIgnore = await readFile(
    new URL('../.dockerignore', import.meta.url),
    'utf8',
);
const deployScriptStat = await stat(
    new URL('../apps/backend/scripts/deploy.sh', import.meta.url),
);

test('normal production boot does not run recovery, seed, or role-repair scripts', () => {
    assert.doesNotMatch(
        deployScript,
        /production-sync\.js|grant-admin\.js|fix-customer-roles\.js/,
    );
    assert.doesNotMatch(
        backendDockerfile,
        /COPY .*grant-admin\.js|COPY .*fix-customer-roles\.js/,
    );
    assert.equal(backendPackage.scripts['prestart:prod'], undefined);
    assert.equal(
        backendPackage.scripts['start:prod'],
        'cd ../.. && ./apps/backend/scripts/deploy.sh',
    );
    assert.match(
        backendDockerfile,
        /CMD \["\.\/apps\/backend\/scripts\/deploy\.sh"\]/,
    );
    assert.match(backendDockerfile, /pnpm install --prod --frozen-lockfile/);
    assert.doesNotMatch(
        backendDockerfile,
        /--frozen-lockfile\s*\|\|\s*pnpm install --prod/,
    );
    assert.match(
        deployScript,
        /if ! DATABASE_URL="\$MIGRATION_DATABASE_URL" prisma migrate deploy[\s\S]*?exit 1[\s\S]*?fi/,
    );
    assert.match(
        deployScript,
        /verify-migration-integrity\.mjs --files-only[\s\S]*?prisma migrate deploy[\s\S]*?verify-migration-integrity\.mjs[\s\S]*?Starting application/,
    );
    assert.doesNotMatch(
        deployScript,
        /_prisma_migrations|manual-psql-fix|CREATE TABLE|ALTER TABLE|UPDATE /,
    );

    const syntaxCheck = spawnSync('sh', ['-n', 'apps/backend/scripts/deploy.sh'], {
        cwd: new URL('..', import.meta.url),
        encoding: 'utf8',
    });
    assert.equal(syntaxCheck.status, 0, syntaxCheck.stderr);
    assert.equal(typeof rootPackage.dependencies.pg, 'string');
    assert.equal(rootPackage.devDependencies.pg, undefined);
    assert.notEqual(
        deployScriptStat.mode & 0o111,
        0,
        'canonical deploy script must remain executable outside Docker',
    );
});

test('manual production synchronization is explicit, fail-closed, and credential-safe', () => {
    assert.match(productionSync, /ALLOW_PRODUCTION_DATA_SYNC/);
    assert.match(productionSync, /ALLOW_ADMIN_BOOTSTRAP/);
    assert.match(productionSync, /ALLOW_ADMIN_PROMOTION/);
    assert.match(productionSync, /ADMIN_BOOTSTRAP_PASSWORD/);
    assert.doesNotMatch(
        productionSync,
        /bcrypt\.hash\(\s*['"][^'"]+['"]\s*,/,
    );
    assert.doesNotMatch(productionSync, /Running User Recovery/);
    assert.doesNotMatch(productionSync, /prisma\.user\.updateMany/);
    assert.doesNotMatch(productionSync, /deletedAt\s*:\s*null/);
    assert.doesNotMatch(productionSync, /Test Customer Account/);
    assert.doesNotMatch(productionSync, /droneracingturkey@gmail\.com/);
    assert.match(productionSync, /prisma\.\$transaction/);
    assert.match(productionSync, /require\.main === module/);
    assert.match(productionSync, /throw error;/);
});

function runProductionSync(envOverrides) {
    const scriptPath = new URL(
        '../packages/database/scripts/production-sync.js',
        import.meta.url,
    );
    const env = { ...process.env };
    delete env.ALLOW_PRODUCTION_DATA_SYNC;
    delete env.DATABASE_URL;
    delete env.ADMIN_EMAIL;

    return spawnSync(process.execPath, [scriptPath.pathname], {
        cwd: new URL('..', import.meta.url),
        encoding: 'utf8',
        env: { ...env, ...envOverrides },
        timeout: 5_000,
    });
}

test('manual production synchronization exits before database access without opt-in', () => {
    const result = runProductionSync({
        DATABASE_URL: 'postgresql://invalid:invalid@127.0.0.1:1/invalid',
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Production data synchronization is disabled/);
    assert.doesNotMatch(result.stderr, /ECONNREFUSED/);
});

test('manual production synchronization fails before database access without DATABASE_URL', () => {
    const result = runProductionSync({
        ALLOW_PRODUCTION_DATA_SYNC: 'true',
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /DATABASE_URL is required/);
});

test('manual production synchronization fails before database access without ADMIN_EMAIL', () => {
    const result = runProductionSync({
        ALLOW_PRODUCTION_DATA_SYNC: 'true',
        DATABASE_URL: 'postgresql://invalid:invalid@127.0.0.1:1/invalid',
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /ADMIN_EMAIL is required/);
    assert.doesNotMatch(result.stderr, /ECONNREFUSED/);
});

test('manual production synchronization fails before database access without admin bootstrap opt-in', () => {
    const result = runProductionSync({
        ALLOW_PRODUCTION_DATA_SYNC: 'true',
        DATABASE_URL: 'postgresql://invalid:invalid@127.0.0.1:1/invalid',
        ADMIN_EMAIL: 'bootstrap@example.invalid',
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /Admin bootstrap is disabled/);
    assert.doesNotMatch(result.stderr, /ECONNREFUSED/);
});

test('importing production synchronization never opens a database connection', () => {
    const scriptPath = new URL(
        '../packages/database/scripts/production-sync.js',
        import.meta.url,
    );
    const result = spawnSync(
        process.execPath,
        ['-e', `require(${JSON.stringify(scriptPath.pathname)})`],
        {
            cwd: new URL('..', import.meta.url),
            encoding: 'utf8',
            env: {
                ...process.env,
                ALLOW_PRODUCTION_DATA_SYNC: 'true',
                ALLOW_ADMIN_BOOTSTRAP: 'true',
                DATABASE_URL:
                    'postgresql://invalid:invalid@127.0.0.1:1/invalid',
                ADMIN_EMAIL: 'bootstrap@example.invalid',
                ADMIN_BOOTSTRAP_PASSWORD: 'Synthetic-Test-Password-Only!',
            },
            timeout: 5_000,
        },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.doesNotMatch(result.stderr, /ECONNREFUSED/);
});

test('seed and legacy admin helper cannot silently reset production credentials', () => {
    assert.match(databaseSeed, /ALLOW_DATABASE_SEED/);
    assert.match(databaseSeed, /E2E data must never be seeded in production/);
    assert.match(databaseSeed, /ALLOW_ADMIN_BOOTSTRAP/);
    assert.match(databaseSeed, /ALLOW_E2E_SEED/);
    assert.match(databaseSeed, /Existing admin user preserved/);
    assert.doesNotMatch(
        databaseSeed,
        /admin = await prisma\.user\.update/,
    );
    assert.match(createAdmin, /legacy admin bootstrap script is disabled/);
    assert.doesNotMatch(createAdmin, /new Client|client\.connect|INSERT INTO/);

    const firstPrismaCall = databaseSeed.indexOf('await prisma.');
    assert.ok(firstPrismaCall > 0);
    for (const policyMarker of [
        'ALLOW_DATABASE_SEED',
        'E2E data must never be seeded in production',
        'ADMIN_EMAIL is required for database seeding',
    ]) {
        assert.ok(
            databaseSeed.indexOf(policyMarker) < firstPrismaCall,
            `${policyMarker} must be checked before the first Prisma call`,
        );
    }

    const firstRbacPrismaCall = rbacSeed.indexOf('await prisma.');
    assert.ok(firstRbacPrismaCall > 0);
    assert.ok(
        rbacSeed.indexOf('ALLOW_DATABASE_SEED') < firstRbacPrismaCall,
        'RBAC seed opt-in must be checked before the first Prisma call',
    );
});

test('sensitive maintenance and local data files stay out of Docker build context', () => {
    assert.match(
        dockerIgnore,
        /^packages\/database\/scripts\/production-sync\.js$/m,
    );
    assert.match(dockerIgnore, /^extracted_users\.json$/m);
});
