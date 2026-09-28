#!/usr/bin/env bash

# Legacy compatibility entrypoint. URL-based PG16 drills were unsafe and could
# report false success. The canonical A.1.3 contract accepts only a verified,
# local, private PG17 artifact directory through explicit environment values.

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if [[ "$#" -ne 0 ]]; then
    printf 'ERROR: URL and positional backup inputs are no longer accepted.\n' >&2
    exit 1
fi

exec "${SCRIPT_DIR}/release-a13-restore-drill.sh"
