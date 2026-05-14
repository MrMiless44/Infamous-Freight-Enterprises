#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${FLY_APP_NAME:-infamous-freight-api}"
CONFIG_FILE="${FLY_CONFIG_FILE:-fly.toml}"

if ! command -v flyctl >/dev/null 2>&1; then
  cat >&2 <<'EOF'
flyctl is not installed.

Install it with:
  curl -L https://fly.io/install.sh | sh

Then reload your shell or open a new terminal and rerun this script.
EOF
  exit 127
fi

echo "Checking flyctl version..."
flyctl version

echo
echo "Checking Fly API token..."
if [[ -z "${FLY_API_TOKEN:-}" ]]; then
  cat >&2 <<'EOF'
FLY_API_TOKEN is required.
Export a Fly token in the environment before running this script.
EOF
  exit 1
fi

echo
echo "Checking Fly authentication..."
if ! flyctl auth whoami; then
  cat >&2 <<'EOF'
Fly authentication failed with the token provided in FLY_API_TOKEN.
Create or rotate the token in Fly, export it as FLY_API_TOKEN, and rerun this script.
EOF
  exit 1
fi

echo
echo "Validating Fly config: ${CONFIG_FILE}"
flyctl config validate --config "${CONFIG_FILE}"

echo
echo "Checking Fly app status: ${APP_NAME}"
flyctl status -a "${APP_NAME}"

echo
echo "Checking Fly health checks: ${APP_NAME}"
flyctl checks list -a "${APP_NAME}"

echo
echo "Checking Fly secrets required for production deploy..."
secrets_output="$(flyctl secrets list -a "${APP_NAME}")"
printf '%s\n' "${secrets_output}"

missing=0
for secret_name in DATABASE_URL STRIPE_WEBHOOK_SECRET SUPABASE_JWT_SECRET; do
  if printf '%s\n' "${secrets_output}" | awk 'NR>1 {print $1}' | grep -qx "${secret_name}"; then
    echo "OK: ${secret_name}"
  else
    echo "MISSING: ${secret_name}" >&2
    if [[ "${secret_name}" == "DATABASE_URL" ]]; then
      missing=1
    fi
  fi
done

if [[ "${missing}" -ne 0 ]]; then
  echo "Fly verification failed: required production secret(s) are missing." >&2
  exit 1
fi

echo
echo "Fly local verification passed for ${APP_NAME}."
