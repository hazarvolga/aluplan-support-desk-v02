import assert from "node:assert/strict";
import test from "node:test";

import {
  APPROVED_QUEUE_NAMES,
  POSTGRES_STATEMENT_ALLOWLIST,
  REQUIRED_SELECT_TABLES,
  FORBIDDEN_COLLECTOR_FUNCTION_NAMES,
  capturePostgresSnapshot,
  captureR2Snapshot,
  captureRedisSnapshot,
} from "./release-a14b-inventory-collector.mjs";

const hmacKey = Buffer.from("run-scoped-secret-that-must-never-be-persisted");
const migrationName = "20260219151110_init_reset";
const migrationChecksum = "a".repeat(64);
const expectedMigrations = new Map([[migrationName, migrationChecksum]]);
const historicalMigrationName = "20260426202926_add_proactive_chat";
const historicalMarker = "manual-psql-fix";
const expectedRole = {
  name: "release_inventory_reader",
  expiresAt: "2026-08-13T00:00:00.000Z",
};
const expectedDatabase = "aluplan_support";
const redisTarget = "3".repeat(64);

function postgresResult(sql) {
  if (sql.includes("transaction_timestamp"))
    return { rows: [{ snapshot_at: "2026-08-12T09:00:00.000Z" }] };
  if (sql.includes("FROM pg_auth_members")) return { rows: [] };
  if (sql.includes("FROM pg_roles WHERE"))
    return {
      rows: [
        {
          role_name: expectedRole.name,
          rolcanlogin: true,
          rolinherit: false,
          rolvaliduntil: expectedRole.expiresAt,
          rolsuper: false,
          rolcreatedb: false,
          rolcreaterole: false,
          rolreplication: false,
          rolbypassrls: false,
          rolconfig: ["default_transaction_read_only=on"],
        },
      ],
    };
  if (sql.includes("FROM pg_database"))
    return {
      rows: [
        {
          database_name: expectedDatabase,
          can_connect: true,
          can_create_database: false,
          can_temporary: false,
        },
      ],
    };
  if (sql.includes("has_schema_privilege"))
    return {
      rows: [
        {
          schema_name: "public",
          can_use: true,
          can_create: false,
        },
      ],
    };
  if (sql.includes("has_function_privilege")) return { rows: [] };
  if (sql.includes("FROM pg_class c"))
    return {
      rows: REQUIRED_SELECT_TABLES.map((relation_name) => ({
        schema_name: "public",
        relation_name,
        relkind: "r",
        can_read: true,
        can_write: false,
      })),
    };
  if (sql.includes("column_privileges")) return { rows: [] };
  if (sql.includes('FROM "_prisma_migrations"'))
    return {
      rows: [
        {
          migration_name: migrationName,
          checksum: migrationChecksum,
          started_at: "2026-08-12T08:00:00.000Z",
          finished_at: "2026-08-12T08:01:00.000Z",
          rolled_back_at: null,
        },
      ],
    };
  if (sql.includes("transaction_read_only"))
    return {
      rows: [
        {
          database_name: expectedDatabase,
          server_version: "17.6",
          is_replica: false,
          transaction_read_only: "on",
          default_transaction_read_only: "on",
        },
      ],
    };
  if (sql.includes("FROM pg_extension"))
    return {
      rows: [
        { extname: "pgcrypto", extversion: "1.3" },
        { extname: "vector", extversion: "0.8.0" },
      ],
    };
  if (sql.includes("'attachment' AS source_type"))
    return {
      rows: [
        {
          source_type: "attachment",
          reference_id: "a",
          object_key: "attachments/a.pdf",
        },
      ],
    };
  if (sql.includes("COUNT(*)"))
    return { rows: [{ total: "1", failed_storage: "0" }] };
  return { rows: [] };
}

test("PostgreSQL uses one dedicated client, exact statements and rollback", async () => {
  const calls = [];
  const releases = [];
  const snapshot = await capturePostgresSnapshot({
    expectedMigrations,
    expectedRole,
    expectedDatabase,
    connect: async () => ({
      query: async ({ sql }) => {
        calls.push(sql);
        return postgresResult(sql);
      },
      release: async (options) => releases.push(options),
    }),
  });
  assert.deepEqual(calls, POSTGRES_STATEMENT_ALLOWLIST);
  assert.deepEqual(releases, [undefined]);
  assert.equal(snapshot.kind, "postgres");
  assert.ok(Object.isFrozen(snapshot.data));
  assert.equal(snapshot.data.references[0].storageKey, "attachments/a.pdf");
});

test("PostgreSQL historical marker requires explicit acknowledgement", async () => {
  const expectedHistoricalMigrations = new Map([
    [historicalMigrationName, historicalMarker],
  ]);
  const connect = async () => ({
    query: async ({ sql }) => {
      if (sql.includes('FROM "_prisma_migrations"'))
        return {
          rows: [
            {
              migration_name: historicalMigrationName,
              checksum: historicalMarker,
              started_at: "2026-08-12T08:00:00.000Z",
              finished_at: "2026-08-12T08:01:00.000Z",
              rolled_back_at: null,
            },
          ],
        };
      return postgresResult(sql);
    },
    release: async () => {},
  });

  await assert.rejects(
    capturePostgresSnapshot({
      expectedMigrations: expectedHistoricalMigrations,
      expectedRole,
      expectedDatabase,
      connect,
    }),
    /historical marker|manifest/i,
  );

  const snapshot = await capturePostgresSnapshot({
    expectedMigrations: expectedHistoricalMigrations,
    acknowledgedHistoricalMarkers: new Map([
      [historicalMigrationName, historicalMarker],
    ]),
    expectedRole,
    expectedDatabase,
    connect,
  });
  assert.deepEqual(snapshot.data.historicalLedgerMarkersAccepted, [
    {
      migration_name: historicalMigrationName,
      marker: historicalMarker,
    },
  ]);
});

test("PostgreSQL fails closed for broad grants, bad ledger and rollback failure", async () => {
  for (const variant of [
    "grant",
    "relkind",
    "other-database",
    "ledger",
    "rollback",
  ]) {
    const releases = [];
    await assert.rejects(
      capturePostgresSnapshot({
        expectedMigrations,
        expectedRole,
        expectedDatabase,
        connect: async () => ({
          query: async ({ sql }) => {
            if (variant === "rollback" && sql === "ROLLBACK")
              throw new Error("rollback failed");
            if (variant === "grant" && sql.includes("FROM pg_class c"))
              return {
                rows: [
                  ...REQUIRED_SELECT_TABLES.map((relation_name) => ({
                    schema_name: "public",
                    relation_name,
                    relkind: "r",
                    can_read: true,
                    can_write: false,
                  })),
                  {
                    schema_name: "audit",
                    relation_name: "users",
                    relkind: "v",
                    can_read: true,
                    can_write: false,
                  },
                ],
              };
            if (variant === "relkind" && sql.includes("FROM pg_class c")) {
              const result = postgresResult(sql);
              result.rows[0].relkind = "v";
              return result;
            }
            if (
              variant === "other-database" &&
              sql.includes("FROM pg_database")
            )
              return {
                rows: [
                  ...postgresResult(sql).rows,
                  {
                    database_name: "postgres",
                    can_connect: true,
                    can_create_database: false,
                    can_temporary: false,
                  },
                ],
              };
            if (
              variant === "ledger" &&
              sql.includes('FROM "_prisma_migrations"')
            )
              return {
                rows: [
                  {
                    migration_name: migrationName,
                    checksum: "wrong",
                    started_at: "2026-08-12T08:00:00.000Z",
                    finished_at: "2026-08-12T08:01:00.000Z",
                    rolled_back_at: null,
                  },
                ],
              };
            return postgresResult(sql);
          },
          release: async (options) => releases.push(options),
        }),
      }),
      /grant|privilege|ledger|rollback/i,
    );
    assert.equal(releases.length, 1);
    if (variant === "rollback") assert.equal(releases[0], true);
  }
});

test("PostgreSQL risky-function probe stays aligned with the A.1.4 denylist", () => {
  const required = [
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
  ];
  assert.deepEqual(FORBIDDEN_COLLECTOR_FUNCTION_NAMES, required);
  for (const name of required)
    assert.ok(
      POSTGRES_STATEMENT_ALLOWLIST.every(
        (sql) => !new RegExp(`\\b${name}\\s*\\(`, "i").test(sql),
      ),
    );
});

test("PostgreSQL rejects unsafe expiry, column grants and ambiguous BEGIN failures", async () => {
  const variants = ["expired", "too-long", "column-grant", "begin"];
  for (const variant of variants) {
    const calls = [];
    const releases = [];
    await assert.rejects(
      capturePostgresSnapshot({
        expectedMigrations,
        expectedRole: {
          ...expectedRole,
          ...(variant === "expired"
            ? { expiresAt: "2026-08-12T08:59:59.000Z" }
            : {}),
          ...(variant === "too-long"
            ? { expiresAt: "2026-08-14T09:00:01.000Z" }
            : {}),
        },
        expectedDatabase,
        connect: async () => ({
          query: async ({ sql }) => {
            calls.push(sql);
            if (variant === "begin" && sql.startsWith("BEGIN"))
              throw new Error("ambiguous begin failure");
            if (variant === "column-grant" && sql.includes("column_privileges"))
              return {
                rows: [
                  {
                    table_schema: "public",
                    table_name: "attachments",
                    column_name: "url",
                    privilege_type: "SELECT",
                    grantee: expectedRole.name,
                  },
                ],
              };
            const result = postgresResult(sql);
            if (
              sql.includes("FROM pg_roles WHERE") &&
              variant !== "column-grant"
            )
              result.rows[0].rolvaliduntil =
                variant === "expired"
                  ? "2026-08-12T08:59:59.000Z"
                  : variant === "too-long"
                    ? "2026-08-14T09:00:01.000Z"
                    : expectedRole.expiresAt;
            return result;
          },
          release: async (options) => releases.push(options),
        }),
      }),
      /privilege|read operation/i,
    );
    assert.equal(releases.length, 1);
    if (variant === "begin") assert.ok(calls.includes("ROLLBACK"));
  }
});

test("PostgreSQL accepts a canonical Date expiry and rejects non-public schema breadth", async () => {
  const snapshot = await capturePostgresSnapshot({
    expectedMigrations,
    expectedRole,
    expectedDatabase,
    connect: async () => ({
      query: async ({ sql }) => {
        const result = postgresResult(sql);
        if (sql.startsWith("SELECT current_user AS role_name"))
          result.rows[0].rolvaliduntil = new Date(expectedRole.expiresAt);
        return result;
      },
      release: async () => {},
    }),
  });
  assert.equal(snapshot.data.role[0].rolvaliduntil, expectedRole.expiresAt);
});

test("PostgreSQL redacts connection failures and bounds evidence rows", async () => {
  await assert.rejects(
    capturePostgresSnapshot({
      expectedMigrations,
      expectedRole,
      expectedDatabase,
      connect: async () => {
        throw new Error("postgres://user:secret@example/db");
      },
    }),
    (error) =>
      /connection failed/i.test(error.message) &&
      !error.message.includes("secret"),
  );
  await assert.rejects(
    capturePostgresSnapshot({
      expectedMigrations,
      expectedRole,
      expectedDatabase,
      maxReferenceRows: 0,
      connect: async () => ({}),
    }),
    /budget/i,
  );
  await assert.rejects(
    capturePostgresSnapshot({
      expectedMigrations,
      expectedRole,
      expectedDatabase,
      connect: async () => ({
        query: async ({ sql }) => postgresResult(sql),
        release: async () => {
          throw new Error("sensitive release error");
        },
      }),
    }),
    (error) =>
      /release failed/i.test(error.message) &&
      !error.message.includes("sensitive"),
  );
  let released;
  const controller = new AbortController();
  await assert.rejects(
    capturePostgresSnapshot({
      expectedMigrations,
      expectedRole,
      expectedDatabase,
      signal: controller.signal,
      connect: async () => {
        controller.abort();
        return {
          query: async () => ({ rows: [] }),
          release: async (destroy) => {
            released = destroy;
          },
        };
      },
    }),
    /connection failed/i,
  );
  assert.equal(released, true);
  let invalidReleased;
  await assert.rejects(
    capturePostgresSnapshot({
      expectedMigrations,
      expectedRole,
      expectedDatabase,
      connect: async () => ({
        release: async (destroy) => {
          invalidReleased = destroy;
        },
      }),
    }),
    /client contract/i,
  );
  assert.equal(invalidReleased, true);
});

test("R2 exhausts pagination, HEAD-checks every object and rejects incomplete metadata", async () => {
  const calls = [];
  const snapshot = await captureR2Snapshot({
    bucket: "support-bucket",
    expectedBucket: "support-bucket",
    invoke: async (request) => {
      calls.push(request);
      if (request.operation === "ListObjectsV2")
        return request.continuationToken
          ? {
              objects: [{ key: "attachments/b.pdf", size: 2, etag: "e2" }],
              isTruncated: false,
            }
          : {
              objects: [{ key: "attachments/a.pdf", size: 1, etag: "e1" }],
              isTruncated: true,
              nextContinuationToken: "next",
            };
      return {
        ContentLength: request.key.endsWith("a.pdf") ? 1 : 2,
        ETag: request.key.endsWith("a.pdf") ? "e1" : "e2",
        LastModified: "2026-08-12T09:00:00.000Z",
      };
    },
  });
  assert.equal(snapshot.data.objects.length, 2);
  assert.equal(
    snapshot.data.objects[0].lastModified,
    "2026-08-12T09:00:00.000Z",
  );
  assert.equal(
    calls.filter((call) => call.operation === "HeadObject").length,
    2,
  );
  await assert.rejects(
    captureR2Snapshot({
      bucket: "support-bucket",
      expectedBucket: "support-bucket",
      invoke: async ({ operation }) =>
        operation === "ListObjectsV2"
          ? {
              objects: [
                { key: "a", size: 1, lastModified: "2026-08-12T09:00:00.000Z" },
              ],
              isTruncated: false,
            }
          : {},
    }),
    /metadata/i,
  );
  await assert.rejects(
    captureR2Snapshot({
      bucket: "support-bucket",
      expectedBucket: "support-bucket",
      invoke: async ({ operation }) =>
        operation === "ListObjectsV2"
          ? {
              objects: [
                {
                  key: "attachments/invalid-date.pdf",
                  size: 1,
                  etag: "invalid-date",
                  lastModified: "2026-99-99T99:99:99.999Z",
                },
              ],
              isTruncated: false,
            }
          : {
              ContentLength: 1,
              ETag: "invalid-date",
              LastModified: "2026-99-99T99:99:99.999Z",
            },
    }),
    /timestamp/i,
  );
  await assert.rejects(
    captureR2Snapshot({
      bucket: "wrong",
      expectedBucket: "support-bucket",
      invoke: async () => ({}),
    }),
    /target/i,
  );
  await assert.rejects(
    captureR2Snapshot({
      bucket: "support-bucket",
      expectedBucket: "support-bucket",
      invoke: async ({ operation }) =>
        operation === "ListObjectsV2"
          ? {
              objects: [],
              isTruncated: true,
              nextContinuationToken: "x".repeat(4097),
            }
          : {},
    }),
    /token/i,
  );
  await assert.rejects(
    captureR2Snapshot({
      bucket: "support-bucket",
      expectedBucket: "support-bucket",
      invoke: async ({ operation }) =>
        operation === "ListObjectsV2"
          ? {
              objects: [],
              isTruncated: false,
              nextContinuationToken: "unexpected",
            }
          : {},
    }),
    /contradictory/i,
  );
  await assert.rejects(
    captureR2Snapshot({
      bucket: "support-bucket",
      expectedBucket: "support-bucket",
      maxMetadataBytes: 1,
      invoke: async () => ({}),
    }),
    /budget/i,
  );
});

function redisResponse({ command, args }) {
  const suffix = args[0]?.split(":").at(-1);
  if (command === "TYPE")
    return ["wait", "active", "paused"].includes(suffix)
      ? "list"
      : suffix === "stalled"
        ? "set"
        : "zset";
  if (command === "INFO")
    return args[0] === "persistence"
      ? "loading:0\nrdb_bgsave_in_progress:0\nrdb_last_bgsave_status:ok\naof_enabled:1\naof_rewrite_in_progress:0\naof_last_bgrewrite_status:ok"
      : "evicted_keys:0\ntotal_error_replies:0";
  if (command === "CONFIG")
    return [args[1], args[1] === "maxmemory" ? "0" : "noeviction"];
  if (["LRANGE", "ZRANGE"].includes(command)) return [];
  return 0;
}

test("Redis reads exact known keys, validates types and never persists raw identifiers", async () => {
  const calls = [];
  const snapshot = await captureRedisSnapshot({
    prefix: "bull",
    queues: APPROVED_QUEUE_NAMES,
    hmacKey,
    targetFingerprint: redisTarget,
    expectedTargetFingerprint: redisTarget,
    send: async (request) => {
      calls.push(request);
      return redisResponse(request);
    },
  });
  assert.equal(snapshot.kind, "redis");
  assert.equal(snapshot.scope, "exact-known-keys");
  assert.equal(snapshot.data.keys.length, 90);
  assert.ok(
    !calls.some((call) =>
      ["SCAN", "KEYS", "EVAL", "EVALSHA"].includes(call.command),
    ),
  );
  await assert.rejects(
    captureRedisSnapshot({
      prefix: "bull",
      queues: APPROVED_QUEUE_NAMES,
      hmacKey,
      targetFingerprint: redisTarget,
      expectedTargetFingerprint: redisTarget,
      send: async (request) =>
        request.command === "TYPE" ? "hash" : redisResponse(request),
    }),
    /type/i,
  );
  await assert.rejects(
    captureRedisSnapshot({
      prefix: "bull",
      queues: APPROVED_QUEUE_NAMES,
      hmacKey,
      targetFingerprint: "4".repeat(64),
      expectedTargetFingerprint: redisTarget,
      send: redisResponse,
    }),
    /target/i,
  );
  await assert.rejects(
    captureRedisSnapshot({
      prefix: "bull",
      queues: APPROVED_QUEUE_NAMES,
      hmacKey,
      targetFingerprint: redisTarget,
      expectedTargetFingerprint: redisTarget,
      send: async ({ command, args }) =>
        command === "INFO"
          ? args[0] === "persistence"
            ? "loading:banana\nrdb_bgsave_in_progress:0\nrdb_last_bgsave_status:ok\naof_enabled:1\naof_rewrite_in_progress:0\naof_last_bgrewrite_status:ok"
            : "evicted_keys:0\ntotal_error_replies:0"
          : redisResponse({ command, args }),
    }),
    /metadata/i,
  );
  await assert.rejects(
    captureRedisSnapshot({
      prefix: "bull",
      queues: APPROVED_QUEUE_NAMES,
      hmacKey,
      targetFingerprint: redisTarget,
      expectedTargetFingerprint: redisTarget,
      send: async ({ command, args }) =>
        command === "CONFIG" && args[1] === "maxmemory-policy"
          ? [args[1], "banana"]
          : redisResponse({ command, args }),
    }),
    /policy/i,
  );
});

test("Redis repeatable jobs preserve bounded schedule evidence without raw IDs", async () => {
  const rawRepeatId = "repeat:nightly:customer-secret";
  const snapshot = await captureRedisSnapshot({
    prefix: "bull",
    queues: APPROVED_QUEUE_NAMES,
    hmacKey,
    targetFingerprint: redisTarget,
    expectedTargetFingerprint: redisTarget,
    send: async (request) => {
      const suffix = request.args[0]?.split(":").at(-1);
      if (request.command === "TYPE")
        return ["wait", "active", "paused"].includes(suffix)
          ? "list"
          : suffix === "stalled"
            ? "set"
            : "zset";
      if (request.command === "ZCARD" && suffix === "repeat") return 1;
      if (request.command === "ZRANGE" && suffix === "repeat") {
        assert.deepEqual(request.args.slice(1), ["0", "99", "WITHSCORES"]);
        return [rawRepeatId, "1780000000000"];
      }
      return redisResponse(request);
    },
  });
  const repeat = snapshot.data.keys.find(
    (item) => item.queue === "email" && item.kind === "repeat",
  );
  assert.equal(repeat.count, 1);
  assert.match(repeat.entries[0].scheduleFingerprint, /^[0-9a-f]{64}$/);
  assert.match(repeat.entries[0].identifierFingerprint, /^[0-9a-f]{64}$/);
  assert.doesNotMatch(JSON.stringify(snapshot), /customer-secret/);
});
