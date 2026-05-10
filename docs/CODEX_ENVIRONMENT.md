# Codex Environment Setup

This document explains how to configure OpenAI Codex for the Infamous Freight repository without exposing sensitive values.

## What is already safe in the repo

The repository includes a safe example file and a safe environment checker:

- `.env.example` lists variable names and development placeholders only.
- `scripts/codex-env-check.sh` checks whether variables are present without printing secret values.
- `.gitignore` ignores local `.env` files while allowing checked-in example files.

Do not commit real `.env`, Stripe, Supabase, database, SendGrid, Sentry, or carrier API secret values.

## Required Codex environment variables

Add these in the Codex **Environment variables** section when Codex needs to build, test, or run the full app:

```env
NODE_ENV=development
DATABASE_URL=[POSTGRES_CONNECTION_STRING]
STRIPE_SECRET_KEY=[STRIPE_SECRET_KEY]
STRIPE_WEBHOOK_SECRET=[STRIPE_WEBHOOK_SECRET]
SUPABASE_URL=[SUPABASE_PROJECT_URL]
VITE_SUPABASE_URL=[SUPABASE_PROJECT_URL]
SUPABASE_SERVICE_ROLE_KEY=[SUPABASE_SERVICE_ROLE_KEY]
VITE_SUPABASE_ANON_KEY=[SUPABASE_ANON_KEY]
WEB_APP_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

The checker accepts either name in each one-of group:

```env
SUPABASE_SERVICE_KEY=[SUPABASE_SERVICE_ROLE_KEY]
# or
SUPABASE_SERVICE_ROLE_KEY=[SUPABASE_SERVICE_ROLE_KEY]

VITE_SUPABASE_PUBLISHABLE_KEY=[SUPABASE_PUBLISHABLE_OR_ANON_KEY]
# or
VITE_SUPABASE_ANON_KEY=[SUPABASE_ANON_KEY]

CORS_ORIGINS=http://localhost:5173
# or
CORS_ORIGIN=http://localhost:5173
```

## Recommended local development defaults

Use these non-secret values for local development:

```env
NODE_ENV=development
PORT=3001
WEB_APP_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
STRIPE_CHECKOUT_SUCCESS_URL=http://localhost:5173/billing/success
STRIPE_CHECKOUT_CANCEL_URL=http://localhost:5173/billing/cancel
STRIPE_PORTAL_RETURN_URL=http://localhost:5173/billing
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=ws://localhost:3001
```

Use test/dev keys for Stripe, Supabase, and database credentials. Do not use production credentials in local or experimental Codex environments unless the task explicitly requires production verification.

## Optional integration variables

Use these only when testing the related integrations:

```env
REDIS_HOST=[REDIS_HOST]
REDIS_PORT=6379
REDIS_PASSWORD=[REDIS_PASSWORD]
REDIS_DB=0
JWT_SECRET=[JWT_SECRET]
RATE_LIMIT_ENABLED=true
API_RATE_LIMIT_ENABLED=true
SENTRY_DSN=[SENTRY_DSN]
VITE_SENTRY_DSN=[PUBLIC_SENTRY_DSN]
VITE_SENTRY_ENABLED=true
SENTRY_ORG=[SENTRY_ORG]
SENTRY_PROJECT=[SENTRY_PROJECT]
SENTRY_AUTH_TOKEN=[SENTRY_AUTH_TOKEN]
DAT_API_KEY=[DAT_API_KEY]
TRUCKSTOP_API_KEY=[TRUCKSTOP_API_KEY]
LOADBOARD_API_KEY=[LOADBOARD_API_KEY]
SAMSARA_API_TOKEN=[SAMSARA_API_TOKEN]
MOTIVE_CLIENT_ID=[MOTIVE_CLIENT_ID]
MOTIVE_CLIENT_SECRET=[MOTIVE_CLIENT_SECRET]
QBO_CLIENT_ID=[QBO_CLIENT_ID]
QBO_CLIENT_SECRET=[QBO_CLIENT_SECRET]
XERO_CLIENT_ID=[XERO_CLIENT_ID]
XERO_CLIENT_SECRET=[XERO_CLIENT_SECRET]
SENDGRID_API_KEY=[SENDGRID_API_KEY]
FROM_EMAIL=[FROM_EMAIL]
RTS_API_KEY=[RTS_API_KEY]
OTR_API_KEY=[OTR_API_KEY]
APEX_API_KEY=[APEX_API_KEY]
```

## Secrets vs environment variables

Use **Environment variables** for values the app and tests need during the Codex task.

Use **Secrets** for one-time setup credentials only, such as package registry tokens or temporary install credentials.

Secrets may not be available to the Codex agent after setup, so do not put app runtime values there if tests or scripts need them.

## Safe verification command

Run this after saving the Codex environment:

```bash
pnpm run codex:env-check
```

For automation or preflight checks that should fail when required variables are missing, run:

```bash
pnpm run codex:env-check:strict
```

Or run the script directly:

```bash
bash scripts/codex-env-check.sh
bash scripts/codex-env-check.sh --strict
```

The script confirms whether variables are set and lists variable names only. It does not print secret values.

## Avoid unsafe commands

Do not run this in shared logs unless you are certain no secrets are present:

```bash
printenv | sort
```

That prints full environment variable values, including private keys.

## Recommended Codex flow

```bash
pnpm install --frozen-lockfile
pnpm run codex:env-check
pnpm run prisma:generate
pnpm run build
pnpm run test
```

Use strict mode before declaring the environment ready:

```bash
pnpm run codex:env-check:strict
```

If `pnpm run codex:env-check` reports a missing value, add it to the Codex environment and save the environment before running Codex again.
