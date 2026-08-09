#!/usr/bin/env bash

# A.1.3 local-only release evidence. Restores a verified PG17 archive into
# disposable Docker resources, captures redacted fingerprints, and proves a
# second migration pass is a true no-op. It never starts the application.

set -Eeuo pipefail
set +x
umask 077

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
PATH="${A13_TOOL_PATH:-/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin}"
export PATH

fail() { printf 'ERROR: %s\n' "$1" >&2; exit 1; }

[[ "${ALLOW_RELEASE_A13_RESTORE:-}" == '1' ]] \
    || fail 'Set ALLOW_RELEASE_A13_RESTORE=1 for this disposable local drill.'
for required_name in \
    A13_ARTIFACT_DIR A13_ALLOWED_ARTIFACT_ROOT A13_BACKEND_IMAGE \
    A13_PGVECTOR_IMAGE A13_PGVECTOR_IMAGE_REF A13_EXPECTED_GIT_SHA A13_RUN_ID A13_EVIDENCE_ROOT \
    A13_IMAGE_EVIDENCE_ROOT A13_IMAGE_EVIDENCE_FILE; do
    [[ -n "${!required_name:-}" ]] || fail "${required_name} is required."
done

[[ "${A13_RUN_ID}" =~ ^[a-z0-9][a-z0-9-]{5,47}$ ]] \
    || fail 'A13_RUN_ID must be a narrow lowercase identifier.'
[[ "${A13_EXPECTED_GIT_SHA}" =~ ^[a-f0-9]{40}$ ]] \
    || fail 'A13_EXPECTED_GIT_SHA must be a full Git SHA.'
for image_ref in "${A13_BACKEND_IMAGE}" "${A13_PGVECTOR_IMAGE}"; do
    [[ "${image_ref}" =~ ^sha256:[a-f0-9]{64}$ ]] \
        || fail 'A.1.3 images must use immutable sha256 identifiers.'
done
[[ "${A13_PGVECTOR_IMAGE_REF}" =~ ^pgvector/pgvector@sha256:[a-f0-9]{64}$ ]] \
    || fail 'A13_PGVECTOR_IMAGE_REF must be an immutable official pgvector repository digest.'
max_archive_bytes="${A13_MAX_ARCHIVE_BYTES:-5368709120}"
[[ "${max_archive_bytes}" =~ ^[1-9][0-9]*$ ]] || fail 'A13_MAX_ARCHIVE_BYTES is invalid.'
command_timeout="${A13_COMMAND_TIMEOUT_SECONDS:-7200}"
[[ "${command_timeout}" =~ ^[1-9][0-9]*$ ]] || fail 'A13_COMMAND_TIMEOUT_SECONDS is invalid.'
control_timeout="${A13_CONTROL_TIMEOUT_SECONDS:-60}"
[[ "${control_timeout}" =~ ^[1-9][0-9]*$ ]] || fail 'A13_CONTROL_TIMEOUT_SECONDS is invalid.'
max_job_output_bytes="${A13_MAX_JOB_OUTPUT_BYTES:-16777216}"
[[ "${max_job_output_bytes}" =~ ^[1-9][0-9]*$ ]] || fail 'A13_MAX_JOB_OUTPUT_BYTES is invalid.'
max_job_output_blocks="$(( (max_job_output_bytes + 511) / 512 ))"

resolve_tool() {
    local resolved
    resolved="$(command -v "$1" 2>/dev/null || true)"
    [[ -n "${resolved}" && "${resolved}" == /* ]] || fail "Required command is unavailable: $1"
    printf '%s' "${resolved}"
}

docker_bin="$(resolve_tool docker)"
perl_bin="$(resolve_tool perl)"
node_bin="${A13_NODE_BIN:-$(resolve_tool node)}"
[[ "${node_bin}" == /* && -x "${node_bin}" ]] || fail 'A13_NODE_BIN is invalid.'
sha256sum_bin="$(command -v sha256sum 2>/dev/null || true)"
shasum_bin="$(command -v shasum 2>/dev/null || true)"
[[ "${sha256sum_bin}" == /* || "${shasum_bin}" == /* ]] || fail 'A SHA-256 utility is required.'

directory_uid() { stat -f '%u' "$1" 2>/dev/null || stat -c '%u' "$1"; }
directory_mode() { stat -f '%Lp' "$1" 2>/dev/null || stat -c '%a' "$1"; }
file_size() { wc -c < "$1" | tr -d '[:space:]'; }
checksum_file() {
    local digest
    if [[ -n "${sha256sum_bin}" ]]; then digest="$(${sha256sum_bin} "$1")";
    else digest="$(${shasum_bin} -a 256 "$1")"; fi
    digest="${digest%%[[:space:]]*}"
    [[ "${digest}" =~ ^[a-f0-9]{64}$ ]] || fail 'SHA-256 calculation failed.'
    printf '%s' "${digest}"
}
run_timed() {
    "${perl_bin}" -e '$seconds=shift; alarm($seconds); exec @ARGV or exit 127' \
        "${command_timeout}" "$@"
}
run_control() {
    "${perl_bin}" -e '$seconds=shift; alarm($seconds); exec @ARGV or exit 127' \
        "${control_timeout}" "$@"
}

reject_symlink_components() {
    local remaining="${1#/}" current='' component
    local components=()
    IFS='/' read -r -a components <<< "${remaining}"
    for component in "${components[@]}"; do
        [[ -n "${component}" ]] || continue
        current="${current}/${component}"
        [[ ! -L "${current}" ]] || fail 'Release paths must not contain symbolic links.'
    done
}

validate_private_root() {
    local root="$1" marker="$2" marker_value="$3" canonical
    [[ "${root}" == /* && "${root}" != '/' && "${root}" != *'/../'* \
        && "${root}" != */.. && "${root}" != *'//' && "${root}" != */. ]] \
        || fail 'Private roots must be absolute, narrow, and traversal-free.'
    [[ -d "${root}" && ! -L "${root}" ]] || fail 'Private root must be pre-provisioned.'
    reject_symlink_components "${root}"
    canonical="$(cd -P -- "${root}" && pwd)"
    case "${canonical}" in
        /|/bin|/boot|/dev|/etc|/home|/lib|/lib64|/opt|/private|/root|/run|/sbin|/tmp|/usr|/Users|/var|"${REPO_ROOT}")
            fail 'Private root resolves to a broad directory.' ;;
    esac
    [[ "$(directory_uid "${canonical}")" == "$(id -u)" \
        && "$(directory_mode "${canonical}")" == '700' ]] \
        || fail 'Private root must be operator-owned with mode 0700.'
    [[ -f "${canonical}/${marker}" && ! -L "${canonical}/${marker}" \
        && "$(cat "${canonical}/${marker}")" == "${marker_value}" ]] \
        || fail 'Private root marker is missing or invalid.'
    printf '%s' "${canonical}"
}

artifact_root="$(validate_private_root "${A13_ALLOWED_ARTIFACT_ROOT}" \
    '.aluplan-release-input-root' 'ALUPLAN_RELEASE_INPUT_ROOT_V1')"
evidence_root="$(validate_private_root "${A13_EVIDENCE_ROOT}" \
    '.aluplan-a13-evidence-root' 'ALUPLAN_A13_EVIDENCE_ROOT_V1')"
image_evidence_root="$(validate_private_root "${A13_IMAGE_EVIDENCE_ROOT}" \
    '.aluplan-a13-image-evidence-root' 'ALUPLAN_A13_IMAGE_EVIDENCE_ROOT_V1')"

[[ -d "${A13_ARTIFACT_DIR}" && ! -L "${A13_ARTIFACT_DIR}" ]] \
    || fail 'Artifact directory is missing or symbolic.'
reject_symlink_components "${A13_ARTIFACT_DIR}"
artifact_dir="$(cd -P -- "${A13_ARTIFACT_DIR}" && pwd)"
case "${artifact_dir}/" in "${artifact_root}/"*) : ;; *) fail 'Artifact directory escaped its root.' ;; esac

dump_path="${artifact_dir}/database.dump"
checksum_path="${artifact_dir}/database.dump.sha256"
ready_path="${artifact_dir}/READY.json"
for artifact_path in "${dump_path}" "${checksum_path}" "${ready_path}"; do
    [[ -f "${artifact_path}" && ! -L "${artifact_path}" \
        && "$(directory_mode "${artifact_path}")" == '600' ]] \
        || fail 'Release input files must be regular, non-symlink, and mode 0600.'
done
[[ "$(file_size "${ready_path}")" -le 65536 && "$(file_size "${checksum_path}")" -le 1024 ]] \
    || fail 'Release metadata exceeds its safe size limit.'
[[ "$(basename "${artifact_dir}")" == "$("${node_bin}" -e '
  const fs=require("fs"); const value=JSON.parse(fs.readFileSync(process.argv[1],"utf8")).runId;
  if(typeof value!=="string") process.exit(2); process.stdout.write(value);
' "${ready_path}" 2>/dev/null)" ]] || fail 'Artifact runId does not match its directory.'

manifest_field() {
    "${node_bin}" -e '
      const fs=require("fs"); const [file,field]=process.argv.slice(1);
      const value=JSON.parse(fs.readFileSync(file,"utf8"))[field];
      if(value===undefined||value===null||typeof value==="object") process.exit(2);
      process.stdout.write(String(value));
    ' "$1" "$2" || fail 'JSON evidence is invalid.'
}

[[ "$(manifest_field "${ready_path}" schemaVersion)" == '1' \
    && "$(manifest_field "${ready_path}" status)" == 'complete' \
    && "$(manifest_field "${ready_path}" format)" == 'custom' \
    && "$(manifest_field "${ready_path}" archive)" == 'database.dump' \
    && "$(manifest_field "${ready_path}" checksum)" == 'database.dump.sha256' \
    ]] || fail 'READY manifest contract is invalid.'
[[ "$(manifest_field "${ready_path}" postgresClientMajor)" == '17' ]] \
    || fail 'READY manifest must prove PostgreSQL 17 backup clients.'

sidecar="$(cat "${checksum_path}")"
[[ "${sidecar}" =~ ^([a-f0-9]{64})[[:space:]][[:space:]]database\.dump$ ]] \
    || fail 'Backup checksum sidecar has an invalid format.'
actual_size="$(file_size "${dump_path}")"
[[ "${actual_size}" -gt 0 && "${actual_size}" -le "${max_archive_bytes}" ]] \
    || fail 'Backup archive exceeds the explicit size budget.'
actual_sha="$(checksum_file "${dump_path}")"
[[ "${actual_sha}" == "${BASH_REMATCH[1]}" \
    && "$(manifest_field "${ready_path}" sha256)" == "${actual_sha}" \
    && "${actual_size}" == "$(manifest_field "${ready_path}" sizeBytes)" ]] \
    || fail 'Backup checksum or size does not match READY.'
available_kb="$(df -Pk "${evidence_root}" | awk 'NR==2 {print $4}')"
required_kb="$(( (actual_size * 4 + 1073741824 + 1023) / 1024 ))"
[[ "${available_kb}" =~ ^[0-9]+$ && "${available_kb}" -ge "${required_kb}" ]] \
    || fail 'Insufficient host disk headroom for the disposable drill.'

[[ -f "${A13_IMAGE_EVIDENCE_FILE}" && ! -L "${A13_IMAGE_EVIDENCE_FILE}" \
    && "$(directory_mode "${A13_IMAGE_EVIDENCE_FILE}")" == '600' ]] \
    || fail 'Exact-image evidence must be a regular mode-0600 file.'
reject_symlink_components "${A13_IMAGE_EVIDENCE_FILE}"
image_evidence_file="$(cd -P -- "$(dirname -- "${A13_IMAGE_EVIDENCE_FILE}")" && pwd)/$(basename "${A13_IMAGE_EVIDENCE_FILE}")"
case "${image_evidence_file}" in "${image_evidence_root}/"*) : ;; *) fail 'Image evidence escaped its root.' ;; esac
[[ "${image_evidence_file}" == "${image_evidence_root}/image-${A13_EXPECTED_GIT_SHA}/image.json" ]] \
    || fail 'Exact-image evidence must use the canonical image-<gitSha>/image.json path.'
[[ "$(file_size "${image_evidence_file}")" -le 65536 ]] \
    || fail 'Exact-image evidence exceeds its safe size limit.'
image_evidence_sidecar="$(dirname "${image_evidence_file}")/image.json.sha256"
image_evidence_ready="$(dirname "${image_evidence_file}")/READY.json"
for image_evidence_path in "${image_evidence_sidecar}" "${image_evidence_ready}"; do
    [[ -f "${image_evidence_path}" && ! -L "${image_evidence_path}" \
        && "$(directory_mode "${image_evidence_path}")" == '600' ]] \
        || fail 'Exact-image checksum and READY evidence are required.'
    [[ "$(file_size "${image_evidence_path}")" -le 65536 ]] \
        || fail 'Exact-image checksum or READY evidence exceeds its safe size limit.'
done
image_sidecar="$(cat "${image_evidence_sidecar}")"
[[ "${image_sidecar}" =~ ^([a-f0-9]{64})[[:space:]][[:space:]]image\.json$ ]] \
    || fail 'Exact-image evidence checksum is invalid.'
image_json_sha="${BASH_REMATCH[1]}"
[[ "$(checksum_file "${image_evidence_file}")" == "${image_json_sha}" ]] \
    || fail 'Exact-image evidence checksum is invalid.'
[[ "$(manifest_field "${image_evidence_file}" status)" == 'complete' \
    && "$(manifest_field "${image_evidence_file}" schemaVersion)" == '1' \
    && "$(manifest_field "${image_evidence_file}" productionGo)" == 'false' \
    && "$(manifest_field "${image_evidence_file}" gitSha)" == "${A13_EXPECTED_GIT_SHA}" \
    && "$(manifest_field "${image_evidence_file}" imageId)" == "${A13_BACKEND_IMAGE}" \
    && "$(manifest_field "${image_evidence_file}" architecture)" == 'amd64' \
    && "$(manifest_field "${image_evidence_file}" pgvectorImageRef)" == "${A13_PGVECTOR_IMAGE_REF}" \
    && "$(manifest_field "${image_evidence_file}" pgvectorImageId)" == "${A13_PGVECTOR_IMAGE}" \
    && "$(manifest_field "${image_evidence_file}" dockerfileSha256)" == "$(checksum_file "${REPO_ROOT}/apps/backend/Dockerfile")" \
    && "$(manifest_field "${image_evidence_file}" lockfileSha256)" == "$(checksum_file "${REPO_ROOT}/pnpm-lock.yaml")" \
    && "$(manifest_field "${image_evidence_file}" migrationManifestSha256)" == "$(checksum_file "${REPO_ROOT}/packages/database/prisma/migration-checksums.json")" \
    && "$(manifest_field "${image_evidence_file}" restoreScriptSha256)" == "$(checksum_file "${BASH_SOURCE[0]}")" ]] \
    || fail 'Exact-image evidence does not match this drill.'
[[ "$(manifest_field "${image_evidence_ready}" status)" == 'complete' \
    && "$(manifest_field "${image_evidence_ready}" productionGo)" == 'false' \
    && "$(manifest_field "${image_evidence_ready}" gitSha)" == "${A13_EXPECTED_GIT_SHA}" \
    && "$(manifest_field "${image_evidence_ready}" imageId)" == "${A13_BACKEND_IMAGE}" \
    && "$(manifest_field "${image_evidence_ready}" pgvectorImageRef)" == "${A13_PGVECTOR_IMAGE_REF}" \
    && "$(manifest_field "${image_evidence_ready}" pgvectorImageId)" == "${A13_PGVECTOR_IMAGE}" \
    && "$(manifest_field "${image_evidence_ready}" imageJsonSha256)" == "${image_json_sha}" ]] \
    || fail 'Exact-image READY evidence does not match this drill.'

[[ -z "${DOCKER_HOST:-}" || "${DOCKER_HOST}" == unix://* ]] || fail 'A.1.3 requires local Docker.'
docker_context="$(run_control "${docker_bin}" context show)" || fail 'Unable to inspect Docker context.'
docker_endpoint="$(run_control "${docker_bin}" context inspect --format '{{(index .Endpoints "docker").Host}}' "${docker_context}")" \
    || fail 'Unable to inspect Docker endpoint.'
[[ "${docker_context}" != *://* && "${docker_endpoint}" == unix://* ]] || fail 'A.1.3 requires local Docker.'
export DOCKER_HOST="${docker_endpoint}"
unset DOCKER_CONTEXT
resolved_backend="$(run_control "${docker_bin}" image inspect --format '{{.Id}}' "${A13_BACKEND_IMAGE}")" || fail 'Backend image missing.'
resolved_pg="$(run_control "${docker_bin}" image inspect --format '{{.Id}}' "${A13_PGVECTOR_IMAGE_REF}")" || fail 'PG image missing.'
pg_repo_digests="$(run_control "${docker_bin}" image inspect --format '{{join .RepoDigests "\n"}}' "${A13_PGVECTOR_IMAGE_REF}")"
backend_arch="$(run_control "${docker_bin}" image inspect --format '{{.Architecture}}' "${A13_BACKEND_IMAGE}")"
image_revision="$(run_control "${docker_bin}" image inspect --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}' "${A13_BACKEND_IMAGE}")"
[[ "${resolved_backend}" == "${A13_BACKEND_IMAGE}" ]] \
    || fail 'Backend image identity mismatch.'
[[ "${resolved_pg}" == "${A13_PGVECTOR_IMAGE}" \
    && "${pg_repo_digests}" == *"${A13_PGVECTOR_IMAGE_REF}"* ]] \
    || fail 'Pgvector image is not bound to the approved repository digest.'
[[ "${backend_arch}" == 'amd64' && "${image_revision}" == "${A13_EXPECTED_GIT_SHA}" ]] \
    || fail 'Backend image architecture or revision mismatch.'

run_dir="${evidence_root}/${A13_RUN_ID}"
[[ ! -e "${run_dir}" ]] || fail 'Evidence run directory already exists.'
mkdir -- "${run_dir}" && chmod 0700 "${run_dir}"

network_name="aluplan-a13-net-${A13_RUN_ID}"
volume_name="aluplan-a13-pg-${A13_RUN_ID}"
container_name="aluplan-a13-db-${A13_RUN_ID}"
run_label="com.aluplan.a13.run=${A13_RUN_ID}"
job_names=(
    "aluplan-a13-fp-raw-${A13_RUN_ID}" "aluplan-a13-fp-pre-${A13_RUN_ID}"
    "aluplan-a13-migrate-1-${A13_RUN_ID}" "aluplan-a13-fp-post1-${A13_RUN_ID}"
    "aluplan-a13-migrate-2-${A13_RUN_ID}" "aluplan-a13-fp-post2-${A13_RUN_ID}"
)
network_id='' volume_id='' container_id='' resources_cleaned=0

inspect_label() {
    local kind="$1" reference="$2" output error_file="${run_dir}/inspect.err" status
    set +e
    case "${kind}" in
        container) output="$(run_control "${docker_bin}" inspect --format '{{ index .Config.Labels "com.aluplan.a13.run" }}' "${reference}" 2>"${error_file}")" ;;
        network) output="$(run_control "${docker_bin}" network inspect --format '{{ index .Labels "com.aluplan.a13.run" }}' "${reference}" 2>"${error_file}")" ;;
        volume) output="$(run_control "${docker_bin}" volume inspect --format '{{ index .Labels "com.aluplan.a13.run" }}' "${reference}" 2>"${error_file}")" ;;
    esac
    status=$?
    set -e
    if [[ "${status}" -eq 0 ]]; then rm -f "${error_file}"; printf '%s' "${output}"; return 0; fi
    case "${kind}" in
        container)
            grep -Fqx "Error: No such object: ${reference}" "${error_file}" \
                || grep -Fqx "Error response from daemon: No such container: ${reference}" "${error_file}" \
                || grep -Fqx "error: no such object: ${reference}" "${error_file}" \
                || { rm -f "${error_file}"; return 1; } ;;
        network)
            grep -Fqx "Error: No such network: ${reference}" "${error_file}" \
                || grep -Fqx "Error response from daemon: network ${reference} not found" "${error_file}" \
                || { rm -f "${error_file}"; return 1; } ;;
        volume)
            grep -Fqx "Error: No such volume: ${reference}" "${error_file}" \
                || grep -Fqx "Error response from daemon: get ${reference}: no such volume" "${error_file}" \
                || { rm -f "${error_file}"; return 1; } ;;
    esac
    rm -f "${error_file}"
    return 3
}

assert_resource_absent() {
    local kind="$1" reference="$2" status
    if inspect_label "${kind}" "${reference}" >/dev/null; then
        fail "Disposable ${kind} name is already in use."
    else
        status=$?
        [[ "${status}" -eq 3 ]] || fail "Unable to prove disposable ${kind} name is absent."
    fi
}

remove_owned() {
    local kind="$1" reference="$2" label status
    if label="$(inspect_label "${kind}" "${reference}")"; then
        [[ "${label}" == "${A13_RUN_ID}" ]] || return 1
        case "${kind}" in
            container) run_control "${docker_bin}" rm -f "${reference}" >/dev/null ;;
            network) run_control "${docker_bin}" network rm "${reference}" >/dev/null ;;
            volume) run_control "${docker_bin}" volume rm "${reference}" >/dev/null ;;
        esac
    else
        status=$?
        [[ "${status}" -eq 3 ]] || return 1
    fi
    if inspect_label "${kind}" "${reference}" >/dev/null; then return 1; else status=$?; fi
    [[ "${status}" -eq 3 ]]
}

cleanup_owned_resources() {
    local status=0 job
    for job in "${job_names[@]}"; do remove_owned container "${job}" || status=1; done
    remove_owned container "${container_name}" || status=1
    remove_owned network "${network_name}" || status=1
    remove_owned volume "${volume_name}" || status=1
    [[ "${status}" -eq 0 ]] && resources_cleaned=1
    return "${status}"
}

cleanup_on_exit() {
    local exit_code=$?
    trap - EXIT INT TERM
    [[ "${resources_cleaned}" -eq 1 ]] || cleanup_owned_resources || exit_code=1
    rm -f -- "${run_dir}/postgres.env" "${run_dir}/raw.env" "${run_dir}/candidate.env" "${run_dir}/inspect.err"
    exit "${exit_code}"
}
trap cleanup_on_exit EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

synthetic_password="$("${node_bin}" -e 'const c=require("crypto");process.stdout.write(c.createHash("sha256").update(process.argv[1]).digest("hex"))' "${A13_RUN_ID}")"
printf 'POSTGRES_USER=a13_operator\nPOSTGRES_PASSWORD=%s\nPOSTGRES_DB=a13_raw\n' "${synthetic_password}" > "${run_dir}/postgres.env"
printf 'DATABASE_URL=postgresql://a13_operator:%s@%s:5432/a13_raw\n' "${synthetic_password}" "${container_name}" > "${run_dir}/raw.env"
printf 'DATABASE_URL=postgresql://a13_operator:%s@%s:5432/a13_candidate\n' "${synthetic_password}" "${container_name}" > "${run_dir}/candidate.env"
chmod 0600 "${run_dir}/postgres.env" "${run_dir}/raw.env" "${run_dir}/candidate.env"

assert_resource_absent network "${network_name}"
assert_resource_absent volume "${volume_name}"
assert_resource_absent container "${container_name}"
for job in "${job_names[@]}"; do assert_resource_absent container "${job}"; done

network_id="$(run_control "${docker_bin}" network create --internal --label "${run_label}" "${network_name}")" || fail 'Network create failed.'
[[ "$(inspect_label network "${network_id}")" == "${A13_RUN_ID}" ]] \
    || fail 'Created network ownership could not be proven.'
volume_id="$(run_control "${docker_bin}" volume create --label "${run_label}" "${volume_name}")" || fail 'Volume create failed.'
[[ "$(inspect_label volume "${volume_name}")" == "${A13_RUN_ID}" ]] \
    || fail 'Created volume ownership could not be proven.'
container_id="$(run_control "${docker_bin}" run -d --name "${container_name}" --network "${network_name}" --label "${run_label}" \
    --memory 2g --cpus 2 --pids-limit 512 --env-file "${run_dir}/postgres.env" \
    --mount "type=volume,src=${volume_name},dst=/var/lib/postgresql/data" "${A13_PGVECTOR_IMAGE}")" \
    || fail 'Disposable PostgreSQL start failed.'
[[ "$(inspect_label container "${container_id}")" == "${A13_RUN_ID}" ]] \
    || fail 'Created PostgreSQL container ownership could not be proven.'

ready=0
for ((attempt = 1; attempt <= 60; attempt += 1)); do
    if run_control "${docker_bin}" exec "${container_id}" pg_isready -U a13_operator -d a13_raw >/dev/null 2>&1; then ready=1; break; fi
    sleep 1
done
[[ "${ready}" -eq 1 ]] || fail 'Disposable PostgreSQL readiness timed out.'
server_major="$(run_control "${docker_bin}" exec "${container_id}" psql -U a13_operator -d a13_raw -Atqc "SELECT current_setting('server_version_num')")"
[[ "${server_major}" == 17* ]] || fail 'Disposable database must be PostgreSQL 17.'
volume_available_kb="$(run_control "${docker_bin}" exec "${container_id}" df -Pk /var/lib/postgresql/data | awk 'NR==2 {print $4}')"
[[ "${volume_available_kb}" =~ ^[0-9]+$ && "${volume_available_kb}" -ge "${required_kb}" ]] \
    || fail 'Insufficient Docker volume headroom for the disposable drill.'
run_control "${docker_bin}" exec "${container_id}" psql -U a13_operator -d a13_raw -v ON_ERROR_STOP=1 -qc 'CREATE EXTENSION IF NOT EXISTS vector' >/dev/null

run_timed "${docker_bin}" run --rm --network none --read-only --memory 512m --cpus 1 --pids-limit 128 \
    --mount "type=bind,src=${artifact_dir},dst=/input,readonly" --entrypoint pg_restore \
    "${A13_BACKEND_IMAGE}" --list /input/database.dump >/dev/null || fail 'PG17 archive catalog validation failed.'
[[ "$(checksum_file "${dump_path}")" == "${actual_sha}" ]] || fail 'Backup archive changed before staging.'
run_timed "${docker_bin}" cp "${dump_path}" "${container_id}:/tmp/database.dump" || fail 'Archive staging failed.'
[[ "$(checksum_file "${dump_path}")" == "${actual_sha}" ]] || fail 'Backup archive changed during staging.'
staged_sha="$(run_timed "${docker_bin}" exec "${container_id}" sha256sum /tmp/database.dump | awk '{print $1}')"
[[ "${staged_sha}" == "${actual_sha}" ]] || fail 'Staged backup archive checksum mismatch.'
run_timed "${docker_bin}" exec "${container_id}" pg_restore --exit-on-error --single-transaction --no-owner --no-privileges \
    --username=a13_operator --dbname=a13_raw /tmp/database.dump || fail 'Disposable restore failed.'

run_backend() {
    local name="$1" env_file="$2" output_file="$3" command_status; shift 3
    command_status=0
    (ulimit -f "${max_job_output_blocks}"; run_timed "${docker_bin}" run --rm --name "${name}" \
        --network "${network_name}" --label "${run_label}" \
        --memory 2g --cpus 2 --pids-limit 512 \
        --read-only --tmpfs /tmp:rw,noexec,nosuid,size=256m \
        --cap-drop ALL --security-opt no-new-privileges \
        --env-file "${env_file}" "${A13_BACKEND_IMAGE}" "$@") \
        > "${output_file}" 2>&1 || command_status=$?
    chmod 0600 "${output_file}"
    [[ "$(file_size "${output_file}")" -le "${max_job_output_bytes}" ]] || return 125
    return "${command_status}"
}

run_backend "${job_names[0]}" "${run_dir}/raw.env" "${run_dir}/baseline-fingerprint.json" node ./scripts/capture-release-fingerprints.mjs \
    || fail 'Baseline fingerprint failed.'
run_timed "${docker_bin}" exec "${container_id}" psql -U a13_operator -d postgres -v ON_ERROR_STOP=1 -qc \
    'CREATE DATABASE a13_candidate WITH TEMPLATE a13_raw OWNER a13_operator' || fail 'Candidate clone failed.'
run_backend "${job_names[1]}" "${run_dir}/candidate.env" "${run_dir}/candidate-pre-fingerprint.json" node ./scripts/capture-release-fingerprints.mjs \
    || fail 'Pre-migration fingerprint failed.'

"${node_bin}" -e '
  const fs=require("fs"); const [a,b]=process.argv.slice(1).map(p=>JSON.parse(fs.readFileSync(p,"utf8")));
  if(JSON.stringify(a)!==JSON.stringify(b)) process.exit(1);
' "${run_dir}/baseline-fingerprint.json" "${run_dir}/candidate-pre-fingerprint.json" \
    || fail 'Candidate clone does not match the restored baseline.'

run_backend "${job_names[2]}" "${run_dir}/candidate.env" "${run_dir}/migration-round-1.log" ./apps/backend/scripts/migrate-once.sh \
    || fail 'Migration round 1 failed.'
run_backend "${job_names[3]}" "${run_dir}/candidate.env" "${run_dir}/candidate-post-round-1.json" node ./scripts/capture-release-fingerprints.mjs \
    || fail 'Post-round-1 fingerprint failed.'
run_backend "${job_names[4]}" "${run_dir}/candidate.env" "${run_dir}/migration-round-2.log" ./apps/backend/scripts/migrate-once.sh \
    || fail 'Migration round 2 failed.'
grep -Fq 'No pending migrations to apply.' "${run_dir}/migration-round-2.log" \
    || fail 'Migration round 2 did not prove an explicit no-op.'
run_backend "${job_names[5]}" "${run_dir}/candidate.env" "${run_dir}/candidate-post-round-2.json" node ./scripts/capture-release-fingerprints.mjs \
    || fail 'Post-round-2 fingerprint failed.'

"${node_bin}" -e '
  const fs=require("fs"); const crypto=require("crypto");
  const [basePath,onePath,twoPath,outPath]=process.argv.slice(1);
  const base=JSON.parse(fs.readFileSync(basePath,"utf8"));
  const one=JSON.parse(fs.readFileSync(onePath,"utf8"));
  const two=JSON.parse(fs.readFileSync(twoPath,"utf8"));
  const keyed=(rows)=>new Map(rows.map((row)=>[row.keyDigest,row]));
  const keyedByTable=(rows)=>new Map(rows.map((row)=>[row.table,row]));
  const assertPreserved=(before,after,{allowMutable=false}={})=>{
    const current=keyed(after);
    for(const row of before){
      const candidate=current.get(row.keyDigest);
      if(!candidate) process.exit(14);
      if(allowMutable&&row.mutable===true){
        if(!row.stableRowDigest||candidate.stableRowDigest!==row.stableRowDigest) process.exit(15);
      }else if(candidate.rowDigest!==row.rowDigest) process.exit(15);
    }
  };
  const reviewedAdditiveColumns=new Map([
    ["ai_interactions",["channel"]],
    ["crm_accounts",["customer_no"]],
    ["customer_profiles",["tags"]],
    ["knowledge_sources",["language"]],
    ["users",["email_verification_jti_hash","email_verification_sent_at","password_reset_jti_hash","password_reset_sent_at","session_version"]],
  ]);
  const assertBusinessPreserved=(before,after,baseSchema,baseFull,afterFull)=>{
    const current=keyedByTable(after);
    const baselineTables=new Set(before.map((row)=>row.table));
    const fullBefore=keyedByTable(baseFull); const fullAfter=keyedByTable(afterFull);
    const schema=new Map(baseSchema.map((entry)=>[entry.table,new Set(entry.columns)]));
    for(const row of before){
      const candidate=current.get(row.table);
      const reviewed=reviewedAdditiveColumns.get(row.table)??[];
      const existing=reviewed.filter((column)=>schema.get(row.table)?.has(column));
      if(existing.length!==0&&existing.length!==reviewed.length) process.exit(19);
      if(existing.length===reviewed.length&&reviewed.length!==0){
        const fullCandidate=fullAfter.get(row.table); const fullBaseline=fullBefore.get(row.table);
        if(!fullCandidate||!fullBaseline||fullCandidate.rowCount!==fullBaseline.rowCount||fullCandidate.digest!==fullBaseline.digest) process.exit(10);
      }else if(!candidate||candidate.rowCount!==row.rowCount||candidate.digest!==row.digest) process.exit(10);
    }
    for(const row of after){
      if(baselineTables.has(row.table)) continue;
      if(row.table!=="faq_entry_sources"||row.rowCount!=="0"||row.digest!=="d41d8cd98f00b204e9800998ecf8427e") process.exit(20);
    }
  };
  const md5=(value)=>crypto.createHash("md5").update(value).digest("hex");
  const assertOnlyAllowedKeysAdded=(before,after,allowed)=>{
    const existing=new Set(before.map((row)=>row.keyDigest));
    for(const row of after) if(!existing.has(row.keyDigest)&&!allowed.has(row.keyDigest)) process.exit(18);
  };
  const canonicalPermissions=["*","admin:settings","ai-interactions:read","faq:manage","faq:read","faq:review","kb:approve","kb:create","kb:delete","kb:read","kb:submit_review","kb:update","reports:read","settings:read","settings:write","ticket:assign","ticket:close","ticket:create","ticket:escalate","ticket:read","ticket:update","users:manage"];
  const supportPermissions=["ai-interactions:read","faq:manage","faq:read","faq:review","kb:approve","kb:create","kb:read","kb:submit_review","kb:update","reports:read","ticket:assign","ticket:close","ticket:create","ticket:escalate","ticket:read","ticket:update"];
  const reviewerGrants=new Map([
    ["ADMIN",["faq:review","ai-interactions:read"]],
    ["SUPER_ADMIN",["faq:review","ai-interactions:read"]],
    ["SUPERUSER",["faq:review","ai-interactions:read"]],
    ["SUPPORT_MANAGER",["faq:review"]],
    ["KB_EDITOR",["faq:review"]],
    ["SUPPORT_AGENT",supportPermissions],
  ]);
  const allowedAssignment=(row)=>{
    for(const [role,permissions] of reviewerGrants)
      if(row.normalizedRoleDigest===md5(role)&&permissions.some((permission)=>row.permissionDigest===md5(permission))) return true;
    return false;
  };
  const assertOnlyAllowedAssignmentsAdded=(before,after)=>{
    const existing=new Set(before.map((row)=>row.keyDigest));
    for(const row of after) if(!existing.has(row.keyDigest)&&!allowedAssignment(row)) process.exit(18);
  };
  const postSchema=new Map(one.schema.map((entry)=>[entry.table,new Set(entry.columns)]));
  for(const entry of base.schema){
    const columns=postSchema.get(entry.table);
    if(!columns||entry.columns.some((column)=>!columns.has(column))) process.exit(16);
  }
  assertBusinessPreserved(base.business,one.business,base.schema,base.full,one.full);
  for(const key of ["rag","objectReferences","sequences"])
    if(JSON.stringify(base[key])!==JSON.stringify(one[key])) process.exit(10);
  assertPreserved(base.rbac.roles,one.rbac.roles,{allowMutable:true});
  assertPreserved(base.rbac.permissions,one.rbac.permissions);
  assertPreserved(base.rbac.assignments,one.rbac.assignments);
  assertOnlyAllowedKeysAdded(base.rbac.roles,one.rbac.roles,new Set([md5("SUPPORT_AGENT")]));
  assertOnlyAllowedKeysAdded(base.rbac.permissions,one.rbac.permissions,new Set(canonicalPermissions.map(md5)));
  assertOnlyAllowedAssignmentsAdded(base.rbac.assignments,one.rbac.assignments);
  if(one.rbac.canonicalValid!==true) process.exit(17);
  if(JSON.stringify(one)!==JSON.stringify(two)) process.exit(11);
  if(one.integrity.invalidConstraints!=="0"||one.integrity.invalidIndexes!=="0") process.exit(12);
  if(one.rag.some(surface=>surface.groups.some(group=>group.dimensionMismatches!=="0"))) process.exit(13);
  fs.writeFileSync(outPath, JSON.stringify({schemaVersion:1,status:"verified",productionGo:false,
    stableSurfaces:["business","rag","objectReferences","sequences","rbac-baseline","schema-baseline"],
    canonicalRbac:true,schemaParity:true,roundTwoNoOp:true})+"\n", {mode:0o600});
' "${run_dir}/baseline-fingerprint.json" "${run_dir}/candidate-post-round-1.json" \
    "${run_dir}/candidate-post-round-2.json" "${run_dir}/parity.json" \
    || fail 'Migration changed protected data or round 2 was not idempotent.'

cat > "${run_dir}/restore.json" <<EOF
{"schemaVersion":1,"status":"complete","productionGo":false,"runId":"${A13_RUN_ID}","gitSha":"${A13_EXPECTED_GIT_SHA}","backendImage":"${A13_BACKEND_IMAGE}","pgvectorImage":"${A13_PGVECTOR_IMAGE}","artifactSha256":"${actual_sha}","artifactSizeBytes":${actual_size},"postgresMajor":17}
EOF
chmod 0600 "${run_dir}/restore.json"

cleanup_owned_resources || fail 'Disposable resource cleanup failed.'
printf '{"schemaVersion":1,"status":"clean","runId":"%s"}\n' "${A13_RUN_ID}" > "${run_dir}/cleanup.json"
printf '{"schemaVersion":1,"status":"local-a13-complete","productionGo":false,"runId":"%s"}\n' "${A13_RUN_ID}" > "${run_dir}/LOCAL-A13.json"
chmod 0600 "${run_dir}/cleanup.json" "${run_dir}/LOCAL-A13.json"
printf 'A.1.3 local evidence complete; production remains NO-GO.\n'
