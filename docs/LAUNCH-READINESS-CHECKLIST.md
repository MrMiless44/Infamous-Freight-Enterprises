# Launch Readiness Checklist

This checklist is the source of truth for moving Infamous Freight from merged code to production-ready status.

## Blocker

Production is not ready until issue #1554 is complete.

## Account-level actions

These require access to Fly.io, GitHub repository secrets, and Netlify.

- [ ] Revoke the exposed Fly token.
- [ ] Create a new Fly deploy token.
- [ ] Add the new token as GitHub Actions secret `FLY_API_TOKEN`.
- [ ] Run the `Deploy Fly API` workflow.
- [ ] Trigger a Netlify production redeploy.
- [ ] Run the `Smoke Test` workflow.

Netlify tracking markers should reflect the current decision state:

```text
NETLIFY_SECRET_ROTATION_STATUS=skipped
NETLIFY_SECRET_ROTATION_REQUIRED=false
NETLIFY_REDEPLOY_REQUIRED_AFTER_SECRET_ROTATION=false
NETLIFY_TEAM_MFA_ENFORCEMENT_REQUIRED=true
NETLIFY_PREVIEW_ACCESS_REVIEW_REQUIRED=true
```

Recommended execution order:

1. Update Netlify markers to skipped/not-required.
2. Merge safe PRs first: `#1654`, `#1655`, `#1656`.
3. Run and record production smoke test evidence before closing launch-readiness issues.

## Required production health checks

Run these after deployment:

```bash
curl --fail --show-error --location --head https://www.infamousfreight.com
curl --fail --show-error --location --head https://infamousfreight.com
curl --fail --show-error --silent --location https://www.infamousfreight.com/api/health
```

Expected result: the canonical `www` site returns HTTP 200, the apex domain redirects to `https://www.infamousfreight.com/`, and the proxied `/api/health` endpoint returns API health JSON rather than the web app HTML.

Optional direct API origin checks:

```bash
curl -i https://infamous-freight-api.fly.dev/health
curl -i https://infamous-freight-api.fly.dev/api/health
curl -i https://api.infamousfreight.com/health
curl -i https://api.infamousfreight.com/api/health
```

Direct API checks are operational diagnostics. Do not block the Netlify web launch on `api.infamousfreight.com` until that route is confirmed; the launch-critical browser path is `https://www.infamousfreight.com/api/health`.

## Production environment expectations

Set production CORS explicitly:

```bash
CORS_ORIGINS=https://infamousfreight.com,https://www.infamousfreight.com
```

Set frontend API routing to the Netlify proxy path:

```bash
VITE_API_URL=/api
```

## Merge policy

- Use fresh branches from current `main`.
- Keep PRs focused.
- Require CI to pass before merge.
- Squash merge.
- Delete temporary branches after merge.
- Do not revive stale duplicate PRs; cherry-pick unique changes into fresh branches.

## Not production ready if

- `FLY_API_TOKEN` is missing or stale.
- Public proxied `/api/health` fails.
- Public proxied `/api/health` returns web app HTML instead of API health JSON.
- Netlify has not been redeployed after env changes.
