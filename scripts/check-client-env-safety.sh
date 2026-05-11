#!/usr/bin/env bash
set -euo pipefail

WEB_ENV_GLOB='apps/web/.env*'
ALLOWED_NON_VITE_KEYS=(
  SENTRY_AUTH_TOKEN
  SENTRY_ORG
  SENTRY_PROJECT
  SENTRY_DISABLE_UPLOAD
  SENTRY_SOURCEMAPS
)

# Frontend env files must never carry server-side secret keys.
DISALLOWED_KEYS=(
  DATABASE_URL
  DIRECT_URL
  SUPABASE_SERVICE_ROLE_KEY
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  OPENAI_API_KEY
  ANTHROPIC_API_KEY
  JWT_SECRET
)

if ! compgen -G "$WEB_ENV_GLOB" > /dev/null; then
  echo "::error::No frontend env files found matching ${WEB_ENV_GLOB}"
  exit 1
fi

violations=()
while IFS= read -r env_file; do
  [[ -f "$env_file" ]] || continue

  # 1) Explicit deny-list of backend secrets.
  for key in "${DISALLOWED_KEYS[@]}"; do
    if rg -n "^${key}=" "$env_file" >/dev/null; then
      violations+=("${env_file}: disallowed key ${key}")
    fi
  done

  # 2) Allow only VITE_* and known build-time keys.
  while IFS= read -r line; do
    key="${line%%=*}"
    [[ -z "$key" ]] && continue
    [[ "$key" =~ ^[[:space:]]*# ]] && continue
    [[ "$key" =~ ^[[:space:]]*$ ]] && continue

    key="$(echo "$key" | xargs)"

    if [[ "$key" == VITE_* ]]; then
      continue
    fi

    allowed=false
    for allowed_key in "${ALLOWED_NON_VITE_KEYS[@]}"; do
      if [[ "$key" == "$allowed_key" ]]; then
        allowed=true
        break
      fi
    done

    if [[ "$allowed" == false ]]; then
      violations+=("${env_file}: non-public key ${key} must be VITE_* or explicitly allowlisted")
    fi
  done < <(rg "^[A-Za-z_][A-Za-z0-9_]*=" "$env_file" -or '$0')
done < <(find apps/web -maxdepth 1 -type f -name '.env*' | sort)

if (( ${#violations[@]} > 0 )); then
  {
    echo "::error::Frontend env safety violations found:"
    for violation in "${violations[@]}"; do
      echo "- ${violation}"
    done
    echo "Only VITE_* public keys (plus approved Sentry build-time keys) are allowed in apps/web/.env* files."
  } >&2
  exit 1
fi

echo "Frontend env safety check passed for apps/web/.env* files."
