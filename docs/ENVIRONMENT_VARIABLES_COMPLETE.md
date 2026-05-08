# Infamous Freight Environment Variables (Complete)

## Backend (apps/api)

| Variable | Required | Description |
|---|---:|---|
| NODE_ENV | Yes | Runtime mode (`production` in deploy). |
| PORT | Yes | API bind port (`3000`). |
| DATABASE_URL | Yes | PostgreSQL connection string for Prisma. |
| CORS_ORIGINS | Yes | Comma-separated allowed origins. |
| WEB_APP_URL | Yes | Canonical frontend URL used by API flows. |
| STRIPE_SECRET_KEY | Yes | Stripe server-side secret key. |
| STRIPE_WEBHOOK_SECRET | Yes | Stripe webhook signing secret. |
| STRIPE_CHECKOUT_SUCCESS_URL | Yes | Success redirect URL for checkout. |
| STRIPE_CHECKOUT_CANCEL_URL | Yes | Cancel redirect URL for checkout. |
| STRIPE_PORTAL_RETURN_URL | Yes | Return URL for Stripe customer portal. |
| SUPABASE_URL | Yes | Supabase project URL. |
| SUPABASE_SERVICE_KEY | Yes | Supabase service role key (server only). |
| REDIS_HOST | Yes | Redis host. |
| REDIS_PORT | Yes | Redis port (typically `6379`). |
| REDIS_PASSWORD | Yes | Redis password. |
| REDIS_DB | Yes | Redis DB index (typically `0`). |
| DAT_API_KEY | Yes | DAT loadboard API key. |
| TRUCKSTOP_API_KEY | Yes | Truckstop API key. |
| LOADBOARD_API_KEY | Yes | Alternate/general loadboard API key. |
| SAMSARA_API_TOKEN | Yes | Samsara API token. |
| SENTRY_DSN | Optional | Backend Sentry DSN. |
| RATE_LIMIT_ENABLED | Yes | Enables API rate limiting (`true`/`false`). |

## Frontend (apps/web)

| Variable | Required | Description |
|---|---:|---|
| VITE_API_URL | Yes | Public API base URL. |
| VITE_SUPABASE_URL | Yes | Supabase project URL for client SDK. |
| VITE_SUPABASE_PUBLISHABLE_KEY | Yes | Supabase publishable key for frontend. |
| VITE_SUPABASE_ANON_KEY | Yes | Supabase anon key for frontend. |
| VITE_SENTRY_DSN | Optional | Frontend Sentry DSN. |

## Secrets (do not commit)

Set these in secret stores (CI/Fly/Codex secrets), not tracked files:

- `NPM_TOKEN`
- `GITHUB_TOKEN`
- `PRIVATE_REGISTRY_TOKEN`

## Example values template

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/infamous_freight
CORS_ORIGINS=https://www.infamousfreight.com,https://app.infamousfreight.com
WEB_APP_URL=https://www.infamousfreight.com
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
STRIPE_CHECKOUT_SUCCESS_URL=https://www.infamousfreight.com/billing/success
STRIPE_CHECKOUT_CANCEL_URL=https://www.infamousfreight.com/billing/cancel
STRIPE_PORTAL_RETURN_URL=https://www.infamousfreight.com/billing
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY
REDIS_HOST=redis.infamousfreight.com
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_PASSWORD
REDIS_DB=0
DAT_API_KEY=YOUR_KEY
TRUCKSTOP_API_KEY=YOUR_KEY
LOADBOARD_API_KEY=YOUR_KEY
SAMSARA_API_TOKEN=YOUR_TOKEN
SENTRY_DSN=https://YOUR_KEY@sentry.io/ID
RATE_LIMIT_ENABLED=true
VITE_API_URL=https://api.infamousfreight.com
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
VITE_SENTRY_DSN=https://YOUR_KEY@sentry.io/ID
```

## Verification commands

```bash
test -n "$NODE_ENV" && echo "✓ NODE_ENV is set"
test -n "$DATABASE_URL" && echo "✓ DATABASE_URL is set"
test -n "$STRIPE_SECRET_KEY" && echo "✓ STRIPE_SECRET_KEY is set"
printenv | sort
```
