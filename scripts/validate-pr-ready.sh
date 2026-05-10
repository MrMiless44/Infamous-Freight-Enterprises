#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

: "${SKIP_INSTALL:=0}"
: "${SKIP_AUDIT:=0}"

if [[ "$SKIP_INSTALL" != "1" ]]; then
  pnpm install --frozen-lockfile
fi

pnpm -r build
pnpm --filter @infamous-freight/api lint
pnpm --filter @infamous-freight/api test -- --runInBand
./scripts/smoke-api-health.sh

if [[ "$SKIP_AUDIT" != "1" ]]; then
  pnpm audit --prod
fi

if rg -n "changeme|sk_test_|whsec_|SG\.|replace-this-in-production" .env.example docker-compose.yml; then
  echo "Secret-like placeholders still detected in tracked templates." >&2
  exit 1
fi

echo "PR readiness checks completed."
