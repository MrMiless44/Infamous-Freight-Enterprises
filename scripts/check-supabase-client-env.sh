#!/usr/bin/env bash
set -euo pipefail

# Guards against accidentally using direct Postgres/database URLs with Supabase browser/client SDKs.
# Supabase createClient() expects the Supabase project API URL, e.g. https://project-ref.supabase.co.
# Direct database URLs must stay server-side only, usually DATABASE_URL.

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

failures=0

check_pattern() {
  local description="$1"
  local pattern="$2"
  local include_glob="${3:-*}"

  local matches
  matches="$(git grep -n -I -E "$pattern" -- \
    "$include_glob" \
    ':!node_modules' ':!.git' ':!dist' ':!build' ':!.next' ':!coverage' \
    ':!docs/PRODUCTION-SECRETS-CHECKLIST.md' \
    ':!scripts/check-supabase-client-env.sh' \
    ':!scripts/codex-env-check.sh' \
    ':!apps/api/test/codex-env-check-script.test.ts' \
    || true)"

  if [[ -n "$matches" ]]; then
    echo "❌ ${description}"
    echo "$matches"
    echo
    failures=$((failures + 1))
  else
    echo "✅ ${description}"
  fi
}

check_pattern \
  "No Supabase createClient call should receive a DATABASE_URL variable" \
  'createClient[[:space:]]*\([^)]*(SUPABASE_)?DATABASE_URL' \
  '*.[jt]s*'

check_pattern \
  "No public/browser environment variable should expose a Supabase database URL" \
  '^[[:space:]]*(VITE|PUBLIC|NEXT_PUBLIC|REACT_APP)_SUPABASE_DATABASE_URL[[:space:]]*=' \
  '.env*'

check_pattern \
  "No public/browser environment variable should expose a generic DATABASE_URL" \
  '(VITE|PUBLIC|NEXT_PUBLIC|REACT_APP)_DATABASE_URL' \
  '*'

check_pattern \
  "No frontend env example should contain a Postgres URL under a public prefix" \
  '^(VITE|PUBLIC|NEXT_PUBLIC|REACT_APP)_[A-Z0-9_]*=.*postgres(ql)?://' \
  '.env*'

if [[ "$failures" -gt 0 ]]; then
  echo "Supabase client environment check failed with ${failures} issue group(s)."
  echo "Use SUPABASE_URL or VITE_SUPABASE_URL for createClient(), and keep DATABASE_URL server-side only."
  exit 1
fi

echo "Supabase client environment check passed."
