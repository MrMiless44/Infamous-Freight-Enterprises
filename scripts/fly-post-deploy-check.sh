#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${1:-infamous-freight}"
APP_URL="${2:-https://infamous-freight.fly.dev}"
API_URL="${3:-https://api.infamousfreight.com}"
ALLOW_MULTI_IMAGE_DEPLOY="${ALLOW_MULTI_IMAGE_DEPLOY:-false}"

flyctl auth whoami
flyctl status --app "${APP_NAME}"
flyctl checks list --app "${APP_NAME}"

machine_json="$(flyctl machine list --app "${APP_NAME}" --json)"
image_report="$(printf '%s' "${machine_json}" | node -e 'let raw=""; process.stdin.on("data", c => raw += c); process.stdin.on("end", () => { const machines = JSON.parse(raw || "[]"); const byImage = new Map(); for (const m of machines) { const key = m.image_ref || "unknown-image"; const bucket = byImage.get(key) || []; bucket.push(m.id || "unknown-machine"); byImage.set(key, bucket); } const rows = [...byImage.entries()].map(([image, ids]) => `${ids.length}|${image}|${ids.join(",")}`); process.stdout.write(rows.join("\n")); });')"

unique_image_count="$(printf '%s' "${image_report}" | sed '/^$/d' | wc -l | tr -d ' ')"

if [[ "${unique_image_count}" != "1" ]]; then
  echo "ERROR: ${APP_NAME} has ${unique_image_count} deployed images across machines." >&2
  printf '%s\n' "${image_report}" | while IFS='|' read -r count image ids; do
    [[ -n "${image}" ]] || continue
    echo "${count} machine(s) with ${image}: ${ids}" >&2
  done
  echo "Run: flyctl machine list --app ${APP_NAME}" >&2
  echo "Keep one active deployment image before scaling with the UI or flyctl scale." >&2

  if [[ "${ALLOW_MULTI_IMAGE_DEPLOY}" != "true" ]]; then
    exit 1
  fi

  echo "WARN: Continuing because ALLOW_MULTI_IMAGE_DEPLOY=true (expected only during active rollout)." >&2
fi

curl -fsS "${APP_URL}/api/health" >/dev/null
curl -fsS "${API_URL}/api/health" >/dev/null

echo "Fly deploy verification passed for ${APP_NAME}."
