# Safe Rebase Procedure

Use this procedure when rebasing an Infamous Freight feature branch onto `main` or another target branch.

## Before rebasing

Do not rebase a shared branch that multiple people are actively using unless the team has agreed to rewrite history.

Create and push a backup branch first:

```bash
git status
git checkout <source-branch>
git fetch origin
git branch <source-branch>-backup
git push origin <source-branch>-backup
```

## Rebase onto the target branch

For the usual case, rebase the source branch onto `origin/main`:

```bash
git checkout <source-branch>
git fetch origin
git rebase origin/main
```

Use interactive rebase only when you need to reorder, squash, or fix up commits:

```bash
git rebase -i origin/main
```

## Resolve conflicts

For each conflict:

```bash
# Edit conflicted files.
git add <file>
git rebase --continue
```

Abort the rebase if the branch gets into a bad state:

```bash
git rebase --abort
git checkout <source-branch>-backup
```

## Validate after rebasing

Run the repository checks before pushing:

```bash
pnpm install --frozen-lockfile
pnpm run codex:env-check
pnpm run prisma:generate
pnpm run lint
pnpm run build
pnpm run test
```

Run strict environment validation when the task depends on all required runtime variables:

```bash
pnpm run codex:env-check:strict
```

## Push safely

Use force-with-lease, not a plain force push:

```bash
git push --force-with-lease origin HEAD:<source-branch>
```

This protects against overwriting someone else’s newer remote work.

## PR follow-up

After pushing:

- Confirm GitHub Actions starts a fresh run.
- Confirm CI passes.
- Leave a short PR comment that says the branch was rebased and lists any manual conflict fixes.
- Do not merge until the new post-rebase checks pass.

Example PR comment:

```text
Rebased this branch onto origin/main. Resolved conflicts locally and reran env check, lint, build, and tests before pushing with --force-with-lease.
```

## Special cases

Use `--onto` only when moving a specific commit range:

```bash
git rebase --onto <new-base> <old-base> <source-branch>
```

Prefer merging `main` into the branch instead of rebasing when the branch is long-running or shared by multiple developers.
