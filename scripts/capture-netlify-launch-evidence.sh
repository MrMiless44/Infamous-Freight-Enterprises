#!/usr/bin/env bash
set -euo pipefail

WEB_URL="${WEB_URL:-https://www.infamousfreight.com}"
BARE_SITE_URL="${BARE_SITE_URL:-https://infamousfreight.com}"
OUTPUT_DIR="${OUTPUT_DIR:-docs/evidence}"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUTPUT_FILE="${OUTPUT_FILE:-${OUTPUT_DIR}/netlify-launch-evidence-${TIMESTAMP}.md}"

mkdir -p "${OUTPUT_DIR}"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "${tmp_dir}"' EXIT

canonical_headers="${tmp_dir}/canonical.headers"
apex_headers="${tmp_dir}/apex.headers"
api_health_body="${tmp_dir}/api-health.json"
quote_preflight_headers="${tmp_dir}/quote-preflight.headers"
invalid_tracking_body="${tmp_dir}/invalid-tracking.json"

canonical_status="$(
  curl --silent --show-error --location --head \
    --output "${canonical_headers}" \
    --write-out '%{http_code}' \
    "${WEB_URL}"
)"

apex_final_url="$(
  curl --silent --show-error --location --head \
    --output "${apex_headers}" \
    --write-out '%{url_effective}' \
    "${BARE_SITE_URL}"
)"

api_health_status="$(
  curl --silent --show-error --location \
    --output "${api_health_body}" \
    --write-out '%{http_code}' \
    "${WEB_URL%/}/api/health"
)"

api_health_content_type="$(
  curl --silent --show-error --location \
    --output /dev/null \
    --write-out '%{content_type}' \
    "${WEB_URL%/}/api/health"
)"

quote_preflight_status="$(
  curl --silent --show-error --location \
    --request OPTIONS \
    --output "${quote_preflight_headers}" \
    --write-out '%{http_code}' \
    "${WEB_URL%/}/api/public/quote-requests"
)"

invalid_tracking_status="$(
  curl --silent --show-error --location \
    --output "${invalid_tracking_body}" \
    --write-out '%{http_code}' \
    "${WEB_URL%/}/api/public/shipments/invalid-tracking"
)"

header_value() {
  local header_file="$1"
  local header_name="$2"
  awk -v name="${header_name}:" 'BEGIN { IGNORECASE = 1 } $1 == name { sub(/^[^:]+:[[:space:]]*/, ""); value=$0 } END { print value }' "${header_file}" | tr -d '\r'
}

deploy_id="$(header_value "${canonical_headers}" "x-nf-request-id")"
cache_status="$(header_value "${canonical_headers}" "cache-status")"
content_security_policy="$(header_value "${canonical_headers}" "content-security-policy")"
strict_transport_security="$(header_value "${canonical_headers}" "strict-transport-security")"
x_frame_options="$(header_value "${canonical_headers}" "x-frame-options")"

cat > "${OUTPUT_FILE}" <<EOF
# Netlify Launch Evidence

Captured at: ${TIMESTAMP}

## Scope

This evidence captured the public customer path for Infamous Freight after a Netlify deploy. It checked the canonical web host, apex redirect behavior, proxied API health, quote intake preflight, invalid tracking validation, security headers, and the active Netlify request identifier. No production quote or shipment record was created by this check.

## Results

| Check | Result |
| --- | --- |
| Canonical host | HTTP ${canonical_status} for ${WEB_URL} |
| Apex redirect | ${BARE_SITE_URL} resolved to ${apex_final_url} |
| Proxied API health | HTTP ${api_health_status}, content type ${api_health_content_type:-unknown} |
| Public quote preflight | HTTP ${quote_preflight_status} |
| Invalid tracking lookup | HTTP ${invalid_tracking_status} |
| Netlify request identifier | ${deploy_id:-not returned} |
| Cache status | ${cache_status:-not returned} |

## Security Headers

| Header | Value |
| --- | --- |
| Strict-Transport-Security | ${strict_transport_security:-not returned} |
| Content-Security-Policy | ${content_security_policy:-not returned} |
| X-Frame-Options | ${x_frame_options:-not returned} |

## API Health Body

\`\`\`json
$(cat "${api_health_body}")
\`\`\`

## Invalid Tracking Body

\`\`\`json
$(cat "${invalid_tracking_body}")
\`\`\`

## Expected Follow-Up

Operations should review public quote and contact leads in Netlify Forms first, then match API-backed quote records by tracking reference when a reference was returned. If the proxied API health result is not JSON, or if quote preflight does not return 204, the Netlify proxy and Fly API route should be investigated before launch traffic is increased.
EOF

echo "Wrote ${OUTPUT_FILE}"
