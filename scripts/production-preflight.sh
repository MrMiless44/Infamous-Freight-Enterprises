#!/usr/bin/env bash
set -euo pipefail

failures=0

require_command() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "MISSING: $cmd"
    failures=$((failures + 1))
  else
    echo "OK: $cmd"
  fi
}

require_file() {
  local file="$1"
  if [ ! -f "$file" ]; then
    echo "MISSING: $file"
    failures=$((failures + 1))
  else
    echo "OK: $file"
  fi
}

echo "Checking required local tools..."
require_command git
require_command node
require_command npm
require_command curl
require_command flyctl

echo

echo "Checking required repo files..."
require_file package.json
require_file Dockerfile
require_file fly.toml
require_file netlify.toml
require_file .github/workflows/deploy-fly.yml
require_file .github/workflows/smoke-test.yml
require_file docs/PRODUCTION-LAUNCH-RUNBOOK.md
require_file docs/PRODUCTION-SECRETS-CHECKLIST.md
require_file scripts/production-canonical-env.sh
require_file scripts/production-smoke-test.sh
require_file scripts/check-database-url.sh

echo

echo "Checking database URL configuration..."
if bash scripts/check-database-url.sh; then
  echo "OK: database URL validation"
else
  echo "FAILED: database URL validation"
  failures=$((failures + 1))
fi

echo

echo "Checking Fly authentication..."
if command -v flyctl >/dev/null 2>&1; then
  if flyctl auth whoami >/dev/null 2>&1; then
    echo "OK: flyctl authenticated"
  else
    echo "MISSING: flyctl authentication. Run: flyctl auth login"
    failures=$((failures + 1))
  fi
fi

echo

if [ "$failures" -gt 0 ]; then
  echo "Preflight failed with ${failures} missing item(s)."
  exit 1
fi

echo "Production preflight passed."