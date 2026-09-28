import { createHash } from 'node:crypto';
import {
    mkdir,
    readFile,
    readdir,
    rename,
    unlink,
    writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, '..');
const migrationsDirectory = path.join(
    projectDirectory,
    'packages/database/prisma/migrations',
);
const checksumManifestPath = path.join(
    projectDirectory,
    'packages/database/prisma/migration-checksums.json',
);
const defaultOutputPath = path.join(
    projectDirectory,
    '.private-data/release/production-migration-plan.json',
);

const knownHistoricalLedgerMarkers = new Map([
    ['20260426202926_add_proactive_chat', new Set(['manual-psql-fix'])],
]);

function sha256(content) {
    return createHash('sha256').update(content).digest('hex');
}

function getArgumentValue(name) {
    const index = process.argv.indexOf(name);
    if (index === -1) return undefined;
    const value = process.argv[index + 1];
    if (!value || value.startsWith('--')) {
        throw new Error(`${name} requires a value`);
    }
    return value;
}

function getArgumentValues(name) {
    const values = [];
    for (let index = 0; index < process.argv.length; index += 1) {
        if (process.argv[index] !== name) continue;
        const value = process.argv[index + 1];
        if (!value || value.startsWith('--')) {
            throw new Error(`${name} requires a value`);
        }
        values.push(value);
    }
    return values;
}

function parseMarkerAcknowledgements() {
    const acceptedMarkers = new Map();
    for (const acknowledgement of getArgumentValues('--acknowledge-marker')) {
        const separatorIndex = acknowledgement.indexOf('=');
        const migrationName = acknowledgement.slice(0, separatorIndex);
        const marker = acknowledgement.slice(separatorIndex + 1);
        if (
            separatorIndex <= 0 ||
            !marker ||
            !knownHistoricalLedgerMarkers.get(migrationName)?.has(marker)
        ) {
            throw new Error(
                `Unknown historical ledger marker acknowledgement: ${acknowledgement}`,
            );
        }
        const markers = acceptedMarkers.get(migrationName) ?? new Set();
        markers.add(marker);
        acceptedMarkers.set(migrationName, markers);
    }
    return acceptedMarkers;
}

function assertOutputPathAllowed(outputPath) {
    const resolvedOutputPath = path.resolve(projectDirectory, outputPath);
    const allowedDirectory = path.join(projectDirectory, '.private-data');
    if (
        resolvedOutputPath !== allowedDirectory &&
        !resolvedOutputPath.startsWith(`${allowedDirectory}${path.sep}`)
    ) {
        throw new Error(
            'Migration plans must be written under the git-ignored .private-data directory',
        );
    }
    return resolvedOutputPath;
}

async function loadCanonicalMigrations() {
    const manifestObject = JSON.parse(
        await readFile(checksumManifestPath, 'utf8'),
    );
    const manifest = new Map(Object.entries(manifestObject));
    const directoryEntries = await readdir(migrationsDirectory, {
        withFileTypes: true,
    });
    const migrationNames = directoryEntries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();

    const migrationFiles = await Promise.all(
        migrationNames.map(async (migrationName) => {
            const sql = await readFile(
                path.join(migrationsDirectory, migrationName, 'migration.sql'),
                'utf8',
            );
            return {
                name: migrationName,
                checksum: sha256(sql),
                effect: classifyMigrationEffect(sql),
            };
        }),
    );

    return {
        manifest,
        fileChecksums: new Map(
            migrationFiles.map(({ name, checksum }) => [name, checksum]),
        ),
        migrationEffects: new Map(
            migrationFiles.map(({ name, effect }) => [name, effect]),
        ),
    };
}

export function classifyMigrationEffect(sql) {
    const withoutComments = sql
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/--[^\n]*/g, ' ');
    const hasDml =
        /\b(?:INSERT\s+INTO|UPDATE\s+[^;]+?\s+SET|DELETE\s+FROM|TRUNCATE\b|MERGE\s+INTO|COPY\s+[^;]+?\s+FROM)\b/i.test(
            withoutComments,
        );
    const hasDdl =
        /\b(?:CREATE|ALTER|DROP|RENAME|COMMENT\s+ON|GRANT|REVOKE)\b/i.test(
            withoutComments,
        );

    if (hasDml && hasDdl) return 'DML+DDL';
    if (hasDml) return 'DML';
    if (hasDdl) return 'DDL';
    return 'CONTROL_ONLY';
}

function assertCanonicalParity(manifest, fileChecksums) {
    if (manifest.size !== fileChecksums.size) {
        throw new Error(
            `Migration manifest count mismatch: files=${fileChecksums.size}, manifest=${manifest.size}`,
        );
    }

    for (const [migrationName, expectedChecksum] of manifest) {
        const actualChecksum = fileChecksums.get(migrationName);
        if (actualChecksum !== expectedChecksum) {
            throw new Error(
                `Canonical migration checksum mismatch: ${migrationName}`,
            );
        }
    }
}

function isNullableTimestamp(value) {
    if (value === null) return true;
    if (value instanceof Date) return !Number.isNaN(value.getTime());
    return (
        typeof value === 'string' &&
        value.trim().length > 0 &&
        !Number.isNaN(Date.parse(value))
    );
}

function assertValidLedgerRow(row) {
    const migrationName = row?.migration_name ?? '<unknown>';
    const hasLifecycleFields =
        Object.hasOwn(row ?? {}, 'finished_at') &&
        Object.hasOwn(row ?? {}, 'rolled_back_at');
    if (
        !row ||
        typeof row !== 'object' ||
        typeof row.migration_name !== 'string' ||
        row.migration_name.trim().length === 0 ||
        typeof row.checksum !== 'string' ||
        row.checksum.trim().length === 0 ||
        !hasLifecycleFields ||
        !isNullableTimestamp(row.finished_at) ||
        !isNullableTimestamp(row.rolled_back_at)
    ) {
        throw new Error(`Invalid migration ledger row: ${migrationName}`);
    }
}

export function buildMigrationPlan({
    manifest,
    fileChecksums,
    ledgerRows,
    migrationEffects,
    acceptedMarkers = new Map(),
}) {
    assertCanonicalParity(manifest, fileChecksums);

    const successfulRows = new Map();
    const rolledBackNames = new Set();

    for (const row of ledgerRows) {
        assertValidLedgerRow(row);
        const migrationName = row.migration_name;
        const expectedChecksum = manifest.get(migrationName);
        if (!expectedChecksum) {
            throw new Error(
                `Ledger migration has no canonical file: ${migrationName}`,
            );
        }

        const isRolledBack = row.rolled_back_at !== null;
        const isSuccessful =
            row.finished_at !== null && row.rolled_back_at === null;

        if (row.finished_at !== null && row.rolled_back_at !== null) {
            throw new Error(
                `Contradictory migration lifecycle: ${migrationName}`,
            );
        }

        if (!isRolledBack && !isSuccessful) {
            throw new Error(
                `Unresolved migration attempt: ${migrationName}`,
            );
        }

        const checksumMatchesCanonical = row.checksum === expectedChecksum;
        const acceptedMarker =
            isSuccessful &&
            (knownHistoricalLedgerMarkers.get(migrationName) ?? new Set()).has(
                row.checksum,
            ) &&
            (acceptedMarkers.get(migrationName) ?? new Set()).has(row.checksum);
        if (!checksumMatchesCanonical && !acceptedMarker) {
            const stateLabel = isSuccessful ? 'Successful' : 'Rolled-back';
            throw new Error(
                `${stateLabel} ledger checksum mismatch: ${migrationName}`,
            );
        }

        if (isSuccessful && successfulRows.has(migrationName)) {
            throw new Error(
                `Duplicate successful migration ledger rows: ${migrationName}`,
            );
        }
        if (isSuccessful) {
            successfulRows.set(migrationName, {
                ledgerChecksum: row.checksum,
                matchMode: acceptedMarker
                    ? 'accepted-marker'
                    : 'canonical-checksum',
            });
        }
        if (isRolledBack) rolledBackNames.add(migrationName);
    }

    const canonicalNames = [...manifest.keys()].sort();
    const toPendingEntry = (migrationName) => ({
        name: migrationName,
        checksum: manifest.get(migrationName),
        effect: migrationEffects.get(migrationName) ?? 'UNKNOWN',
    });
    const toAppliedEntry = (migrationName) => ({
        name: migrationName,
        checksum: manifest.get(migrationName),
        ...successfulRows.get(migrationName),
        effect: migrationEffects.get(migrationName) ?? 'UNKNOWN',
    });

    return {
        canonicalCount: canonicalNames.length,
        applied: canonicalNames
            .filter((migrationName) => successfulRows.has(migrationName))
            .map(toAppliedEntry),
        pending: canonicalNames
            .filter((migrationName) => !successfulRows.has(migrationName))
            .map(toPendingEntry),
        rolledBack: [...rolledBackNames].sort(),
    };
}

async function readLedgerFromFile(ledgerPath) {
    const resolvedPath = path.resolve(projectDirectory, ledgerPath);
    const content = await readFile(resolvedPath, 'utf8');
    const parsed = JSON.parse(content);
    const rows = Array.isArray(parsed) ? parsed : parsed.rows;
    if (!Array.isArray(rows)) {
        throw new Error('Ledger file must contain an array or a rows array');
    }
    return {
        rows,
        provenance: {
            ledgerInputSha256: sha256(content),
            targetFingerprint: null,
        },
    };
}

export async function readLedgerWithClient(client) {
    let transactionStarted = false;
    try {
        await client.query(
            'BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY',
        );
        transactionStarted = true;
        await client.query("SET LOCAL statement_timeout = '10s'");
        const result = await client.query(
            `SELECT migration_name, checksum, finished_at, rolled_back_at
             FROM _prisma_migrations
             ORDER BY started_at, migration_name`,
        );
        return result.rows;
    } finally {
        if (transactionStarted) await client.query('ROLLBACK');
    }
}

function targetFingerprint(connectionString) {
    let target;
    try {
        const parsed = new URL(connectionString);
        if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
            throw new Error('unsupported protocol');
        }
        target = `${parsed.protocol}//${parsed.hostname}:${parsed.port || '5432'}${parsed.pathname}`;
    } catch {
        throw new Error('DATABASE_URL is not a valid PostgreSQL connection URL');
    }
    return sha256(target);
}

async function readLedgerFromDatabase() {
    if (process.env.ALLOW_PRODUCTION_LEDGER_READ !== '1') {
        throw new Error(
            'ALLOW_PRODUCTION_LEDGER_READ=1 is required before database ledger access',
        );
    }
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required for database ledger access');
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 10_000,
        application_name: 'aluplan-production-ledger-read',
    });

    try {
        await client.connect();
        const rows = await readLedgerWithClient(client);
        return {
            rows,
            provenance: {
                ledgerInputSha256: null,
                targetFingerprint: targetFingerprint(
                    process.env.DATABASE_URL,
                ),
            },
        };
    } catch {
        throw new Error(
            'Production ledger read failed; connection details intentionally withheld',
        );
    } finally {
        await client.end().catch(() => undefined);
    }
}

function ledgerDigest(rows) {
    const normalizedRows = rows.map((row) => ({
        migration_name: row.migration_name,
        checksum: row.checksum,
        finished_at:
            row.finished_at instanceof Date
                ? row.finished_at.toISOString()
                : row.finished_at,
        rolled_back_at:
            row.rolled_back_at instanceof Date
                ? row.rolled_back_at.toISOString()
                : row.rolled_back_at,
    }));
    return sha256(JSON.stringify(normalizedRows));
}

async function writePlan(outputPath, plan, ledgerSource, provenance) {
    const resolvedOutputPath = assertOutputPathAllowed(outputPath);
    const temporaryPath = `${resolvedOutputPath}.${process.pid}.tmp`;
    await mkdir(path.dirname(resolvedOutputPath), {
        recursive: true,
        mode: 0o700,
    });

    const artifact = {
        generatedAt: new Date().toISOString(),
        source: ledgerSource,
        provenance,
        ...plan,
    };

    try {
        await writeFile(
            temporaryPath,
            `${JSON.stringify(artifact, null, 2)}\n`,
            { encoding: 'utf8', mode: 0o600 },
        );
        await rename(temporaryPath, resolvedOutputPath);
    } catch (error) {
        await unlink(temporaryPath).catch(() => undefined);
        throw error;
    }

    return resolvedOutputPath;
}

async function main() {
    const ledgerFile = getArgumentValue('--ledger-file');
    const outputPath = getArgumentValue('--output') ?? defaultOutputPath;
    const acceptedMarkers = parseMarkerAcknowledgements();

    if (!ledgerFile && process.env.ALLOW_PRODUCTION_LEDGER_READ !== '1') {
        throw new Error(
            'ALLOW_PRODUCTION_LEDGER_READ=1 is required before database ledger access',
        );
    }

    const canonical = await loadCanonicalMigrations();
    const ledgerSnapshot = ledgerFile
        ? await readLedgerFromFile(ledgerFile)
        : await readLedgerFromDatabase();
    const plan = buildMigrationPlan({
        ...canonical,
        ledgerRows: ledgerSnapshot.rows,
        acceptedMarkers,
    });
    const provenance = {
        capturedAt: new Date().toISOString(),
        ledgerDigest: ledgerDigest(ledgerSnapshot.rows),
        ...ledgerSnapshot.provenance,
    };
    const resolvedOutputPath = await writePlan(
        outputPath,
        plan,
        ledgerFile ? 'offline-ledger-file' : 'read-only-database-ledger',
        provenance,
    );

    console.log(
        `Migration plan written: ${path.relative(projectDirectory, resolvedOutputPath)} ` +
            `(canonical=${plan.canonicalCount}, applied=${plan.applied.length}, pending=${plan.pending.length})`,
    );
}

const invokedPath = process.argv[1]
    ? pathToFileURL(path.resolve(process.argv[1])).href
    : undefined;
if (invokedPath === import.meta.url) {
    main().catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    });
}
