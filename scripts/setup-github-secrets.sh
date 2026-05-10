#!/bin/bash
# ============================================================
# INFAMOUS FREIGHT — GitHub Secrets Setup Script
# Run this after cloning the repo to set all required secrets
# ============================================================

set -e

REPO="Infamous-Freight/Infamous-freight"
echo "🔐 Setting up GitHub secrets for $REPO..."

# Check gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Install it first:"
    echo "   https://cli.github.com/manual/installation"
    exit 1
fi

# Check logged in
if ! gh auth status &> /dev/null; then
    echo "❌ Not logged into GitHub CLI. Run: gh auth login"
    exit 1
fi

echo ""
echo "✅ GitHub CLI authenticated"
echo ""

if [[ -n "${STRIPE_ACCOUNT_ID:-}" && ! "${STRIPE_ACCOUNT_ID}" =~ ^acct_[A-Za-z0-9]+$ ]]; then
    echo "❌ STRIPE_ACCOUNT_ID does not look like a Stripe account ID."
    exit 1
fi

# Function to set secret
set_secret() {
    local name=$1
    local value=$2
    if [ -z "$value" ]; then
        echo "   ⚠️  $name is empty — skipping"
        return
    fi
    echo "$value" | gh secret set "$name" -R "$REPO" 2>/dev/null && echo "   ✅ $name set" || echo "   ❌ $name failed"
}

# ============================================
# CRITICAL SECRETS (Required for deployment)
# ============================================
echo "🔴 Setting CRITICAL secrets..."

# Fly.io
set_secret "FLY_API_TOKEN" "$FLY_API_TOKEN"

# Netlify
set_secret "NETLIFY_AUTH_TOKEN" "$NETLIFY_AUTH_TOKEN"
set_secret "NETLIFY_SITE_ID" "$NETLIFY_SITE_ID"

# Stripe
set_secret "STRIPE_ACCOUNT_ID" "$STRIPE_ACCOUNT_ID"
set_secret "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY"
set_secret "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET"

# Supabase
set_secret "SUPABASE_URL" "$SUPABASE_URL"
set_secret "SUPABASE_SERVICE_KEY" "$SUPABASE_SERVICE_KEY"

# Frontend
set_secret "VITE_API_URL" "https://infamous-freight.fly.dev"
set_secret "VITE_STRIPE_PUBLIC_KEY" "$VITE_STRIPE_PUBLIC_KEY"

# ============================================
# HIGH PRIORITY (Required for features)
# ============================================
echo ""
echo "🟡 Setting HIGH PRIORITY secrets..."

# Database
set_secret "DATABASE_URL" "$DATABASE_URL"
set_secret "REDIS_PASSWORD" "$REDIS_PASSWORD"
set_secret "JWT_SECRET" "$JWT_SECRET"

# Load boards (optional but recommended)
set_secret "DAT_API_KEY" "$DAT_API_KEY"
set_secret "TRUCKSTOP_API_KEY" "$TRUCKSTOP_API_KEY"
set_secret "LOADBOARD_API_KEY" "$LOADBOARD_API_KEY"

# Email
set_secret "SENDGRID_API_KEY" "$SENDGRID_API_KEY"

echo ""
echo "✅ All secrets configured!"
echo ""
echo "Verify at: https://github.com/$REPO/settings/secrets/actions"
