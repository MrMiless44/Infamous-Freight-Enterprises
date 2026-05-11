#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${1:-${ROOT_DIR}/.env.production.secrets}"
REPO="${GITHUB_REPOSITORY_OVERRIDE:-Infaemous-Freight/Infamous-freight}"
FLY_APP="${FLY_APP:-infamous-freight-api}"
NETLIFY_SITE_ID="${NETLIFY_SITE_ID:-}"
DRY_RUN="${DRY_RUN:-false}"

cat <<'BANNER'
Infamous Freight production secrets bootstrap

This script reads secrets from a local, gitignored file and writes them to the
platforms that use them:
- GitHub Actions repository secrets
- Fly.io app secrets
- Netlify site environment variables

It does not print secret values. Do not commit the local secrets file.
BANNER

if [[ ! -f "${ENV_FILE}" ]]; then
  cat >&2 <<EOF
ERROR: Secrets file not found: ${ENV_FILE}

Create it from the template:
  cp .env.production.secrets.example .env.production.secrets

Then fill values locally. The real .env.production.secrets file is ignored by git.
EOF
  exit 1
fi

set -a
# shellcheck source=/dev/null
source "${ENV_FILE}"
set +a

mask() {
  local value="${1:-}"
  if [[ -n "${value}" ]]; then
    printf '***'
  else
    printf '<unset>'
  fi
}

need_cmd() {
  local cmd="$1"
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "ERROR: Required CLI missing: ${cmd}" >&2
    return 1
  fi
}

run_or_echo() {
  if [[ "${DRY_RUN}" == "true" ]]; then
    echo "DRY RUN: $*"
  else
    "$@"
  fi
}

set_github_secret() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "${value}" ]]; then
    echo "skip GitHub ${name}: unset"
    return 0
  fi
  echo "set GitHub ${name}: $(mask "${value}")"
  if [[ "${DRY_RUN}" == "true" ]]; then
    echo "DRY RUN: gh secret set ${name} -R ${REPO}"
  else
    gh secret set "${name}" -R "${REPO}" --body "${value}"
  fi
}

set_fly_secret_args=()
add_fly_secret() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "${value}" ]]; then
    echo "skip Fly ${name}: unset"
    return 0
  fi
  echo "queue Fly ${name}: $(mask "${value}")"
  set_fly_secret_args+=("${name}=${value}")
}

set_netlify_env() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "${value}" ]]; then
    echo "skip Netlify ${name}: unset"
    return 0
  fi
  echo "set Netlify ${name}: $(mask "${value}")"
  if [[ -n "${NETLIFY_SITE_ID}" ]]; then
    if [[ "${DRY_RUN}" == "true" ]]; then
      echo "DRY RUN: netlify env:set ${name} [value] --context production --site ${NETLIFY_SITE_ID}"
    else
      netlify env:set "${name}" "${value}" --context production --site "${NETLIFY_SITE_ID}"
    fi
  else
    if [[ "${DRY_RUN}" == "true" ]]; then
      echo "DRY RUN: netlify env:set ${name} [value] --context production"
    else
      netlify env:set "${name}" "${value}" --context production
    fi
  fi
}

validate_not_placeholder() {
  local name="$1"
  local value="${!name:-}"
  if [[ "${value}" == *YOUR_* || "${value}" == *"<"* || "${value}" == *">"* ]]; then
    echo "ERROR: ${name} still looks like a placeholder." >&2
    exit 1
  fi
}

# Validate core non-placeholder values only when present.
for key in \
  FLY_API_TOKEN DATABASE_URL SUPABASE_URL SUPABASE_SERVICE_KEY \
  VITE_SUPABASE_URL VITE_SUPABASE_PUBLISHABLE_KEY \
  STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET VITE_STRIPE_PUBLIC_KEY; do
  if [[ -n "${!key:-}" ]]; then
    validate_not_placeholder "${key}"
  fi
done

if [[ -n "${STRIPE_ACCOUNT_ID:-}" && ! "${STRIPE_ACCOUNT_ID}" =~ ^acct_[A-Za-z0-9]+$ ]]; then
  echo "ERROR: STRIPE_ACCOUNT_ID does not look like a Stripe account ID." >&2
  exit 1
fi

# GitHub Actions secrets
need_cmd gh
set_github_secret FLY_API_TOKEN
set_github_secret DATABASE_URL
set_github_secret STRIPE_ACCOUNT_ID

# Fly.io runtime secrets
need_cmd flyctl
add_fly_secret NODE_ENV
add_fly_secret PORT
add_fly_secret WEB_APP_URL
add_fly_secret CORS_ORIGINS
add_fly_secret CORS_ORIGIN
add_fly_secret DATABASE_URL
add_fly_secret SUPABASE_URL
add_fly_secret SUPABASE_SERVICE_KEY
add_fly_secret SUPABASE_SERVICE_ROLE_KEY
add_fly_secret SUPABASE_JWT_SECRET
add_fly_secret STRIPE_ACCOUNT_ID
add_fly_secret STRIPE_SECRET_KEY
add_fly_secret STRIPE_WEBHOOK_SECRET
add_fly_secret STRIPE_CHECKOUT_SUCCESS_URL
add_fly_secret STRIPE_CHECKOUT_CANCEL_URL
add_fly_secret STRIPE_PORTAL_RETURN_URL
add_fly_secret RATE_LIMIT_ENABLED
add_fly_secret SENTRY_DSN
add_fly_secret REDIS_URL
add_fly_secret REDIS_HOST
add_fly_secret REDIS_PORT
add_fly_secret REDIS_PASSWORD
add_fly_secret REDIS_DB
add_fly_secret DAT_API_KEY
add_fly_secret TRUCKSTOP_API_KEY
add_fly_secret LOADBOARD_API_KEY
add_fly_secret SAMSARA_API_TOKEN
add_fly_secret MOTIVE_CLIENT_ID
add_fly_secret MOTIVE_CLIENT_SECRET
add_fly_secret QBO_CLIENT_ID
add_fly_secret QBO_CLIENT_SECRET
add_fly_secret XERO_CLIENT_ID
add_fly_secret XERO_CLIENT_SECRET
add_fly_secret SENDGRID_API_KEY
add_fly_secret FROM_EMAIL
add_fly_secret RTS_API_KEY
add_fly_secret OTR_API_KEY
add_fly_secret APEX_API_KEY

if [[ "${#set_fly_secret_args[@]}" -gt 0 ]]; then
  echo "apply Fly secrets to app ${FLY_APP}"
  if [[ "${DRY_RUN}" == "true" ]]; then
    echo "DRY RUN: flyctl secrets set [${#set_fly_secret_args[@]} values] --app ${FLY_APP}"
  else
    flyctl secrets set "${set_fly_secret_args[@]}" --app "${FLY_APP}"
  fi
else
  echo "No Fly secrets queued."
fi

# Netlify production environment variables.
need_cmd netlify
set_netlify_env VITE_API_URL
set_netlify_env VITE_SUPABASE_URL
set_netlify_env VITE_SUPABASE_PUBLISHABLE_KEY
set_netlify_env VITE_SUPABASE_ANON_KEY
set_netlify_env VITE_STRIPE_PUBLIC_KEY
set_netlify_env VITE_SENTRY_DSN
set_netlify_env VITE_SENTRY_ENABLED
set_netlify_env SENTRY_AUTH_TOKEN
set_netlify_env SENTRY_ORG
set_netlify_env SENTRY_PROJECT
set_netlify_env SENTRY_SOURCEMAPS
set_netlify_env PUBLIC_SITE_URL
set_netlify_env VITE_SITE_URL
set_netlify_env NEXT_PUBLIC_SITE_URL
set_netlify_env NETLIFY_SECRET_ROTATION_STATUS
set_netlify_env NETLIFY_SECRET_ROTATION_REQUIRED
set_netlify_env NETLIFY_REDEPLOY_REQUIRED_AFTER_SECRET_ROTATION
set_netlify_env NETLIFY_TEAM_MFA_ENFORCEMENT_REQUIRED
set_netlify_env NETLIFY_PREVIEW_ACCESS_REVIEW_REQUIRED

cat <<'DONE'

Secret bootstrap finished.

Required follow-up:
1. Trigger a fresh Fly/API deployment.
2. Trigger a fresh Netlify production deploy.
3. Run: pnpm env:check:strict
4. Run: pnpm run production:preflight
5. Run: pnpm run production:smoke-test
6. Paste evidence into issue #1781 or docs/LAUNCH_EVIDENCE_LOG.md.
DONE
