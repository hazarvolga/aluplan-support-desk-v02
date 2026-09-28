import assert from "node:assert/strict";
import { chmod, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  cleanupA13Harnesses,
  commandLog,
  createA13Harness,
  runRestore,
  writeValidArtifact,
  repoRoot,
} from "./release-a13-test-harness.mjs";

test.after(cleanupA13Harnesses);

test("restore drill accepts operator-owned private roots with mode 0700 on Linux and macOS", async () => {
  const harness = await createA13Harness();
  for (const root of [harness.artifactRoot, harness.evidenceRoot, harness.imageEvidenceRoot]) {
    const metadata = await stat(root);
    assert.equal(metadata.uid, process.getuid());
    assert.equal(metadata.mode & 0o777, 0o700);
  }

  const result = runRestore(harness);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("restore drill still rejects an operator-owned private root with permissive mode", async () => {
  const harness = await createA13Harness();
  await chmod(harness.evidenceRoot, 0o755);

  const result = runRestore(harness);
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /operator-owned with mode 0700/);
  assert.equal(await commandLog(harness), "");
});

test("restore drill requires explicit authorization before Docker access", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { ALLOW_RELEASE_A13_RESTORE: "0" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /ALLOW_RELEASE_A13_RESTORE/);
  assert.equal(await commandLog(harness), "");
});

test("restore drill rejects an incomplete artifact before Docker access", async () => {
  const harness = await createA13Harness();
  await rm(path.join(harness.artifactDir, "READY.json"));
  const result = runRestore(harness);

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /READY|Artifact runId|Release input/);
  assert.equal(await commandLog(harness), "");
});

test("restore drill rejects checksum drift before Docker access", async () => {
  const harness = await createA13Harness();
  await writeValidArtifact(harness.artifactDir, {
    sidecarDigest: "d".repeat(64),
  });
  const result = runRestore(harness);

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /SHA-256|checksum/i);
  assert.equal(await commandLog(harness), "");
});

test("restore drill rejects PG16 manifests before Docker access", async () => {
  const harness = await createA13Harness();
  await writeValidArtifact(harness.artifactDir, {
    manifest: { postgresClientMajor: 16 },
  });
  const result = runRestore(harness);

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /PostgreSQL 17|PG17|READY manifest/);
  assert.equal(await commandLog(harness), "");
});

test("restore drill rejects symlinked artifacts", async () => {
  const harness = await createA13Harness();
  const dumpPath = path.join(harness.artifactDir, "database.dump");
  const realDump = path.join(harness.artifactDir, "real.dump");
  const dump = await readFile(dumpPath);
  await writeFile(realDump, dump, { mode: 0o600 });
  await rm(dumpPath);
  await import("node:fs/promises").then(({ symlink }) =>
    symlink(realDump, dumpPath),
  );
  const result = runRestore(harness);

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /symbolic|symlink/i);
  assert.equal(await commandLog(harness), "");
});

test("restore drill rejects remote Docker contexts", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, {
    A13_FAKE_DOCKER_CONTEXT: "ssh://production.invalid",
  });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /local Docker(?: context)?/i);
  assert.doesNotMatch(await commandLog(harness), /network create|volume create|run -d/);
});

test("restore drill requires immutable image identifiers", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_BACKEND_IMAGE: "aluplan-backend:latest" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /sha256/);
  assert.equal(await commandLog(harness), "");
});

test("restore drill rejects image revision mismatches before resources are created", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, {
    A13_FAKE_IMAGE_REVISION: "f".repeat(40),
  });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /revision/i);
  assert.doesNotMatch(await commandLog(harness), /network create|volume create|run -d/);
});

test("restore drill rejects archives above the explicit size budget before Docker access", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_MAX_ARCHIVE_BYTES: "1" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /size budget/i);
  assert.equal(await commandLog(harness), "");
});

test("restore drill rejects empty metadata size output before Docker access", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_WC_EMPTY_ON_CALL: "1" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /size/i);
  assert.equal(await commandLog(harness), "");
});

test("restore drill rejects oversized valid READY metadata before Docker access", async () => {
  const harness = await createA13Harness();
  await writeValidArtifact(harness.artifactDir, {
    manifest: { padding: "x".repeat(70_000) },
  });
  const result = runRestore(harness);

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /metadata.*size limit/i);
  assert.equal(await commandLog(harness), "");
});

test("restore drill rejects exact-image evidence that does not bind the requested image", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, {
    A13_BACKEND_IMAGE: `sha256:${"d".repeat(64)}`,
  });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /image evidence/i);
  assert.equal(await commandLog(harness), "");
});

test("restore drill uses an internal network and never publishes a host port", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness);

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const commands = await commandLog(harness);
  assert.match(commands, /network create .*--internal/);
  assert.match(commands, /volume create/);
  assert.match(commands, /run -d .*--network/);
  assert.match(commands, /run --rm --name aluplan-a13-fp-raw-\S+ --platform linux\/amd64/);
  assert.doesNotMatch(commands, /(^|\s)(-p|--publish)(\s|=)/m);
  assert.match(commands, /pg_restore .*--exit-on-error/);
  assert.match(commands, /pg_restore .*--single-transaction/);
  assert.match(commands, /pg_restore .*--no-owner/);
  assert.match(commands, /pg_restore .*--no-privileges/);
});

test("restore drill accepts Docker Desktop's exact lowercase missing-container proof", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, {
    A13_FAKE_DOCKER_DESKTOP_MISSING: "1",
  });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(await commandLog(harness), /network create|volume create|run -d/);
  assert.match(result.stdout, /local evidence complete/i);
});

for (const scenario of ["wrong-id", "suffix", "daemon-error"]) {
  test(`restore drill rejects non-exact Docker Desktop absence proof: ${scenario}`, async () => {
    const harness = await createA13Harness();
    const result = runRestore(harness, {
      A13_FAKE_DOCKER_DESKTOP_MISSING: scenario,
    });

    assert.notEqual(result.status, 0);
    assert.doesNotMatch(await commandLog(harness), /network create|volume create|run -d/);
    await assert.rejects(
      readFile(path.join(harness.evidenceRoot, "a13-test-run", "LOCAL-A13.json")),
      /ENOENT/,
    );
  });
}

test("restore drill fails closed when Docker inspection becomes unavailable during cleanup", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, {
    A13_FAKE_INSPECT_ERROR_DURING_CLEANUP: "1",
  });

  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stdout, /local evidence complete/i);
  assert.match(await commandLog(harness), /network create|volume create|run -d/);
  await assert.rejects(
    readFile(path.join(harness.evidenceRoot, "a13-test-run", "LOCAL-A13.json")),
    /ENOENT/,
  );
});

test("restore drill never mistakes a missing Docker socket for an absent resource", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_SOCKET_NO_SUCH: "1" });

  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stdout, /local evidence complete/i);
  assert.match(`${result.stdout}\n${result.stderr}`, /prove disposable|cleanup|Docker/i);
});

test("restore drill refuses pre-existing unowned Docker volumes before use", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_PREEXISTING_VOLUME: "1" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /volume name is already in use/i);
  assert.doesNotMatch(await commandLog(harness), /run -d/);
});

test("restore drill checks Docker volume headroom before staging the archive", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_VOLUME_AVAILABLE_KB: "1" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /Docker volume headroom/i);
  assert.doesNotMatch(await commandLog(harness), /cp .*database\.dump/);
});

test("restore drill bounds backend job output before accepting evidence", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, {
    A13_MAX_JOB_OUTPUT_BYTES: "512",
    A13_FAKE_LARGE_OUTPUT: "1",
  });

  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stdout, /local evidence complete/i);

  const permissiveHarness = await createA13Harness();
  const permissiveResult = runRestore(permissiveHarness, {
    A13_MAX_JOB_OUTPUT_BYTES: "8192",
    A13_FAKE_LARGE_OUTPUT: "1",
  });
  assert.equal(
    permissiveResult.status,
    0,
    `${permissiveResult.stdout}\n${permissiveResult.stderr}`,
  );
  const baseline = await readFile(
    path.join(
      permissiveHarness.evidenceRoot,
      "a13-test-run",
      "baseline-fingerprint.json",
    ),
    "utf8",
  );
  assert.doesNotThrow(() => JSON.parse(baseline));
});

test("restore drill rejects an unmeasurable backend job output", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_WC_FAIL_ON_CALL: "7" });

  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stdout, /local evidence complete/i);
  assert.match(await commandLog(harness), /capture-release-fingerprints\.mjs/);
  await assert.rejects(
    readFile(path.join(harness.evidenceRoot, "a13-test-run", "LOCAL-A13.json")),
    /ENOENT/,
  );
});

test("restore drill applies the backend job output cap to stderr too", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, {
    A13_MAX_JOB_OUTPUT_BYTES: "512",
    A13_FAKE_LARGE_STDERR: "1",
  });

  assert.notEqual(result.status, 0);
  assert.doesNotMatch(result.stdout, /local evidence complete/i);

  const permissiveHarness = await createA13Harness();
  const permissiveResult = runRestore(permissiveHarness, {
    A13_MAX_JOB_OUTPUT_BYTES: "8192",
    A13_FAKE_LARGE_STDERR: "1",
  });
  assert.equal(
    permissiveResult.status,
    0,
    `${permissiveResult.stdout}\n${permissiveResult.stderr}`,
  );
});

test("restore drill rejects a second migration pass that is not explicitly a no-op", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_SECOND_PENDING: "1" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /round 2|no-op/i);
});

test("restore drill rejects protected business-data drift", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_DATA_DRIFT: "1" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /protected data|idempotent/i);
});

test("restore drill permits a migration-created empty table while preserving baseline data", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_NEW_TABLE: "1" });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /local evidence complete/i);
});

test("restore drill rejects an unexpected backfill into the migration-created table", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_NEW_TABLE_ROWS: "1" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /protected data|idempotent/i);
});

test("restore drill rejects deletion or mutation of baseline RBAC rows", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_RBAC_DRIFT: "1" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /protected data|idempotent/i);
});

test("restore drill rejects RBAC assignments outside the reviewed migration allowlist", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_RBAC_ESCALATION: "1" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /protected data|idempotent/i);
});

test("restore drill accepts only the reviewed SUPPORT_AGENT RBAC delta", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_RBAC_EXPECTED_DELTA: "1" });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /local evidence complete/i);
});

for (const scenario of ["existing-zero", "partial", "new-role"]) {
  test(`restore drill accepts exact CUSTOMER four-grant delta for ${scenario}`, async () => {
    const harness = await createA13Harness();
    const result = runRestore(harness, { A13_FAKE_CUSTOMER_SCENARIO: scenario });

    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.match(result.stdout, /local evidence complete/i);
  });
}

for (const scenario of ["wildcard", "faq-read", "faq-review", "metadata", "assignment-mutation"]) {
  test(`restore drill rejects CUSTOMER ${scenario} drift`, async () => {
    const harness = await createA13Harness();
    const result = runRestore(harness, { A13_FAKE_CUSTOMER_SCENARIO: scenario });

    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /protected data|idempotent/i);
  });
}

for (const [name, environment] of [
  ["role", { A13_FAKE_RBAC_ROLE_ESCALATION: "1" }],
  ["permission", { A13_FAKE_RBAC_PERMISSION_ESCALATION: "1" }],
  ["baseline permission mutation", { A13_FAKE_RBAC_PERMISSION_MUTATION: "1" }],
  ["baseline assignment mutation", { A13_FAKE_RBAC_ASSIGNMENT_MUTATION: "1" }],
]) {
  test(`restore drill rejects an unreviewed RBAC ${name}`, async () => {
    const harness = await createA13Harness();
    const result = runRestore(harness, environment);

    assert.notEqual(result.status, 0);
    assert.match(`${result.stdout}\n${result.stderr}`, /protected data|idempotent/i);
  });
}

test("restore drill permits only the reviewed SUPPORT_AGENT metadata update", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_SUPPORT_METADATA_UPDATE: "1" });

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("restore drill rejects SUPPORT_AGENT identity or creation-time drift", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_SUPPORT_IDENTITY_DRIFT: "1" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /protected data|idempotent/i);
});

test("restore drill protects reviewed additive-column values that already existed", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_EXISTING_COLUMN_DRIFT: "1" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /protected data|idempotent/i);
});

test("restore drill rejects loss of a baseline table or column", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_SCHEMA_DRIFT: "1" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /protected data|idempotent/i);
});

test("restore drill cannot mask a failed first migration container", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, { A13_FAKE_ROUND_ONE_EXIT: "1" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /Migration round 1 failed/i);
  await assert.rejects(
    readFile(path.join(harness.evidenceRoot, "a13-test-run", "LOCAL-A13.json")),
    /ENOENT/,
  );
});

test("restore drill binds PostgreSQL to the approved pgvector repository digest", async () => {
  const harness = await createA13Harness();
  const result = runRestore(harness, {
    A13_FAKE_PG_REPO_DIGESTS: `pgvector/pgvector@sha256:${"f".repeat(64)}`,
  });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /pgvector image is not bound/i);
  assert.match(await commandLog(harness), /image inspect .*RepoDigests/);
  assert.doesNotMatch(await commandLog(harness), /network create|volume create|run -d/);
});

test("restore drill refuses overly broad evidence roots", async () => {
  const harness = await createA13Harness();
  await chmod(harness.evidenceRoot, 0o700);
  const result = runRestore(harness, { A13_EVIDENCE_ROOT: "/tmp" });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /evidence root|Private root/i);
  assert.equal(await commandLog(harness), "");
});

test("migration-only entrypoint verifies files, migrates, and verifies the ledger", async () => {
  const source = await readFile(
    path.join(repoRoot, "apps/backend/scripts/migrate-once.sh"),
    "utf8",
  );

  assert.match(source, /verify-migration-integrity\.mjs --files-only/);
  assert.match(source, /prisma migrate deploy/);
  assert.match(source, /verify-migration-integrity\.mjs/);
  assert.match(source, /verify-schema-parity\.mjs/);
  assert.match(source, /verify-rbac-database\.mjs/);
  assert.doesNotMatch(source, /dist\/main|Starting application|exec node/);
});

test("normal deploy delegates migration work to the canonical migration-only entrypoint", async () => {
  const source = await readFile(
    path.join(repoRoot, "apps/backend/scripts/deploy.sh"),
    "utf8",
  );

  assert.match(source, /\.\/apps\/backend\/scripts\/migrate-once\.sh/);
  assert.equal((source.match(/prisma migrate deploy/g) ?? []).length, 0);
});

test("backend image requires immutable Git revision and carries only runtime A.1.3 tools", async () => {
  const dockerfile = await readFile(
    path.join(repoRoot, "apps/backend/Dockerfile"),
    "utf8",
  );

  assert.match(dockerfile, /ARG VCS_REF\s*\n/);
  assert.match(dockerfile, /\^\[0-9a-f\]\{40\}\$/);
  assert.match(
    dockerfile,
    /LABEL org\.opencontainers\.image\.revision="\$\{VCS_REF\}"/,
  );
  assert.match(dockerfile, /migrate-once\.sh/);
  assert.match(dockerfile, /capture-release-fingerprints\.mjs/);
  assert.match(dockerfile, /release-fingerprint-rbac\.mjs/);
  assert.match(dockerfile, /verify-schema-parity\.mjs/);
  assert.match(dockerfile, /verify-rbac-database\.mjs/);
  assert.doesNotMatch(dockerfile, /COPY[^\n]*release-a13-restore-drill\.sh/);
});

test("exact image smoke is clean-tree, amd64, revision-bound, and app-free", async () => {
  const source = await readFile(
    path.join(repoRoot, "scripts/release-a13-exact-image-smoke.sh"),
    "utf8",
  );

  assert.match(source, /ALLOW_RELEASE_A13_IMAGE/);
  assert.match(source, /git status --short/);
  assert.match(source, /--platform linux\/amd64/);
  assert.match(source, /--build-arg "VCS_REF=/);
  assert.match(source, /org\.opencontainers\.image\.revision/);
  assert.match(source, /verify-migration-integrity\.mjs --files-only/);
  assert.match(source, /pg_dump --version/);
  assert.match(source, /pg_restore --version/);
  assert.doesNotMatch(source, /apps\/backend\/dist\/main\.js\s*&|npm start|pnpm start/);
  assert.doesNotMatch(source, /\$\{A13_IMAGE_EVIDENCE_ROOT/);
  assert.match(source, /reject_symlink_components/);
  assert.match(source, /shasum[\s\S]*-a 256/);
  assert.match(source, /git[^\n]*archive/);
  assert.match(source, /export DOCKER_HOST=/);
  assert.match(source, /unset DOCKER_CONTEXT/);
  assert.match(source, /A13_PGVECTOR_IMAGE_REF/);
  assert.match(source, /run_control "\$\{docker_bin\}" context show/);
  assert.match(source, /--memory 512m/);
  assert.match(source, /--cpus 1/);
  assert.match(source, /--pids-limit 128/);
  assert.match(source, /cleanup_failed/);
  assert.match(source, /smoke_container_created=0/);
  assert.match(source, /docker_bin\}" create/);
  assert.match(source, /com\.aluplan\.a13\.run-id/);
  assert.match(source, /rm -f "\$\{smoke_container_id\}"/);
  assert.doesNotMatch(source, /rm -f "\$\{smoke_container_name\}"/);
});

test("legacy DR entrypoint delegates without accepting URL arguments", async () => {
  const source = await readFile(path.join(repoRoot, "scripts/dr-drill.sh"), "utf8");

  assert.match(source, /release-a13-restore-drill\.sh/);
  assert.doesNotMatch(source, /curl|wget|BACKUP_URL|pgvector:pg16|-p ["']?5433/);
});

test("scheduled workflow is explicitly a safety contract, not false restore evidence", async () => {
  const source = await readFile(
    path.join(repoRoot, ".github/workflows/dr-drill.yml"),
    "utf8",
  );

  assert.match(source, /release-a13-safety\.test\.mjs/);
  assert.match(source, /not restore evidence/i);
  assert.match(source, /permissions:\s*\n\s+contents: read/);
  assert.match(source, /persist-credentials: false/);
  assert.doesNotMatch(source, /uses:\s+actions\/(checkout|setup-node)@v\d/);
  assert.doesNotMatch(source, /\|\| true|DR_BACKUP_URL|SLACK_WEBHOOK|dr-report/);
});

test("fingerprint capture is read-only, redacted, and preserves RBAC plus empty-table schema evidence", async () => {
  const source = await readFile(
    path.join(repoRoot, "scripts/capture-release-fingerprints.mjs"),
    "utf8",
  );

  assert.match(source, /REPEATABLE READ READ ONLY/);
  assert.match(source, /roles/);
  assert.match(source, /permissions/);
  assert.match(source, /role_permissions/);
  assert.match(source, /canonicalValid/);
  assert.match(source, /captureSchema/);
  assert.match(source, /captured\.push\(fingerprint\)/);
  assert.match(source, /schemaVersion:\s*1,\s*\n\s*full,/);
  assert.match(source, /knowledge_embeddings/);
  assert.match(source, /knowledge_pool_embeddings/);
  assert.match(source, /ticket_embeddings/);
  assert.match(source, /faq_entries/);
  assert.match(source, /ai_response_cache/);
  assert.match(source, /attachments/);
  assert.match(source, /knowledge_sources/);
  assert.doesNotMatch(source, /console\.log\([^)]*(DATABASE_URL|connectionString)/);
});

test("fingerprint capture never overlaps queries on the same PostgreSQL client", async () => {
  const { queryRbacRows } = await import("./release-fingerprint-rbac.mjs");
  const calls = [];
  const warnings = [];
  let inFlight = 0;
  let maxInFlight = 0;
  const client = {
    async query(sql) {
      const stage = sql.includes("FROM public.role_permissions")
        ? "assignments"
        : sql.includes("FROM public.permissions")
          ? "permissions"
          : "roles";
      calls.push(stage);
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      if (inFlight > 1) warnings.push("overlapping query");
      await new Promise((resolve) => setImmediate(resolve));
      inFlight -= 1;
      return { rows: [{ stage }] };
    },
  };

  const result = await queryRbacRows(client);

  assert.equal(maxInFlight, 1);
  assert.deepEqual(calls, ["roles", "permissions", "assignments"]);
  assert.deepEqual(warnings, []);
  assert.deepEqual(result.roles.rows, [{ stage: "roles" }]);
  assert.deepEqual(result.permissions.rows, [{ stage: "permissions" }]);
  assert.deepEqual(result.assignments.rows, [{ stage: "assignments" }]);
});

test("runtime RBAC verification is read-only and production-image safe", async () => {
  const source = await readFile(
    path.join(repoRoot, "scripts/verify-rbac-database.mjs"),
    "utf8",
  );

  assert.match(source, /REPEATABLE READ READ ONLY/);
  assert.match(source, /rbac-canonical\.json/);
  assert.match(source, /ROLLBACK/);
  assert.match(source, /connectionTimeoutMillis:\s*10_000/);
  assert.match(source, /query_timeout:\s*35_000/);
  assert.doesNotMatch(source, /from\s+['"]typescript['"]|tsx|ts-node/i);
  assert.doesNotMatch(
    source.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, ""),
    /\b(?:INSERT|UPDATE|DELETE)\b/i,
  );
  assert.doesNotMatch(source, /console\.log\([^)]*(DATABASE_URL|connectionString)/);
});

test("schema parity verification is bounded and does not relay raw child-process errors", async () => {
  const source = await readFile(
    path.join(repoRoot, "scripts/verify-schema-parity.mjs"),
    "utf8",
  );

  assert.match(source, /timeout:\s*60_000/);
  assert.match(source, /maxBuffer:/);
  assert.doesNotMatch(source, /process\.stderr\.write\(result\.stderr\)/);
  assert.doesNotMatch(source, /result\.error\.message/);
});

test("restore evidence proves baseline parity and a genuinely idempotent second migration", async () => {
  const source = await readFile(
    path.join(repoRoot, "scripts/release-a13-restore-drill.sh"),
    "utf8",
  );

  assert.match(source, /capture-release-fingerprints\.mjs/);
  assert.match(source, /baseline-fingerprint\.json/);
  assert.match(source, /candidate-pre-fingerprint\.json/);
  assert.match(source, /candidate-post-round-1\.json/);
  assert.match(source, /candidate-post-round-2\.json/);
  assert.match(source, /business.*rag.*objectReferences/s);
  assert.match(source, /dimensionMismatches/);
  assert.match(source, /checksum or READY evidence exceeds its safe size limit/);
  assert.match(source, /run_timed "\$\{docker_bin\}" exec "\$\{container_id\}" psql/);
  assert.match(source, /A13_MAX_JOB_OUTPUT_BYTES/);
  assert.match(source, /ulimit -f/);
  assert.match(source, /--read-only --tmpfs \/tmp:rw,noexec,nosuid,size=256m/);
  assert.match(source, /--cap-drop ALL --security-opt no-new-privileges/);
  assert.doesNotMatch(source, /GO\.json/);
});

test("migration ledger verification is bounded and read-only", async () => {
  const source = await readFile(
    path.join(repoRoot, "scripts/verify-migration-integrity.mjs"),
    "utf8",
  );

  assert.match(source, /connectionTimeoutMillis:\s*10_000/);
  assert.match(source, /query_timeout:\s*35_000/);
  assert.match(source, /REPEATABLE READ READ ONLY/);
  assert.match(source, /SET LOCAL statement_timeout = '30s'/);
  assert.match(source, /ROLLBACK/);
});
