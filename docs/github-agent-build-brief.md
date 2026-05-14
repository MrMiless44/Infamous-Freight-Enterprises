# Infamous Freight — GitHub Agent Build Brief

Short brief for the GitHub Copilot coding agent (or any contributor) when picking up Infamous Freight work. This document is intentionally narrow: it tells the agent **what to optimize for**, **what not to touch**, and **where to look first**. For full conventions, the canonical source is [`.github/copilot-instructions.md`](../.github/copilot-instructions.md) and [`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## Mission

Build Infamous Freight forward — a freight dispatch platform — by iterating on the existing pnpm monorepo:

- `apps/api` — Express 5 + Prisma + PostgreSQL + Socket.IO + Stripe.
- `apps/web` — React + Vite + TypeScript + Tailwind.

Current direction (see [`platform-roadmap.md`](./platform-roadmap.md)):

1. **Phase 1 — Branding** ([`phase-1-branding-plan.md`](./phase-1-branding-plan.md)).
2. **Verify local setup** ([`local-setup.md`](./local-setup.md)).
3. **Freight workflows** — dispatch, customers, carriers, loads, documents, tracking, routing.
4. **AI logistics** behind paywall / feature flags.

## Optimize for

- **Smallest correct change** that fully addresses the task.
- Existing patterns: route groupings in `apps/api/src/app.ts`, billing helpers in `apps/api/src/billing.ts`, billing UI helpers in `apps/web/src/lib/paywall.ts` and `BillingSettingsPanel.tsx`.
- Reuse existing libraries; don't add dependencies casually. If you must, justify it and check the GitHub Advisory Database first.
- Tests: Jest in `apps/api/test` and `apps/api/src/**/__tests__`; Vitest in `apps/web/src/**/__tests__`.

## Don't touch unless intentional

- `netlify.toml` 301 redirects from `infamousfreight.com/*` and `infamous-freight.netlify.app/*` to `https://www.infamousfreight.com/:splat` (smoke tests assert this).
- `fly.toml` `PORT=3000` and `http_service.internal_port=3000` for the `infamous-freight-api` app.
- Prisma schema `binaryTargets = ["native", "debian-openssl-1.1.x"]`.
- `Dockerfile` runtime stage installing `openssl` via `apt-get`.
- Stripe billing env aliases: `STRIPE_PRICE_ONE_TIME` with legacy fallback `STRIPE_PRICE_AI_ADDON_PACK`.
- Pinned commit SHAs for third-party GitHub Actions in `.github/workflows/`.
- Existing tests — don't delete or weaken them to make CI pass.

## Required validation before reporting done

From the repo root:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm -C apps/api exec tsc -p tsconfig.json --noEmit
pnpm -C apps/web exec tsc -p tsconfig.json --noEmit
pnpm -C apps/api run test:coverage
```

If the change touches the web app, also run:

```bash
pnpm -C apps/web run test
```

## PR conventions

- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `security:`).
- Branch prefixes: `feature/`, `fix/`, `docs/`, `chore/`, `security/`.
- Squash merge; delete branch after merge.
- Don't revive stale Codex/Copilot branches — cherry-pick into a fresh branch from `main`.
- For production-impacting PRs, identify affected service, deployment workflow, required secrets, rollback plan, and smoke-test evidence.

## Security floor

- No committed secrets; use `.env.example` / `.env.production.example`.
- Validate and sanitize external input on the API; preserve CORS, rate-limit, auth, and RLS patterns.
- Don't introduce new vulnerabilities; fix vulnerabilities that are tightly coupled to lines you change.
- Prefer audited admin tooling over direct DB surgery (see [`ADMIN_RECOVERY_RUNBOOK.md`](./ADMIN_RECOVERY_RUNBOOK.md)).

## Where to look first

- Architecture: [`ARCHITECTURE.md`](./ARCHITECTURE.md), [`ARCHITECTURE_SOURCE_OF_TRUTH.md`](./ARCHITECTURE_SOURCE_OF_TRUTH.md).
- API: [`API-REFERENCE.md`](./API-REFERENCE.md), [`API_ROUTE_MAP.md`](./API_ROUTE_MAP.md).
- Launch: [`LAUNCH_READINESS_INDEX.md`](./LAUNCH_READINESS_INDEX.md).
- Ops: [`PRODUCTION-LAUNCH-RUNBOOK.md`](./PRODUCTION-LAUNCH-RUNBOOK.md), [`ROLLBACK_PLAN.md`](./ROLLBACK_PLAN.md).
- Env: [`ENVIRONMENT_VARIABLES_COMPLETE.md`](../ENVIRONMENT_VARIABLES_COMPLETE.md).
