import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  chmod,
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = fileURLToPath(new URL("..", import.meta.url));
export const restoreScript = path.join(
  repoRoot,
  "scripts",
  "release-a13-restore-drill.sh",
);

const tempRoots = new Set();

async function writeExecutable(filePath, source) {
  await writeFile(filePath, source, "utf8");
  await chmod(filePath, 0o755);
}

async function installFakeDocker(fakeBin) {
  await writeExecutable(
    path.join(fakeBin, "docker"),
    `#!/bin/sh
set -eu
printf 'docker %s\\n' "$*" >> "$A13_FAKE_COMMAND_LOG"
last=''
for argument in "$@"; do last="$argument"; done
resource_file() { printf '%s/%s-%s' "$A13_FAKE_STATE_DIR" "$1" "$2"; }
container_name=''
previous=''
for argument in "$@"; do
  if [ "$previous" = '--name' ]; then container_name="$argument"; fi
  previous="$argument"
done
case "$1 $2" in
  'context show') printf '%s\\n' "\${A13_FAKE_DOCKER_CONTEXT:-desktop-linux}" ;;
  'context inspect') printf '%s\\n' "\${A13_FAKE_DOCKER_ENDPOINT:-unix:///var/run/docker.sock}" ;;
  'image inspect')
    case "$*" in
      *org.opencontainers.image.revision*) printf '%s\\n' "\${A13_FAKE_IMAGE_REVISION}" ;;
      *Architecture*) printf 'amd64\\n' ;;
      *RepoDigests*) printf '%s\\n' "\${A13_FAKE_PG_REPO_DIGESTS:-\${A13_PGVECTOR_IMAGE_REF}}" ;;
      *"\${A13_PGVECTOR_IMAGE_REF}"*) printf '%s\\n' "\${A13_FAKE_PG_IMAGE_ID}" ;;
      *) printf '%s\\n' "\${A13_FAKE_IMAGE_ID}" ;;
    esac
    ;;
  'inspect '*)
    if [ "\${A13_FAKE_SOCKET_NO_SUCH:-0}" = 1 ]; then
      printf 'dial unix /var/run/docker.sock: connect: no such file or directory\\n' >&2
      exit 1
    fi
    if [ "\${A13_FAKE_INSPECT_ERROR:-0}" = 1 ] || { \
      [ "\${A13_FAKE_INSPECT_ERROR_DURING_CLEANUP:-0}" = 1 ] && \
      [ -f "$A13_FAKE_STATE_DIR/cleanup-phase" ]; \
    }; then
      printf 'Cannot connect to the Docker daemon\\n' >&2
      exit 1
    fi
    if [ -f "$(resource_file container "$last")" ]; then
      printf '%s\\n' "\${A13_RUN_ID}"
    else
      if [ "\${A13_FAKE_DOCKER_DESKTOP_MISSING:-0}" = 1 ]; then
        printf 'error: no such object: %s\\n' "$last" >&2
        exit 1
      fi
      if [ "\${A13_FAKE_DOCKER_DESKTOP_MISSING:-0}" = wrong-id ]; then
        printf 'error: no such object: %s\\n' "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" >&2
        exit 1
      fi
      if [ "\${A13_FAKE_DOCKER_DESKTOP_MISSING:-0}" = suffix ]; then
        printf 'error: no such object: %s extra\\n' "$last" >&2
        exit 1
      fi
      if [ "\${A13_FAKE_DOCKER_DESKTOP_MISSING:-0}" = daemon-error ]; then
        printf 'Cannot connect to the Docker daemon at unix:///var/run/docker.sock\\n' >&2
        exit 1
      fi
      printf 'Error: No such object: %s\\n' "$last" >&2
      exit 1
    fi
    ;;
  'network inspect')
    if [ -f "$(resource_file network "$last")" ]; then printf '%s\\n' "\${A13_RUN_ID}"
    else printf 'Error: No such network: %s\\n' "$last" >&2; exit 1; fi
    ;;
  'volume inspect')
    if [ "\${A13_FAKE_PREEXISTING_VOLUME:-0}" = 1 ] && [ "$last" = "aluplan-a13-pg-\${A13_RUN_ID}" ]; then
      printf 'unowned-run\\n'; exit 0
    fi
    if [ -f "$(resource_file volume "$last")" ]; then printf '%s\\n' "\${A13_RUN_ID}"
    else printf 'Error: No such volume: %s\\n' "$last" >&2; exit 1; fi
    ;;
  'network create')
    : > "$(resource_file network "$last")"
    : > "$(resource_file network fake-network-id)"
    printf 'fake-network-id\\n'
    ;;
  'volume create')
    : > "$(resource_file volume "$last")"
    printf '%s\\n' "$last"
    ;;
  'run -d')
    : > "$(resource_file container "$container_name")"
    : > "$(resource_file container fake-container-id)"
    printf 'fake-container-id\\n'
    ;;
  'run --rm')
    [ -z "$container_name" ] || : > "$(resource_file container "$container_name")"
    case "$*" in
      *migrate-once.sh*)
        if [ -f "$A13_FAKE_STATE_DIR/migrated" ]; then
          if [ "\${A13_FAKE_SECOND_PENDING:-0}" = 1 ]; then
            printf 'Applied another migration.\\n'
          else
            printf 'No pending migrations to apply.\\n'
          fi
        else
          : > "$A13_FAKE_STATE_DIR/migrated"
          printf 'Applied migrations.\\n'
          if [ "\${A13_FAKE_ROUND_ONE_EXIT:-0}" = 1 ]; then
            [ -z "$container_name" ] || rm -f "$(resource_file container "$container_name")"
            exit 23
          fi
        fi
        ;;
      *capture-release-fingerprints.mjs*)
        if [ -n "\${A13_FAKE_CUSTOMER_SCENARIO:-}" ]; then
          "$A13_NODE_BIN" -e '
            const fs = require("node:fs");
            const { createHash } = require("node:crypto");
            const [scenario, marker] = process.argv.slice(1);
            const migrated = fs.existsSync(marker);
            const md5 = value => createHash("md5").update(value).digest("hex");
            const approved = ["kb:read", "ticket:create", "ticket:read", "ticket:update"];
            const customerRole = { keyDigest: md5("CUSTOMER"), rowDigest: "customer-role-row", stableRowDigest: "customer-stable", mutable: false };
            const roles = [{ keyDigest: "role", rowDigest: "role-row", mutable: false }];
            if (scenario !== "new-role" || migrated) roles.push(customerRole);
            if (migrated && scenario === "metadata") customerRole.rowDigest = "changed-customer-metadata";
            const assignment = permission => ({ keyDigest: md5("CUSTOMER" + String.fromCharCode(31) + permission), normalizedRoleDigest: md5("CUSTOMER"), permissionDigest: md5(permission), rowDigest: "customer-" + permission });
            const assignments = [{ keyDigest: "assignment", rowDigest: "assignment-row" }];
            const customerPermissions = migrated ? [...approved] : (["partial", "assignment-mutation"].includes(scenario) ? ["kb:read"] : []);
            if (migrated && scenario === "wildcard") customerPermissions.push("*");
            if (migrated && scenario === "faq-read") customerPermissions.push("faq:read");
            if (migrated && scenario === "faq-review") customerPermissions.push("faq:review");
            assignments.push(...customerPermissions.map(assignment));
            if (migrated && scenario === "assignment-mutation") assignments.find(row => row.permissionDigest === md5("kb:read")).rowDigest = "changed-existing-assignment";
            const state = migrated ? "new" : "old";
            const rbac = {
              roles,
              permissions: [...approved, "*", "faq:read", "faq:review"].map(permission => ({ keyDigest: md5(permission), rowDigest: "permission-" + permission })),
              assignments,
              canonicalValid: migrated,
              digest: state
            };
            process.stdout.write(JSON.stringify({
              schemaVersion: 1, schema: [{ table: "tickets", columns: ["id"] }], business: [], rbac,
              rag: [], objectReferences: [], sequences: [],
              migrationLedger: { present: true, rowCount: migrated ? "2" : "1", digest: state },
              integrity: { invalidConstraints: "0", invalidIndexes: "0" },
              full: [{ table: "_prisma_migrations", rowCount: migrated ? "2" : "1", digest: state }], digest: state
            }));
          ' "$A13_FAKE_CUSTOMER_SCENARIO" "$A13_FAKE_STATE_DIR/migrated"
        elif [ -f "$A13_FAKE_STATE_DIR/migrated" ]; then
          if [ "\${A13_FAKE_DATA_DRIFT:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]}],"business":[{"table":"tickets","rowCount":"1","digest":"drift"}],"rbac":{"roles":[],"permissions":[],"assignments":[],"canonicalValid":true,"digest":"new"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"}],"digest":"new"}'
          elif [ "\${A13_FAKE_RBAC_DRIFT:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]}],"business":[],"rbac":{"roles":[{"keyDigest":"role","rowDigest":"changed-role-row","mutable":false}],"permissions":[{"keyDigest":"permission","rowDigest":"permission-row"}],"assignments":[{"keyDigest":"assignment","rowDigest":"assignment-row"}],"canonicalValid":true,"digest":"drift"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"}],"digest":"new"}'
          elif [ "\${A13_FAKE_RBAC_ESCALATION:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]}],"business":[],"rbac":{"roles":[{"keyDigest":"role","rowDigest":"role-row","mutable":false}],"permissions":[{"keyDigest":"permission","rowDigest":"permission-row"}],"assignments":[{"keyDigest":"assignment","rowDigest":"assignment-row"},{"keyDigest":"unexpected-assignment","normalizedRoleDigest":"unexpected-role","permissionDigest":"unexpected-permission","rowDigest":"unexpected-row"}],"canonicalValid":true,"digest":"escalated"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"}],"digest":"new"}'
          elif [ "\${A13_FAKE_RBAC_EXPECTED_DELTA:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]}],"business":[],"rbac":{"roles":[{"keyDigest":"role","rowDigest":"role-row","mutable":false},{"keyDigest":"5c32b23c0a7a56ac68ccbc7db0f960e4","rowDigest":"support-role-row","mutable":true}],"permissions":[{"keyDigest":"permission","rowDigest":"permission-row"},{"keyDigest":"808e195b7e279547cbe305e4608df4d9","rowDigest":"faq-review-row"}],"assignments":[{"keyDigest":"assignment","rowDigest":"assignment-row"},{"keyDigest":"support-faq-review","normalizedRoleDigest":"5c32b23c0a7a56ac68ccbc7db0f960e4","permissionDigest":"808e195b7e279547cbe305e4608df4d9","rowDigest":"support-faq-review-row"}],"canonicalValid":true,"digest":"expected-delta"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"}],"digest":"new"}'
          elif [ "\${A13_FAKE_RBAC_ROLE_ESCALATION:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]}],"business":[],"rbac":{"roles":[{"keyDigest":"role","rowDigest":"role-row","mutable":false},{"keyDigest":"unexpected-role","rowDigest":"unexpected-role-row","mutable":false}],"permissions":[{"keyDigest":"permission","rowDigest":"permission-row"}],"assignments":[{"keyDigest":"assignment","rowDigest":"assignment-row"}],"canonicalValid":true,"digest":"escalated"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"}],"digest":"new"}'
          elif [ "\${A13_FAKE_RBAC_PERMISSION_ESCALATION:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]}],"business":[],"rbac":{"roles":[{"keyDigest":"role","rowDigest":"role-row","mutable":false}],"permissions":[{"keyDigest":"permission","rowDigest":"permission-row"},{"keyDigest":"unexpected-permission","rowDigest":"unexpected-permission-row"}],"assignments":[{"keyDigest":"assignment","rowDigest":"assignment-row"}],"canonicalValid":true,"digest":"escalated"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"}],"digest":"new"}'
          elif [ "\${A13_FAKE_RBAC_PERMISSION_MUTATION:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]}],"business":[],"rbac":{"roles":[{"keyDigest":"role","rowDigest":"role-row","mutable":false}],"permissions":[{"keyDigest":"permission","rowDigest":"changed-permission-row"}],"assignments":[{"keyDigest":"assignment","rowDigest":"assignment-row"}],"canonicalValid":true,"digest":"mutated"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"}],"digest":"new"}'
          elif [ "\${A13_FAKE_RBAC_ASSIGNMENT_MUTATION:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]}],"business":[],"rbac":{"roles":[{"keyDigest":"role","rowDigest":"role-row","mutable":false}],"permissions":[{"keyDigest":"permission","rowDigest":"permission-row"}],"assignments":[{"keyDigest":"assignment","rowDigest":"changed-assignment-row"}],"canonicalValid":true,"digest":"mutated"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"}],"digest":"new"}'
          elif [ "\${A13_FAKE_SUPPORT_METADATA_UPDATE:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]}],"business":[],"rbac":{"roles":[{"keyDigest":"support-role","rowDigest":"support-row-new","stableRowDigest":"support-stable","mutable":true}],"permissions":[],"assignments":[],"canonicalValid":true,"digest":"metadata-updated"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"}],"digest":"new"}'
          elif [ "\${A13_FAKE_SUPPORT_IDENTITY_DRIFT:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]}],"business":[],"rbac":{"roles":[{"keyDigest":"support-role","rowDigest":"support-row-new","stableRowDigest":"support-stable-changed","mutable":true}],"permissions":[],"assignments":[],"canonicalValid":true,"digest":"identity-drift"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"}],"digest":"new"}'
          elif [ "\${A13_FAKE_EXISTING_COLUMN_DRIFT:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"ai_interactions","columns":["id","channel"]}],"business":[{"table":"ai_interactions","rowCount":"1","digest":"protected-same"}],"rbac":{"roles":[],"permissions":[],"assignments":[],"canonicalValid":true,"digest":"new"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"ai_interactions","rowCount":"1","digest":"full-new"},{"table":"_prisma_migrations","rowCount":"2","digest":"new"}],"digest":"new"}'
          elif [ "\${A13_FAKE_SCHEMA_DRIFT:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[],"business":[],"rbac":{"roles":[],"permissions":[],"assignments":[],"canonicalValid":true,"digest":"new"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"}],"digest":"new"}'
          elif [ "\${A13_FAKE_NEW_TABLE:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]},{"table":"faq_entry_sources","columns":["id"]}],"business":[{"table":"faq_entry_sources","rowCount":"0","digest":"d41d8cd98f00b204e9800998ecf8427e"}],"rbac":{"roles":[{"keyDigest":"role","rowDigest":"role-row","mutable":false}],"permissions":[{"keyDigest":"permission","rowDigest":"permission-row"}],"assignments":[{"keyDigest":"assignment","rowDigest":"assignment-row"}],"canonicalValid":true,"digest":"new"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"},{"table":"faq_entry_sources","rowCount":"0","digest":"d41d8cd98f00b204e9800998ecf8427e"}],"digest":"new-with-table"}'
          elif [ "\${A13_FAKE_NEW_TABLE_ROWS:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]},{"table":"faq_entry_sources","columns":["id"]}],"business":[{"table":"faq_entry_sources","rowCount":"1","digest":"unexpected-backfill"}],"rbac":{"roles":[{"keyDigest":"role","rowDigest":"role-row","mutable":false}],"permissions":[{"keyDigest":"permission","rowDigest":"permission-row"}],"assignments":[{"keyDigest":"assignment","rowDigest":"assignment-row"}],"canonicalValid":true,"digest":"new"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"},{"table":"faq_entry_sources","rowCount":"1","digest":"unexpected-backfill"}],"digest":"new-with-rows"}'
          else
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]}],"business":[],"rbac":{"roles":[{"keyDigest":"role","rowDigest":"role-row","mutable":false}],"permissions":[{"keyDigest":"permission","rowDigest":"permission-row"}],"assignments":[{"keyDigest":"assignment","rowDigest":"assignment-row"}],"canonicalValid":true,"digest":"new"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"2","digest":"new"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"2","digest":"new"}],"digest":"new"}'
          fi
        else
          if [ "\${A13_FAKE_SUPPORT_METADATA_UPDATE:-0}" = 1 ] || [ "\${A13_FAKE_SUPPORT_IDENTITY_DRIFT:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]}],"business":[],"rbac":{"roles":[{"keyDigest":"support-role","rowDigest":"support-row-old","stableRowDigest":"support-stable","mutable":true}],"permissions":[],"assignments":[],"canonicalValid":false,"digest":"old"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"1","digest":"old"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"1","digest":"old"}],"digest":"old"}'
          elif [ "\${A13_FAKE_EXISTING_COLUMN_DRIFT:-0}" = 1 ]; then
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"ai_interactions","columns":["id","channel"]}],"business":[{"table":"ai_interactions","rowCount":"1","digest":"protected-same"}],"rbac":{"roles":[],"permissions":[],"assignments":[],"canonicalValid":false,"digest":"old"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"1","digest":"old"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"ai_interactions","rowCount":"1","digest":"full-old"},{"table":"_prisma_migrations","rowCount":"1","digest":"old"}],"digest":"old"}'
          else
            printf '%s\\n' '{"schemaVersion":1,"schema":[{"table":"tickets","columns":["id"]}],"business":[],"rbac":{"roles":[{"keyDigest":"role","rowDigest":"role-row","mutable":false}],"permissions":[{"keyDigest":"permission","rowDigest":"permission-row"}],"assignments":[{"keyDigest":"assignment","rowDigest":"assignment-row"}],"canonicalValid":false,"digest":"old"},"rag":[],"objectReferences":[],"sequences":[],"migrationLedger":{"present":true,"rowCount":"1","digest":"old"},"integrity":{"invalidConstraints":"0","invalidIndexes":"0"},"full":[{"table":"_prisma_migrations","rowCount":"1","digest":"old"}],"digest":"old"}'
          fi
        fi
        if [ "\${A13_FAKE_LARGE_OUTPUT:-0}" = 1 ]; then
          awk 'BEGIN { for (i = 0; i < 4096; i++) printf " " }'
        fi
        if [ "\${A13_FAKE_LARGE_STDERR:-0}" = 1 ]; then
          awk 'BEGIN { for (i = 0; i < 4096; i++) printf " " }' >&2
        fi
        case "$container_name" in
          *fp-post2*) : > "$A13_FAKE_STATE_DIR/cleanup-phase" ;;
        esac
        ;;
      *) : ;;
    esac
    [ -z "$container_name" ] || rm -f "$(resource_file container "$container_name")"
    ;;
  'exec '*)
    case "$*" in
      *pg_isready*) exit 0 ;;
      *server_version_num*) printf '170005\\n' ;;
      *'df -Pk /var/lib/postgresql/data'*) printf 'Filesystem 1024-blocks Used Available Capacity Mounted on\\nvolume 99999999 1 %s 1%% /var/lib/postgresql/data\\n' "\${A13_FAKE_VOLUME_AVAILABLE_KB:-99999998}" ;;
      *'sha256sum /tmp/database.dump'*) printf '%s  /tmp/database.dump\\n' "\${A13_FAKE_DUMP_SHA}" ;;
      *extversion*) printf '0.8.0\\n' ;;
      *convalidated*) printf '0\\n' ;;
      *indisvalid*) printf '0\\n' ;;
      *ledger-digest*) printf 'ledger-digest\\n' ;;
      *) : ;;
    esac
    ;;
  'cp '*) : ;;
  'rm -f') rm -f "$(resource_file container "$last")" ;;
  'network rm') rm -f "$(resource_file network "$last")" ;;
  'volume rm') rm -f "$(resource_file volume "$last")" ;;
  *) : ;;
esac
`,
  );
}

async function installFakeChecksum(fakeBin) {
  await writeExecutable(
    path.join(fakeBin, "sha256sum"),
    `#!/bin/sh
set -eu
exec /usr/bin/shasum -a 256 "$1"
`,
  );
  await writeExecutable(
    path.join(fakeBin, "pg_restore"),
    `#!/bin/sh
set -eu
printf 'pg_restore %s\\n' "$*" >> "$A13_FAKE_COMMAND_LOG"
exit "\${A13_FAKE_PG_RESTORE_EXIT:-0}"
`,
  );
}

export async function createA13Harness() {
  const rawRoot = await mkdtemp(path.join(os.tmpdir(), "aluplan-a13-test-"));
  const root = await realpath(rawRoot);
  tempRoots.add(root);
  const paths = {
    root,
    fakeBin: path.join(root, "bin"),
    artifactRoot: path.join(root, "release-inputs"),
    artifactDir: path.join(root, "release-inputs", "fixture-run"),
    evidenceRoot: path.join(root, "evidence"),
    imageEvidenceRoot: path.join(root, "image-evidence"),
    imageEvidenceFile: path.join(
      root,
      "image-evidence",
      `image-${"b".repeat(40)}`,
      "image.json",
    ),
    commandLog: path.join(root, "commands.log"),
    stateDir: path.join(root, "docker-state"),
  };
  await Promise.all([
    mkdir(paths.fakeBin),
    mkdir(paths.artifactDir, { recursive: true }),
    mkdir(paths.evidenceRoot),
    mkdir(path.dirname(paths.imageEvidenceFile), { recursive: true }),
    mkdir(paths.stateDir),
  ]);
  await chmod(paths.artifactRoot, 0o700);
  await chmod(paths.artifactDir, 0o700);
  await chmod(paths.evidenceRoot, 0o700);
  await chmod(paths.imageEvidenceRoot, 0o700);
  await writeFile(
    path.join(paths.artifactRoot, ".aluplan-release-input-root"),
    "ALUPLAN_RELEASE_INPUT_ROOT_V1\n",
    { mode: 0o600 },
  );
  await writeFile(
    path.join(paths.evidenceRoot, ".aluplan-a13-evidence-root"),
    "ALUPLAN_A13_EVIDENCE_ROOT_V1\n",
    { mode: 0o600 },
  );
  await writeFile(
    path.join(paths.imageEvidenceRoot, ".aluplan-a13-image-evidence-root"),
    "ALUPLAN_A13_IMAGE_EVIDENCE_ROOT_V1\n",
    { mode: 0o600 },
  );
  await Promise.all([
    installFakeDocker(paths.fakeBin),
    installFakeChecksum(paths.fakeBin),
  ]);
  await writeValidArtifact(paths.artifactDir);
  const checksum = async (relativePath) =>
    createHash("sha256")
      .update(await readFile(path.join(repoRoot, relativePath)))
      .digest("hex");
  const pgvectorImageRef = `pgvector/pgvector@sha256:${"e".repeat(64)}`;
  const imageEvidence = `${JSON.stringify({
      schemaVersion: 1,
      status: "complete",
      productionGo: false,
      gitSha: "b".repeat(40),
      imageId: `sha256:${"a".repeat(64)}`,
      architecture: "amd64",
      pgvectorImageRef,
      pgvectorImageId: `sha256:${"c".repeat(64)}`,
      dockerfileSha256: await checksum("apps/backend/Dockerfile"),
      lockfileSha256: await checksum("pnpm-lock.yaml"),
      migrationManifestSha256: await checksum(
        "packages/database/prisma/migration-checksums.json",
      ),
      restoreScriptSha256: await checksum(
        "scripts/release-a13-restore-drill.sh",
      ),
    })}\n`;
  const imageEvidenceDigest = createHash("sha256")
    .update(imageEvidence)
    .digest("hex");
  await writeFile(paths.imageEvidenceFile, imageEvidence, { mode: 0o600 });
  await writeFile(
    path.join(path.dirname(paths.imageEvidenceFile), "image.json.sha256"),
    `${imageEvidenceDigest}  image.json\n`,
    { mode: 0o600 },
  );
  await writeFile(
    path.join(path.dirname(paths.imageEvidenceFile), "READY.json"),
    `${JSON.stringify({
      schemaVersion: 1,
      status: "complete",
      productionGo: false,
      gitSha: "b".repeat(40),
      imageId: `sha256:${"a".repeat(64)}`,
      pgvectorImageRef,
      pgvectorImageId: `sha256:${"c".repeat(64)}`,
      imageJsonSha256: imageEvidenceDigest,
    })}\n`,
    { mode: 0o600 },
  );
  return paths;
}

export async function writeValidArtifact(artifactDir, overrides = {}) {
  const dump = Buffer.from("PGDMP-a13-fixture");
  const digest = createHash("sha256").update(dump).digest("hex");
  await writeFile(path.join(artifactDir, "database.dump"), dump, { mode: 0o600 });
  await writeFile(
    path.join(artifactDir, "database.dump.sha256"),
    `${overrides.sidecarDigest ?? digest}  database.dump\n`,
    { mode: 0o600 },
  );
  const manifest = {
    schemaVersion: 1,
    status: "complete",
    runId: "fixture-run",
    archive: "database.dump",
    checksum: "database.dump.sha256",
    sha256: digest,
    sizeBytes: dump.byteLength,
    format: "custom",
    postgresClientMajor: 17,
    ...overrides.manifest,
  };
  await writeFile(
    path.join(artifactDir, "READY.json"),
    `${JSON.stringify(manifest)}\n`,
    { mode: 0o600 },
  );
}

export function runRestore(harness, envOverrides = {}) {
  const env = { ...process.env };
  for (const key of [
    "ALLOW_RELEASE_A13_RESTORE",
    "A13_ARTIFACT_DIR",
    "A13_ALLOWED_ARTIFACT_ROOT",
    "A13_BACKEND_IMAGE",
    "A13_PGVECTOR_IMAGE",
    "A13_PGVECTOR_IMAGE_REF",
    "A13_EXPECTED_GIT_SHA",
    "A13_RUN_ID",
    "A13_EVIDENCE_ROOT",
    "A13_IMAGE_EVIDENCE_ROOT",
    "A13_IMAGE_EVIDENCE_FILE",
    "A13_TOOL_PATH",
    "DOCKER_HOST",
    "A13_NODE_BIN",
    "A13_FAKE_INSPECT_ERROR",
    "A13_FAKE_INSPECT_ERROR_DURING_CLEANUP",
    "A13_FAKE_SECOND_PENDING",
    "A13_FAKE_DATA_DRIFT",
    "A13_FAKE_RBAC_DRIFT",
    "A13_FAKE_CUSTOMER_SCENARIO",
    "A13_FAKE_SCHEMA_DRIFT",
    "A13_FAKE_ROUND_ONE_EXIT",
    "A13_FAKE_SOCKET_NO_SUCH",
    "A13_FAKE_PREEXISTING_VOLUME",
    "A13_FAKE_VOLUME_AVAILABLE_KB",
    "A13_MAX_ARCHIVE_BYTES",
  ]) {
    delete env[key];
  }
  const imageId = `sha256:${"a".repeat(64)}`;
  const gitSha = "b".repeat(40);
  return spawnSync("/bin/bash", [restoreScript], {
    cwd: repoRoot,
    encoding: "utf8",
    timeout: 5_000,
    env: {
      ...env,
      ALLOW_RELEASE_A13_RESTORE: "1",
      A13_ARTIFACT_DIR: harness.artifactDir,
      A13_ALLOWED_ARTIFACT_ROOT: harness.artifactRoot,
      A13_BACKEND_IMAGE: imageId,
      A13_PGVECTOR_IMAGE: `sha256:${"c".repeat(64)}`,
      A13_PGVECTOR_IMAGE_REF: `pgvector/pgvector@sha256:${"e".repeat(64)}`,
      A13_EXPECTED_GIT_SHA: gitSha,
      A13_RUN_ID: "a13-test-run",
      A13_EVIDENCE_ROOT: harness.evidenceRoot,
      A13_IMAGE_EVIDENCE_ROOT: harness.imageEvidenceRoot,
      A13_IMAGE_EVIDENCE_FILE: harness.imageEvidenceFile,
      A13_TOOL_PATH: `${harness.fakeBin}:/usr/bin:/bin`,
      A13_FAKE_COMMAND_LOG: harness.commandLog,
      A13_FAKE_IMAGE_ID: imageId,
      A13_FAKE_PG_IMAGE_ID: `sha256:${"c".repeat(64)}`,
      A13_FAKE_DUMP_SHA: createHash("sha256")
        .update(Buffer.from("PGDMP-a13-fixture"))
        .digest("hex"),
      A13_FAKE_IMAGE_REVISION: gitSha,
      A13_FAKE_STATE_DIR: harness.stateDir,
      A13_NODE_BIN: process.execPath,
      ...envOverrides,
    },
  });
}

export async function commandLog(harness) {
  try {
    return await readFile(harness.commandLog, "utf8");
  } catch {
    return "";
  }
}

export async function cleanupA13Harnesses() {
  await Promise.all(
    [...tempRoots].map((root) => rm(root, { recursive: true, force: true })),
  );
  tempRoots.clear();
}
