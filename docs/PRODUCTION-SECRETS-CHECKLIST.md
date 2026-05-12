# Production Secrets Checklist

This checklist tracks production secrets and environment values that must exist outside the repo. Do not commit real secrets.

## Canonical domain

Use one production website everywhere:

```text
https://www.infamousfreight.com
```

The bare domain must redirect to the canonical host:

```text
https://infamousfreight.com -> https://www.infamousfreight.com
```

## GitHub Actions secrets

Required:

```text
FLY_API_TOKEN=<rotated Fly deploy token>
DATABASE_URL=<production postgres connection string>
```

Recommended repository variables or secrets where needed by builds:

```text
NODE_ENV=production
PORT=3000
SITE_URL=https://www.infamousfreight.com
PUBLIC_SITE_URL=https://www.infamousfreight.com
FRONTEND_URL=https://www.infamousfreight.com
WEB_APP_URL=https://www.infamousfreight.com
CORS_ORIGIN=https://www.infamousfreight.com
CORS_ORIGINS=https://www.infamousfreight.com,https://app.infamousfreight.com
VITE_SITE_URL=https://www.infamousfreight.com
NEXT_PUBLIC_SITE_URL=https://www.infamousfreight.com
API_PUBLIC_URL=https://api.infamousfreight.com
VITE_API_URL=/api
NEXT_PUBLIC_API_URL=/api
VITE_SOCKET_URL=wss://www.infamousfreight.com/socket.io
REDIS_URL=<managed redis url>
REDIS_HOST=<managed redis host>
REDIS_PORT=6379
REDIS_PASSWORD=<managed redis password>
REDIS_DB=0
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<supabase service key>
SUPABASE_SERVICE_ROLE_KEY=<supabase service role key>
SUPABASE_ANON_KEY=<supabase anon key>
SUPABASE_JWT_SECRET=<supabase jwt secret>
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_DATABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<supabase publishable key>
VITE_SUPABASE_ANON_KEY=<supabase anon key>
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
SENTRY_DSN=<backend sentry dsn>
VITE_SENTRY_DSN=<frontend sentry dsn>
NEXT_PUBLIC_SENTRY_DSN=<frontend sentry dsn>
STRIPE_ACCOUNT_ID=<stripe account id>
STRIPE_SECRET_KEY=<stripe secret key>
STRIPE_WEBHOOK_SECRET=<stripe webhook signing secret>
STRIPE_PUBLISHABLE_KEY=<stripe publishable key>
VITE_STRIPE_PUBLIC_KEY=<stripe publishable key>
DAT_API_KEY=<dat api key>
TRUCKSTOP_API_KEY=<truckstop api key>
LOADBOARD_API_KEY=<loadboard api key>
SAMSARA_API_TOKEN=<samsara api token>
```

## Netlify production environment

```text
NEXT_PUBLIC_SITE_URL=https://www.infamousfreight.com
VITE_SITE_URL=https://www.infamousfreight.com
PUBLIC_SITE_URL=https://www.infamousfreight.com
VITE_API_URL=/api
```

## Netlify operational markers

Keep these status markers aligned with the current security decision state:

```text
NETLIFY_SECRET_ROTATION_STATUS=skipped
NETLIFY_SECRET_ROTATION_REQUIRED=false
NETLIFY_REDEPLOY_REQUIRED_AFTER_SECRET_ROTATION=false
NETLIFY_TEAM_MFA_ENFORCEMENT_REQUIRED=true
NETLIFY_PREVIEW_ACCESS_REVIEW_REQUIRED=true
```

## Netlify hardening tasks (still required)

- Enforce team MFA in Netlify (Team settings → Security / Members → Require MFA).
- Review preview deployment access policy and keep private previews restricted.
- Ensure backend-sensitive values are stored as secret/hidden variables where supported.

Prioritize secret visibility hardening for:

```text
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
LAUNCHDARKLY_SHARED_SECRET
LAUNCHDARKLY_SDK_KEY
STRIPE_ACCOUNT_ID
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
DATABASE_URL
PRISMA_DATABASE_URL
JWT_SECRET
SESSION_SECRET
SMTP_PASS
SENDGRID_API_KEY
RESEND_API_KEY
SAMSARA_API_KEY
```

## Fly.io API runtime secrets

Set with `flyctl secrets set` for app `infamous-freight-api`:

```text
SITE_URL=https://www.infamousfreight.com
PUBLIC_SITE_URL=https://www.infamousfreight.com
FRONTEND_URL=https://www.infamousfreight.com
CORS_ORIGIN=https://www.infamousfreight.com
API_PUBLIC_URL=https://infamous-freight-api.fly.dev
DATABASE_URL=<production postgres connection string>
```

Optional, depending on enabled integrations:

```text
SENTRY_DSN=<api sentry dsn>
STRIPE_ACCOUNT_ID=<stripe account id>
STRIPE_SECRET_KEY=<stripe secret key>
STRIPE_WEBHOOK_SECRET=<stripe webhook signing secret>
SUPABASE_URL=<supabase project url>
SUPABASE_SERVICE_ROLE_KEY=<supabase service role key>
SUPABASE_JWT_SECRET=<supabase jwt secret>
REDIS_URL=<redis connection string>
```

## Stripe Dashboard URLs

```text
Business website: https://www.infamousfreight.com
Webhook endpoint: https://www.infamousfreight.com/api/stripe/webhook
Checkout success URL: https://www.infamousfreight.com/billing/success
Checkout cancel URL: https://www.infamousfreight.com/billing/cancel
Customer portal return URL: https://www.infamousfreight.com/billing
```

## Supabase/Firebase auth URLs

```text
https://www.infamousfreight.com
https://www.infamousfreight.com/*
```

Keep bare-domain entries only for redirect compatibility if required.

## Verification

Run after every production deploy:

```bash
./scripts/production-smoke-test.sh
```

Expected:

- canonical frontend returns HTTP 200
- bare domain redirects to `https://www.infamousfreight.com/`
- Fly API health returns HTTP 200
- proxied API health returns HTTP 200

## Secret rotation policy

Rotate any secret that is pasted into chat, committed, exposed in logs, or shared outside the owning platform. Treat exposed secrets as compromised even if deleted afterward.
