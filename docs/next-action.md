# Infamous Freight — Next Action

A short, living note describing the immediate next step for the platform. Update this file as work moves forward.

---

## Current next action

**Phase 1 — Branding.** Apply the locked brand palette, typography, and logo treatment across `apps/web` and confirm the canonical site at `https://www.infamousfreight.com` reflects them.

See [`phase-1-branding-plan.md`](./phase-1-branding-plan.md) for the detailed plan.

## After that

1. **Verify local setup** end-to-end against [`local-setup.md`](./local-setup.md), including the full validation gate from [`CONTRIBUTING.md`](../CONTRIBUTING.md).
2. **Iterate on freight workflows** — dispatch, customers, carriers, loads, documents, tracking, and routing — in `apps/api` and `apps/web/src`. See [`platform-roadmap.md`](./platform-roadmap.md) Phase 3.
3. **Layer in AI logistics** behind feature flags / paywall (Phase 4 in the roadmap).

## Working agreements

- Keep `main` stable; ship work through focused PRs per [`CONTRIBUTING.md`](../CONTRIBUTING.md).
- Don't commit secrets. Don't weaken tests to make CI pass.
- When adding a new doc under `docs/`, link it from [`docs/README.md`](./README.md).
