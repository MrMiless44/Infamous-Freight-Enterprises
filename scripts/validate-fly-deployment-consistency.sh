#!/usr/bin/env bash
set -euo pipefail

EXPECTED_APP="infamous-freight-api"
EXPECTED_FLY_URL="https://infamous-freight-api.fly.dev"
EXPECTED_PORT="3000"
CANONICAL_DOC="docs/fly-deployment-runbook.md"
CANONICAL_ANCHOR="canonical-fly-deployment-identity-source-of-truth"

require_contains() {
  local file="$1"
  local pattern="$2"
  local description="$3"
  if ! grep -qE "$pattern" "$file"; then
    echo "::error::${file} is missing expected ${description} (${pattern})."
    exit 1
  fi
}

require_absent_in_dir() {
  local dir="$1"
  local pattern="$2"
  local description="$3"
  if grep -RInE -- "$pattern" "$dir" >/tmp/fly-consistency-matches.txt; then
    echo "::error::Found legacy ${description}:"
    cat /tmp/fly-consistency-matches.txt
    exit 1
  fi
}

# fly.toml source values
require_contains "fly.toml" "^app = '${EXPECTED_APP}'$" "Fly app name"
require_contains "fly.toml" "^  PORT = '${EXPECTED_PORT}'$" "Fly PORT env"
require_contains "fly.toml" "^  internal_port = ${EXPECTED_PORT}$" "Fly internal port"

# Workflows expected references
require_contains ".github/workflows/ci-cd.yml" "--app ${EXPECTED_APP}" "CI deploy app name"
require_contains ".github/workflows/ci-cd.yml" "${EXPECTED_FLY_URL}" "CI direct Fly URL"
require_contains ".github/workflows/deploy-ai.yml" "--app ${EXPECTED_APP}" "Deploy-AI app name"
require_contains ".github/workflows/deploy-ai.yml" "${EXPECTED_FLY_URL}" "Deploy-AI direct Fly URL"
require_contains ".github/workflows/auto-self-healing.yml" "APP_NAME: ${EXPECTED_APP}" "self-healing app name"
require_contains ".github/workflows/auto-self-healing.yml" "${EXPECTED_FLY_URL}" "self-healing direct Fly URL"
require_contains ".github/workflows/uptime-check.yml" "${EXPECTED_FLY_URL}" "uptime-check direct Fly URL"
require_contains ".github/workflows/fly-runtime-repair.yml" "APP_NAME: ${EXPECTED_APP}" "runtime repair app name"
require_contains ".github/workflows/fly-mpg-repair.yml" "APP_NAME: ${EXPECTED_APP}" "MPG repair app name"

# Canonical documentation and references
require_contains "${CANONICAL_DOC}" "^## Canonical Fly deployment identity \\(source of truth\\)$" "canonical section heading"
require_contains "${CANONICAL_DOC}" "`\\$PORT` and `http_service.internal_port` \\(both ${EXPECTED_PORT}\\)" "canonical port description"
require_contains "${CANONICAL_DOC}" "`${EXPECTED_APP}`" "canonical app name"
require_contains "${CANONICAL_DOC}" "`${EXPECTED_FLY_URL}`" "canonical Fly URL"
require_contains ".github/copilot-instructions.md" "${CANONICAL_DOC}#${CANONICAL_ANCHOR}" "copilot-instructions canonical runbook link"
require_contains ".github/workflows/ci-cd.yml" "${CANONICAL_DOC}#${CANONICAL_ANCHOR}" "CI workflow canonical runbook link"
require_contains ".github/workflows/deploy-ai.yml" "${CANONICAL_DOC}#${CANONICAL_ANCHOR}" "Deploy-AI workflow canonical runbook link"

# Prevent legacy values from drifting back into workflows
require_absent_in_dir ".github/workflows" "https://infamous-freight\\.fly\\.dev" "legacy Fly URL"
require_absent_in_dir ".github/workflows" "--app[[:space:]]+infamous-freight(\\b|$)" "legacy Fly app flag"
require_absent_in_dir ".github/workflows" "APP_NAME:[[:space:]]*infamous-freight$" "legacy Fly app env"

echo "Fly deployment consistency check passed."
