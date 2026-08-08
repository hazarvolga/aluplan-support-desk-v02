import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmod,
  mkdtemp,
  mkdir,
  readdir,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = fileURLToPath(new URL("..", import.meta.url));
export const rootBackupScript = path.join(repoRoot, "scripts", "backup-db.sh");
export const packageBackupScript = path.join(
  repoRoot,
  "packages",
  "database",
  "scripts",
  "backup.sh",
);

const tempRoots = new Set();

export async function cleanupHarnesses() {
  await Promise.all(
    [...tempRoots].map((tempRoot) =>
      rm(tempRoot, { recursive: true, force: true }),
    ),
  );
  tempRoots.clear();
}

async function writeExecutable(filePath, source) {
  await writeFile(filePath, source, "utf8");
  await chmod(filePath, 0o755);
}

async function installFakePostgresTools(fakeBin) {
  await writeExecutable(
    path.join(fakeBin, "pg_dump"),
    `#!/bin/sh
set -eu
printf 'pg_dump %s\\n' "$*" >> "$FAKE_COMMAND_LOG"
if [ "\${1:-}" = '--version' ]; then
  printf 'pg_dump (PostgreSQL) %s\\n' "\${FAKE_PG_DUMP_VERSION:-17.5}"
  exit 0
fi
output=''
while [ "$#" -gt 0 ]; do
  case "$1" in
    --file=*) output="\${1#--file=}" ;;
    --file) shift; output="$1" ;;
  esac
  shift
done
if [ "\${FAKE_PG_DUMP_EMPTY:-0}" = '1' ]; then
  : > "$output"
elif [ -n "$output" ]; then
  printf 'PGDMP-test-artifact' > "$output"
else
  printf 'PGDMP-test-artifact'
fi
exit "\${FAKE_PG_DUMP_EXIT:-0}"
`,
  );
  await writeExecutable(
    path.join(fakeBin, "pg_restore"),
    `#!/bin/sh
set -eu
printf 'pg_restore %s\\n' "$*" >> "$FAKE_COMMAND_LOG"
if [ "\${1:-}" = '--version' ]; then
  printf 'pg_restore (PostgreSQL) %s\\n' "\${FAKE_PG_RESTORE_VERSION:-17.5}"
  exit 0
fi
exit "\${FAKE_PG_RESTORE_EXIT:-0}"
`,
  );
}

async function installFakeChecksumTools(fakeBin) {
  await writeExecutable(
    path.join(fakeBin, "sha256sum"),
    `#!/bin/sh
set -eu
printf 'sha256sum %s\\n' "$*" >> "$FAKE_COMMAND_LOG"
if [ "\${FAKE_SHA256_EXIT:-0}" -ne 0 ]; then
  exit "$FAKE_SHA256_EXIT"
fi
if [ -x /usr/bin/sha256sum ]; then
  /usr/bin/sha256sum "$1"
elif [ -x /usr/bin/shasum ]; then
  /usr/bin/shasum -a 256 "$1"
else
  exit 10
fi
`,
  );
  await writeExecutable(
    path.join(fakeBin, "shasum"),
    `#!/bin/sh
set -eu
printf 'shasum %s\\n' "$*" >> "$FAKE_COMMAND_LOG"
exec /usr/bin/shasum "$@"
`,
  );
}

async function installFakeClockTools(fakeBin) {
  await writeExecutable(
    path.join(fakeBin, "date"),
    `#!/bin/sh
set -eu
if [ -n "\${FAKE_DATE_OUTPUT:-}" ]; then
  printf '%s\\n' "$FAKE_DATE_OUTPUT"
else
  exec /bin/date "$@"
fi
`,
  );
  await writeExecutable(
    path.join(fakeBin, "mktemp"),
    `#!/bin/sh
set -eu
printf 'mktemp %s\\n' "$*" >> "$FAKE_COMMAND_LOG"
if [ "\${FAKE_MKTEMP_EXIT:-0}" -ne 0 ]; then
  exit "$FAKE_MKTEMP_EXIT"
fi
if [ -n "\${FAKE_MKTEMP_SUFFIX:-}" ] && [ "\${1:-}" = '-d' ]; then
  target="\${2%XXXXXX}\${FAKE_MKTEMP_SUFFIX}"
  mkdir "$target"
  printf '%s\\n' "$target"
  exit 0
fi
exec /usr/bin/mktemp "$@"
`,
  );
}

const FAKE_AWS_SOURCE = `#!/bin/sh
set -eu
printf 'aws %s\\n' "$*" >> "$FAKE_COMMAND_LOG"
if [ "\${AWS_IGNORE_CONFIGURED_ENDPOINT_URLS:-}" != 'true' ]; then
  printf 'configured-endpoint-policy-missing\\n' >> "$FAKE_COMMAND_LOG"
  exit 13
fi
if [ -n "\${DATABASE_URL:-}" ] || [ -n "\${PGDATABASE:-}" ]; then
  printf 'secret-env-present\\n' >> "$FAKE_COMMAND_LOG"
fi
case "$*" in
  *"\${FAKE_AWS_FAIL_MATCH:-__never_match__}"*) exit 9 ;;
esac
if [ "\${1:-}" = '--endpoint-url' ]; then
  shift 2
fi
if [ "\${1:-}" = 's3api' ] && [ "\${2:-}" = 'put-object' ]; then
  shift 2
  bucket=''
  key=''
  body=''
  metadata=''
  if_none_match=''
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --bucket) shift; bucket="$1" ;;
      --key) shift; key="$1" ;;
      --body) shift; body="$1" ;;
      --metadata) shift; metadata="$1" ;;
      --if-none-match) shift; if_none_match="$1" ;;
    esac
    shift
  done
  object_path="$FAKE_AWS_OBJECT_ROOT/$bucket/$key"
  if [ "$if_none_match" = '*' ] && [ -e "$object_path" ]; then
    exit 42
  fi
  mkdir -p "$(dirname "$object_path")"
  cp "$body" "$object_path"
  if [ -n "$metadata" ]; then
    printf '%s\\n' "$metadata" > "$object_path.metadata"
  fi
elif [ "\${1:-}" = 's3' ] && [ "\${2:-}" = 'rm' ]; then
  object_uri="$3"
  object_path="$FAKE_AWS_OBJECT_ROOT/\${object_uri#s3://}"
  rm -f "$object_path" "$object_path.metadata"
elif [ "\${1:-}" = 's3api' ] && [ "\${2:-}" = 'head-object' ]; then
  shift 2
  bucket=''
  key=''
  query=''
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --bucket) shift; bucket="$1" ;;
      --key) shift; key="$1" ;;
      --query) shift; query="$1" ;;
    esac
    shift
  done
  object_path="$FAKE_AWS_OBJECT_ROOT/$bucket/$key"
  [ -f "$object_path" ] || exit 44
  if [ "$query" = '[ContentLength,Metadata.sha256]' ]; then
    object_size="$(wc -c < "$object_path" | tr -d '[:space:]')"
    if [ -n "\${FAKE_AWS_SIZE_OVERRIDE:-}" ]; then
      object_size="$FAKE_AWS_SIZE_OVERRIDE"
    fi
    if [ -n "\${FAKE_AWS_HEAD_OVERRIDE:-}" ]; then
      object_hash="$FAKE_AWS_HEAD_OVERRIDE"
    else
      object_hash="$(sed -n 's/^sha256=\\([^,]*\\).*$/\\1/p' "$object_path.metadata")"
    fi
    printf '%s\\t%s\\n' "$object_size" "$object_hash"
  fi
fi
`;

async function installFakeAwsTool(fakeBin) {
  await writeExecutable(path.join(fakeBin, "aws"), FAKE_AWS_SOURCE);
}

async function initializeHarnessDirectories() {
  const rawRoot = await mkdtemp(path.join(os.tmpdir(), "aluplan-backup-test-"));
  const root = await realpath(rawRoot);
  const paths = {
    root,
    fakeBin: path.join(root, "bin"),
    backupDir: path.join(root, "backups"),
    commandLog: path.join(root, "commands.log"),
    awsObjectRoot: path.join(root, "aws-objects"),
  };
  tempRoots.add(root);
  await Promise.all([
    mkdir(paths.fakeBin),
    mkdir(paths.backupDir),
    mkdir(paths.awsObjectRoot),
  ]);
  await chmod(paths.backupDir, 0o700);
  const marker = path.join(paths.backupDir, ".aluplan-backup-root");
  await writeFile(marker, "ALUPLAN_BACKUP_ROOT_V1\n", "utf8");
  await chmod(marker, 0o600);
  return paths;
}

export async function createHarness() {
  const harness = await initializeHarnessDirectories();
  await Promise.all([
    installFakePostgresTools(harness.fakeBin),
    installFakeChecksumTools(harness.fakeBin),
    installFakeClockTools(harness.fakeBin),
    installFakeAwsTool(harness.fakeBin),
  ]);
  return harness;
}

export function runBackup(scriptPath, harness, envOverrides = {}) {
  const env = { ...process.env };
  for (const key of [
    "DATABASE_URL",
    "ALLOW_DATABASE_BACKUP",
    "AWS_S3_BACKUP_BUCKET",
    "AWS_S3_BACKUP_PREFIX",
    "AWS_S3_ENDPOINT_URL",
    "ALLOW_LOCAL_ONLY_BACKUP",
    "BACKUP_ALLOWED_ROOT",
    "FAKE_PG_DUMP_EXIT",
    "FAKE_PG_DUMP_EMPTY",
    "FAKE_PG_DUMP_VERSION",
    "FAKE_PG_RESTORE_EXIT",
    "FAKE_PG_RESTORE_VERSION",
    "FAKE_SHA256_EXIT",
    "FAKE_AWS_FAIL_MATCH",
    "FAKE_AWS_HEAD_OVERRIDE",
    "FAKE_AWS_SIZE_OVERRIDE",
    "FAKE_MKTEMP_EXIT",
    "FAKE_MKTEMP_SUFFIX",
    "FAKE_DATE_OUTPUT",
    "ALLOW_INSECURE_LOCAL_S3_ENDPOINT",
    "AWS_ENDPOINT_URL",
    "AWS_ENDPOINT_URL_S3",
    "AWS_IGNORE_CONFIGURED_ENDPOINT_URLS",
    "AWS_CONFIG_FILE",
  ]) {
    delete env[key];
  }

  return spawnSync("/bin/bash", [scriptPath], {
    cwd: harness.root,
    encoding: "utf8",
    env: {
      ...env,
      PATH: `${harness.fakeBin}:/usr/bin:/bin`,
      BACKUP_TOOL_PATH: `${harness.fakeBin}:/usr/bin:/bin`,
      BACKUP_DIR: harness.backupDir,
      BACKUP_ALLOWED_ROOT: harness.backupDir,
      FAKE_COMMAND_LOG: harness.commandLog,
      FAKE_AWS_OBJECT_ROOT: harness.awsObjectRoot,
      ...envOverrides,
    },
    timeout: 5_000,
  });
}

export async function listArtifacts(backupDir) {
  return (await readdir(backupDir))
    .filter((entry) => !entry.startsWith("."))
    .sort();
}

export async function listFilesRecursively(rootDir, relativeDir = "") {
  const currentDir = path.join(rootDir, relativeDir);
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(rootDir, relativePath)));
    } else {
      files.push(relativePath);
    }
  }

  return files.sort();
}

export async function getPublishedArtifact(backupDir) {
  const topLevel = (await readdir(backupDir, { withFileTypes: true })).filter(
    (entry) => !entry.name.startsWith("."),
  );
  assert.equal(topLevel.length, 1);
  assert.equal(topLevel[0].isDirectory(), true);
  return path.join(backupDir, topLevel[0].name);
}
