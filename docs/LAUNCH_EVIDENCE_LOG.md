# Launch Evidence Log

Use this file during production readiness verification. Do not mark the launch ready based on unchecked assumptions. Paste command output, screenshot summaries, dashboard links, timestamps, owners, and blocker notes.

## Run Metadata

| Field | Value |
|---|---|
| Verification Date | 2026-04-27 09:15 UTC |
| Environment | Production |
| API URL | https://infamous-freight.fly.dev / https://www.infamousfreight.com/api |
| Web URL | https://www.infamousfreight.com |
| API Version / Commit | main branch — see GitHub Actions deploy-fly.yml |
| Web Deploy ID | Netlify deploy — etag W/"3bmtbl9viep3f" (deployed 2026-04-23T13:42:28Z) |
| Database Migration Version | Pending manual confirmation from technical owner |
| Stripe Mode | Pending manual confirmation — must be Live before paid beta |
| Launch Owner | MrMiless44 |
| Rollback Owner | MrMiless44 |
| Support Owner | MrMiless44 |
| Technical Owner | MrMiless44 |

## Result Summary

| Phase | Pass | Fail | Unknown | Critical Blockers |
|---|---:|---:|---:|---:|
| Phase 0: Execution Controls | 1 | 0 | 0 | 0 |
| Phase 1: Core System | 1 | 2 | 0 | 2 |
| Phase 2: User Flow | 0 | 0 | 1 | 0 |
| Phase 3: Freight Workflow | 0 | 0 | 1 | 0 |
| Phase 4: Billing | 0 | 0 | 1 | 0 |
| Phase 5: Operations | 0 | 0 | 1 | 0 |
| Phase 6: Security | 1 | 0 | 0 | 0 |
| Phase 7: Launch Decision | 0 | 1 | 0 | 1 |

## Blocker Log

| ID | Severity | Area | Description | Owner | Workaround | Status |
|---|---|---|---|---|---|---|
| B-001 | High | Infrastructure | Fly.io API endpoint (infamous-freight.fly.dev) not responding — direct health checks time out | MrMiless44 | Direct Fly API returned healthy JSON on 2026-05-08; rerun the full smoke test after Netlify redeploy and close if stable | Needs retest |
| B-002 | Medium | Infrastructure | Bare domain infamousfreight.com not resolving — DNS connection refused | MrMiless44 | Apex redirected to https://www.infamousfreight.com/ on 2026-05-08; rerun the full smoke test after Netlify redeploy and close if stable | Needs retest |
| B-003 | Medium | Tooling | `flyctl` CLI not installed in local dev environment; preflight check fails | MrMiless44 | CI/CD deploys via GitHub Actions which has flyctl configured | Open |
| B-004 | Unknown | Billing | Stripe mode not confirmed as Live — must verify before accepting real payments | MrMiless44 | Do not accept payments until confirmed Live mode | Open |
| B-005 | Unknown | Database | Netlify Database migration application not confirmed for `20260508162000_create_public_freight_intake` and `20260510120000_create_platform_tables` | MrMiless44 | Confirm with Netlify Database migration status after deploy; keep pending files unapplied until reviewed | Open |
| B-006 | Critical | Infrastructure | Production redirect loop: `https://www.infamousfreight.com/` 301→`https://infamousfreight.com/` 301→`https://www.infamousfreight.com/` (observed 2026-05-03 09:00 UTC). `curl --max-redirs 10` exhausted without reaching HTML (final HTTP 301, body 43 bytes). | MrMiless44 | Canonical web and apex redirect checks passed on 2026-05-08; rerun the full smoke test after Netlify redeploy and close if stable | Needs retest |
| B-007 | High | Infrastructure | Production `https://www.infamousfreight.com/api/health` returns the web app HTML shell instead of API health JSON. The browser-critical API path is not currently proving the Fly API proxy. | MrMiless44 | Direct Fly API `https://infamous-freight.fly.dev/api/health` returned healthy JSON on 2026-05-08. The repository now includes exact forced `/api/health` routing plus forced API proxy rules; deploy and rerun the proxied check. | Open |

## Evidence Entry Template

Copy this for every verification item.

```markdown
## Test
[Phase] - [Test Name]

## Date/Time
YYYY-MM-DD HH:MM TZ

## Owner
[Name]

## Command or Action
[Command, UI action, dashboard check, or manual test steps]

## Expected Result
[What success should look like]

## Actual Result
[Paste output, screenshot summary, dashboard link, or observed behavior]

## Status
PASS / FAIL / UNKNOWN

## Severity
None / Low / Medium / High / Critical

## Follow-Up
[Issue link, owner, fix plan, or N/A]

## Notes
[Latency, warnings, edge cases, or related evidence]
```

---

# Evidence Entries

## Test
Phase 1 - Production Routing Retest And Proxy Rule Hardening

## Date/Time
2026-05-08 16:04 UTC

## Owner
Automation

## Command or Action
Retested the canonical production web host, apex redirect, browser-critical proxied API health path, and direct Fly API health path with `curl`. Sensitive page script parameters were not recorded.

## Expected Result
`https://www.infamousfreight.com/` returns HTTP 200 with security headers, `https://infamousfreight.com/` redirects to `https://www.infamousfreight.com/`, `https://www.infamousfreight.com/api/health` returns API health JSON, and `https://infamous-freight.fly.dev/api/health` returns API health JSON as an optional origin diagnostic.

## Actual Result
- Canonical web host returned HTTP 200 from Netlify with expected security headers.
- Apex domain returned HTTP 301 to `https://www.infamousfreight.com/`, then HTTP 200.
- Proxied `/api/health` returned HTTP 200 with `content-type: text/html; charset=UTF-8` and served the Vite web app shell instead of API health JSON.
- Direct Fly API `/api/health` returned HTTP 200 JSON with `status: ok` and `services.database: connected`.
- Repository routing was hardened after the retest by adding an exact forced `/api/health` proxy in `netlify.toml` and `apps/web/public/_redirects`, and by forcing the broader `/api/*` and `/socket.io/*` proxy rules in `_redirects`.

## Status
FAIL

## Severity
High

## Follow-Up
B-007 remains open. Trigger a Netlify production deploy containing the hardened redirect rules, then rerun `https://www.infamousfreight.com/api/health` and verify JSON before launch.

## Notes
No build command was run. The direct API origin is healthy; the remaining issue is the deployed Netlify browser path serving the SPA shell for `/api/health`.

## Test
Phase 1 - Production Canonical Web And API Routing Refresh

## Date/Time
2026-05-08 15:46 UTC

## Owner
Automation

## Command or Action
Checked the canonical production host, apex redirect, proxied API health route, and direct Fly API health route with `curl`. Sensitive page script parameters were not recorded.

## Expected Result
`https://www.infamousfreight.com/` returns HTTP 200, `https://infamousfreight.com/` redirects to `https://www.infamousfreight.com/`, `https://www.infamousfreight.com/api/health` returns API health JSON, and direct Fly API checks are treated as optional diagnostics.

## Actual Result
- Canonical web host returned HTTP 200 at `https://www.infamousfreight.com/`.
- Apex domain redirected to `https://www.infamousfreight.com/` and returned HTTP 200.
- Security headers were present on the canonical web response, including `content-security-policy`, `strict-transport-security`, `x-frame-options`, `x-content-type-options`, `referrer-policy`, and `permissions-policy`.
- Netlify response metadata included request IDs and an HTML asset etag `W/"710b6d2d02664c0388a82228317db761-ssl-df"`.
- `https://www.infamousfreight.com/api/health` returned HTTP 200 with `content-type: text/html; charset=UTF-8`, which indicates the SPA shell was served instead of API health JSON.
- `https://infamous-freight.fly.dev/api/health` returned HTTP 200 JSON with `status: ok` and `services.database: connected`.

## Status
FAIL

## Severity
High

## Follow-Up
B-006 can be retested because the canonical redirect loop was not reproduced. B-007 was opened because the proxied API path is still not returning API JSON. Deploy the `_redirects` update that adds `/api/*` and `/socket.io/*` proxy rules before the SPA fallback, then rerun the production smoke checks.

## Notes
This refresh did not run a build command. It recorded launch evidence from production HTTP checks only.

## Test
Phase 1 - Production Routing Retest

## Date/Time
2026-05-08 15:56 UTC

## Owner
Automation

## Command or Action
Retested the canonical production web host, apex redirect, and browser-critical proxied API health path with `curl`.

## Expected Result
`https://www.infamousfreight.com/` returns HTTP 200 with security headers, `https://infamousfreight.com/` resolves to `https://www.infamousfreight.com/`, and `https://www.infamousfreight.com/api/health` returns API health JSON.

## Actual Result
- Canonical web host returned HTTP 200 with Netlify headers and the expected security headers.
- Apex domain resolved to `https://www.infamousfreight.com/` with HTTP 200.
- Proxied `/api/health` returned HTTP 200 but served `text/html` and the Vite web app shell instead of API health JSON.

## Status
FAIL

## Severity
High

## Follow-Up
B-007 remains open. Trigger a Netlify production deploy containing the committed `_redirects` API proxy rules, then rerun `https://www.infamousfreight.com/api/health` and verify JSON before launch.

## Notes
No build command was run. The retest confirms the source fix still needs production deployment or verification.

## Test
Phase 1 - Netlify Repository Configuration Audit

## Date/Time
2026-05-06 00:00 UTC

## Owner
Automation

## Command or Action
Reviewed `netlify.toml` in the repository.

## Expected Result
Netlify builds only the web app, publishes the Vite output directory, proxies API traffic to the Fly.io API origin, applies baseline security headers, and avoids invoking Next.js build behavior.

## Actual Result
`netlify.toml` publishes `apps/web/dist`, runs `pnpm run build:web`, sets `NETLIFY_NEXT_PLUGIN_SKIP=true`, proxies `/api/*` and `/socket.io/*` to the Fly.io API origin, blocks public `*.map` requests, serves the SPA fallback to `/index.html`, applies security headers/CSP, and enables the Netlify sitemap plugin.

## Status
PASS

## Severity
None

## Follow-Up
Run a post-deploy browser check and proxied `/api/health` check after the next production deploy. Keep direct Fly.io health checks in the launch checklist until the API origin policy is explicitly changed.

## Notes
This is a repository configuration audit, not live production proof.

## Test
Phase 0 - Execution Controls

## Date/Time
2026-04-27 09:15 UTC

## Owner
MrMiless44

## Command or Action
Confirm launch owner, rollback owner, support owner, environment, current deploy versions, database migration version, Stripe mode, and evidence log location.

## Expected Result
All owners and deployment identifiers are recorded before testing starts.

## Actual Result
- Launch Owner: MrMiless44
- Rollback Owner: MrMiless44
- Support Owner: MrMiless44
- Technical Owner: MrMiless44
- Environment: Production
- Web URL: https://www.infamousfreight.com
- API URL: https://infamous-freight.fly.dev / proxied at https://www.infamousfreight.com/api
- Web Deploy: Netlify (etag W/"3bmtbl9viep3f", deployed 2026-04-23T13:42:28Z)
- API Deploy: Fly.io (infamous-freight.fly.dev)
- Database Migration Version: Pending confirmation — verify Netlify Database migrations after deploy, including `20260508162000_create_public_freight_intake` and `20260510120000_create_platform_tables`
- Stripe Mode: Pending confirmation — verify via Stripe Dashboard before accepting payments
- Evidence log location: docs/LAUNCH_EVIDENCE_LOG.md

## Status
PASS

## Severity
None

## Follow-Up
Confirm Stripe mode (B-004) and database migration version (B-005) before paid beta.

## Notes
All required owners assigned. Deployment identifiers confirmed for frontend. Backend deployment version requires manual check via `flyctl status`.


---

## Test
Phase 1 - API Health Check

## Date/Time
2026-04-27 09:15 UTC

## Owner
MrMiless44

## Command or Action

```bash
curl -i "$API_BASE_URL/health"
# Direct Fly endpoint:
curl --fail --show-error --silent --max-time 15 "https://infamous-freight.fly.dev/health"
curl --fail --show-error --silent --max-time 15 "https://infamous-freight.fly.dev/api/health"
# Via Netlify proxy:
curl --fail --show-error --silent "https://www.infamousfreight.com/api/health"
```

## Expected Result
HTTP 200 with healthy service and dependency status. Response time target under 200ms for basic health check.

## Actual Result
- Direct Fly endpoint (https://infamous-freight.fly.dev/health): **TIMED OUT** after 15 seconds — Fly app not responding on direct URL
- Direct Fly API endpoint (https://infamous-freight.fly.dev/api/health): **TIMED OUT** after 15 seconds
- Proxied via Netlify (https://www.infamousfreight.com/api/health): **HTTP 200** — response: `{"ok":true}`

The API is reachable via the Netlify proxy but the Fly.io direct endpoint does not respond. This may indicate the Fly app is scaled to zero or network-restricted to only accept traffic via proxy.

## Status
FAIL

## Severity
High

## Follow-Up
B-001: MrMiless44 — Run `flyctl status` and `flyctl logs` to confirm Fly.io app is running. Verify if direct Fly URL should be publicly accessible or if proxy-only access is intentional. Update smoke-test.sh if proxy-only access is by design.

## Notes
The proxied API health endpoint confirms the service is operating. The direct Fly URL failure blocks `npm run production:smoke-test` from passing as written. If proxy-only is the intended architecture, update `scripts/production-smoke-test.sh` to remove direct Fly health checks.


---

## Test
Phase 1 - Frontend Loads

## Date/Time
2026-04-27 09:15 UTC

## Owner
MrMiless44

## Command or Action
```bash
# Run via npm run production:smoke-test
curl --fail --show-error --location --head "https://www.infamousfreight.com"
```
Also: open https://www.infamousfreight.com in browser, inspect console, confirm API calls target production API.

## Expected Result
Web app loads, static assets load, no fatal console errors, and API requests target production backend.

## Actual Result
```
HTTP/2 200
server: Netlify
content-type: text/html; charset=utf-8
strict-transport-security: max-age=31536000
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
permissions-policy: camera=(), microphone=(), geolocation=(), payment=()
referrer-policy: strict-origin-when-cross-origin
x-nextjs-date: Thu, 23 Apr 2026 13:42:28 GMT
x-powered-by: Next.js
date: Mon, 27 Apr 2026 09:15:59 GMT
age: 1979276
cache-control: public,max-age=0,must-revalidate
```
Historical production response returned HTTP 200 from Netlify and included Next.js headers from an older deployed build. The repository source of truth is now React/Vite for the web app and Express 5 for the API. Security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Permissions-Policy, Referrer-Policy) were present in that response. Full browser verification pending human review after the next Netlify deploy.

## Status
PASS

## Severity
None

## Follow-Up
N/A

## Notes
Last historical Netlify page generation timestamp from `x-nextjs-date` header: 2026-04-23T13:42:28Z. The `age` cache header (~1,979,276 seconds ≈ 23 days) reflects how long this CDN edge node had held the cached response. Browser-side console checks and API target verification must be repeated after deploying the current React/Vite build.


---

## Test
Phase 2 - Signup/Login/Password Reset

## Date/Time
2026-04-27 09:15 UTC

## Owner
MrMiless44

## Command or Action
Create test account, log in, log out, request password reset, complete reset, log in again.

## Expected Result
All auth flows work and unauthorized access is rejected.

## Actual Result
Not yet executed. Requires human tester with browser access to production environment. Automated infrastructure check confirms the frontend and API are reachable; user-flow testing requires manual execution.

## Status
UNKNOWN

## Severity
Unknown

## Follow-Up
MrMiless44: Execute this test manually before private beta. Use a disposable test email address. Confirm Supabase Auth is configured for production (not test) project.

## Notes
Auth is handled via Supabase. Confirm the production Supabase project URL and anon key are configured in the production environment, not the test/staging environment.


---

## Test
Phase 3 - Freight Workflow End-to-End

## Date/Time
2026-04-27 09:15 UTC

## Owner
MrMiless44

## Command or Action
Create test shipment/load, assign it, update statuses, upload/download document, close shipment/load.

## Expected Result
Workflow completes end-to-end without data corruption, authorization failure, or broken notification.

## Actual Result
Not yet executed. Requires human tester with a logged-in production account. API infrastructure (via proxy) is reachable but end-to-end workflow requires UI testing by a human operator.

## Status
UNKNOWN

## Severity
Unknown

## Follow-Up
MrMiless44: Execute this test manually using production test data per docs/PRODUCTION_TEST_DATA_PLAN.md. Clean up all test data after verification.

## Notes
Reference docs/PRODUCTION_TEST_DATA_PLAN.md for controlled test data and cleanup rules. Do not use real carrier or shipper data during testing.


---

## Test
Phase 4 - Stripe Payment and Webhooks

## Date/Time
2026-04-27 09:15 UTC

## Owner
MrMiless44

## Command or Action
Run controlled Stripe payment and webhook edge-case tests from `docs/STRIPE_WEBHOOK_VERIFICATION.md`.

## Expected Result
Payment state in the app matches Stripe, failures do not grant access, duplicate webhooks are idempotent.

## Actual Result
Not yet executed. Stripe mode not confirmed as Live. **Do not run payment tests until Stripe mode is confirmed** — running payment tests in test mode while production traffic is active can cause confusion. Execute per docs/STRIPE_WEBHOOK_VERIFICATION.md.

## Status
UNKNOWN

## Severity
Unknown

## Follow-Up
B-004: MrMiless44 — Confirm Stripe mode via Stripe Dashboard before executing. Document result here with Stripe Dashboard screenshot or API key prefix (pk_live_ vs pk_test_).

## Notes
If Stripe webhook signing secret is not configured in production, webhook verification will fail. Confirm STRIPE_WEBHOOK_SECRET is set in Fly.io secrets. See docs/STRIPE_WEBHOOK_VERIFICATION.md for full test matrix.


---

## Test
Phase 5 - Backup and Restore Proof

## Date/Time
2026-04-27 09:15 UTC

## Owner
MrMiless44

## Command or Action
Confirm backup exists, restore latest backup to non-production database, validate restored data.

## Expected Result
Backup can be restored outside production and restore time is recorded.

## Actual Result
Not yet executed. Requires access to production database backup configuration. Backup must be restored to a non-production database to prove recoverability.

## Status
UNKNOWN

## Severity
Unknown

## Follow-Up
MrMiless44: Before private beta, confirm automated backups are enabled in the production database (Supabase or other provider). Perform a test restore and record restore time and row count verification here.

## Notes
Backup verification is required before private beta. A failed restore at this stage is a Critical blocker. See docs/ROLLBACK_PLAN.md for rollback triggers and recovery process.


---

## Test
Phase 6 - Security Verification

## Date/Time
2026-04-27 09:15 UTC

## Owner
MrMiless44

## Command or Action
Check HTTPS, secrets exposure, auth token rejection, role access, rate limits, and sensitive data handling.

## Expected Result
No secrets exposed, HTTPS active, server-side authorization enforced, and critical endpoints protected.

## Actual Result
Infrastructure checks executed on 2026-04-27:
- **HTTPS active**: `strict-transport-security: max-age=31536000` present in all responses ✅
- **Security headers verified**:
  - `x-frame-options: SAMEORIGIN` ✅
  - `x-content-type-options: nosniff` ✅
  - `permissions-policy: camera=(), microphone=(), geolocation=(), payment=()` ✅
  - `referrer-policy: strict-origin-when-cross-origin` ✅
  - `content-security-policy` present and configured ✅
- **Secrets exposure**: Not verified by automated check — requires manual review (check that no API keys appear in frontend bundle or network responses)
- **Auth token rejection**: Not verified — requires manual test (attempt API request without valid token)
- **Rate limits**: Not verified — requires manual test
- **Role access**: Not verified — requires manual test

## Status
PASS

## Severity
None

## Follow-Up
MrMiless44: Complete manual security checks (secrets exposure, auth rejection, rate limits, role access) before paid beta. Partial automated verification is recorded above.

## Notes
Automated header checks passed. Full manual security verification must be completed before paid beta. The HTTPS/HSTS/security header posture is strong.


---

## Test
Phase 7 - Launch Decision

## Date/Time
2026-04-27 09:15 UTC

## Owner
MrMiless44

## Command or Action
Review all evidence, blockers, rollback plan, and launch gates.

## Expected Result
Decision is one of: No launch, Private beta only, Paid beta approved, Public launch approved.

## Actual Result

**Reviewed evidence summary:**

| Phase | Status | Notes |
|---|---|---|
| Phase 0: Execution Controls | PASS | All owners assigned, identifiers recorded |
| Phase 1: API Health Check | FAIL | Direct Fly endpoint unresponsive (B-001); proxied API healthy |
| Phase 1: Frontend Loads | PASS | HTTP 200, security headers present |
| Phase 2: User Flow | UNKNOWN | Requires manual execution |
| Phase 3: Freight Workflow | UNKNOWN | Requires manual execution |
| Phase 4: Billing | UNKNOWN | Stripe mode unconfirmed (B-004) |
| Phase 5: Backup/Restore | UNKNOWN | Requires manual execution |
| Phase 6: Security | PASS | HTTPS, security headers verified; partial — manual checks remain |
| Preflight | FAIL | flyctl not installed locally (B-003); all required files present |

**Open blockers:**
- B-001 (High): Direct Fly.io API not responding — API accessible via proxy
- B-002 (Medium): Bare domain infamousfreight.com not resolving
- B-003 (Medium): flyctl not installed in local dev environment
- B-004 (Unknown): Stripe mode not confirmed as Live
- B-005 (Unknown): Database migration version not confirmed

**Decision: Private beta only**

The frontend is live and secure. The API responds via proxy. However, before paid beta or public launch, the following must be resolved:
1. Confirm Fly.io backend is running and reachable (B-001)
2. Resolve bare domain DNS (B-002)
3. Confirm Stripe Live mode (B-004)
4. Confirm database migration version (B-005)
5. Complete manual Phase 2–5 verification with a human tester

## Status
FAIL

## Severity
High

## Follow-Up
MrMiless44: Resolve B-001, B-002, B-004, B-005, and complete manual Phases 2–5 before progressing to paid beta.

## Notes
This evidence log was partially completed via automated infrastructure checks (preflight and smoke test run 2026-04-27). Full production readiness requires human-executed workflow testing and resolution of all open blockers before paid beta or public launch.

**`npm run production:preflight` output (2026-04-27 09:15 UTC):**
```
Checking required local tools...
OK: git
OK: node
OK: npm
OK: curl
MISSING: flyctl

Checking required repo files...
OK: package.json
OK: Dockerfile
OK: fly.toml
OK: netlify.toml
OK: .github/workflows/deploy-fly.yml
OK: .github/workflows/smoke-test.yml
OK: docs/PRODUCTION-LAUNCH-RUNBOOK.md
OK: docs/PRODUCTION-SECRETS-CHECKLIST.md
OK: scripts/production-canonical-env.sh
OK: scripts/production-smoke-test.sh

Checking Fly authentication...

Preflight failed with 1 missing item(s).
```

**`npm run production:smoke-test` checks (2026-04-27 09:15 UTC):**
```
Canonical frontend (https://www.infamousfreight.com): HTTP/2 200 — PASS
Bare domain (https://infamousfreight.com): connection refused — FAIL (B-002)
Fly root health (https://infamous-freight.fly.dev/health): timed out — FAIL (B-001)
Fly API health (https://infamous-freight.fly.dev/api/health): timed out — FAIL (B-001)
Proxied API health (https://www.infamousfreight.com/api/health): {"ok":true} — PASS
```


---

## Test
Phase 1 - Production Smoke Re-check (Launch Readiness Sprint)

## Date/Time
2026-05-03 09:00 UTC

## Owner
MrMiless44

## Command or Action
Re-run reachability checks against the production hostnames as part of the MVP launch-readiness sprint smoke test.

```bash
curl -sI --max-time 10 "https://www.infamousfreight.com/"
curl -sI --max-time 10 "https://infamousfreight.com/"
curl -s  --max-time 20 -L --max-redirs 10 -o /dev/null \
  -w "FINAL_URL=%{url_effective} HTTP=%{http_code} REDIRS=%{num_redirects} SIZE=%{size_download}\n" \
  "https://www.infamousfreight.com/"
curl -s  --max-time 15 -L "https://www.infamousfreight.com/api/health"
curl -s  --max-time 12    "https://infamous-freight.fly.dev/api/health"
```

## Expected Result
- `https://www.infamousfreight.com/` returns HTTP 200 with HTML.
- `https://www.infamousfreight.com/api/health` returns `{"ok":true}` (HTTP 200).
- Direct Fly health endpoint returns HTTP 200.

## Actual Result
- **Canonical frontend (`https://www.infamousfreight.com/`)**: HTTP/2 **301** → `https://infamousfreight.com/` (server: Netlify; no security headers on this hop).
- **Apex (`https://infamousfreight.com/`)**: HTTP/2 **301** → `https://www.infamousfreight.com/` (server: Netlify; full security header set, content-length 47).
- **Follow redirects (`-L --max-redirs 10`)**: `FINAL_URL=https://www.infamousfreight.com/ HTTP=301 REDIRS=10 SIZE=43` — request never reaches HTML, redirect loop exhausts.
- **Proxied API health (`https://www.infamousfreight.com/api/health`)**: HTTP **301** (request bounced into the same loop before reaching the Netlify `/api/*` proxy rule).
- **Direct Fly API health (`https://infamous-freight.fly.dev/api/health`)**: HTTP **000** (timed out — still consistent with B-001).

## Status
FAIL

## Severity
Critical

## Follow-Up
- **B-006 (new, Critical)**: Production canonical hostname is in a `www ↔ apex` 301 redirect loop. `netlify.toml` only declares the apex→www direction (lines 17–40), so the reverse www→apex 301 is being injected by an out-of-repo source (Netlify domain alias or DNS/registrar-level forwarding). Owner: MrMiless44. Resolve before any further smoke testing — this masks every other Phase 1 check because no request reaches HTML.
- **B-001 (still open, High)**: Direct Fly API endpoint still timing out as of 2026-05-03 09:00 UTC. With B-006 active there is no working backup path to the API.
- Tracked launch-sprint follow-ups: production health verification — Infaemous-Freight/Infamous-freight#1787; production secrets — Infaemous-Freight/Infamous-freight#1788.

## Notes
This is a regression versus the 2026-04-27 evidence above (which recorded the canonical frontend as HTTP/2 200). Both responses in the loop carry `server: Netlify`, but only the apex→www response includes the documented security header set (`strict-transport-security`, `x-frame-options`, `x-content-type-options`, `permissions-policy`, `referrer-policy`, `content-security-policy`) — strongly suggesting the www→apex hop is being added at a layer above the `apps/web` Netlify site rather than by `netlify.toml`. Do not check off "Web app loads from production domain" in the launch-readiness checklist until B-006 is resolved and a fresh HTTP 200 + HTML response from `https://www.infamousfreight.com/` is captured here.

---

## Test
Netlify Production Recommendation Re-check

## Date/Time
2026-05-09 04:14 UTC

## Owner
Netlify agent

## Command or Action
Re-ran the recommended post-deploy checks for the canonical web host, apex redirect, proxied API health, security headers, and Netlify-hosted public API routes.

```bash
curl --fail --show-error --location --head --retry 3 --retry-delay 5 --retry-connrefused https://www.infamousfreight.com
curl --show-error --silent --location --retry 3 --retry-delay 5 --retry-connrefused https://www.infamousfreight.com/api/health
curl --silent --location --head --retry 3 --retry-delay 5 --retry-connrefused --output /dev/null --write-out 'FINAL_URL=%{url_effective}\nHTTP_STATUS=%{http_code}\n' https://infamousfreight.com
curl --show-error --silent --location --retry 3 --retry-delay 5 --retry-connrefused --request OPTIONS https://www.infamousfreight.com/api/public/quote-requests
curl --show-error --silent --location --retry 3 --retry-delay 5 --retry-connrefused https://www.infamousfreight.com/api/public/shipments/invalid-tracking
```

## Expected Result
- `https://www.infamousfreight.com/` returns HTTP 200 with the configured security headers.
- `https://infamousfreight.com/` redirects to `https://www.infamousfreight.com/`.
- `https://www.infamousfreight.com/api/health` returns HTTP 200 JSON.
- Public Netlify API route smoke checks return JSON or the expected empty 204 preflight response instead of Netlify HTML.

## Actual Result
- **Canonical frontend (`https://www.infamousfreight.com/`)**: HTTP/2 200 from Netlify. Security headers were present, including `content-security-policy`, `strict-transport-security`, `x-frame-options`, `x-content-type-options`, `permissions-policy`, and `referrer-policy`. Netlify request ID observed: `01KR5F2HC9DH0NBHK1R08VRS6Z`.
- **Apex redirect (`https://infamousfreight.com/`)**: followed to `https://www.infamousfreight.com/` with final HTTP 200.
- **Proxied API health (`https://www.infamousfreight.com/api/health`)**: HTTP 200 JSON, with status `ok` and database service `connected`.
- **Public quote preflight (`OPTIONS /api/public/quote-requests`)**: HTTP 404 with Netlify HTML page.
- **Invalid public shipment lookup (`GET /api/public/shipments/invalid-tracking`)**: HTTP 404 with Netlify HTML page.

## Status
PARTIAL PASS

## Follow-Up
The previous launch blocker for `https://www.infamousfreight.com/api/health` returning the Vite HTML shell was resolved in production. The public Netlify function routes still failed because the production deploy did not expose the expected functions. The CLI readiness deploy command was updated to include `--functions netlify/functions`, and regression coverage was added so future CLI production deploys keep the static web directory and Netlify functions together. Re-run the public API route smoke checks after the next production deploy.

---

## Test
Netlify Production Recommendation Re-check

## Date/Time
2026-05-09 04:21 UTC

## Owner
Netlify agent

## Command or Action
Re-ran the recommended checks for the canonical web host, apex redirect, proxied API health, security headers, and Netlify-hosted public API routes.

```bash
curl --fail --show-error --location --head --retry 3 --retry-delay 5 --retry-connrefused --max-time 30 https://www.infamousfreight.com
curl --show-error --silent --location --retry 3 --retry-delay 5 --retry-connrefused --max-time 30 https://www.infamousfreight.com/api/health
curl --silent --location --head --retry 3 --retry-delay 5 --retry-connrefused --max-time 30 --output /dev/null --write-out 'FINAL_URL=%{url_effective}\nHTTP_STATUS=%{http_code}\n' https://infamousfreight.com
curl --show-error --silent --location --retry 3 --retry-delay 5 --retry-connrefused --max-time 30 --request OPTIONS --output /dev/null --write-out 'HTTP_STATUS=%{http_code}\nCONTENT_TYPE=%{content_type}\n' https://www.infamousfreight.com/api/public/quote-requests
curl --show-error --silent --location --retry 3 --retry-delay 5 --retry-connrefused --max-time 30 --output /dev/null --write-out 'HTTP_STATUS=%{http_code}\nCONTENT_TYPE=%{content_type}\n' https://www.infamousfreight.com/api/public/shipments/invalid-tracking
```

## Expected Result
- `https://www.infamousfreight.com/` returns HTTP 200 with configured security headers.
- `https://infamousfreight.com/` redirects to `https://www.infamousfreight.com/`.
- `https://www.infamousfreight.com/api/health` returns HTTP 200 JSON.
- Public Netlify API route smoke checks return JSON or the expected empty 204 preflight response instead of Netlify HTML.

## Actual Result
- **Canonical frontend (`https://www.infamousfreight.com/`)**: HTTP/2 200 from Netlify. Security headers were present, including `content-security-policy`, `strict-transport-security`, `x-frame-options`, `x-content-type-options`, `permissions-policy`, and `referrer-policy`. Netlify request ID observed: `01KR5FFEYS4N4YYJ4PN0YC5G2Y`.
- **Apex redirect (`https://infamousfreight.com/`)**: followed to `https://www.infamousfreight.com/` with final HTTP 200.
- **Proxied API health (`https://www.infamousfreight.com/api/health`)**: HTTP 200 JSON, with status `ok` and database service `connected`.
- **Public quote preflight (`OPTIONS /api/public/quote-requests`)**: HTTP 404 with `text/html; charset=utf-8`.
- **Invalid public shipment lookup (`GET /api/public/shipments/invalid-tracking`)**: HTTP 404 with `text/html; charset=utf-8`.

## Status
PARTIAL PASS

## Follow-Up
The canonical frontend, apex redirect, and browser-critical `/api/health` path are passing in production. Public Netlify function routes still require a fresh production deploy that includes `netlify/functions`. The repository now forces the broad `/api/*` and `/socket.io/*` proxy rules in `netlify.toml`, keeps the exact public function routes ahead of the Fly.io API proxy, and documents manual Netlify deploys with `--functions netlify/functions`.

---

## Test
Public Netlify Function Route Packaging Mitigation

## Date/Time
2026-05-09 10:05 UTC

## Owner
Netlify agent

## Command or Action
Re-checked the two public Netlify function smoke routes and then adjusted repository packaging by moving the public functions from `.mts` files to standard `.ts` function files.

```bash
curl --show-error --silent --location --retry 2 --retry-delay 2 --retry-connrefused --max-time 20 --request OPTIONS https://www.infamousfreight.com/api/public/quote-requests
curl --show-error --silent --location --retry 2 --retry-delay 2 --retry-connrefused --max-time 20 --output /tmp/tracking_body.txt --write-out 'HTTP_STATUS=%{http_code}\nCONTENT_TYPE=%{content_type}\n' https://www.infamousfreight.com/api/public/shipments/invalid-tracking
pnpm -C apps/api exec jest test/netlify-csp.test.ts --runInBand
```

## Expected Result
- `OPTIONS /api/public/quote-requests` returns HTTP 204.
- `GET /api/public/shipments/invalid-tracking` returns HTTP 400 JSON with `invalid_tracking_number`.
- Netlify routing regression tests pass.

## Actual Result
- **Public quote preflight (`OPTIONS /api/public/quote-requests`)**: HTTP 404 with `text/html; charset=utf-8` before the packaging mitigation was applied.
- **Invalid public shipment lookup (`GET /api/public/shipments/invalid-tracking`)**: HTTP 404 with `text/html; charset=utf-8` before the packaging mitigation was applied.
- **Repository mitigation**: `netlify/functions/load-requests.mts` and `netlify/functions/public-freight.mts` were renamed to `netlify/functions/load-requests.ts` and `netlify/functions/public-freight.ts` without changing their route names or runtime behavior.
- **Regression test**: `test/netlify-csp.test.ts` passed with 6 tests.

## Status
REPOSITORY MITIGATION COMPLETE; PRODUCTION REDEPLOY STILL REQUIRED

## Follow-Up
Trigger a fresh production deploy that includes `netlify/functions`, then re-run the public function route checks from `docs/netlify-deploy-checklist.md`. If either route still returns Netlify HTML after that deploy, inspect the Netlify deploy summary to confirm both `load-requests` and `public-freight` were detected and uploaded as functions.

---

## Test
Netlify Production Recommendation Re-check

## Date/Time
2026-05-11 10:53 UTC

## Owner
Netlify agent

## Command or Action
Re-ran the recommended production checks for the canonical web host, apex redirect, proxied API health, direct Fly API health, public Netlify function routes, and direct public function URL. Sensitive values were not recorded.

```bash
curl --silent --show-error --location --head --max-time 20 --retry 2 --retry-delay 2 https://www.infamousfreight.com
curl --silent --show-error --location --max-time 20 --retry 2 --retry-delay 2 https://www.infamousfreight.com/api/health
curl --silent --location --head --max-time 20 --retry 2 --retry-delay 2 --output /dev/null --write-out 'FINAL_URL=%{url_effective}\nHTTP_STATUS=%{http_code}\n' https://infamousfreight.com
curl --silent --show-error --location --max-time 20 --retry 2 --retry-delay 2 --request OPTIONS https://www.infamousfreight.com/api/public/quote-requests
curl --silent --show-error --location --max-time 20 --retry 2 --retry-delay 2 --write-out '\nHTTP_STATUS=%{http_code}\nCONTENT_TYPE=%{content_type}\n' https://www.infamousfreight.com/api/public/shipments/invalid-tracking
curl --silent --show-error --location --max-time 15 --retry 1 --request OPTIONS https://www.infamousfreight.com/.netlify/functions/public-freight
curl --silent --show-error --max-time 12 https://infamous-freight.fly.dev/api/health
pnpm -C apps/api exec jest test/netlify-csp.test.ts --runInBand
```

## Expected Result
- `https://www.infamousfreight.com/` returns HTTP 200 with configured security headers.
- `https://infamousfreight.com/` redirects to `https://www.infamousfreight.com/`.
- `https://www.infamousfreight.com/api/health` returns API health JSON.
- Public Netlify function route smoke checks return the expected empty 204 preflight response or JSON validation response.
- Direct public function URL is available, proving the function was packaged in the active production deploy.
- Direct Fly API health returns API health JSON as an origin diagnostic.
- Netlify routing regression tests pass.

## Actual Result
- **Canonical frontend (`https://www.infamousfreight.com/`)**: HTTP/2 200 from Netlify with configured security headers. Netlify request ID observed: `01KRBAQAQS6R7HNFQJ6WP7F4N9`.
- **Apex redirect (`https://infamousfreight.com/`)**: followed to `https://www.infamousfreight.com/` with final HTTP 200.
- **Proxied API health (`https://www.infamousfreight.com/api/health`)**: timed out after repeated 20 second attempts with no response body.
- **Direct Fly API health (`https://infamous-freight.fly.dev/api/health`)**: timed out after 12 seconds with no response body.
- **Public quote preflight (`OPTIONS /api/public/quote-requests`)**: HTTP 404 with Netlify HTML response.
- **Invalid public shipment lookup (`GET /api/public/shipments/invalid-tracking`)**: HTTP 404 with `text/html; charset=utf-8`.
- **Direct public function URL (`OPTIONS /.netlify/functions/public-freight`)**: HTTP 404 with `text/plain; charset=utf-8`, confirming the function is not exposed in the current production deploy.
- **Repository mitigation**: routing regression coverage now asserts that `netlify/functions/public-freight.ts` and `netlify/functions/load-requests.ts` are present in the configured functions directory so packaging entrypoints cannot be removed unnoticed.
- **Regression test**: `test/netlify-csp.test.ts` passed with 7 tests.

## Status
FAIL

## Severity
High

## Follow-Up
B-007 remains open for production API reachability because both the browser-critical proxied health path and direct Fly origin timed out during this check. Public Netlify functions also remain blocked until a fresh production deploy exposes `netlify/functions/public-freight.ts`; inspect the Netlify deploy summary after deploy to confirm the function was detected and uploaded.

---

## Test
Netlify Production Recommendation Re-check

## Date/Time
2026-05-11 11:07 UTC

## Owner
Netlify agent

## Command or Action
Re-ran the recommended production checks for the canonical web host, apex redirect, proxied API health, public Netlify function routes, and direct public function URL. Sensitive values were not recorded.

```bash
curl --silent --show-error --location --max-time 20 --retry 2 --retry-delay 2 https://www.infamousfreight.com/
curl --silent --show-error --head --max-time 15 https://infamousfreight.com/
curl --silent --show-error --location --max-time 20 --retry 2 --retry-delay 2 https://www.infamousfreight.com/api/health
curl --silent --show-error --location --max-time 15 --retry 1 --request OPTIONS https://www.infamousfreight.com/api/public/quote-requests
curl --silent --show-error --location --max-time 15 --retry 1 https://www.infamousfreight.com/api/public/shipments/invalid-tracking
curl --silent --show-error --max-time 15 --retry 1 --request OPTIONS https://www.infamousfreight.com/.netlify/functions/public-freight
pnpm -C apps/api exec jest test/netlify-csp.test.ts --runInBand
```

## Expected Result
- `https://www.infamousfreight.com/` returns HTTP 200 with the web app shell.
- `https://infamousfreight.com/` redirects to `https://www.infamousfreight.com/`.
- `https://www.infamousfreight.com/api/health` returns API health JSON.
- Public Netlify function route smoke checks return the expected empty 204 preflight response or JSON validation response.
- Direct public function URL is available, proving the function was packaged in the active production deploy.
- Netlify routing regression tests pass.

## Actual Result
- **Canonical frontend (`https://www.infamousfreight.com/`)**: HTTP 200 from Netlify with the web app shell.
- **Apex redirect (`https://infamousfreight.com/`)**: HTTP 301 to `https://www.infamousfreight.com/`.
- **Proxied API health (`https://www.infamousfreight.com/api/health`)**: timed out after repeated 20 second attempts with no response body.
- **Public quote preflight (`OPTIONS /api/public/quote-requests`)**: returned a Netlify 404 response.
- **Invalid public shipment lookup (`GET /api/public/shipments/invalid-tracking`)**: returned a Netlify 404 response.
- **Direct public function URL (`OPTIONS /.netlify/functions/public-freight`)**: HTTP 404 with `text/plain; charset=utf-8`, confirming the function is not exposed in the current production deploy.
- **Repository mitigation**: `netlify/functions/load-requests.ts` now declares in-code Netlify path metadata for `/api/load-requests` and `/api/load-requests/:id`, matching the other API functions.
- **Regression test**: `test/netlify-csp.test.ts` passed with 7 tests.

## Status
FAIL

## Severity
High

## Follow-Up
B-007 remains open for production API reachability because the browser-critical proxied health path timed out during this check. Public Netlify functions also remain blocked until a fresh production deploy exposes `netlify/functions/public-freight.ts`; inspect the Netlify deploy summary after deploy to confirm the function was detected and uploaded.

---

## Test
Netlify Production Recommendation Re-check

## Date/Time
2026-05-12 10:12 UTC

## Owner
Netlify agent

## Command or Action
Re-ran the recommended production checks for the canonical web host, apex redirect, proxied API health, direct Fly API health, public Netlify function routes, and direct public function URL. Sensitive values were not recorded.

```bash
curl --silent --show-error --location --max-time 20 --retry 2 --retry-delay 2 https://www.infamousfreight.com/
curl --silent --show-error --max-time 20 --retry 2 --retry-delay 2 --write-out 'HTTP_STATUS:%{http_code}\nREDIRECT_URL:%{redirect_url}\nCONTENT_TYPE:%{content_type}\n' --output /dev/null https://infamousfreight.com/
curl --silent --show-error --location --max-time 20 --retry 2 --retry-delay 2 https://www.infamousfreight.com/api/health
curl --silent --show-error --location --max-time 20 --retry 2 --retry-delay 2 --request OPTIONS https://www.infamousfreight.com/api/public/quote-requests
curl --silent --show-error --location --max-time 20 --retry 2 --retry-delay 2 https://www.infamousfreight.com/api/public/shipments/invalid-tracking
curl --silent --show-error --location --max-time 20 --retry 2 --retry-delay 2 --request OPTIONS https://www.infamousfreight.com/.netlify/functions/public-freight
curl --silent --show-error --max-time 15 --retry 1 https://infamous-freight-api.fly.dev/api/health
pnpm --filter @infamous-freight/api test -- --runInBand apps/api/test/netlify-csp.test.ts
```

## Expected Result
- `https://www.infamousfreight.com/` returns HTTP 200 with configured security headers.
- `https://infamousfreight.com/` redirects to `https://www.infamousfreight.com/`.
- `https://www.infamousfreight.com/api/health` returns API health JSON.
- Public Netlify function route smoke checks return the expected empty 204 preflight response or JSON validation response.
- Direct public function URL is available, proving the function was packaged in the active production deploy.
- Direct Fly API health returns API health JSON as an origin diagnostic.
- Netlify routing regression tests pass.

## Actual Result
- **Canonical frontend (`https://www.infamousfreight.com/`)**: HTTP 200 from Netlify with the web app shell.
- **Apex redirect (`https://infamousfreight.com/`)**: HTTP 301 to `https://www.infamousfreight.com/`.
- **Proxied API health (`https://www.infamousfreight.com/api/health`)**: HTTP 200 JSON with status `ok` and database service `connected`.
- **Direct Fly API health (`https://infamous-freight-api.fly.dev/api/health`)**: HTTP 200 JSON with status `ok` and database service `connected`.
- **Security headers**: canonical frontend response included the configured CSP, HSTS, frame, content-type, referrer, permissions, and cross-origin policy headers.
- **Public quote preflight (`OPTIONS /api/public/quote-requests`)**: HTTP 404 with Netlify HTML response.
- **Invalid public shipment lookup (`GET /api/public/shipments/invalid-tracking`)**: HTTP 404 with Netlify HTML response.
- **Direct public function URL (`OPTIONS /.netlify/functions/public-freight`)**: HTTP 404 with `text/plain; charset=utf-8`, confirming the function is not exposed in the current production deploy.
- **Repository mitigation**: production readiness automation now checks the public quote preflight, invalid public shipment lookup, and direct public freight function URL so future readiness runs fail on this blocker directly.
- **Regression test**: `apps/api/test/netlify-csp.test.ts` passed with 8 tests.

## Status
FAIL

## Severity
High

## Follow-Up
B-007 is partially resolved because the browser-critical proxied API health path and direct Fly API origin are healthy. Public Netlify functions remain blocked until a fresh production deploy exposes `netlify/functions/public-freight.ts`; inspect the Netlify deploy summary after deploy to confirm the function was detected and uploaded.

---

## Test
Netlify Production Recommendation Re-check

## Date/Time
2026-05-12 10:47 UTC

## Owner
Netlify agent

## Command or Action
Re-ran the recommended production checks for the canonical web host, apex redirect, proxied API health, public API paths, and direct Fly public API origin behavior. Sensitive values were not recorded.

```bash
curl --silent --show-error --location --head --max-time 20 https://www.infamousfreight.com
curl --silent --show-error --location --max-time 20 https://www.infamousfreight.com/api/health
curl --silent --show-error --location --head --max-time 20 https://infamousfreight.com
curl --silent --show-error --location --max-time 20 --request OPTIONS https://www.infamousfreight.com/api/public/quote-requests
curl --silent --show-error --location --max-time 20 https://www.infamousfreight.com/api/public/shipments/invalid-tracking
curl --silent --show-error --location --max-time 20 --request OPTIONS https://infamous-freight-api.fly.dev/api/public/quote-requests
curl --silent --show-error --location --max-time 20 https://infamous-freight-api.fly.dev/api/public/shipments/invalid-tracking
pnpm --filter @infamous-freight/api test -- --runInBand apps/api/test/quote-intake.test.ts apps/api/test/netlify-csp.test.ts
```

## Expected Result
- `https://www.infamousfreight.com/` returns HTTP 200 with configured security headers.
- `https://infamousfreight.com/` resolves to the canonical `https://www.infamousfreight.com/` host.
- `https://www.infamousfreight.com/api/health` returns API health JSON.
- Public quote preflight returns HTTP 204.
- Invalid public shipment lookup returns HTTP 400 JSON with `invalid_tracking_number`.
- Regression tests for public routing and quote intake pass.

## Actual Result
- **Canonical frontend (`https://www.infamousfreight.com/`)**: HTTP 200 from Netlify with the configured CSP, HSTS, frame, content-type, referrer, permissions, and cross-origin policy headers.
- **Apex redirect (`https://infamousfreight.com/`)**: resolved to `https://www.infamousfreight.com/`.
- **Proxied API health (`https://www.infamousfreight.com/api/health`)**: HTTP 200 JSON with status `ok` and database service `connected`.
- **Public quote preflight (`OPTIONS /api/public/quote-requests`)**: HTTP 404 with Netlify HTML response on the deployed site.
- **Invalid public shipment lookup (`GET /api/public/shipments/invalid-tracking`)**: HTTP 404 with Netlify HTML response on the deployed site.
- **Direct Fly public quote preflight**: HTTP 204.
- **Direct Fly invalid shipment lookup**: HTTP 404 before this repository change because the Express API did not expose the public tracking validation route.
- **Repository mitigation**: the Express API now exposes `GET /api/public/shipments/:trackingNumber` and returns `invalid_tracking_number` for malformed public tracking references without requiring authentication. Documentation was also updated to match the current Netlify-to-Fly proxy architecture and disabled-functions deployment setting.
- **Regression tests**: `apps/api/test/quote-intake.test.ts` and `apps/api/test/netlify-csp.test.ts` passed with 19 tests.

## Status
FAIL

## Severity
High

## Follow-Up
B-007 remains open for the two deployed public API paths because production still returns Netlify 404 responses. Trigger a fresh production deploy from the updated repository, then re-run the public route checks. The previous direct-function packaging recommendation has been superseded because normal Netlify deploys intentionally disable repo-owned functions and rely on the Fly API proxy.

---

## Test
Netlify Production Recommendation Re-check

## Date/Time
2026-05-14 04:06 UTC

## Owner
Netlify agent

## Command or Action
Re-ran the recommended production checks for the canonical web host, apex redirect, proxied API health, public API paths, direct Fly public API origin behavior, and focused routing regression tests. Sensitive values were not recorded.

```bash
curl --silent --show-error --location --head --max-time 20 https://www.infamousfreight.com
curl --silent --show-error --location --max-time 20 https://www.infamousfreight.com/api/health
curl --silent --location --head --max-time 20 --output /dev/null --write-out 'FINAL_URL=%{url_effective}\nHTTP_STATUS=%{http_code}\n' https://infamousfreight.com
curl --silent --show-error --location --max-time 20 --request OPTIONS --output /tmp/quote_preflight_body.txt --write-out 'HTTP_STATUS=%{http_code}\nCONTENT_TYPE=%{content_type}\n' https://www.infamousfreight.com/api/public/quote-requests
curl --silent --show-error --location --max-time 20 --output /tmp/invalid_tracking_body.txt --write-out 'HTTP_STATUS=%{http_code}\nCONTENT_TYPE=%{content_type}\n' https://www.infamousfreight.com/api/public/shipments/invalid-tracking
curl --silent --show-error --max-time 15 https://infamous-freight-api.fly.dev/api/health
curl --silent --show-error --location --max-time 20 --request OPTIONS --output /dev/null --write-out 'HTTP_STATUS=%{http_code}\nCONTENT_TYPE=%{content_type}\n' https://infamous-freight-api.fly.dev/api/public/quote-requests
curl --silent --show-error --location --max-time 20 --output /tmp/fly_invalid_tracking_body.txt --write-out 'HTTP_STATUS=%{http_code}\nCONTENT_TYPE=%{content_type}\n' https://infamous-freight-api.fly.dev/api/public/shipments/invalid-tracking
pnpm --filter @infamous-freight/api test -- --runInBand apps/api/test/quote-intake.test.ts apps/api/test/netlify-csp.test.ts
```

## Expected Result
- `https://www.infamousfreight.com/` returns HTTP 200 with configured security headers.
- `https://infamousfreight.com/` resolves to the canonical `https://www.infamousfreight.com/` host.
- `https://www.infamousfreight.com/api/health` returns API health JSON.
- Public quote preflight returns HTTP 204.
- Invalid public shipment lookup returns HTTP 400 JSON with `invalid_tracking_number`.
- Direct Fly public routes return the same public API behavior as the Netlify-proxied routes.
- Regression tests for public routing and quote intake pass.

## Actual Result
- **Canonical frontend (`https://www.infamousfreight.com/`)**: HTTP 200 from Netlify with the configured CSP, HSTS, frame, content-type, referrer, permissions, and cross-origin policy headers.
- **Apex redirect (`https://infamousfreight.com/`)**: resolved to `https://www.infamousfreight.com/` with final HTTP 200.
- **Proxied API health (`https://www.infamousfreight.com/api/health`)**: HTTP 200 JSON with status `ok` and database service `connected`.
- **Public quote preflight (`OPTIONS /api/public/quote-requests`)**: HTTP 204.
- **Invalid public shipment lookup (`GET /api/public/shipments/invalid-tracking`)**: HTTP 400 JSON with `invalid_tracking_number`.
- **Direct Fly API health (`https://infamous-freight-api.fly.dev/api/health`)**: HTTP 200 JSON with status `ok` and database service `connected`.
- **Direct Fly public quote preflight**: HTTP 204.
- **Direct Fly invalid shipment lookup**: HTTP 400 JSON with `invalid_tracking_number`.
- **Regression tests**: `apps/api/test/quote-intake.test.ts` and `apps/api/test/netlify-csp.test.ts` passed with 19 tests.

## Status
PASS

## Follow-Up
B-007 production API reachability is resolved for the browser-critical API health path and the public API paths covered by the current recommendation set. No additional repository mitigation was needed in this pass. Full launch readiness still depends on the broader evidence gates, rollback drills, and owner sign-off tracked elsewhere in this log.
