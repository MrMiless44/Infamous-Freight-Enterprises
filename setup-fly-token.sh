#!/usr/bin/env bash
set -Eeuo pipefail

ENV_DIR="$HOME/.config/infamous-freight"
ENV_FILE="$ENV_DIR/fly.env"

mkdir -p "$ENV_DIR"
chmod 700 "$ENV_DIR"

read -r -s -p "Enter FLY_API_TOKEN: " FLY_API_TOKEN
echo

if [ -z "$FLY_API_TOKEN" ]; then
  echo "FLY_API_TOKEN cannot be empty."
  exit 1
fi

export FLY_API_TOKEN

printf 'export FLY_API_TOKEN=%q\n' "$FLY_API_TOKEN" > "$ENV_FILE"
chmod 600 "$ENV_FILE"

# shellcheck disable=SC1090
source "$ENV_FILE"

if command -v flyctl >/dev/null 2>&1; then
  flyctl auth whoami
elif command -v fly >/dev/null 2>&1; then
  fly auth whoami
else
  echo "Neither flyctl nor fly CLI was found in PATH."
  exit 1
fi

echo "FLY_API_TOKEN saved to $ENV_FILE with chmod 600."
