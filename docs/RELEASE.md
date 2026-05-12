# Release Checklist

## Required checks before merge

1. `pnpm --filter @infamous-freight/api lint`
2. `pnpm --filter @infamous-freight/api test -- --runInBand`
3. `pnpm -r build`
4. `./scripts/smoke-api-health.sh`

## Deployment safety gates

- Prisma client generated before runtime.
- API binds to `PORT=3000` in production runtime.
- Health endpoint returns HTTP 200.
- No placeholder secrets remain in tracked env templates.

## Rollout

- Deploy backend first, then web.
- Run post-deploy health checks for `/health` and `/api/health`.
- Verify tenant-scoped protected routes with auth headers in staging.
