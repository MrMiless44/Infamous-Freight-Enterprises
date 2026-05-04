# GitHub Copilot Custom Instructions — Infamous Freight

These instructions guide GitHub Copilot (chat, code completion, and the coding agent) when working in this repository. They encode the conventions used by human contributors so suggestions stay consistent with how this codebase actually ships.

> When these instructions conflict with an explicit user request in a chat or task, follow the user. Otherwise, prefer the conventions below.

---

## 1. Project overview

Infamous Freight is an AI-powered freight dispatch platform. It is a monorepo with two primary applications:

- `apps/api` — Express 4 / NestJS-style backend, Prisma + PostgreSQL, Socket.IO, Stripe billing.
- `apps/web` — React + Vite + TypeScript frontend, Tailwind CSS.

Supporting areas:

- `prisma/` (under `apps/api`) — database schema, migrations, seeds.
- `scripts/` — bash and Node helper scripts for env, deploy, smoke tests, validation.
- `docs/` — operational, architectural, and launch-readiness documentation (indexed by `docs/README.md`).
- `.github/workflows/` — CI/CD, CodeQL, smoke-test, release pipelines.
- `netlify.toml`, `fly.toml`, `Dockerfile`, `Dockerfile.api` — deployment configuration.

Production deployment: web is deployed to Netlify (`apps/web/dist`), API is deployed to Fly.io (`infamous-freight.fly.dev`) on port `8080`.

---

## 2. Tooling and runtime

- **Package manager: pnpm.** Use `pnpm install` and `pnpm`-prefixed scripts. Do **not** introduce `npm install` or `yarn` workflows. The `package-lock.json` exists as a documented dependency source-of-truth (see `docs/SBOM-POLICY.md`); the routinely refreshed workspace lockfile is `pnpm-lock.yaml`.
- **Node.js: `>=22.0.0 <23.0.0`** (see root `package.json` `engines`). Do not assume newer or older runtime features.
- **TypeScript** is used in both `apps/api` and `apps/web`. Prefer typed code; avoid `any` unless there is an existing pattern.
- **Workspaces** are declared as `apps/*` in the root `package.json`.

---

## 3. Local validation commands

When generating or modifying code, recommend (and, in the coding agent, run) the same commands contributors run locally. These are defined in the root `package.json` and `CONTRIBUTING.md`:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm -C apps/api exec tsc -p tsconfig.json --noEmit
pnpm -C apps/web exec tsc -p tsconfig.json --noEmit
pnpm -C apps/api run test:coverage
```

Optional aggregate validator:

```bash
pnpm run validate
```

Do not invent new lint, build, or test tooling. Reuse the existing scripts.

---

## 4. Branching, commits, PRs

Follow `CONTRIBUTING.md`:

- Branch from current `main`. Use prefixes: `feature/`, `fix/`, `docs/`, `chore/`, `security/`.
- Keep changes focused and minimal. Avoid drive-by refactors.
- Use **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `security:`).
- PRs should include: what changed, why, validation evidence, screenshots/logs when relevant, env/secret changes if any, and a linked issue when applicable.
- Production-impacting PRs must identify affected service, deployment workflow, required secrets, rollback plan, and smoke-test evidence.
- Squash merge; delete branches after merge.
- Do not revive stale Codex/Copilot branches — cherry-pick into a fresh branch from `main`.

---

## 5. Security and secrets

- **Never commit secrets**, tokens, private keys, credentials, `.env` files, or screenshots containing secrets. Use `.env.example` / `.env.production.example` as templates.
- **Pin third-party GitHub Actions to commit SHAs** (with a version comment), not floating tags like `@v4`. See existing workflows under `.github/workflows/` (e.g. `ci-cd.yml`, `codeql.yml`).
- Do not introduce new security vulnerabilities. If a change touches code with an existing vulnerability tightly coupled to your change, fix it in the same PR.
- Validate and sanitize all external input on the API. Preserve existing CORS, rate-limit, auth, and RLS patterns rather than working around them.
- Prefer audited admin tooling and runbooks (e.g. `docs/ADMIN_RECOVERY_RUNBOOK.md`) over direct database surgery.

---

## 6. Backend (`apps/api`) conventions

- HTTP layer is Express 4 with route handlers wired in `apps/api/src/app.ts`. Add new routes alongside existing groupings (e.g. billing under `/api/billing/*`).
- Database access is via **Prisma**. The schema is `apps/api/prisma/schema.prisma` and must keep `binaryTargets = ["native", "debian-openssl-1.1.x"]` for the Fly.io runtime.
- The runtime Docker image (`Dockerfile`) installs `openssl` via `apt-get`; do not remove this — it prevents `PrismaClientInitializationError` in production.
- Stripe one-time checkout uses env `STRIPE_PRICE_ONE_TIME` with legacy alias `STRIPE_PRICE_AI_ADDON_PACK` as fallback (see `apps/api/src/billing.ts`). Preserve both when touching billing code.
- Tests live under `apps/api/test` and `apps/api/src/**/__tests__`. Use the existing Jest config (`apps/api/jest.config.js`). Do not delete or weaken tests to make a change pass.
- Logs and errors should follow existing helpers; do not introduce ad-hoc `console.log` calls in request paths if a logger pattern exists nearby.

---

## 7. Frontend (`apps/web`) conventions

- React + Vite + TypeScript. Components live under `apps/web/src/`. Styling uses Tailwind CSS.
- Routing/pages follow the existing structure under `apps/web/src/pages/` and `apps/web/src/components/`.
- The billing settings UI at `/settings` is API-wired: it fetches `/api/billing/status` and opens the Stripe customer portal. Reuse the existing `BillingSettingsPanel` and `paywall.ts` helpers rather than reimplementing.
- Vite build output is `apps/web/dist`, which Netlify publishes. Netlify SPA fallback redirects to `/index.html`; `/api/*` and `/socket.io/*` are proxied to the Fly API. Do not break these paths.

---

## 8. Deployment guardrails

- `netlify.toml` must keep 301 redirects from `https://infamousfreight.com/*` and `https://infamous-freight.netlify.app/*` to `https://www.infamousfreight.com/:splat` (smoke tests assert this canonical URL).
- `fly.toml` sets `PORT=8080` and `http_service.internal_port=8080` for the `infamous-freight` app — keep them in sync.
- The Smoke Test workflow writes a markdown evidence table to `$GITHUB_STEP_SUMMARY` and fails on aggregated `OVERALL_STATUS`. Don’t suppress its output.

---

## 9. Documentation

- `docs/README.md` is the categorized navigation index for `docs/`. **When you add a new doc under `docs/`, also add a link in the appropriate section of `docs/README.md`.** Update or remove entries when archiving docs.
- Keep documentation changes tightly scoped to the code change. Don’t mass-rewrite unrelated docs.
- Top-level operational references contributors expect to remain stable: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `DEPLOYMENT_CHECKLIST.md`, `ENVIRONMENT_VARIABLES_COMPLETE.md`.

---

## 10. Coding agent behavior

When acting as the coding agent:

1. Read the relevant files before editing; understand existing patterns.
2. Make the **smallest correct change** that fully addresses the task. A complete solution is preferred over a minimal one, but do not modify unrelated code.
3. Run the existing lint/typecheck/test commands from §3 before reporting completion. Do not add new linting/testing tooling unless the task requires it.
4. Do not weaken, delete, or skip existing tests to make CI pass. Fix the underlying issue.
5. Do not push directly with `git push` or `gh`. Use the provided progress/PR tooling.
6. Prefer existing libraries and helpers over adding new dependencies. If a new dependency is required, justify it and check the GitHub advisory database before adding.
7. Respect the security and deployment guardrails above (§5, §8) — they exist because production has been broken by violating them before.

---

_Last reviewed: maintained alongside `CONTRIBUTING.md` and `docs/README.md`. Update this file when conventions change._
