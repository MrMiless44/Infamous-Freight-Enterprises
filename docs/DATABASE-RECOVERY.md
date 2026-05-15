# Database Backup and Recovery

## Goals

- Ensure backups are usable.
- Detect migration drift before production incidents.
- Verify restore procedures regularly.
- Reduce recovery time during operational incidents.

## Backup policy

Minimum recommendations:

- Daily automated PostgreSQL backup.
- Retain multiple restore points.
- Encrypt backup storage.
- Store backups separately from production runtime.

## Restore verification workflow

At least weekly:

1. Create temporary restore database.
2. Restore latest backup.
3. Run Prisma validation.
4. Run smoke-test queries.
5. Validate application startup.
6. Destroy temporary restore environment.

## Minimum validation commands

```bash
pnpm run prisma:validate
pnpm run test:api
pnpm run smoke:api:health
```

## Recovery priorities

1. Preserve tenant and billing data integrity.
2. Restore dispatch operations.
3. Restore realtime coordination.
4. Restore analytics and secondary workflows.

## Migration safety rules

- Never mutate already-applied migrations.
- Always include rollback planning.
- Avoid destructive schema changes during peak operations.
- Prefer additive migrations first.

## Incident checklist

Before restoring production:

- confirm blast radius
- identify latest good backup
- confirm migration compatibility
- verify auth and billing secrets
- validate restore in isolated environment first

## Future automation roadmap

- scheduled restore simulation
- migration drift detection
- automated integrity checks
- backup success alerts
- restore-duration tracking
