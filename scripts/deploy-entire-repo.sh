#!/usr/bin/env bash
set -euo pipefail

export PATH="$HOME/.fly/bin:$PATH"

echo "==> Running full repository validation before deploy"
bash scripts/validate-repo.sh

echo "==> Checking flyctl availability"
if ! command -v flyctl >/dev/null 2>&1; then
  echo "flyctl is not installed. Install with: curl -L https://fly.io/install.sh | sh"
  exit 1
fi

echo "==> Checking Fly authentication"
if [[ -z "${FLY_API_TOKEN:-}" ]]; then
  echo "No Fly API token available. Export FLY_API_TOKEN before running this script."
  exit 1
fi

if ! flyctl auth whoami >/dev/null 2>&1; then
  echo "Fly authentication failed with FLY_API_TOKEN."
  exit 1
fi

echo "==> Deploying app from fly.toml"
flyctl deploy --config fly.toml

echo "Deploy complete."
