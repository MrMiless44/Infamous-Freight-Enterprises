#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${1:-infamous-freight}"
MACHINE_ID="${2:-}"

if [[ -z "${MACHINE_ID}" ]]; then
  echo "Usage: $0 <app-name> <machine-id>"
  echo "Example: $0 infamous-freight 0803666c2ed6d8"
  exit 1
fi

echo "==> App status (${APP_NAME})"
fly status -a "${APP_NAME}" --all

echo "\n==> Health checks (${APP_NAME})"
fly checks list -a "${APP_NAME}"

echo "\n==> Machine status (${MACHINE_ID})"
fly machine status "${MACHINE_ID}" -a "${APP_NAME}"

echo "\n==> Machine logs (${MACHINE_ID})"
fly logs -a "${APP_NAME}" --machine "${MACHINE_ID}" --no-tail
