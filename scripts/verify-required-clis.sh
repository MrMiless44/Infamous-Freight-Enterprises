#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TOOLS_DIR="${REPO_ROOT}/.tools/bin"
missing=0

check_cli() {
  local cli="$1"
  if command -v "$cli" >/dev/null 2>&1 || [[ -x "${TOOLS_DIR}/${cli}" ]]; then
    echo "✅ ${cli} found"
  else
    echo "❌ ${cli} missing (run: pnpm run setup:clis)" >&2
    missing=1
  fi
}

check_cli flyctl
check_cli supabase
check_cli stripe
check_cli gh
check_cli netlify
check_cli docker

if command -v jq >/dev/null 2>&1 || [[ -x "${TOOLS_DIR}/jq" ]]; then
  echo "✅ jq found (recommended)"
else
  echo "⚠️ jq missing (recommended for scripts/install-dev-clis.sh and operational tooling)" >&2
fi

if command -v shellcheck >/dev/null 2>&1 || [[ -x "${TOOLS_DIR}/shellcheck" ]]; then
  echo "✅ shellcheck found (recommended)"
else
  echo "⚠️ shellcheck missing (recommended for shell script linting)" >&2
fi

if [[ "$missing" -ne 0 ]]; then
  exit 1
fi

echo "All required Infamous Freight tools are installed."
