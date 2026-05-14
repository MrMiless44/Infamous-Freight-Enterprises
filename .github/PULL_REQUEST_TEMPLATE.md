## Summary
Explain what changed and why.

## Launch impact
- [ ] No launch impact
- [ ] Private beta readiness
- [ ] Paid beta readiness
- [ ] Public launch readiness
- [ ] Production hotfix

## Area changed
- [ ] Web app
- [ ] API
- [ ] Database or Prisma
- [ ] Auth or roles
- [ ] Billing or Stripe
- [ ] Notifications
- [ ] Freight workflow
- [ ] Deployment or CI/CD
- [ ] Documentation only

## Verification
Paste the commands or checks run.

```bash
# Example
pnpm run build
pnpm run test
pnpm run validate
```

## Evidence
Add screenshots, logs, links, or notes that prove the change works.

## Risk checklist
- [ ] No secrets committed
- [ ] No production data included
- [ ] Role/access behavior considered
- [ ] Billing/payment behavior considered
- [ ] Rollback path identified
- [ ] Docs updated where needed

## Launch gate checklist
- [ ] API health remains valid
- [ ] Web app still loads
- [ ] Quote intake still works or was not touched
- [ ] Tracking flow still works or was not touched
- [ ] Admin/operator flow still works or was not touched
- [ ] Notifications still work or were not touched
- [ ] If deployment config or infra docs changed, Fly app name (`infamous-freight-api`) was re-verified.
- [ ] If deployment config or infra docs changed, direct Fly URL (`https://infamous-freight-api.fly.dev`) was re-verified.
- [ ] If deployment config or infra docs changed, `PORT` and `http_service.internal_port` were re-verified as `3000`.

## Follow-up issues
Link any blockers, deferred tasks, or evidence gaps.
