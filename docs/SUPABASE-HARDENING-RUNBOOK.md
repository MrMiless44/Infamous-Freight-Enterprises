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
