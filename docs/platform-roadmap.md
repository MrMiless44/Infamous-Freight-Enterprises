# Infamous Freight — Platform Roadmap

A phased plan for building Infamous Freight forward from the current monorepo. This roadmap is intentionally short and outcome-oriented; each phase points at concrete code areas already present in the repo.

> Stack reminder: pnpm monorepo with `apps/api` (Express 4 + Prisma + PostgreSQL + Socket.IO + Stripe) and `apps/web` (React + Vite + TypeScript + Tailwind). See [`README.md`](../README.md) and [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Phase 1 — Branding

Lock down visual and verbal identity across the web app and public surfaces.

- Apply the brand palette, typography, and logo treatment in `apps/web`.
- Ensure marketing/header assets in [`docs/screenshots/`](./screenshots) and [`docs/branding/`](./branding) stay consistent with what ships in the UI.
- Confirm the Netlify-served site at `https://www.infamousfreight.com` reflects the brand (apex + `*.netlify.app` already 301 to the canonical URL via [`netlify.toml`](../netlify.toml)).

Detailed actions: [`phase-1-branding-plan.md`](./phase-1-branding-plan.md).

## Phase 2 — Verify local setup

Make sure every contributor can boot the full stack locally before adding features.

- Follow [`local-setup.md`](./local-setup.md).
- Run the standard validation gate from [`CONTRIBUTING.md`](../CONTRIBUTING.md):
  - `pnpm install --frozen-lockfile`
  - `pnpm run lint`
  - `pnpm -C apps/api exec tsc -p tsconfig.json --noEmit`
  - `pnpm -C apps/web exec tsc -p tsconfig.json --noEmit`
  - `pnpm -C apps/api run test:coverage`
- Confirm the API serves on `:3001` locally and the web app on Vite's dev server.

## Phase 3 — Core freight workflows

Iterate on the existing domain surfaces in the monorepo:

- **Dispatch** — assignment flows, driver communication via Socket.IO.
- **Customers, carriers, loads** — CRUD and lifecycle in `apps/api` + matching pages/components in `apps/web/src`.
- **Documents** — BOL, rate confirmations, invoices.
- **Tracking & ETA visibility** — real-time updates wired through Socket.IO.
- **Routing** — load-stop sequencing and basic optimization hooks.

Reference: [`API-REFERENCE.md`](./API-REFERENCE.md), [`API_ROUTE_MAP.md`](./API_ROUTE_MAP.md), [`ARCHITECTURE_SOURCE_OF_TRUTH.md`](./ARCHITECTURE_SOURCE_OF_TRUTH.md).

## Phase 4 — AI logistics

Layer AI features on top of the verified core:

- Load matching and rate suggestions.
- Negotiation assistance and broker intelligence.
- Document understanding (BOL/POD parsing).
- Anomaly detection on tracking and compliance signals.

Keep AI features behind feature flags / paywall where appropriate — see [`PAYWALL.md`](./PAYWALL.md) and the billing UI in `apps/web/src/components/billing/BillingSettingsPanel.tsx`.

## Phase 5 — Launch & operations

When the above is stable, follow the existing launch and ops tracks:

- [`LAUNCH-READINESS-CHECKLIST.md`](./LAUNCH-READINESS-CHECKLIST.md)
- [`PRODUCTION-LAUNCH-RUNBOOK.md`](./PRODUCTION-LAUNCH-RUNBOOK.md)
- [`ROLLBACK_PLAN.md`](./ROLLBACK_PLAN.md)

---

## Working principles

- Keep `main` stable. Branch with `feature/`, `fix/`, `docs/`, `chore/`, or `security/` prefixes per [`CONTRIBUTING.md`](../CONTRIBUTING.md).
- Don't weaken or delete tests to make CI pass — fix the underlying issue.
- Pin third-party GitHub Actions to commit SHAs (existing convention in [`.github/workflows/`](../.github/workflows/)).
- Don't commit secrets; use `.env.example` and `.env.production.example` as templates.
