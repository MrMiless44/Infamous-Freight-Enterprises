# Infamous Freight — Secrets Setup Guide

This guide walks you through adding all required secrets to your GitHub repo for automated CI/CD deployment.

---

## Step 1: Open GitHub Secrets

1. Go to: `https://github.com/Infamous-Freight/Infamous-freight/settings/secrets/actions`
2. Click **New repository secret**
3. Add each secret below

---

## Step 2: Required Secrets

### GitHub Token (already used for push)
| Secret Name | Value | Source |
|-------------|-------|--------|
| `GITHUB_TOKEN` | Auto-provided by GitHub | N/A — already works |

### Fly.io (API Deployment)
| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `FLY_API_TOKEN` | `your-fly-token` | https://fly.io/user/personal_access_tokens |

**Verify Fly app exists:**
```bash
fly apps list
# Should show: infamous-freight
```

### Netlify (Web Deployment)
| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `NETLIFY_AUTH_TOKEN` | `your-netlify-token` | https://app.netlify.com/user/applications |
| `NETLIFY_SITE_ID` | `your-site-id` | Netlify site settings |

### Stripe (Payments)
| Secret Name | Value | Source |
|-------------|-------|--------|
| `STRIPE_ACCOUNT_ID` | `acct_...` | Stripe account settings |
| `STRIPE_SECRET_KEY` | `sk_live_...` | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook endpoint settings |

### Frontend Environment
| Secret Name | Value | Notes |
|-------------|-------|-------|
| `VITE_API_URL` | Leave empty when using Netlify/Vercel rewrites; otherwise set to `https://infamous-freight-api.fly.dev` | Empty uses the platform proxy in production; use the Fly.io API URL only for non-proxied/direct backend deployments |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_live_...` | https://dashboard.stripe.com/apikeys |

### Supabase (Auth + Database)
| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | Supabase Project Settings > API |
| `SUPABASE_SERVICE_KEY` | `your-service-key` | Supabase Project Settings > API > service_role key |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | Supabase Project Settings > API > service_role key |
| `SUPABASE_JWT_SECRET` | `your-jwt-secret` | Supabase Project Settings > API |
| `SUPABASE_ANON_KEY` | `your-anon-key` | Supabase Project Settings > API |

### Sentry (Recommended for production)
| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `SENTRY_DSN` | `https://...` | Sentry project settings |
| `VITE_SENTRY_DSN` | `https://...` | Sentry project settings |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://...` | Sentry project settings |

### Load Board APIs (Optional — enables live load data)
| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `DAT_API_KEY` | `your-dat-key` | https://www.dat.com/iq-api |
| `TRUCKSTOP_API_KEY` | `your-truckstop-key` | https://www.truckstop.com/developer |
| `LOADBOARD_API_KEY` | `your-123-key` | https://www.123loadboard.com/developer |

### ELD Providers (Optional — enables HOS sync)
| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `SAMSARA_API_TOKEN` | `your-token` | https://developers.samsara.com |
| `MOTIVE_CLIENT_ID` | `your-id` | https://developer.gomotive.com |
| `MOTIVE_CLIENT_SECRET` | `your-secret` | ^ same |

### QuickBooks / Xero (Optional — enables accounting sync)
| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `QBO_CLIENT_ID` | `your-id` | https://developer.intuit.com |
| `QBO_CLIENT_SECRET` | `your-secret` | ^ same |
| `XERO_CLIENT_ID` | `your-id` | https://developer.xero.com |
| `XERO_CLIENT_SECRET` | `your-secret` | ^ same |

### Email (Optional — enables email notifications)
| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `SENDGRID_API_KEY` | `SG...` | https://app.sendgrid.com |

---

## Step 3: Verify Secrets

After adding all secrets, your GitHub Actions page should show:

```
Repository secrets:
- FLY_API_TOKEN
- DATABASE_URL
- NETLIFY_AUTH_TOKEN
- NETLIFY_SITE_ID
- STRIPE_ACCOUNT_ID
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_JWT_SECRET
- SUPABASE_ANON_KEY
- VITE_API_URL
- VITE_STRIPE_PUBLIC_KEY
```

Repository variables/secrets should also include runtime values documented in:

- `docs/PRODUCTION-SECRETS-CHECKLIST.md`
- `scripts/codex-env-check.sh` required and optional lists

Use this for a quick CI validation pass after saving values:

```bash
pnpm run codex:env-check:strict
```

---

## Step 4: Deploy

Once secrets are added, push any change to `main`:

```bash
git commit --allow-empty -m "trigger: deploy"
git push origin main
```

GitHub Actions will automatically:
1. Run tests
2. Build API Docker image → deploy to Fly.io
3. Build web app → deploy to Netlify

Watch progress at: `https://github.com/Infamous-Freight/Infamous-freight/actions`

---

## Step 5: Verify Deployment

| Service | URL | What to Check |
|---------|-----|---------------|
| API | `https://api.infamousfreight.com/health` | Should return `{"status":"ok"}` |
| Web | `https://infamousfreight.com` | Should show login page |
| API Docs | `https://api.infamousfreight.com/api/docs` | Swagger/OpenAPI UI |

---

## Manual Deploy (if CI/CD fails)

```bash
# API (Fly.io)
fly deploy --app infamous-freight-api

# Web (Netlify)
npm run build:web
netlify deploy --prod --dir=apps/web/dist --functions netlify/functions
```

---

## Secrets Quick Reference Table

| Priority | Secret | Required For |
|----------|--------|-------------|
| 🔴 Critical | `FLY_API_TOKEN` | API deployment |
| 🔴 Critical | `NETLIFY_AUTH_TOKEN` | Web deployment |
| 🔴 Critical | `NETLIFY_SITE_ID` | Web deployment |
| 🔴 Critical | `STRIPE_ACCOUNT_ID` | Stripe account guard |
| 🔴 Critical | `STRIPE_SECRET_KEY` | Payments |
| 🔴 Critical | `SUPABASE_URL` | Auth + database |
| 🟡 High | `STRIPE_WEBHOOK_SECRET` | Stripe webhooks |
| 🟡 High | `VITE_API_URL` | Frontend API calls |
| 🟡 High | `VITE_STRIPE_PUBLIC_KEY` | Stripe Checkout |
| 🟢 Medium | `DAT_API_KEY` | Live load data |
| 🟢 Medium | `SENDGRID_API_KEY` | Email notifications |
| ⚪ Low | `QBO_*`, `XERO_*` | Accounting sync |

---

## Need Help?

If any step fails, check:
1. GitHub Actions logs: `https://github.com/Infamous-Freight/Infamous-freight/actions`
2. Fly.io dashboard: `https://fly.io/dashboard`
3. Netlify dashboard: `https://app.netlify.com/sites/d03682ba-fcb4-4dc6-984e-f7eae7fff59c`
4. Stripe dashboard: `https://dashboard.stripe.com`
