# Owner Action Runbook — Infamous Freight

This runbook covers tasks that cannot be completed by automation alone because they require account-owner approval, dashboard access, legal review, or private secret values.

## 1. Funding / DocuSign

### Goal
Resolve the pending business loan / line of credit package.

### Steps
1. Open the DocuSign package from the lender.
2. Confirm the borrower name, entity type, business address, guarantor language, APR/fees, repayment terms, and collateral/security provisions.
3. Confirm the package matches the LLC transition plan.
4. Sign only if the legal and financial terms are acceptable.
5. Save the signed PDF to the finance/legal records folder.

### Risk check
Do not sign if the borrower/entity, personal guarantee, repayment terms, or collateral language is unclear.

## 2. Supabase Auth leaked password protection

### Goal
Clear the remaining Supabase Auth security advisor warning.

### Steps
1. Open Supabase dashboard.
2. Select project `Infæmous` / ref `wnaievjffghrztjuvutp`.
3. Go to Authentication settings.
4. Enable leaked password protection / compromised password protection.
5. Save settings.
6. Rerun Supabase Security Advisors.

### Risk check
This can block users from choosing known-compromised passwords. That is desirable for production, but support should be ready for password reset questions.

## 3. GitHub Actions secrets

### Goal
Confirm production deploy workflows can authenticate.

### Required GitHub Actions secret
- `FLY_API_TOKEN`

### Steps
1. Open GitHub repo `Infaemous-Freight/Infamous-freight`.
2. Go to Settings → Secrets and variables → Actions.
3. Confirm `FLY_API_TOKEN` exists.
4. If missing, create it using a Fly.io token with access to `infamous-freight-api`.
5. Run Actions → Ops Preflight → Run workflow.

## 4. Fly.io secrets and health

### Goal
Confirm the Fly app is deployable and has production secrets.

### Local verification
```bash
chmod +x scripts/fly-local-verify.sh
./scripts/fly-local-verify.sh
```

### Required hard-fail secret
- `DATABASE_URL`

### Recommended checked secrets
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_JWT_SECRET`

### Manual Fly commands
```bash
curl -L https://fly.io/install.sh | sh
flyctl version
flyctl auth login
flyctl auth whoami
flyctl config validate --config fly.toml
flyctl checks list -a infamous-freight-api
```

## 5. Deploy sequence

### Goal
Deploy only after operational readiness checks pass.

### Steps
1. Run GitHub Actions → Ops Preflight.
2. Fix missing secrets or failed endpoint checks.
3. Run GitHub Actions → Deploy Fly API.
4. Confirm GitHub Actions → Uptime Check passes.
5. Confirm API health endpoints:

```bash
curl -fsS https://infamous-freight-api.fly.dev/api/health/live
curl -fsS https://infamous-freight-api.fly.dev/api/health/ready
curl -fsS https://api.infamousfreight.com/api/health/live
curl -fsS https://api.infamousfreight.com/api/health/ready
```

## 6. Supabase security migration verify/rollback

### Applied migration
- `supabase/migrations/20260514043500_harden_remaining_security_definer_rpc.sql`

### Verify after deploy
1. Run Supabase Security Advisors and confirm no SECURITY DEFINER execution warning remains for:
   - `public.review_document(uuid, text, text)`
   - `public.verify_profile(uuid, boolean, text)`
2. Smoke test admin/dispatcher profile verification and document review flows.

### Rollback path
If admin/dispatcher flows regress after deployment, restore previous function privilege model in a rollback migration by setting both functions back to `SECURITY DEFINER` and restoring their prior grants, then rerun advisors and smoke tests.

## 7. Decision rule

No new production feature scope until:

1. Funding package is signed or rejected.
2. Ops Preflight passes.
3. Deploy Fly API passes.
4. Uptime Check passes.
5. Supabase leaked password protection is enabled.
6. Supabase Security Advisors pass for SECURITY DEFINER RPC exposure and webhook tables/views.
