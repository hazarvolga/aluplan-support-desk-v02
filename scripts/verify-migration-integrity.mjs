import { createHash } from 'node:crypto';
import { readdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

const acceptedLedgerMarkers = new Map([
    ['20260426202926_add_proactive_chat', new Set(['manual-psql-fix'])],
]);

const requiredRelations = Object.freeze([
    'public.ticket_number_seq',
    'public.roles',
    'public.permissions',
    'public.role_permissions',
    'public.crm_accounts',
    'public.crm_connections',
    'public.crm_sync_logs',
    'public.ai_response_cache',
]);

function sha256(content) {
    return createHash('sha256').update(content).digest('hex');
}

async function loadMigrationChecksums() {
    const directoryEntries = await readdir(migrationsDirectory, {
        withFileTypes: true,
    });
    const migrationNames = directoryEntries
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();

    const checksumEntries = await Promise.all(
        migrationNames.map(async (migrationName) => {
            const migrationPath = path.join(
                migrationsDirectory,
                migrationName,
                'migration.sql',
            );
            const migrationSql = await readFile(migrationPath);
            return [migrationName, sha256(migrationSql)];
        }),
    );

    return new Map(checksumEntries);
}

async function loadChecksumManifest() {
    const manifest = JSON.parse(await readFile(checksumManifestPath, 'utf8'));
    return new Map(Object.entries(manifest));
}

export function buildUpdatedChecksumManifest(
    fileChecksums,
    checksumManifest,
) {
    if (fileChecksums.size > 0 && checksumManifest.size === 0) {
        throw new Error(
            'Refusing to create a canonical manifest from an empty baseline.',
        );
    }

    const validMigrationName = /^(?:0_[a-z0-9_]+|\d{14}_[a-z0-9_]+)$/;
    for (const migrationName of fileChecksums.keys()) {
        if (!validMigrationName.test(migrationName)) {
            throw new Error(
                `Invalid migration directory name: ${migrationName}`,
            );
        }
    }

    for (const [migrationName, expectedChecksum] of checksumManifest) {
        const actualChecksum = fileChecksums.get(migrationName);
        if (!actualChecksum) {
            throw new Error(
                `Manifest entry has no migration directory: ${migrationName}`,
            );
        }
        if (actualChecksum !== expectedChecksum) {
            throw new Error(
                `Refusing to update manifest because an existing migration changed: ${migrationName}`,
            );
        }
    }

    const canonicalNames = [...checksumManifest.keys()].sort();
    const canonicalTail = canonicalNames.at(-1);
    if (canonicalTail) {
        const nonForwardMigration = [...fileChecksums.keys()]
            .filter((migrationName) => !checksumManifest.has(migrationName))
            .sort()
            .find((migrationName) => migrationName <= canonicalTail);
        if (nonForwardMigration) {
            throw new Error(
                `Refusing to append a non-forward migration older than the canonical tail: ${nonForwardMigration}`,
            );
        }
    }

    return new Map(
        [...fileChecksums].sort(([leftName], [rightName]) =>
            leftName.localeCompare(rightName),
        ),
    );
}

export function serializeChecksumManifest(checksumManifest) {
    return `${JSON.stringify(Object.fromEntries(checksumManifest), null, 2)}\n`;
}

async function writeChecksumManifest(checksumManifest) {
    const temporaryPath = `${checksumManifestPath}.${process.pid}.tmp`;
    try {
        await writeFile(
            temporaryPath,
            serializeChecksumManifest(checksumManifest),
            { encoding: 'utf8', mode: 0o644 },
        );
        await rename(temporaryPath, checksumManifestPath);
    } catch (error) {
        await unlink(temporaryPath).catch(() => undefined);
        throw error;
    }
}

function verifyCanonicalChecksums(fileChecksums, checksumManifest) {
    if (fileChecksums.size !== checksumManifest.size) {
        throw new Error(
            `Migration manifest count mismatch: files=${fileChecksums.size}, manifest=${checksumManifest.size}`,
        );
    }

    for (const [migrationName, expectedChecksum] of checksumManifest) {
        const actualChecksum = fileChecksums.get(migrationName);
        if (actualChecksum !== expectedChecksum) {
            throw new Error(
                `Canonical migration checksum mismatch: ${migrationName}`,
            );
        }
    }
}

async function verifyParityMigrationSafety() {
    const migrationName = '20260806000000_align_schema_parity';
    const migrationSql = await readFile(
        path.join(migrationsDirectory, migrationName, 'migration.sql'),
        'utf8',
    );
    // This is a deliberately narrow, defense-in-depth lint for this additive
    // parity migration. PostgreSQL remains the source of truth for SQL parsing.
    const forbiddenMutation =
        /(?:^|;)\s*(?:DROP\s+(?:INDEX|TABLE|TYPE|VIEW|MATERIALIZED\s+VIEW|SEQUENCE|SCHEMA|CONSTRAINT|COLUMN)\b|ALTER\s+TABLE\b[\s\S]*?\bDROP\s+(?:COLUMN|CONSTRAINT)\b|TRUNCATE\b|DELETE\s+FROM\b|UPDATE\s+"?[a-z_]\w*"?\s+SET\b|INSERT\s+INTO\b)/im;

    if (!/^\s*(?:--[^\n]*\n)*\s*BEGIN;/i.test(migrationSql)) {
        throw new Error(`${migrationName} must start with an explicit transaction`);
    }
    if (!/COMMIT;\s*$/i.test(migrationSql)) {
        throw new Error(`${migrationName} must end with COMMIT`);
    }
    if (forbiddenMutation.test(migrationSql)) {
        throw new Error(`${migrationName} contains a forbidden destructive or data mutation`);
    }
}

async function loadLedger(client) {
    const result = await client.query(
        `SELECT migration_name, checksum, finished_at, rolled_back_at
         FROM _prisma_migrations
         ORDER BY started_at`,
    );
    return result.rows;
}

function verifyLedger(fileChecksums, ledgerRows) {
    const successfulRows = ledgerRows.filter(
        (row) => row.finished_at !== null && row.rolled_back_at === null,
    );
    const successfulNames = new Set(
        successfulRows.map((row) => row.migration_name),
    );

    if (successfulNames.size !== fileChecksums.size) {
        throw new Error(
            `Migration count mismatch: files=${fileChecksums.size}, successful=${successfulNames.size}`,
        );
    }

    const checksumMismatches = [...fileChecksums].filter(
        ([migrationName, fileChecksum]) => {
            const acceptedMarkers =
                acceptedLedgerMarkers.get(migrationName) ?? new Set();
            return !successfulRows.some(
                (row) =>
                    row.migration_name === migrationName &&
                    (row.checksum === fileChecksum ||
                        acceptedMarkers.has(row.checksum)),
            );
        },
    );
    if (checksumMismatches.length > 0) {
        throw new Error(
            `No successful ledger checksum match: ${checksumMismatches
                .map(([migrationName]) => migrationName)
                .join(', ')}`,
        );
    }

    const orphanedLedgerNames = [...successfulNames].filter(
        (migrationName) => !fileChecksums.has(migrationName),
    );
    if (orphanedLedgerNames.length > 0) {
        throw new Error(
            `Successful ledger entries have no migration file: ${orphanedLedgerNames.join(', ')}`,
        );
    }
}

async function verifyRequiredRelations(client) {
    const result = await client.query(
        `SELECT relation_name, to_regclass(relation_name) IS NOT NULL AS exists
         FROM unnest($1::text[]) AS relation_name`,
        [requiredRelations],
    );
    const missingRelations = result.rows
        .filter((row) => !row.exists)
        .map((row) => row.relation_name);

    if (missingRelations.length > 0) {
        throw new Error(
            `Required migration relations are missing: ${missingRelations.join(', ')}`,
        );
    }
}

async function main() {
    const fileChecksums = await loadMigrationChecksums();
    const checksumManifest = await loadChecksumManifest();

    if (process.argv.includes('--write-manifest')) {
        await verifyParityMigrationSafety();
        const updatedManifest = buildUpdatedChecksumManifest(
            fileChecksums,
            checksumManifest,
        );
        await writeChecksumManifest(updatedManifest);
        const addedCount = updatedManifest.size - checksumManifest.size;
        console.log(
            `Migration manifest updated: ${updatedManifest.size} entries (${addedCount} added).`,
        );
        return;
    }

    verifyCanonicalChecksums(fileChecksums, checksumManifest);
    await verifyParityMigrationSafety();

    if (process.argv.includes('--files-only')) {
        console.log(
            `Migration file integrity verified: ${fileChecksums.size} files match the canonical manifest.`,
        );
        return;
    }

    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required for migration verification');
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    await client.connect();
    try {
        const ledgerRows = await loadLedger(client);
        verifyLedger(fileChecksums, ledgerRows);
        await verifyRequiredRelations(client);
    } finally {
        await client.end();
    }

    console.log(
        `Migration integrity verified: ${fileChecksums.size} files, canonical checksums and required relations are valid.`,
    );
}

if (
    process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
    main().catch((error) => {
        console.error(
            error instanceof Error
                ? error.message
                : 'Migration verification failed',
        );
        process.exitCode = 1;
    });
}
