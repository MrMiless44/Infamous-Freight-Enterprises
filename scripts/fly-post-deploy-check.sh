#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${1:-infamous-freight}"
APP_URL="${2:-https://infamous-freight.fly.dev}"
API_URL="${3:-https://api.infamousfreight.com}"

flyctl auth whoami
flyctl status --app "${APP_NAME}"
flyctl checks list --app "${APP_NAME}"

curl -fsS "${APP_URL}/api/health" >/dev/null
curl -fsS "${API_URL}/api/health" >/dev/null

echo "Fly deploy verification passed for ${APP_NAME}."
