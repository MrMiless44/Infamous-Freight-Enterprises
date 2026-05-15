# Architecture Decision Records

Use this folder for Architecture Decision Records (ADRs). ADRs keep important technical decisions searchable, reviewable, and easy for future maintainers or AI agents to understand.

## When to write an ADR

Create an ADR when a change affects any of these areas:

- application architecture
- database schema or migration strategy
- deployment platform or infrastructure
- authentication, authorization, or tenant isolation
- billing or payment flows
- realtime architecture
- observability, logging, or incident response
- security-sensitive behavior
- major library or framework choices

## ADR format

Copy `0000-template.md` and increment the number.

Use this status flow:

- Proposed
- Accepted
- Superseded
- Deprecated

## Naming

Use lowercase kebab-case:

```text
0001-use-fly-for-api-runtime.md
0002-netlify-web-proxy-contract.md
```

## Review standard

Every ADR should explain:

1. context
2. decision
3. consequences
4. alternatives considered
5. rollout or rollback notes
