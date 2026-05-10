#!/usr/bin/env bash
set -euo pipefail

# Optional: load environment variables from ENV_FILE (default: .env)
ENV_FILE="${ENV_FILE:-}"
if [[ -n "$ENV_FILE" && -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# Usage:
#   KEY_ID=ops-key-2026-04-30-01 \
#   SSH_PUBLIC_KEY="ssh-rsa AAAA..." \
#   EXPECTED_SHA256="ENq3sUhcnOq79ETLvC9RN2Ltb/+52cXTGFaFWPicxsA" \
#   ./scripts/ops/sync-authorized-key.sh

: "${KEY_ID:?KEY_ID is required}"
: "${SSH_PUBLIC_KEY:?SSH_PUBLIC_KEY is required}"
: "${EXPECTED_SHA256:?EXPECTED_SHA256 is required}"

actual_fingerprint="$(printf '%s\n' "$SSH_PUBLIC_KEY" | ssh-keygen -lf - | awk '{print $2}' | sed 's/^SHA256://')"

if [[ "$actual_fingerprint" != "$EXPECTED_SHA256" ]]; then
  echo "Fingerprint mismatch for ${KEY_ID}" >&2
  echo "Expected: ${EXPECTED_SHA256}" >&2
  echo "Actual:   ${actual_fingerprint}" >&2
  exit 1
fi

mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
touch "$HOME/.ssh/authorized_keys"
chmod 600 "$HOME/.ssh/authorized_keys"

if ! grep -qxF "$SSH_PUBLIC_KEY" "$HOME/.ssh/authorized_keys"; then
  printf '%s\n' "$SSH_PUBLIC_KEY" >> "$HOME/.ssh/authorized_keys"
  echo "Added ${KEY_ID} to authorized_keys"
else
  echo "${KEY_ID} already present in authorized_keys"
fi
