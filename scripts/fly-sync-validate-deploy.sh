#!/usr/bin/env bash
set -euo pipefail

APP_NAME="${FLY_APP_NAME:-infamous-freight-api}"
REMOTE="${GIT_REMOTE:-origin}"
BRANCH="${GIT_BRANCH:-main}"

if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: git is required but was not found in PATH." >&2
  exit 1
fi

if ! command -v fly >/dev/null 2>&1 && ! command -v flyctl >/dev/null 2>&1; then
  echo "ERROR: flyctl is required. Install it or make sure 'fly'/'flyctl' is in PATH." >&2
  exit 1
fi

FLY_BIN="fly"
if ! command -v fly >/dev/null 2>&1; then
  FLY_BIN="flyctl"
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: Run this from inside the repo working tree." >&2
  exit 1
fi

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

echo "==> Repository: $ROOT"
echo "==> Syncing $REMOTE/$BRANCH"
git fetch "$REMOTE" "$BRANCH"
git pull --ff-only "$REMOTE" "$BRANCH"

echo "==> Verifying fly.toml machine size"
if grep -q 'performance-cpu-1x' fly.toml; then
  echo "ERROR: fly.toml still contains invalid size: performance-cpu-1x" >&2
  echo "Run: perl -pi.bak -e 's/performance-cpu-1x/performance-1x/g' fly.toml" >&2
  exit 1
fi

grep -n 'internal_port\|PORT =\|size =' fly.toml

echo "==> Validating Fly config"
"$FLY_BIN" config validate --config fly.toml

echo "==> Deploying $APP_NAME"
"$FLY_BIN" deploy --config fly.toml --app "$APP_NAME"

echo "==> Fly checks"
"$FLY_BIN" checks list --app "$APP_NAME" || true

echo "==> Recent Fly logs"
"$FLY_BIN" logs --app "$APP_NAME" --no-tail || true

echo "Done."
