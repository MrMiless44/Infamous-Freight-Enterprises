#!/usr/bin/env bash
set -euo pipefail

# Validates Postgres/Supabase connection URLs without printing secret values.
# Catches common Supavisor mistakes such as using `postgres.<project-ref>`
# as the database name instead of `postgres`.

urls=()
for name in DATABASE_URL DIRECT_URL SHADOW_DATABASE_URL SUPABASE_DB_URL POSTGRES_URL POSTGRES_PRISMA_URL POSTGRES_URL_NON_POOLING; do
  if [[ -n "${!name:-}" ]]; then
    urls+=("${name}")
  fi
done

if [[ "${#urls[@]}" -eq 0 ]]; then
  echo "⚠️  No database URL variables found to validate."
  exit 0
fi

failures=0

validate_url() {
  local name="$1"
  local value="${!name}"

  echo "Checking ${name}"

  if [[ ! "${value}" =~ ^postgres(ql)?:// ]]; then
    echo "❌ ${name} must start with postgres:// or postgresql://"
    failures=$((failures + 1))
    return
  fi

  local without_query="${value%%\?*}"
  local db_name="${without_query##*/}"

  if [[ -z "${db_name}" || "${db_name}" == "${without_query}" ]]; then
    echo "❌ ${name} does not contain a database name path segment"
    failures=$((failures + 1))
    return
  fi

  if [[ "${db_name}" =~ ^postgres\.[a-z0-9]+$ ]]; then
    echo "❌ ${name} appears to use '${db_name}' as the database name. Supabase/Supavisor URLs normally use database name 'postgres' and project refs in host/user fields."
    failures=$((failures + 1))
  fi

  if [[ "${value}" == *"pooler.supabase.com"* || "${value}" == *"supabase.co"* ]]; then
    if [[ "${db_name}" != "postgres" ]]; then
      echo "⚠️  ${name} points at Supabase but database name is '${db_name}', not 'postgres'. Verify this is intentional."
    else
      echo "✅ ${name} database name looks valid for Supabase."
    fi
  else
    echo "✅ ${name} basic URL shape looks valid."
  fi
}

for name in "${urls[@]}"; do
  validate_url "${name}"
done

if [[ "${failures}" -gt 0 ]]; then
  echo "Database URL validation failed with ${failures} error(s)."
  exit 1
fi

echo "Database URL validation passed. No secret values were printed."
