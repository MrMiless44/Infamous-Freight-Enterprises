#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-${1:-}}"
API_URL="${API_URL:-${BASE_URL}}"

if [ -z "${BASE_URL}" ]; then
  echo "Usage: BASE_URL=https://example.com API_URL=https://api.example.com bash scripts/smoke-production.sh" >&2
  exit 2
fi

check_url() {
  local label="$1"
  local url="$2"
  echo "Checking ${label}: ${url}"
  curl -fsS --retry 3 --retry-delay 2 --max-time 15 "${url}" >/dev/null
}

check_url "web root" "${BASE_URL}/"
check_url "api liveness" "${API_URL}/api/health/live"
check_url "api readiness" "${API_URL}/api/health/ready"
check_url "api version" "${API_URL}/api/version"

# Route checks intentionally only validate render/reachability. Auth-protected pages
# may redirect or serve a shell, so they are checked with a tolerant status probe.
for path in "/login" "/dashboard" "/billing"; do
  url="${BASE_URL}${path}"
  echo "Checking route reachability: ${url}"
  status="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "${url}" || true)"
  case "${status}" in
    200|204|301|302|307|308|401|403) echo "${path} reachable with status ${status}" ;;
    *) echo "Unexpected status ${status} for ${path}" >&2; exit 1 ;;
  esac
done

echo "Production smoke checks passed."
