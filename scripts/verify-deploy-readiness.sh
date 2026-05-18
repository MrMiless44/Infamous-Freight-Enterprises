#!/usr/bin/env bash
set -euo pipefail

export PATH="$PWD/.tools/bin:$PATH"

pnpm run setup:clis
pnpm install --frozen-lockfile
pnpm run env:check:frontend
pnpm run env:check:supabase-client
pnpm run build

flyctl config validate --config fly.toml
flyctl checks list -a infamous-freight-api
curl -fsS https://infamous-freight-api.fly.dev/api/health/live
