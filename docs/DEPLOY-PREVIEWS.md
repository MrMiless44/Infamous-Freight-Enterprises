# Deploy Preview Strategy

Deploy previews let maintainers validate pull requests before they affect production.

## Goals

- Review every frontend change in an isolated preview URL.
- Validate API compatibility before merge.
- Keep staging and production secrets separated.
- Require smoke-test evidence for risky changes.

## Recommended setup

### Web previews

Use Netlify deploy previews for `apps/web`.

Required configuration:

- Netlify site connected to this repository.
- Build command: `pnpm run build:web`.
- Publish directory: `apps/web/dist`.
- Preview environment variables configured in Netlify UI.

### API previews

Use one of these options:

1. Shared staging API on Fly.io.
2. Temporary Fly.io app per high-risk PR.
3. Local API validation through CI for low-risk frontend-only changes.

Start with a shared staging API before adding ephemeral API environments.

## Required preview smoke tests

For each production-impacting PR, verify:

- web preview loads
- auth route does not crash
- dashboard route loads
- `/api/health/ready` returns success against staging API
- core dispatch/shipment screens render
- no client secret is exposed in preview build

## PR comment format

```md
## Deploy Preview

- Web preview:
- API target:
- Smoke tests completed:
- Known limitations:
```

## Risk rules

- Do not use production Stripe webhook secrets in preview.
- Do not use production database credentials in preview.
- Do not point preview builds to production APIs unless explicitly approved.
- Do not merge migration PRs without a rollback plan.

## Upgrade path

1. Shared staging API.
2. Netlify deploy previews.
3. Preview smoke-test workflow.
4. Ephemeral database restore tests.
5. Optional temporary Fly.io API apps for high-risk PRs.
