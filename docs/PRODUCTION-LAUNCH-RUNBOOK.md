# Production Launch Runbook

This runbook covers the final production steps for Infamous Freight after the frontend is live and the API deployment is still blocked.

## Clone the repository

Use one of these commands from your workstation or deployment box:

```bash
gh repo clone Infamous-Freight/Infamous-freight
```

or:

```bash
git clone git@github.com:Infamous-Freight/Infamous-freight.git
```

or:

```bash
git clone https://github.com/Infamous-Freight/Infamous-freight.git
```

Then enter the repo:

```bash
cd Infamous-freight
```

## Canonical production website

Use this as the main and only production website URL across every platform:

```text
https://www.infamousfreight.com
```

The bare domain must redirect to the canonical host:

```text
https://infamousfreight.com -> https://www.infamousfreight.com
```

## Current production architecture

- Frontend: Netlify, `https://www.infamousfreight.com`
- API app: Fly.io, `infamous-freight-api`
- Fly API URL: `https://infamous-freight-api.fly.dev`
- Frontend API base URL: `/api`
- Netlify API proxy target: `https://infamous-freight-api.fly.dev/api/:splat`

## Required production environment values

### Netlify

```text
NEXT_PUBLIC_SITE_URL=https://www.infamousfreight.com
VITE_SITE_URL=https://www.infamousfreight.com
PUBLIC_SITE_URL=https://www.infamousfreight.com
VITE_API_URL=/api
```

Netlify status markers:

```text
NETLIFY_SECRET_ROTATION_STATUS=skipped
NETLIFY_SECRET_ROTATION_REQUIRED=false
NETLIFY_REDEPLOY_REQUIRED_AFTER_SECRET_ROTATION=false
NETLIFY_TEAM_MFA_ENFORCEMENT_REQUIRED=true
NETLIFY_PREVIEW_ACCESS_REVIEW_REQUIRED=true
```

### GitHub Actions

```text
FLY_API_TOKEN=<rotated Fly deploy token>
SITE_URL=https://www.infamousfreight.com
PUBLIC_SITE_URL=https://www.infamousfreight.com
VITE_SITE_URL=https://www.infamousfreight.com
NEXT_PUBLIC_SITE_URL=https://www.infamousfreight.com
VITE_API_URL=/api
```

### Fly.io

Set these from an authenticated shell:

```bash
flyctl secrets set \
  SITE_URL="https://www.infamousfreight.com" \
  PUBLIC_SITE_URL="https://www.infamousfreight.com" \
  FRONTEND_URL="https://www.infamousfreight.com" \
  CORS_ORIGIN="https://www.infamousfreight.com" \
  API_PUBLIC_URL="https://infamous-freight-api.fly.dev" \
  --app infamous-freight-api
```

Or run the repo helper after cloning:

```bash
chmod +x scripts/production-canonical-env.sh
./scripts/production-canonical-env.sh
```

### Stripe

Configure Dashboard-hosted URLs to use the canonical domain:

```text
Business website: https://www.infamousfreight.com
Webhook endpoint: https://www.infamousfreight.com/api/stripe/webhook
Checkout success URL: https://www.infamousfreight.com/billing/success
Checkout cancel URL: https://www.infamousfreight.com/billing/cancel
Customer portal return URL: https://www.infamousfreight.com/billing
```

### Supabase and Firebase

Use the canonical host for auth redirects and authorized domains:

```text
https://www.infamousfreight.com
https://www.infamousfreight.com/*
```

Keep bare-domain URLs only as redirect compatibility entries if required.

## Security first

A Fly token was previously exposed in chat. Treat it as compromised.

Required actions:

1. Revoke the exposed Fly token.
2. Create a new Fly deploy token.
3. Add the new token to GitHub Actions secrets as `FLY_API_TOKEN`.
4. Do not paste deploy tokens into chat, commit history, issue comments, logs, or docs.

## GitHub secret setup

Go to:

```text
GitHub repository -> Settings -> Secrets and variables -> Actions -> New repository secret
```

Create:

```text
Name: FLY_API_TOKEN
Value: new rotated Fly deploy token
```

## Deploy API

Go to:

```text
GitHub repository -> Actions -> Deploy Fly API -> Run workflow
```

The workflow deploys the API to Fly app `infamous-freight-api` and checks:

```text
https://infamous-freight-api.fly.dev/api/health
```

## Redeploy frontend

After confirming the API deploy, redeploy the Netlify frontend so production uses the current env configuration.

Go to:

```text
Netlify -> infamousfreight project -> Deploys -> Trigger deploy -> Deploy site
```

To update Netlify marker variables from an authenticated shell:

```bash
chmod +x scripts/netlify-update-security-markers.sh
./scripts/netlify-update-security-markers.sh
```

## Smoke test

Go to:

```text
GitHub repository -> Actions -> Smoke Test -> Run workflow
```

Or run manually after cloning:

```bash
chmod +x scripts/production-smoke-test.sh
./scripts/production-smoke-test.sh
```

Or run the raw curl checks:

```bash
curl -i https://www.infamousfreight.com
curl -i https://infamousfreight.com
curl -i https://infamous-freight-api.fly.dev/health
curl -i https://infamous-freight-api.fly.dev/api/health
curl -i https://www.infamousfreight.com/api/health
```

Expected result:

```text
https://www.infamousfreight.com returns HTTP 200.
https://infamousfreight.com redirects to https://www.infamousfreight.com.
Fly API health returns HTTP 200.
Proxied API health returns HTTP 200.
```

Latest manual check (2026-04-28 UTC):

```bash
curl -I https://www.infamousfreight.com
```

Observed status: HTTP 200 OK.

Manual production verification checklist (record this in launch evidence before closing readiness issues):

- Homepage loads (`https://www.infamousfreight.com`).
- Quote form submits successfully.
- Login/auth flow works (if enabled for production).
- API routes respond without errors.
- No Supabase connection errors in logs.
- No Netlify function errors in logs.

GitHub issue update note for stale "secret rotation required" tracking:

```text
Supabase is connected. Secret rotation was intentionally skipped. Netlify markers should be set to skipped/not required. Production verification remains required after any environment marker update.
```

## Launch gate

Do not mark production ready until all of these pass:

- `https://www.infamousfreight.com` returns HTTP 200.
- `https://infamousfreight.com` redirects to `https://www.infamousfreight.com`.
- `https://infamous-freight-api.fly.dev/health` returns HTTP 200.
- `https://infamous-freight-api.fly.dev/api/health` returns HTTP 200.
- `https://www.infamousfreight.com/api/health` returns HTTP 200.

## Rollback

If API deployment fails:

1. Check GitHub Actions logs for the `Deploy Fly API` workflow.
2. Check Fly app logs from a trusted shell:

```bash
flyctl logs --app infamous-freight-api
flyctl status --app infamous-freight-api
flyctl machines list --app infamous-freight-api
```

3. Confirm required runtime env vars exist in Fly, especially `DATABASE_URL`.
4. Do not launch until the health endpoints are stable.
