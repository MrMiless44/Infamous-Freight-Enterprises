#!/usr/bin/env bash
set -euo pipefail

# Codex environment diagnostics for Infamous Freight.
# Checks whether expected environment variables are present without printing secret values.
# Usage:
#   bash scripts/codex-env-check.sh
#   bash scripts/codex-env-check.sh --strict
#   CODEX_ENV_CHECK_STRICT=1 bash scripts/codex-env-check.sh

strict="${CODEX_ENV_CHECK_STRICT:-0}"
if [[ "${1:-}" == "--strict" ]]; then
  strict="1"
fi

printf '\n== Codex Environment Check ==\n\n'

required_vars=(
  NODE_ENV
  DATABASE_URL
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  SUPABASE_URL
  VITE_SUPABASE_URL
)

optional_vars=(
  PORT
  SITE_URL
  PUBLIC_SITE_URL
  FRONTEND_URL
  WEB_APP_URL
  STRIPE_CHECKOUT_SUCCESS_URL
  STRIPE_CHECKOUT_CANCEL_URL
  STRIPE_PORTAL_RETURN_URL
  STRIPE_ACCOUNT_ID
  STRIPE_PUBLISHABLE_KEY
  VITE_STRIPE_PUBLIC_KEY
  SUPABASE_ANON_KEY
  SUPABASE_JWT_SECRET
  VITE_SUPABASE_DATABASE_URL
  NEXT_PUBLIC_SUPABASE_URL
  REDIS_URL
  REDIS_HOST
  REDIS_PORT
  REDIS_PASSWORD
  REDIS_DB
  JWT_SECRET
  RATE_LIMIT_ENABLED
  API_RATE_LIMIT_ENABLED
  SENTRY_DSN
  VITE_API_URL
  API_PUBLIC_URL
  VITE_SOCKET_URL
  VITE_SENTRY_DSN
  NEXT_PUBLIC_SENTRY_DSN
  VITE_SENTRY_ENABLED
  SENTRY_ORG
  SENTRY_PROJECT
  SENTRY_AUTH_TOKEN
  DAT_API_KEY
  TRUCKSTOP_API_KEY
  LOADBOARD_API_KEY
  SAMSARA_API_TOKEN
  MOTIVE_CLIENT_ID
  MOTIVE_CLIENT_SECRET
  QBO_CLIENT_ID
  QBO_CLIENT_SECRET
  XERO_CLIENT_ID
  XERO_CLIENT_SECRET
  FLY_API_TOKEN
  SENDGRID_API_KEY
  FROM_EMAIL
  RTS_API_KEY
  OTR_API_KEY
  APEX_API_KEY
)

missing_required=0
missing_optional=0
placeholder_values=0

placeholder_patterns=(
  "placeholder"
  "changeme"
  "your-"
  "your_"
  "example"
  "<"
)

placeholder_overrides=(
  "NODE_ENV"
  "PORT"
  "REDIS_PORT"
  "REDIS_DB"
  "RATE_LIMIT_ENABLED"
  "API_RATE_LIMIT_ENABLED"
  "VITE_SENTRY_ENABLED"
  "FROM_EMAIL"
)

contains_placeholder() {
  local value="$1"
  local lowered
  lowered="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')"

  for pattern in "${placeholder_patterns[@]}"; do
    if [[ "$lowered" == *"$pattern"* ]]; then
      return 0
    fi
  done

  return 1
}

is_placeholder_override() {
  local name="$1"
  for allowed_name in "${placeholder_overrides[@]}"; do
    if [[ "$allowed_name" == "$name" ]]; then
      return 0
    fi
  done
  return 1
}

check_var() {
  local name="$1"
  local required="$2"

  if [[ -n "${!name:-}" ]]; then
    echo "✅ ${name} is set"

    if ! is_placeholder_override "$name" && contains_placeholder "${!name}"; then
      echo "❌ ${name} appears to still use a placeholder value"
      placeholder_values=$((placeholder_values + 1))
    fi

    if [[ "$name" == "REDIS_HOST" && "${!name}" == "localhost" ]]; then
      echo "⚠️  REDIS_HOST is localhost. This only works when Redis runs in the same runtime/container."
    fi

    return 0
  fi

  if [[ "${required}" == "true" ]]; then
    echo "❌ ${name} is NOT set"
    missing_required=$((missing_required + 1))
  else
    echo "⚠️  ${name} is not set"
    missing_optional=$((missing_optional + 1))
  fi
}

check_one_of() {
  local required="$1"
  shift
  local names=("$@")
  local found=()

  for name in "${names[@]}"; do
    if [[ -n "${!name:-}" ]]; then
      found+=("${name}")
    fi
  done

  if [[ "${#found[@]}" -gt 0 ]]; then
    echo "✅ one-of [${names[*]}] is set (${found[*]})"
    return 0
  fi

  if [[ "${required}" == "true" ]]; then
    echo "❌ one-of [${names[*]}] is NOT set"
    missing_required=$((missing_required + 1))
  else
    echo "⚠️  one-of [${names[*]}] is not set"
    missing_optional=$((missing_optional + 1))
  fi
}

production_required="false"
if [[ "${strict}" == "1" || "${NODE_ENV:-}" == "production" ]]; then
  production_required="true"
fi

echo "Required / core variables:"
for var in "${required_vars[@]}"; do
  check_var "$var" "true"
done
check_var "WEB_APP_URL" "${production_required}"
check_one_of "${production_required}" CORS_ORIGINS CORS_ORIGIN
check_one_of "true" SUPABASE_SERVICE_KEY SUPABASE_SERVICE_ROLE_KEY
check_one_of "true" VITE_SUPABASE_PUBLISHABLE_KEY VITE_SUPABASE_ANON_KEY

printf '\nOptional integration variables:\n'
for var in "${optional_vars[@]}"; do
  check_var "$var" "false"
done
check_one_of "false" STRIPE_PUBLISHABLE_KEY VITE_STRIPE_PUBLIC_KEY

if [[ -n "${STRIPE_ACCOUNT_ID:-}" && ! "${STRIPE_ACCOUNT_ID}" =~ ^acct_[A-Za-z0-9]+$ ]]; then
  echo "❌ STRIPE_ACCOUNT_ID does not look like a Stripe account ID"
  placeholder_values=$((placeholder_values + 1))
fi

printf '\nSafe environment inventory — names only, no values:\n'
printenv | cut -d= -f1 | sort

printf '\nSummary:\n'
echo "Required missing: ${missing_required}"
echo "Optional missing: ${missing_optional}"
echo "Placeholder-looking values: ${placeholder_values}"

if [[ "${missing_required}" -gt 0 ]]; then
  echo "Required variables are missing. Add them to Codex Environment variables, save the environment, then rerun this check."
  if [[ "${strict}" == "1" ]]; then
    exit 1
  fi
fi

if [[ "${placeholder_values}" -gt 0 ]]; then
  echo "One or more configured values still look like placeholders. Replace them with real production values."
  if [[ "${strict}" == "1" ]]; then
    exit 1
  fi
fi

printf '\nDone. No secret values were printed.\n'
