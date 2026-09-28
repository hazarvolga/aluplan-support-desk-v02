import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;
const migrationsRoot = path.resolve('packages/database/prisma/migrations');
const shadowUrl = process.env.SHADOW_DATABASE_URL;
const freshUrl = process.env.FRESH_DATABASE_URL;
const outputPath = process.env.MIGRATION_AUDIT_OUTPUT;
const expectedShadowDatabase = process.env.EXPECTED_SHADOW_DATABASE;
const expectedFreshDatabase = process.env.EXPECTED_FRESH_DATABASE;
const cutoff = process.env.MIGRATION_AUDIT_CUTOFF ?? '20260806000000_align_schema_parity';
const identifier = '(?:"(?:[^"]|"")+"|[A-Za-z_][A-Za-z0-9_]*)(?:\\.(?:"(?:[^"]|"")+"|[A-Za-z_][A-Za-z0-9_]*))?';

if (!shadowUrl || !freshUrl) throw new Error('SHADOW_DATABASE_URL and FRESH_DATABASE_URL are required');

function unquote(value) {
    return value.split('.').at(-1).replace(/^"|"$/g, '').replaceAll('""', '"');
}

function effect(match, values) {
    return { ...values, ifNotExists: /IF\s+NOT\s+EXISTS/i.test(match[0]), statement: match[0].replace(/\s+/g, ' ').trim() };
}

function collect(sql, pattern, build) {
    return [...sql.matchAll(pattern)].map((match) => effect(match, build(match)));
}

function splitTopLevel(input) {
    const parts = [];
    let current = '';
    let depth = 0;
    let quote = null;
    for (let i = 0; i < input.length; i += 1) {
        const char = input[i];
        if (quote && char === quote && input[i - 1] !== '\\') quote = null;
        else if (!quote && (char === "'" || char === '"')) quote = char;
        else if (!quote && char === '(') depth += 1;
        else if (!quote && char === ')') depth -= 1;
        if (!quote && depth === 0 && char === ',') {
            if (current.trim()) parts.push(current.trim());
            current = '';
        } else current += char;
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
}

function createTableEffects(sql) {
    const effects = [];
    const pattern = new RegExp(`CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(${identifier})\\s*\\(`, 'gi');
    for (const match of sql.matchAll(pattern)) {
        const table = unquote(match[1]);
        const bodyStart = match.index + match[0].length;
        let depth = 1;
        let quote = null;
        let end = bodyStart;
        for (; end < sql.length && depth > 0; end += 1) {
            const char = sql[end];
            if (quote && char === quote && sql[end - 1] !== '\\') quote = null;
            else if (!quote && (char === "'" || char === '"')) quote = char;
            else if (!quote && char === '(') depth += 1;
            else if (!quote && char === ')') depth -= 1;
        }
        effects.push(effect(match, { kind: 'table', name: table }));
        for (const definition of splitTopLevel(sql.slice(bodyStart, end - 1))) {
            const columnMatch = definition.match(new RegExp(`^(${identifier})`));
            const namedConstraint = definition.match(new RegExp(`\\bCONSTRAINT\\s+(${identifier})`, 'i'));
            if (namedConstraint) effects.push({ kind: 'constraint', table, name: unquote(namedConstraint[1]), ifNotExists: false, statement: definition.replace(/\s+/g, ' ') });
            if (!columnMatch || /^(CONSTRAINT|PRIMARY|UNIQUE|FOREIGN|CHECK|EXCLUDE)$/i.test(unquote(columnMatch[1]))) continue;
            const column = unquote(columnMatch[1]);
            effects.push({ kind: 'column', table, name: column, ifNotExists: false, statement: definition.replace(/\s+/g, ' ') });
            if (/\bREFERENCES\b/i.test(definition)) {
                effects.push({ kind: 'foreign_key_column', table, name: column, ifNotExists: false, statement: definition.replace(/\s+/g, ' ') });
            }
        }
    }
    return effects;
}

function alterTableEffects(sql) {
    const effects = [];
    const statements = sql.match(new RegExp(`ALTER\\s+TABLE\\s+(?:IF\\s+EXISTS\\s+)?${identifier}[\\s\\S]*?;`, 'gi')) ?? [];
    for (const statement of statements) {
        const tableMatch = statement.match(new RegExp(`ALTER\\s+TABLE\\s+(?:IF\\s+EXISTS\\s+)?(${identifier})`, 'i'));
        if (!tableMatch) continue;
        const table = unquote(tableMatch[1]);
        for (const match of statement.matchAll(new RegExp(`\\bADD\\s+(?:COLUMN\\s+)?(?:IF\\s+NOT\\s+EXISTS\\s+)?(${identifier})`, 'gi'))) {
            const name = unquote(match[1]);
            if (name.toUpperCase() !== 'CONSTRAINT') effects.push(effect(match, { kind: 'column', table, name }));
        }
        for (const match of statement.matchAll(new RegExp(`\\bADD\\s+CONSTRAINT\\s+(${identifier})`, 'gi'))) {
            effects.push(effect(match, { kind: 'constraint', table, name: unquote(match[1]) }));
        }
        const clauses = splitTopLevel(statement.slice(tableMatch[0].length).replace(/;\s*$/, ''));
        for (const clause of clauses) {
            const addedColumn = clause.match(new RegExp(`^\\s*ADD\\s+(?:COLUMN\\s+)?(?:IF\\s+NOT\\s+EXISTS\\s+)?(${identifier})`, 'i'));
            if (addedColumn && /\bREFERENCES\b/i.test(clause)) {
                effects.push({
                    kind: 'foreign_key_column', table, name: unquote(addedColumn[1]),
                    ifNotExists: /IF\s+NOT\s+EXISTS/i.test(clause), statement: clause.replace(/\s+/g, ' ').trim(),
                });
            }
        }
    }
    return effects;
}

function parseEffects(sql) {
    const renames = new Map([...sql.matchAll(new RegExp(`ALTER\\s+TYPE\\s+(${identifier})\\s+RENAME\\s+TO\\s+(${identifier})`, 'gi'))].map((m) => [unquote(m[1]), unquote(m[2])]));
    const finalType = (name) => renames.get(name) ?? name;
    const createdEnums = [...sql.matchAll(new RegExp(`CREATE\\s+TYPE\\s+(${identifier})\\s+AS\\s+ENUM\\s*\\(([^;]+?)\\)`, 'gi'))]
        .flatMap((m) => [...m[2].matchAll(/'([^']+)'/g)].map((v) => ({ kind: 'enum_value', type: finalType(unquote(m[1])), name: v[1], ifNotExists: false, statement: `CREATE TYPE ${m[1]} AS ENUM (... '${v[1]}' ...)` })));
    const effects = [
        ...createTableEffects(sql),
        ...alterTableEffects(sql),
        ...collect(sql, new RegExp(`CREATE\\s+TYPE\\s+(${identifier})\\s+AS\\s+ENUM`, 'gi'), (m) => ({ kind: 'type', name: finalType(unquote(m[1])) })),
        ...createdEnums,
        ...collect(sql, new RegExp(`ALTER\\s+TYPE\\s+(${identifier})\\s+ADD\\s+VALUE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?'([^']+)'`, 'gi'), (m) => ({ kind: 'enum_value', type: unquote(m[1]), name: m[2] })),
        ...collect(sql, new RegExp(`CREATE\\s+(?:UNIQUE\\s+)?INDEX\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(${identifier})`, 'gi'), (m) => ({ kind: 'index', name: unquote(m[1]) })),
        ...collect(sql, new RegExp(`CREATE\\s+SEQUENCE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(${identifier})`, 'gi'), (m) => ({ kind: 'sequence', name: unquote(m[1]) })),
        ...collect(sql, new RegExp(`CREATE\\s+EXTENSION\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(${identifier})`, 'gi'), (m) => ({ kind: 'extension', name: unquote(m[1]) })),
        ...collect(sql, new RegExp(`CREATE\\s+(?:OR\\s+REPLACE\\s+)?(?:MATERIALIZED\\s+)?VIEW\\s+(${identifier})`, 'gi'), (m) => ({ kind: 'view', name: unquote(m[1]) })),
        ...collect(sql, new RegExp(`CREATE\\s+(?:OR\\s+REPLACE\\s+)?(?:FUNCTION|PROCEDURE)\\s+(${identifier})`, 'gi'), (m) => ({ kind: 'function', name: unquote(m[1]) })),
        ...collect(sql, new RegExp(`CREATE\\s+TRIGGER\\s+(${identifier})`, 'gi'), (m) => ({ kind: 'trigger', name: unquote(m[1]) })),
    ];
    return effects.filter((item, index) => effects.findIndex((candidate) => candidate.kind === item.kind && candidate.table === item.table && candidate.type === item.type && candidate.name === item.name) === index);
}

const existenceChecks = {
    table: (e) => [`SELECT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=$1 AND c.relkind IN ('r','p','v','m','f')) present`, [e.name]],
    column: (e) => [`SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=$1 AND column_name=$2) present`, [e.table, e.name]],
    type: (e) => [`SELECT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typname=$1) present`, [e.name]],
    enum_value: (e) => [`SELECT EXISTS (SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace JOIN pg_enum x ON x.enumtypid=t.oid WHERE n.nspname='public' AND t.typname=$1 AND x.enumlabel=$2) present`, [e.type, e.name]],
    index: (e) => [`SELECT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=$1 AND c.relkind='i') present`, [e.name]],
    constraint: (e) => [`SELECT EXISTS (SELECT 1 FROM pg_constraint x JOIN pg_class c ON c.oid=x.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=$1 AND x.conname=$2) present`, [e.table, e.name]],
    foreign_key_column: (e) => [`SELECT EXISTS (
        SELECT 1 FROM pg_constraint x
        JOIN pg_class c ON c.oid=x.conrelid
        JOIN pg_namespace n ON n.oid=c.relnamespace
        JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=ANY(x.conkey)
        WHERE n.nspname='public' AND c.relname=$1 AND a.attname=$2 AND x.contype='f'
    ) present`, [e.table, e.name]],
    sequence: (e) => [`SELECT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=$1 AND c.relkind='S') present`, [e.name]],
    extension: (e) => ['SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname=$1) present', [e.name]],
    view: (e) => [`SELECT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=$1 AND c.relkind IN ('v','m')) present`, [e.name]],
    function: (e) => [`SELECT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname=$1) present`, [e.name]],
    trigger: (e) => ['SELECT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname=$1 AND NOT tgisinternal) present', [e.name]],
};

async function objectExists(client, item) {
    const [query, values] = existenceChecks[item.kind](item);
    return (await client.query(query, values)).rows[0].present;
}

async function ledgerSucceeded(client, migrationName) {
    const result = await client.query(`SELECT bool_or(finished_at IS NOT NULL AND rolled_back_at IS NULL) succeeded FROM _prisma_migrations WHERE migration_name=$1`, [migrationName]);
    return result.rows[0]?.succeeded ?? false;
}

const migrationNames = (await readdir(migrationsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name < cutoff).map((entry) => entry.name).sort();
const shadow = new Client({ connectionString: shadowUrl });
const fresh = new Client({ connectionString: freshUrl });
await Promise.all([shadow.connect(), fresh.connect()]);

try {
    await Promise.all([shadow.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY'), fresh.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')]);
    const [shadowIdentityResult, freshIdentityResult] = await Promise.all([
        shadow.query('SELECT current_database() AS database_name, inet_server_addr()::text AS server_address, inet_server_port() AS server_port'),
        fresh.query('SELECT current_database() AS database_name, inet_server_addr()::text AS server_address, inet_server_port() AS server_port'),
    ]);
    const shadowIdentity = shadowIdentityResult.rows[0];
    const freshIdentity = freshIdentityResult.rows[0];
    if (expectedShadowDatabase && shadowIdentity.database_name !== expectedShadowDatabase) {
        throw new Error(`Expected shadow database ${expectedShadowDatabase}, got ${shadowIdentity.database_name}`);
    }
    if (expectedFreshDatabase && freshIdentity.database_name !== expectedFreshDatabase) {
        throw new Error(`Expected fresh database ${expectedFreshDatabase}, got ${freshIdentity.database_name}`);
    }
    const migrations = [];
    for (const migrationName of migrationNames) {
        const sql = await readFile(path.join(migrationsRoot, migrationName, 'migration.sql'), 'utf8');
        const effects = parseEffects(sql);
        if (/\b(CREATE|ALTER)\b/i.test(sql) && effects.length === 0) throw new Error(`${migrationName} contains schema DDL but produced zero auditable effects`);
        const succeeded = await ledgerSucceeded(shadow, migrationName);
        const checkedEffects = [];
        for (const item of effects) {
            const [presentInShadow, presentInFresh] = await Promise.all([objectExists(shadow, item), objectExists(fresh, item)]);
            const classification = !succeeded ? 'pending_or_failed_migration' : presentInFresh
                ? (presentInShadow ? 'present' : 'ghost_missing_in_shadow')
                : (presentInShadow ? 'shadow_only' : 'superseded_or_non_surviving');
            checkedEffects.push({ ...item, presentInShadow, presentInFresh, classification });
        }
        migrations.push({ migrationName, ledgerSucceeded: succeeded, usesIfNotExists: /IF\s+NOT\s+EXISTS/i.test(sql), parsedEffectCount: checkedEffects.length, effects: checkedEffects });
    }
    const allEffects = migrations.flatMap((migration) => migration.effects.map((item) => ({ migrationName: migration.migrationName, ...item })));
    const result = {
        auditScope: 'Migration effects are checked for object existence; exact definitions are enforced separately by compare-database-schema.mjs.',
        shadowIdentity,
        freshIdentity,
        migrationCount: migrations.length,
        parsedEffectCount: allEffects.length,
        ledgerFailures: migrations.filter((migration) => !migration.ledgerSucceeded).map((migration) => migration.migrationName),
        ifNotExistsMigrations: migrations.filter((migration) => migration.usesIfNotExists).map((migration) => migration.migrationName),
        ghosts: allEffects.filter((item) => item.classification === 'ghost_missing_in_shadow'),
        pendingOrFailedEffects: allEffects.filter((item) => item.classification === 'pending_or_failed_migration'),
        shadowOnly: allEffects.filter((item) => item.classification === 'shadow_only'),
        migrations,
    };
    if (outputPath) await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
    console.log(JSON.stringify({ migrationCount: result.migrationCount, parsedEffectCount: result.parsedEffectCount, ledgerFailures: result.ledgerFailures, ifNotExistsMigrationCount: result.ifNotExistsMigrations.length, ghostCount: result.ghosts.length, ghosts: result.ghosts, pendingOrFailedEffectCount: result.pendingOrFailedEffects.length, shadowOnlyCount: result.shadowOnly.length }, null, 2));
    await Promise.all([shadow.query('COMMIT'), fresh.query('COMMIT')]);
} finally {
    await Promise.allSettled([shadow.end(), fresh.end()]);
}
