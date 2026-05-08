# Authorization Migration Plan

Status: Required before paid beta or public launch.

## Problem

Several protected API routes currently derive tenant and role from caller-controlled request headers:

- `x-tenant-id`
- `x-user-role`

This is acceptable only for local prototypes and controlled tests. It is not production authorization because clients can spoof those headers.

## Required Production Behavior

Production authorization must derive identity, tenant, and role from a trusted server-side source.

Required flow:

1. Client sends `Authorization: Bearer <token>`.
2. API verifies the token server-side.
3. API resolves authenticated user ID.
4. API resolves tenant membership from trusted claims or database records.
5. API resolves role from trusted claims or database records.
6. API rejects missing, expired, tampered, or unauthorized tokens.
7. API rejects cross-tenant reads/writes.
8. API rejects role escalation attempts.

## Target Middleware Shape

```ts
type AuthenticatedUser = {
  userId: string;
  tenantId: string;
  role: 'owner' | 'admin' | 'dispatcher';
};

function requireAuthenticatedUser(req, res, next) {
  // 1. Read Bearer token
  // 2. Verify token with configured auth provider
  // 3. Load trusted tenant/role mapping
  // 4. Attach req.authenticatedUser
  // 5. Continue or reject
}
```

## Migration Steps

### Phase 1 — Add middleware behind feature flag

- Add `AUTH_MODE=header|trusted`.
- Default production to `trusted`.
- Keep header mode only for tests/local controlled environments.
- Add clear startup failure if production is configured with unsafe header mode.

Current status: production now defaults to `AUTH_MODE=trusted`, requires a JWT verification secret at startup, and protected Express routes no longer silently accept caller-controlled `x-tenant-id` and `x-user-role` headers in that mode. Header mode remains available for local/test compatibility and is blocked at production startup unless `ALLOW_UNSAFE_HEADER_AUTH=true` is deliberately set.

### Phase 2 — Add tests

Required tests:

- Missing token returns `401`.
- Expired/tampered token returns `401`.
- Valid token attaches user identity.
- User cannot access another tenant's data.
- Dispatcher cannot perform owner/admin-only billing actions.
- Header spoofing does not override trusted token claims.

### Phase 3 — Replace route guards

Replace:

- `requireTenant`
- `requireRole`
- `requireBillingRole`

with guards that use trusted authenticated user context.

Current status: the Express middleware verifies `Authorization: Bearer <token>` with `SUPABASE_JWT_SECRET` or `JWT_SECRET`, derives the user ID from `sub`, and derives tenant and role from trusted JWT claims before protected route guards run. Tenant can be supplied as `app_metadata.tenant_id`, `app_metadata.tenantId`, `app_metadata.carrier_id`, `app_metadata.carrierId`, matching `user_metadata` fields, or top-level `tenant_id`/`tenantId`/`carrier_id`/`carrierId`. Role can be supplied as `app_metadata.role`, `app_metadata.user_role`, matching `user_metadata` fields, or top-level `role`/`user_role`, and must be `owner`, `admin`, or `dispatcher`. Route guards only fall back to header-derived tenant/role values in `AUTH_MODE=header`.

### Phase 4 — Remove unsafe production path

After frontend and tests are updated:

- Remove production support for header-derived tenant/role.
- Keep test helper utilities for controlled test cases only.

## Environment Requirements

Choose and document one canonical auth provider path.

Supported target options:

| Option | Required env |
|---|---|
| Supabase JWT verification | `SUPABASE_JWT_SECRET`, optional `SUPABASE_JWT_AUDIENCE` |
| Internal JWT verification | `JWT_SECRET`, issuer, audience |
| External OIDC/JWKS | `AUTH_JWKS_URL`, issuer, audience |

Do not implement multiple competing production auth paths unless there is a business requirement.

## Launch Gate

Paid beta and public launch are blocked until this migration is complete and verified with evidence in `docs/LAUNCH_EVIDENCE_LOG.md`.
