import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
    buildMigrationPlan,
    classifyMigrationEffect,
    readLedgerWithClient,
} from './resolve-production-migration-plan.mjs';

const manifest = new Map([
    ['20260806010000_first', 'checksum-first'],
    ['20260806020000_second', 'checksum-second'],
]);

const files = new Map(manifest);
const historicalMigrationName = '20260426202926_add_proactive_chat';
const historicalManifest = new Map([
    [historicalMigrationName, 'historical-canonical-checksum'],
]);
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');

function successfulRow(
    migrationName,
    checksum,
    overrides = {},
) {
    return {
        migration_name: migrationName,
        checksum,
        finished_at: '2026-08-08T12:00:00.000Z',
        rolled_back_at: null,
        ...overrides,
    };
}

test('derives pending migrations from canonical files minus successful ledger rows', () => {
    const plan = buildMigrationPlan({
        manifest,
        fileChecksums: files,
        ledgerRows: [
            successfulRow('20260806010000_first', 'checksum-first'),
        ],
        migrationEffects: new Map([
            ['20260806010000_first', 'DDL'],
            ['20260806020000_second', 'DML+DDL'],
        ]),
    });

    assert.deepEqual(
        plan.applied.map((entry) => entry.name),
        ['20260806010000_first'],
    );
    assert.deepEqual(plan.pending, [
        {
            name: '20260806020000_second',
            checksum: 'checksum-second',
            effect: 'DML+DDL',
        },
    ]);
    assert.deepEqual(plan.rolledBack, []);
});

test('refuses to plan when canonical manifest and migration files differ', () => {
    const changedFiles = new Map(files);
    changedFiles.set('20260806020000_second', 'changed-checksum');

    assert.throws(
        () =>
            buildMigrationPlan({
                manifest,
                fileChecksums: changedFiles,
                ledgerRows: [],
                migrationEffects: new Map(),
            }),
        /Canonical migration checksum mismatch.*20260806020000_second/,
    );
});

test('refuses unknown ledger migrations', () => {
    assert.throws(
        () =>
            buildMigrationPlan({
                manifest,
                fileChecksums: files,
                ledgerRows: [
                    successfulRow('20260806030000_unknown', 'checksum-unknown'),
                ],
                migrationEffects: new Map(),
            }),
        /Ledger migration has no canonical file.*20260806030000_unknown/,
    );
});

test('refuses a successful ledger checksum that differs from canonical source', () => {
    assert.throws(
        () =>
            buildMigrationPlan({
                manifest,
                fileChecksums: files,
                ledgerRows: [
                    successfulRow(
                        '20260806010000_first',
                        'unexpected-checksum',
                    ),
                ],
                migrationEffects: new Map(),
            }),
        /Successful ledger checksum mismatch.*20260806010000_first/,
    );
});

test('refuses unfinished and non-rolled-back migration attempts', () => {
    assert.throws(
        () =>
            buildMigrationPlan({
                manifest,
                fileChecksums: files,
                ledgerRows: [
                    successfulRow('20260806010000_first', 'checksum-first', {
                        finished_at: null,
                    }),
                ],
                migrationEffects: new Map(),
            }),
        /Unresolved migration attempt.*20260806010000_first/,
    );
});

test('refuses contradictory finished and rolled-back lifecycle state', () => {
    assert.throws(
        () =>
            buildMigrationPlan({
                manifest,
                fileChecksums: files,
                ledgerRows: [
                    successfulRow('20260806010000_first', 'checksum-first', {
                        rolled_back_at: '2026-08-08T12:01:00.000Z',
                    }),
                ],
                migrationEffects: new Map(),
            }),
        /Contradictory migration lifecycle.*20260806010000_first/,
    );
});

test('refuses ledger rows with missing lifecycle fields', () => {
    assert.throws(
        () =>
            buildMigrationPlan({
                manifest,
                fileChecksums: files,
                ledgerRows: [
                    {
                        migration_name: '20260806010000_first',
                        checksum: 'checksum-first',
                    },
                ],
                migrationEffects: new Map(),
            }),
        /Invalid migration ledger row.*20260806010000_first/,
    );
});

test('refuses duplicate successful ledger rows for one migration', () => {
    assert.throws(
        () =>
            buildMigrationPlan({
                manifest,
                fileChecksums: files,
                ledgerRows: [
                    successfulRow(
                        '20260806010000_first',
                        'checksum-first',
                    ),
                    successfulRow(
                        '20260806010000_first',
                        'checksum-first',
                    ),
                ],
                migrationEffects: new Map(),
            }),
        /Duplicate successful migration ledger rows.*20260806010000_first/,
    );
});

test('keeps explicitly rolled-back migrations pending and reports the attempt', () => {
    const plan = buildMigrationPlan({
        manifest,
        fileChecksums: files,
        ledgerRows: [
            successfulRow('20260806010000_first', 'checksum-first', {
                finished_at: null,
                rolled_back_at: '2026-08-08T12:01:00.000Z',
            }),
        ],
        migrationEffects: new Map(),
    });

    assert.deepEqual(
        plan.pending.map((entry) => entry.name),
        ['20260806010000_first', '20260806020000_second'],
    );
    assert.deepEqual(plan.rolledBack, ['20260806010000_first']);
});

test('historical ledger markers are rejected without an explicit acknowledgement', () => {
    assert.throws(
        () =>
            buildMigrationPlan({
                manifest: historicalManifest,
                fileChecksums: new Map(historicalManifest),
                ledgerRows: [
                    successfulRow(
                        historicalMigrationName,
                        'manual-psql-fix',
                    ),
                ],
                migrationEffects: new Map(),
            }),
        /Successful ledger checksum mismatch.*20260426202926_add_proactive_chat/,
    );
});

test('explicit marker acknowledgement stays visible in the applied plan', () => {
    const plan = buildMigrationPlan({
        manifest: historicalManifest,
        fileChecksums: new Map(historicalManifest),
        ledgerRows: [
            successfulRow(historicalMigrationName, 'manual-psql-fix'),
        ],
        migrationEffects: new Map(),
        acceptedMarkers: new Map([
            [historicalMigrationName, new Set(['manual-psql-fix'])],
        ]),
    });

    assert.deepEqual(plan.applied[0], {
        name: historicalMigrationName,
        checksum: 'historical-canonical-checksum',
        ledgerChecksum: 'manual-psql-fix',
        matchMode: 'accepted-marker',
        effect: 'UNKNOWN',
    });
});

test('marker acknowledgement is scoped to one named migration', () => {
    assert.throws(
        () =>
            buildMigrationPlan({
                manifest,
                fileChecksums: files,
                ledgerRows: [
                    successfulRow(
                        '20260806020000_second',
                        'manual-psql-fix',
                    ),
                ],
                migrationEffects: new Map(),
                acceptedMarkers: new Map([
                    [
                        historicalMigrationName,
                        new Set(['manual-psql-fix']),
                    ],
                ]),
            }),
        /Successful ledger checksum mismatch.*20260806020000_second/,
    );
});

test('marker acknowledgement cannot bless a rolled-back attempt', () => {
    assert.throws(
        () =>
            buildMigrationPlan({
                manifest: historicalManifest,
                fileChecksums: new Map(historicalManifest),
                ledgerRows: [
                    successfulRow(
                        historicalMigrationName,
                        'manual-psql-fix',
                        {
                            finished_at: null,
                            rolled_back_at: '2026-08-08T12:01:00.000Z',
                        },
                    ),
                ],
                migrationEffects: new Map(),
                acceptedMarkers: new Map([
                    [
                        historicalMigrationName,
                        new Set(['manual-psql-fix']),
                    ],
                ]),
            }),
        /Rolled-back ledger checksum mismatch.*20260426202926_add_proactive_chat/,
    );
});

test('database ledger reader enforces one read-only transaction and rollback', async () => {
    const queries = [];
    const client = {
        async query(sql) {
            queries.push(sql.replace(/\s+/g, ' ').trim());
            if (/^SELECT migration_name/.test(queries.at(-1))) {
                return { rows: [successfulRow('first', 'checksum')] };
            }
            return { rows: [] };
        },
    };

    const rows = await readLedgerWithClient(client);

    assert.equal(rows.length, 1);
    assert.deepEqual(queries, [
        'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY',
        "SET LOCAL statement_timeout = '10s'",
        'SELECT migration_name, checksum, finished_at, rolled_back_at FROM _prisma_migrations ORDER BY started_at, migration_name',
        'ROLLBACK',
    ]);
});

test('database ledger reader rolls back when the ledger SELECT fails', async () => {
    const queries = [];
    const client = {
        async query(sql) {
            const normalized = sql.replace(/\s+/g, ' ').trim();
            queries.push(normalized);
            if (/^SELECT migration_name/.test(normalized)) {
                throw new Error('synthetic select failure');
            }
            return { rows: [] };
        },
    };

    await assert.rejects(
        () => readLedgerWithClient(client),
        /synthetic select failure/,
    );
    assert.equal(queries.at(-1), 'ROLLBACK');
});

test('classifies data and schema effects without claiming SQL safety', () => {
    assert.equal(
        classifyMigrationEffect('BEGIN; CREATE TABLE example(id int); COMMIT;'),
        'DDL',
    );
    assert.equal(
        classifyMigrationEffect(
            'BEGIN; INSERT INTO example(id) VALUES (1); COMMIT;',
        ),
        'DML',
    );
    assert.equal(
        classifyMigrationEffect(
            'BEGIN; ALTER TABLE example ADD COLUMN name text; UPDATE example SET name = \'x\'; COMMIT;',
        ),
        'DML+DDL',
    );
});

test('database mode fails before connection without explicit read-only opt-in', () => {
    const scriptPath = new URL(
        './resolve-production-migration-plan.mjs',
        import.meta.url,
    );
    const env = { ...process.env };
    delete env.ALLOW_PRODUCTION_LEDGER_READ;
    env.DATABASE_URL =
        'postgresql://synthetic-user:synthetic-password@127.0.0.1:1/synthetic-db';

    const result = spawnSync(process.execPath, [scriptPath.pathname], {
        encoding: 'utf8',
        env,
        timeout: 5_000,
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /ALLOW_PRODUCTION_LEDGER_READ=1 is required/);
    assert.doesNotMatch(result.stderr, /synthetic-user|synthetic-password/);
    assert.doesNotMatch(result.stderr, /ECONNREFUSED/);
});

test('offline mode writes a private plan without leaking connection details', async () => {
    const temporaryDirectory = await mkdtemp(
        path.join(tmpdir(), 'aluplan-ledger-plan-'),
    );
    const ledgerPath = path.join(temporaryDirectory, 'ledger.json');
    const outputPath = path.join(
        projectDirectory,
        `.private-data/release-tests/plan-${process.pid}-${Date.now()}.json`,
    );
    const scriptPath = new URL(
        './resolve-production-migration-plan.mjs',
        import.meta.url,
    );
    const syntheticUrl =
        'postgresql://synthetic-user:synthetic-password@127.0.0.1:1/synthetic-db';

    try {
        await writeFile(ledgerPath, '[]\n', { mode: 0o600 });
        const result = spawnSync(
            process.execPath,
            [
                scriptPath.pathname,
                '--ledger-file',
                ledgerPath,
                '--output',
                outputPath,
            ],
            {
                encoding: 'utf8',
                env: { ...process.env, DATABASE_URL: syntheticUrl },
                timeout: 10_000,
            },
        );

        assert.equal(result.status, 0, result.stderr);
        assert.doesNotMatch(
            `${result.stdout}${result.stderr}`,
            /synthetic-user|synthetic-password/,
        );

        const artifact = JSON.parse(await readFile(outputPath, 'utf8'));
        assert.equal(artifact.source, 'offline-ledger-file');
        const canonicalManifest = JSON.parse(
            await readFile(
                path.join(
                    projectDirectory,
                    'packages/database/prisma/migration-checksums.json',
                ),
                'utf8',
            ),
        );
        assert.equal(
            artifact.canonicalCount,
            Object.keys(canonicalManifest).length,
        );
        assert.equal(artifact.applied.length, 0);
        assert.equal(artifact.pending.length, artifact.canonicalCount);
        assert.equal((await stat(outputPath)).mode & 0o777, 0o600);
        assert.match(artifact.provenance.ledgerInputSha256, /^[a-f0-9]{64}$/);
        assert.match(artifact.provenance.ledgerDigest, /^[a-f0-9]{64}$/);
        assert.ok(Date.parse(artifact.provenance.capturedAt));
        assert.equal(artifact.provenance.targetFingerprint, null);
        assert.doesNotMatch(JSON.stringify(artifact), /DATABASE_URL|postgresql:/);
    } finally {
        await rm(temporaryDirectory, { recursive: true, force: true });
        await rm(outputPath, { force: true });
    }
});

test('production runbook keeps migration planning ledger-driven and fail-closed', async () => {
    const runbook = await readFile(
        path.join(projectDirectory, 'FAZ-8-PRODUCTION-MIGRATION-RUNBOOK.md'),
        'utf8',
    );

    assert.match(runbook, /pending migration listesi değildir/i);
    assert.match(runbook, /_prisma_migrations/);
    assert.match(runbook, /resolve-production-migration-plan\.mjs/);
    assert.match(runbook, /ALLOW_PRODUCTION_LEDGER_READ=1/);
    assert.match(runbook, /DML\+DDL/);
    assert.match(runbook, /S3-compatible object storage/i);
    assert.match(runbook, /versioning|immutable backup/i);
    assert.match(runbook, /accepted-marker/);
    assert.doesNotMatch(runbook, /yalnız 3 migration/i);
    assert.doesNotMatch(runbook, /migrationlar DML içermez/i);
});
