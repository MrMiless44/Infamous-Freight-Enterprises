#!/usr/bin/env bash
set -uo pipefail

APP="${FLY_APP:-infamous-freight-api}"
FLY_CONFIG="${FLY_CONFIG:-fly.toml}"
LIVE_URL="${LIVE_URL:-https://infamous-freight-api.fly.dev/api/health/live}"
FLY_BIN="$(command -v flyctl || command -v fly || true)"
RUN_CLI_BOOTSTRAP="${RUN_CLI_BOOTSTRAP:-0}"

failures=0

run_check() {
  local label="$1"
  shift

  echo
  echo ">>> ${label}"
  if "$@"; then
    echo "PASS: ${label}"
  else
    echo "FAIL: ${label}" >&2
    failures=$((failures + 1))
  fi
}

if [[ "${RUN_CLI_BOOTSTRAP}" == "1" ]]; then
  run_check "bash scripts/bootstrap-install-all-clis.sh" bash scripts/bootstrap-install-all-clis.sh
fi

run_check "pnpm install --frozen-lockfile" pnpm install --frozen-lockfile
run_check "pnpm run env:check:frontend" pnpm run env:check:frontend
run_check "pnpm run env:check:supabase-client" pnpm run env:check:supabase-client
run_check "pnpm run build" pnpm run build
run_check "pnpm run test" pnpm run test

if [[ -n "${FLY_BIN}" ]]; then
  run_check "${FLY_BIN} config validate --config ${FLY_CONFIG}" "${FLY_BIN}" config validate --config "${FLY_CONFIG}"
  run_check "${FLY_BIN} checks list -a ${APP}" "${FLY_BIN}" checks list -a "${APP}"
else
  echo
  echo "WARN: Fly CLI not found; skipped Fly checks."
fi

run_check "curl -i ${LIVE_URL}" curl -i "${LIVE_URL}"

if [[ "${failures}" -gt 0 ]]; then
  echo
  echo "Completed with ${failures} failed check(s)." >&2
  exit 1
fi

echo
echo "All recommended checks passed."
