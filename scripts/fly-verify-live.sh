#!/usr/bin/env bash
set -Eeuo pipefail
set +x

APP_NAME="${APP_NAME:-infamous-freight-api}"
CONFIG_FILE="${CONFIG_FILE:-fly.toml}"
LIVE_URL="${LIVE_URL:-https://${APP_NAME}.fly.dev/api/health/live}"

if ! command -v flyctl >/dev/null 2>&1; then
  echo "Installing flyctl..."
  curl -fsSL https://fly.io/install.sh | sh
  export FLYCTL_INSTALL="$HOME/.fly"
  export PATH="$FLYCTL_INSTALL/bin:$PATH"
fi

if ! command -v flyctl >/dev/null 2>&1; then
  echo "ERROR: flyctl still not found. Run:"
  echo 'export FLYCTL_INSTALL="$HOME/.fly"'
  echo 'export PATH="$FLYCTL_INSTALL/bin:$PATH"'
  exit 1
fi

if [ -z "${FLY_API_TOKEN:-}" ]; then
  read -r -s -p "Enter FLY_API_TOKEN: " FLY_API_TOKEN
  echo
  export FLY_API_TOKEN
fi

echo "==> flyctl version"
flyctl version

echo "==> Fly auth"
flyctl auth whoami

echo "==> Validate Fly config"
flyctl config validate --config "$CONFIG_FILE"

echo "==> Fly app status"
flyctl status -a "$APP_NAME"

echo "==> Fly checks"
flyctl checks list -a "$APP_NAME" || {
  echo "WARNING: checks list failed; continuing to HTTP health check."
}

echo "==> HTTP live health"
curl -fsSIL --retry 3 --retry-delay 2 --retry-all-errors "$LIVE_URL"

echo "==> HTTP live health body"
curl -fsSL --retry 3 --retry-delay 2 --retry-all-errors "$LIVE_URL"
echo

echo "PASS: Fly auth, config, app status, and live health check completed."
