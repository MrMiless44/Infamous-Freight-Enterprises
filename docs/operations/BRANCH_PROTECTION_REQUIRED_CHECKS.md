# Branch Protection Required Checks Runbook

## Purpose

PR #2255 reduced pull request check noise by moving duplicate and provider-heavy workflows off routine pull request events. This runbook gives the owner a safe branch-protection update path so pull requests are not blocked by checks that no longer run.

## Best free/legal gateway

Use GitHub repository settings. No paid tool, token sharing, or bypass is required.

## Exact next steps

1. Open the canonical repository: `Infaemous-Freight/Infamous-freight`.
2. Go to `Settings -> Rules -> Rulesets` or `Settings -> Branches -> Branch protection rules`.
3. Open the rule that protects `main`.
4. Keep required pull request reviews enabled if already enabled.
5. Update required status checks to the smallest reliable PR gate.

## Recommended required check

Keep this required:

```text
Required Checks
```

## Remove from required checks if present

These workflows were intentionally moved off routine pull requests or should not block normal PRs:

```text
CI
API CI
CI/CD — Infamous Freight
Full Validation
Docker Build Check
Ops Snapshot
Deploy AI Dispatch
Netlify Preview Comment
CodeQL Advanced
Codacy Security Scan
Fortify AST Scan
Microsoft Defender For Devops
Phase 1 Security and Monitoring Gate
SBOM and Dependency Audit
Auto Assign
```

## Verification

Open a small test PR that changes only documentation. Confirm the PR shows:

- `Required Checks` as the main blocking check.
- No pending checks that never start.
- No provider-token or vendor-scan checks blocking a normal PR.

## Automation or repeatable loop

Run this review monthly or after any workflow change:

1. List workflows that trigger on `pull_request`.
2. Compare them to branch-protection required checks.
3. Remove any required check that no longer runs on PRs.
4. Keep deep checks on push to `main`, schedule, or manual dispatch.

## Risk check

Do not disable branch protection globally. Do not remove the consolidated required gate unless another reliable required gate replaces it.

## Fallback option

If branch protection cannot be edited, leave PR #2255 merged and manually approve/merge only after `Required Checks` passes until the repo ruleset is updated.
