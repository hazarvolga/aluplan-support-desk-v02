import { readFile, writeFile } from 'node:fs/promises';
import pg from 'pg';

const { Client } = pg;
const sourceUrl = process.env.SOURCE_DATABASE_URL;
const targetUrl = process.env.TARGET_DATABASE_URL;
const outputPath = process.env.SCHEMA_COMPARE_OUTPUT;
const allowlistPath = process.env.SCHEMA_COMPARE_ALLOWLIST;

if (!sourceUrl || !targetUrl) {
    throw new Error(
        'SOURCE_DATABASE_URL and TARGET_DATABASE_URL are required for schema comparison',
    );
}

const catalogQueries = Object.freeze({
    extensions: `
        SELECT extname AS key, extversion
        FROM pg_extension
        ORDER BY extname
    `,
    relations: `
        SELECT
            n.nspname || '.' || c.relname AS key,
            c.relkind,
            c.relpersistence,
            c.relrowsecurity,
            c.relforcerowsecurity,
            pg_get_partkeydef(c.oid) AS partition_key
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
          AND c.relname <> '_prisma_migrations'
        ORDER BY key
    `,
    columns: `
        SELECT
            n.nspname || '.' || c.relname || '.' || a.attname AS key,
            format_type(a.atttypid, a.atttypmod) AS formatted_type,
            a.attnotnull AS not_null,
            pg_get_expr(d.adbin, d.adrelid, true) AS default_expression,
            a.attidentity AS identity_kind,
            a.attgenerated AS generated_kind,
            CASE
                WHEN a.attcollation = 0 THEN NULL
                ELSE coll.collname
            END AS collation
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
        LEFT JOIN pg_collation coll ON coll.oid = a.attcollation
        WHERE n.nspname = 'public'
          AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
          AND c.relname <> '_prisma_migrations'
          AND a.attnum > 0
          AND NOT a.attisdropped
        ORDER BY key
    `,
    column_order: `
        SELECT
            n.nspname || '.' || c.relname || '.' || a.attname AS key,
            a.attnum AS ordinal_position
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
          AND c.relname <> '_prisma_migrations'
          AND a.attnum > 0
          AND NOT a.attisdropped
        ORDER BY key
    `,
    enums: `
        SELECT
            n.nspname || '.' || t.typname || '.' || e.enumlabel AS key,
            e.enumsortorder
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        JOIN pg_enum e ON e.enumtypid = t.oid
        WHERE n.nspname = 'public'
        ORDER BY t.typname, e.enumsortorder
    `,
    constraints: `
        SELECT
            n.nspname || '.' || c.relname || '.' || con.conname AS key,
            con.contype,
            con.condeferrable,
            con.condeferred,
            con.convalidated,
            pg_get_constraintdef(con.oid, true) AS definition
        FROM pg_constraint con
        JOIN pg_class c ON c.oid = con.conrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname <> '_prisma_migrations'
        ORDER BY key
    `,
    indexes: `
        SELECT
            n.nspname || '.' || idx.relname AS key,
            tbl.relname AS table_name,
            am.amname AS access_method,
            i.indisunique AS is_unique,
            i.indisprimary AS is_primary,
            i.indisvalid AS is_valid,
            i.indisready AS is_ready,
            pg_get_expr(i.indpred, i.indrelid, true) AS predicate,
            pg_get_indexdef(i.indexrelid, 0, true) AS definition
        FROM pg_index i
        JOIN pg_class idx ON idx.oid = i.indexrelid
        JOIN pg_class tbl ON tbl.oid = i.indrelid
        JOIN pg_namespace n ON n.oid = idx.relnamespace
        JOIN pg_am am ON am.oid = idx.relam
        WHERE n.nspname = 'public'
          AND tbl.relname <> '_prisma_migrations'
        ORDER BY key
    `,
    sequences: `
        SELECT
            n.nspname || '.' || c.relname AS key,
            format_type(s.seqtypid, NULL) AS data_type,
            s.seqstart,
            s.seqincrement,
            s.seqmax,
            s.seqmin,
            s.seqcache,
            s.seqcycle,
            CASE
                WHEN owned_table.oid IS NULL THEN NULL
                ELSE owned_ns.nspname || '.' || owned_table.relname || '.' || owned_attr.attname
            END AS owned_by
        FROM pg_sequence s
        JOIN pg_class c ON c.oid = s.seqrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        LEFT JOIN pg_depend dep
            ON dep.classid = 'pg_class'::regclass
           AND dep.objid = c.oid
           AND dep.deptype IN ('a', 'i')
        LEFT JOIN pg_class owned_table ON owned_table.oid = dep.refobjid
        LEFT JOIN pg_namespace owned_ns ON owned_ns.oid = owned_table.relnamespace
        LEFT JOIN pg_attribute owned_attr
            ON owned_attr.attrelid = dep.refobjid
           AND owned_attr.attnum = dep.refobjsubid
        WHERE n.nspname = 'public'
        ORDER BY key
    `,
    views: `
        SELECT
            n.nspname || '.' || c.relname AS key,
            pg_get_viewdef(c.oid, true) AS definition
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind IN ('v', 'm')
        ORDER BY key
    `,
    functions: `
        SELECT
            n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' AS key,
            pg_get_function_result(p.oid) AS result_type,
            l.lanname AS language,
            p.provolatile,
            p.proparallel,
            p.prosecdef AS security_definer,
            pg_get_functiondef(p.oid) AS definition
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        JOIN pg_language l ON l.oid = p.prolang
        WHERE n.nspname = 'public'
          AND p.prokind IN ('f', 'p')
        ORDER BY key
    `,
    triggers: `
        SELECT
            n.nspname || '.' || c.relname || '.' || t.tgname AS key,
            t.tgenabled,
            pg_get_triggerdef(t.oid, true) AS definition
        FROM pg_trigger t
        JOIN pg_class c ON c.oid = t.tgrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND NOT t.tgisinternal
        ORDER BY key
    `,
    policies: `
        SELECT
            schemaname || '.' || tablename || '.' || policyname AS key,
            permissive,
            roles,
            cmd,
            qual,
            with_check
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY key
    `,
});

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

function identityKey(identity) {
    return [
        identity.server_address,
        identity.server_port,
        identity.data_directory,
        identity.database_name,
    ].join('|');
}

function rowsByKey(rows) {
    return new Map(rows.map((row) => [row.key, row]));
}

function compareCategory(category, sourceRows, targetRows) {
    const source = rowsByKey(sourceRows);
    const target = rowsByKey(targetRows);
    const differences = [];

    for (const [key, sourceValue] of source) {
        const targetValue = target.get(key);
        if (!targetValue) {
            differences.push({ category, key, kind: 'missing_in_target', source: sourceValue, target: null });
            continue;
        }
        if (JSON.stringify(sourceValue) !== JSON.stringify(targetValue)) {
            differences.push({
                category,
                key,
                kind: 'definition_mismatch',
                source: sourceValue,
                target: targetValue,
            });
        }
    }

    for (const key of target.keys()) {
        if (!source.has(key)) {
            differences.push({ category, key, kind: 'unexpected_in_target', source: null, target: target.get(key) });
        }
    }

    return differences;
}

function differenceIdentity(difference) {
    return [difference.category, difference.key, difference.kind].join('|');
}

function allowlistMatches(entry, difference) {
    return differenceIdentity(entry) === differenceIdentity(difference)
        && JSON.stringify(entry.expectedSource ?? null) === JSON.stringify(difference.source ?? null)
        && JSON.stringify(entry.expectedTarget ?? null) === JSON.stringify(difference.target ?? null);
}

async function loadCatalog(client) {
    const entries = [];
    for (const [category, query] of Object.entries(catalogQueries)) {
        const result = await client.query(query);
        entries.push([category, result.rows]);
    }
    return Object.fromEntries(entries);
}

const source = new Client({ connectionString: sourceUrl });
const target = new Client({ connectionString: targetUrl });

await Promise.all([source.connect(), target.connect()]);
try {
    const [sourceIdentity, targetIdentity] = await Promise.all([
        loadDatabaseIdentity(source),
        loadDatabaseIdentity(target),
    ]);
    if (identityKey(sourceIdentity) === identityKey(targetIdentity)) {
        throw new Error('Source and target must be distinct databases');
    }

    await Promise.all([
        source.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY'),
        target.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY'),
    ]);

    const [sourceCatalog, targetCatalog] = await Promise.all([
        loadCatalog(source),
        loadCatalog(target),
    ]);
    const differences = Object.keys(catalogQueries)
        .filter((category) => category !== 'column_order')
        .flatMap((category) =>
        compareCategory(
            category,
            sourceCatalog[category],
            targetCatalog[category],
        ),
    );
    const informationalDifferences = compareCategory(
        'column_order',
        sourceCatalog.column_order,
        targetCatalog.column_order,
    );

    const allowlist = allowlistPath
        ? JSON.parse(await readFile(allowlistPath, 'utf8'))
        : [];
    const allowlistByIdentity = new Map(allowlist.map((entry) => [differenceIdentity(entry), entry]));
    const allowedDifferences = differences
        .filter((difference) => {
            const entry = allowlistByIdentity.get(differenceIdentity(difference));
            return entry && allowlistMatches(entry, difference);
        })
        .map((difference) => ({
            ...difference,
            rationale: allowlistByIdentity.get(differenceIdentity(difference)).rationale,
        }));
    const blockingDifferences = differences.filter(
        (difference) => {
            const entry = allowlistByIdentity.get(differenceIdentity(difference));
            return !entry || !allowlistMatches(entry, difference);
        },
    );
    const unusedAllowlistEntries = allowlist.filter(
        (entry) => !differences.some(
            (difference) => allowlistMatches(entry, difference),
        ),
    );

    const result = {
        source: sourceIdentity,
        target: targetIdentity,
        blockingDifferences,
        allowedDifferences,
        unusedAllowlistEntries,
        informationalDifferences,
        categoryCounts: Object.fromEntries(
            Object.entries(sourceCatalog).map(([category, rows]) => [
                category,
                rows.length,
            ]),
        ),
    };

    if (outputPath) {
        await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, {
            mode: 0o600,
        });
    }

    if (blockingDifferences.length > 0 || unusedAllowlistEntries.length > 0) {
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
        throw new Error(
            `Database schemas have ${blockingDifferences.length} blocking differences and ${unusedAllowlistEntries.length} stale allowlist entries`,
        );
    }

    console.log(
        `Database schemas are structurally equivalent with allowed differences=${allowedDifferences.length}; informational column-order differences=${informationalDifferences.length}: ${JSON.stringify(result.categoryCounts)}`,
    );
    await Promise.all([source.query('COMMIT'), target.query('COMMIT')]);
} finally {
    await Promise.allSettled([source.end(), target.end()]);
}
