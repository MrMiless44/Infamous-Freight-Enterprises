# Production Secrets Setup Runbook

Use this runbook to configure Infamous Freight production secrets without committing or exposing real credentials.

## Hard rules

- Do not paste real secrets into GitHub issues, pull requests, chat, screenshots, or logs.
- Do not commit `.env.production.secrets`.
- Add secret values directly through each platform secret manager or through the local bootstrap script.
- Rotate any secret that was exposed outside its owning platform.

## Platforms configured by the bootstrap script

The script `scripts/setup-production-secrets.sh` can write values to:

- GitHub Actions repository secrets
- Fly.io app secrets
- Netlify production environment variables

The script does **not** configure Stripe Dashboard URLs, Supabase Auth URLs, Sentry project settings, MFA policies, or provider-side webhooks. Those still require dashboard verification.

## Prerequisites

Install and authenticate the CLIs on a trusted local machine:

```bash
gh auth login
flyctl auth login
netlify login
```

Verify access:

```bash
gh repo view Infaemous-Freight/Infamous-freight
flyctl status --app infamous-freight-api
netlify status
```

## Create the local secrets file

```bash
cp .env.production.secrets.example .env.production.secrets
chmod 600 .env.production.secrets
```

Fill `.env.production.secrets` locally with production values from Fly.io, Netlify, Stripe, Supabase, Sentry, and provider dashboards.

## Dry run first

```bash
DRY_RUN=true bash scripts/setup-production-secrets.sh .env.production.secrets
```

The dry run must show the correct platforms and variable names without printing secret values.

## Apply secrets

```bash
bash scripts/setup-production-secrets.sh .env.production.secrets
```

If Netlify needs a site ID, set it explicitly:

```bash
NETLIFY_SITE_ID=<site-id> bash scripts/setup-production-secrets.sh .env.production.secrets
```


## Stripe production hardening checklist

Complete these after applying or rotating production secrets:

- [ ] Confirm all Stripe runtime values are stored as hidden/secret values in provider settings.
- [ ] Rotate any Stripe key or webhook signing secret previously entered as visible/plain-text.
- [ ] Re-add rotated values only via secret managers (never in git, comments, screenshots, or logs).
- [ ] Use a restricted live secret key for backend operations when endpoint compatibility allows.
- [ ] Ensure the frontend uses only `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
- [ ] Trigger a fresh Fly.io API deploy and a fresh Netlify production deploy after updates.

Required webhook events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Validation steps:

- [ ] Successful checkout.session and subscription activation path.
- [ ] Webhook delivery success for each required event type.
- [ ] Customer portal access from production billing UI.
- [ ] Failed payment flow updates access state correctly.

## Required dashboard checks

### Stripe

Confirm:

```text
Business website: https://www.infamousfreight.com
Webhook endpoint: https://www.infamousfreight.com/api/stripe/webhook
Checkout success URL: https://www.infamousfreight.com/billing/success
Checkout cancel URL: https://www.infamousfreight.com/billing/cancel
Customer portal return URL: https://www.infamousfreight.com/billing
```

### Supabase

Confirm:

```text
Site URL: https://www.infamousfreight.com
Redirect URLs:
https://www.infamousfreight.com
https://www.infamousfreight.com/*
```

Confirm the service role key is server-side only and the frontend uses only the publishable or anon key.

### Sentry

Confirm:

```text
SENTRY_ORG=infmous
SENTRY_PROJECT=infamous-freight
Frontend DSN is set in Netlify
Backend DSN is set in Fly.io if backend monitoring is enabled
Source map token is set in Netlify only
```

### Netlify security

Confirm:

- Team MFA is enforced.
- Preview deploy access is reviewed.
- Backend-sensitive values are hidden/secret where the platform supports it.

## Redeploy after secret changes

After applying secrets, redeploy both sides:

```bash
flyctl deploy --app infamous-freight-api
```

Trigger a fresh Netlify production deploy from the dashboard or via Netlify CLI.

## Verification

Run:

```bash
pnpm env:check:strict
pnpm run production:preflight
pnpm run production:smoke-test
curl -i https://www.infamousfreight.com
curl -i https://www.infamousfreight.com/api/health
curl -i https://infamous-freight-api.fly.dev/health
curl -i https://infamous-freight-api.fly.dev/api/health
```

Record evidence in:

- GitHub issue `#1781`
- GitHub issue `#1788`
- `docs/LAUNCH_EVIDENCE_LOG.md`

## Done means

- GitHub Actions `FLY_API_TOKEN` exists and deploy workflow authenticates.
- Fly.io app secrets are present and API health passes.
- Netlify production env vars are present and frontend builds from latest `main`.
- Stripe mode and webhook are verified.
- Supabase auth/database configuration is verified.
- Sentry receives a test frontend event if enabled.
- Production smoke test passes with evidence.
