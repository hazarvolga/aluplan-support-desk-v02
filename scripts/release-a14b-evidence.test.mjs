import assert from "node:assert/strict";
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
} from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

import {
  APPROVED_EVIDENCE_ROOT,
  APPROVED_QUEUE_NAMES,
  REQUIRED_SELECT_TABLES,
  capturePostgresSnapshot,
  captureR2Snapshot,
  captureRedisSnapshot,
  collectA14bInventory,
  digestValue,
  publishEvidenceBundle,
} from "./release-a14b-inventory-collector.mjs";

const project = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const approvedRoot = APPROVED_EVIDENCE_ROOT;
const hmacKey = Buffer.from("run-scoped-secret-that-must-never-be-persisted");
const migrationName = "20260219151110_init_reset";
const migrationChecksum = "a".repeat(64);
const runContext = {
  mode: "offline",
  runId: "a14b-local-proof",
  gitSha: "1".repeat(40),
  contractSha256: "2".repeat(64),
};

function adapters({ drift, missing, omitR2Object = false } = {}) {
  const order = [];
  let r2Calls = 0;
  let pgCalls = 0;
  const expectedRole = {
    name: "release_inventory_reader",
    expiresAt: "2026-08-13T00:00:00.000Z",
  };
  const redisTarget = "3".repeat(64);
  const result = {
    postgres: {
      capture: async ({ signal }) => {
        order.push("postgres");
        if (missing === "postgres") return { status: "incomplete" };
        return capturePostgresSnapshot({
          expectedMigrations: new Map([[migrationName, migrationChecksum]]),
          expectedRole,
          expectedDatabase: "aluplan_support",
          signal,
          connect: async ({ signal: connectionSignal }) => ({
            release: async () => {},
            query: async ({ sql, signal: querySignal }) => {
              assert.equal(connectionSignal, signal);
              assert.equal(querySignal, signal);
              if (sql.includes("transaction_timestamp")) {
                pgCalls += 1;
                return {
                  rows: [{ snapshot_at: `2026-08-12T09:00:0${pgCalls}.000Z` }],
                };
              }
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
                      database_name: "aluplan_support",
                      can_connect: true,
                      can_create_database: false,
                      can_temporary: false,
                    },
                  ],
                };
              if (sql.includes("has_schema_privilege"))
                return {
                  rows: [
                    { schema_name: "public", can_use: true, can_create: false },
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
                      database_name: "aluplan_support",
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
                      reference_id: "record-a",
                      object_key: "attachments/a.pdf",
                    },
                  ],
                };
              if (sql.includes("'failed-storage-marker' AS source_type"))
                return {
                  rows: [
                    {
                      source_type: "failed-storage-marker",
                      reference_id: "record-f",
                      object_key: "FAILED_STORAGE_UPLOAD_f",
                    },
                  ],
                };
              if (sql.includes("'knowledge-source' AS source_type"))
                return {
                  rows: [
                    {
                      source_type: "knowledge-source",
                      reference_id: "record-k",
                      object_key: "/data/source.pdf",
                    },
                  ],
                };
              if (sql.includes("'branding-logo' AS source_type"))
                return {
                  rows: [
                    {
                      source_type: "branding-logo",
                      reference_id: "record-b",
                      object_key: "/api/v1/branding/assets/brand/logo.png",
                    },
                  ],
                };
              if (sql.includes("COUNT(*)"))
                return { rows: [{ total: "1", failed_storage: "0" }] };
              return { rows: [] };
            },
          }),
        });
      },
    },
    r2: {
      capture: async ({ signal }) => {
        order.push("r2");
        r2Calls += 1;
        const empty = omitR2Object || (drift === "r2" && r2Calls === 2);
        return captureR2Snapshot({
          bucket: "support-bucket",
          expectedBucket: "support-bucket",
          signal,
          invoke: async ({ operation, key, signal: requestSignal }) => {
            assert.equal(requestSignal, signal);
            return operation === "ListObjectsV2"
              ? {
                  objects: empty
                    ? []
                    : [
                        { key: "attachments/a.pdf", size: 1, etag: "e1" },
                        { key: "brand/logo.png", size: 2, etag: "e2" },
                        {
                          key: "tickets/unreferenced.bin",
                          size: 3,
                          etag: "e3",
                        },
                      ],
                  isTruncated: false,
                }
              : {
                  ContentLength:
                    key === "attachments/a.pdf"
                      ? 1
                      : key === "brand/logo.png"
                        ? 2
                        : 3,
                  ETag:
                    key === "attachments/a.pdf"
                      ? "e1"
                      : key === "brand/logo.png"
                        ? "e2"
                        : "e3",
                  LastModified: new Date("2026-08-12T09:00:00.000Z"),
                };
          },
        });
      },
    },
    redis: {
      capture: async ({ hmacKey: runHmacKey, signal }) => {
        order.push("redis");
        return captureRedisSnapshot({
          prefix: "bull",
          queues: APPROVED_QUEUE_NAMES,
          hmacKey: runHmacKey,
          targetFingerprint: redisTarget,
          expectedTargetFingerprint: redisTarget,
          signal,
          send: async ({ command, args, signal: requestSignal }) => {
            assert.equal(requestSignal, signal);
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
          },
        });
      },
    },
  };
  Object.defineProperty(result, "order", { value: order, enumerable: false });
  return result;
}

test("orchestrator composes actual snapshots in a fixed double-observation order", async () => {
  const source = adapters();
  const bundle = await collectA14bInventory({ runContext, ...source });
  assert.deepEqual(source.order, [
    "redis",
    "r2",
    "postgres",
    "r2",
    "postgres",
    "redis",
  ]);
  assert.equal(bundle.collector.productionAccessPerformed, false);
  assert.equal(bundle.collector.productionGo, false);
  assert.equal(
    new Date(bundle.collector.captureStartedAt).toISOString(),
    bundle.collector.captureStartedAt,
  );
  assert.equal(
    new Date(bundle.collector.captureFinishedAt).toISOString(),
    bundle.collector.captureFinishedAt,
  );
  assert.ok(bundle.collector.durationMs >= 0);
  assert.equal(bundle.collector.storageParity.fullParityClaimed, false);
  assert.equal(bundle.collector.storageParity.referencedAndPresent, 2);
  assert.equal(bundle.collector.storageParity.localVolumeReferenceCount, 1);
  assert.equal(bundle.collector.storageParity.failedStorageMarkerCount, 1);
  assert.equal(
    bundle.collector.storageParity.unreferencedObjectFingerprints.length,
    1,
  );
  assert.equal(bundle.collector.postgres.migrationCount, 1);
  assert.equal(bundle.collector.postgres.runtime.databaseName, undefined);
  assert.match(bundle.collector.postgres.targetFingerprint, /^[0-9a-f]{64}$/);
  assert.equal(bundle.collector.redis.keys.length, 90);
  const serialized = JSON.stringify(bundle);
  for (const raw of [
    "attachments/a.pdf",
    "brand/logo.png",
    "/data/source.pdf",
    "record-a",
    "aluplan_support",
    hmacKey.toString(),
  ])
    assert.doesNotMatch(
      serialized,
      new RegExp(raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    );
});

test("orchestrator enforces its own monotonic deadline and AbortSignal", async () => {
  const slow = adapters();
  slow.redis.capture = async ({ signal }) =>
    new Promise((resolve, reject) => {
      signal.addEventListener(
        "abort",
        () => reject(new Error("adapter aborted")),
        {
          once: true,
        },
      );
    });
  await assert.rejects(
    collectA14bInventory({
      runContext,
      ...slow,
      captureTimeoutMs: 10,
      observationTimeoutMs: 20,
    }),
    /timed out/i,
  );

  let transportAborted = false;
  const blocking = adapters();
  blocking.r2.capture = async ({ signal }) =>
    captureR2Snapshot({
      bucket: "support-bucket",
      expectedBucket: "support-bucket",
      signal,
      invoke: async ({ signal: requestSignal }) =>
        new Promise((resolve, reject) => {
          requestSignal.addEventListener(
            "abort",
            () => {
              transportAborted = true;
              reject(new Error("transport aborted"));
            },
            { once: true },
          );
        }),
    });
  await assert.rejects(
    collectA14bInventory({
      runContext,
      ...blocking,
      captureTimeoutMs: 10,
      observationTimeoutMs: 20,
    }),
    /timed out/i,
  );
  assert.equal(transportAborted, true);

  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    collectA14bInventory({
      runContext,
      ...adapters(),
      signal: controller.signal,
    }),
    /aborted/i,
  );
  await assert.rejects(
    collectA14bInventory({
      runContext,
      ...adapters(),
      captureTimeoutMs: 0,
    }),
    /timeout budget/i,
  );
  await assert.rejects(
    collectA14bInventory({
      runContext,
      ...adapters(),
      signal: {},
    }),
    /AbortSignal/i,
  );
  await assert.rejects(
    collectA14bInventory({
      runContext,
      ...adapters(),
      signal: {
        aborted: false,
        addEventListener() {},
      },
    }),
    /AbortSignal/i,
  );
  await assert.rejects(
    collectA14bInventory({
      runContext,
      postgres: {},
      r2: {},
      redis: {},
    }),
    /adapters/i,
  );
});

test("orchestrator refuses missing adapters, drift, missing R2 objects and production mode", async () => {
  await assert.rejects(
    collectA14bInventory({
      runContext,
      ...adapters({ missing: "postgres" }),
    }),
    /issued|incomplete/i,
  );
  await assert.rejects(
    collectA14bInventory({
      runContext: { ...runContext, mode: "production" },
      ...adapters(),
    }),
    /offline-only/i,
  );
  await assert.rejects(
    collectA14bInventory({
      runContext: { ...runContext, apiKey: "must-not-persist" },
      ...adapters(),
    }),
    /unknown field/i,
  );
  const mutableContext = { ...runContext };
  const mutatingAdapters = adapters();
  const originalRedisCapture = mutatingAdapters.redis.capture;
  mutatingAdapters.redis.capture = async (context) => {
    mutableContext.runId = "tampered-run";
    mutableContext.gitSha = "f".repeat(40);
    return originalRedisCapture(context);
  };
  const stableBundle = await collectA14bInventory({
    runContext: mutableContext,
    ...mutatingAdapters,
  });
  assert.equal(stableBundle.collector.runId, runContext.runId);
  assert.equal(stableBundle.collector.gitSha, runContext.gitSha);

  await assert.rejects(
    collectA14bInventory({
      runContext: Object.defineProperty({}, "mode", {
        enumerable: true,
        get: () => "offline",
      }),
      ...adapters(),
    }),
    /accessor/i,
  );
  const inheritedContext = Object.create({
    get mode() {
      return "offline";
    },
    get runId() {
      return runContext.runId;
    },
    get gitSha() {
      return runContext.gitSha;
    },
    get contractSha256() {
      return runContext.contractSha256;
    },
  });
  await assert.rejects(
    collectA14bInventory({
      runContext: inheritedContext,
      ...adapters(),
    }),
    /unknown field/i,
  );
  await assert.rejects(
    collectA14bInventory({
      runContext,
      ...adapters(),
      hmacKey,
    }),
    /unknown field/i,
  );
  const forged = adapters();
  forged.r2.capture = async () => ({
    status: "complete",
    kind: "r2",
    digest: "f".repeat(64),
    data: { bucket: "support-bucket", objects: [] },
  });
  await assert.rejects(
    collectA14bInventory({ runContext, ...forged }),
    /issued|incomplete/i,
  );
});

test("orchestrator emits non-ready diagnostics for moving targets and missing R2 references", async () => {
  const drifting = await collectA14bInventory({
    runContext,
    ...adapters({ drift: "r2" }),
  });
  assert.equal(drifting.observation.status, "moving-target");
  assert.equal(drifting.observation.ready, false);
  assert.equal(drifting.collector.ready, false);
  assert.equal(drifting.collector.productionGo, false);
  assert.equal(drifting.collector.storageParity.evaluated, false);
  assert.equal(drifting.collector.storageParity.skippedReason, "moving-target");
  assert.deepEqual(
    drifting.observation.drift.map((item) => item.kind),
    ["r2"],
  );
  assert.match(drifting.observation.drift[0].beforeDigest, /^[0-9a-f]{64}$/);
  assert.match(drifting.observation.drift[0].afterDigest, /^[0-9a-f]{64}$/);

  const missing = await collectA14bInventory({
    runContext,
    ...adapters({ omitR2Object: true }),
  });
  assert.equal(missing.observation.status, "blocked-referenced-but-missing");
  assert.equal(missing.observation.ready, false);
  assert.equal(missing.collector.ready, false);
  assert.equal(missing.collector.storageParity.referencedButMissingCount, 2);
  assert.equal(
    missing.collector.storageParity.referencedButMissingFingerprints.length,
    2,
  );
  assert.doesNotMatch(
    JSON.stringify(missing),
    /attachments\/a\.pdf|brand\/logo\.png/,
  );
});

test("closed evidence is recursively immutable", async () => {
  const bundle = await collectA14bInventory({
    runContext,
    ...adapters(),
  });
  assert.ok(Object.isFrozen(bundle));
  assert.ok(Object.isFrozen(bundle.collector.storageParity));
  assert.throws(() => {
    bundle.collector.storageParity.fullParityClaimed = true;
  }, /read only|Cannot assign/i);
  assert.equal(bundle.collector.storageParity.fullParityClaimed, false);
});

test("real adapter outputs compose end-to-end despite volatile observation metadata", async () => {
  const bundle = await collectA14bInventory({
    runContext,
    ...adapters(),
  });
  assert.equal(bundle.collector.ready, true);
  assert.equal(bundle.collector.productionGo, false);
});

async function privateRoot() {
  await mkdir(approvedRoot, { recursive: true, mode: 0o700 });
  await chmod(approvedRoot, 0o700);
  return approvedRoot;
}

test("publisher accepts only closed evidence and writes READY last with private modes", async () => {
  const root = await privateRoot();
  const runId = `a14b-publish-${process.pid}`;
  const bundle = await collectA14bInventory({
    runContext: { ...runContext, runId },
    ...adapters(),
  });
  try {
    const directory = await publishEvidenceBundle({
      evidenceRoot: root,
      runId,
      bundle,
    });
    assert.deepEqual((await readdir(directory)).sort(), [
      "READY.json",
      "collector.json",
      "observation.json",
    ]);
    assert.equal((await stat(directory)).mode & 0o777, 0o700);
    for (const name of await readdir(directory))
      assert.equal(
        (await stat(path.join(directory, name))).mode & 0o777,
        0o600,
      );
    assert.equal(
      JSON.parse(await readFile(path.join(directory, "READY.json"), "utf8"))
        .productionGo,
      false,
    );
    await assert.rejects(
      publishEvidenceBundle({
        evidenceRoot: root,
        runId: "arbitrary",
        bundle: { collector: { productionGo: true } },
      }),
      /closed/i,
    );
    await assert.rejects(
      publishEvidenceBundle({
        evidenceRoot: root,
        runId: "different-run",
        bundle,
      }),
      /runId/i,
    );
  } finally {
    await rm(path.join(root, runId), { recursive: true, force: true });
  }
});

test("publisher rejects intermediate symlinks and preserves pre-existing runs", async () => {
  const root = await privateRoot();
  const target = await mkdtemp(path.join(tmpdir(), "a14b-target-"));
  const linked = path.join(root, `linked-${process.pid}`);
  const existingRunId = `existing-${process.pid}`;
  const existing = path.join(root, existingRunId);
  const bundle = await collectA14bInventory({
    runContext,
    ...adapters(),
  });
  try {
    await symlink(target, linked);
    const linkedBundle = await collectA14bInventory({
      runContext: { ...runContext, runId: "no-write" },
      ...adapters(),
    });
    await assert.rejects(
      publishEvidenceBundle({
        evidenceRoot: linked,
        runId: "no-write",
        bundle: linkedBundle,
      }),
      /canonical|symlink/i,
    );
    await mkdir(existing, { mode: 0o700 });
    const existingBundle = await collectA14bInventory({
      runContext: { ...runContext, runId: existingRunId },
      ...adapters(),
    });
    await assert.rejects(
      publishEvidenceBundle({
        evidenceRoot: root,
        runId: existingRunId,
        bundle: existingBundle,
      }),
      (error) =>
        error.message === "Evidence run directory already exists" &&
        !error.message.includes(existing),
    );
    assert.deepEqual(await readdir(existing), []);
  } finally {
    await rm(linked, { force: true });
    await rm(existing, { recursive: true, force: true });
    await rm(target, { recursive: true, force: true });
  }
});

test("publisher path and temporary-file hygiene stays portable and non-leaky", async () => {
  const source = await readFile(
    path.join(project, "scripts/a14b/publisher.mjs"),
    "utf8",
  );
  assert.match(source, /fileURLToPath\(import\.meta\.url\)/);
  assert.match(source, /randomUUID/);
  assert.match(source, /RAW_STORAGE_IDENTIFIER_PATTERN/);
  assert.match(source, /containsRawStorageIdentifier/);
  assert.doesNotMatch(source, /new URL\(import\.meta\.url\)\.pathname/);
  assert.doesNotMatch(source, /`\.\$\{name\}\.tmp`/);
});

test("publisher writes blocked diagnostics without READY", async () => {
  const root = await privateRoot();
  const runId = `a14b-blocked-${process.pid}`;
  const bundle = await collectA14bInventory({
    runContext: { ...runContext, runId },
    ...adapters({ omitR2Object: true }),
  });
  try {
    const directory = await publishEvidenceBundle({
      evidenceRoot: root,
      runId,
      bundle,
    });
    assert.deepEqual((await readdir(directory)).sort(), [
      "collector.json",
      "observation.json",
    ]);
  } finally {
    await rm(path.join(root, runId), { recursive: true, force: true });
  }
});
