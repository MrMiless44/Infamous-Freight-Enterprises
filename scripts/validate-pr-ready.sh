#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

pnpm install --frozen-lockfile
pnpm -r build
pnpm --filter @infamous-freight/api lint
pnpm --filter @infamous-freight/api test -- --runInBand
pnpm audit --prod

if rg -n "changeme|sk_test_|whsec_|SG\.|replace-this-in-production" .env.example docker-compose.yml; then
  echo "Secret-like placeholders still detected in tracked templates." >&2
  exit 1
fi

echo "PR readiness checks completed."
