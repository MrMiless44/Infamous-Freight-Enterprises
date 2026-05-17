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
  SUPABASE_DATABASE_URL
  SUPABASE_SERVICE_KEY
  SUPABASE_SERVICE_ROLE_KEY
  SUPABASE_JWT_SECRET
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  OPENAI_API_KEY
  ANTHROPIC_API_KEY
  JWT_SECRET
  GITHUB
  GITHUB_TOKEN
  GH_TOKEN
  FLY
  FLY_API_TOKEN
  NETLIFY_AUTH_TOKEN
  STACKBIT_API_SECRET
  PRIVATE_KEY
  CLIENT_SECRET
  API_SECRET
)

DISALLOWED_KEY_PATTERNS=(
  '(^|_)SERVICE_ROLE(_|$)'
  '(^|_)SERVICE_KEY(_|$)'
  '(^|_)JWT_SECRET$'
  '(^|_)SECRET(_|$)'
  '(^|_)PRIVATE_KEY$'
  '(^|_)ACCESS_TOKEN$'
  '(^|_)AUTH_TOKEN$'
)

DISALLOWED_VALUE_PATTERNS=(
  'postgres(ql)?://'
  'ghp_[A-Za-z0-9_]+'
  'github_pat_[A-Za-z0-9_]+'
  'flyv1[[:alnum:]_:-]+'
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'
)

if ! compgen -G "$WEB_ENV_GLOB" > /dev/null; then
  echo "::error::No frontend env files found matching ${WEB_ENV_GLOB}"
  exit 1
fi

is_allowed_non_vite_key() {
  local key="$1"

  for allowed_key in "${ALLOWED_NON_VITE_KEYS[@]}"; do
    if [[ "$key" == "$allowed_key" ]]; then
      return 0
    fi
  done

  return 1
}

violations=()
while IFS= read -r env_file; do
  [[ -f "$env_file" ]] || continue

  # 1) Explicit deny-list of backend secrets.
  for key in "${DISALLOWED_KEYS[@]}"; do
    if grep -Eiq "^${key}=" "$env_file"; then
      violations+=("${env_file}: disallowed key ${key}")
    fi
  done

  # 2) Disallow public/browser-prefixed direct database URLs.
  if grep -Eq '^(VITE|PUBLIC|NEXT_PUBLIC|REACT_APP)_.*DATABASE_URL=' "$env_file"; then
    violations+=("${env_file}: public/browser-prefixed DATABASE_URL variables are not allowed")
  fi

  # 3) Disallow unsafe values under any frontend-public key.
  for value_pattern in "${DISALLOWED_VALUE_PATTERNS[@]}"; do
    if grep -Eiq "^(VITE|PUBLIC|NEXT_PUBLIC|REACT_APP)_[A-Za-z0-9_]*=.*${value_pattern}" "$env_file"; then
      violations+=("${env_file}: public/browser-prefixed env value matches unsafe secret pattern")
    fi
  done

  # 4) Allow only VITE_* and known build-time keys. Then reject public secret-like names.
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]] || continue

    key="${line%%=*}"
    [[ -z "$key" ]] && continue

    key="$(echo "$key" | xargs)"

    if [[ "$key" == VITE_* ]]; then
      for key_pattern in "${DISALLOWED_KEY_PATTERNS[@]}"; do
        if [[ "$key" =~ $key_pattern ]]; then
          violations+=("${env_file}: public key ${key} matches server-only secret pattern")
        fi
      done
      continue
    fi

    if ! is_allowed_non_vite_key "$key"; then
      violations+=("${env_file}: non-public key ${key} must be VITE_* or explicitly allowlisted")
    fi
  done < "$env_file"
done < <(find apps/web -maxdepth 1 -type f -name '.env*' | sort)

if (( ${#violations[@]} > 0 )); then
  {
    echo "::error::Frontend env safety violations found:"
    for violation in "${violations[@]}"; do
      echo "- ${violation}"
    done
    echo "Only VITE_* public keys (plus approved Sentry build-time keys) are allowed in apps/web/.env* files."
    echo "Use VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for Supabase browser clients."
    echo "Never expose service-role keys, JWT secrets, provider tokens, database URLs, or private keys to frontend env files."
  } >&2
  exit 1
fi

echo "Frontend env safety check passed for apps/web/.env* files."