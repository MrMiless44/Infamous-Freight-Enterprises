#!/usr/bin/env bash
set -euo pipefail

WEB_URL="${WEB_URL:-https://www.infamousfreight.com}"
BARE_SITE_URL="${BARE_SITE_URL:-https://infamousfreight.com}"
API_URL="${API_URL:-https://infamous-freight.fly.dev}"

echo "Checking canonical frontend..."
curl --fail --show-error --location --head "${WEB_URL}"

echo "Checking bare-domain redirect..."
final_url=$(curl --silent --location --head --output /dev/null --write-out '%{url_effective}' "${BARE_SITE_URL}")
if [[ "${final_url}" != "${WEB_URL%/}/" ]]; then
  echo "ERROR: Bare domain resolved to ${final_url}, expected ${WEB_URL%/}/" >&2
  exit 1
fi

echo "Checking API liveness..."
curl --fail --show-error --silent "${API_URL%/}/health/live"
echo

echo "Checking API readiness..."
curl --fail --show-error --silent "${API_URL%/}/health/ready"
echo

echo "Production smoke test passed."
