# Infamous Freight — Phase 5 Launch Validation

Date: April 26, 2026
Status: Phase 5 UI and launch validation path added; production access now gated

## Purpose

Phase 5 gives the operations team a browser-based validation console for the freight workflow API added in Phases 3 and 4.

The validation page is available at:

```text
/launch-validation
```

## What the page validates

The page runs end-to-end workflow checks against the configured API using the signed-in user's carrier context.

It validates:

1. Quote to load conversion
2. Load assignment acceptance
3. Dispatch confirmation
4. Shipment tracking update
5. POD / delivery verification
6. Carrier payment status update
7. Operational metric rollup
8. Load board post lifecycle

## Required environment

The web app must have a valid API URL configured:

```env
VITE_API_URL=/api
```

The API must have production database access configured through:

```env
DATABASE_URL=postgresql://...
```

## Launch validation access control

The validation page creates real workflow records, so it is restricted.

Access requires:

1. User role is `owner` or `admin`.
2. In production, the web environment variable below is explicitly enabled:

```env
VITE_LAUNCH_VALIDATION_ENABLED=true
```

If the flag is unset in production, the route remains blocked and the sidebar item is hidden. Local and non-production environments remain enabled by default to support staging validation.

Recommended production setting after validation:

```env
VITE_LAUNCH_VALIDATION_ENABLED=false
```

## Production migration readiness

Do not run the launch validation page against production until the production migration plan is confirmed.

For an existing production database that already has the original baseline tables, mark the baseline migration as applied first:

```bash
npm --prefix apps/api exec prisma migrate resolve --applied 20260425000000_baseline_schema --schema prisma/schema.prisma
```

Then deploy pending migrations:

```bash
npm --prefix apps/api exec prisma migrate deploy --schema prisma/schema.prisma
```

## Recommended launch sequence

1. Confirm CI is green on `main`.
2. Confirm production environment variables are present.
3. Apply database migration to staging first.
4. Run `/launch-validation` against staging with an owner/admin internal test account.
5. Apply production migration.
6. Temporarily set `VITE_LAUNCH_VALIDATION_ENABLED=true` in production web env.
7. Run `/launch-validation` against production with an internal owner/admin carrier account.
8. Review generated validation records in the dashboard/API.
9. Set `VITE_LAUNCH_VALIDATION_ENABLED=false` again unless active validation access is still needed.

## Operational note

The validation page creates real workflow records in the selected environment. Use it with an internal test carrier account, not a live customer tenant.
