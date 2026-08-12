import {
  assertCanonicalTimestamp,
  deepFreeze,
  digestValue,
} from "./contracts.mjs";
import { classifyStorageReference } from "./storage-reference-classifier.mjs";

export const REQUIRED_SELECT_TABLES = Object.freeze([
  "_prisma_migrations",
  "attachments",
  "knowledge_sources",
  "settings",
]);

// These names are forbidden to the collector by the exact SQL invocation
// allowlist. They are not a role-level zero-EXECUTE requirement: PostgreSQL
// grants EXECUTE on many built-ins to PUBLIC and some add internal privilege
// checks. Revoking PUBLIC would be a broad production mutation.
export const FORBIDDEN_COLLECTOR_FUNCTION_NAMES = Object.freeze([
  "lo_export",
  "lo_import",
  "lo_unlink",
  "nextval",
  "pg_cancel_backend",
  "pg_log_backend_memory_contexts",
  "pg_ls_dir",
  "pg_read_binary_file",
  "pg_read_file",
  "pg_reload_conf",
  "pg_rotate_logfile",
  "pg_sleep",
  "pg_stat_file",
  "pg_terminate_backend",
  "query_to_xml",
  "set_config",
]);

export const POSTGRES_STATEMENT_ALLOWLIST = Object.freeze([
  "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY",
  "SET LOCAL statement_timeout = 30000",
  "SET LOCAL lock_timeout = 2000",
  "SET LOCAL idle_in_transaction_session_timeout = 30000",
  "SELECT transaction_timestamp() AS snapshot_at",
  "SELECT current_user AS role_name, rolcanlogin, rolinherit, rolvaliduntil, rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls, COALESCE(rolconfig, ARRAY[]::text[]) AS rolconfig FROM pg_roles WHERE rolname = current_user",
  "SELECT roleid::regrole::text AS granted_role FROM pg_auth_members WHERE member = (SELECT oid FROM pg_roles WHERE rolname = current_user) ORDER BY granted_role",
  "SELECT datname AS database_name, has_database_privilege(current_user, datname, 'CONNECT') AS can_connect, has_database_privilege(current_user, datname, 'CREATE') AS can_create_database, has_database_privilege(current_user, datname, 'TEMPORARY') AS can_temporary FROM pg_database WHERE datallowconn = TRUE AND (has_database_privilege(current_user, datname, 'CONNECT') OR has_database_privilege(current_user, datname, 'CREATE') OR has_database_privilege(current_user, datname, 'TEMPORARY')) ORDER BY datname",
  "SELECT n.nspname AS schema_name, has_schema_privilege(current_user, n.oid, 'USAGE') AS can_use, has_schema_privilege(current_user, n.oid, 'CREATE') AS can_create FROM pg_namespace n WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema' AND (has_schema_privilege(current_user, n.oid, 'USAGE') OR has_schema_privilege(current_user, n.oid, 'CREATE')) ORDER BY n.nspname",
  "SELECT p.oid::regprocedure::text AS function_signature FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema' AND has_function_privilege(current_user, p.oid, 'EXECUTE') ORDER BY function_signature",
  "SELECT n.nspname AS schema_name, c.relname AS relation_name, c.relkind, CASE WHEN c.relkind = 'S' THEN has_sequence_privilege(current_user, c.oid, 'USAGE') ELSE has_table_privilege(current_user, c.oid, 'SELECT') END AS can_read, CASE WHEN c.relkind = 'S' THEN has_sequence_privilege(current_user, c.oid, 'UPDATE') ELSE (has_table_privilege(current_user, c.oid, 'INSERT') OR has_table_privilege(current_user, c.oid, 'UPDATE') OR has_table_privilege(current_user, c.oid, 'DELETE') OR has_table_privilege(current_user, c.oid, 'TRUNCATE') OR has_table_privilege(current_user, c.oid, 'REFERENCES') OR has_table_privilege(current_user, c.oid, 'TRIGGER')) END AS can_write FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname <> 'information_schema' AND c.relkind IN ('r','p','v','m','f','S') AND (CASE WHEN c.relkind = 'S' THEN (has_sequence_privilege(current_user, c.oid, 'USAGE') OR has_sequence_privilege(current_user, c.oid, 'SELECT') OR has_sequence_privilege(current_user, c.oid, 'UPDATE')) ELSE (has_table_privilege(current_user, c.oid, 'SELECT') OR has_table_privilege(current_user, c.oid, 'INSERT') OR has_table_privilege(current_user, c.oid, 'UPDATE') OR has_table_privilege(current_user, c.oid, 'DELETE') OR has_table_privilege(current_user, c.oid, 'TRUNCATE') OR has_table_privilege(current_user, c.oid, 'REFERENCES') OR has_table_privilege(current_user, c.oid, 'TRIGGER')) END) ORDER BY n.nspname, c.relname",
  "SELECT table_schema, table_name, column_name, privilege_type, grantee FROM information_schema.column_privileges WHERE grantee IN (current_user, 'PUBLIC') ORDER BY table_schema, table_name, column_name, privilege_type, grantee",
  'SELECT migration_name, checksum, started_at, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at ASC',
  "SELECT current_database() AS database_name, current_setting('server_version') AS server_version, pg_is_in_recovery() AS is_replica, current_setting('transaction_read_only') AS transaction_read_only, current_setting('default_transaction_read_only') AS default_transaction_read_only",
  "SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'pgcrypto') ORDER BY extname",
  "SELECT 'attachment' AS source_type, id::text AS reference_id, url AS object_key, file_size FROM attachments WHERE deleted_at IS NULL AND url NOT LIKE 'FAILED_STORAGE_UPLOAD_%' ORDER BY id",
  "SELECT 'failed-storage-marker' AS source_type, id::text AS reference_id, url AS object_key FROM attachments WHERE deleted_at IS NULL AND url LIKE 'FAILED_STORAGE_UPLOAD_%' ORDER BY id",
  "SELECT 'knowledge-source' AS source_type, id::text AS reference_id, file_path AS object_key FROM knowledge_sources WHERE file_path IS NOT NULL ORDER BY id",
  "SELECT 'branding-logo' AS source_type, id::text AS reference_id, value AS object_key FROM settings WHERE key = 'branding.logo_url' AND is_secret = FALSE ORDER BY id",
  "SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE url LIKE 'FAILED_STORAGE_UPLOAD_%') AS failed_storage FROM attachments",
  "ROLLBACK",
]);

const ALLOWED = new Set(POSTGRES_STATEMENT_ALLOWLIST);
const issuedSnapshots = new WeakSet();

export function assertIssuedPostgresSnapshot(snapshot) {
  if (!issuedSnapshots.has(snapshot))
    throw new Error(
      "PostgreSQL snapshot was not issued by the reviewed adapter",
    );
  return snapshot;
}

export function assertPostgresStatementAllowed(sql) {
  if (typeof sql !== "string" || !ALLOWED.has(sql)) {
    throw new Error(
      "Statement is outside the exact PostgreSQL statement allowlist",
    );
  }
  return sql;
}

function rows(result) {
  if (!result || !Array.isArray(result.rows))
    throw new Error("Invalid PostgreSQL result");
  return result.rows;
}

function validatePrivileges(
  roleRows,
  membershipRows,
  publicRows,
  schemaRows,
  functionRows,
  grantRows,
  columnGrantRows,
  expectedRole,
  observedAt,
) {
  const role = roleRows[0];
  const expiry =
    role?.rolvaliduntil instanceof Date
      ? role.rolvaliduntil.toISOString()
      : role?.rolvaliduntil;
  assertCanonicalTimestamp(expectedRole.expiresAt, "expected role expiry");
  assertCanonicalTimestamp(observedAt, "PostgreSQL observedAt");
  assertCanonicalTimestamp(expiry, "PostgreSQL role expiry");
  const observedTime = Date.parse(observedAt);
  const expiryTime = Date.parse(expiry);
  if (
    !role ||
    roleRows.length !== 1 ||
    role.role_name !== expectedRole.name ||
    role.rolcanlogin !== true ||
    role.rolinherit !== false ||
    expiry !== expectedRole.expiresAt ||
    Number.isNaN(observedTime) ||
    Number.isNaN(expiryTime) ||
    expiryTime <= observedTime ||
    expiryTime - observedTime > 24 * 60 * 60 * 1000 ||
    role.rolsuper !== false ||
    role.rolcreatedb !== false ||
    role.rolcreaterole !== false ||
    role.rolreplication !== false ||
    role.rolbypassrls !== false ||
    !Array.isArray(role.rolconfig) ||
    JSON.stringify([...role.rolconfig].sort()) !==
      JSON.stringify(["default_transaction_read_only=on"]) ||
    membershipRows.length !== 0 ||
    publicRows.length !== 1 ||
    publicRows[0]?.database_name !== expectedRole.database ||
    publicRows[0]?.can_connect !== true ||
    publicRows[0]?.can_create_database !== false ||
    publicRows[0]?.can_temporary !== false ||
    schemaRows.length !== 1 ||
    schemaRows[0]?.schema_name !== "public" ||
    schemaRows[0]?.can_use !== true ||
    schemaRows[0]?.can_create !== false ||
    functionRows.length !== 0 ||
    columnGrantRows.length !== 0
  ) {
    throw new Error(
      "PostgreSQL collector role has broader effective privileges",
    );
  }
  const normalized = grantRows
    .map((row) => `${row.schema_name}.${row.relation_name}:${row.relkind}`)
    .sort();
  const expected = REQUIRED_SELECT_TABLES.map(
    (table) => `public.${table}:r`,
  ).sort();
  if (
    JSON.stringify(normalized) !== JSON.stringify(expected) ||
    grantRows.some((row) => row.can_read !== true || row.can_write !== false)
  ) {
    throw new Error("PostgreSQL collector table grants are not exact");
  }
}

function validateLedger(ledger, expectedMigrations) {
  if (!(expectedMigrations instanceof Map) || expectedMigrations.size === 0) {
    throw new Error("Expected migration manifest is required");
  }
  if (expectedMigrations.size > 1000)
    throw new Error("Expected migration manifest exceeds its row budget");
  for (const [name, checksum] of expectedMigrations) {
    const checksumIsValid =
      /^[0-9a-f]{64}$/.test(checksum) ||
      (name === "20260426202926_add_proactive_chat" &&
        checksum === "manual-psql-fix");
    if (!/^(?:0|\d{14})_[a-z0-9_]{1,180}$/.test(name) || !checksumIsValid)
      throw new Error("Expected migration manifest entry is invalid");
  }
  const seen = new Set();
  for (const row of ledger) {
    if (!row || seen.has(row.migration_name))
      throw new Error("Duplicate migration ledger row");
    seen.add(row.migration_name);
    const startedAt =
      row?.started_at instanceof Date
        ? row.started_at.toISOString()
        : row?.started_at;
    const finishedAt =
      row?.finished_at instanceof Date
        ? row.finished_at.toISOString()
        : row?.finished_at;
    if (
      typeof row.migration_name !== "string" ||
      typeof row.checksum !== "string" ||
      !startedAt ||
      !finishedAt ||
      row.rolled_back_at ||
      expectedMigrations.get(row.migration_name) !== row.checksum
    ) {
      throw new Error(
        "Migration ledger is failed, unknown, or checksum-drifted",
      );
    }
    assertCanonicalTimestamp(startedAt, "migration startedAt");
    assertCanonicalTimestamp(finishedAt, "migration finishedAt");
    if (finishedAt < startedAt)
      throw new Error("Migration ledger timestamps are contradictory");
  }
  if (
    seen.size !== expectedMigrations.size ||
    [...expectedMigrations.keys()].some((name) => !seen.has(name))
  ) {
    throw new Error("Migration ledger does not match the expected manifest");
  }
}

export async function capturePostgresSnapshot({
  connect,
  signal,
  expectedMigrations,
  expectedRole,
  expectedDatabase,
  maxReferenceRows = 250000,
}) {
  const migrationManifest =
    expectedMigrations instanceof Map
      ? new Map(expectedMigrations)
      : expectedMigrations;
  const roleExpectation = expectedRole ? { ...expectedRole } : expectedRole;
  if (typeof connect !== "function")
    throw new Error("Dedicated PostgreSQL connect adapter is required");
  if (
    signal &&
    (typeof signal.aborted !== "boolean" ||
      typeof signal.throwIfAborted !== "function")
  )
    throw new Error("PostgreSQL AbortSignal contract is invalid");
  if (!roleExpectation?.name || !roleExpectation?.expiresAt)
    throw new Error(
      "Expected PostgreSQL role identity and expiry are required",
    );
  if (!expectedDatabase)
    throw new Error("Expected PostgreSQL database identity is required");
  if (
    Object.keys(roleExpectation).some(
      (key) => !["name", "expiresAt"].includes(key),
    ) ||
    !/^[a-z_][a-z0-9_]{0,62}$/.test(roleExpectation.name) ||
    !/^[a-z_][a-z0-9_]{0,62}$/.test(expectedDatabase)
  )
    throw new Error("Expected PostgreSQL identity is invalid");
  assertCanonicalTimestamp(roleExpectation.expiresAt, "expected role expiry");
  const roleContract = { ...roleExpectation, database: expectedDatabase };
  if (
    !Number.isInteger(maxReferenceRows) ||
    maxReferenceRows < 1 ||
    maxReferenceRows > 1000000
  )
    throw new Error("PostgreSQL reference budget is invalid");
  let client;
  try {
    signal?.throwIfAborted();
    client = await connect({ signal });
    signal?.throwIfAborted();
  } catch {
    if (client?.release) {
      try {
        await client.release(true);
      } catch {
        // The connection is already being discarded; never expose driver data.
      }
    }
    throw new Error("Dedicated PostgreSQL connection failed");
  }
  if (
    !client ||
    typeof client.query !== "function" ||
    typeof client.release !== "function"
  ) {
    if (client?.release) {
      try {
        await client.release(true);
      } catch {
        // Discard failure is redacted below.
      }
    }
    throw new Error("Dedicated PostgreSQL client contract is invalid");
  }
  const call = async (sql) => {
    try {
      signal?.throwIfAborted();
      const result = await client.query({
        sql: assertPostgresStatementAllowed(sql),
        signal,
      });
      signal?.throwIfAborted();
      return result;
    } catch {
      throw new Error("PostgreSQL read operation failed");
    }
  };
  let started = false;
  let rollbackFailed = false;
  try {
    started = true;
    await call(POSTGRES_STATEMENT_ALLOWLIST[0]);
    await call(POSTGRES_STATEMENT_ALLOWLIST[1]);
    await call(POSTGRES_STATEMENT_ALLOWLIST[2]);
    await call(POSTGRES_STATEMENT_ALLOWLIST[3]);
    const snapshotAt = rows(await call(POSTGRES_STATEMENT_ALLOWLIST[4]));
    if (snapshotAt.length !== 1)
      throw new Error("PostgreSQL snapshot timestamp is invalid");
    const observedAt =
      snapshotAt[0]?.snapshot_at instanceof Date
        ? snapshotAt[0].snapshot_at.toISOString()
        : snapshotAt[0]?.snapshot_at;
    const role = rows(await call(POSTGRES_STATEMENT_ALLOWLIST[5]));
    const memberships = rows(await call(POSTGRES_STATEMENT_ALLOWLIST[6]));
    const publicPrivileges = rows(await call(POSTGRES_STATEMENT_ALLOWLIST[7]));
    const schemaPrivileges = rows(await call(POSTGRES_STATEMENT_ALLOWLIST[8]));
    const functions = rows(await call(POSTGRES_STATEMENT_ALLOWLIST[9]));
    const grants = rows(await call(POSTGRES_STATEMENT_ALLOWLIST[10]));
    const columnGrants = rows(await call(POSTGRES_STATEMENT_ALLOWLIST[11]));
    validatePrivileges(
      role,
      memberships,
      publicPrivileges,
      schemaPrivileges,
      functions,
      grants,
      columnGrants,
      roleContract,
      observedAt,
    );
    const ledger = rows(await call(POSTGRES_STATEMENT_ALLOWLIST[12]));
    validateLedger(ledger, migrationManifest);
    const runtime = rows(await call(POSTGRES_STATEMENT_ALLOWLIST[13]));
    if (
      runtime[0]?.transaction_read_only !== "on" ||
      runtime[0]?.database_name !== expectedDatabase ||
      runtime[0]?.default_transaction_read_only !== "on" ||
      runtime[0]?.is_replica !== false ||
      typeof runtime[0]?.server_version !== "string" ||
      !runtime[0].server_version.startsWith("17.")
    )
      throw new Error(
        "PostgreSQL target identity or read-only mode is invalid",
      );
    const extensions = rows(await call(POSTGRES_STATEMENT_ALLOWLIST[14]));
    const extensionNames = extensions.map((row) => row.extname).sort();
    if (
      JSON.stringify(extensionNames) !==
        JSON.stringify(["pgcrypto", "vector"]) ||
      extensions.some(
        (row) => typeof row.extversion !== "string" || !row.extversion,
      )
    )
      throw new Error("PostgreSQL extension inventory is incomplete");
    const rawReferences = [];
    for (const sql of POSTGRES_STATEMENT_ALLOWLIST.slice(15, 19)) {
      rawReferences.push(...rows(await call(sql)));
      if (rawReferences.length > maxReferenceRows)
        throw new Error("PostgreSQL reference budget exceeded");
    }
    const countRows = rows(await call(POSTGRES_STATEMENT_ALLOWLIST[19]));
    if (
      countRows.length !== 1 ||
      !/^\d+$/.test(String(countRows[0]?.total ?? "")) ||
      !/^\d+$/.test(String(countRows[0]?.failed_storage ?? ""))
    )
      throw new Error("PostgreSQL count evidence is invalid");
    const references = rawReferences.map(classifyStorageReference);
    const normalizedRole = [
      {
        role_name: role[0].role_name,
        rolvaliduntil:
          role[0].rolvaliduntil instanceof Date
            ? role[0].rolvaliduntil.toISOString()
            : role[0].rolvaliduntil,
        rolconfig: [...role[0].rolconfig].sort(),
      },
    ];
    const normalizedLedger = ledger.map((row) => ({
      migration_name: row.migration_name,
      checksum: row.checksum,
      started_at:
        row.started_at instanceof Date
          ? row.started_at.toISOString()
          : String(row.started_at),
      finished_at:
        row.finished_at instanceof Date
          ? row.finished_at.toISOString()
          : String(row.finished_at),
      rolled_back_at: null,
    }));
    const normalizedRuntime = [
      {
        database_name: runtime[0].database_name,
        server_version: runtime[0].server_version,
        is_replica: false,
        transaction_read_only: "on",
        default_transaction_read_only: "on",
      },
    ];
    const normalizedExtensions = extensions
      .map((row) => ({ extname: row.extname, extversion: row.extversion }))
      .sort((a, b) => a.extname.localeCompare(b.extname));
    const counts = [
      {
        total: String(countRows[0].total),
        failed_storage: String(countRows[0].failed_storage),
      },
    ];
    const data = {
      role: normalizedRole,
      ledger: normalizedLedger,
      runtime: normalizedRuntime,
      extensions: normalizedExtensions,
      references,
      counts,
    };
    const snapshot = {
      kind: "postgres",
      status: "complete",
      scope: "dedicated-repeatable-read",
      contractSha256: digestValue(POSTGRES_STATEMENT_ALLOWLIST),
      observedAt,
      digest: digestValue(data),
      data,
    };
    const closedSnapshot = deepFreeze(snapshot);
    issuedSnapshots.add(closedSnapshot);
    return closedSnapshot;
  } finally {
    if (started) {
      try {
        await call("ROLLBACK");
      } catch {
        rollbackFailed = true;
      }
    }
    try {
      await client.release(rollbackFailed ? true : undefined);
    } catch {
      throw new Error("PostgreSQL client release failed");
    }
    if (rollbackFailed)
      throw new Error("PostgreSQL rollback failed; connection discarded");
  }
}
