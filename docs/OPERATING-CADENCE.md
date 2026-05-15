# Operating Cadence

This cadence keeps Infamous Freight focused on operational discipline, deployment confidence, and AI-assisted execution speed.

## Daily checklist

- Review latest production deploy status.
- Run or review smoke-test results.
- Check API health and latency.
- Check Sentry or runtime error spikes.
- Review Stripe webhook failures.
- Review auth failures or tenant-access anomalies.
- Review quote/demo lead flow.
- Triage urgent issues.

## Weekly checklist

- Review technical debt audit results.
- Review dependency and security alerts.
- Run load tests against staging or production-safe targets.
- Review failed jobs and flaky workflows.
- Review backup/restore simulation results.
- Review business KPIs: quotes, dispatch activity, billing, driver usage, AI usage.
- Convert operational pain points into scoped AI implementation tasks.

## Monthly checklist

- Review incidents and postmortems.
- Review architecture decisions and stale ADRs.
- Audit deployment and rollback procedures.
- Review database growth, backup retention, and restore readiness.
- Review cost, reliability, and performance trends.
- Prune stale issues and duplicate automation.
- Identify one operational bottleneck to automate next.

## Operating principles

1. Measure before scaling.
2. Keep changes small and reversible.
3. Use AI to accelerate scoped execution, not uncontrolled production changes.
4. Treat dispatch, billing, auth, and tenant isolation as high-risk systems.
5. Every incident should produce at least one durable improvement.
6. Every recurring manual task should become a checklist, script, workflow, or dashboard.

## Weekly review prompt

Use this prompt for an AI-assisted review:

```text
Review the last week of repository activity, CI failures, incidents, deploys, dependency changes, and operational metrics. Identify the top 5 risks, top 5 opportunities, and next 3 implementation tasks.
```

## Success metrics

- Fewer failed deploys.
- Faster rollback decisions.
- Shorter time from issue to PR.
- Lower recurring incidents.
- Better dispatch and billing visibility.
- More work captured as repeatable systems.
