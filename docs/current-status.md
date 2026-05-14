# Current status

Updated 2026-05-14.

## Active runtime

- `apps/api` is the active backend runtime.
- Fly.io, Docker, and the API server are aligned on port `3000`.
- Netlify serves the web app and proxies same-origin `/api/*` traffic to Fly.io.

## Still being hardened

- Some operator-facing views still contain sample data.
- The main dashboard sample data should be replaced with live API-backed services.
- Unfinished authenticated routes should be explicitly gated when they are not production-ready.

## Authenticated route readiness

Source of truth in code: `apps/web/src/lib/routeReadiness.ts`.

| Route | Readiness | Notes |
| --- | --- | --- |
| `/ops` | demo-backed | Dashboard is demo-backed while live operations data wiring is in progress. |
| `/loads` | demo-backed | Load board records are demo-backed. |
| `/dispatch` | demo-backed | Dispatch workflow is demo-backed. |
| `/drivers` | demo-backed | Driver management view is demo-backed. |
| `/invoices` | demo-backed | Invoice management view is demo-backed. |
| `/analytics` | demo-backed | Metrics are demo-backed and not final production analytics. |
| `/compliance` | demo-backed | Compliance records are demo-backed and require source-system validation. |
| `/settings` | demo-backed | Settings contains mixed readiness surfaces and is not fully live. |
| `/billing` | live | Billing/paywall activation is production-enabled. |
| `/carriers` | demo-backed | Carrier onboarding and approval are demo-backed. |
| `/accounting` | demo-backed | Accounting workflows are demo-backed. |
| `/quotes` | demo-backed | Internal quote workflow is demo-backed. |
| `/messages` | not ready | Route is explicitly gated in-app and unavailable for live operations. |
| `/driver-app` | not ready | Route is explicitly gated in-app and unavailable for live operations. |

## Verification

Run:

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run prisma:validate`
- `pnpm run build`
- `pnpm run test`
