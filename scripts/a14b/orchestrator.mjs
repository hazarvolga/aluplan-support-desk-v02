import {
  assertRunContext,
  deepFreeze,
  digestValue,
  fingerprintIdentifier,
} from "./contracts.mjs";
import { randomBytes } from "node:crypto";
import { assertIssuedPostgresSnapshot } from "./postgres-adapter.mjs";
import { assertIssuedR2Snapshot } from "./r2-adapter.mjs";
import { assertIssuedRedisSnapshot } from "./redis-adapter.mjs";
import { performance } from "node:perf_hooks";

const safeBundles = new WeakSet();

function assertSnapshot(snapshot, kind) {
  if (kind === "postgres") assertIssuedPostgresSnapshot(snapshot);
  if (kind === "r2") assertIssuedR2Snapshot(snapshot);
  if (kind === "redis") assertIssuedRedisSnapshot(snapshot);
  if (
    !snapshot ||
    snapshot.kind !== kind ||
    snapshot.status !== "complete" ||
    !/^[0-9a-f]{64}$/.test(snapshot.contractSha256 ?? "") ||
    !/^[0-9a-f]{64}$/.test(snapshot.digest ?? "") ||
    snapshot.digest !== digestValue(snapshot.data)
  ) {
    throw new Error(`${kind} snapshot is incomplete`);
  }
  if (
    (kind === "postgres" &&
      (!Array.isArray(snapshot.data.references) ||
        typeof snapshot.data.role?.[0]?.role_name !== "string" ||
        typeof snapshot.data.runtime?.[0]?.database_name !== "string")) ||
    (kind === "r2" &&
      (typeof snapshot.data.bucket !== "string" ||
        !Array.isArray(snapshot.data.objects))) ||
    (kind === "redis" &&
      (!Array.isArray(snapshot.data.keys) ||
        !/^[0-9a-f]{64}$/.test(snapshot.data.targetFingerprint ?? "")))
  )
    throw new Error(`${kind} snapshot schema is incomplete`);
}

function compareSnapshots(before, after, kind) {
  assertSnapshot(before, kind);
  assertSnapshot(after, kind);
  if (before.digest !== after.digest)
    throw new Error(`${kind} changed during the bounded observation window`);
}

function storageParity(postgres, r2, hmacKey) {
  const references = postgres.data.references;
  const r2Keys = references
    .filter((item) => item.class === "r2")
    .map((item) => item.storageKey);
  const local = references.filter((item) => item.class === "local-volume");
  const failed = references.filter((item) => item.class === "failed-marker");
  const objects = r2.data.objects.map((item) => item.key);
  const r2Set = new Set(r2Keys);
  const objectSet = new Set(objects);
  if (objectSet.size !== objects.length)
    throw new Error("R2 storage parity input contains duplicates");
  const missing = r2Keys.filter((key) => !objectSet.has(key));
  if (missing.length) throw new Error("Database references missing R2 objects");
  return {
    referencedAndPresent: r2Set.size,
    databaseReferenceCount: r2Keys.length,
    unreferencedObjectFingerprints: objects
      .filter((key) => !r2Set.has(key))
      .map((key) => fingerprintIdentifier(key, hmacKey)),
    localVolumeReferenceCount: local.length,
    failedStorageMarkerCount: failed.length,
    fullParityClaimed: false,
  };
}

function projectPostgres(snapshot, hmacKey) {
  return {
    digest: snapshot.digest,
    statementContractSha256: snapshot.contractSha256,
    targetFingerprint: fingerprintIdentifier(
      `${snapshot.data.runtime[0]?.database_name}:${snapshot.data.role[0]?.role_name}`,
      hmacKey,
    ),
    referenceCounts: snapshot.data.references.reduce(
      (result, item) => ({
        ...result,
        [item.class]: (result[item.class] ?? 0) + 1,
      }),
      {},
    ),
    migrationCount: snapshot.data.ledger.length,
    ledger: snapshot.data.ledger.map((item) => ({
      migrationName: item.migration_name,
      checksum: item.checksum,
      startedAt: item.started_at,
      finishedAt: item.finished_at,
      rolledBackAt: null,
    })),
    runtime: {
      serverVersion: snapshot.data.runtime[0].server_version,
      isReplica: snapshot.data.runtime[0].is_replica,
      transactionReadOnly: snapshot.data.runtime[0].transaction_read_only,
      defaultTransactionReadOnly:
        snapshot.data.runtime[0].default_transaction_read_only,
    },
    extensions: snapshot.data.extensions.map((item) => ({
      name: item.extname,
      version: item.extversion,
    })),
    counts: {
      attachments: snapshot.data.counts[0].total,
      failedStorage: snapshot.data.counts[0].failed_storage,
    },
    referenceFingerprints: snapshot.data.references.map((item) => ({
      class: item.class,
      sourceType: item.sourceType,
      recordFingerprint: fingerprintIdentifier(String(item.recordId), hmacKey),
      ...(item.storageKey
        ? {
            storageKeyFingerprint: fingerprintIdentifier(
              item.storageKey,
              hmacKey,
            ),
          }
        : {}),
      ...(item.localPath
        ? {
            localPathFingerprint: fingerprintIdentifier(
              item.localPath,
              hmacKey,
            ),
          }
        : {}),
    })),
  };
}

function projectR2(snapshot, hmacKey) {
  return {
    digest: snapshot.digest,
    operationContractSha256: snapshot.contractSha256,
    targetFingerprint: fingerprintIdentifier(snapshot.data.bucket, hmacKey),
    objectCount: snapshot.data.objects.length,
    objects: snapshot.data.objects.map((item) => ({
      keyFingerprint: fingerprintIdentifier(item.key, hmacKey),
      size: item.size,
      etagFingerprint: fingerprintIdentifier(item.etag, hmacKey),
      lastModified: item.lastModified,
    })),
  };
}

export async function collectA14bInventory(options) {
  if (!options || typeof options !== "object")
    throw new Error("Collector options are required");
  const allowedOptionKeys = [
    "runContext",
    "postgres",
    "r2",
    "redis",
    "signal",
    "captureTimeoutMs",
    "observationTimeoutMs",
  ];
  if (Object.keys(options).some((key) => !allowedOptionKeys.includes(key)))
    throw new Error("Collector options contain an unknown field");
  const {
    runContext,
    postgres,
    r2,
    redis,
    signal,
    captureTimeoutMs = 30000,
    observationTimeoutMs = 120000,
  } = options;
  const contextDescriptors =
    runContext && typeof runContext === "object"
      ? Object.getOwnPropertyDescriptors(runContext)
      : {};
  if (
    Object.values(contextDescriptors).some(
      (descriptor) => descriptor.get || descriptor.set,
    )
  )
    throw new Error("Run context accessors are forbidden");
  const contextKeys = ["mode", "runId", "gitSha", "contractSha256"];
  if (
    Object.keys(contextDescriptors).length !== contextKeys.length ||
    contextKeys.some(
      (key) =>
        !Object.hasOwn(contextDescriptors, key) ||
        !("value" in contextDescriptors[key]),
    ) ||
    Object.keys(contextDescriptors).some((key) => !contextKeys.includes(key))
  )
    throw new Error("Run context contains an unknown field");
  const context = deepFreeze({
    mode: contextDescriptors.mode.value,
    runId: contextDescriptors.runId.value,
    gitSha: contextDescriptors.gitSha.value,
    contractSha256: contextDescriptors.contractSha256.value,
  });
  assertRunContext(context);
  const hmacKey = randomBytes(32);
  try {
    fingerprintIdentifier(`a14b:${context.runId}`, hmacKey);
    if (!postgres?.capture || !r2?.capture || !redis?.capture)
      throw new Error("All offline adapters are required");
    if (
      !Number.isInteger(captureTimeoutMs) ||
      captureTimeoutMs < 1 ||
      captureTimeoutMs > 120000
    )
      throw new Error("Capture timeout budget is invalid");
    if (
      !Number.isInteger(observationTimeoutMs) ||
      observationTimeoutMs < 1 ||
      observationTimeoutMs > 120000
    )
      throw new Error("Observation timeout budget is invalid");
    if (
      signal &&
      (typeof signal.aborted !== "boolean" ||
        typeof signal.addEventListener !== "function" ||
        typeof signal.removeEventListener !== "function")
    )
      throw new Error("AbortSignal contract is invalid");
    const observationStarted = performance.now();
    const captureStartedAt = new Date().toISOString();
    const deadline = observationStarted + observationTimeoutMs;
    const capture = async (adapter, label) => {
      if (signal?.aborted) throw new Error("A.1.4-B capture was aborted");
      const controller = new AbortController();
      let timer;
      let abortHandler;
      try {
        const remaining = Math.min(
          captureTimeoutMs,
          deadline - performance.now(),
        );
        if (remaining <= 0) throw new Error("A.1.4-B observation timed out");
        return await Promise.race([
          adapter.capture({ signal: controller.signal, hmacKey }),
          new Promise((_, reject) => {
            timer = setTimeout(() => {
              reject(new Error(`${label} capture timed out`));
              controller.abort();
            }, remaining);
          }),
          new Promise((_, reject) => {
            if (!signal) return;
            abortHandler = () => {
              reject(new Error("A.1.4-B capture was aborted"));
              controller.abort();
            };
            signal.addEventListener("abort", abortHandler, { once: true });
          }),
        ]);
      } finally {
        clearTimeout(timer);
        if (abortHandler) signal.removeEventListener("abort", abortHandler);
      }
    };
    const redisBefore = await capture(redis, "redis-before");
    const r2Before = await capture(r2, "r2-before");
    const postgresBefore = await capture(postgres, "postgres-before");
    const r2After = await capture(r2, "r2-after");
    const postgresAfter = await capture(postgres, "postgres-after");
    const redisAfter = await capture(redis, "redis-after");
    const durationMs = performance.now() - observationStarted;
    if (durationMs > observationTimeoutMs)
      throw new Error("A.1.4-B observation timed out");
    const captureFinishedAt = new Date().toISOString();
    compareSnapshots(postgresBefore, postgresAfter, "postgres");
    compareSnapshots(r2Before, r2After, "r2");
    compareSnapshots(redisBefore, redisAfter, "redis");
    const parity = storageParity(postgresAfter, r2After, hmacKey);
    const observation = deepFreeze({
      schemaVersion: 1,
      status: "stable-bounded-observation",
      ready: true,
      productionGo: false,
      captureStartedAt,
      captureFinishedAt,
      durationMs,
      adapterDigests: {
        postgres: postgresAfter.digest,
        r2: r2After.digest,
        redis: redisAfter.digest,
      },
    });
    const collector = deepFreeze({
      schemaVersion: 1,
      evidenceClass: "offline-contract-simulation",
      targetEnvironment: "production",
      executionEnvironment: "offline",
      mode: context.mode,
      runId: context.runId,
      gitSha: context.gitSha,
      contractSha256: context.contractSha256,
      captureStartedAt,
      captureFinishedAt,
      durationMs,
      status: observation.status,
      ready: true,
      productionAccessPerformed: false,
      productionWritePerformed: false,
      productionGo: false,
      runtimeSingletonVerified: false,
      storageParityEligibleForProductionGo: false,
      storageParity: parity,
      postgres: projectPostgres(postgresAfter, hmacKey),
      r2: projectR2(r2After, hmacKey),
      redis: {
        digest: redisAfter.digest,
        operationContractSha256: redisAfter.contractSha256,
        scope: redisAfter.scope,
        keyCount: redisAfter.data.keys.length,
        dataDigest: digestValue(redisAfter.data),
        server: redisAfter.data.server,
        keys: redisAfter.data.keys,
      },
    });
    const bundle = deepFreeze({ collector, observation });
    safeBundles.add(bundle);
    return bundle;
  } finally {
    hmacKey.fill(0);
  }
}

export function assertClosedBundle(bundle) {
  if (
    !safeBundles.has(bundle) ||
    bundle.collector?.productionGo !== false ||
    bundle.observation?.ready !== true
  ) {
    throw new Error("Evidence does not match the closed A.1.4-B schema");
  }
  return bundle;
}
