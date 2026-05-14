#!/usr/bin/env bash
set -Eeuo pipefail
set +x

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_DIR="$REPO_ROOT/.tools/bin"
LOCAL_ENV_DIR="$HOME/.config/infamous-freight"
LOCAL_ENV_FILE="$LOCAL_ENV_DIR/local.env"

mkdir -p "$LOCAL_ENV_DIR"
chmod 700 "$LOCAL_ENV_DIR"

export PATH="$TOOLS_DIR:$HOME/.fly/bin:$PATH"

if [ -f "$LOCAL_ENV_FILE" ]; then
  # shellcheck disable=SC1090
  source "$LOCAL_ENV_FILE"
else
  cat > "$LOCAL_ENV_FILE" <<'ENVEOF'
# Infamous Freight local secrets
# Fill these in locally only. Do not commit this file.

# Fly.io
export FLY_API_TOKEN=""

# GitHub CLI token is optional if you use `gh auth login`
export GH_TOKEN=""

# Supabase
export SUPABASE_ACCESS_TOKEN=""
export SUPABASE_PROJECT_ID=""

# Stripe
export STRIPE_API_KEY=""
export STRIPE_WEBHOOK_SECRET=""

# Netlify
export NETLIFY_AUTH_TOKEN=""
export NETLIFY_SITE_ID=""

# App
export NODE_ENV="development"
ENVEOF

  chmod 600 "$LOCAL_ENV_FILE"
  echo "Created $LOCAL_ENV_FILE"
  echo "Fill it with real values, then rerun:"
  echo "  source scripts/use-local-env.sh"
  return 0 2>/dev/null || exit 0
fi

echo "==> Environment loaded"
echo "Repo: $REPO_ROOT"
echo "Tools: $TOOLS_DIR"

echo "==> CLI availability"
for cli in flyctl supabase stripe gh netlify docker jq shellcheck; do
  if command -v "$cli" >/dev/null 2>&1; then
    printf "✅ %s: %s\n" "$cli" "$(command -v "$cli")"
  else
    printf "⚠️  %s missing\n" "$cli"
  fi
done

echo "==> Secret presence check"
for var in FLY_API_TOKEN SUPABASE_ACCESS_TOKEN STRIPE_API_KEY NETLIFY_AUTH_TOKEN; do
  if [ -n "${!var:-}" ]; then
    echo "✅ $var set"
  else
    echo "⚠️  $var missing"
  fi
done
