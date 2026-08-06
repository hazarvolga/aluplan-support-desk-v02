import pg from 'pg';

const { Client } = pg;
const sourceUrl = process.env.SOURCE_DATABASE_URL;
const targetUrl = process.env.TARGET_DATABASE_URL;
const allowedTargetOnlyColumns = new Map([
    ['crm_accounts', new Set(['customer_no'])],
]);

if (!sourceUrl || !targetUrl) {
    throw new Error(
        'SOURCE_DATABASE_URL and TARGET_DATABASE_URL are required for data comparison',
    );
}

function quoteIdentifier(identifier) {
    return `"${identifier.replaceAll('"', '""')}"`;
}

async function loadTableColumns(client) {
    const result = await client.query(`
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name <> '_prisma_migrations'
          AND table_name IN (
              SELECT table_name
              FROM information_schema.tables
              WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
          )
        ORDER BY table_name, ordinal_position
    `);

    const tables = new Map();
    for (const row of result.rows) {
        const columns = tables.get(row.table_name) ?? [];
        tables.set(row.table_name, [...columns, row.column_name]);
    }
    return tables;
}

async function fingerprintTable(client, tableName, columns) {
    const projection = columns.map(quoteIdentifier).join(', ');
    const table = quoteIdentifier(tableName);
    const result = await client.query(`
        SELECT
            count(*)::text AS row_count,
            md5(COALESCE(string_agg(row_hash, '' ORDER BY row_hash), '')) AS fingerprint
        FROM (
            SELECT md5(to_jsonb(projected_row)::text) AS row_hash
            FROM (SELECT ${projection} FROM public.${table}) AS projected_row
        ) AS row_hashes
    `);
    return {
        rowCount: result.rows[0].row_count,
        fingerprint: result.rows[0].fingerprint,
    };
}

async function loadSequenceFingerprint(client) {
    const result = await client.query(`
        SELECT md5(COALESCE(string_agg(sequence_state, '' ORDER BY sequence_state), '')) AS fingerprint
        FROM (
            SELECT md5(to_jsonb(sequence_row)::text) AS sequence_state
            FROM (
                SELECT schemaname, sequencename, last_value
                FROM pg_sequences
                WHERE schemaname = 'public'
            ) AS sequence_row
        ) AS sequence_states
    `);
    return result.rows[0].fingerprint;
}

async function loadDatabaseIdentity(client) {
    const result = await client.query(`
        SELECT
            current_database() AS database_name,
            COALESCE(inet_server_addr()::text, 'local-socket') AS server_address,
            COALESCE(inet_server_port(), current_setting('port')::integer) AS server_port,
            current_setting('data_directory') AS data_directory
    `);
    return result.rows[0];
}

function databaseIdentityKey(identity) {
    return [
        identity.server_address,
        identity.server_port,
        identity.data_directory,
        identity.database_name,
    ].join('|');
}

const source = new Client({ connectionString: sourceUrl });
const target = new Client({ connectionString: targetUrl });

await Promise.all([source.connect(), target.connect()]);
try {
    const [sourceIdentity, targetIdentity] = await Promise.all([
        loadDatabaseIdentity(source),
        loadDatabaseIdentity(target),
    ]);
    if (databaseIdentityKey(sourceIdentity) === databaseIdentityKey(targetIdentity)) {
        throw new Error('Source and target must be distinct databases');
    }

    await Promise.all([
        source.query('SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY'),
        target.query('SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY'),
    ]);

    const [sourceTables, targetTables] = await Promise.all([
        loadTableColumns(source),
        loadTableColumns(target),
    ]);
    const tableNames = [...sourceTables.keys()].filter((tableName) =>
        targetTables.has(tableName),
    );
    const mismatches = [];

    const missingTables = [...sourceTables.keys()].filter(
        (tableName) => !targetTables.has(tableName),
    );
    const unexpectedTables = [...targetTables.keys()].filter(
        (tableName) => !sourceTables.has(tableName),
    );
    mismatches.push(
        ...missingTables.map((tableName) => `missing table ${tableName}`),
        ...unexpectedTables.map((tableName) => `unexpected table ${tableName}`),
    );

    for (const tableName of tableNames) {
        const targetColumns = new Set(targetTables.get(tableName));
        const sourceColumns = sourceTables.get(tableName);
        const sourceColumnSet = new Set(sourceColumns);
        const missingColumns = sourceColumns.filter(
            (column) => !targetColumns.has(column),
        );
        const allowedExtras = allowedTargetOnlyColumns.get(tableName) ?? new Set();
        const unexpectedColumns = [...targetColumns].filter(
            (column) => !sourceColumnSet.has(column) && !allowedExtras.has(column),
        );
        mismatches.push(
            ...missingColumns.map((column) => `${tableName}.${column} missing`),
            ...unexpectedColumns.map(
                (column) => `${tableName}.${column} unexpected`,
            ),
        );
        if (missingColumns.length > 0 || unexpectedColumns.length > 0) continue;

        const [sourceFingerprint, targetFingerprint] = await Promise.all([
            fingerprintTable(source, tableName, sourceColumns),
            fingerprintTable(target, tableName, sourceColumns),
        ]);
        if (
            sourceFingerprint.rowCount !== targetFingerprint.rowCount ||
            sourceFingerprint.fingerprint !== targetFingerprint.fingerprint
        ) {
            mismatches.push(tableName);
        }
    }

    const [sourceSequences, targetSequences] = await Promise.all([
        loadSequenceFingerprint(source),
        loadSequenceFingerprint(target),
    ]);
    if (sourceSequences !== targetSequences) mismatches.push('public sequences');

    if (mismatches.length > 0) {
        throw new Error(`Database data fingerprints differ: ${mismatches.join(', ')}`);
    }
    console.log(
        `Database data fingerprints match across ${tableNames.length} public business tables and sequences.`,
    );
} finally {
    await Promise.allSettled([source.end(), target.end()]);
}
