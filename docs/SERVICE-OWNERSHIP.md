# Service Ownership Map

This document defines ownership boundaries for operational areas, deployment surfaces, and runtime responsibility.

## Core ownership

| Area | Path | Responsibility |
|---|---|---|
| API platform | `apps/api` | backend services, Prisma, auth, billing, realtime, freight workflows |
| Web platform | `apps/web` | operator UI, client routing, realtime client flows |
| Infrastructure | `.github`, `Dockerfile`, `scripts`, deployment config | CI/CD, runtime validation, deployment safety |
| Documentation | `docs` | architecture, operations, production readiness |
| Database | Prisma schema and migrations | schema safety, migration discipline, operational integrity |

## Operational expectations

### API ownership

- Maintain tenant-aware behavior.
- Protect auth boundaries.
- Keep Prisma schema changes reversible.
- Ensure health endpoints remain stable.
- Preserve Stripe webhook integrity.

### Web ownership

- Keep production builds deterministic.
- Avoid leaking secrets into client bundles.
- Maintain accessibility and operational clarity.
- Validate API contract compatibility.

### Infrastructure ownership

- CI must remain green.
- Docker runtime checks must pass.
- Deployment scripts must stay idempotent where possible.
- Production secrets must never be committed.

## Escalation path

High-risk changes should receive:

1. ADR documentation
2. focused PRs
3. runtime validation
4. smoke testing
5. rollback planning
