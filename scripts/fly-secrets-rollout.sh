#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${1:-infamous-freight-api}"

echo "==> Saving remote Fly config"
fly config save -a "${APP_NAME}" --yes

echo "==> Staging secret changes"
fly secrets sync -a "${APP_NAME}" --stage

echo "==> Deploying staged secrets"
fly secrets deploy -a "${APP_NAME}"

echo "Secrets rollout completed for ${APP_NAME}."
