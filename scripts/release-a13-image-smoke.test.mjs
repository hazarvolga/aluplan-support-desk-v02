import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmod,
  copyFile,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const sourceRoot = fileURLToPath(new URL("..", import.meta.url));
const tempRoots = new Set();
const backendImageId = `sha256:${"a".repeat(64)}`;
const pgvectorImageId = `sha256:${"c".repeat(64)}`;
const pgvectorRef = `pgvector/pgvector@sha256:${"e".repeat(64)}`;
const smokeContainerId = "1".repeat(64);

async function executable(filePath, source) {
  await writeFile(filePath, source, "utf8");
  await chmod(filePath, 0o755);
}

async function createImageHarness() {
  const tempBase = process.platform === "darwin" ? "/private/tmp" : os.tmpdir();
  const root = await mkdtemp(path.join(tempBase, "aluplan-a13-image-test-"));
  tempRoots.add(root);
  const fakeBin = path.join(root, "bin");
  const archiveRoot = path.join(root, "archive");
  const stateDir = path.join(root, "state");
  const commandLog = path.join(root, "commands.log");
  const gitSha = "b".repeat(40);
  await Promise.all([
    mkdir(path.join(root, "scripts"), { recursive: true }),
    mkdir(path.join(root, ".private-data"), { mode: 0o700 }),
    mkdir(fakeBin),
    mkdir(stateDir),
    mkdir(path.join(archiveRoot, "apps/backend"), { recursive: true }),
    mkdir(path.join(archiveRoot, "packages/database/prisma"), {
      recursive: true,
    }),
    mkdir(path.join(archiveRoot, "scripts"), { recursive: true }),
  ]);
  await copyFile(
    path.join(sourceRoot, "scripts/release-a13-exact-image-smoke.sh"),
    path.join(root, "scripts/release-a13-exact-image-smoke.sh"),
  );
  await chmod(path.join(root, "scripts/release-a13-exact-image-smoke.sh"), 0o755);
  await Promise.all([
    writeFile(path.join(archiveRoot, "apps/backend/Dockerfile"), "FROM scratch\n"),
    writeFile(path.join(archiveRoot, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n"),
    writeFile(
      path.join(archiveRoot, "packages/database/prisma/migration-checksums.json"),
      "[]\n",
    ),
    writeFile(
      path.join(archiveRoot, "scripts/release-a13-restore-drill.sh"),
      "#!/usr/bin/env bash\nexit 0\n",
    ),
  ]);

  await chmod(path.join(archiveRoot, "scripts"), 0o755);
  await chmod(path.join(archiveRoot, "apps/backend/Dockerfile"), 0o644);
  await chmod(
    path.join(archiveRoot, "scripts/release-a13-restore-drill.sh"),
    0o755,
  );

  await executable(
    path.join(fakeBin, "git"),
    `#!/bin/sh
set -eu
if [ "$1" = -c ]; then
  [ "$2" = tar.umask=0022 ] || exit 73
  printf 'normalized\\n' > "$A13_FAKE_STATE_DIR/archive-mode"
  shift 2
fi
case "$1 $2" in
  'status --short') exit 0 ;;
  'rev-parse HEAD') printf '%s\\n' "$A13_FAKE_GIT_SHA" ;;
  'archive --format=tar')
    output=''
    for argument in "$@"; do
      case "$argument" in --output=*) output="\${argument#--output=}" ;; esac
    done
    [ -n "$output" ] || exit 72
    exec /usr/bin/tar -cf "$output" -C "$A13_FAKE_ARCHIVE_ROOT" .
    ;;
  *) printf 'unsupported fake git command: %s\\n' "$*" >&2; exit 70 ;;
esac
`,
  );
  await executable(
    path.join(fakeBin, "sha256sum"),
    `#!/bin/sh
set -eu
exec "$A13_FAKE_NODE_BIN" -e '
  const fs=require("fs"); const crypto=require("crypto"); const file=process.argv[1];
  const digest=crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  process.stdout.write(digest+"  "+file+"\\n");
' "$1"
`,
  );
  await executable(
    path.join(fakeBin, "stat"),
    `#!/bin/sh
set -eu
if [ "\${A13_FAKE_STAT_SIZE_UNAVAILABLE:-0}" = 1 ]; then
  case "$1 $2" in
    '-f %z'|'-c %s') printf 'invalid stat output\\n'; exit 1 ;;
  esac
fi
exec /usr/bin/stat "$@"
`,
  );
  await executable(
    path.join(fakeBin, "docker"),
    `#!/bin/sh
set -eu
printf 'docker %s\\n' "$*" >> "$A13_FAKE_COMMAND_LOG"
scenario="\${A13_FAKE_IMAGE_SMOKE_SCENARIO:-success}"
case "$1 $2" in
  'context show') printf 'desktop-linux\\n' ;;
  'context inspect') printf 'unix:///var/run/docker.sock\\n' ;;
  'build --platform')
    if [ "$scenario" = context-permissions ]; then
      context=''
      for argument in "$@"; do context="$argument"; done
      "$A13_FAKE_NODE_BIN" -e '
        const fs = require("node:fs");
        const path = require("node:path");
        const context = process.argv[1];
        const mode = p => fs.statSync(p).mode & 0o777;
        fs.writeFileSync(path.join(process.env.A13_FAKE_STATE_DIR, "context-modes.json"), JSON.stringify({
          file: mode(path.join(context, "apps/backend/Dockerfile")),
          directory: mode(path.join(context, "scripts")),
          executable: mode(path.join(context, "scripts/release-a13-restore-drill.sh")),
          privateParent: mode(path.dirname(context))
        }));
      ' "$context"
    fi
    exit 0
    ;;
  'image inspect')
    case "$*" in
      *Architecture*) printf 'amd64\\n' ;;
      *org.opencontainers.image.revision*) printf '%s\\n' "$A13_FAKE_GIT_SHA" ;;
      *RepoDigests*) printf '%s\\n' "$A13_PGVECTOR_IMAGE_REF" ;;
      *"$A13_PGVECTOR_IMAGE_REF"*) printf '%s\\n' "$A13_FAKE_PG_IMAGE_ID" ;;
      *) printf '%s\\n' "$A13_FAKE_BACKEND_IMAGE_ID" ;;
    esac
    ;;
  'create --name')
    [ "$scenario" != collision ] || { printf 'name already in use\\n' >&2; exit 1; }
    label=''
    previous=''
    for argument in "$@"; do
      [ "$previous" != --label ] || label="$argument"
      previous="$argument"
    done
    printf '%s' "$label" > "$A13_FAKE_STATE_DIR/container-label"
    : > "$A13_FAKE_STATE_DIR/container-created"
    printf '%s\\n' "$A13_FAKE_SMOKE_CONTAINER_ID"
    ;;
  'inspect --format')
    [ -f "$A13_FAKE_STATE_DIR/container-created" ] || exit 1
    if [ "$scenario" = label-mismatch ]; then printf 'foreign-run\\n'
    else sed 's/^com\\.aluplan\\.a13\\.run-id=//' "$A13_FAKE_STATE_DIR/container-label"
    fi
    ;;
  'inspect '*)
    if [ -f "$A13_FAKE_STATE_DIR/container-created" ]; then exit 0; fi
    if [ "$scenario" = docker-desktop-missing ]; then
      printf 'error: no such object: %s\\n' "$2" >&2
      exit 1
    fi
    if [ "$scenario" = docker-desktop-wrong-id ]; then
      printf 'error: no such object: %s\\n' "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" >&2
      exit 1
    fi
    if [ "$scenario" = docker-desktop-suffix ]; then
      printf 'error: no such object: %s extra\\n' "$2" >&2
      exit 1
    fi
    if [ "$scenario" = docker-desktop-daemon-error ]; then
      printf 'Cannot connect to the Docker daemon at unix:///var/run/docker.sock\\n' >&2
      exit 1
    fi
    printf 'Error: No such object: %s\\n' "$2" >&2
    exit 1
    ;;
  'start --attach')
    [ "$scenario" != start-failure ] || exit 31
    ;;
  'rm -f')
    [ "$3" = "$A13_FAKE_SMOKE_CONTAINER_ID" ] || exit 32
    [ "$scenario" != remove-failure ] || exit 33
    rm -f "$A13_FAKE_STATE_DIR/container-created"
    ;;
  *) printf 'unsupported fake docker command: %s\\n' "$*" >&2; exit 71 ;;
esac
`,
  );
  await executable(
    path.join(fakeBin, "mkdir"),
    `#!/bin/sh
set -eu
target=''
for argument in "$@"; do target="$argument"; done
if [ "\${A13_FAKE_IMAGE_SMOKE_SCENARIO:-success}" = run-dir-collision ]; then
  case "$target" in
    *'/.tmp-image-'*)
      /bin/mkdir "$target"
      printf 'foreign-artifact\\n' > "$target/FOREIGN.txt"
      exit 1
      ;;
  esac
fi
exec /bin/mkdir "$@"
`,
  );
  return { root, fakeBin, archiveRoot, stateDir, commandLog, gitSha };
}

function runImageSmoke(harness, scenario, envOverrides = {}) {
  return spawnSync(
    "/bin/bash",
    [path.join(harness.root, "scripts/release-a13-exact-image-smoke.sh")],
    {
      cwd: harness.root,
      encoding: "utf8",
      timeout: 10_000,
      env: {
        ...process.env,
        ALLOW_RELEASE_A13_IMAGE: "1",
        A13_PGVECTOR_IMAGE_REF: pgvectorRef,
        A13_EXPECTED_GIT_SHA: harness.gitSha,
        A13_TOOL_PATH: `${harness.fakeBin}:/usr/bin:/bin`,
        A13_COMMAND_TIMEOUT_SECONDS: "5",
        A13_CONTROL_TIMEOUT_SECONDS: "5",
        A13_FAKE_GIT_SHA: harness.gitSha,
        A13_FAKE_ARCHIVE_ROOT: harness.archiveRoot,
        A13_FAKE_COMMAND_LOG: harness.commandLog,
        A13_FAKE_STATE_DIR: harness.stateDir,
        A13_FAKE_IMAGE_SMOKE_SCENARIO: scenario,
        A13_FAKE_BACKEND_IMAGE_ID: backendImageId,
        A13_FAKE_PG_IMAGE_ID: pgvectorImageId,
        A13_FAKE_SMOKE_CONTAINER_ID: smokeContainerId,
        A13_FAKE_NODE_BIN: process.execPath,
        DOCKER_HOST: "",
        ...envOverrides,
      },
    },
  );
}

async function logOf(harness) {
  return readFile(harness.commandLog, "utf8").catch(() => "");
}

async function readyExists(harness) {
  return readFile(
    path.join(
      harness.root,
      ".private-data/release-evidence/a13-images",
      `image-${harness.gitSha}`,
      "READY.json",
    ),
    "utf8",
  )
    .then(() => true)
    .catch(() => false);
}

test.after(async () => {
  await Promise.all(
    [...tempRoots].map((root) => rm(root, { recursive: true, force: true })),
  );
});

test("exact-image smoke accepts an operator-owned mode-0700 private root on Linux and macOS", async () => {
  const harness = await createImageHarness();
  const privateRoot = path.join(harness.root, ".private-data");
  const metadata = await stat(privateRoot);
  assert.equal(metadata.uid, process.getuid());
  assert.equal(metadata.mode & 0o777, 0o700);

  const result = runImageSmoke(harness, "success");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

test("exact-image smoke still rejects a permissive private root", async () => {
  const harness = await createImageHarness();
  await chmod(path.join(harness.root, ".private-data"), 0o755);

  const result = runImageSmoke(harness, "success");
  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /operator-owned with mode 0700/);
  assert.doesNotMatch(await logOf(harness), /docker build|docker create/);
});

test("exact-image smoke never removes a foreign container after name collision", async () => {
  const harness = await createImageHarness();
  const result = runImageSmoke(harness, "collision");
  const log = await logOf(harness);

  assert.notEqual(result.status, 0);
  assert.match(log, /docker create /);
  assert.doesNotMatch(log, /docker rm -f/);
  assert.equal(await readyExists(harness), false);
});

test("exact-image smoke preserves a pre-existing unowned run directory", async () => {
  const harness = await createImageHarness();
  const result = runImageSmoke(harness, "run-dir-collision");
  const evidenceRoot = path.join(
    harness.root,
    ".private-data/release-evidence/a13-images",
  );
  const evidenceEntries = await readdir(evidenceRoot);
  const temporaryEntries = evidenceEntries.filter((entry) =>
    entry.startsWith(".tmp-image-"),
  );

  assert.notEqual(result.status, 0);
  assert.equal(temporaryEntries.length, 1);
  assert.equal(
    await readFile(path.join(evidenceRoot, temporaryEntries[0], "FOREIGN.txt"), "utf8"),
    "foreign-artifact\n",
  );
});

for (const scenario of ["start-failure", "label-mismatch"]) {
  test(`exact-image smoke removes only its owned ID after ${scenario}`, async () => {
    const harness = await createImageHarness();
    const result = runImageSmoke(harness, scenario);
    const log = await logOf(harness);

    assert.notEqual(result.status, 0);
    assert.match(log, new RegExp(`docker rm -f ${smokeContainerId}`));
    assert.doesNotMatch(log, /docker rm -f aluplan-a13-image-smoke/);
    assert.equal(await readyExists(harness), false);
  });
}

test("exact-image smoke fails closed when owned container removal fails", async () => {
  const harness = await createImageHarness();
  const result = runImageSmoke(harness, "remove-failure");
  const log = await logOf(harness);

  assert.notEqual(result.status, 0);
  assert.ok((log.match(new RegExp(`docker rm -f ${smokeContainerId}`, "g")) ?? []).length >= 2);
  assert.equal(await readyExists(harness), false);
});

test("exact-image smoke publishes evidence only after successful owned cleanup", async () => {
  const harness = await createImageHarness();
  const result = runImageSmoke(harness, "success");
  const log = await logOf(harness);

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(log, new RegExp(`docker rm -f ${smokeContainerId}`));
  assert.match(log, new RegExp(`docker inspect ${smokeContainerId}`));
  assert.equal(await readyExists(harness), true);
});

test("exact-image context retains readable executable modes while evidence stays private", async () => {
  const harness = await createImageHarness();
  const result = runImageSmoke(harness, "context-permissions");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const modes = JSON.parse(
    await readFile(path.join(harness.stateDir, "context-modes.json"), "utf8"),
  );
  assert.deepEqual(modes, {
    file: 0o644,
    directory: 0o755,
    executable: 0o755,
    privateParent: 0o700,
  });
  assert.equal(
    await readFile(path.join(harness.stateDir, "archive-mode"), "utf8"),
    "normalized\n",
  );
  const evidenceRoot = path.join(harness.root, ".private-data/release-evidence/a13-images");
  const finalDir = path.join(evidenceRoot, `image-${harness.gitSha}`);
  for (const dir of [path.join(harness.root, ".private-data"), path.dirname(evidenceRoot), evidenceRoot, finalDir]) {
    assert.equal((await stat(dir)).mode & 0o777, 0o700, dir);
  }
  for (const name of ["image.json", "image.json.sha256", "IMAGE_ID", "READY.json"]) {
    assert.equal((await stat(path.join(finalDir, name))).mode & 0o777, 0o600, name);
  }
});

test("exact-image smoke accepts Docker Desktop's exact lowercase removal proof", async () => {
  const harness = await createImageHarness();
  const result = runImageSmoke(harness, "docker-desktop-missing");
  const log = await logOf(harness);

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(log, new RegExp(`docker rm -f ${smokeContainerId}`));
  assert.match(log, new RegExp(`docker inspect ${smokeContainerId}`));
  assert.equal(await readyExists(harness), true);
});

for (const scenario of [
  "docker-desktop-wrong-id",
  "docker-desktop-suffix",
  "docker-desktop-daemon-error",
]) {
  test(`exact-image smoke rejects non-exact Docker Desktop proof: ${scenario}`, async () => {
    const harness = await createImageHarness();
    const result = runImageSmoke(harness, scenario);
    const log = await logOf(harness);

    assert.notEqual(result.status, 0);
    assert.match(log, new RegExp(`docker rm -f ${smokeContainerId}`));
    assert.match(log, new RegExp(`docker inspect ${smokeContainerId}`));
    assert.equal(await readyExists(harness), false);
  });
}

test("exact-image smoke rejects an immutable Git context above its size budget", async () => {
  const harness = await createImageHarness();
  const result = runImageSmoke(harness, "success", {
    A13_MAX_BUILD_CONTEXT_BYTES: "1",
  });
  const log = await logOf(harness);

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /context.*size budget/i);
  assert.doesNotMatch(log, /docker build/);
  assert.equal(await readyExists(harness), false);
  const evidenceEntries = await readdir(
    path.join(harness.root, ".private-data/release-evidence/a13-images"),
  );
  assert.deepEqual(
    evidenceEntries.filter((entry) => entry.startsWith(".tmp-image-")),
    [],
  );
});

test("exact-image smoke fails closed when both archive size probes fail", async () => {
  const harness = await createImageHarness();
  const result = runImageSmoke(harness, "success", {
    A13_FAKE_STAT_SIZE_UNAVAILABLE: "1",
  });

  assert.notEqual(result.status, 0);
  assert.match(`${result.stdout}\n${result.stderr}`, /size/i);
  assert.doesNotMatch(await logOf(harness), /docker build|docker create/);
  assert.equal(await readyExists(harness), false);
});
