# Infamous Freight — Next Action

A short, living note describing the immediate next step for the platform. Update this file as work moves forward.

---

## Current next action

**Phase 2 — Verify local setup.** Run local setup end-to-end against [`local-setup.md`](./local-setup.md), including the validation gate from [`CONTRIBUTING.md`](../CONTRIBUTING.md), then record any blockers with owners and retest notes.

Phase 1 branding is implemented in repo. The remaining Phase 1 work is external verification after deploy and uploading the regenerated GitHub social preview in repository settings.

## After that

1. **Iterate on freight workflows** — dispatch, customers, carriers, loads, documents, tracking, and routing — in `apps/api` and `apps/web/src`. See [`platform-roadmap.md`](./platform-roadmap.md) Phase 3.
2. **Layer in AI logistics** behind feature flags / paywall (Phase 4 in the roadmap).

## Working agreements

- Keep `main` stable; ship work through focused PRs per [`CONTRIBUTING.md`](../CONTRIBUTING.md).
- Don't commit secrets. Don't weaken tests to make CI pass.
- When adding a new doc under `docs/`, link it from [`docs/README.md`](./README.md).
