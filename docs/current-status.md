# Current status

Updated 2026-05-14.

> This document is the **single source of truth** for runtime readiness. The root [README](../README.md) and launch docs defer here for verified-live vs. demo-backed vs. planned status. For a per-capability breakdown see [`CAPABILITY_STATUS_MAP.md`](./CAPABILITY_STATUS_MAP.md).

---

## Working now (verified live)

- `apps/api` is the active backend runtime, deployed to Fly.io.
- Fly.io, Docker, and the API server are aligned on port `3000`.
- Netlify serves the web app and proxies same-origin `/api/*` traffic to Fly.io.
- Public quote intake form and API endpoint are live through the Netlify proxy.
- Stripe subscription checkout, customer portal, and webhook processing are live.
- JWT auth, role-based access control, and tenant isolation are enforced.
- Shipment tracking, load CRUD, driver management, and dispatch workflows are operational.
- Socket.io realtime notifications are active.
- Security headers, rate limiting, CSRF protection, and audit logging are in place.

## Demo-backed (deployed; some views show sample data)

- The operations dashboard and analytics/metrics dashboard are deployed but serve sample data — live API-backed data is not yet fully wired.
- The dispatch board renders with status columns using sample data.
- The AI freight assistant is available in beta (conversational helper, not yet auto-dispatching).

> All pages that display sample data are labeled "sample data" in the UI.

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

## Planned (on roadmap, not yet live)

- Auto-dispatch AI (carrier ranking and automatic assignment)
- Load board API integrations (DAT, Truckstop, 123Loadboard)
- ELD integrations (Samsara, Motive)
- Accounting integrations (QuickBooks, Xero)
- Email delivery (SendGrid)
- Factoring integrations (RTS, OTR, Apex)
- Voice load booking and AI rate negotiation

---

## Verification

Run locally or in CI to confirm the current build state:

```bash
pnpm run lint
pnpm run typecheck
pnpm run prisma:validate
pnpm run build
pnpm run test
```

For production runtime checks:

```bash
curl https://www.infamousfreight.com/api/health
curl https://www.infamousfreight.com/api/health/live
curl https://www.infamousfreight.com/api/health/ready
```

See [`LAUNCH_READINESS_INDEX.md`](./LAUNCH_READINESS_INDEX.md) for the full pre-launch verification checklist and evidence log.
