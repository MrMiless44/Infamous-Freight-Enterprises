#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${1:-infamous-freight-api}"
APP_URL="${2:-https://infamous-freight-api.fly.dev}"
API_URL="${3:-https://api.infamousfreight.com}"

if command -v fly >/dev/null 2>&1; then
  :
elif command -v flyctl >/dev/null 2>&1; then
  fly() {
    flyctl "$@"
  }
else
  echo "Error: neither 'flyctl' nor 'fly' is installed." >&2
  exit 1
fi

if [[ -z "${FLY_API_TOKEN:-}" ]]; then
  echo "Error: FLY_API_TOKEN is not set. Export a Fly token before running this script." >&2
  exit 1
fi

fly auth whoami
fly status --app "${APP_NAME}"

curl -fsS "${APP_URL}/api/health" >/dev/null
curl -fsS "${API_URL}/api/health" >/dev/null

echo "Fly preflight checks passed for ${APP_NAME}."
