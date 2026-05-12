#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${SCRIPT_DIR}"
TOOLS_DIR="${REPO_ROOT}/.tools/bin"
if [[ -d "${TOOLS_DIR}" ]]; then
  export PATH="${TOOLS_DIR}:$PATH"
fi

APP="infamous-freight-api"
IMAGE="ghcr.io/infaemous-freight/infamous-freight-api@sha256:43fd4f0f0eafd34a17ab1b18a6e5b1760e54e56f2bf0491be325e06da105bc00"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "❌ Missing required command: $1" >&2
    exit 1
  }
}

require_cmd flyctl
require_cmd curl

cleanup() {
  unset DATABASE_URL SUPABASE_JWT_SECRET JWT_SECRET
}
trap cleanup EXIT

if [[ ! -f "fly.toml" ]]; then
  echo "❌ fly.toml not found. Run this script from the repository root." >&2
  exit 1
fi

if ! flyctl auth token >/dev/null 2>&1; then
  echo "❌ flyctl is not authenticated. Run: flyctl auth login" >&2
  exit 1
fi

echo "==> Validating Fly config (strict mode)"
flyctl config validate --config fly.toml --app "$APP" --strict

read -r -s -p "DATABASE_URL: " DATABASE_URL
printf '\n'
read -r -s -p "SUPABASE_JWT_SECRET (leave empty to use JWT_SECRET instead): " SUPABASE_JWT_SECRET
printf '\n'

if [[ -z "${DATABASE_URL}" ]]; then
  echo "❌ DATABASE_URL is required." >&2
  exit 1
fi

if [[ -n "${SUPABASE_JWT_SECRET}" ]]; then
  echo "==> Staging DATABASE_URL + SUPABASE_JWT_SECRET (no immediate restart)"
  flyctl secrets set \
    DATABASE_URL="$DATABASE_URL" \
    SUPABASE_JWT_SECRET="$SUPABASE_JWT_SECRET" \
    --app "$APP" \
    --stage
else
  read -r -s -p "JWT_SECRET: " JWT_SECRET
  printf '\n'

  if [[ -z "${JWT_SECRET}" ]]; then
    echo "❌ SUPABASE_JWT_SECRET or JWT_SECRET is required." >&2
    exit 1
  fi

  echo "==> Staging DATABASE_URL + JWT_SECRET (no immediate restart)"
  flyctl secrets set \
    DATABASE_URL="$DATABASE_URL" \
    JWT_SECRET="$JWT_SECRET" \
    --app "$APP" \
    --stage
fi

echo "==> Deploying pinned image"
flyctl deploy \
  --app "$APP" \
  --config fly.toml \
  --image "$IMAGE" \
  --strategy rolling \
  --max-concurrent 1 \
  --wait-timeout 10m \
  --yes

echo "==> Post-deploy checks"
flyctl checks list --app "$APP"
curl -i --max-time 20 https://infamous-freight-api.fly.dev/api/health/live
curl -i --max-time 20 https://infamous-freight-api.fly.dev/api/health
flyctl logs --app "$APP" --no-tail

echo "If Fly cannot pull from GHCR, mirror the image to registry.fly.io/${APP}:<tag> and deploy that image instead."
echo "✅ Deploy flow completed"
