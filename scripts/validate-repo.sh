#!/usr/bin/env bash
set -euo pipefail

source scripts/workspace-pm.sh

PACKAGE_MANAGER="$(detect_package_manager)"
REPORT_FILE="reports/validation-status.txt"

unset npm_config_http_proxy npm_config_https_proxy || true

mkdir -p reports
printf "Validation Report - %s\n\n" "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" > "$REPORT_FILE"

record_pass() {
  echo "PASS: $1" >> "$REPORT_FILE"
}

record_fail() {
  echo "FAIL: $1" >> "$REPORT_FILE"
}

record_skip() {
  echo "SKIP: $1" >> "$REPORT_FILE"
}

echo "==> Ensuring dependencies are installed"
if should_install_workspace_dependencies "$PACKAGE_MANAGER"; then
  install_workspace_dependencies "$PACKAGE_MANAGER"
fi
record_pass "Dependency installation check"

echo "==> Validating database URL shape"
if bash scripts/check-database-url.sh; then
  record_pass "Database URL validation"
else
  record_fail "Database URL validation"
  exit 1
fi

echo "==> Generating Prisma client"
run_workspace_script "$PACKAGE_MANAGER" prisma:generate
record_pass "Prisma client generation"

echo "==> Running API tests"
run_workspace_script "$PACKAGE_MANAGER" test
record_pass "API tests"

echo "==> Running API coverage"
if run_workspace_script "$PACKAGE_MANAGER" test:coverage; then
  record_pass "API coverage generation"
else
  record_fail "API coverage generation"
  exit 1
fi

echo "==> Running TypeScript lint checks"
run_workspace_script "$PACKAGE_MANAGER" lint
record_pass "TypeScript lint checks"

echo "==> Building API + Web"
run_workspace_script "$PACKAGE_MANAGER" build
record_pass "API and web build"

echo "==> Verifying required CLIs"
if bash scripts/verify-required-clis.sh; then
  record_pass "Required CLIs available"
else
  record_fail "Required CLIs missing"
  exit 1
fi

echo "==> Checking Docker CLI"
if command -v docker >/dev/null 2>&1; then
  docker --version
  if docker buildx version >/dev/null 2>&1; then
    docker buildx version
    record_pass "Docker CLI + Buildx available"
  else
    record_skip "Docker Buildx unavailable"
  fi
else
  record_skip "Docker CLI unavailable"
fi

echo "==> Verifying Dockerfile build"
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  if docker build -f Dockerfile -t infamous-freight-api:validate . >/tmp/docker-build.log 2>&1; then
    record_pass "Dockerfile build check"
  else
    record_fail "Dockerfile build failed; see /tmp/docker-build.log"
    cat /tmp/docker-build.log
    exit 1
  fi
else
  record_skip "Dockerfile build skipped because Docker daemon is unavailable"
fi

echo "==> Starting local services for smoke checks"

if [ ! -f "apps/api/dist/src/server.js" ]; then
  record_fail "API build artifact missing: apps/api/dist/src/server.js"
  exit 1
fi

if [ ! -d "apps/web/dist" ]; then
  record_fail "Web build artifact missing: apps/web/dist"
  exit 1
fi

NODE_ENV=test CORS_ORIGINS=http://127.0.0.1:4173 node apps/api/dist/src/server.js >/tmp/validate-api.log 2>&1 &
API_PID=$!

(cd apps/web/dist && python3 -m http.server 4173 >/tmp/validate-web.log 2>&1) &
WEB_PID=$!

cleanup() {
  kill "$API_PID" "$WEB_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

sleep 3

if ! kill -0 "$API_PID" >/dev/null 2>&1; then
  record_fail "API process failed to start; see /tmp/validate-api.log"
  cat /tmp/validate-api.log
  exit 1
fi

if ! kill -0 "$WEB_PID" >/dev/null 2>&1; then
  record_fail "Web process failed to start; see /tmp/validate-web.log"
  cat /tmp/validate-web.log
  exit 1
fi

echo "==> Running local deployment smoke checks"
ALLOW_UNREACHABLE=false CHECK_STRIPE_WEBHOOK=false bash scripts/verify-deployment.sh \
  "http://127.0.0.1:3000" \
  "http://127.0.0.1:4173"
record_pass "Local deployment smoke checks"

echo "ALL CHECKS PASSED" >> "$REPORT_FILE"
echo "Validation complete."