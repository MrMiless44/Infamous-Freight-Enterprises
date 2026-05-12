#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-infamous-freight-api}"
PRIMARY_REGION="${PRIMARY_REGION:-dfw}"
POSTGRES_APP_NAME="${POSTGRES_APP_NAME:-}"
MPG_CLUSTER_ID="${MPG_CLUSTER_ID:-}"
CORS_ORIGINS="${CORS_ORIGINS:-https://www.infamousfreight.com,https://infamousfreight.com}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' is not installed." >&2
    exit 1
  fi
}

require_cmd flyctl
require_cmd curl
require_cmd node

if [[ -z "${FLY_API_TOKEN:-}" ]]; then
  echo "Error: FLY_API_TOKEN is not set. Add it to GitHub Secrets or export it locally." >&2
  exit 1
fi

echo "==> Checking Fly authentication"
flyctl auth whoami

echo "==> Current Fly app status"
flyctl status -a "$APP_NAME" || true

echo "==> Current Fly secrets"
flyctl secrets list -a "$APP_NAME" || true

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "==> Staging DATABASE_URL from environment secret"
  flyctl secrets set "DATABASE_URL=$DATABASE_URL" -a "$APP_NAME" --stage || flyctl secrets set "DATABASE_URL=$DATABASE_URL" -a "$APP_NAME"
elif [[ -n "$MPG_CLUSTER_ID" ]]; then
  echo "==> Attaching Fly Managed Postgres cluster '$MPG_CLUSTER_ID' to '$APP_NAME'"
  # mpg attach is idempotent enough for this repair flow; if DATABASE_URL
  # already exists, continue so CORS/scale/restart/health verification still run.
  flyctl mpg attach "$MPG_CLUSTER_ID" --app "$APP_NAME" || true
elif [[ -n "$POSTGRES_APP_NAME" ]]; then
  echo "==> Attaching legacy Postgres app '$POSTGRES_APP_NAME' to '$APP_NAME'"
  # postgres attach is idempotent enough for this repair flow; if DATABASE_URL
  # already exists, continue so CORS/scale/restart/health verification still run.
  flyctl postgres attach "$POSTGRES_APP_NAME" --app "$APP_NAME" --variable-name DATABASE_URL --yes || true
else
  echo "==> DATABASE_URL, MPG_CLUSTER_ID, and POSTGRES_APP_NAME not set; skipping database secret repair."
  echo "    Preferred: add DATABASE_URL as a GitHub Secret, or run with a Fly Managed Postgres cluster:"
  echo "    MPG_CLUSTER_ID=<cluster-id> bash scripts/fly-runtime-repair.sh"
  echo "    Legacy unmanaged Fly Postgres:"
  echo "    POSTGRES_APP_NAME=<postgres-app> bash scripts/fly-runtime-repair.sh"
fi

echo "==> Setting non-sensitive runtime CORS secret"
flyctl secrets set "CORS_ORIGINS=$CORS_ORIGINS" -a "$APP_NAME" --stage || flyctl secrets set "CORS_ORIGINS=$CORS_ORIGINS" -a "$APP_NAME"

echo "==> Deploying app with current config so staged secrets and scale settings apply"
flyctl deploy -a "$APP_NAME" --config fly.toml --remote-only

echo "==> Ensuring one warm machine in $PRIMARY_REGION"
flyctl scale count 1 --region "$PRIMARY_REGION" -a "$APP_NAME" --yes || flyctl scale count 1 --region "$PRIMARY_REGION" -a "$APP_NAME"

echo "==> Starting stopped machines, if any"
mapfile -t machine_ids < <(flyctl machine list -a "$APP_NAME" --json | node -e "let data=''; process.stdin.on('data', c => data += c); process.stdin.on('end', () => { try { for (const m of JSON.parse(data)) console.log(m.id); } catch (_) {} });")
for machine_id in "${machine_ids[@]:-}"; do
  [[ -z "$machine_id" ]] && continue
  flyctl machine start "$machine_id" -a "$APP_NAME" || true
done

echo "==> Waiting for API health"
for attempt in {1..30}; do
  if curl --fail --silent --show-error "https://$APP_NAME.fly.dev/api/health/live" >/tmp/fly-health-live.json \
    && curl --fail --silent --show-error "https://$APP_NAME.fly.dev/api/health/ready" >/tmp/fly-health-ready.json; then
    echo "Health checks passed:"
    cat /tmp/fly-health-live.json
    echo
    cat /tmp/fly-health-ready.json
    echo
    break
  fi

  if [[ "$attempt" == "30" ]]; then
    echo "Health check did not pass after $attempt attempts." >&2
    echo "==> Current checks"
    flyctl checks list -a "$APP_NAME" || true
    echo "==> Recent logs"
    flyctl logs -a "$APP_NAME" --no-tail || true
    exit 1
  fi

  echo "Health not ready yet; retrying ($attempt/30)..."
  sleep 10
done

echo "==> Final secrets"
flyctl secrets list -a "$APP_NAME" || true

echo "==> Final checks"
flyctl status -a "$APP_NAME" || true
flyctl checks list -a "$APP_NAME" || true
