# Incident Response Guide

## Priorities

1. Protect customer and operational data.
2. Restore dispatch and operational continuity.
3. Prevent cascading failures.
4. Preserve evidence.
5. Communicate clearly.

## Severity levels

| Severity | Description |
|---|---|
| Sev 1 | Production outage, auth compromise, tenant isolation failure, billing corruption |
| Sev 2 | Major workflow degradation with partial operations available |
| Sev 3 | Non-critical defect or degraded experience |
| Sev 4 | Cosmetic, docs, or low-risk issue |

## Immediate containment checklist

- Pause risky deploys.
- Identify latest deploy SHA.
- Check health endpoints.
- Review Fly.io and Netlify deploy state.
- Inspect database migration status.
- Review Stripe webhook failures.
- Verify auth/session integrity.
- Capture logs before restarting services.

## Recovery workflow

1. Confirm blast radius.
2. Decide rollback vs forward fix.
3. Stabilize production.
4. Run smoke tests.
5. Monitor for recurrence.
6. Publish incident summary.
7. Create follow-up issues and ADRs if needed.

## Minimum smoke tests

- Login flow
- Operator dashboard
- Dispatch board
- Shipment lookup
- Billing route
- Health endpoint
- Socket/realtime connection

## Required incident record

Every Sev 1 or Sev 2 incident should record:

- timeline
- root cause
- affected systems
- customer impact
- rollback details
- permanent corrective actions
- follow-up tasks

## AI-agent safety rules during incidents

- Avoid broad refactors.
- Avoid unrelated dependency upgrades.
- Avoid schema changes unless required.
- Keep patches small and reversible.
- Prefer feature flags or guarded rollbacks.
