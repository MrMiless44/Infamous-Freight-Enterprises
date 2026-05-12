#!/usr/bin/env bash
set -euo pipefail

APP="${FLY_APP:-infamous-freight-api}"
BASE_URL="${BASE_URL:-https://infamous-freight-api.fly.dev}"
FLY_BIN="$(command -v flyctl || command -v fly || true)"

if [[ -z "${FLY_BIN}" ]]; then
  echo "ERROR: Fly CLI is missing." >&2
  exit 1
fi

echo "Status:"
"${FLY_BIN}" status --app "${APP}"
echo

echo "Checks:"
"${FLY_BIN}" checks list --app "${APP}" || true
echo

echo "Releases:"
"${FLY_BIN}" releases --app "${APP}" --image || true
echo

echo "Health endpoints:"
for path in /api/health/live /api/health /health/live /health; do
  echo "--- ${BASE_URL}${path}"
  curl -fsS -i --max-time 20 "${BASE_URL}${path}" | sed -n '1,40p' || true
  echo
done

echo "Recent logs:"
"${FLY_BIN}" logs --app "${APP}" --no-tail || true
