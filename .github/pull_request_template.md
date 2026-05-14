## Summary

Describe what changed and why.

## Scope and risk

- Scope (single-purpose change statement):
- Risk level (low/medium/high):
- Primary rollback trigger:

## Type of change

- [ ] Feature
- [ ] Fix
- [ ] Docs
- [ ] Chore
- [ ] Security
- [ ] Deployment / infrastructure

## Validation

Paste the commands you ran and the result.

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm -C apps/api exec tsc -p tsconfig.json --noEmit
pnpm -C apps/web exec tsc -p tsconfig.json --noEmit
pnpm -C apps/api run test:coverage
```

## Production impact

- [ ] No production impact
- [ ] Requires deploy
- [ ] Requires env/secrets change
- [ ] Requires migration
- [ ] Requires smoke test

If production-impacting, document:

- affected service:
- required secrets/env vars:
- rollback plan:
- smoke-test evidence:

## Dependency update notes (only when applicable)

- [ ] `pnpm-lock.yaml` is updated with any package manifest/dependency changes.
- [ ] Changelog/release notes were reviewed for updated packages.
- [ ] Risk notes for major/high-risk transitive changes are included in this PR.

## Deployment consistency checks (when touching deployment config/infra docs)

- [ ] Fly app name (`infamous-freight-api`) remains consistent across `fly.toml`, workflows, and docs.
- [ ] Direct Fly URL (`https://infamous-freight-api.fly.dev`) remains consistent across workflows/docs.
- [ ] Port mapping remains aligned at `3000` (`PORT` and `http_service.internal_port`).

## Checklist

- [ ] Branch is up to date with `main`.
- [ ] PR is focused and not carrying stale duplicate work.
- [ ] CI is green.
- [ ] Docs were updated where needed.
- [ ] Secrets were not committed.
- [ ] Screenshots/logs are included when useful.
- [ ] Validation logs/screenshots are attached for infra or UX-impacting changes.
- [ ] Linked issue is included when applicable.
