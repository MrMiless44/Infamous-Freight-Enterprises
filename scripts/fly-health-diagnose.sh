#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${FLY_APP_NAME:-infamous-freight-api}"
CONFIG_FILE="${FLY_CONFIG_FILE:-fly.toml}"
HEALTH_PATH="${FLY_HEALTH_PATH:-/api/health/live}"
PORT="${PORT:-3000}"

if ! command -v fly >/dev/null 2>&1 && ! command -v flyctl >/dev/null 2>&1; then
  echo "ERROR: flyctl is required. Install it or make sure 'fly' or 'flyctl' is in PATH." >&2
  exit 1
fi

FLY_BIN="fly"
if ! command -v fly >/dev/null 2>&1; then
  FLY_BIN="flyctl"
fi

if [[ -f "$CONFIG_FILE" ]]; then
  echo "==> fly.toml health-related lines"
  grep -nE 'app =|PORT =|internal_port|path =|grace_period|timeout|size =' "$CONFIG_FILE" || true
  echo
fi

echo "==> App status"
"$FLY_BIN" status --app "$APP_NAME" || true

echo
echo "==> Machines"
"$FLY_BIN" machines list --app "$APP_NAME" || true

echo
echo "==> Health checks"
"$FLY_BIN" checks list --app "$APP_NAME" || true

echo
echo "==> Secret names and deployment status only — values are not shown by Fly"
"$FLY_BIN" secrets list --app "$APP_NAME" || true

echo
echo "==> Recent logs: look for 'API startup failed', 'Fallback health server', database errors, missing JWT/auth secrets, or port mismatch"
"$FLY_BIN" logs --app "$APP_NAME" --no-tail || true

echo
echo "==> Internal health probe through fly ssh console"
set +e
"$FLY_BIN" ssh console --app "$APP_NAME" -C "sh -lc 'echo NODE_ENV=\$NODE_ENV PORT=\$PORT HOST=\$HOST AUTH_MODE=\${AUTH_MODE:-}; command -v wget >/dev/null && wget -S -O- http://127.0.0.1:${PORT}${HEALTH_PATH} || command -v curl >/dev/null && curl -i http://127.0.0.1:${PORT}${HEALTH_PATH}'"
ssh_status=$?
set -e

if [[ "$ssh_status" -ne 0 ]]; then
  echo "Internal health probe could not be completed. Check SSH access and machine state."
fi

echo
echo "==> Required likely production secrets for this API"
echo "Confirm these exist in 'fly secrets list' without printing values:"
echo "  DATABASE_URL"
echo "  SUPABASE_URL"
echo "  SUPABASE_ANON_KEY or PUBLIC_SUPABASE_ANON_KEY"
echo "  SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY"
echo "  SUPABASE_JWT_SECRET or JWT_SECRET"
echo "  STRIPE_SECRET_KEY"
echo "  STRIPE_WEBHOOK_SECRET"
echo
echo "If logs show production AUTH_MODE=trusted missing JWT secret, set one of:"
echo "  fly secrets set --app ${APP_NAME} SUPABASE_JWT_SECRET='<your-supabase-jwt-secret>'"
echo "or"
echo "  fly secrets set --app ${APP_NAME} JWT_SECRET='<strong-32-plus-character-secret>'"
echo
echo "Then redeploy current release/secrets:"
echo "  fly secrets deploy --app ${APP_NAME}"
echo
echo "Done."
