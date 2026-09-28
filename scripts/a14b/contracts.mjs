import { createHash, createHmac } from "node:crypto";

export const APPROVED_QUEUE_NAMES = Object.freeze([
  "ai-query-processing",
  "crm-sync",
  "document-parsing",
  "email",
  "embedding-migration",
  "kb-summarizer",
  "knowledge-sync",
  "proactive-chat",
  "sla-processing",
]);

export const QUEUE_SUFFIX_TYPES = Object.freeze({
  wait: "list",
  active: "list",
  delayed: "zset",
  prioritized: "zset",
  "waiting-children": "zset",
  completed: "zset",
  failed: "zset",
  paused: "list",
  stalled: "set",
  repeat: "zset",
});

export const RUN_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,127}$/;
export const SHA40_PATTERN = /^[0-9a-f]{40}$/;
export const SHA64_PATTERN = /^[0-9a-f]{64}$/;

export function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function digestValue(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

export function fingerprintIdentifier(value, hmacKey) {
  if (!(Buffer.isBuffer(hmacKey) || hmacKey instanceof Uint8Array)) {
    throw new Error("The run-scoped HMAC key must be a Buffer");
  }
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    hmacKey.byteLength < 32 ||
    hmacKey.every((byte) => byte === 0)
  ) {
    throw new Error("A non-empty identifier and 32-byte HMAC key are required");
  }
  return createHmac("sha256", hmacKey).update(value).digest("hex");
}

export function assertCanonicalTimestamp(value, label) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw new Error(`${label} must be a canonical UTC ISO-8601 timestamp`);
  }
}

export function assertRunContext(context) {
  if (!context || context.mode !== "offline") {
    throw new Error(
      "A.1.4-B core is offline-only; production mode is forbidden",
    );
  }
  if (!RUN_ID_PATTERN.test(context.runId ?? ""))
    throw new Error("Invalid runId");
  if (!SHA40_PATTERN.test(context.gitSha ?? ""))
    throw new Error("Invalid Git SHA");
  if (!SHA64_PATTERN.test(context.contractSha256 ?? "")) {
    throw new Error("Invalid contract SHA-256");
  }
  const allowedKeys = ["mode", "runId", "gitSha", "contractSha256"];
  if (Object.keys(context).some((key) => !allowedKeys.includes(key))) {
    throw new Error("Run context contains an unknown field");
  }
}

export function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value))
    return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
