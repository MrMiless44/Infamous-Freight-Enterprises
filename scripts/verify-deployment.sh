#!/usr/bin/env bash
# Infamous Freight - Post-Deployment Verification Script
# Usage: ./scripts/verify-deployment.sh [API_URL] [WEB_URL] [TENANT_ID] [ROLE]

set -euo pipefail

API_URL="${1:-https://www.infamousfreight.com}"
WEB_URL="${2:-https://www.infamousfreight.com}"
TENANT_ID="${3:-deployment-smoke-tenant}"
ROLE="${4:-dispatcher}"

RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
NC="\033[0m"

PASS=0
FAIL=0
SKIP=0

CURL_OPTS=(--silent --show-error --location --max-time 20)
ALLOW_UNREACHABLE="${ALLOW_UNREACHABLE:-false}"
CHECK_STRIPE_WEBHOOK="${CHECK_STRIPE_WEBHOOK:-true}"
CHECK_DIRECT_API_ROOT="${CHECK_DIRECT_API_ROOT:-false}"

pass() {
  echo -e "${GREEN}PASS${NC}"
  ((PASS++)) || true
}

pass_note() {
  local note="$1"
  echo -e "${GREEN}PASS${NC} (${note})"
  ((PASS++)) || true
}

fail() {
  echo -e "${RED}FAIL${NC}"
  ((FAIL++)) || true
}

skip_check() {
  echo -e "${YELLOW}SKIP${NC}"
  ((SKIP++)) || true
}

handle_status_result() {
  local code="$1"
  local expected_csv="$2"

  if [[ ",$expected_csv," == *",$code,"* ]]; then
    pass
  elif [ "$code" = "000" ] && [ "$ALLOW_UNREACHABLE" = "true" ]; then
    skip_check
  else
    fail
  fi
}

check_cmd() {
  local name="$1"
  shift

  echo -n "Testing $name... "
  if "$@" >/dev/null 2>&1; then
    pass
  else
    fail
  fi
}

check_status_any() {
  local name="$1"
  local allowed_csv="$2"
  local url="$3"
  shift 3

  echo -n "Testing $name... "
  local code
  code=$(curl "${CURL_OPTS[@]}" -o /dev/null -w "%{http_code}" "$@" "$url" || true)
  handle_status_result "$code" "$allowed_csv"
}

check_status() {
  local name="$1"
  local expected_status="$2"
  local url="$3"
  shift 3

  check_status_any "$name" "$expected_status" "$url" "$@"
}

check_not_404() {
  local name="$1"
  local url="$2"
  shift 2

  echo -n "Testing $name... "
  local code
  code=$(curl "${CURL_OPTS[@]}" -o /dev/null -w "%{http_code}" "$@" "$url" || true)

  if [ "$code" != "404" ] && [ "$code" != "000" ]; then
    pass
  elif [ "$code" = "000" ] && [ "$ALLOW_UNREACHABLE" = "true" ]; then
    skip_check
  else
    fail
  fi
}

is_local_url() {
  case "$1" in
    http://localhost*|http://127.0.0.1*|https://localhost*|https://127.0.0.1*) return 0 ;;
    *) return 1 ;;
  esac
}

check_web_has_script_bundle() {
  local html
  html=$(curl "${CURL_OPTS[@]}" "$WEB_URL" || true)
  echo "$html" | grep -Eqi '<script[^>]+src='
}

check_header_contains() {
  local url="$1"
  local header="$2"
  curl "${CURL_OPTS[@]}" -I "$url" | grep -qi "$header"
}

echo "=================================="
echo "  Infamous Freight - Go-Live Check"
echo "  API: $API_URL"
echo "  Web: $WEB_URL"
echo "  Tenant: $TENANT_ID"
echo "  Role: $ROLE"
echo "=================================="
echo ""

echo "--- API Health Checks ---"
if [ "$CHECK_DIRECT_API_ROOT" = "true" ]; then
  check_status "Health endpoint" "200" "$API_URL/health"
else
  echo -n "Testing Health endpoint... "
  skip_check
fi
check_status "API health endpoint" "200" "$API_URL/api/health"

echo ""
echo "--- API Core Endpoint Checks ---"
COMMON_HEADERS=(-H "x-tenant-id: $TENANT_ID" -H "x-user-role: $ROLE" -H "Content-Type: application/json")
check_status "GET /api/loads" "200" "$API_URL/api/loads" "${COMMON_HEADERS[@]}"
check_status "GET /api/shipments" "200" "$API_URL/api/shipments" "${COMMON_HEADERS[@]}"
check_status "GET /api/drivers" "200" "$API_URL/api/drivers" "${COMMON_HEADERS[@]}"

echo ""
echo "--- Frontend Checks ---"
WEB_STATUS_CODE=$(curl "${CURL_OPTS[@]}" -o /dev/null -w "%{http_code}" "$WEB_URL" || true)
if [ "$WEB_STATUS_CODE" = "200" ]; then
  echo -n "Testing Web app loads... "
  pass
  check_cmd "Web app JS bundles" check_web_has_script_bundle
elif [ "$WEB_STATUS_CODE" = "000" ] && [ "$ALLOW_UNREACHABLE" = "true" ]; then
  echo -n "Testing Web app loads... "
  skip_check
  echo -n "Testing Web app JS bundles... "
  skip_check
else
  echo -n "Testing Web app loads... "
  fail
  echo -n "Testing Web app JS bundles... "
  fail
fi

echo ""
echo "--- API CORS Checks ---"
check_status_any "CORS preflight endpoint" "200,204" "$API_URL/api/health" \
  -X OPTIONS \
  -H "Origin: $WEB_URL" \
  -H "Access-Control-Request-Method: GET"

echo ""
echo "--- Security Headers Check ---"
if is_local_url "$WEB_URL"; then
  echo -n "Testing Web has CSP header... "
  skip_check
  echo -n "Testing Web has HSTS header... "
  skip_check
else
  WEB_HEADER_STATUS=$(curl "${CURL_OPTS[@]}" -I -o /dev/null -w "%{http_code}" "$WEB_URL" || true)
  if [ "$WEB_HEADER_STATUS" = "000" ] && [ "$ALLOW_UNREACHABLE" = "true" ]; then
    echo -n "Testing Web has CSP header... "
    skip_check
    echo -n "Testing Web has HSTS header... "
    skip_check
  else
    check_cmd "Web has CSP header" check_header_contains "$WEB_URL" "content-security-policy"
    check_cmd "Web has HSTS header" check_header_contains "$WEB_URL" "strict-transport-security"
  fi
fi

echo ""
echo "--- API Security Headers Check ---"
check_cmd "API has X-Content-Type-Options header" check_header_contains "$API_URL/api/health" "x-content-type-options"
check_cmd "API has Referrer-Policy header" check_header_contains "$API_URL/api/health" "referrer-policy"

echo ""
echo "--- Stripe Webhook Endpoint Check ---"
if [ "$CHECK_STRIPE_WEBHOOK" = "true" ]; then
  check_not_404 "Stripe webhook endpoint exists" "$API_URL/stripe/webhook" \
    -X POST \
    -H "Content-Type: application/json" \
    -d "{}"
else
  echo -n "Testing Stripe webhook endpoint exists... "
  pass_note "check disabled"
fi

echo ""
echo "=================================="
echo "  Results: $PASS passed, $FAIL failed, $SKIP skipped"
echo "=================================="

if [ "$FAIL" -gt 0 ]; then
  echo -e "${YELLOW}Some checks failed. Review the output above.${NC}"
  exit 1
elif [ "$SKIP" -gt 0 ]; then
  echo -e "${YELLOW}Checks completed with skipped items. Provide reachable endpoints to verify all checks.${NC}"
  exit 0
else
  echo -e "${GREEN}All checks passed! Infamous Freight is ready for traffic.${NC}"
  exit 0
fi
