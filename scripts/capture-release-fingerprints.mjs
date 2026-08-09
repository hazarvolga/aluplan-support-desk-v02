#!/usr/bin/env node

// Produce deterministic, value-redacted release fingerprints from a read-only
// PostgreSQL snapshot. The output contains counts and hashes only; it never
// emits row values, connection details, credentials, or object keys.

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;
let currentStage = 'startup';

if (!connectionString) {
    process.stderr.write('Fingerprint capture requires DATABASE_URL.\n');
    process.exit(1);
}

const RBAC_TABLES = new Set([
    'roles',
    'permissions',
    'role_permissions',
]);

// Columns added by the currently reviewed migration chain. They are excluded
// only from baseline-to-post protected row hashes; the full post-migration
// fingerprint and Prisma schema-parity gate still include and validate them.
const REVIEWED_ADDITIVE_COLUMNS = new Map([
    ['ai_interactions', ['channel']],
    ['crm_accounts', ['customer_no']],
    ['customer_profiles', ['tags']],
    ['knowledge_sources', ['language']],
    ['users', [
        'email_verification_jti_hash',
        'email_verification_sent_at',
        'password_reset_jti_hash',
        'password_reset_sent_at',
        'session_version',
    ]],
]);

const RAG_SURFACES = [
    ['knowledge_embeddings', 'embedding', 'embedding_version', 'embedding_dim'],
    ['knowledge_pool_embeddings', 'embedding', 'embedding_version', 'embedding_dim'],
    ['ticket_embeddings', 'embedding', 'embedding_version', 'embedding_dim'],
    ['faq_entries', 'question_embedding', 'embedding_version', 'embedding_dim'],
    ['ai_response_cache', 'query_embedding', 'embedding_version', 'embedding_dim'],
];

const OBJECT_REFERENCE_SURFACES = [
    ['attachments', 'url'],
    ['knowledge_sources', 'file_path'],
];

function quoteIdentifier(value) {
    return `"${String(value).replaceAll('"', '""')}"`;
}

function digestJson(value) {
    return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

async function tableExists(client, tableName) {
    const result = await client.query(
        `SELECT to_regclass($1) IS NOT NULL AS present`,
        [`public.${tableName}`],
    );
    return result.rows[0]?.present === true;
}

async function captureTable(client, tableName, omittedColumns = []) {
    const table = quoteIdentifier(tableName);
    const rowExpression = omittedColumns.length === 0
        ? 'to_jsonb(t)'
        : `to_jsonb(t) - ARRAY[${omittedColumns.map((column) => `'${column.replaceAll("'", "''")}'`).join(', ')}]::text[]`;
    const result = await client.query(`
        SELECT
            count(*)::text AS "rowCount",
            COALESCE(
                md5(string_agg(row_hash, '' ORDER BY row_hash)),
                md5('')
            ) AS digest
        FROM (
            SELECT md5((${rowExpression})::text) AS row_hash
            FROM public.${table} AS t
        ) AS rows
    `);
    return {
        table: tableName,
        rowCount: result.rows[0].rowCount,
        digest: result.rows[0].digest,
    };
}

async function captureTables(client) {
    const result = await client.query(`
        SELECT tablename
        FROM pg_catalog.pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename
    `);
    const captured = [];
    for (const { tablename } of result.rows) {
        const fingerprint = await captureTable(client, tablename);
        captured.push(fingerprint);
    }
    return captured;
}

async function captureBusinessTables(client, tableNames) {
    const captured = [];
    for (const tableName of tableNames) {
        if (tableName === '_prisma_migrations' || RBAC_TABLES.has(tableName)) continue;
        captured.push(await captureTable(
            client,
            tableName,
            REVIEWED_ADDITIVE_COLUMNS.get(tableName) ?? [],
        ));
    }
    return captured;
}

async function captureSchema(client) {
    const result = await client.query(`
        SELECT table_name AS table, column_name AS column
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
    `);
    const tables = new Map();
    for (const row of result.rows) {
        const columns = tables.get(row.table) ?? [];
        tables.set(row.table, [...columns, row.column]);
    }
    return [...tables.entries()].map(([table, columns]) => ({ table, columns }));
}

function normalizeRoleName(value) {
    return String(value).trim().replaceAll('-', '_').toUpperCase();
}

async function captureRbac(client) {
    const [roles, permissions, assignments] = await Promise.all([
        client.query(`
            SELECT md5(name) AS "keyDigest", md5(to_jsonb(role_row)::text) AS "rowDigest",
                   md5((to_jsonb(role_row) - ARRAY['description', 'is_system', 'updated_at']::text[])::text) AS "stableRowDigest",
                   UPPER(REPLACE(BTRIM(name), '-', '_')) = 'SUPPORT_AGENT' AS mutable
            FROM public.roles AS role_row
            ORDER BY md5(name)
        `),
        client.query(`
            SELECT md5(name) AS "keyDigest", md5(to_jsonb(permission_row)::text) AS "rowDigest"
            FROM public.permissions AS permission_row
            ORDER BY md5(name)
        `),
        client.query(`
            SELECT md5(role_row.name || chr(31) || permission_row.name) AS "keyDigest",
                   md5(UPPER(REPLACE(BTRIM(role_row.name), '-', '_'))) AS "normalizedRoleDigest",
                   md5(permission_row.name) AS "permissionDigest",
                   md5(to_jsonb(role_permission)::text) AS "rowDigest"
            FROM public.role_permissions AS role_permission
            JOIN public.roles AS role_row ON role_row.id = role_permission.role_id
            JOIN public.permissions AS permission_row ON permission_row.id = role_permission.permission_id
            ORDER BY 1
        `),
    ]);

    const contract = JSON.parse(await readFile(
        new URL('../packages/database/prisma/rbac-canonical.json', import.meta.url),
        'utf8',
    ));
    const snapshot = await client.query(`
        SELECT role_row.name AS role, permission_row.name AS permission
        FROM public.roles AS role_row
        LEFT JOIN public.role_permissions AS role_permission ON role_permission.role_id = role_row.id
        LEFT JOIN public.permissions AS permission_row ON permission_row.id = role_permission.permission_id
        ORDER BY role_row.name, permission_row.name
    `);
    const actualByRole = new Map();
    const actualPermissions = new Set();
    const permissionRows = await client.query('SELECT name FROM public.permissions ORDER BY name');
    for (const row of permissionRows.rows) actualPermissions.add(row.name);
    for (const row of snapshot.rows) {
        const role = normalizeRoleName(row.role);
        const assigned = actualByRole.get(role) ?? [];
        if (row.permission !== null) assigned.push(row.permission);
        actualByRole.set(role, assigned);
    }
    let canonicalValid = true;
    for (const permission of contract.permissions) {
        if (!actualPermissions.has(permission.name)) canonicalValid = false;
    }
    for (const [rawRole, expected] of Object.entries(contract.rolePermissions)) {
        const actual = [...(actualByRole.get(normalizeRoleName(rawRole)) ?? [])].sort();
        if (JSON.stringify(actual) !== JSON.stringify([...expected].sort())) canonicalValid = false;
    }

    const result = {
        roles: roles.rows,
        permissions: permissions.rows,
        assignments: assignments.rows,
        canonicalValid,
    };
    return { ...result, digest: digestJson(result) };
}

async function captureRagSurface(client, surface) {
    const [tableName, vectorColumn, versionColumn, dimensionColumn] = surface;
    if (!(await tableExists(client, tableName))) {
        return { table: tableName, present: false, groups: [] };
    }
    const table = quoteIdentifier(tableName);
    const vector = quoteIdentifier(vectorColumn);
    const version = quoteIdentifier(versionColumn);
    const dimension = quoteIdentifier(dimensionColumn);
    const result = await client.query(`
        SELECT
            COALESCE(${version}::text, '<null>') AS version,
            ${dimension}::text AS "declaredDimension",
            count(*)::text AS total,
            count(*) FILTER (WHERE ${vector} IS NULL)::text AS "nullVectors",
            count(*) FILTER (
                WHERE ${vector} IS NOT NULL
                  AND vector_dims(${vector}) <> ${dimension}
            )::text AS "dimensionMismatches"
        FROM public.${table}
        GROUP BY 1, 2
        ORDER BY 1, 2
    `);
    return { table: tableName, present: true, groups: result.rows };
}

async function captureObjectReference(client, surface) {
    const [tableName, columnName] = surface;
    if (!(await tableExists(client, tableName))) {
        return { table: tableName, column: columnName, present: false };
    }
    const table = quoteIdentifier(tableName);
    const column = quoteIdentifier(columnName);
    const result = await client.query(`
        SELECT
            count(*)::text AS total,
            count(*) FILTER (WHERE ${column} IS NULL OR ${column} = '')::text AS "emptyReferences",
            COALESCE(
                md5(string_agg(md5(COALESCE(${column}, '')), '' ORDER BY md5(COALESCE(${column}, '')))),
                md5('')
            ) AS digest
        FROM public.${table}
    `);
    return {
        table: tableName,
        column: columnName,
        present: true,
        ...result.rows[0],
    };
}

async function captureSequences(client) {
    const result = await client.query(`
        SELECT
            schemaname AS schema,
            sequencename AS name,
            COALESCE(last_value::text, '<null>') AS "lastValue",
            increment_by::text AS "incrementBy"
        FROM pg_catalog.pg_sequences
        WHERE schemaname = 'public'
        ORDER BY sequencename
    `);
    return result.rows;
}

async function captureMigrationLedger(client) {
    if (!(await tableExists(client, '_prisma_migrations'))) {
        return { present: false, rowCount: '0', digest: digestJson([]) };
    }
    const fingerprint = await captureTable(client, '_prisma_migrations');
    return { present: true, rowCount: fingerprint.rowCount, digest: fingerprint.digest };
}

async function captureIntegrity(client) {
    const constraints = await client.query(`
        SELECT count(*)::text AS count
        FROM pg_catalog.pg_constraint
        WHERE NOT convalidated
    `);
    const indexes = await client.query(`
        SELECT count(*)::text AS count
        FROM pg_catalog.pg_index
        WHERE NOT indisvalid OR NOT indisready
    `);
    return {
        invalidConstraints: constraints.rows[0].count,
        invalidIndexes: indexes.rows[0].count,
    };
}

async function main() {
    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 10_000,
        query_timeout: 610_000,
    });
    currentStage = 'connect';
    await client.connect();
    try {
        currentStage = 'begin-read-only';
        await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
        await client.query("SET LOCAL statement_timeout = '10min'");

        currentStage = 'tables';
        const full = await captureTables(client);
        const business = await captureBusinessTables(
            client,
            full.map(({ table }) => table),
        );
        currentStage = 'schema';
        const schema = await captureSchema(client);
        currentStage = 'rbac';
        const rbac = await captureRbac(client);
        const rag = [];
        currentStage = 'rag';
        for (const surface of RAG_SURFACES) {
            rag.push(await captureRagSurface(client, surface));
        }
        const objectReferences = [];
        currentStage = 'object-references';
        for (const surface of OBJECT_REFERENCE_SURFACES) {
            objectReferences.push(await captureObjectReference(client, surface));
        }
        currentStage = 'sequences';
        const sequences = await captureSequences(client);
        currentStage = 'migration-ledger';
        const migrationLedger = await captureMigrationLedger(client);
        currentStage = 'integrity';
        const integrity = await captureIntegrity(client);

        const result = {
            schemaVersion: 1,
            full,
            schema,
            business,
            rbac,
            rag,
            objectReferences,
            sequences,
            migrationLedger,
            integrity,
        };
        result.digest = digestJson(result);
        process.stdout.write(`${JSON.stringify(result)}\n`);
    } finally {
        await client.query('ROLLBACK').catch(() => undefined);
        await client.end().catch(() => undefined);
    }
}

main().catch(() => {
    process.stderr.write(`Release fingerprint capture failed at ${currentStage}.\n`);
    process.exitCode = 1;
});
