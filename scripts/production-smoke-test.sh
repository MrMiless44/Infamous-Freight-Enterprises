#!/usr/bin/env bash
set -euo pipefail

CANONICAL_SITE_URL="https://www.infamousfreight.com"
BARE_SITE_URL="https://infamousfreight.com"
FLY_API_URL="https://infamous-freight.fly.dev"

echo "Checking canonical frontend..."
curl --fail --show-error --location --head "${CANONICAL_SITE_URL}"

echo "Checking bare-domain redirect..."
final_url=$(curl --silent --location --head --output /dev/null --write-out '%{url_effective}' "${BARE_SITE_URL}")
if [[ "${final_url}" != "${CANONICAL_SITE_URL}/" ]]; then
  echo "ERROR: Bare domain resolved to ${final_url}, expected ${CANONICAL_SITE_URL}/" >&2
  exit 1
fi

echo "Checking proxied API health..."
curl --fail --show-error --silent "${CANONICAL_SITE_URL}/api/health"
echo

echo "Checking optional direct Fly API health..."
if curl --fail --show-error --silent "${FLY_API_URL}/api/health"; then
  echo
else
  echo "WARNING: Direct Fly API health failed; the launch-critical proxied API health check passed." >&2
fi

echo "Production smoke test passed."
