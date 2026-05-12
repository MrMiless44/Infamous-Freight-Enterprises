#!/usr/bin/env bash
set -euo pipefail

failures=0

fail() {
  echo "ERROR: $1" >&2
  failures=$((failures + 1))
}

pass() {
  echo "OK: $1"
}

[[ -f fly.toml ]] || fail "fly.toml is missing"
[[ -f Dockerfile ]] || fail "Dockerfile is missing"
[[ -f .dockerignore ]] || fail ".dockerignore is missing"

if [[ -f fly.toml ]]; then
  grep -q 'PORT = "3000"' fly.toml || grep -q "PORT = '3000'" fly.toml || fail "fly.toml must set PORT to 3000"
  grep -q 'internal_port = 3000' fly.toml || fail "fly.toml must set internal_port = 3000"
  grep -q 'size = "performance-1x"' fly.toml || grep -q "size = 'performance-1x'" fly.toml || fail "fly.toml must use size = performance-1x"
  ! grep -q 'performance-cpu-1x' fly.toml || fail "fly.toml contains invalid performance-cpu-1x"
  grep -q '/api/health/live' fly.toml || fail "fly.toml health check must use /api/health/live"
fi

if [[ -f Dockerfile ]]; then
  grep -q 'ENV PORT=3000' Dockerfile || fail "Dockerfile must set ENV PORT=3000"
  grep -q 'EXPOSE 3000' Dockerfile || fail "Dockerfile must EXPOSE 3000"
  grep -q 'apps/api/dist/src/server.js' Dockerfile || fail "Dockerfile must start apps/api/dist/src/server.js"
  ! grep -q 'dist/index.js' Dockerfile || fail "Dockerfile must not reference dist/index.js"
  ! grep -q 'PORT=8080' Dockerfile || fail "Dockerfile must not set PORT=8080"
  ! grep -q 'EXPOSE 8080' Dockerfile || fail "Dockerfile must not expose 8080"
fi

if [[ -f .dockerignore ]]; then
  ! grep -Eq '^[[:space:]]*src[[:space:]]*$' .dockerignore || fail ".dockerignore must not ignore src globally"
  ! grep -Eq '^[[:space:]]*\*\.ts[[:space:]]*$' .dockerignore || fail ".dockerignore must not ignore *.ts globally"
fi

if [[ "$failures" -gt 0 ]]; then
  echo "Fly/Docker configuration check failed with ${failures} issue(s)." >&2
  exit 1
fi

pass "Fly/Docker configuration check passed"
