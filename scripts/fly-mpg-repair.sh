#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${APP_NAME:-infamous-freight-api}"
MPG_CLUSTER_ID="${MPG_CLUSTER_ID:-kyzl60xmlk6opj9g}"
PRIMARY_REGION="${PRIMARY_REGION:-dfw}"
CORS_ORIGINS="${CORS_ORIGINS:-https://www.infamousfreight.com,https://infamousfreight.com}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: required command '$1' is not installed." >&2
    exit 1
  fi
}

require_cmd flyctl
require_cmd curl

if [[ -z "${FLY_API_TOKEN:-}" ]]; then
  echo "Error: FLY_API_TOKEN is not set. Add it to GitHub Secrets or export it locally." >&2
  exit 1
fi

echo "==> Checking Fly authentication"
flyctl auth whoami

echo "==> Attaching Fly Managed Postgres cluster to API app"
flyctl mpg attach "$MPG_CLUSTER_ID" --app "$APP_NAME" || true

echo "==> Setting CORS origins"
flyctl secrets set "CORS_ORIGINS=$CORS_ORIGINS" -a "$APP_NAME"

echo "==> Deploying current Fly config"
flyctl deploy -a "$APP_NAME" --config fly.toml --remote-only

echo "==> Ensuring one warm machine"
flyctl scale count 1 --region "$PRIMARY_REGION" -a "$APP_NAME" --yes || flyctl scale count 1 --region "$PRIMARY_REGION" -a "$APP_NAME"

echo "==> Starting machines if stopped"
flyctl machine list -a "$APP_NAME" --json | node -e "let data=''; process.stdin.on('data', c => data += c); process.stdin.on('end', () => { const rows = JSON.parse(data); for (const m of rows) console.log(m.id); });" | while read -r machine_id; do
  [[ -z "$machine_id" ]] && continue
  flyctl machine start "$machine_id" -a "$APP_NAME" || true
done

echo "==> Waiting for health"
for attempt in {1..30}; do
  if curl --fail --silent --show-error "https://$APP_NAME.fly.dev/api/health" >/tmp/fly-health.json; then
    echo "Health check passed:"
    cat /tmp/fly-health.json
    echo
    exit 0
  fi
  echo "Health not ready yet; retrying ($attempt/30)..."
  sleep 10
done

echo "Health check failed after retries." >&2
flyctl checks list -a "$APP_NAME" || true
flyctl logs -a "$APP_NAME" --no-tail || true
exit 1
