#!/usr/bin/env bash
set -euo pipefail

if [[ -f package-lock.json ]]; then
  echo "ERROR: package-lock.json is not allowed in this pnpm workspace." >&2
  echo "Use pnpm-lock.yaml only. Remove package-lock.json and run pnpm install --frozen-lockfile." >&2
  exit 1
fi

if [[ ! -f pnpm-lock.yaml ]]; then
  echo "ERROR: pnpm-lock.yaml is required for Netlify/pnpm installs." >&2
  exit 1
fi

echo "pnpm workspace lockfile check passed."
