# GitHub Copilot Custom Instructions — Infamous Freight

These instructions guide GitHub Copilot, coding agents, and automation agents when working in this repository. They encode the conventions used by human contributors so suggestions stay consistent with how this codebase actually ships.

> When these instructions conflict with an explicit user request in a chat or task, follow the user unless the request would weaken security, commit sensitive material, bypass required verification, or create unsafe automation.

---

## 1. Project overview

Infamous Freight is a freight and logistics operations platform. It is a monorepo with two primary applications:

- `apps/api` — Express API, Prisma + PostgreSQL, Socket.IO, Stripe billing, and operational backend workflows.
- `apps/web` — React + Vite + TypeScript frontend, Tailwind CSS, public lead capture, service pages, quote flow, and operator-facing surfaces.

Supporting areas:

- `apps/api/prisma/` — database schema, migrations, and seeds.
- `scripts/` — bash and Node helper scripts for env, deploy, smoke tests, validation, and operations.
- `docs/` — operational, architectural, and launch-readiness documentation indexed by `docs/README.md`.
- `.github/workflows/` — CI/CD, CodeQL, automation, smoke-test, and release pipelines.
- `netlify.toml`, `fly.toml`, `Dockerfile`, `Dockerfile.api` — deployment configuration.

Production deployment: web deploys to Netlify from `apps/web/dist`; the API deploys to Fly.io. Same-origin public browser API traffic should keep using `/api/*` proxy paths.

---

## 2. Execution loop

Use this loop for all work:

```text
Discover → Build → Verify → Optimize → Scale
```

Before finishing any task, report:

- What changed
- Files changed
- Commands run and results
- Risks remaining
- Rollback or fallback steps
- Next 3 moves

---

## 3. Sprint 1 public-site guardrails

Sprint 1 refocused the public experience on lead capture, quote reliability, service clarity, and safer public claims. Preserve these choices unless explicitly instructed otherwise.

- Keep the public quote API path `/api/public/quote-requests`.
- Keep Netlify Forms fallback behavior for public quote capture.
- Keep the first quote screen focused on core lead data: origin, destination, equipment or service type, pickup timing, contact name, phone, and email.
- Keep freight details such as weight, dimensions, delivery timing, lane miles, documents, and notes optional later in the quote flow.
- If the quote API fails but Netlify Forms succeeds, show a success state even without an API tracking reference.
- If both quote API and Netlify Forms fail, show a direct dispatch email fallback.
- Keep primary public navigation focused on Services, Request Quote, Track Shipment, Carriers, About, and Contact.
- Keep secondary routes available where applicable, but do not over-promote login, portals, load board, pricing, Product Hunt, or case-study style routes in the primary public navigation.
- Do not add a public phone CTA unless a verified public phone number is found in project-controlled sources.
- Keep public email links clickable using `mailto:` where appropriate.

---

## 4. Public claims and copy rules

Do not invent, restore, or strengthen unverified public claims. Avoid unverified claims about:

- FMCSA checks
- Active insurance
- Safety scores
- QuickPay
- Same-day payment
- Exact on-time rates
- Carrier counts
- Brokerage status
- Fake testimonials
- Exact performance metrics

Prefer process-based trust language:

- Carrier documents reviewed before dispatch
- Shipment details verified before booking
- Payment terms confirmed in writing
- Clear communication from quote to delivery

Public copy and SEO should align with real freight and logistics services, not unsupported claims that the homepage is primarily an AI freight operating system.

---

## 5. Service catalog and SEO

- Keep public service-page data consolidated in the TypeScript service catalog.
- Do not reintroduce duplicate TSX service catalog data.
- Keep service coverage and SEO metadata accurate for full truckload, LTL, flatbed, reefer, expedited, dedicated lanes, freight brokerage, final mile, box truck, cargo van, sprinter van, local freight, regional freight, and freight dispatch.
- Keep sitemap entries aligned with public pages linked from the homepage and services index.
- Confirm Open Graph assets before referencing them.

---

## 6. Tooling and runtime

- Package manager: pnpm. Use `pnpm install` and `pnpm`-prefixed scripts. Do not introduce npm or yarn workflows.
- Node.js: `>=22.0.0 <23.0.0` from root `package.json` engines.
- TypeScript is used in both `apps/api` and `apps/web`. Prefer typed code and avoid `any` unless matching an existing pattern.
- Workspaces are declared in the root `package.json`.

---

## 7. Preferred validation commands

Use the narrowest useful checks first, then broaden before merge or release.

```bash
pnpm -C apps/web run typecheck
pnpm -C apps/web run lint
pnpm -C apps/web run build
pnpm run validate
```

For backend, shared code, auth, billing, database, quote, or dispatch changes, run the relevant API and workspace tests.

Do not invent new lint, build, or test tooling. Reuse existing scripts.

---

## 8. Branching, commits, PRs

- Branch from current `main`.
- Use prefixes: `feature/`, `fix/`, `docs/`, `chore/`, `security/`.
- Keep changes focused and minimal. Avoid drive-by refactors.
- Use Conventional Commits such as `feat:`, `fix:`, `docs:`, `chore:`, and `security:`.
- PRs should include what changed, why, validation evidence, screenshots/logs when relevant, environment changes if any, and a linked issue when applicable.
- Production-impacting PRs must identify the affected service, deployment workflow, required configuration, rollback plan, and smoke-test evidence.
- Do not revive stale Codex/Copilot branches. Cherry-pick into a fresh branch from `main`.

---

## 9. Security and automation

- Never commit secrets, API keys, tokens, private keys, credentials, `.env` files, or screenshots containing sensitive material.
- Use repository or organization secrets for sensitive runtime configuration.
- Keep GitHub Actions permissions least-privilege and explicit.
- Pin third-party GitHub Actions to commit SHAs when practical, matching existing workflow style.
- Use bounded GitHub Actions only. Do not create infinite workers, unsafe loops, auto-merge bypasses, or workflows that expose secrets to untrusted PRs.
- Use `ubuntu-latest` GitHub-hosted runners first. Do not add self-hosted or paid runners unless explicitly approved.
- Do not use `pull_request_target` unless there is a clear security reason and no untrusted code execution.
- Do not bypass Full Validation, CodeQL, branch protection, or required reviews.
- Validate and sanitize all external input on the API. Preserve existing CORS, rate-limit, auth, and role/tenant patterns rather than working around them.
- Prefer audited admin tooling and runbooks over direct database surgery.

---

## 10. Backend conventions

- HTTP routes are wired through the existing API structure. Add new routes alongside existing groupings.
- Database access is via Prisma. Keep production runtime compatibility when touching Prisma or Docker configuration.
- Preserve Stripe checkout, portal, webhook, and payment-tracking behavior when touching billing code.
- Tests live under existing API test locations and should not be deleted or weakened to make a change pass.
- Follow nearby logging and error-handling helpers. Avoid ad-hoc request-path logs when a pattern exists.

---

## 11. Frontend conventions

- React + Vite + TypeScript. Components live under `apps/web/src/`. Styling uses Tailwind CSS.
- Routing/pages follow the existing structure under `apps/web/src/pages/` and `apps/web/src/components/`.
- Vite build output is `apps/web/dist`, which Netlify publishes.
- Preserve Netlify SPA fallback and API proxy paths.
- Quote, contact, service, and public SEO changes should keep Sprint 1 guardrails in this file.

---

## 12. Deployment guardrails

- Preserve canonical host redirects and public API proxy behavior in Netlify configuration.
- Keep Fly.io runtime port configuration consistent across Fly and app configuration.
- Do not suppress smoke-test or validation output.
- Use deployment docs and existing scripts before changing production deploy behavior.

---

## 13. Documentation

- `docs/README.md` is the categorized navigation index for docs. When adding a new doc under `docs/`, add a link in the appropriate section.
- Keep documentation changes tightly scoped to the code change.
- Keep top-level operational references stable: `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, deployment docs, and environment references.

---

## 14. Coding agent behavior

When acting as a coding agent:

1. Read relevant files before editing.
2. Make the smallest correct change that fully addresses the task.
3. Run relevant validation before reporting completion.
4. Do not weaken, delete, or skip existing tests to make CI pass.
5. Prefer existing libraries and helpers over adding dependencies.
6. If a new dependency is required, justify it and check advisories first.
7. If owner/admin UI actions are required, state exactly what cannot be done from code and provide exact manual steps.

---

_Last reviewed after Sprint 1 public lead-capture and automation hardening work._
