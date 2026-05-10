# Capability Status Map

Last updated: May 2026

This map tracks the implementation status of each platform capability for sales, support, and engineering alignment.

## Status definitions

| Status | Meaning |
|--------|---------|
| Live | Deployed, tested, and available to users in production |
| Beta | Deployed but behind a feature flag or limited rollout |
| Planned | Accepted into roadmap, not yet implemented |
| Docs-only | Documented in marketing/docs but not yet functional |

## Freight operations

| Capability | Status | Notes |
|------------|--------|-------|
| Quote request intake (public form) | Live | Web form + Netlify Function + API endpoint |
| Quote-to-load conversion | Live | API workflow with approval guard |
| Load CRUD | Live | Full create/read with tenant isolation |
| Driver management | Live | Create/list with carrier scoping |
| Shipment tracking (API) | Live | Tracking updates with delivered guard |
| Delivery verification & POD | Live | Creates confirmation + tracking records |
| Dispatch board (UI) | Live | Board view with status columns, sample data |
| Load assignment workflow | Live | Accept/reject with terminal-state guards |
| Dispatch confirmation | Live | Confirm with terminal-state guard |
| Carrier payment tracking | Live | Status updates with terminal-state guard |
| Load board posts | Live | Public load board with status management |
| Operational metrics rollup | Live | Period-based metric aggregation |
| Shipment tracking page (public) | Live | Public tracking lookup by reference |

## Billing and payments

| Capability | Status | Notes |
|------------|--------|-------|
| Stripe subscription checkout | Live | Starter/Professional/Enterprise plans |
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
| Role-based access control | Live | Owner/admin/dispatcher roles |
| Tenant isolation | Live | carrierId-scoped data access |
| CSRF protection | Live | Origin/referer validation |
| Rate limiting | Live | Tenant+IP bucketed, configurable |
| Request tracing (x-request-id) | Live | UUID generation, header passthrough |
| Audit logging | Live | Entity-level create/update logging |
| Security headers (web) | Live | CSP, HSTS, X-Frame-Options via netlify.toml |
| Webhook replay function security | Live | Revoked public execute access |

## Frontend and UX

| Capability | Status | Notes |
|------------|--------|-------|
| Operations dashboard | Live | Metrics, loads, actions — sample data |
| Analytics/metrics dashboard | Live | KPIs, lanes, leaderboard — sample data |
| Landing page | Live | Full marketing page with CTA tracking |
| Customer portal page | Live | Public-facing customer access |
| Carrier portal page | Live | Public-facing carrier access |
| Login/auth flow | Live | Supabase auth with role extraction |
| Billing settings panel | Live | Stripe integration UI |
| Error boundaries (global) | Live | Sentry integration with fallback UI |
| Error boundaries (widget) | Live | Per-card retry on dashboard pages |
| Offline detection | Live | Yellow banner with reconnect |
| API client retry | Live | Exponential backoff on 502/503/504 |
| Real-time notifications | Live | Socket.io with browser notification API |
| Role-based navigation | Live | Sidebar items filtered by role |
| Role-based route guards | Live | RouteGuard enforces minRole per route |
| Lazy-loaded routes | Live | Code splitting with Suspense |
| Demo data labeling | Live | All mock-data pages marked "sample data" |

## Infrastructure

| Capability | Status | Notes |
|------------|--------|-------|
| Netlify web hosting | Live | Vite SPA with security headers |
| Fly.io API hosting | Live | Express 5 with graceful degradation |
| Netlify proxy to Fly.io | Live | /api/* and /socket.io/* proxied |
| Domain consolidation | Live | Apex and Netlify subdomain redirect to www |
| Netlify Functions (freight intake) | Live | Public quote + load request endpoints |
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
