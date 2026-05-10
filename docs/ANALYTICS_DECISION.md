# Analytics Decision Record

Date: May 2026

## Decision

Infamous Freight uses **Netlify Analytics** as the standard web analytics provider, supplemented by a custom lightweight event system for product-specific funnel tracking.

## Context

The project is deployed on Netlify with the API on Fly.io. The codebase contained references to both Netlify and Vercel analytics packages. A decision was needed to standardize on a single provider.

## Rationale

- **Netlify Analytics** is the natural fit because the web app is hosted on Netlify. It provides server-side page view counting without client-side JavaScript, which means zero performance overhead and no ad-blocker interference.
- **Vercel Analytics** is removed from consideration. The project does not deploy to Vercel and the `vercel.json` file is a legacy artifact.
- **Sentry** remains opt-in for error tracking (Beta status). It is not an analytics replacement — it serves a different purpose (error monitoring, performance tracing when enabled).

## Implementation

| Layer | Tool | Purpose |
|-------|------|---------|
| Page views | Netlify Analytics (server-side) | Traffic, top pages, sources |
| Product events | Custom event system (`@/lib/analytics.ts`) | CTA clicks, form submissions, load board interaction |
| Funnel tracking | Custom funnel events (`trackFunnelEvent`) | Paid-beta conversion funnel |
| Error monitoring | Sentry (opt-in) | Exceptions, transaction traces |

## Paid-Beta Funnel Events

The following funnel stages are instrumented via `trackFunnelEvent`:

1. `funnel_landing_visit` — visitor lands on the marketing page
2. `funnel_quote_request` — visitor submits a quote request
3. `funnel_demo_request` — visitor requests a demo (reserved)
4. `funnel_signup` — user creates an account
5. `funnel_billing_start` — user initiates Stripe checkout
6. `funnel_first_load` — user creates their first load (reserved)
7. `funnel_first_dispatch` — user confirms first dispatch (reserved)
8. `funnel_first_pod` — user verifies first proof of delivery (reserved)

Events marked "reserved" have type definitions ready but are not yet wired to UI actions since those flows currently use sample data.

## What Not to Do

- Do not add Google Analytics, Segment, Mixpanel, or other third-party analytics without explicit instruction.
- Do not enable Sentry performance monitoring (`tracesSampleRate`) without a scrubbing policy for PII.
- Do not remove the custom event system in favor of a third-party tool — it is intentionally lightweight and privacy-preserving.
