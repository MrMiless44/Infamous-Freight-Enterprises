# Infamous Freight — Next Action

A short, living note describing the immediate next step for the platform. Update this file as work moves forward.

---

## Current next action

**Phase 3 — Freight workflow iteration.** Pull the next focused dispatch, load, tracking, billing, or document slice from [`platform-roadmap.md`](./platform-roadmap.md) and keep it aligned to the active React/Vite on Netlify plus Express on Fly.io architecture.

Phase 1 branding tokens, app-shell styling, public meta, and app icons have been applied in `apps/web`. Phase 2 local setup verification passed on May 8, 2026: dependency installation, lint, API typecheck, web typecheck, API coverage, web tests, social preview generation, canonical host checks, apex-to-www redirect checks, and proxied `/api/health` checks all completed successfully. Remaining operational follow-up is to upload the regenerated GitHub social preview through repository settings.

## After that

1. **Layer in AI logistics** behind feature flags / paywall (Phase 4 in the roadmap).
2. **Record launch evidence continuously** after each production-impacting deploy, including canonical web responses, proxied API health, redirects, and security headers.

## Working agreements

- Keep `main` stable; ship work through focused PRs per [`CONTRIBUTING.md`](../CONTRIBUTING.md).
- Don't commit secrets. Don't weaken tests to make CI pass.
- When adding a new doc under `docs/`, link it from [`docs/README.md`](./README.md).
