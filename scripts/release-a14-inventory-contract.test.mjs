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
import ts from "typescript";

import {
  APPROVED_POSTGRES_STATEMENTS,
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

const expectedPostgresStatements = [
  "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY",
  "SET LOCAL statement_timeout = 30000",
  'SELECT migration_name, checksum, started_at, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at ASC',
  "ROLLBACK",
  "SELECT current_database() AS database_name, current_setting('server_version') AS server_version, pg_is_in_recovery() AS is_replica",
  "SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'pgcrypto') ORDER BY extname",
  "SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE url LIKE 'FAILED_STORAGE_UPLOAD_%') AS failed_storage FROM attachments",
  "SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE file_path IS NOT NULL) AS with_storage_key FROM knowledge_sources",
  "SELECT COUNT(*) AS branding_logo_settings FROM settings WHERE key = 'branding.logo_url'",
];

function extractRegisteredQueueNames(source) {
  const names = [];
  const sourceFile = ts.createSourceFile(
    "queue-source.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.name.text.startsWith("registerQueue")
    ) {
      assert.equal(
        node.expression.name.text,
        "registerQueue",
        "Async or unknown queue registration requires an explicit inventory parser update",
      );
      for (const argument of node.arguments) {
        assert.ok(
          ts.isObjectLiteralExpression(argument),
          "Every registerQueue argument must be a reviewed object literal",
        );
        const nameProperty = argument.properties.find(
          (property) =>
            ts.isPropertyAssignment(property) &&
            ((ts.isIdentifier(property.name) &&
              property.name.text === "name") ||
              (ts.isStringLiteral(property.name) &&
                property.name.text === "name")),
        );
        assert.ok(
          nameProperty && ts.isPropertyAssignment(nameProperty),
          "Every registerQueue object must declare a name",
        );
        const initializer = nameProperty.initializer;
        if (ts.isStringLiteral(initializer)) {
          names.push(initializer.text);
        } else {
          assert.ok(
            ts.isIdentifier(initializer) &&
              initializer.text === "PROACTIVE_CHAT_QUEUE",
            "Every registerQueue name must be a reviewed literal or PROACTIVE_CHAT_QUEUE",
          );
          names.push("proactive-chat");
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return names;
}

function assertNetworkIncapableSource(source) {
  assert.doesNotMatch(source, /from ["'](?:pg|ioredis|bullmq|@aws-sdk)/);
  assert.doesNotMatch(source, /node:child_process/);
  assert.doesNotMatch(
    source,
    /\bfetch\s*\(|\bimport\s*\(|\bcreateRequire\b|\brequire\s*\(|node:(?:net|http|https|tls|dns|dgram)/,
  );
  assert.doesNotMatch(source, /\.connect\(|\.query\(|spawn(?:Sync)?\(/);
}

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

test("locks PostgreSQL statements independently from operation declarations", () => {
  const declaredStatements = READ_ONLY_OPERATIONS.filter(
    (operation) => operation.transport === "postgres",
  ).flatMap((operation) => operation.statements);
  assert.deepEqual(declaredStatements, expectedPostgresStatements);
  assert.deepEqual(APPROVED_POSTGRES_STATEMENTS, expectedPostgresStatements);
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
    "SELECT pg_read_file('/etc/passwd')",
    "SELECT dblink('opaque', 'SELECT 1')",
    "SELECT query_to_xml('SELECT 1', true, false, '')",
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
  assert.throws(
    () =>
      assertPrivateEvidencePath(
        ".private-data/release-credentials/inventory-plan.json",
      ),
    /release-evidence/i,
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

test("requires generatedAt to be canonical UTC ISO-8601", () => {
  assert.throws(
    () =>
      buildInventoryPreparationPlan({
        gitSha: "0123456789abcdef0123456789abcdef01234567",
        generatedAt: "Mon Aug 10 2026 (opaque-suffix)",
      }),
    /ISO-8601/i,
  );
  assert.throws(
    () =>
      buildInventoryPreparationPlan({
        gitSha: "0123456789abcdef0123456789abcdef01234567",
        generatedAt: "2026-08-10T18:00:00+03:00",
      }),
    /ISO-8601/i,
  );
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

test("rejects symlinked and group/world-readable evidence directories", async () => {
  const base = path.join(projectDirectory, ".private-data/release-evidence");
  await mkdir(base, { recursive: true, mode: 0o700 });
  const temporaryDirectory = await mkdtemp(
    path.join(base, "a14-directory-guard-test-"),
  );
  const targetDirectory = path.join(temporaryDirectory, "target");
  const linkedDirectory = path.join(temporaryDirectory, "linked");
  const permissiveDirectory = path.join(temporaryDirectory, "permissive");
  const plan = buildInventoryPreparationPlan({
    gitSha: "0123456789abcdef0123456789abcdef01234567",
    generatedAt: "2026-08-10T15:00:00.000Z",
  });
  try {
    await mkdir(targetDirectory, { mode: 0o700 });
    await symlink(targetDirectory, linkedDirectory);
    await assert.rejects(
      writePreparationPlan(path.join(linkedDirectory, "plan.json"), plan),
      /non-directory or symlink/i,
    );

    await mkdir(permissiveDirectory, { mode: 0o700 });
    await chmod(permissiveDirectory, 0o755);
    await assert.rejects(
      writePreparationPlan(path.join(permissiveDirectory, "plan.json"), plan),
      /group\/world access/i,
    );
    assert.equal((await stat(permissiveDirectory)).mode & 0o777, 0o755);
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
      sources.some((source) =>
        extractRegisteredQueueNames(source).includes(queue.name),
      ),
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

test("discovers no uncontracted queue, cron or repeatable job", async () => {
  const sourceRoot = path.join(projectDirectory, "apps/backend/src");
  const sourceFiles = await listProductionTypeScriptFiles(sourceRoot);
  const queueNames = [];
  const cronFiles = [];
  const repeatableJobIds = [];
  for (const sourceFile of sourceFiles) {
    const source = await readFile(sourceFile, "utf8");
    queueNames.push(...extractRegisteredQueueNames(source));
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
    [...new Set(queueNames)].sort(),
    [...APPROVED_QUEUE_NAMES].sort(),
  );
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
  assertNetworkIncapableSource(source);
});

test("network capability guard rejects import-less and dynamic clients", () => {
  const forbiddenSources = [
    'await fetch("https://example.invalid")',
    'const pg = await import("pg")',
    'import { createRequire } from "node:module"',
    'import net from "node:net"',
    'const https = require("node:https")',
  ];
  for (const source of forbiddenSources) {
    assert.throws(() => assertNetworkIncapableSource(source));
  }
});
