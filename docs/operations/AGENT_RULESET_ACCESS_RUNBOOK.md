# Agent Ruleset Access Runbook

## Purpose

Allow approved coding agents to create feature branches and pull requests without weakening protection on `main`.

This runbook covers GitHub repository settings that cannot be safely changed from repository code.

## Best free/legal gateway

Use GitHub repository settings. No private credential sharing or global branch protection disablement is required.

## Exact next steps

1. Open the canonical repository settings.
2. Go to `Settings -> Rules -> Rulesets`.
3. Review rulesets that target:
   - `main`
   - protected release branches
   - agent-created branch patterns
4. Add the approved agent/app as a bypass actor only where necessary.
5. Prefer bypass or exceptions for agent feature branches, not direct writes to `main`.
6. Confirm the agent can create a branch and open a pull request.
7. Confirm `main` still requires review and the consolidated required check.

## Recommended branch pattern

Allow agents to create and update branches such as:

```text
copilot/**
agent/**
docs/**
fix/**
chore/**
feature/**
```

Keep `main` protected.

## Verification

After updating settings:

1. Assign a small docs-only issue to the agent.
2. Confirm the agent starts successfully.
3. Confirm the agent creates a branch.
4. Confirm the agent opens a pull request.
5. Confirm the pull request is still gated before merge.

## Automation or repeatable loop

Review agent access monthly:

1. Confirm only approved apps/users have bypass permissions.
2. Confirm bypass scope is limited to non-production branches.
3. Confirm `main` still requires PR review and `Required Checks`.
4. Remove stale agent access.

## Risk check

Do not disable branch protection globally. Do not grant broad bypass to all users. Do not allow direct agent writes to production branches unless explicitly approved for an emergency.

## Fallback option

If ruleset bypass still fails, keep agents in PR-only mode and contact GitHub/OpenAI support with the request ID from the failed agent run.

## Related

Supports #2232.
