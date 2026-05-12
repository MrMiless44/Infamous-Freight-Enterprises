#!/usr/bin/env bash
set -euo pipefail

if [[ -f package-lock.json ]]; then
  echo "WARNING: package-lock.json exists in this pnpm workspace." >&2
  echo "Netlify should use pnpm-lock.yaml; project NPM_FLAGS is set to --version to avoid npm ci fallback." >&2
  echo "Remove package-lock.json in a local git checkout when possible." >&2
fi

if [[ ! -f pnpm-lock.yaml ]]; then
  echo "ERROR: pnpm-lock.yaml is required for Netlify/pnpm installs." >&2
  exit 1
fi

echo "pnpm workspace lockfile check passed."
