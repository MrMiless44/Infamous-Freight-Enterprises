#!/usr/bin/env bash
set -euo pipefail

CANONICAL_SITE_URL="https://www.infamousfreight.com"
API_PUBLIC_URL="https://infamous-freight-api.fly.dev"
FLY_APP="infamous-freight-api"

cat <<'BANNER'
Infamous Freight production canonical environment setup

This script sets non-database production runtime URL settings for the Fly API.
It does not create GitHub Actions secrets, edit Stripe Dashboard settings, edit Supabase/Firebase dashboards, or trigger Netlify UI deploys.
BANNER

if ! command -v flyctl >/dev/null 2>&1; then
  echo "ERROR: flyctl is not installed. Install it first: https://fly.io/docs/flyctl/install/" >&2
  exit 1
fi

if [[ -z "${FLY_API_TOKEN:-}" ]]; then
  echo "ERROR: FLY_API_TOKEN is not set. Export a Fly token before running this script." >&2
  exit 1
fi

if ! flyctl auth whoami >/dev/null 2>&1; then
  echo "ERROR: flyctl authentication failed with FLY_API_TOKEN." >&2
  exit 1
fi

echo "Setting Fly secrets for app: ${FLY_APP}"
flyctl secrets set \
  SITE_URL="${CANONICAL_SITE_URL}" \
  PUBLIC_SITE_URL="${CANONICAL_SITE_URL}" \
  FRONTEND_URL="${CANONICAL_SITE_URL}" \
  CORS_ORIGIN="${CANONICAL_SITE_URL}" \
  API_PUBLIC_URL="${API_PUBLIC_URL}" \
  --app "${FLY_APP}"

echo "Done. Next required manual checks:"
echo "1. GitHub Actions secret FLY_API_TOKEN is set to the rotated Fly deploy token."
echo "2. Stripe Dashboard URLs use ${CANONICAL_SITE_URL}."
echo "3. Supabase/Firebase auth redirect URLs use ${CANONICAL_SITE_URL}."
echo "4. Run GitHub Actions workflow: Deploy Fly API."
echo "5. Redeploy Netlify production site."
echo "6. Run GitHub Actions workflow: Smoke Test."
