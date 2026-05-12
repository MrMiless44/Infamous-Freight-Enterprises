#!/usr/bin/env bash
set -euo pipefail

APP="${FLY_APP:-infamous-freight-api}"
IMAGE_DIGEST="${IMAGE_DIGEST:-ghcr.io/infaemous-freight/infamous-freight-api@sha256:43fd4f0f0eafd34a17ab1b18a6e5b1760e54e56f2bf0491be325e06da105bc00}"
FLY_BIN="$(command -v flyctl || command -v fly || true)"

if [[ -z "${FLY_BIN}" ]]; then
  echo "ERROR: Fly CLI is missing." >&2
  exit 1
fi

echo "Deploying pinned image digest to ${APP}:"
echo "${IMAGE_DIGEST}"
echo

"${FLY_BIN}" deploy \
  --app "${APP}" \
  --image "${IMAGE_DIGEST}" \
  --strategy rolling \
  --max-concurrent 1 \
  --wait-timeout 10m \
  --yes

echo
echo "Deploy command finished."
