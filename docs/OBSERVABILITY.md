# Observability Guide

This guide defines the minimum production signals needed to operate Infamous Freight safely.

## Goals

- Detect broken dispatch, billing, auth, realtime, and deployment flows quickly.
- Keep incident diagnosis repeatable.
- Give maintainers and AI agents clear evidence before changing production systems.

## Core signals

| Signal | What to watch | Why it matters |
|---|---|---|
| API health | `/api/health/ready`, request error rate, latency | Confirms backend runtime and database dependencies are reachable |
| Web health | successful Netlify build, route availability, client error rate | Confirms operators can access the platform |
| Database | connection failures, migration failures, slow queries | Protects dispatch, shipment, billing, and tenant data workflows |
| Redis/realtime | socket connection failures, reconnect rate, message delivery errors | Protects live operations and driver-dispatch coordination |
| Stripe | webhook failures, checkout failures, portal failures | Protects revenue and customer lifecycle events |
| Supabase/Auth | token validation failures, auth callback failures, tenant claim mismatches | Protects access control and tenant isolation |
| CI/CD | failed validation, failed Docker runtime healthcheck, deploy failure | Prevents bad releases from shipping |

## Minimum dashboards

Create dashboards for:

1. API runtime
   - p50/p95 latency
   - 4xx/5xx rate
   - process restarts
   - health endpoint status

2. Web runtime
   - deploy status
   - client-side exceptions
   - top failing routes
   - build duration

3. Database
   - connection count
   - failed migrations
   - slow queries
   - storage pressure

4. Billing
   - webhook success/failure
   - checkout session creation
   - subscription/payment state sync

5. Realtime
   - active socket connections
   - reconnect spikes
   - failed emits/listeners

## Alert thresholds

Start with conservative thresholds and tune after real traffic:

- API ready check fails for 2 consecutive probes.
- 5xx rate above 2% for 5 minutes.
- p95 API latency above 2 seconds for 10 minutes.
- Stripe webhook failure count greater than 0 in production.
- migration failure in any production deploy.
- Netlify/Fly deploy failure on `main`.
- repeated auth claim mismatch or tenant isolation error.

## Incident evidence checklist

Before making a production fix, collect:

- affected environment
- first known failure time
- latest deploy SHA
- recent migration status
- relevant logs/traces
- failing route/job/webhook
- customer/operator impact
- rollback option

## Smoke-test requirements

After production changes, verify:

- web loads
- API `/api/health/ready` responds
- auth login path works
- dashboard/operator route works
- core dispatch/shipment workflow still loads
- billing webhook endpoint accepts valid test event where safe

## Tooling notes

Preferred free/legal gateways:

- GitHub Actions summaries and artifacts
- Fly.io logs and health checks
- Netlify deploy logs and deploy previews
- Sentry free tier when enabled
- Supabase logs and dashboard
- Stripe webhook event logs

## Repeatable loop

1. Discover signal gaps.
2. Add one measurable signal.
3. Add alert or dashboard panel.
4. Validate during deploy or smoke test.
5. Document the signal and owner.
