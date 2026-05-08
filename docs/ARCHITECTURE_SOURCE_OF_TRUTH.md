# Architecture Source of Truth

Status: Canonical reference required before beta/public launch.

## Current Repository Reality

The current API package is an Express + TypeScript service.

Evidence in the repo:

- `apps/api/package.json` depends on `express`, `cors`, `helmet`, Prisma, Sentry, and related TypeScript tooling.
- `apps/api/src/server.ts` starts the app by importing `createApp()` and listening on `process.env.PORT`.
- `apps/api/src/app.ts` registers Express middleware and API routes directly.

## Documentation Drift to Resolve

Some project documentation and generated PDF material references backend architecture or routes that do not fully match the current repository implementation.

Known drift areas:

- Some older planning documents may reference inactive backend frameworks or routes.
- The uploaded PDF describes an Express 5 + Prisma + tRPC-style backend.
- The PDF route map references `/api/freight/...` endpoints.
- The current implementation exposes routes such as `/api/loads`, `/api/shipments`, `/api/freight-operations/:resource`, `/api/workflows/...`, `/api/billing/...`, `/health`, and `/api/health`.

## Canonical Runtime Defaults

Until changed by a deliberate architecture decision:

| Area | Canonical Value |
|---|---|
| API framework | Express + TypeScript |
| API container port | `3001` |
| Local Docker API URL | `http://localhost:3001` |
| Health endpoint | `/health` and `/api/health` |
| Database | PostgreSQL via Prisma |
| Cache | Redis |
| Web | React/Vite static frontend |

## Required Before Public Launch

- [ ] README tech stack matches actual implementation
- [ ] API docs list actual implemented endpoints
- [ ] Planned/deprecated routes are clearly separated from implemented routes
- [ ] Docker, compose, Fly.io, Netlify, and smoke-test docs agree on ports and URLs
- [ ] Launch evidence log includes proof that the documented setup works

## Decision Rule

Do not use PDF-generated architecture claims as production truth unless they are verified against the repository. Production truth is the codebase plus passing verification evidence.
