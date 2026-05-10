# Infamous Freight — Customization Checklist

A practical checklist for customizing the platform — branding, environment, and integrations — without breaking deployment guardrails.

> Use this together with [`platform-roadmap.md`](./platform-roadmap.md) and [`local-setup.md`](./local-setup.md).

---

## Branding (`apps/web`)

- [ ] Logo and header art in [`docs/screenshots/`](./screenshots) match what's shipped in `apps/web/src`.
- [ ] Tailwind theme tokens (colors, fonts) in `apps/web/tailwind.config.*` reflect the brand palette.
- [ ] Public site title, meta description, and Open Graph tags in `apps/web/index.html` are correct.
- [ ] Favicons / app icons under `apps/web/public/` are updated.
- [ ] Email and notification templates referenced in `apps/api` use the correct brand voice.

Detailed plan: [`phase-1-branding-plan.md`](./phase-1-branding-plan.md). Brand assets index: [`branding/README.md`](./branding/README.md).

## Environment & secrets

- [ ] `.env` populated from [`.env.example`](../.env.example).
- [ ] Production secrets configured per [`PRODUCTION-SECRETS-CHECKLIST.md`](./PRODUCTION-SECRETS-CHECKLIST.md).
- [ ] No secrets committed; `.env*` files remain in `.gitignore`.
- [ ] Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_PRICE_ONE_TIME`, legacy `STRIPE_PRICE_AI_ADDON_PACK`) set — see [`STRIPE-SETUP.md`](./STRIPE-SETUP.md).
- [ ] Sentry DSN and observability hooks set (`SENTRY_DSN`).
- [ ] Full matrix reviewed in [`ENVIRONMENT_VARIABLES_COMPLETE.md`](../ENVIRONMENT_VARIABLES_COMPLETE.md).

## Domain & hosting

- [ ] Custom domain configured per [`CUSTOM-DOMAIN.md`](./CUSTOM-DOMAIN.md).
- [ ] [`netlify.toml`](../netlify.toml) keeps the 301 redirects from `infamousfreight.com/*` and `infamous-freight.netlify.app/*` to `https://www.infamousfreight.com/:splat` (smoke tests assert this).
- [ ] [`fly.toml`](../fly.toml) keeps `PORT=8080` and `http_service.internal_port=8080` aligned for the `infamous-freight` app.
- [ ] Netlify build hooks reviewed: [`NETLIFY-BUILDHOOKS.md`](./NETLIFY-BUILDHOOKS.md).

## Database & Prisma

- [ ] Schema changes go through `apps/api/prisma/schema.prisma` + a Prisma migration; never hand-edit `migrations/`.
- [ ] `binaryTargets = ["native", "debian-openssl-1.1.x"]` preserved in the schema.
- [ ] Backups verified: [`BACKUP_RESTORE_VERIFICATION.md`](./BACKUP_RESTORE_VERIFICATION.md).

## Billing & paywall

- [ ] `/settings` billing panel still wires through `/api/billing/status` and the Stripe customer portal (see `apps/web/src/components/billing/BillingSettingsPanel.tsx`).
- [ ] Paywall behavior unchanged unless intentionally updated: [`PAYWALL.md`](./PAYWALL.md).
- [ ] Webhook verification still passes: [`STRIPE_WEBHOOK_VERIFICATION.md`](./STRIPE_WEBHOOK_VERIFICATION.md).

## CI / Workflows

- [ ] Any new third-party GitHub Action is pinned to a commit SHA (with a version comment), per existing convention in `.github/workflows/`.
- [ ] Smoke Test workflow output (`$GITHUB_STEP_SUMMARY` table, `OVERALL_STATUS`) is not suppressed.
- [ ] CodeQL workflow remains green.

## Documentation

- [ ] New docs added under `docs/` are also linked from [`docs/README.md`](./README.md).
- [ ] Changes to top-level operational docs (`README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `DEPLOYMENT_CHECKLIST.md`, `ENVIRONMENT_VARIABLES_COMPLETE.md`) are deliberate and minimal.

## Pre-launch sanity

- [ ] Lint, typecheck, and tests pass locally (see [`local-setup.md`](./local-setup.md) §5).
- [ ] [`LAUNCH-READINESS-CHECKLIST.md`](./LAUNCH-READINESS-CHECKLIST.md) walked through.
- [ ] Rollback plan reviewed: [`ROLLBACK_PLAN.md`](./ROLLBACK_PLAN.md).
