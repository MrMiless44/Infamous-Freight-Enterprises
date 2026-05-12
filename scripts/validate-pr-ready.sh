#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

pnpm install --frozen-lockfile
pnpm -r build
pnpm --filter @infamous-freight/api lint
pnpm --filter @infamous-freight/api test -- --runInBand
pnpm audit --prod

PLACEHOLDER_PATTERN="changeme|sk_test_|whsec_|SG\.|replace-this-in-production"
if command -v rg >/dev/null 2>&1; then
  if rg -n "${PLACEHOLDER_PATTERN}" .env.example docker-compose.yml; then
    echo "Secret-like placeholders still detected in tracked templates." >&2
    exit 1
  fi
else
  echo "rg not found; falling back to grep for placeholder scan." >&2
  if grep -En "${PLACEHOLDER_PATTERN}" .env.example docker-compose.yml; then
    echo "Secret-like placeholders still detected in tracked templates." >&2
    exit 1
  fi
fi

echo "PR readiness checks completed."
