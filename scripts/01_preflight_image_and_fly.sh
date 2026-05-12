#!/usr/bin/env bash
set -euo pipefail

APP="${FLY_APP:-infamous-freight-api}"
IMAGE_TAG="${IMAGE_TAG:-ghcr.io/infaemous-freight/infamous-freight-api:a21800dae96e56fda18195ef00ad6d276b48bb43}"
IMAGE_DIGEST="${IMAGE_DIGEST:-ghcr.io/infaemous-freight/infamous-freight-api@sha256:43fd4f0f0eafd34a17ab1b18a6e5b1760e54e56f2bf0491be325e06da105bc00}"

FLY_BIN="$(command -v flyctl || command -v fly || true)"
if [[ -z "${FLY_BIN}" ]]; then
  echo "ERROR: Fly CLI is missing. Install flyctl, then run fly auth login." >&2
  exit 1
fi

echo "Fly app: ${APP}"
echo "Image tag: ${IMAGE_TAG}"
echo "Image digest: ${IMAGE_DIGEST}"
echo

echo "Checking Fly login and app access..."
"${FLY_BIN}" auth whoami
"${FLY_BIN}" status --app "${APP}"
echo

if command -v docker >/dev/null 2>&1; then
  echo "Checking local Docker can inspect/pull the image..."
  docker manifest inspect "${IMAGE_DIGEST}" >/dev/null || docker manifest inspect "${IMAGE_TAG}" >/dev/null || {
    echo "WARNING: Docker could not inspect the image. If GHCR is private, run: docker login ghcr.io" >&2
  }
else
  echo "Docker not found locally. Skipping local image inspection."
fi

echo
echo "Checking required Fly secret names are present..."
SECRETS_FILE="/tmp/${APP}_secrets_list.txt"
"${FLY_BIN}" secrets list --app "${APP}" | tee "${SECRETS_FILE}"

missing=0
for key in DATABASE_URL SUPABASE_JWT_SECRET STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET; do
  if ! grep -q "^${key}\b" "${SECRETS_FILE}"; then
    echo "MISSING: ${key}" >&2
    missing=1
  fi
done

if [[ "${missing}" -eq 1 ]]; then
  echo
  echo "Required secrets are missing. Set them before deploy." >&2
  exit 1
fi

echo "Preflight passed."
