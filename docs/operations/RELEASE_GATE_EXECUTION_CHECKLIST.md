# Release Gate Execution Checklist

## Purpose

Run and record the production release gate before paid beta or public launch.

This checklist is intentionally operational. It does not change runtime code.

## Canonical production targets

```text
Web: https://www.infamousfreight.com
API: https://infamous-freight-api.fly.dev
Liveness: /api/health/live
Readiness: /api/health/ready
```

## Best free/legal gateway

Use GitHub Actions manual workflows and the existing production scripts in this repository.

## Exact next steps

Run these GitHub Actions workflows from the repository Actions tab:

1. `Release Command Run`
2. `Release Gate`
3. `Deploy Fly API`
4. `Smoke Test`

Then run or confirm the command sequence:

```bash
pnpm run build:api
pnpm run test:api
pnpm run fly:deploy
pnpm run production:smoke-test
```

## Evidence to capture

Record the following in `docs/LAUNCH_EVIDENCE_LOG.md`:

- Workflow name
- Workflow run date/time
- Commit SHA
- Result
- Production web URL checked
- Production API URL checked
- Health path responses
- Any failure links or follow-up PRs

## Acceptance criteria

- API build passes.
- API tests pass.
- Fly deploy completes or is confirmed not needed for the tested commit.
- Production smoke test passes.
- Liveness and readiness endpoints return expected statuses.
- Evidence is recorded in the launch evidence log.

## Automation or repeatable loop

Run this before every release candidate:

1. Merge only green PRs.
2. Run `Release Command Run`.
3. Run `Release Gate`.
4. Run production smoke test.
5. Record evidence.
6. Open a fix PR for any failure.

## Risk check

Do not move to paid beta or public launch while API health, deploy health, smoke tests, database migration status, Stripe webhook behavior, backup restore, or manual auth/freight workflows are unknown.

## Fallback option

If GitHub Actions cannot access a required provider, run the commands from a trusted local machine with the proper provider CLI sessions configured, then paste only non-sensitive evidence into the launch evidence log.

## Related

Supports #2212.
