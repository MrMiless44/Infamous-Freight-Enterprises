# Recommendation Work Tracks

Date: May 6, 2026

This document turns the 50 repository recommendations into production work tracks. It is intentionally organized by launch risk so work can be pulled into small, reviewable changes instead of one broad refactor.

## Track 1: Launch Blockers

Resolve these before paid beta or public launch:

- Keep `README.md`, `docs/ARCHITECTURE.md`, and public launch docs aligned to the active stack: React/Vite on Netlify and Express 4 on Fly.io.
- Keep Netlify build scope documented as web-only, with `/api/*` proxying to the Fly.io API.
- Record Netlify deploy evidence for publish directory, redirects, headers, and plugin behavior.
- Confirm production DNS and redirect behavior for apex, www, and proxied `/api/*`.
- Confirm database migration status and backup/restore proof.
- Run rollback drills for web, API, database migration, and Stripe webhook failures.

## Track 2: Security, Auth, And Billing

Prioritize these immediately after launch blockers:

- Replace production trust in `x-user-role` and `x-tenant-id` with verified JWT claims and membership lookup.
- Keep test-only header fallbacks explicitly gated.
- Expand Stripe webhook coverage for duplicate events, subscription changes, failed payments, refunds, one-time purchases, and missing metadata.
- Alert on failed Stripe webhook event records.
- Keep Stripe product, price, webhook, and billing environment documentation aligned to implemented endpoints.
- Add audit logging for billing changes, role changes, quote conversion, dispatch confirmation, POD verification, and payment status updates.
- Continue request tracing with `x-request-id` across API responses and logs.

## Track 3: Core Freight Workflow

Ship these as focused API/UI slices:

- Wire customer-facing quote, tracking, load, billing, and document flows only to implemented endpoints.
- Keep inactive NestJS planning modules labeled as inactive until migrated into Express route modules.
- Add stricter server-side validation for loads, drivers, shipments, and freight operation records.
- Add workflow state-transition checks so rejected assignments, delivered loads, and verified PODs cannot move backward accidentally.
- Decide and document document-storage ownership, security controls, retention, and expiring access URLs.
- Add latency tracking around quote conversion, load assignment, dispatch confirmation, tracking updates, and POD verification.

## Track 4: Mobile Field UX

Use this track for driver and dispatcher workflows:

- Run mobile-first checks on dispatch, loads, tracking, driver, billing, and document paths.
- Add offline/retry behavior for tracking updates, POD upload, and dispatch acknowledgement.
- Add accessible empty states for dashboards, loads, invoices, compliance, and tracking.
- Add role-specific navigation and route-level authorization checks for admin, billing, accounting, compliance, owner, dispatcher, and driver views.
- Add error boundaries around dashboard widgets so one failing panel does not blank the app.

## Track 5: Evidence, Marketing, And Operations

Keep external claims conservative until backed by current evidence:

- Maintain a capability-status map for sales and support: live, beta, planned, and documentation-only.
- Replace demo-like landing metrics with verified production metrics or clearly labeled sample workflow data.
- Keep Sentry opt-in documented with minimum useful events and scrubbed metadata.
- Decide whether Netlify-only analytics or Vercel Analytics is the intended standard, then document the choice.
- Add dependency review automation for payment, auth, API, and build tooling packages.
- Consolidate duplicate environment reference files into one canonical guide plus `.env.example`.
- Track the first paid-beta funnel: landing visit, quote request, demo request, signup, billing start, first load, first dispatch, and first POD.
