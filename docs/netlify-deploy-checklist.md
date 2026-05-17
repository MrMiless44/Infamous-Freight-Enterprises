# Netlify Production Deploy Checklist

Use this checklist for every production deploy of `infamousfreight`.

## 1) Confirm web environment variables in Netlify

In Netlify Dashboard → **Site configuration** → **Environment variables**, confirm these are present for the web build/runtime:

### Required for web build/runtime
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_URL`

### Required only for CLI-triggered deploys
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

### Recommended compatibility fallback
- `VITE_SUPABASE_ANON_KEY`

Do not add backend-only secrets such as `DATABASE_URL`, `SUPABASE_SERVICE_KEY`, `STRIPE_SECRET_KEY`, or `STRIPE_WEBHOOK_SECRET` to Netlify. Netlify serves the web app and proxies `/api/*` to the Fly API origin, so backend secrets belong in the API runtime.

## 2) Confirm backend/API environment variables in Fly and provider dashboards

In the Fly API app and relevant provider dashboards, confirm these backend variables are configured:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CORS_ORIGINS`
- `WEB_APP_URL`
- `RATE_LIMIT_ENABLED` with value `true`

## 3) Validate locally (or in CI)

Run the one-command automation (recommended):

```bash
pnpm netlify:production:readiness
```

Or run the commands manually:

```bash
pnpm install --frozen-lockfile
pnpm prisma:generate
pnpm lint
pnpm -w test --runInBand
pnpm env:check:strict
pnpm -C apps/web run build
pnpm docker:build
```

If you intentionally need to refresh the lockfile during readiness validation, opt in explicitly:

```bash
ALLOW_LOCKFILE_UPDATE=true pnpm netlify:production:readiness
```

## 4) Keep lockfile stable

```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "Update pnpm lockfile"
git push
```

If set previously, remove temporary Netlify workaround:

- `NPM_FLAGS=--no-frozen-lockfile`

The committed Netlify config currently uses `NPM_FLAGS=--legacy-peer-deps` for npm-based builds.

## 5) Trigger production deploy

Netlify UI path:

1. `Netlify`
2. `infamousfreight`
3. `Deploys`
4. `Trigger deploy`
5. `Deploy site`

The committed Netlify configuration publishes `apps/web/dist` and keeps repo-owned functions disabled for normal Git and UI-triggered production deploys. Public browser API paths are expected to resolve through the Netlify proxy to the Fly.io API origin.

CLI deploys should rely on the `NETLIFY_AUTH_TOKEN` environment variable instead of passing secrets through command-line flags:

```bash
NETLIFY_AUTH_TOKEN=... NETLIFY_SITE_ID=... pnpm netlify:production:readiness
```

## 6) Confirm canonical domain configuration in Netlify

In Netlify Dashboard → **Domain management** → **Domains**:

- Set **Primary domain** to `www.infamousfreight.com`.
- Keep `infamousfreight.com` and `infamous-freight.netlify.app` as aliases.

The committed `netlify.toml` redirects `https://infamousfreight.com/*` to `https://www.infamousfreight.com/:splat`. If Netlify Primary domain is set to apex instead of `www`, Netlify can force `www` back to apex and create an infinite redirect loop that fails production smoke checks.

## 7) Post-deploy production verification

Capture a non-secret launch evidence file after every production deploy:

```bash
pnpm production:capture-netlify-evidence
```

The evidence file is written under `docs/evidence/` and records the canonical host status, apex redirect target, proxied API health response, public quote preflight status, invalid tracking validation, security headers, and the active Netlify request identifier. This command does not submit a production quote request.

Run the canonical checks first:

```bash
curl --fail --show-error --location --head --retry 5 --retry-delay 10 --retry-connrefused https://www.infamousfreight.com
curl --fail --show-error --silent --location --retry 5 --retry-delay 10 --retry-connrefused https://www.infamousfreight.com/api/health
```

Confirm Netlify-hosted public API routes are not swallowed by the broader Fly API proxy:

```bash
curl --fail --show-error --silent --location --retry 5 --retry-delay 10 --retry-connrefused --request OPTIONS https://www.infamousfreight.com/api/public/quote-requests
curl --show-error --silent --location --retry 5 --retry-delay 10 --retry-connrefused --write-out '\n%{http_code}\n' https://www.infamousfreight.com/api/public/shipments/invalid-tracking
```

Expected result: the quote intake preflight returns an empty 204 response, and the invalid tracking lookup returns HTTP 400 JSON with `invalid_tracking_number`. Do not submit a production quote request during smoke testing unless the test record is intentionally tracked and cleaned up.

Then confirm the bare domain redirects to the canonical www host:

```bash
final_url=$(curl --silent --location --head --retry 5 --retry-delay 10 --retry-connrefused --output /dev/null --write-out '%{url_effective}' https://infamousfreight.com)
test "$final_url" = "https://www.infamousfreight.com/"
```

Optionally verify there is no short redirect loop:

```bash
curl --silent --show-error --location --max-redirs 5 --output /dev/null --write-out '%{http_code} %{url_effective}\n' https://www.infamousfreight.com/
```

Optional direct API domain checks (if `api.infamousfreight.com` is configured to the API origin):

```bash
curl --fail --show-error --silent --location --retry 5 --retry-delay 10 --retry-connrefused https://api.infamousfreight.com/health
curl --fail --show-error --silent --location --retry 5 --retry-delay 10 --retry-connrefused https://api.infamousfreight.com/api/health
```

If direct API-domain checks return `404`, validate DNS/routing for `api.infamousfreight.com` and keep production smoke checks pointed at `https://www.infamousfreight.com/api/health` until fixed.

Also verify in browser:
- Homepage loads.
- No Supabase key error in console.
- API requests are not blocked by CORS.
- Forms still work.
- Billing/auth flows load (if enabled).

## 8) Public lead review

Review incoming public leads in Netlify Forms after every deploy validation:

- `quote-request` is the primary revenue path. Operations should review the Netlify submission first, then match the API quote record by `trackingNumber` when one was returned.
- `contact` captures general inquiries, tracking questions, partner requests, and support messages. Route active-load issues to dispatch before general support triage.
- `driver-application` and `partner-application` are onboarding leads. Confirm consent and contact details before moving the lead into operational follow-up.

If the API-backed quote intake is temporarily unavailable but Netlify Forms succeeds, the quote request is still captured for dispatch follow-up. A tracking reference may be assigned later after operations reviews the lead.
