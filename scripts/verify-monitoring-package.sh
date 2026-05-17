#!/usr/bin/env bash
set -euo pipefail

missing=()

required_paths=(
  "apps/api/src/integrations/pagerduty.ts"
  "apps/api/src/integrations/sentry.ts"
  "apps/api/src/middleware/monitoring.ts"
  "apps/api/src/middleware/security-headers.ts"
  "apps/api/src/middleware/logging.ts"
  "apps/api/src/monitoring/database.ts"
  "apps/api/src/monitoring/performance.ts"
  "apps/api/src/automation/incident-response.ts"
  ".github/workflows/ci-cd.yml"
  "COMPLETE_DEPLOYMENT_GUIDE.md"
  "APP_TS_INTEGRATION.ts"
  "MISSING_COMPONENTS_ANALYSIS.md"
  "IMPLEMENTATION_CHECKLIST.md"
)

for path in "${required_paths[@]}"; do
  if [[ ! -f "$path" ]]; then
    missing+=("$path")
  fi
done

required_patterns=(
  "PAGERDUTY_ROUTING_KEY"
  "SENTRY_DSN"
)

for pattern in "${required_patterns[@]}"; do
  if ! grep -R --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build -q "$pattern" .; then
    missing+=("repo reference containing $pattern")
  fi
done

if (( ${#missing[@]} > 0 )); then
  {
    echo "::error::Monitoring package verification failed. Missing expected files/references:"
    for item in "${missing[@]}"; do
      echo "- ${item}"
    done
    echo ""
    echo "This check verifies whether the previously claimed PagerDuty/Sentry/monitoring package actually landed in the repo."
    echo "If these modules are intentionally not required, update this script and the related issue with the real production monitoring source of truth."
  } >&2
  exit 1
fi

echo "Monitoring package verification passed. Claimed production monitoring files and env references are present."
