# Production Hardening Execution Plan

This plan converts the readiness audit into executable repo work.

## P0 — Must Complete Before Paid/Public Launch

### 1. Replace header-trusted authorization

Current prototype-friendly behavior accepts tenant and role values from request headers. Production must not trust caller-controlled role or tenant headers.

Required outcome:

- Verify JWT/session server-side.
- Resolve user identity from trusted auth provider.
- Resolve tenant membership from database or trusted claims.
- Resolve role from server-side source.
- Add tests for role escalation and cross-tenant access.

Current repository status:

- Production Express routes default to `AUTH_MODE=trusted` and do not silently accept caller-controlled tenant or role headers.
- `AUTH_MODE=header` remains available for controlled local/test compatibility and fails fast in production unless `ALLOW_UNSAFE_HEADER_AUTH=true` is deliberately set.
- The remaining launch work is to connect a concrete auth provider that verifies bearer tokens or sessions and populates the trusted authenticated request context before protected routes run.

Execution doc: `docs/AUTHORIZATION_MIGRATION_PLAN.md`

Tracking issue: #1616

### 2. Complete production readiness evidence

Required outcome:

- Run preflight commands.
- Run smoke tests.
- Attach evidence to `docs/LAUNCH_EVIDENCE_LOG.md`.
- Assign launch, rollback, support, and technical owners.
- Record final go/no-go decision.

Tracking issue: #1615

### 3. Verify billing and webhook behavior

Required outcome:

- Stripe mode confirmed.
- Success webhook verified.
- Failure webhook verified.
- Duplicate webhook idempotency verified.
- Invalid signature rejected.
- Paid access never granted on failed payment.

## P1 — Should Complete Before Private Beta

### 1. Rate limiting

The API has configurable in-memory rate limiting mounted on `/api/*` routes. Production should upgrade to Redis or platform-backed rate limits before higher traffic or multiple API instances.

Environment variables:

| Variable | Default | Purpose |
|---|---:|---|
| `RATE_LIMIT_ENABLED` | enabled unless `false` | Enables/disables limiter |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rolling window length |
| `RATE_LIMIT_MAX_REQUESTS` | `120` | Requests per key/window |

Tracking issue: #1617

### 2. Docker runtime consistency

Canonical API container port is `3001` for local Docker. Keep Dockerfile, compose, docs, and smoke tests aligned.

Tracking issue: #1618

### 3. Architecture documentation alignment

Use these docs as the source of truth until all README/API references are fully corrected:

- `docs/ARCHITECTURE_SOURCE_OF_TRUTH.md`
- `docs/API_ROUTE_MAP.md`

Tracking issue: #1619

## Validation Commands

Run from repo root:

```bash
npm run validate
npm run lint
npm run test
npm run build
npm run production:preflight
npm run production:smoke-test
```

Docker verification:

```bash
docker-compose up -d --build
curl -i http://localhost:3001/health
```

## Launch Rule

No paid/public launch without completed evidence, verified recovery, verified billing, and resolved critical security blockers.
