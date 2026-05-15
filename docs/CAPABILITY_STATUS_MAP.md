# Capability Status Map

Last updated: May 2026

This map tracks implementation status for sales, support, and engineering alignment. For runtime truth and launch posture, defer to [`docs/current-status.md`](current-status.md).

## Status definitions

| Status | Meaning |
|--------|---------|
| Live | Deployed, tested, and available to users in production |
| Demo-backed | UI or workflow exists but still depends on sample data, manual verification, or incomplete live data contracts |
| Beta | Deployed but behind a feature flag or limited rollout |
| Not ready | Present in the app or docs but intentionally blocked from production use |
| Planned | Accepted into roadmap, not yet implemented |
| Docs-only | Documented in marketing/docs but not yet functional |

## Route readiness summary

| Route | Status | Notes |
|---|---|---|
| `/ops` | Demo-backed | Command-center metrics and cards exist, but some dashboard data is sample-backed. |
| `/loads` | Live | Load workflows are supported by tenant-aware backend services. |
| `/dispatch` | Demo-backed | Dispatch board UI exists, but live assignment and status feeds still need end-to-end verification. |
| `/drivers` | Live | Driver management is available for authenticated operators. |
| `/invoices` | Demo-backed | Invoice/payment surfaces exist; accounting reconciliation still requires manual verification. |
| `/analytics` | Demo-backed | KPI and analytics cards exist, but some metric sources still need production verification. |
| `/compliance` | Not ready | Compliance workflows are intentionally blocked until hardening is complete. |
| `/settings` | Live | Admin settings are available to authorized operators. |
| `/billing` | Live | Stripe billing surfaces and paywall enforcement are implemented. |
| `/carriers` | Live | Carrier records and operational carrier surfaces are available. |
| `/accounting` | Not ready | Accounting integrations are not fully connected. |
| `/quotes` | Live | Quote intake and approval workflows are available. |
| `/messages` | Demo-backed | Messaging UI exists; permissions and notification behavior need production verification. |
| `/driver-app` | Not ready | Driver app experience is intentionally blocked until promoted. |

## Freight operations

| Capability | Status | Notes |
|------------|--------|-------|
| Quote request intake (public form) | Live | Web form + Fly API endpoint through the Netlify proxy |
| Quote-to-load conversion | Live | API workflow with approval guard |
| Load CRUD | Live | Full create/read with tenant isolation |
| Driver management | Live | Create/list with carrier scoping |
| Shipment tracking (API) | Live | Tracking updates with delivered guard |
| Delivery verification & POD | Live | Creates confirmation + tracking records |
| Dispatch board (UI) | Demo-backed | Board view with status columns; must not be treated as final production dispatcher truth until live feeds are verified |
| Load assignment workflow | Live | Accept/reject with terminal-state guards |
| Dispatch confirmation | Live | Confirm with terminal-state guard |
| Carrier payment tracking | Live | Status updates with terminal-state guard |
| Load board posts | Live | Public load board with status management |
| Operational metrics rollup | Live | Period-based metric aggregation |
| Shipment tracking page (public) | Live | Public tracking lookup by reference |

## Billing and payments

| Capability | Status | Notes |
|------------|--------|-------|
| Stripe subscription checkout | Live | Starter/Professional/Enterprise plans; confirm live account and webhook health before real customer collection |
| Stripe customer portal | Live | Self-service billing management |
| One-time AI add-on purchases | Live | 6 purchase types with Stripe checkout |
| Webhook signature verification | Live | HMAC-SHA256 with timestamp validation |
| Subscription lifecycle sync | Live | Created/updated/deleted/paused/resumed |
| Invoice payment tracking | Live | Succeeded and failed events |
| Refund handling | Live | charge.refunded webhook processing |
| Dispute handling | Live | charge.dispute.created webhook processing |
| Billing paywall enforcement | Live | Middleware blocks unpaid users |
| Audit logging for billing | Live | Checkout session creation logged |

## Authentication and security

| Capability | Status | Notes |
|------------|--------|-------|
| JWT bearer token auth | Live | HS256 with exp/nbf/aud validation |
| Role-based access control | Live | Owner/admin/dispatcher/driver role hierarchy |
| Tenant isolation | Live | carrierId-scoped data access |
| CSRF protection | Live | Origin/referer validation |
| Rate limiting | Live | Tenant+IP bucketed, configurable |
| Request tracing (x-request-id) | Live | UUID generation, header passthrough |
| Audit logging | Live | Entity-level create/update logging |
| Security headers (web) | Live | CSP, HSTS, X-Frame-Options via netlify.toml |
| Webhook replay function security | Live | Revoked public execute access |
| Supabase advisor cleanup | Beta | SECURITY DEFINER hardening migration exists, but live advisor follow-up remains required through the approved migration path |

## Frontend and UX

| Capability | Status | Notes |
|------------|--------|-------|
| Operations dashboard | Demo-backed | Metrics, loads, actions; some data still sample-backed |
| Analytics/metrics dashboard | Demo-backed | KPIs, lanes, leaderboard; some data still sample-backed |
| Landing page | Live | Full marketing page with CTA tracking |
| Customer portal page | Live | Public-facing customer access |
| Carrier portal page | Live | Public-facing carrier access |
| Login/auth flow | Live | Supabase auth with role extraction |
| Billing settings panel | Live | Stripe integration UI |
| Compliance panel | Not ready | Route is blocked until compliance workflows are hardened |
| Accounting dashboard | Not ready | Third-party accounting sync is not fully integrated |
| Driver app route | Not ready | Route is blocked until promoted |
| Error boundaries (global) | Live | Sentry integration with fallback UI |
| Error boundaries (widget) | Live | Per-card retry on dashboard pages |
| Offline detection | Live | Yellow banner with reconnect |
| API client retry | Live | Exponential backoff on 502/503/504 |
| Real-time notifications | Demo-backed | Socket.io and browser notification UI exist; production participant/permission behavior needs verification |
| Role-based navigation | Live | Sidebar items filtered by role |
| Role-based route guards | Live | RouteGuard enforces minRole per route |
| Route readiness gates | Live | Demo-backed routes display warnings; not-ready routes are blocked with operator guidance |
| Lazy-loaded routes | Live | Code splitting with Suspense |
| Demo data labeling | Live | Mock-data pages are explicitly labeled or gated |

## Infrastructure

| Capability | Status | Notes |
|------------|--------|-------|
| Netlify web hosting | Live | Vite SPA with security headers |
| Fly.io API hosting | Live | Express 5 with graceful degradation; verify production secrets and deploy health before launch claims |
| Netlify proxy to Fly.io | Live | /api/* and /socket.io/* proxied |
| Domain consolidation | Live | Apex and Netlify subdomain redirect to www |
| Netlify Functions (freight intake) | Planned | Repo entrypoints are retained, but normal Netlify deploys currently disable functions and proxy public API paths to Fly.io |
| Netlify Database (Postgres) | Live | Public freight intake storage |
| Sentry error tracking | Beta | Opt-in via DSN, needs scrubbing policy |
| API request latency logging | Live | Structured JSON logs with durationMs per /api route |
| Netlify Analytics | Live | Server-side page views, standard provider |
| Paid-beta funnel tracking | Live | 8-stage funnel instrumented via custom events |

## AI and advanced features

| Capability | Status | Notes |
|------------|--------|-------|
| AI usage tracking | Live | Event recording and summary endpoints |
| AI freight assistant (UI) | Beta | Conversational freight helper |
| Auto-dispatch AI | Planned | Carrier ranking and assignment |
| Voice load booking | Planned | Voice-to-dispatch flow |
| Load auction | Planned | Competitive carrier bidding |
| Rate negotiation AI | Planned | AI-assisted rate suggestions |
| Document parsing AI | Planned | BOL/POD extraction |

## Integrations

| Capability | Status | Notes |
|------------|--------|-------|
| DAT load board API | Planned | API key configured, not yet integrated |
| Truckstop load board API | Planned | API key configured, not yet integrated |
| 123Loadboard API | Planned | API key configured, not yet integrated |
| Samsara ELD | Planned | API token configured, not yet integrated |
| Motive ELD | Planned | Credentials configured, not yet integrated |
| QuickBooks accounting | Planned | OAuth configured, not yet integrated |
| Xero accounting | Planned | OAuth configured, not yet integrated |
| SendGrid email | Planned | API key configured, not yet integrated |
| Factoring (RTS/OTR/Apex) | Planned | API keys configured, not yet integrated |
