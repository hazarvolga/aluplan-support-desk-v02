#!/usr/bin/env bash

# Aluplan Support Desk - fail-closed PostgreSQL backup artifact generator.
# A.1.2 creates a verified PG17 custom archive and an atomic completion
# manifest. A real restore into disposable PostgreSQL remains the A.1.3 gate.

set -Eeuo pipefail
set +x
umask 077

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
PATH="${BACKUP_TOOL_PATH:-/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin}"
export PATH

fail() {
    printf 'ERROR: %s\n' "$1" >&2
    exit 1
}

if [[ "${ALLOW_DATABASE_BACKUP:-}" != '1' ]]; then
    fail 'Set ALLOW_DATABASE_BACKUP=1 to authorize this backup invocation.'
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
    fail 'DATABASE_URL is required and must be supplied through the process environment.'
fi

# The application uses Cloudflare R2's STORAGE_* names while the AWS CLI
# uses its conventional AWS_* names. Only dedicated backup variables may be
# mapped; ordinary application-storage credentials and buckets must never be
# reused for database backups. Values remain process-local and are never
# printed or persisted by this script.
export AWS_S3_BACKUP_BUCKET="${AWS_S3_BACKUP_BUCKET:-${R2_BACKUP_BUCKET:-${STORAGE_BACKUP_BUCKET:-}}}"
export AWS_S3_ENDPOINT_URL="${AWS_S3_ENDPOINT_URL:-${R2_BACKUP_ENDPOINT:-${STORAGE_BACKUP_ENDPOINT:-}}}"
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-${R2_BACKUP_ACCESS_KEY_ID:-${STORAGE_BACKUP_ACCESS_KEY:-}}}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-${R2_BACKUP_SECRET_ACCESS_KEY:-${STORAGE_BACKUP_SECRET_KEY:-}}}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-${R2_BACKUP_REGION:-${STORAGE_BACKUP_REGION:-auto}}}"
export AWS_EC2_METADATA_DISABLED='true'

external_mode=1
if [[ "${ALLOW_LOCAL_ONLY_BACKUP:-}" == '1' ]]; then
    external_mode=0
fi

if [[ "${external_mode}" -eq 1 && -z "${AWS_S3_BACKUP_BUCKET:-}" ]]; then
    fail 'External S3 backup is required. Set AWS_S3_BACKUP_BUCKET or explicitly acknowledge local-only mode.'
fi
if [[ "${external_mode}" -eq 0 && -n "${AWS_S3_BACKUP_BUCKET:-}" ]]; then
    fail 'Local-only mode and AWS_S3_BACKUP_BUCKET cannot be enabled together.'
fi

aws_bin=''
aws_endpoint_url=''
s3_prefix=''
if [[ "${external_mode}" -eq 1 ]]; then
    [[ "${AWS_S3_BACKUP_BUCKET}" =~ ^[A-Za-z0-9][A-Za-z0-9.-]*$ ]] \
        || fail 'AWS_S3_BACKUP_BUCKET has an invalid bucket name.'
    s3_prefix="${AWS_S3_BACKUP_PREFIX:-db-backups}"
    s3_prefix="${s3_prefix#/}"
    s3_prefix="${s3_prefix%/}"
    [[ -n "${s3_prefix}" && "${s3_prefix}" =~ ^[A-Za-z0-9][A-Za-z0-9._/-]*$ \
        && "${s3_prefix}" != *'..'* && "${s3_prefix}" != *'//'* ]] \
        || fail 'AWS_S3_BACKUP_PREFIX has an invalid object prefix.'

    aws_endpoint_url="${AWS_S3_ENDPOINT_URL:-}"
    if [[ -n "${aws_endpoint_url}" ]]; then
        if [[ "${aws_endpoint_url}" =~ ^https://[A-Za-z0-9.-]+(:[0-9]+)?(/[^?#]*)?$ ]]; then
            :
        elif [[ "${ALLOW_INSECURE_LOCAL_S3_ENDPOINT:-}" == '1' \
            && "${aws_endpoint_url}" =~ ^http://(127\.0\.0\.1|localhost)(:[0-9]+)?(/[^?#]*)?$ ]]; then
            :
        else
            fail 'AWS_S3_ENDPOINT_URL must be HTTPS without userinfo, query, or fragment.'
        fi
    fi
    unset AWS_ENDPOINT_URL AWS_ENDPOINT_URL_S3
    export AWS_IGNORE_CONFIGURED_ENDPOINT_URLS='true'
fi

resolve_tool() {
    local command_name="$1"
    local resolved

    resolved="$(command -v "${command_name}" 2>/dev/null || true)"
    [[ -n "${resolved}" && "${resolved}" == /* ]] \
        || fail "Required command is unavailable on the trusted tool path: ${command_name}"
    printf '%s' "${resolved}"
}

pg_dump_bin="$(resolve_tool pg_dump)"
pg_restore_bin="$(resolve_tool pg_restore)"
if [[ "${external_mode}" -eq 1 ]]; then
    aws_bin="$(resolve_tool aws)"
fi

checksum_bin=''
checksum_kind=''
if command -v sha256sum >/dev/null 2>&1; then
    checksum_bin="$(resolve_tool sha256sum)"
    checksum_kind='sha256sum'
elif command -v shasum >/dev/null 2>&1; then
    checksum_bin="$(resolve_tool shasum)"
    checksum_kind='shasum'
else
    fail 'A SHA-256 utility is required (sha256sum or shasum).'
fi

extract_client_major() {
    local executable="$1"
    local display_name="$2"
    local version_output

    version_output="$("${executable}" --version)" \
        || fail "Unable to determine ${display_name} version."
    if [[ ! "${version_output}" =~ ([0-9]+)(\.[0-9]+)? ]]; then
        fail "Unable to parse ${display_name} version."
    fi
    printf '%s' "${BASH_REMATCH[1]}"
}

expected_pg_major='17'
pg_dump_major="$(extract_client_major "${pg_dump_bin}" pg_dump)"
pg_restore_major="$(extract_client_major "${pg_restore_bin}" pg_restore)"
if [[ "${pg_dump_major}" != "${expected_pg_major}" \
    || "${pg_restore_major}" != "${expected_pg_major}" ]]; then
    fail "pg_dump and pg_restore must both use PostgreSQL ${expected_pg_major} clients."
fi

reject_symlink_components() {
    local target_path="$1"
    local remaining="${target_path#/}"
    local current_path=''
    local component
    local components=()

    IFS='/' read -r -a components <<< "${remaining}"
    for component in "${components[@]}"; do
        [[ -n "${component}" ]] || continue
        current_path="${current_path}/${component}"
        [[ ! -L "${current_path}" ]] \
            || fail 'Backup paths must not contain symbolic-link components.'
    done
}

current_uid="$(id -u)"
stat_numeric_attribute() {
    local bsd_format="$1" gnu_format="$2" target="$3" value
    if value="$(stat -f "${bsd_format}" "${target}" 2>/dev/null)" \
        && [[ "${value}" =~ ^[0-9]+$ ]]; then
        printf '%s' "${value}"
    elif value="$(stat -c "${gnu_format}" "${target}" 2>/dev/null)" \
        && [[ "${value}" =~ ^[0-9]+$ ]]; then
        printf '%s' "${value}"
    else
        return 1
    fi
}
directory_uid() {
    stat_numeric_attribute '%u' '%u' "$1"
}
directory_mode() {
    stat_numeric_attribute '%Lp' '%a' "$1"
}

default_backup_root="${REPO_ROOT}/.private-data/backups"
allowed_root="${BACKUP_ALLOWED_ROOT:-${default_backup_root}}"
backup_dir="${BACKUP_DIR:-${allowed_root}}"
for path_value in "${backup_dir}" "${allowed_root}"; do
    [[ "${path_value}" == /* && "${path_value}" != '/' && "${path_value}" != *'/../'* \
        && "${path_value}" != */.. && "${path_value}" != *'//' && "${path_value}" != */. ]] \
        || fail 'Backup paths must be absolute, narrow, and traversal-free.'
done
[[ "${backup_dir}" == "${allowed_root}" ]] \
    || fail 'BACKUP_DIR must equal the dedicated BACKUP_ALLOWED_ROOT.'
[[ ! -L "${allowed_root}" ]] || fail 'Backup roots must not be symbolic links.'
reject_symlink_components "${allowed_root}"

root_marker_name='.aluplan-backup-root'
root_marker_value='ALUPLAN_BACKUP_ROOT_V1'
if [[ "${allowed_root}" == "${default_backup_root}" ]]; then
    if [[ ! -e "${allowed_root}" ]]; then
        mkdir -p -- "${allowed_root}"
        chmod 0700 "${allowed_root}"
        printf '%s\n' "${root_marker_value}" > "${allowed_root}/${root_marker_name}"
        chmod 0600 "${allowed_root}/${root_marker_name}"
    fi
else
    [[ -d "${allowed_root}" ]] \
        || fail 'Custom BACKUP_ALLOWED_ROOT must be a pre-provisioned directory.'
fi
reject_symlink_components "${allowed_root}"
canonical_allowed_root="$(cd -P -- "${allowed_root}" && pwd)"
case "${canonical_allowed_root}" in
    /|/bin|/boot|/dev|/etc|/home|/lib|/lib64|/opt|/private|/root|/run|/sbin|/tmp|/usr|/Users|/var|"${REPO_ROOT}")
        fail 'BACKUP_ALLOWED_ROOT resolves to a broad system or repository directory.'
        ;;
esac
[[ "$(directory_uid "${canonical_allowed_root}")" == "${current_uid}" \
    && "$(directory_mode "${canonical_allowed_root}")" == '700' ]] \
    || fail 'BACKUP_ALLOWED_ROOT must be operator-owned with mode 0700.'
[[ -f "${canonical_allowed_root}/${root_marker_name}" \
    && ! -L "${canonical_allowed_root}/${root_marker_name}" \
    && "$(cat "${canonical_allowed_root}/${root_marker_name}")" == "${root_marker_value}" ]] \
    || fail 'BACKUP_ALLOWED_ROOT is missing its private root marker.'
canonical_backup_dir="${canonical_allowed_root}"

lock_dir="${canonical_backup_dir}/.backup.lock"
run_dir=''
final_dir=''
final_dir_created=0
dump_path=''
checksum_path=''
ready_path=''
lock_acquired=0
local_published=0
remote_committed=0
remote_cleanup_enabled=0
remote_dump_created=0
remote_checksum_created=0
remote_ready_created=0
remote_dump_uri=''
remote_checksum_uri=''
remote_ready_uri=''

aws_exec() {
    if [[ -n "${aws_endpoint_url}" ]]; then
        "${aws_bin}" --endpoint-url "${aws_endpoint_url}" "$@"
    else
        "${aws_bin}" "$@"
    fi
}

cleanup_remote() {
    [[ "${remote_cleanup_enabled}" -eq 1 && "${remote_committed}" -ne 1 ]] || return 0
    [[ "${remote_ready_created}" -ne 1 ]] \
        || aws_exec s3 rm "${remote_ready_uri}" >/dev/null 2>&1 || true
    [[ "${remote_checksum_created}" -ne 1 ]] \
        || aws_exec s3 rm "${remote_checksum_uri}" >/dev/null 2>&1 || true
    [[ "${remote_dump_created}" -ne 1 ]] \
        || aws_exec s3 rm "${remote_dump_uri}" >/dev/null 2>&1 || true
}

put_remote_object_once() {
    local source_path="$1"
    local object_key="$2"
    local metadata="${3:-}"
    local arguments=(
        s3api put-object
        --bucket "${AWS_S3_BACKUP_BUCKET}"
        --key "${object_key}"
        --body "${source_path}"
        --if-none-match '*'
    )

    if [[ -n "${metadata}" ]]; then
        arguments+=(--metadata "${metadata}")
    fi
    aws_exec "${arguments[@]}" >/dev/null
}

cleanup() {
    local exit_code=$?
    trap - EXIT INT TERM
    cleanup_remote
    if [[ "${local_published}" -ne 1 ]]; then
        [[ "${final_dir_created}" -ne 1 ]] || rm -rf -- "${final_dir}"
        [[ -z "${run_dir}" ]] || rm -rf -- "${run_dir}"
    fi
    if [[ "${lock_acquired}" -eq 1 ]]; then
        rmdir -- "${lock_dir}" >/dev/null 2>&1 || true
    fi
    exit "${exit_code}"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

mkdir -- "${lock_dir}" 2>/dev/null \
    || fail 'Another backup invocation is already active for this directory.'
lock_acquired=1

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
run_dir="$(mktemp -d "${canonical_backup_dir}/.backup.partial.XXXXXX")"
chmod 0700 "${run_dir}"
random_suffix="${run_dir##*.backup.partial.}"
run_id="aluplan_backup_${timestamp}_${random_suffix}"
final_dir="${canonical_backup_dir}/${run_id}"
dump_path="${run_dir}/database.dump"
checksum_path="${run_dir}/database.dump.sha256"
ready_path="${run_dir}/READY.json"

printf 'Creating a PostgreSQL custom-format backup artifact...\n'
if ! PGDATABASE="${DATABASE_URL}" "${pg_dump_bin}" \
    --format=custom \
    --no-owner \
    --no-privileges \
    --file="${dump_path}"; then
    unset DATABASE_URL PGDATABASE
    fail 'pg_dump failed.'
fi
unset DATABASE_URL PGDATABASE

[[ -s "${dump_path}" ]] || fail 'pg_dump produced an empty archive.'
"${pg_restore_bin}" --list "${dump_path}" >/dev/null \
    || fail 'pg_restore could not read the archive catalog.'

checksum_output=''
if [[ "${checksum_kind}" == 'sha256sum' ]]; then
    checksum_output="$("${checksum_bin}" "${dump_path}")" \
        || fail 'SHA-256 generation failed.'
else
    checksum_output="$("${checksum_bin}" -a 256 "${dump_path}")" \
        || fail 'SHA-256 generation failed.'
fi
checksum_hash="${checksum_output%%[[:space:]]*}"
[[ "${checksum_hash}" =~ ^[A-Fa-f0-9]{64}$ ]] \
    || fail 'SHA-256 utility returned an invalid digest.'
checksum_hash="$(printf '%s' "${checksum_hash}" | tr 'A-F' 'a-f')"
printf '%s  database.dump\n' "${checksum_hash}" > "${checksum_path}"
size_bytes="$(wc -c < "${dump_path}" | tr -d '[:space:]')"
[[ "${size_bytes}" =~ ^[0-9]+$ && "${size_bytes}" -gt 0 ]] \
    || fail 'Unable to determine backup archive size.'

cat > "${ready_path}" <<EOF
{"schemaVersion":1,"status":"complete","runId":"${run_id}","createdAt":"${timestamp}","mode":"$([[ "${external_mode}" -eq 1 ]] && printf 'external' || printf 'local-only')","archive":"database.dump","checksum":"database.dump.sha256","sha256":"${checksum_hash}","sizeBytes":${size_bytes},"format":"custom","postgresClientMajor":17}
EOF
chmod 0600 "${dump_path}" "${checksum_path}" "${ready_path}"

mkdir -- "${final_dir}" 2>/dev/null \
    || fail 'Refusing to overwrite an existing backup artifact directory.'
final_dir_created=1
chmod 0700 "${final_dir}"

if [[ "${external_mode}" -eq 1 ]]; then
    remote_key_base="${s3_prefix}/${run_id}"
    remote_base="s3://${AWS_S3_BACKUP_BUCKET}/${remote_key_base}"
    remote_dump_uri="${remote_base}/database.dump"
    remote_checksum_uri="${remote_base}/database.dump.sha256"
    remote_ready_uri="${remote_base}/READY.json"
    remote_cleanup_enabled=1

    put_remote_object_once \
        "${dump_path}" \
        "${remote_key_base}/database.dump" \
        "sha256=${checksum_hash},format=custom,postgres-major=17" \
        || fail 'External storage upload failed for the backup archive.'
    remote_dump_created=1
    put_remote_object_once \
        "${checksum_path}" \
        "${remote_key_base}/database.dump.sha256" \
        || fail 'External storage upload failed for the checksum.'
    remote_checksum_created=1

    remote_head="$(aws_exec s3api head-object \
        --bucket "${AWS_S3_BACKUP_BUCKET}" \
        --key "${s3_prefix}/${run_id}/database.dump" \
        --query '[ContentLength,Metadata.sha256]' --output text)" \
        || fail 'External backup archive HEAD verification failed.'
    read -r remote_size remote_hash <<< "${remote_head}"
    remote_size="$(printf '%s' "${remote_size}" | tr -d '[:space:]')"
    remote_hash="$(printf '%s' "${remote_hash}" | tr 'A-F' 'a-f' | tr -d '[:space:]')"
    [[ "${remote_size}" == "${size_bytes}" ]] \
        || fail 'External backup archive size did not match.'
    [[ "${remote_hash}" == "${checksum_hash}" ]] \
        || fail 'External backup archive checksum metadata did not match.'
    aws_exec s3api head-object \
        --bucket "${AWS_S3_BACKUP_BUCKET}" \
        --key "${s3_prefix}/${run_id}/database.dump.sha256" >/dev/null \
        || fail 'External checksum HEAD verification failed.'

    put_remote_object_once \
        "${ready_path}" \
        "${remote_key_base}/READY.json" \
        || fail 'External READY manifest upload failed.'
    remote_ready_created=1
    aws_exec s3api head-object \
        --bucket "${AWS_S3_BACKUP_BUCKET}" \
        --key "${s3_prefix}/${run_id}/READY.json" >/dev/null \
        || fail 'External READY manifest verification failed.'
    remote_committed=1
fi

mv -- "${dump_path}" "${final_dir}/database.dump"
mv -- "${checksum_path}" "${final_dir}/database.dump.sha256"
mv -- "${ready_path}" "${final_dir}/READY.json"
rmdir -- "${run_dir}"
run_dir=''
local_published=1
final_dir_created=0

printf 'Backup artifact ready: %s\n' "${final_dir}"
if [[ "${external_mode}" -eq 1 ]]; then
    printf 'External backup committed with READY manifest.\n'
else
    printf 'Local-only backup completed; this is not production release evidence.\n'
fi
