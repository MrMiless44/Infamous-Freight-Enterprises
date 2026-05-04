<p align="center">
  <a href="https://infamousfreight.com" target="_blank" rel="noopener noreferrer">
    <img src="/docs/screenshots/infamousfreight-header.svg" alt="Infamous Freight" width="100%">
  </a>
</p>

# Contributing

This repository uses a small, strict workflow so production work stays clean and traceable.

## Required workflow

1. Create a fresh branch from current `main`.
2. Keep the change focused.
3. Run validation before opening a PR.
4. Open a pull request into `main`.
5. Wait for CI to pass.
6. Squash merge.
7. Delete the branch after merge.

## Package manager policy

This repository is standardized on **pnpm**.

- Use `pnpm install`, not `npm install`.
- Keep `pnpm-lock.yaml` in sync with any dependency or package manifest changes.
- Do not mix npm and pnpm lockfile workflows.
- If a PR changes `package.json`, `apps/**/package.json`, or workspace dependency configuration, update the lockfile when required.

## Branch naming

Use clear prefixes:

```text
feature/<short-description>
fix/<short-description>
docs/<short-description>
chore/<short-description>
security/<short-description>
```

Avoid reviving stale Codex/Copilot branches. Cherry-pick unique work into a fresh branch from `main` instead.

## Local validation

Run from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm -C apps/api exec tsc -p tsconfig.json --noEmit
pnpm -C apps/web exec tsc -p tsconfig.json --noEmit
pnpm -C apps/api run test:coverage
```

If available, run the repo validator:

```bash
pnpm run validate
```

## Pull request requirements

Every PR should include:

- what changed
- why it changed
- validation evidence
- screenshots or logs when relevant
- environment or secret changes, if any
- linked issue, if applicable

## Production changes

Production-impacting changes must identify:

- affected service
- deployment workflow
- required secrets
- rollback plan
- smoke-test evidence

Do not mark production ready until required health checks pass.

## Commit style

Use Conventional Commits:

```text
feat: add dispatch workflow
fix: correct API health check
docs: add launch checklist
chore: update CI runtime
security: tighten CORS policy
```

## Pull requests from forks

If you are contributing from a fork, a few CI behaviors are expected and not bugs:

- **First-time contributors require maintainer approval.** GitHub will hold workflow runs from forks until a maintainer clicks **Approve and run** on the PR. This is a repository-level security setting, not a workflow misconfiguration.
- **Some checks intentionally skip on fork PRs.** Workflows that require repository secrets cannot run from a fork because GitHub does not expose those secrets to fork-triggered `pull_request` runs, and `GITHUB_TOKEN`'s `security-events: write` permission is downgraded to read-only. Today this affects two workflows, which are explicitly gated to skip on fork PRs:
  - **Vercel Preview** — needs `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`. Netlify is the required deploy gate, so skipping here is non-blocking.
  - **Codacy Security Scan** — needs `CODACY_PROJECT_TOKEN` and write access to code-scanning. Codacy still runs on push to `main`, on schedule, and on same-repo PRs, so coverage of the production branch is unchanged.

  Other workflows that use secrets (Fly deploy, npm publish, etc.) only run on push, release, or `workflow_dispatch`, so they are not invoked by fork PRs in the first place.
- **The following must still pass on fork PRs before merge:** lint, API and web TypeScript typecheck, unit tests, the smoke-test workflow's required checks, and CodeQL. If any of these fail, fix them in the PR; do not merge around them.
- **Maintainers:** when re-running a fork PR after pushing fixes, click **Approve and run** again rather than merging green-checked-but-stale runs.

## Secrets

Never commit secrets, tokens, private keys, credentials, `.env` files, or screenshots containing secrets. If a secret is exposed, rotate it immediately and open a blocker issue.
