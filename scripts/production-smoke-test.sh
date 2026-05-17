#!/usr/bin/env bash
set -euo pipefail

WEB_URL="${WEB_URL:-https://www.infamousfreight.com}"
BARE_SITE_URL="${BARE_SITE_URL:-https://infamousfreight.com}"
API_URL="${API_URL:-https://infamous-freight-api.fly.dev}"
WEB_API_HEALTH_URL="${WEB_API_HEALTH_URL:-${WEB_URL%/}/api/health}"
PUBLIC_QUOTE_PREFLIGHT_URL="${PUBLIC_QUOTE_PREFLIGHT_URL:-${WEB_URL%/}/api/public/quote-requests}"
PUBLIC_INVALID_SHIPMENT_URL="${PUBLIC_INVALID_SHIPMENT_URL:-${WEB_URL%/}/api/public/shipments/invalid-tracking}"

echo "Checking canonical frontend..."
curl --fail --show-error --location --head "${WEB_URL}"

echo "Checking bare-domain redirect..."
final_url=$(curl --silent --location --head --output /dev/null --write-out '%{url_effective}' "${BARE_SITE_URL}")
if [[ "${final_url}" != "${WEB_URL%/}/" ]]; then
  echo "ERROR: Bare domain resolved to ${final_url}, expected ${WEB_URL%/}/" >&2
  exit 1
fi

echo "Checking API liveness..."
curl --fail --show-error --silent "${API_URL%/}/api/health/live"
echo

echo "Checking API readiness..."
curl --fail --show-error --silent "${API_URL%/}/api/health/ready"
echo

echo "Checking proxied web API health..."
api_health_content_type=$(
  curl --fail --show-error --silent --location \
    --output /tmp/infamous-proxied-health.json \
    --write-out '%{content_type}' \
    "${WEB_API_HEALTH_URL}"
)
if [[ "${api_health_content_type}" != application/json* ]]; then
  echo "ERROR: Proxied API health returned ${api_health_content_type:-no content type}, expected JSON." >&2
  exit 1
fi
cat /tmp/infamous-proxied-health.json
echo

echo "Checking public quote preflight..."
quote_preflight_status=$(
  curl --show-error --silent --location \
    --request OPTIONS \
    --output /dev/null \
    --write-out '%{http_code}' \
    "${PUBLIC_QUOTE_PREFLIGHT_URL}"
)
if [[ "${quote_preflight_status}" != "204" ]]; then
  echo "ERROR: Public quote preflight returned HTTP ${quote_preflight_status}, expected 204." >&2
  exit 1
fi

echo "Checking invalid public tracking lookup..."
invalid_tracking_status=$(
  curl --show-error --silent --location \
    --output /tmp/infamous-invalid-tracking.json \
    --write-out '%{http_code}' \
    "${PUBLIC_INVALID_SHIPMENT_URL}"
)
if [[ "${invalid_tracking_status}" != "400" ]]; then
  echo "ERROR: Invalid tracking lookup returned HTTP ${invalid_tracking_status}, expected 400." >&2
  exit 1
fi

if ! grep -q 'invalid_tracking_number' /tmp/infamous-invalid-tracking.json; then
  echo "ERROR: Invalid tracking lookup did not return the expected validation code." >&2
  exit 1
fi

echo "Production smoke test passed."
