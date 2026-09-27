import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  chmod,
  mkdir,
  readFile,
  readdir,
  stat,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  cleanupHarnesses,
  createHarness,
  getPublishedArtifact,
  listArtifacts,
  listFilesRecursively,
  packageBackupScript,
  repoRoot,
  rootBackupScript,
  runBackup,
} from "./backup-test-harness.mjs";

test.after(cleanupHarnesses);

test("backup accepts an operator-owned mode-0700 root on Linux and macOS", async () => {
  const harness = await createHarness();
  const metadata = await stat(harness.backupDir);
  assert.equal(metadata.uid, process.getuid());
  assert.equal(metadata.mode & 0o777, 0o700);

  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    ALLOW_LOCAL_ONLY_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("backup still rejects an operator-owned root with permissive mode", async () => {
  const harness = await createHarness();
  await chmod(harness.backupDir, 0o755);

  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    ALLOW_LOCAL_ONLY_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
  });
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /operator-owned with mode 0700/);
  assert.deepEqual(await listArtifacts(harness.backupDir), []);
});

test("the test harness keeps createHarness focused and reviewable", () => {
  const meaningfulLines = createHarness
    .toString()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("//"));

  assert.ok(
    meaningfulLines.length <= 50,
    `createHarness has ${meaningfulLines.length} meaningful lines`,
  );
});

for (const [name, scriptPath] of [
  ["root entrypoint", rootBackupScript],
  ["database package entrypoint", packageBackupScript],
]) {
  test(`${name} requires an explicit backup opt-in`, async () => {
    const harness = await createHarness();
    const result = runBackup(scriptPath, harness, {
      DATABASE_URL: "postgresql://do-not-print.invalid/aluplan",
    });

    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /ALLOW_DATABASE_BACKUP/);
    assert.doesNotMatch(`${result.stdout}\n${result.stderr}`, /do-not-print/);
    await assert.rejects(readFile(harness.commandLog, "utf8"));
  });

  test(`${name} refuses to run without DATABASE_URL`, async () => {
    const harness = await createHarness();
    const result = runBackup(scriptPath, harness, {
      ALLOW_DATABASE_BACKUP: "1",
    });

    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /DATABASE_URL/);
    await assert.rejects(readFile(harness.commandLog, "utf8"));
    assert.deepEqual(await listArtifacts(harness.backupDir), []);
  });

  test(`${name} never publishes a partial dump`, async () => {
    const harness = await createHarness();
    const result = runBackup(scriptPath, harness, {
      ALLOW_DATABASE_BACKUP: "1",
      ALLOW_LOCAL_ONLY_BACKUP: "1",
      DATABASE_URL: "postgresql://example.invalid/aluplan",
      FAKE_PG_DUMP_EXIT: "7",
    });

    assert.notEqual(result.status, 0);
    assert.deepEqual(await listArtifacts(harness.backupDir), []);
  });

  test(`${name} rejects an invalid custom-format archive`, async () => {
    const harness = await createHarness();
    const result = runBackup(scriptPath, harness, {
      ALLOW_DATABASE_BACKUP: "1",
      ALLOW_LOCAL_ONLY_BACKUP: "1",
      DATABASE_URL: "postgresql://example.invalid/aluplan",
      FAKE_PG_RESTORE_EXIT: "8",
    });

    assert.notEqual(result.status, 0);
    assert.deepEqual(await listArtifacts(harness.backupDir), []);
  });

  test(`${name} fails closed when checksum generation fails`, async () => {
    const harness = await createHarness();
    const result = runBackup(scriptPath, harness, {
      ALLOW_DATABASE_BACKUP: "1",
      ALLOW_LOCAL_ONLY_BACKUP: "1",
      DATABASE_URL: "postgresql://example.invalid/aluplan",
      FAKE_SHA256_EXIT: "6",
    });

    assert.notEqual(result.status, 0);
    assert.deepEqual(await listArtifacts(harness.backupDir), []);
  });

  test(`${name} publishes only a verified mode-0600 dump and checksum`, async () => {
    const harness = await createHarness();
    const result = runBackup(scriptPath, harness, {
      ALLOW_DATABASE_BACKUP: "1",
      ALLOW_LOCAL_ONLY_BACKUP: "1",
      DATABASE_URL: "postgresql://example.invalid/aluplan",
    });

    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    const artifactDir = await getPublishedArtifact(harness.backupDir);
    const artifacts = (await readdir(artifactDir)).sort();
    assert.deepEqual(artifacts, [
      "READY.json",
      "database.dump",
      "database.dump.sha256",
    ]);
    const dumpName = "database.dump";
    const checksumName = "database.dump.sha256";
    assert.equal(
      (await stat(path.join(artifactDir, dumpName))).mode & 0o777,
      0o600,
    );
    assert.equal(
      (await stat(path.join(artifactDir, checksumName))).mode & 0o777,
      0o600,
    );
    assert.equal(
      (await stat(path.join(artifactDir, "READY.json"))).mode & 0o777,
      0o600,
    );

    const checksum = await readFile(
      path.join(artifactDir, checksumName),
      "utf8",
    );
    assert.match(checksum, /^[a-f0-9]{64}  database\.dump\n$/);
    const dump = await readFile(path.join(artifactDir, dumpName));
    assert.equal(
      checksum.slice(0, 64),
      createHash("sha256").update(dump).digest("hex"),
    );

    const commands = await readFile(harness.commandLog, "utf8");
    assert.match(commands, /pg_dump .*--format=custom/);
    assert.match(commands, /pg_dump .*--no-owner/);
    assert.match(commands, /pg_dump .*--no-privileges/);
    assert.match(commands, /pg_restore --list /);
    assert.doesNotMatch(commands, /example\.invalid/);
  });

  test(`${name} rejects empty dump output`, async () => {
    const harness = await createHarness();
    const result = runBackup(scriptPath, harness, {
      ALLOW_DATABASE_BACKUP: "1",
      ALLOW_LOCAL_ONLY_BACKUP: "1",
      DATABASE_URL: "postgresql://example.invalid/aluplan",
      FAKE_PG_DUMP_EMPTY: "1",
    });

    assert.notEqual(result.status, 0);
    assert.deepEqual(await listArtifacts(harness.backupDir), []);
  });

  test(`${name} rejects non-PG17 or mismatched client tools`, async () => {
    const harness = await createHarness();
    const result = runBackup(scriptPath, harness, {
      ALLOW_DATABASE_BACKUP: "1",
      ALLOW_LOCAL_ONLY_BACKUP: "1",
      DATABASE_URL: "postgresql://example.invalid/aluplan",
      FAKE_PG_DUMP_VERSION: "17.5",
      FAKE_PG_RESTORE_VERSION: "16.9",
    });

    assert.notEqual(result.status, 0);
    const commands = await readFile(harness.commandLog, "utf8");
    assert.doesNotMatch(commands, /pg_dump .*--format=custom/);
    assert.deepEqual(await listArtifacts(harness.backupDir), []);
  });
}

test("backup entrypoints do not auto-load DATABASE_URL from .env", async () => {
  const harness = await createHarness();
  await writeFile(
    path.join(harness.root, ".env"),
    "DATABASE_URL=postgresql://must-not-be-loaded.invalid/aluplan\n",
    "utf8",
  );

  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    ALLOW_LOCAL_ONLY_BACKUP: "1",
  });

  assert.notEqual(result.status, 0);
  assert.doesNotMatch(
    `${result.stdout}\n${result.stderr}`,
    /must-not-be-loaded/,
  );
  await assert.rejects(readFile(harness.commandLog, "utf8"));
});

test("configured S3 upload fails closed when dump upload fails", async () => {
  const harness = await createHarness();
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    AWS_S3_BACKUP_BUCKET: "test-backups",
    FAKE_AWS_FAIL_MATCH: "/database.dump --body",
  });

  assert.notEqual(result.status, 0);
  assert.deepEqual(await listArtifacts(harness.backupDir), []);
});

test("configured S3 upload fails closed when checksum upload fails", async () => {
  const harness = await createHarness();
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    AWS_S3_BACKUP_BUCKET: "test-backups",
    FAKE_AWS_FAIL_MATCH: ".sha256",
  });

  assert.notEqual(result.status, 0);
  const commands = await readFile(harness.commandLog, "utf8");
  assert.match(
    commands,
    /aws s3api put-object --bucket test-backups --key .*\/database\.dump /,
  );
  assert.match(
    commands,
    /aws s3api put-object --bucket test-backups --key .*\/database\.dump\.sha256 /,
  );
});

test("configured S3 upload publishes both artifacts under the explicit prefix", async () => {
  const harness = await createHarness();
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    AWS_S3_BACKUP_BUCKET: "test-backups",
    AWS_S3_BACKUP_PREFIX: "release-candidates/database",
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const commands = await readFile(harness.commandLog, "utf8");
  assert.match(
    commands,
    /aws s3api put-object --bucket test-backups --key release-candidates\/database\/.*\/database\.dump /,
  );
  assert.match(
    commands,
    /aws s3api put-object --bucket test-backups --key release-candidates\/database\/.*\/database\.dump\.sha256 /,
  );
});

test("ops-safety command includes the backup behavior contract", async () => {
  const rootPackage = JSON.parse(
    await readFile(path.join(repoRoot, "package.json"), "utf8"),
  );

  assert.match(
    rootPackage.scripts["test:ops-safety"],
    /backup-safety\.test\.mjs/,
  );
});

test("external backup is required unless local-only mode is explicitly acknowledged", async () => {
  const harness = await createHarness();
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
  });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /external|S3|local-only/i);
  await assert.rejects(readFile(harness.commandLog, "utf8"));
});

test("local publish uses one ready-marked artifact directory", async () => {
  const harness = await createHarness();
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    ALLOW_LOCAL_ONLY_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const topLevel = (
    await readdir(harness.backupDir, { withFileTypes: true })
  ).filter((entry) => !entry.name.startsWith("."));
  assert.equal(topLevel.length, 1);
  assert.equal(topLevel[0].isDirectory(), true);
  assert.equal(topLevel[0].name.startsWith("aluplan_backup_"), true);
  assert.deepEqual(
    (await readdir(path.join(harness.backupDir, topLevel[0].name))).sort(),
    ["READY.json", "database.dump", "database.dump.sha256"],
  );
  const manifest = JSON.parse(
    await readFile(
      path.join(harness.backupDir, topLevel[0].name, "READY.json"),
      "utf8",
    ),
  );
  assert.deepEqual(
    {
      schemaVersion: manifest.schemaVersion,
      status: manifest.status,
      mode: manifest.mode,
      format: manifest.format,
      postgresClientMajor: manifest.postgresClientMajor,
    },
    {
      schemaVersion: 1,
      status: "complete",
      mode: "local-only",
      format: "custom",
      postgresClientMajor: 17,
    },
  );
});

test("a final-directory collision never deletes the existing artifact", async () => {
  const harness = await createHarness();
  const existingArtifact = path.join(
    harness.backupDir,
    "aluplan_backup_20260808T000000Z_collision",
  );
  const sentinel = path.join(existingArtifact, "existing-backup.txt");
  await mkdir(existingArtifact);
  await writeFile(sentinel, "keep-existing-backup\n", "utf8");

  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    ALLOW_LOCAL_ONLY_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    FAKE_DATE_OUTPUT: "20260808T000000Z",
    FAKE_MKTEMP_SUFFIX: "collision",
  });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /refusing to overwrite/i);
  assert.equal(await readFile(sentinel, "utf8"), "keep-existing-backup\n");
  assert.deepEqual(await readdir(existingArtifact), ["existing-backup.txt"]);
});

test("backup directory must stay inside its explicit allowed root", async () => {
  const harness = await createHarness();
  const beforeMode = (await stat(harness.backupDir)).mode & 0o777;
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    ALLOW_LOCAL_ONLY_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    BACKUP_DIR: path.join(harness.root, "outside"),
    BACKUP_ALLOWED_ROOT: harness.backupDir,
  });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /BACKUP_ALLOWED_ROOT/);
  assert.equal((await stat(harness.backupDir)).mode & 0o777, beforeMode);
  await assert.rejects(stat(path.join(harness.root, "outside")));
  const commands = await readFile(harness.commandLog, "utf8");
  assert.doesNotMatch(commands, /pg_dump .*--format=custom/);
});

test("a backup directory override requires an explicit narrow allowed root", async () => {
  const harness = await createHarness();
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    ALLOW_LOCAL_ONLY_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    BACKUP_DIR: path.join(harness.root, "unbounded"),
    BACKUP_ALLOWED_ROOT: "",
  });

  assert.notEqual(result.status, 0);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /dedicated BACKUP_ALLOWED_ROOT/i,
  );
  const commands = await readFile(harness.commandLog, "utf8");
  assert.doesNotMatch(commands, /pg_dump .*--format=custom/);
});

test("a broad allowed root is rejected before its mode can change", async () => {
  const harness = await createHarness();
  const beforeMode = (await stat("/tmp")).mode & 0o777;
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    ALLOW_LOCAL_ONLY_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    BACKUP_DIR: "/tmp",
    BACKUP_ALLOWED_ROOT: "/tmp",
  });

  assert.notEqual(result.status, 0);
  assert.match(
    `${result.stdout}\n${result.stderr}`,
    /broad|private root marker|symbolic link/i,
  );
  assert.equal((await stat("/tmp")).mode & 0o777, beforeMode);
  const commands = await readFile(harness.commandLog, "utf8");
  assert.doesNotMatch(commands, /pg_dump .*--format=custom/);
});

test("an existing backup lock fails before database access", async () => {
  const harness = await createHarness();
  await mkdir(path.join(harness.backupDir, ".backup.lock"));
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    ALLOW_LOCAL_ONLY_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
  });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /already active/i);
  const commands = await readFile(harness.commandLog, "utf8");
  assert.doesNotMatch(commands, /pg_dump .*--format=custom/);
});

test("a pre-artifact mktemp failure releases the backup lock", async () => {
  const harness = await createHarness();
  const failed = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    ALLOW_LOCAL_ONLY_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    FAKE_MKTEMP_EXIT: "12",
  });

  assert.notEqual(failed.status, 0);
  await assert.rejects(stat(path.join(harness.backupDir, ".backup.lock")));

  const retry = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    ALLOW_LOCAL_ONLY_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
  });
  assert.equal(retry.status, 0, `${retry.stdout}\n${retry.stderr}`);
});

test("shasum is used when sha256sum is unavailable", async () => {
  const harness = await createHarness();
  await unlink(path.join(harness.fakeBin, "sha256sum"));
  const systemBin = path.join(harness.root, "system-bin");
  await mkdir(systemBin);
  for (const name of ["cat", "chmod", "mkdir", "mv", "rm", "rmdir"]) {
    await symlink(`/bin/${name}`, path.join(systemBin, name));
  }
  for (const name of ["dirname", "id", "stat", "tr", "wc"]) {
    await symlink(`/usr/bin/${name}`, path.join(systemBin, name));
  }
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    ALLOW_LOCAL_ONLY_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    BACKUP_TOOL_PATH: `${harness.fakeBin}:${systemBin}`,
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const commands = await readFile(harness.commandLog, "utf8");
  assert.match(commands, /shasum -a 256/);
});

test("remote publish verifies the dump and uploads READY manifest last", async () => {
  const harness = await createHarness();
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    AWS_S3_BACKUP_BUCKET: "test-backups",
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const commands = (await readFile(harness.commandLog, "utf8"))
    .trim()
    .split("\n");
  const headIndex = commands.findIndex((entry) =>
    entry.includes("s3api head-object"),
  );
  const readyIndex = commands.findIndex(
    (entry) =>
      entry.includes("s3api put-object") && entry.includes("READY.json"),
  );
  assert.ok(headIndex >= 0);
  assert.ok(readyIndex > headIndex);
  assert.equal(
    commands
      .slice(readyIndex + 1)
      .some((entry) => entry.includes("s3api put-object")),
    false,
  );
  assert.ok(
    commands
      .slice(readyIndex + 1)
      .some(
        (entry) =>
          entry.includes("s3api head-object") && entry.includes("READY.json"),
      ),
  );
  assert.equal(commands.includes("secret-env-present"), false);
  const remoteFiles = await listFilesRecursively(harness.awsObjectRoot);
  assert.equal(
    remoteFiles.some((file) => file.endsWith("/READY.json")),
    true,
  );
  assert.equal(
    remoteFiles.some((file) => file.endsWith("/database.dump")),
    true,
  );
  assert.equal(
    remoteFiles.some((file) => file.endsWith("/database.dump.sha256")),
    true,
  );
});

test("a remote run-id collision preserves every pre-existing object", async () => {
  const harness = await createHarness();
  const runId = "aluplan_backup_20260808T000000Z_collision";
  const existingRemoteDir = path.join(
    harness.awsObjectRoot,
    "test-backups",
    "db-backups",
    runId,
  );
  const existingObjects = {
    "database.dump": "existing-dump",
    "database.dump.sha256": "existing-checksum",
    "READY.json": "existing-ready",
  };
  await mkdir(existingRemoteDir, { recursive: true });
  await Promise.all(
    Object.entries(existingObjects).map(([name, value]) =>
      writeFile(path.join(existingRemoteDir, name), value, "utf8"),
    ),
  );

  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    AWS_S3_BACKUP_BUCKET: "test-backups",
    FAKE_DATE_OUTPUT: "20260808T000000Z",
    FAKE_MKTEMP_SUFFIX: "collision",
  });

  assert.notEqual(result.status, 0);
  const commands = await readFile(harness.commandLog, "utf8");
  assert.doesNotMatch(commands, /aws s3 rm/);
  for (const [name, value] of Object.entries(existingObjects)) {
    assert.equal(
      await readFile(path.join(existingRemoteDir, name), "utf8"),
      value,
    );
  }
});

test("a partial remote collision cleans up only newly created objects", async () => {
  const harness = await createHarness();
  const runId = "aluplan_backup_20260808T000000Z_partial";
  const existingRemoteDir = path.join(
    harness.awsObjectRoot,
    "test-backups",
    "db-backups",
    runId,
  );
  const existingChecksum = path.join(existingRemoteDir, "database.dump.sha256");
  await mkdir(existingRemoteDir, { recursive: true });
  await writeFile(existingChecksum, "existing-checksum", "utf8");

  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    AWS_S3_BACKUP_BUCKET: "test-backups",
    FAKE_DATE_OUTPUT: "20260808T000000Z",
    FAKE_MKTEMP_SUFFIX: "partial",
  });

  assert.notEqual(result.status, 0);
  assert.equal(await readFile(existingChecksum, "utf8"), "existing-checksum");
  assert.deepEqual(await readdir(existingRemoteDir), ["database.dump.sha256"]);
  const commands = await readFile(harness.commandLog, "utf8");
  assert.match(commands, /aws s3 rm .*database\.dump/);
  assert.doesNotMatch(commands, /aws s3 rm .*database\.dump\.sha256/);
  assert.doesNotMatch(commands, /s3api put-object .*READY\.json/);
});

test("remote checksum metadata mismatch fails closed and cleans up", async () => {
  const harness = await createHarness();
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    AWS_S3_BACKUP_BUCKET: "test-backups",
    FAKE_AWS_HEAD_OVERRIDE: "0".repeat(64),
  });

  assert.notEqual(result.status, 0);
  const commands = await readFile(harness.commandLog, "utf8");
  assert.match(commands, /aws .*s3 rm .*database\.dump/);
  assert.doesNotMatch(commands, /aws .*s3api put-object .*READY\.json/);
  assert.deepEqual(await listArtifacts(harness.backupDir), []);
  assert.deepEqual(await listFilesRecursively(harness.awsObjectRoot), []);
});

test("remote size mismatch fails closed and removes uploaded objects", async () => {
  const harness = await createHarness();
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    AWS_S3_BACKUP_BUCKET: "test-backups",
    FAKE_AWS_SIZE_OVERRIDE: "1",
  });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /size did not match/i);
  assert.deepEqual(await listFilesRecursively(harness.awsObjectRoot), []);
});

test("remote failure removes invocation-owned objects and never publishes READY", async () => {
  const harness = await createHarness();
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    AWS_S3_BACKUP_BUCKET: "test-backups",
    FAKE_AWS_FAIL_MATCH: ".sha256",
  });

  assert.notEqual(result.status, 0);
  const commands = await readFile(harness.commandLog, "utf8");
  assert.match(commands, /aws .*s3 rm .*database\.dump/);
  assert.doesNotMatch(commands, /aws .*s3api put-object .*READY\.json/);
  assert.deepEqual(await listFilesRecursively(harness.awsObjectRoot), []);
});

for (const endpoint of [
  "http://r2.example.com",
  "https://user@r2.example.com",
  "https://r2.example.com?bucket=test",
  "https://r2.example.com/#fragment",
]) {
  test(`unsafe external endpoint is rejected: ${endpoint}`, async () => {
    const harness = await createHarness();
    const result = runBackup(rootBackupScript, harness, {
      ALLOW_DATABASE_BACKUP: "1",
      DATABASE_URL: "postgresql://example.invalid/aluplan",
      AWS_S3_BACKUP_BUCKET: "test-backups",
      AWS_S3_ENDPOINT_URL: endpoint,
    });

    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /must be HTTPS/i);
    await assert.rejects(readFile(harness.commandLog, "utf8"));
    assert.deepEqual(await listFilesRecursively(harness.awsObjectRoot), []);
  });
}

test("generic AWS endpoint overrides are removed before upload", async () => {
  const harness = await createHarness();
  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    AWS_S3_BACKUP_BUCKET: "test-backups",
    AWS_ENDPOINT_URL: "http://malicious.invalid",
    AWS_ENDPOINT_URL_S3: "http://malicious.invalid",
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const commands = await readFile(harness.commandLog, "utf8");
  assert.doesNotMatch(commands, /malicious\.invalid/);
});

test("AWS shared-config endpoints are ignored before upload", async () => {
  const harness = await createHarness();
  const awsConfigFile = path.join(harness.root, "aws-config");
  await writeFile(
    awsConfigFile,
    "[default]\nendpoint_url = http://malicious-profile.invalid\n",
    "utf8",
  );

  const result = runBackup(rootBackupScript, harness, {
    ALLOW_DATABASE_BACKUP: "1",
    DATABASE_URL: "postgresql://example.invalid/aluplan",
    AWS_S3_BACKUP_BUCKET: "test-backups",
    AWS_CONFIG_FILE: awsConfigFile,
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const commands = await readFile(harness.commandLog, "utf8");
  assert.doesNotMatch(commands, /configured-endpoint-policy-missing/);
  assert.doesNotMatch(commands, /malicious-profile\.invalid/);
  assert.equal(
    (await listFilesRecursively(harness.awsObjectRoot)).some((file) =>
      file.endsWith("/READY.json"),
    ),
    true,
  );
});

test("production image contains the canonical backup runtime contract", async () => {
  const dockerfile = await readFile(
    path.join(repoRoot, "apps", "backend", "Dockerfile"),
    "utf8",
  );

  assert.match(dockerfile, /postgresql17-client/);
  assert.match(dockerfile, /\bbash\b/);
  assert.match(dockerfile, /\baws-cli\b/);
  assert.match(
    dockerfile,
    /COPY --from=builder \/app\/scripts\/backup-db\.sh \.\/scripts\/backup-db\.sh/,
  );
  assert.match(
    dockerfile,
    /chmod \+x[\s\S]*\.\/scripts\/backup-db\.sh[\s\S]*\.\/packages\/database\/scripts\/backup\.sh/,
  );
});
