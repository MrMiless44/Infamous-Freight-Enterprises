# Infamous Freight Execution Agent Playbook (Free-First, Legal-Only)

Use this operating loop for **every** request:

**Discover → Build → Verify → Optimize → Scale**

This document is intentionally execution-focused (not theory) so work can move from request to deploy safely.

## 0) Non-Negotiables
- Never use illegal, deceptive, abusive, spammy, pirated, hacked, or unauthorized methods.
- Never bypass paywalls or misuse credentials/free trials.
- Keep tenant isolation strict (`tenantId` on scoped data access).
- Enforce RBAC on protected routes.
- Log AI decisions to `AiDecisionLog`.
- Keep billing idempotent with `BillingEvent`.

## 1) Discover
### Best free/legal gateways (default order)
1. **Official free tier** of existing provider in stack (least migration risk)
2. **Public API** with explicit ToS + rate limits
3. **Open-source self-hosted option** on low-cost/free compute
4. **Community templates/starters** from trusted maintainers
5. **Credits/grants** (cloud/startup/community)

### Discovery checklist
- Define desired outcome and measurable acceptance criteria.
- Confirm legal/compliance constraints and data sensitivity.
- Map to architecture priority:
  1. Auth
  2. Org/tenant isolation
  3. RBAC
  4. Config/env
  5. Shared contracts
  6. Audit logs
  7. Error handling
- Select the lowest-cost legal path that preserves production stability.

## 2) Build
### Minimal safe implementation rules
- Ship the smallest reversible change.
- Avoid broad rewrites unless required by failing checks.
- Keep imports/types aligned with workspace boundaries.
- Reuse existing patterns in `apps/api` and `apps/web`.

### Free-first implementation pattern
- Start with open-source SDKs/clients.
- Prefer official API docs/examples over community snippets.
- Template-first scaffolding, then tighten for tenant/RBAC constraints.

## 3) Verify
Run in this order:
1. `pnpm -w prisma generate`
2. `pnpm -w test -- --runInBand`
3. `pnpm -w build`

### Required runtime and safety assertions
- API health endpoint returns 200.
- App binds to `PORT=3000`.
- Docker build remains successful.
- Protected endpoints enforce RBAC.
- Tenant data access remains tenant-scoped.
- AI writes `AiDecisionLog` entries.
- Billing writes idempotent `BillingEvent` entries.

## 4) Optimize
### Automation loops to add when repeated >2 times
- Script frequent local sequences (validate/build/test).
- Add CI gates for typecheck + tests + build.
- Add regression tests for every fixed production bug.
- Track and remove flaky tests.

### Standard automation loop
1. Detect failure signal (test/build/runtime alert).
2. Reproduce with focused command.
3. Apply smallest fix.
4. Re-run impacted tests.
5. Re-run full verification.
6. Commit with clear scope.

## 5) Scale
- Convert successful fixes into templates/playbooks.
- Promote repeated workflows into scripts and CI jobs.
- Track operational KPIs:
  - Build pass rate
  - Test pass rate
  - Deployment success rate
  - Incident count/MTTR

---

## Mandatory Response Format (for every task)
1. **Best free/legal gateway**
2. **Exact next steps**
3. **Tools/resources**
4. **Automation or repeatable loop**
5. **Risk check**
6. **Fallback option**
7. **Next 3 moves**

## Quick Reference: Low-Cost/Free-First Resource Types
- Official free tiers: cloud/app monitoring/database providers already approved by team.
- Open-source tools: framework-native CLIs, test runners, schema tools.
- Public APIs: provider APIs with published pricing/rate limits and terms.
- Community resources: maintained starter templates, docs examples, OSS issue patterns.
- Grants/credits: startup programs and ecosystem credits where terms permit commercial use.
