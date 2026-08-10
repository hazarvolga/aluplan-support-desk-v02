import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  APPROVED_CRON_DECLARATIONS,
  APPROVED_QUEUE_NAMES,
  APPROVED_REPEATABLE_JOBS,
  QUEUE_SOURCE_ANCHORS,
  READ_ONLY_OPERATIONS,
  assertPrivateEvidencePath,
  assertReadOnlySql,
  buildInventoryPreparationPlan,
  parsePreparationArguments,
  writePreparationPlan,
} from "./release-a14-inventory-contract.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");

async function listProductionTypeScriptFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (["__tests__", "test", "tests"].includes(entry.name)) continue;
      files.push(...(await listProductionTypeScriptFiles(absolute)));
      continue;
    }
    if (entry.name.endsWith(".ts") && !entry.name.includes(".spec.")) {
      files.push(absolute);
    }
  }
  return files;
}

test("locks the complete nine-queue production inventory surface", () => {
  assert.deepEqual(APPROVED_QUEUE_NAMES, [
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
});

test("records every source cron and known repeatable job without claiming runtime singleton", () => {
  assert.equal(APPROVED_CRON_DECLARATIONS.length, 9);
  assert.deepEqual(
    APPROVED_REPEATABLE_JOBS.map((job) => job.jobId),
    [
      "crm-delta-sync-repeatable",
      "sla-auto-close-tickets-repeatable",
      "sla-check-breaches-repeatable",
      "sla-check-warnings-repeatable",
    ],
  );
  assert.ok(
    APPROVED_CRON_DECLARATIONS.every(
      (cron) => cron.runtimeSingletonVerified === false,
    ),
  );
});

test("keeps every declared SQL statement inside the strict read-only grammar", () => {
  const sqlOperations = READ_ONLY_OPERATIONS.filter(
    (operation) => operation.transport === "postgres",
  );
  assert.ok(sqlOperations.length >= 3);
  for (const operation of sqlOperations) {
    for (const sql of operation.statements) {
      assert.doesNotThrow(() => assertReadOnlySql(sql));
    }
  }
});

test("rejects SQL writes, locks, sleeps, copy and multi-statement payloads", () => {
  const forbidden = [
    "UPDATE users SET email = NULL",
    "DELETE FROM tickets",
    "INSERT INTO settings(key) VALUES ('x')",
    "SELECT * FROM users FOR UPDATE",
    "SELECT pg_sleep(10)",
    "SELECT set_config('application_name', 'inventory', false)",
    "SELECT lo_unlink(1)",
    "COPY users TO STDOUT",
    "SELECT 1; DROP TABLE users",
  ];
  for (const sql of forbidden) {
    assert.throws(() => assertReadOnlySql(sql), /read-only SQL allowlist/i);
  }
});

test("allows evidence only beneath the git-ignored private root", () => {
  const allowed = assertPrivateEvidencePath(
    ".private-data/release-evidence/a14-production-inventory/plan.json",
  );
  assert.ok(
    allowed.startsWith(path.join(projectDirectory, ".private-data") + path.sep),
  );
  assert.throws(
    () => assertPrivateEvidencePath("production-inventory.json"),
    /must stay under.*\.private-data/i,
  );
  assert.throws(
    () =>
      assertPrivateEvidencePath(".private-data/../production-inventory.json"),
    /must stay under.*\.private-data/i,
  );
});

test("preparation CLI rejects execution and unknown arguments", () => {
  assert.throws(
    () => parsePreparationArguments(["--execute"]),
    /does not permit production access/i,
  );
  assert.throws(
    () => parsePreparationArguments(["--database-url", "opaque-value"]),
    /unknown argument/i,
  );
  assert.throws(
    () => parsePreparationArguments(["--output"]),
    /requires a value/i,
  );
  assert.throws(
    () =>
      parsePreparationArguments([
        "--git-sha",
        "0123456789abcdef0123456789abcdef01234567",
      ]),
    /explicit --prepare/i,
  );
});

test("preparation plan is explicit about local-only evidence and manual approval gates", () => {
  const plan = buildInventoryPreparationPlan({
    gitSha: "0123456789abcdef0123456789abcdef01234567",
    generatedAt: "2026-08-10T15:00:00.000Z",
  });
  assert.equal(plan.status, "prepared-local-only");
  assert.equal(plan.productionAccessPerformed, false);
  assert.equal(plan.productionGo, false);
  assert.equal(plan.operatorApprovalRequired, true);
  assert.equal(plan.queues.length, 9);
  assert.equal(plan.cronDeclarations.length, 9);
  assert.equal(plan.repeatableJobs.length, 4);
  assert.deepEqual(plan.forbiddenActions, [
    "database-write",
    "object-download",
    "object-upload",
    "object-delete",
    "queue-mutation",
    "redis-mutation",
    "migration",
    "seed",
    "deploy",
  ]);
});

test("preparation plan never serializes credentials, endpoints or secret values", () => {
  const serialized = JSON.stringify(
    buildInventoryPreparationPlan({
      gitSha: "0123456789abcdef0123456789abcdef01234567",
      generatedAt: "2026-08-10T15:00:00.000Z",
    }),
  );
  assert.doesNotMatch(
    serialized,
    /DATABASE_URL|REDIS_URL|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|postgres:\/\/|redis:\/\/|https:\/\//,
  );
});

test("writes a no-clobber mode-0600 plan only inside the private evidence root", async () => {
  const base = path.join(projectDirectory, ".private-data/release-evidence");
  await mkdir(base, { recursive: true, mode: 0o700 });
  const temporaryDirectory = await mkdtemp(
    path.join(base, "a14-contract-test-"),
  );
  const outputPath = path.join(temporaryDirectory, "plan.json");
  const plan = buildInventoryPreparationPlan({
    gitSha: "0123456789abcdef0123456789abcdef01234567",
    generatedAt: "2026-08-10T15:00:00.000Z",
  });
  try {
    await writePreparationPlan(outputPath, plan);
    assert.equal((await stat(outputPath)).mode & 0o777, 0o600);
    assert.deepEqual(JSON.parse(await readFile(outputPath, "utf8")), plan);
    await assert.rejects(
      writePreparationPlan(outputPath, plan),
      /already exists/i,
    );
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});

test("queue, cron and repeatable declarations remain anchored to current source", async () => {
  assert.deepEqual(
    QUEUE_SOURCE_ANCHORS.map((queue) => queue.name),
    APPROVED_QUEUE_NAMES,
  );
  for (const queue of QUEUE_SOURCE_ANCHORS) {
    const sources = await Promise.all(
      queue.sourceFiles.map((sourceFile) =>
        readFile(path.join(projectDirectory, sourceFile), "utf8"),
      ),
    );
    assert.ok(
      sources.some((source) => source.includes(queue.name)),
      `Queue ${queue.name} is missing from its source anchors`,
    );
  }
  for (const cron of APPROVED_CRON_DECLARATIONS) {
    const source = await readFile(
      path.join(projectDirectory, cron.sourceFile),
      "utf8",
    );
    assert.match(source, /@Cron\(/);
  }
  for (const repeatable of APPROVED_REPEATABLE_JOBS) {
    const source = await readFile(
      path.join(projectDirectory, repeatable.sourceFile),
      "utf8",
    );
    assert.ok(source.includes(repeatable.jobId));
  }
});

test("discovers no uncontracted source cron or repeatable job", async () => {
  const sourceRoot = path.join(projectDirectory, "apps/backend/src");
  const sourceFiles = await listProductionTypeScriptFiles(sourceRoot);
  const cronFiles = [];
  const repeatableJobIds = [];
  for (const sourceFile of sourceFiles) {
    const source = await readFile(sourceFile, "utf8");
    for (const _match of source.matchAll(/@Cron\s*\(/g)) {
      cronFiles.push(path.relative(projectDirectory, sourceFile));
    }
    for (const match of source.matchAll(
      /jobId\s*:\s*["']([^"']+-repeatable)["']/g,
    )) {
      repeatableJobIds.push(match[1]);
    }
  }
  assert.deepEqual(
    cronFiles.sort(),
    APPROVED_CRON_DECLARATIONS.map((cron) => cron.sourceFile).sort(),
  );
  assert.deepEqual(
    repeatableJobIds.sort(),
    APPROVED_REPEATABLE_JOBS.map((job) => job.jobId).sort(),
  );
});

test("implementation is preparation-only and imports no network/database clients", async () => {
  const source = await readFile(
    path.join(scriptDirectory, "release-a14-inventory-contract.mjs"),
    "utf8",
  );
  assert.doesNotMatch(source, /from ['"](?:pg|ioredis|bullmq|@aws-sdk)/);
  assert.doesNotMatch(source, /node:child_process/);
  assert.doesNotMatch(source, /\.connect\(|\.query\(|spawn(?:Sync)?\(/);
});
