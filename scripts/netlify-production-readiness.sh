#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

WEB_HEALTH_URL="${WEB_HEALTH_URL:-https://www.infamousfreight.com/api/health}"
SITE_URL="${SITE_URL:-https://www.infamousfreight.com}"
API_HEALTH_URL="${API_HEALTH_URL:-https://api.infamousfreight.com/health}"
API_HEALTH_FALLBACK_URL="${API_HEALTH_FALLBACK_URL:-https://api.infamousfreight.com/api/health}"

run_step() {
  local title="$1"
  shift
  echo ""
  echo "==> ${title}"
  "$@"
}

curl_head() {
  curl --fail --show-error --location --head --retry 5 --retry-delay 10 --retry-connrefused --max-time 30 "$@"
}

curl_get() {
  curl --fail --show-error --silent --location --retry 5 --retry-delay 10 --retry-connrefused --max-time 30 "$@"
}

if [[ "${ALLOW_LOCKFILE_UPDATE:-false}" == "true" ]]; then
  run_step "Install workspace deps (lockfile updates allowed)" pnpm install --no-frozen-lockfile
else
  run_step "Install workspace deps (frozen lockfile)" pnpm install --frozen-lockfile
fi

run_step "Prisma client generation" pnpm prisma:generate
run_step "Type/lint checks" pnpm lint
run_step "API tests (runInBand)" pnpm -w test --runInBand
run_step "Strict environment checks" pnpm env:check:strict
run_step "Web production build" pnpm -C apps/web run build
run_step "Docker build validation" pnpm docker:build

run_step "Site HEAD check" curl_head "$SITE_URL"
run_step "Canonical API health check" curl_get "$WEB_HEALTH_URL"

echo ""
echo "==> Optional direct API domain checks"
if curl_get "$API_HEALTH_URL"; then
  echo "Direct API health URL succeeded: $API_HEALTH_URL"
elif curl_get "$API_HEALTH_FALLBACK_URL"; then
  echo "Direct API fallback health URL succeeded: $API_HEALTH_FALLBACK_URL"
else
  echo "WARNING: Direct API domain health checks failed (both endpoints)." >&2
  echo "Keep smoke checks pointed at ${WEB_HEALTH_URL} and verify DNS/origin routing for api.infamousfreight.com." >&2
fi

echo ""
echo "==> Optional Netlify production deploy trigger"
if [[ -n "${NETLIFY_AUTH_TOKEN:-}" && -n "${NETLIFY_SITE_ID:-}" ]]; then
  echo "Triggering deploy for site ${NETLIFY_SITE_ID} via Netlify CLI..."
  pnpm dlx netlify-cli deploy --prod --dir apps/web/dist --functions netlify/functions --site "$NETLIFY_SITE_ID"
else
  echo "Skipped: set NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID to trigger deploy from CLI."
fi
