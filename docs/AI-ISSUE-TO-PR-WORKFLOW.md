# AI Issue-to-PR Workflow

This workflow standardizes safe AI-assisted implementation.

## Goals

- Convert scoped issues into focused pull requests.
- Keep changes small, reviewable, and reversible.
- Require validation before merge.
- Prevent uncontrolled autonomous behavior.

## Workflow

```text
Issue
→ scope analysis
→ branch creation
→ focused patch
→ validation
→ draft PR
→ review
→ merge
```

## Required issue structure

Use the `AI implementation task` issue template.

Every issue should define:

- objective
- acceptance criteria
- constraints
- validation commands
- deployment impact
- rollback plan

## Branch naming

```text
feature/<issue-id>-short-description
fix/<issue-id>-short-description
ops/<issue-id>-short-description
```

## Required validation

```bash
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run test
```

## Safety rules

AI agents must not:

- bypass CI
- commit secrets
- disable auth/security
- deploy automatically to production
- modify billing logic without validation
- change migrations without rollback planning

## Recommended automation path

1. GitHub issue created.
2. Label issue.
3. Create scoped branch.
4. Implement smallest viable change.
5. Run focused validation.
6. Open draft PR.
7. Run full CI.
8. Human review before merge.

## Future expansion

- automatic branch creation
- AI-generated PR summaries
- automatic smoke-test comments
- deployment summaries
- rollback metadata generation
