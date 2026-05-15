# Agent Operating Guide

This repository is configured for AI-assisted development. Use this guide before making changes so agents, maintainers, and automation all follow the same safe loop.

## Primary repo

- Repository: `Infaemous-Freight/Infamous-freight`
- Default branch: `main`
- Package manager: `pnpm`
- Runtime: Node.js 22
- App layout: pnpm monorepo

## Mission

Infamous Freight is an AI-driven freight operations platform covering dispatch execution, shipment visibility, driver coordination, compliance workflows, billing, and logistics automation.

## Operating loop

Every change should follow this sequence:

1. Discover — inspect the relevant app, package, script, issue, workflow, and docs before editing.
2. Build — make the smallest useful change that solves the stated outcome.
3. Verify — run the narrowest relevant checks first, then broader validation when needed.
4. Optimize — remove duplication, document operational impact, and keep changes focused.
5. Scale — leave repeatable scripts, templates, tests, or docs when they reduce future work.

## Repo map

- `apps/api` — Express 5 API, TypeScript, Prisma, operational backend services.
- `apps/web` — React 19 + Vite frontend, TypeScript operator surfaces.
- `netlify/functions` — retained Netlify function entrypoints and fallbacks.
- `docs` — architecture, operations, production, deployment, and launch documentation.
- `scripts` — setup, validation, deployment, health, and environment tooling.
- `.github` — CI, repository automation, issue templates, and PR templates.

## Required commands

Use `pnpm`, not npm or yarn.

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run check:prisma-versions
pnpm run prisma:validate
pnpm run build
pnpm run test
pnpm run codex:env-check
```

For smaller checks:

```bash
pnpm -C apps/api run test -- --runInBand
pnpm -C apps/web run test
pnpm -C apps/web run typecheck
pnpm -C apps/api run lint
```

## Safety rules

- Do not commit secrets, tokens, `.env` files, private keys, database dumps, or production credentials.
- Do not bypass CI, auth, payments, compliance controls, or approval gates.
- Do not introduce hidden network calls, credential collection, spam, scraping abuse, or unauthorized data access.
- Prefer PRs over direct pushes for risky changes.
- Keep migrations immutable once applied.
- Document any environment variable, deployment, database, or billing impact in the PR.

## Change standards

- Keep changes focused and reversible.
- Update docs when behavior, setup, deployment, env vars, or operator flows change.
- Add or update tests for business logic and regression fixes.
- Use existing scripts before inventing new ones.
- Preserve tenant-aware and role-aware behavior.
- Favor explicit TypeScript types and clear error handling.

## PR checklist for agents

Before opening or updating a PR, include:

- Summary of what changed.
- Commands run and results.
- Production impact.
- Rollback plan for deployment or database changes.
- Screenshots or logs when UI/deployment behavior changed.
- Linked issue when applicable.

## Recommended automation path

1. Convert user requests into GitHub issues with clear acceptance criteria.
2. Create a short-lived branch per issue.
3. Patch the smallest relevant file set.
4. Run focused checks.
5. Open a PR using the repository PR template.
6. Let CI validate before merge.
7. Capture follow-up work as separate issues.
