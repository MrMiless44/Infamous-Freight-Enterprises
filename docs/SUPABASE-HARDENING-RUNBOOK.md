# Supabase Hardening Runbook

## Current priorities

1. Fix malformed database connection URLs.
2. Enable leaked-password protection.
3. Review SECURITY DEFINER functions.
4. Optimize RLS policy performance.
5. Review unused indexes after sustained production traffic.

## Database connection validation

Run:

```bash
bash scripts/check-database-url.sh
```

This catches malformed Supabase/Supavisor database names such as:

```text
postgres.<project-ref>
```

The database name should normally be:

```text
postgres
```

## Environment review locations

Check:

- Fly.io secrets
- Netlify environment variables
- GitHub Actions secrets
- local `.env` templates
- Prisma connection strings
- Supavisor pool URLs

## Leaked password protection

In Supabase dashboard:

- Authentication
- Password Security
- Enable leaked password protection

## SECURITY DEFINER review

Current functions under review:

- `public.review_document(...)`
- `public.verify_profile(...)`

Current assessment:

- role-aware checks exist
- tenant-aware checks exist
- auth checks exist

Before changing them:

- verify admin/dispatcher workflows
- verify tenant isolation
- add regression tests
- verify audit logging

## RLS optimization guidance

Supabase advisor recommends replacing repeated:

```sql
auth.uid()
```

with:

```sql
(select auth.uid())
```

inside expensive RLS paths.

Start with:

- loads
- shipments
- documents
- carriers
- alerts
- organizations
- bids

Migration applied for this optimization:

- `supabase/migrations/20260515235100_optimize_high_traffic_rls_policies.sql`

The migration does three things for these tables:

1. Audits existing `public` RLS policies.
2. Rewrites `auth.uid()` / `auth.role()` to `(select auth.uid())` / `(select auth.role())`.
3. Drops exact duplicate permissive policies to consolidate overlaps safely.

## RLS benchmark checklist (before/after)

Run on staging before and after applying the migration.

1) Capture policy definitions:

```sql
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('loads', 'shipments', 'documents', 'carriers', 'alerts', 'organizations', 'bids')
order by tablename, policyname;
```

2) Measure representative tenant-scoped reads:

```sql
explain (analyze, buffers)
select *
from public.loads
order by created_at desc
limit 50;
```

Repeat for `shipments`, `documents`, `carriers`, `alerts`, `organizations`, and `bids`.

3) Validate tenant isolation still holds:

- authenticated user in tenant A must not see tenant B rows
- admin/dispatcher access patterns must remain unchanged
- unauthenticated requests must remain blocked where expected

## Index cleanup guidance

Do not aggressively remove indexes.

Wait for:

- stable production traffic
- repeated unused-index reports
- query-performance evidence

before pruning.

## Monthly operational review

- Review advisor warnings.
- Review Postgres logs.
- Review slow queries.
- Review auth anomalies.
- Review connection pool health.
- Review RLS complexity.
- Review backup restore validation.
