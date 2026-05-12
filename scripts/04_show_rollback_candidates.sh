#!/usr/bin/env bash
set -euo pipefail

APP="${FLY_APP:-infamous-freight-api}"
FLY_BIN="$(command -v flyctl || command -v fly || true)"

if [[ -z "${FLY_BIN}" ]]; then
  echo "ERROR: Fly CLI is missing." >&2
  exit 1
fi

echo "Release history with images:"
"${FLY_BIN}" releases --app "${APP}" --image

cat <<'EOF2'

Rollback pattern:

  fly deploy --app infamous-freight-api --image <LAST_GOOD_IMAGE> --strategy rolling --max-concurrent 1 --wait-timeout 10m --yes

Important:
- This rolls back the VM image only.
- It does not roll back database migrations.
EOF2
