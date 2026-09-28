import {
  APPROVED_QUEUE_NAMES,
  QUEUE_SUFFIX_TYPES,
  deepFreeze,
  digestValue,
  fingerprintIdentifier,
} from "./contracts.mjs";

const issuedSnapshots = new WeakSet();

export function assertIssuedRedisSnapshot(snapshot) {
  if (!issuedSnapshots.has(snapshot))
    throw new Error("Redis snapshot was not issued by the reviewed adapter");
  return snapshot;
}

export function buildRedisKnownKeys({ prefix, queues }) {
  if (typeof prefix !== "string" || !/^[a-z][a-z0-9_-]*$/.test(prefix))
    throw new Error("Invalid Redis prefix");
  if (
    !Array.isArray(queues) ||
    queues.length !== APPROVED_QUEUE_NAMES.length ||
    !APPROVED_QUEUE_NAMES.every((q) => queues.includes(q))
  ) {
    throw new Error("Redis inventory requires the exact approved queue set");
  }
  return queues.flatMap((queue) =>
    Object.keys(QUEUE_SUFFIX_TYPES).map(
      (suffix) => `${prefix}:${queue}:${suffix}`,
    ),
  );
}

export function assertRedisOperationAllowed({ command, args, knownKeys }) {
  const key = args?.[0];
  const suffix = typeof key === "string" ? key.split(":").at(-1) : undefined;
  const known = new Set(knownKeys);
  const exact =
    (command === "INFO" &&
      args.length === 1 &&
      ["persistence", "stats"].includes(args[0])) ||
    (command === "CONFIG" &&
      args.length === 2 &&
      args[0] === "GET" &&
      ["maxmemory", "maxmemory-policy"].includes(args[1])) ||
    (command === "TYPE" && args.length === 1 && known.has(key)) ||
    (command === "LLEN" &&
      args.length === 1 &&
      known.has(key) &&
      QUEUE_SUFFIX_TYPES[suffix] === "list") ||
    (command === "LRANGE" &&
      args.length === 3 &&
      known.has(key) &&
      QUEUE_SUFFIX_TYPES[suffix] === "list" &&
      args[1] === "0" &&
      args[2] === "99") ||
    (command === "ZCARD" &&
      args.length === 1 &&
      known.has(key) &&
      QUEUE_SUFFIX_TYPES[suffix] === "zset") ||
    (command === "ZRANGE" &&
      ((suffix !== "repeat" && args.length === 3) ||
        (suffix === "repeat" &&
          args.length === 4 &&
          args[3] === "WITHSCORES")) &&
      known.has(key) &&
      QUEUE_SUFFIX_TYPES[suffix] === "zset" &&
      args[1] === "0" &&
      args[2] === "99") ||
    (command === "SCARD" &&
      args.length === 1 &&
      known.has(key) &&
      QUEUE_SUFFIX_TYPES[suffix] === "set");
  if (!exact)
    throw new Error("Invocation is outside the Redis operation allowlist");
  return { command, args: [...args] };
}

function expectedType(key) {
  return QUEUE_SUFFIX_TYPES[key.split(":").at(-1)];
}

function parseInfo(value, requiredKeys) {
  if (typeof value !== "string" || Buffer.byteLength(value) > 65536)
    throw new Error("Redis server metadata exceeds byte budget");
  const entries = new Map(
    value
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes(":"))
      .map((line) => {
        const separator = line.indexOf(":");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
  const result = {};
  for (const key of requiredKeys) {
    const raw = entries.get(key);
    if (raw == null || Buffer.byteLength(raw) > 256)
      throw new Error("Redis server metadata is incomplete");
    const binaryKeys = new Set([
      "loading",
      "rdb_bgsave_in_progress",
      "aof_enabled",
      "aof_rewrite_in_progress",
    ]);
    const statusKeys = new Set([
      "rdb_last_bgsave_status",
      "aof_last_bgrewrite_status",
    ]);
    const counterKeys = new Set(["evicted_keys", "total_error_replies"]);
    if (binaryKeys.has(key) && !/^[01]$/.test(raw))
      throw new Error("Redis binary metadata is invalid");
    if (statusKeys.has(key) && !["ok", "err"].includes(raw))
      throw new Error("Redis status metadata is invalid");
    if (counterKeys.has(key) && !/^(?:0|[1-9]\d*)$/.test(raw))
      throw new Error("Redis counter metadata is invalid");
    result[key] = raw;
  }
  return result;
}

function parseConfig(value, expectedKey) {
  if (
    !Array.isArray(value) ||
    value.length !== 2 ||
    value[0] !== expectedKey ||
    typeof value[1] !== "string" ||
    Buffer.byteLength(value[1]) > 256
  )
    throw new Error("Redis configuration metadata is incomplete");
  const raw = value[1];
  if (expectedKey === "maxmemory" && !/^(?:0|[1-9]\d*)$/.test(raw))
    throw new Error("Redis maxmemory configuration is invalid");
  if (
    expectedKey === "maxmemory-policy" &&
    ![
      "noeviction",
      "allkeys-lru",
      "allkeys-lfu",
      "allkeys-random",
      "volatile-lru",
      "volatile-lfu",
      "volatile-random",
      "volatile-ttl",
    ].includes(raw)
  )
    throw new Error("Redis eviction policy is invalid");
  return raw;
}

export async function captureRedisSnapshot({
  send,
  signal,
  prefix,
  queues,
  hmacKey,
  targetFingerprint,
  expectedTargetFingerprint,
}) {
  if (typeof send !== "function") throw new Error("Redis adapter is required");
  if (
    signal &&
    (typeof signal.aborted !== "boolean" ||
      typeof signal.throwIfAborted !== "function")
  )
    throw new Error("Redis AbortSignal contract is invalid");
  if (
    !/^[0-9a-f]{64}$/.test(targetFingerprint ?? "") ||
    targetFingerprint !== expectedTargetFingerprint
  )
    throw new Error("Redis target identity mismatch");
  const knownKeys = buildRedisKnownKeys({ prefix, queues });
  const run = async (command, args) => {
    try {
      signal?.throwIfAborted();
      const result = await send({
        ...assertRedisOperationAllowed({ command, args, knownKeys }),
        signal,
      });
      signal?.throwIfAborted();
      return result;
    } catch {
      throw new Error("Redis read operation failed");
    }
  };
  const server = {
    persistence: parseInfo(await run("INFO", ["persistence"]), [
      "loading",
      "rdb_bgsave_in_progress",
      "rdb_last_bgsave_status",
      "aof_enabled",
      "aof_rewrite_in_progress",
      "aof_last_bgrewrite_status",
    ]),
    stats: parseInfo(await run("INFO", ["stats"]), [
      "evicted_keys",
      "total_error_replies",
    ]),
    maxmemory: parseConfig(
      await run("CONFIG", ["GET", "maxmemory"]),
      "maxmemory",
    ),
    maxmemoryPolicy: parseConfig(
      await run("CONFIG", ["GET", "maxmemory-policy"]),
      "maxmemory-policy",
    ),
  };
  const keys = [];
  for (const key of knownKeys) {
    const type = await run("TYPE", [key]);
    const expected = expectedType(key);
    if (type !== "none" && type !== expected)
      throw new Error("Redis key type does not match its BullMQ contract");
    let count = 0;
    let rawIdentifiers = [];
    if (type === "list") {
      count = Number(await run("LLEN", [key]));
      rawIdentifiers = await run("LRANGE", [key, "0", "99"]);
    }
    if (type === "zset") {
      count = Number(await run("ZCARD", [key]));
      rawIdentifiers = await run("ZRANGE", [
        key,
        "0",
        "99",
        ...(key.endsWith(":repeat") ? ["WITHSCORES"] : []),
      ]);
    }
    if (type === "set") count = Number(await run("SCARD", [key]));
    if (
      !Number.isSafeInteger(count) ||
      count < 0 ||
      count > 100000000 ||
      !Array.isArray(rawIdentifiers)
    )
      throw new Error("Redis returned an invalid count or identifier list");
    const expectedIdentifierLength =
      Math.min(count, 100) * (key.endsWith(":repeat") ? 2 : 1);
    if (
      rawIdentifiers.length !== expectedIdentifierLength ||
      rawIdentifiers.some((id) => Buffer.byteLength(String(id)) > 4096)
    )
      throw new Error("Redis identifier sample is truncated or inconsistent");
    const queue = key.split(":").slice(1, -1).join(":");
    const kind = key.split(":").at(-1);
    const entries = [];
    if (kind === "repeat") {
      for (let index = 0; index < rawIdentifiers.length; index += 2) {
        const score = String(rawIdentifiers[index + 1]);
        if (!/^-?\d+(?:\.\d+)?$/.test(score))
          throw new Error("Redis repeatable schedule is invalid");
        entries.push({
          identifierFingerprint: fingerprintIdentifier(
            String(rawIdentifiers[index]),
            hmacKey,
          ),
          scheduleFingerprint: fingerprintIdentifier(score, hmacKey),
        });
      }
    }
    keys.push({
      queue,
      kind,
      keyFingerprint: fingerprintIdentifier(key, hmacKey),
      type,
      count,
      ...(kind === "repeat"
        ? { entries }
        : {
            identifierFingerprints: rawIdentifiers.map((id) =>
              fingerprintIdentifier(String(id), hmacKey),
            ),
          }),
    });
  }
  const data = {
    scope: "exact-known-keys",
    targetFingerprint,
    server,
    keys,
  };
  const snapshot = {
    kind: "redis",
    status: "complete",
    scope: "exact-known-keys",
    contractSha256: digestValue({
      queues: APPROVED_QUEUE_NAMES,
      suffixTypes: QUEUE_SUFFIX_TYPES,
      commands: [
        "INFO",
        "CONFIG GET",
        "TYPE",
        "LLEN",
        "LRANGE 0 99",
        "ZCARD",
        "ZRANGE 0 99",
        "ZRANGE 0 99 WITHSCORES",
        "SCARD",
      ],
    }),
    digest: digestValue(data),
    data,
  };
  const closedSnapshot = deepFreeze(snapshot);
  issuedSnapshots.add(closedSnapshot);
  return closedSnapshot;
}
