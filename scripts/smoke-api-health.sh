#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  if [[ -n "${API_PID:-}" ]] && kill -0 "$API_PID" >/dev/null 2>&1; then
    kill "$API_PID" >/dev/null 2>&1 || true
    wait "$API_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

export PORT="${PORT:-3000}"
SMOKE_TIMEOUT_SECONDS="${SMOKE_TIMEOUT_SECONDS:-20}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set; running smoke test in NODE_ENV=test fallback mode." >&2
  export NODE_ENV=test
fi

node apps/api/dist/src/server.js >/tmp/if-api-smoke.log 2>&1 &
API_PID=$!

check_endpoint() {
  local endpoint="$1"
  local output_file="/tmp/if-api-health-$(echo "$endpoint" | tr '/' '_').json"

  if ! curl -fsS "http://127.0.0.1:${PORT}${endpoint}" >"${output_file}" 2>/dev/null; then
    return 1
  fi

  if ! node -e "const fs=require('fs');const p=process.argv[1];const d=JSON.parse(fs.readFileSync(p,'utf8'));if(!(d && d.status==='ok')) process.exit(1);" "${output_file}"; then
    echo "Health response from ${endpoint} did not include status=ok" >&2
    cat "${output_file}" >&2
    return 1
  fi

  cat "${output_file}"
  return 0
}

for _ in $(seq 1 "$SMOKE_TIMEOUT_SECONDS"); do
  if check_endpoint "/health" || check_endpoint "/api/health"; then
    exit 0
  fi
  sleep 1
done

echo "API health check failed on PORT=${PORT} after ${SMOKE_TIMEOUT_SECONDS}s. Logs:" >&2
cat /tmp/if-api-smoke.log >&2
exit 1
