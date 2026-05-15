#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://www.infamousfreight.com}"
API_URL="${API_URL:-https://infamous-freight-api.fly.dev}"
TENANT_ID="${TENANT_ID:-}"
USER_ROLE="${USER_ROLE:-owner}"
OUT_FILE="${OUT_FILE:-kpi-snapshot.json}"

request_json() {
  local url="$1"
  local extra_args=()

  if [ -n "${TENANT_ID}" ]; then
    extra_args+=(
      -H "x-tenant-id: ${TENANT_ID}"
      -H "x-user-role: ${USER_ROLE}"
      -H "x-subscription-status: active"
    )
  fi

  curl -fsS --max-time 20 "${extra_args[@]}" "${url}" || echo '{}'
}

api_ready="$(request_json "${API_URL}/api/health/ready")"
api_version="$(request_json "${API_URL}/api/version")"
loads="{}"
drivers="{}"
shipments="{}"
ai_usage="{}"

if [ -n "${TENANT_ID}" ]; then
  loads="$(request_json "${API_URL}/api/loads")"
  drivers="$(request_json "${API_URL}/api/drivers")"
  shipments="$(request_json "${API_URL}/api/shipments")"
  ai_usage="$(request_json "${API_URL}/api/ai-usage/summary")"
fi

cat > "${OUT_FILE}" <<JSON
{
  "generatedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "baseUrl": "${BASE_URL}",
  "apiUrl": "${API_URL}",
  "tenantScoped": $([ -n "${TENANT_ID}" ] && echo true || echo false),
  "apiReady": ${api_ready},
  "apiVersion": ${api_version},
  "loads": ${loads},
  "drivers": ${drivers},
  "shipments": ${shipments},
  "aiUsage": ${ai_usage}
}
JSON

echo "KPI snapshot written to ${OUT_FILE}"
