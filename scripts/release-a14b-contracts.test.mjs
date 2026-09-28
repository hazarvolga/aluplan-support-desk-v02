import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  APPROVED_QUEUE_NAMES,
  POSTGRES_STATEMENT_ALLOWLIST,
  assertPostgresStatementAllowed,
  assertR2OperationAllowed,
  assertRedisOperationAllowed,
  assertRunContext,
  buildRedisKnownKeys,
  classifyStorageReference,
  fingerprintIdentifier,
} from "./release-a14b-inventory-collector.mjs";

const hmacKey = Buffer.from("run-scoped-secret-that-must-never-be-persisted");

test("offline context is exact and never accepts production mode", () => {
  const context = {
    mode: "offline",
    runId: "a14b-local-proof",
    gitSha: "1".repeat(40),
    contractSha256: "2".repeat(64),
  };
  assert.doesNotThrow(() => assertRunContext(context));
  assert.throws(
    () => assertRunContext({ ...context, mode: "production" }),
    /offline-only/i,
  );
  assert.throws(
    () =>
      assertRunContext({ ...context, captureStartedAt: "caller-controlled" }),
    /unknown field/i,
  );
  assert.throws(
    () => assertRunContext({ ...context, contractSha256: "short" }),
    /contract SHA/i,
  );
});

test("SQL, R2 and Redis calls are closed allowlists", () => {
  assert.equal(
    createHash("sha256")
      .update(JSON.stringify(POSTGRES_STATEMENT_ALLOWLIST))
      .digest("hex"),
    "1f38c408ebd3766e4c8f10f2a67c604cc22d4aa641d62dbb7dc60f82d65e5dab",
  );
  for (const sql of POSTGRES_STATEMENT_ALLOWLIST)
    assert.equal(assertPostgresStatementAllowed(sql), sql);
  for (const sql of [
    "SELECT 1",
    "COPY attachments TO STDOUT",
    "SET TRANSACTION READ WRITE",
    "SELECT set_config('statement_timeout','0',true)",
    "SELECT lo_import('/tmp/secret')",
    "SELECT pg_sleep(60)",
  ]) {
    assert.throws(() => assertPostgresStatementAllowed(sql), /allowlist/i);
  }
  assert.equal(assertR2OperationAllowed("ListObjectsV2"), "ListObjectsV2");
  assert.equal(assertR2OperationAllowed("HeadObject"), "HeadObject");
  assert.throws(() => assertR2OperationAllowed("GetObject"), /allowlist/i);
  const knownKeys = buildRedisKnownKeys({
    prefix: "bull",
    queues: APPROVED_QUEUE_NAMES,
  });
  assert.equal(knownKeys.length, 90);
  assert.doesNotThrow(() =>
    assertRedisOperationAllowed({
      command: "ZRANGE",
      args: ["bull:email:failed", "0", "99"],
      knownKeys,
    }),
  );
  for (const invocation of [
    { command: "SCAN", args: ["0"] },
    { command: "EVAL", args: ["return 1", "0"] },
    { command: "DEL", args: ["bull:email:failed"] },
    { command: "ZRANGE", args: ["bull:email:failed", "0", "-1"] },
  ])
    assert.throws(
      () => assertRedisOperationAllowed({ ...invocation, knownKeys }),
      /allowlist/i,
    );
});

test("HMAC fingerprints are keyed and raw-value safe", () => {
  const raw = "attachments/private/customer.pdf";
  const fingerprint = fingerprintIdentifier(raw, hmacKey);
  assert.match(fingerprint, /^[0-9a-f]{64}$/);
  assert.notEqual(fingerprint, createHash("sha256").update(raw).digest("hex"));
  assert.throws(() => fingerprintIdentifier(raw, Buffer.alloc(31)), /32-byte/i);
  assert.throws(() => fingerprintIdentifier(raw, Buffer.alloc(32)), /32-byte/i);
  assert.throws(() => fingerprintIdentifier(raw, "not-a-buffer"), /Buffer/i);
  assert.throws(() => fingerprintIdentifier("", hmacKey), /non-empty/i);
});

test("storage references distinguish R2, proxy URLs, local volumes and failed markers", () => {
  assert.deepEqual(
    classifyStorageReference({
      source_type: "attachment",
      reference_id: "a",
      object_key: "attachments/a.pdf",
    }),
    {
      class: "r2",
      sourceType: "attachment",
      recordId: "a",
      storageKey: "attachments/a.pdf",
    },
  );
  assert.equal(
    classifyStorageReference({
      source_type: "branding-logo",
      reference_id: "b",
      object_key: "/api/v1/branding/assets/brand/logo.png",
    }).storageKey,
    "brand/logo.png",
  );
  assert.equal(
    classifyStorageReference({
      source_type: "knowledge-source",
      reference_id: "w",
      object_key: "C:\\data\\source.pdf",
    }).class,
    "local-volume",
  );
  assert.equal(
    classifyStorageReference({
      source_type: "knowledge-source",
      reference_id: "k",
      object_key: "/data/source.pdf",
    }).class,
    "local-volume",
  );
  assert.equal(
    classifyStorageReference({
      source_type: "failed-storage-marker",
      reference_id: "f",
      object_key: "FAILED_STORAGE_UPLOAD_x",
    }).class,
    "failed-marker",
  );
  for (const value of [
    "https://example.com/logo.png",
    "https://evil.example/api/v1/branding/assets/brand/logo.png",
    "//evil.example/api/v1/branding/assets/brand/logo.png",
    "unknown/path.pdf",
    "attachments/../secret",
  ]) {
    assert.throws(
      () =>
        classifyStorageReference({
          source_type: "branding-logo",
          reference_id: "x",
          object_key: value,
        }),
      /ambiguous|invalid/i,
    );
  }
  assert.throws(() => classifyStorageReference({}), /invalid/i);
  assert.throws(
    () =>
      classifyStorageReference({
        source_type: "unknown",
        reference_id: "u",
        object_key: "attachments/a.pdf",
      }),
    /unknown/i,
  );
});

test("offline collector modules cannot import or invoke network-capable clients", async () => {
  const directory = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "a14b",
  );
  const forbidden =
    /\bfetch\s*\(|node:(?:http|https|net|tls|dgram|child_process)|from\s+["'](?:pg|ioredis|redis|@aws-sdk\/client-s3)["']|createRequire\s*\(|\bimport\s*\(|process\.(?:argv|exit)\b/;
  for (const name of await readdir(directory)) {
    if (!name.endsWith(".mjs")) continue;
    const source = await readFile(path.join(directory, name), "utf8");
    assert.doesNotMatch(source, forbidden, name);
  }
});
