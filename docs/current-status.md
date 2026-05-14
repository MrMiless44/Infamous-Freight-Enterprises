# Current status

Updated 2026-05-14.

This file is the runtime and launch-readiness source of truth. Marketing, README, launch, and operations docs should defer to this document when they describe what is live now versus demo-backed or planned.

## Overall launch posture

**Status: Yellow / controlled recovery.**

The canonical repository, web/API architecture, and main validation path are stabilizing. Public intake and several authenticated operator surfaces are available, but some authenticated routes are still demo-backed or blocked until production data sources and workflows are verified end-to-end.

## Active runtime

- `apps/api` is the active backend runtime.
- Fly.io, Docker, and the API server are aligned on port `3000`.
- Netlify serves the web app and proxies same-origin `/api/*` traffic to Fly.io.
- Supabase project `Infæmous` is active and healthy.
- Stripe account `INFAMOUS FREIGHT` is connected in live mode; latest check showed zero available balance, zero pending balance, no disputes, no invoices, and no subscriptions returned.

## Route readiness

| Route | Status | Operator guidance |
|---|---|---|
| `/ops` | Demo-backed | Use for demos and operator orientation. Verify live load, driver, and invoice data before treating it as the production source of truth. |
| `/loads` | Live | Use after confirming the current tenant, carrier, and assignment records are present in production. |
| `/dispatch` | Demo-backed | Do not treat this as the final dispatcher board until live assignment and status feeds are verified end-to-end. |
| `/drivers` | Live | Use for verified carrier-scoped driver records only. |
| `/invoices` | Demo-backed | Do not rely on this page as the final accounting ledger until Stripe, invoice, and accounting exports are reconciled. |
| `/analytics` | Demo-backed | Use for trend demos only until production metric sources are verified. |
| `/compliance` | Not ready | Use manual compliance checks and verified document workflows until this route is promoted. |
| `/settings` | Live | Use carefully; verify environment-backed integrations before changing production configuration. |
| `/billing` | Live | Confirm the active Stripe account, mode, plans, and webhook health before collecting real customer payments. |
| `/carriers` | Live | Use only with verified carrier onboarding and payment status records. |
| `/accounting` | Not ready | Keep accounting reconciliation outside the app until exports and third-party accounting sync are verified. |
| `/quotes` | Live | Use with manual rate confirmation before committing freight pricing. |
| `/messages` | Demo-backed | Use only after confirming participants, permissions, and notification behavior in the current environment. |
| `/driver-app` | Not ready | Use existing driver communication and tracking procedures until this route is promoted. |

The app enforces this readiness map through `RouteReadinessGate` so demo-backed routes display visible warnings and not-ready routes are blocked with operator guidance.

## Still being hardened

- Some operator-facing views still contain sample data.
- The main dashboard sample data should be replaced with live API-backed services.
- Demo-backed authenticated routes must not be presented as production-ready.
- Supabase Security Advisor still needs follow-up for leaked-password protection and any remaining function/RLS warnings after migrations are applied through the normal deployment path.
- Supabase Performance Advisor still reports RLS initplan, multiple permissive policy, and unused-index warnings that need a measured cleanup pass.
- Fortify AST Scan failed on the latest checked merged commit and must be reviewed before claiming all security checks are green.

## Blocked / owner-action items

- Sign, reject, or renegotiate the pending DocuSign financing package only after confirming LLC transition and repayment terms.
- Confirm Fly production secrets and deploy health through the normal deployment workflow.
- Apply the remaining Supabase hardening migration through the approved database migration path; direct live mutation was intentionally not forced from chat.

## Verification

Run locally or in CI:

- `pnpm install --frozen-lockfile`
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run prisma:validate`
- `pnpm run build`
- `pnpm run test`
- `pnpm run production:smoke-test`

Production checks should include:

- `https://www.infamousfreight.com`
- `https://infamousfreight.com` redirecting to the `www` host
- `https://www.infamousfreight.com/api/health`
- `https://www.infamousfreight.com/api/health/live`
- `https://www.infamousfreight.com/api/health/ready`
- Fly API health and logs after deploy
