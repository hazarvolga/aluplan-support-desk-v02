import { createHash, randomUUID } from "node:crypto";
import { chmod, link, lstat, mkdir, open, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const privateRoot = path.join(projectDirectory, ".private-data");
const defaultOutputPath = path.join(
  privateRoot,
  "release-evidence/a14-production-inventory/preparation-plan.json",
);

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

export const QUEUE_SOURCE_ANCHORS = Object.freeze([
  {
    name: "ai-query-processing",
    sourceFiles: ["apps/backend/src/ai/ai.module.ts"],
  },
  {
    name: "crm-sync",
    sourceFiles: ["apps/backend/src/crm/crm.module.ts"],
  },
  {
    name: "document-parsing",
    sourceFiles: ["apps/backend/src/ai/ai.module.ts"],
  },
  {
    name: "email",
    sourceFiles: ["apps/backend/src/email/email.module.ts"],
  },
  {
    name: "embedding-migration",
    sourceFiles: ["apps/backend/src/ai/ai.module.ts"],
  },
  {
    name: "kb-summarizer",
    sourceFiles: ["apps/backend/src/faq/faq.module.ts"],
  },
  {
    name: "knowledge-sync",
    sourceFiles: ["apps/backend/src/knowledge-pool/knowledge-pool.module.ts"],
  },
  {
    name: "proactive-chat",
    sourceFiles: [
      "apps/backend/src/proactive-chat/proactive-chat.constants.ts",
    ],
  },
  {
    name: "sla-processing",
    sourceFiles: ["apps/backend/src/automation/automation.module.ts"],
  },
]);

export const APPROVED_CRON_DECLARATIONS = Object.freeze([
  {
    sourceFile:
      "apps/backend/src/announcements/announcement-log-reconciliation.service.ts",
    runtimeSingletonVerified: false,
  },
  {
    sourceFile: "apps/backend/src/email/email-inbound.service.ts",
    runtimeSingletonVerified: false,
  },
  {
    sourceFile: "apps/backend/src/notifications/notifications.gateway.ts",
    runtimeSingletonVerified: false,
  },
  {
    sourceFile: "apps/backend/src/faq/faq.cron.service.ts",
    runtimeSingletonVerified: false,
  },
  {
    sourceFile: "apps/backend/src/ai/ticket-clustering.service.ts",
    runtimeSingletonVerified: false,
  },
  {
    sourceFile: "apps/backend/src/ai/ai-budget-monitor.service.ts",
    runtimeSingletonVerified: false,
  },
  {
    sourceFile: "apps/backend/src/ai/ai-health-event.service.ts",
    runtimeSingletonVerified: false,
  },
  {
    sourceFile: "apps/backend/src/ai/rag-observability.service.ts",
    runtimeSingletonVerified: false,
  },
  {
    sourceFile: "apps/backend/src/ai/ai-reporting.service.ts",
    runtimeSingletonVerified: false,
  },
]);

export const APPROVED_REPEATABLE_JOBS = Object.freeze([
  {
    queue: "crm-sync",
    jobId: "crm-delta-sync-repeatable",
    sourceFile: "apps/backend/src/crm/services/crm-delta-sync.service.ts",
    runtimeSingletonVerified: false,
  },
  {
    queue: "sla-processing",
    jobId: "sla-auto-close-tickets-repeatable",
    sourceFile: "apps/backend/src/automation/sla.cron.ts",
    runtimeSingletonVerified: false,
  },
  {
    queue: "sla-processing",
    jobId: "sla-check-breaches-repeatable",
    sourceFile: "apps/backend/src/automation/sla.cron.ts",
    runtimeSingletonVerified: false,
  },
  {
    queue: "sla-processing",
    jobId: "sla-check-warnings-repeatable",
    sourceFile: "apps/backend/src/automation/sla.cron.ts",
    runtimeSingletonVerified: false,
  },
]);

export const READ_ONLY_OPERATIONS = Object.freeze([
  {
    id: "postgres-migration-ledger",
    transport: "postgres",
    statements: [
      "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY",
      "SET LOCAL statement_timeout = 30000",
      'SELECT migration_name, checksum, started_at, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at ASC',
      "ROLLBACK",
    ],
    outputClassification: "private-redacted-metadata",
  },
  {
    id: "postgres-runtime-capabilities",
    transport: "postgres",
    statements: [
      "SELECT current_database() AS database_name, current_setting('server_version') AS server_version, pg_is_in_recovery() AS is_replica",
      "SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'pgcrypto') ORDER BY extname",
    ],
    outputClassification: "private-redacted-metadata",
  },
  {
    id: "postgres-object-reference-summary",
    transport: "postgres",
    statements: [
      "SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE url LIKE 'FAILED_STORAGE_UPLOAD_%') AS failed_storage FROM attachments",
      "SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE file_path IS NOT NULL) AS with_storage_key FROM knowledge_sources",
      "SELECT COUNT(*) AS branding_logo_settings FROM settings WHERE key = 'branding.logo_url'",
    ],
    outputClassification: "private-counts-only",
  },
  {
    id: "r2-object-manifest",
    transport: "s3-compatible",
    actions: ["ListObjectsV2", "HeadObject"],
    forbiddenActions: ["GetObject", "PutObject", "DeleteObject", "CopyObject"],
    outputClassification: "private-key-size-etag-last-modified",
  },
  {
    id: "redis-runtime-and-bullmq-inventory",
    transport: "redis",
    actions: [
      "INFO persistence",
      "INFO stats",
      "CONFIG GET maxmemory",
      "CONFIG GET maxmemory-policy",
      "SCAN",
      "TYPE",
      "LLEN",
      "ZCARD",
      "SCARD",
    ],
    forbiddenActions: [
      "DEL",
      "FLUSHALL",
      "FLUSHDB",
      "SET",
      "HSET",
      "ZADD",
      "LPOP",
      "RPOP",
      "PAUSE",
      "RESUME",
    ],
    outputClassification: "private-counts-and-job-identifiers",
  },
]);

const FORBIDDEN_SQL =
  /\b(?:ALTER|ANALYZE|CALL|COMMENT|COPY|CREATE|DEALLOCATE|DELETE|DO|DROP|EXECUTE|GRANT|INSERT|LISTEN|LOCK|MERGE|NOTIFY|PREPARE|REASSIGN|REFRESH|REINDEX|RESET|REVOKE|SECURITY|SETVAL|TRUNCATE|UNLISTEN|UPDATE|VACUUM)\b|\bFOR\s+(?:NO\s+KEY\s+UPDATE|UPDATE|SHARE|KEY\s+SHARE)\b|\bINTO\s+(?:TEMP|TEMPORARY|UNLOGGED|[a-z_"])|\bPG_(?:ADVISORY|CANCEL_BACKEND|LOG_BACKEND_MEMORY_CONTEXTS|RELOAD_CONF|ROTATE_LOGFILE|SLEEP|TERMINATE_BACKEND)\s*\(|\bNEXTVAL\s*\(/i;

function normalizeSql(sql) {
  return sql.trim().replace(/;$/, "");
}

const APPROVED_SQL_STATEMENTS = new Set(
  READ_ONLY_OPERATIONS.filter(
    (operation) => operation.transport === "postgres",
  ).flatMap((operation) => operation.statements.map(normalizeSql)),
);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function assertReadOnlySql(sql) {
  if (typeof sql !== "string" || sql.trim().length === 0) {
    throw new Error("Read-only SQL allowlist requires a non-empty string");
  }
  const normalized = normalizeSql(sql);
  if (
    normalized.includes(";") ||
    /--|\/\*/.test(normalized) ||
    FORBIDDEN_SQL.test(normalized)
  ) {
    throw new Error("Statement is outside the read-only SQL allowlist");
  }
  const allowedStart =
    /^(?:SELECT\b|SHOW\b|SET\s+LOCAL\s+(?:statement_timeout|lock_timeout)\s*=\s*\d+\b|BEGIN\s+TRANSACTION\s+ISOLATION\s+LEVEL\s+REPEATABLE\s+READ\s+READ\s+ONLY$|ROLLBACK$)/i;
  if (!allowedStart.test(normalized)) {
    throw new Error("Statement is outside the read-only SQL allowlist");
  }
  if (!APPROVED_SQL_STATEMENTS.has(normalized)) {
    throw new Error("Statement is outside the read-only SQL allowlist");
  }
  return normalized;
}

export function assertPrivateEvidencePath(outputPath) {
  if (typeof outputPath !== "string" || outputPath.trim().length === 0) {
    throw new Error("Evidence output path is required");
  }
  const resolved = path.resolve(projectDirectory, outputPath);
  if (
    resolved === privateRoot ||
    !resolved.startsWith(`${privateRoot}${path.sep}`)
  ) {
    throw new Error(
      "Inventory evidence must stay under the git-ignored .private-data directory",
    );
  }
  return resolved;
}

export function buildInventoryPreparationPlan({ gitSha, generatedAt }) {
  if (!/^[0-9a-f]{40}$/.test(gitSha ?? "")) {
    throw new Error("Preparation plan requires an exact 40-character Git SHA");
  }
  if (Number.isNaN(Date.parse(generatedAt))) {
    throw new Error("Preparation plan requires a valid generatedAt timestamp");
  }
  const operationContracts = READ_ONLY_OPERATIONS.map((operation) => ({
    id: operation.id,
    transport: operation.transport,
    outputClassification: operation.outputClassification,
    contractSha256: sha256(JSON.stringify(operation)),
  }));
  return {
    schemaVersion: 1,
    status: "prepared-local-only",
    productionAccessPerformed: false,
    productionGo: false,
    operatorApprovalRequired: true,
    gitSha,
    generatedAt,
    queues: [...APPROVED_QUEUE_NAMES],
    cronDeclarations: APPROVED_CRON_DECLARATIONS.map((cron) => ({
      ...cron,
    })),
    repeatableJobs: APPROVED_REPEATABLE_JOBS.map((job) => ({ ...job })),
    operationContracts,
    requiredFutureCredentialScopes: [
      "postgres-select-only-or-enforced-read-only-transaction",
      "r2-object-read-list-without-write-delete",
      "redis-read-command-allowlist",
    ],
    forbiddenActions: [
      "database-write",
      "object-download",
      "object-upload",
      "object-delete",
      "queue-mutation",
      "redis-mutation",
      "migration",
      "seed",
      "deploy",
    ],
    nextGate: "separate-user-approval-for-live-read-only-inventory-access",
  };
}

export function parsePreparationArguments(argv) {
  const result = {
    outputPath: defaultOutputPath,
    gitSha: undefined,
    generatedAt: new Date().toISOString(),
    help: false,
    prepareRequested: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--execute") {
      throw new Error(
        "A.1.4 preparation does not permit production access or execution",
      );
    }
    if (argument === "--prepare") {
      result.prepareRequested = true;
      continue;
    }
    if (argument === "--help") {
      result.help = true;
      continue;
    }
    if (["--output", "--git-sha", "--generated-at"].includes(argument)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} requires a value`);
      }
      index += 1;
      if (argument === "--output") result.outputPath = value;
      if (argument === "--git-sha") result.gitSha = value;
      if (argument === "--generated-at") result.generatedAt = value;
      continue;
    }
    throw new Error(`Unknown argument: ${argument}`);
  }
  if (!result.help && !result.prepareRequested) {
    throw new Error("A.1.4 requires an explicit --prepare acknowledgement");
  }
  return result;
}

async function assertPrivateDirectory(directoryPath) {
  const metadata = await lstat(directoryPath);
  if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
    throw new Error(
      "Private evidence path contains a non-directory or symlink",
    );
  }
  if (
    typeof process.getuid === "function" &&
    metadata.uid !== process.getuid()
  ) {
    throw new Error("Private evidence directory is not owned by this user");
  }
  if ((metadata.mode & 0o077) !== 0) {
    throw new Error("Private evidence directory grants group/world access");
  }
}

async function ensurePrivateDirectoryChain(parentPath) {
  try {
    await lstat(privateRoot);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    await mkdir(privateRoot, { mode: 0o700 });
  }
  await assertPrivateDirectory(privateRoot);
  const relative = path.relative(privateRoot, parentPath);
  let current = privateRoot;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    let created = false;
    try {
      await lstat(current);
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      await mkdir(current, { mode: 0o700 });
      created = true;
    }
    if (created) await chmod(current, 0o700);
    await assertPrivateDirectory(current);
  }
}

export async function writePreparationPlan(outputPath, plan) {
  const resolvedOutput = assertPrivateEvidencePath(outputPath);
  const parent = path.dirname(resolvedOutput);
  await ensurePrivateDirectoryChain(parent);
  try {
    await lstat(resolvedOutput);
    throw new Error("Inventory preparation plan already exists");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const temporaryPath = path.join(
    parent,
    `.${path.basename(resolvedOutput)}.tmp-${process.pid}-${randomUUID()}`,
  );
  let handle;
  try {
    handle = await open(temporaryPath, "wx", 0o600);
    await handle.writeFile(`${JSON.stringify(plan, null, 2)}\n`, "utf8");
    await handle.sync();
    await handle.close();
    handle = undefined;
    await chmod(temporaryPath, 0o600);
    try {
      await link(temporaryPath, resolvedOutput);
    } catch (error) {
      if (error?.code === "EEXIST") {
        throw new Error("Inventory preparation plan already exists");
      }
      throw error;
    }
    const parentHandle = await open(parent, "r");
    try {
      await parentHandle.sync();
    } finally {
      await parentHandle.close();
    }
    return resolvedOutput;
  } finally {
    if (handle) await handle.close().catch(() => undefined);
    await unlink(temporaryPath).catch((error) => {
      if (error?.code !== "ENOENT") throw error;
    });
  }
}

async function main() {
  const options = parsePreparationArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(
      "Usage: node scripts/release-a14-inventory-contract.mjs --prepare --git-sha <40-hex-sha> [--output <.private-data/path>]\n",
    );
    return;
  }
  const plan = buildInventoryPreparationPlan({
    gitSha: options.gitSha,
    generatedAt: options.generatedAt,
  });
  const writtenPath = await writePreparationPlan(options.outputPath, plan);
  process.stdout.write(
    `A.1.4 local-only inventory preparation complete: ${path.relative(projectDirectory, writtenPath)}\n`,
  );
  process.stdout.write(
    "Production access was not performed. Production remains NO-GO.\n",
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  main().catch((error) => {
    process.stderr.write(`A.1.4 preparation failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
