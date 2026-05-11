# Recommended Fixes Report (v2 rollout)

## Applied

- Enforced required sensitive compose env vars for DB, Redis, and JWT.
- Removed weak/secret-like placeholders from `.env.example`.
- Aligned API `@types/node` with Node 22 baseline.
- Added compose compatibility wrapper (`docker compose`/`docker-compose`).
- Added root `Makefile` helper targets.
- Strengthened smoke test to validate `/health` and `/api/health` response payloads (`status: ok`).
- Added PR readiness validator script for install/build/lint/test/audit/placeholder scan.
- Added CodeQL config scoping and ignore patterns.
- Added release checklist documentation.

## Validation commands

- `pnpm --filter @infamous-freight/api lint`
- `pnpm --filter @infamous-freight/api test -- --runInBand`
