#!/usr/bin/env bash

# Build the exact linux/amd64 backend image from a clean commit and perform a
# static, network-disabled smoke test. This does not start the NestJS app.

set -Eeuo pipefail
set +x
umask 077

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
PATH="${A13_TOOL_PATH:-/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin}"
export PATH

fail() {
    printf 'ERROR: %s\n' "$1" >&2
    exit 1
}

[[ "${ALLOW_RELEASE_A13_IMAGE:-}" == '1' ]] \
    || fail 'Set ALLOW_RELEASE_A13_IMAGE=1 for this local exact-image build.'
[[ "${A13_PGVECTOR_IMAGE_REF:-}" =~ ^pgvector/pgvector@sha256:[a-f0-9]{64}$ ]] \
    || fail 'A13_PGVECTOR_IMAGE_REF must be an immutable official pgvector repository digest.'
[[ -z "${DOCKER_HOST:-}" || "${DOCKER_HOST}" == unix://* ]] \
    || fail 'A.1.3 requires a local Docker endpoint.'

docker_bin="$(command -v docker 2>/dev/null || true)"
git_bin="$(command -v git 2>/dev/null || true)"
perl_bin="$(command -v perl 2>/dev/null || true)"
tar_bin="$(command -v tar 2>/dev/null || true)"
sha256sum_bin="$(command -v sha256sum 2>/dev/null || true)"
shasum_bin="$(command -v shasum 2>/dev/null || true)"
[[ "${docker_bin}" == /* && "${git_bin}" == /* && "${perl_bin}" == /* && "${tar_bin}" == /* \
    && ( "${sha256sum_bin}" == /* || "${shasum_bin}" == /* ) ]] \
    || fail 'docker, git, and a SHA-256 utility are required.'
command_timeout="${A13_COMMAND_TIMEOUT_SECONDS:-7200}"
control_timeout="${A13_CONTROL_TIMEOUT_SECONDS:-60}"
max_build_context_bytes="${A13_MAX_BUILD_CONTEXT_BYTES:-2147483648}"
[[ "${command_timeout}" =~ ^[1-9][0-9]*$ && "${control_timeout}" =~ ^[1-9][0-9]*$ \
    && "${max_build_context_bytes}" =~ ^[1-9][0-9]*$ ]] \
    || fail 'A.1.3 timeout values are invalid.'

run_with_timeout() {
    local seconds="$1"; shift
    "${perl_bin}" -e '$seconds=shift; alarm($seconds); exec @ARGV or exit 127' "${seconds}" "$@"
}
run_control() { run_with_timeout "${control_timeout}" "$@"; }
run_long() { run_with_timeout "${command_timeout}" "$@"; }

checksum_file() {
    local file_path="$1"
    local digest
    if [[ -n "${sha256sum_bin}" ]]; then
        digest="$(${sha256sum_bin} "${file_path}")"
    else
        digest="$(${shasum_bin} -a 256 "${file_path}")"
    fi
    digest="${digest%%[[:space:]]*}"
    [[ "${digest}" =~ ^[a-f0-9]{64}$ ]] || fail 'SHA-256 calculation failed.'
    printf '%s' "${digest}"
}

directory_uid() {
    stat -f '%u' "$1" 2>/dev/null || stat -c '%u' "$1"
}

directory_mode() {
    stat -f '%Lp' "$1" 2>/dev/null || stat -c '%a' "$1"
}

file_size() {
    stat -f '%z' "$1" 2>/dev/null || stat -c '%s' "$1"
}

reject_symlink_components() {
    local target_path="$1"
    local remaining="${target_path#/}"
    local current=''
    local component
    local components=()
    IFS='/' read -r -a components <<< "${remaining}"
    for component in "${components[@]}"; do
        [[ -n "${component}" ]] || continue
        current="${current}/${component}"
        [[ ! -L "${current}" ]] || fail 'Image evidence paths must not contain symbolic links.'
    done
}

cd "${REPO_ROOT}"
[[ -z "$(git status --short)" ]] \
    || fail 'Exact release images may only be built from a clean worktree.'
git_sha="$(git rev-parse HEAD)"
[[ "${git_sha}" =~ ^[a-f0-9]{40}$ ]] || fail 'Unable to resolve the full Git SHA.'
if [[ -n "${A13_EXPECTED_GIT_SHA:-}" ]]; then
    [[ "${A13_EXPECTED_GIT_SHA}" == "${git_sha}" ]] \
        || fail 'Expected Git SHA does not match the clean checkout.'
fi

docker_context="$(run_control "${docker_bin}" context show)" || fail 'Unable to inspect Docker context.'
[[ "${docker_context}" != *://* ]] || fail 'A.1.3 requires a local Docker context.'
docker_endpoint="$(run_control "${docker_bin}" context inspect --format '{{(index .Endpoints "docker").Host}}' "${docker_context}")" \
    || fail 'Unable to inspect Docker endpoint.'
[[ "${docker_endpoint}" == unix://* ]] || fail 'A.1.3 requires a local Docker endpoint.'
export DOCKER_HOST="${docker_endpoint}"
unset DOCKER_CONTEXT

private_root="${REPO_ROOT}/.private-data"
[[ -d "${private_root}" && ! -L "${private_root}" ]] \
    || fail 'Repository private-data root must be pre-provisioned.'
reject_symlink_components "${private_root}"
private_root="$(cd -P -- "${private_root}" && pwd)"
[[ "$(directory_uid "${private_root}")" == "$(id -u)" \
    && "$(directory_mode "${private_root}")" == '700' ]] \
    || fail 'Repository private-data root must be operator-owned with mode 0700.'

release_evidence_root="${private_root}/release-evidence"
if [[ -e "${release_evidence_root}" || -L "${release_evidence_root}" ]]; then
    [[ -d "${release_evidence_root}" && ! -L "${release_evidence_root}" ]] \
        || fail 'Release evidence parent must be a real directory.'
else
    mkdir -- "${release_evidence_root}"
    chmod 0700 "${release_evidence_root}"
fi
evidence_root="${release_evidence_root}/a13-images"
if [[ -e "${evidence_root}" || -L "${evidence_root}" ]]; then
    [[ -d "${evidence_root}" && ! -L "${evidence_root}" ]] \
        || fail 'Image evidence root must be a real directory.'
else
    mkdir -- "${evidence_root}"
    chmod 0700 "${evidence_root}"
fi
reject_symlink_components "${evidence_root}"
evidence_root="$(cd -P -- "${evidence_root}" && pwd)"
case "${evidence_root}/" in
    "${private_root}/"*) : ;;
    *) fail 'Image evidence escaped the repository private-data root.' ;;
esac
[[ "$(directory_uid "${release_evidence_root}")" == "$(id -u)" \
    && "$(directory_mode "${release_evidence_root}")" == '700' \
    && "$(directory_uid "${evidence_root}")" == "$(id -u)" \
    && "$(directory_mode "${evidence_root}")" == '700' ]] \
    || fail 'Release evidence directories must be operator-owned with mode 0700.'
marker_path="${evidence_root}/.aluplan-a13-image-evidence-root"
[[ ! -L "${marker_path}" ]] || fail 'Image evidence marker must not be symbolic.'
if [[ ! -e "${marker_path}" ]]; then
    printf 'ALUPLAN_A13_IMAGE_EVIDENCE_ROOT_V1\n' > "${marker_path}"
    chmod 0600 "${marker_path}"
fi
[[ -f "${marker_path}" && ! -L "${marker_path}" \
    && "$(cat "${marker_path}")" == 'ALUPLAN_A13_IMAGE_EVIDENCE_ROOT_V1' ]] \
    || fail 'Image evidence marker is invalid.'
run_id="image-${git_sha}"
final_run_dir="${evidence_root}/${run_id}"
run_dir="${evidence_root}/.tmp-${run_id}-$$"
evidence_published=0
final_dir_created=0
run_dir_created=0
smoke_container_id=''
smoke_container_created=0
cleanup_image_evidence() {
    local exit_code=$?
    local cleanup_failed=0
    trap - EXIT INT TERM
    if [[ "${smoke_container_created}" -eq 1 && -n "${smoke_container_id}" ]]; then
        run_control "${docker_bin}" rm -f "${smoke_container_id}" >/dev/null 2>&1 \
            || cleanup_failed=1
    fi
    if [[ "${evidence_published}" -ne 1 && "${run_dir_created}" -eq 1 \
        && -d "${run_dir}" && ! -L "${run_dir}" ]]; then
        rm -rf -- "${run_dir}" || cleanup_failed=1
    fi
    if [[ "${evidence_published}" -ne 1 && "${final_dir_created}" -eq 1 \
        && -d "${final_run_dir}" && ! -L "${final_run_dir}" ]]; then
        rm -rf -- "${final_run_dir}" || cleanup_failed=1
    fi
    if [[ "${exit_code}" -eq 0 && "${cleanup_failed}" -ne 0 ]]; then exit_code=1; fi
    exit "${exit_code}"
}
trap cleanup_image_evidence EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
[[ ! -e "${final_run_dir}" && ! -e "${run_dir}" ]] \
    || fail 'Image evidence for this commit already exists.'
mkdir -- "${run_dir}"
run_dir_created=1
chmod 0700 "${run_dir}"
snapshot_dir="${run_dir}/context"
mkdir -- "${snapshot_dir}"
chmod 0700 "${snapshot_dir}"
snapshot_archive="${run_dir}/context.tar"
run_long "${git_bin}" archive --format=tar --output="${snapshot_archive}" "${git_sha}" \
    || fail 'Unable to create the immutable Git build context.'
[[ -f "${snapshot_archive}" && ! -L "${snapshot_archive}" \
    && "$(file_size "${snapshot_archive}")" -le "${max_build_context_bytes}" ]] \
    || fail 'Immutable Git build context exceeds its size budget.'
run_long "${tar_bin}" -xf "${snapshot_archive}" -C "${snapshot_dir}" \
    || fail 'Unable to extract the immutable Git build context.'
rm -f -- "${snapshot_archive}"
smoke_container_name="aluplan-a13-image-smoke-${git_sha:0:12}"
smoke_run_id="${run_id}-$$"

image_tag="aluplan-backend-a13:${git_sha}"
printf 'Building exact linux/amd64 backend image from %s...\n' "${git_sha}"
run_long "${docker_bin}" build \
    --platform linux/amd64 \
    --build-arg "VCS_REF=${git_sha}" \
    --file "${snapshot_dir}/apps/backend/Dockerfile" \
    --tag "${image_tag}" \
    "${snapshot_dir}"

image_id="$(run_control "${docker_bin}" image inspect --format '{{.Id}}' "${image_tag}")" \
    || fail 'Unable to resolve built image ID.'
[[ "${image_id}" =~ ^sha256:[a-f0-9]{64}$ ]] \
    || fail 'Built image did not resolve to an immutable sha256 ID.'
architecture="$(run_control "${docker_bin}" image inspect --format '{{.Architecture}}' "${image_id}")"
revision="$(run_control "${docker_bin}" image inspect \
    --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}' \
    "${image_id}")"
[[ "${architecture}" == 'amd64' ]] || fail 'Release image architecture is not amd64.'
[[ "${revision}" == "${git_sha}" ]] || fail 'Release image revision label is incorrect.'
pgvector_image_id="$(run_control "${docker_bin}" image inspect --format '{{.Id}}' "${A13_PGVECTOR_IMAGE_REF}")" \
    || fail 'Trusted pgvector image is not present locally.'
pgvector_repo_digests="$(run_control "${docker_bin}" image inspect --format '{{join .RepoDigests "\n"}}' "${A13_PGVECTOR_IMAGE_REF}")"
[[ "${pgvector_image_id}" =~ ^sha256:[a-f0-9]{64}$ \
    && "${pgvector_repo_digests}" == *"${A13_PGVECTOR_IMAGE_REF}"* ]] \
    || fail 'pgvector image is not bound to the approved repository digest.'

smoke_container_id="$(run_control "${docker_bin}" create --name "${smoke_container_name}" \
    --label "com.aluplan.a13.run-id=${smoke_run_id}" \
    --platform linux/amd64 \
    --network none \
    --read-only \
    --memory 512m \
    --cpus 1 \
    --pids-limit 128 \
    --tmpfs /tmp:rw,noexec,nosuid,size=64m \
    --cap-drop ALL \
    --security-opt no-new-privileges \
    --entrypoint /bin/sh \
    "${image_id}" -ec '
      test -f apps/backend/dist/main.js -o -f apps/backend/dist/src/main.js
      test -x apps/backend/scripts/deploy.sh
      test -x apps/backend/scripts/migrate-once.sh
      test -x scripts/backup-db.sh
      test -f scripts/capture-release-fingerprints.mjs
      test -f scripts/verify-schema-parity.mjs
      test -f scripts/verify-rbac-database.mjs
      node ./scripts/verify-migration-integrity.mjs --files-only
      pg_dump --version | grep -E "PostgreSQL\) 17\."
      pg_restore --version | grep -E "PostgreSQL\) 17\."
      aws --version
      sh -n ./apps/backend/scripts/deploy.sh
      sh -n ./apps/backend/scripts/migrate-once.sh
      bash -n ./scripts/backup-db.sh
    ')" || fail 'Unable to create the exact-image smoke container.'
[[ "${smoke_container_id}" =~ ^[a-f0-9]{12,64}$ ]] \
    || fail 'Smoke container did not resolve to an immutable Docker ID.'
smoke_container_created=1
smoke_owner="$(run_control "${docker_bin}" inspect \
    --format '{{ index .Config.Labels "com.aluplan.a13.run-id" }}' \
    "${smoke_container_id}")" || fail 'Unable to verify smoke container ownership.'
[[ "${smoke_owner}" == "${smoke_run_id}" ]] \
    || fail 'Smoke container ownership verification failed.'
run_long "${docker_bin}" start --attach "${smoke_container_id}" \
    || fail 'Exact-image smoke container failed.'
run_control "${docker_bin}" rm -f "${smoke_container_id}" >/dev/null \
    || fail 'Unable to remove the exact-image smoke container.'
remove_error="${run_dir}/container-remove.err"
if run_control "${docker_bin}" inspect "${smoke_container_id}" >/dev/null 2>"${remove_error}"; then
    fail 'Exact-image smoke container still exists after removal.'
fi
grep -Fqx "Error: No such object: ${smoke_container_id}" "${remove_error}" \
    || grep -Fqx "Error response from daemon: No such container: ${smoke_container_id}" "${remove_error}" \
    || fail 'Unable to prove exact-image smoke container removal.'
rm -f -- "${remove_error}"
smoke_container_created=0

[[ "$(git rev-parse HEAD)" == "${git_sha}" && -z "$(git status --short)" ]] \
    || fail 'Checkout changed while producing exact-image evidence.'
dockerfile_sha="$(checksum_file "${snapshot_dir}/apps/backend/Dockerfile")"
lock_sha="$(checksum_file "${snapshot_dir}/pnpm-lock.yaml")"
manifest_sha="$(checksum_file "${snapshot_dir}/packages/database/prisma/migration-checksums.json")"
restore_script_sha="$(checksum_file "${snapshot_dir}/scripts/release-a13-restore-drill.sh")"

cat > "${run_dir}/image.json" <<EOF
{"schemaVersion":1,"status":"complete","productionGo":false,"gitSha":"${git_sha}","imageId":"${image_id}","architecture":"amd64","revision":"${revision}","pgvectorImageRef":"${A13_PGVECTOR_IMAGE_REF}","pgvectorImageId":"${pgvector_image_id}","dockerfileSha256":"${dockerfile_sha}","lockfileSha256":"${lock_sha}","migrationManifestSha256":"${manifest_sha}","restoreScriptSha256":"${restore_script_sha}"}
EOF
chmod 0600 "${run_dir}/image.json"
printf '%s\n' "${image_id}" > "${run_dir}/IMAGE_ID"
chmod 0600 "${run_dir}/IMAGE_ID"
image_json_sha="$(checksum_file "${run_dir}/image.json")"
printf '%s  image.json\n' "${image_json_sha}" > "${run_dir}/image.json.sha256"
chmod 0600 "${run_dir}/image.json.sha256"
printf '{"schemaVersion":1,"status":"complete","productionGo":false,"gitSha":"%s","imageId":"%s","pgvectorImageRef":"%s","pgvectorImageId":"%s","imageJsonSha256":"%s"}\n' \
    "${git_sha}" "${image_id}" "${A13_PGVECTOR_IMAGE_REF}" "${pgvector_image_id}" "${image_json_sha}" > "${run_dir}/READY.json"
chmod 0600 "${run_dir}/READY.json"
rm -rf -- "${snapshot_dir}"
mkdir -- "${final_run_dir}" || fail 'Unable to reserve the final image evidence directory.'
final_dir_created=1
chmod 0700 "${final_run_dir}"
mv -- "${run_dir}/image.json" "${run_dir}/image.json.sha256" "${run_dir}/IMAGE_ID" "${final_run_dir}/"
mv -- "${run_dir}/READY.json" "${final_run_dir}/READY.json"
rmdir -- "${run_dir}"
evidence_published=1

printf 'A.1.3 exact image smoke passed: %s\n' "${image_id}"
printf 'Production remains NO-GO pending restore, R2, queue, and maintenance gates.\n'
