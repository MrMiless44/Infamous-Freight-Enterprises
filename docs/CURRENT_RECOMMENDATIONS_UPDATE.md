# Current Recommendations Update

Date: May 7, 2026

This update summarizes the next practical recommendations for the Netlify-hosted web app and related production launch work. It narrows the broader recommendation backlog into a small set of actions that reduce launch risk without changing the current architecture.

## Recommended Priority

1. Keep `www.infamousfreight.com` as the canonical public web host. The committed Netlify configuration redirects the apex and default Netlify hostname to `https://www.infamousfreight.com`, so DNS, Netlify domain settings, launch docs, and smoke tests should all use the same direction.
2. Continue using the Netlify `/api` proxy for production frontend API calls. `VITE_API_URL=/api` keeps browser traffic on the same origin and validates the Netlify proxy path to the Fly.io API.
3. Resolve production redirect evidence before launch. Any out-of-repo reverse redirect from `www` back to the apex should be removed because it conflicts with `netlify.toml` and can make the site unreachable.
4. Record fresh production evidence after the next Netlify deploy. At minimum, capture the canonical web response, apex-to-www redirect, proxied `/api/health`, security headers, and the current deploy identifier.
5. Keep direct `api.infamousfreight.com` checks optional until that route is confirmed. The launch-critical frontend path is `https://www.infamousfreight.com/api/health` because that is what the Netlify-hosted app depends on.
6. Avoid broad architecture changes until launch blockers are closed. The current repo source of truth is React/Vite on Netlify for the web app and Express on Fly.io for the API.

## Documentation Updates Made

The custom-domain guide was updated to match the committed Netlify routing behavior. It now identifies `https://www.infamousfreight.com` as the canonical web URL, recommends `VITE_API_URL=/api` for production, and calls out the redirect-loop risk created by conflicting domain settings.

The root README was corrected to match the active Infamous Freight repository instead of an unrelated LogisticsX/.NET/Angular project description. It now documents the React/Vite web app, Express API, Netlify/Fly.io split, `/api` proxy expectation, public and protected route surfaces, and the launch-readiness documents that should guide production work.

The architecture source-of-truth documents were updated to include the Netlify web runtime, canonical `www` host, production `/api` proxy path, and production trusted-claims authentication model.

## Follow-Up Validation

The May 12, 2026 10:47 UTC retest confirmed that the canonical web host, apex-to-www redirect, and browser-critical `https://www.infamousfreight.com/api/health` path are working. Public API routes such as `OPTIONS /api/public/quote-requests` and `GET /api/public/shipments/invalid-tracking` still return Netlify 404 responses on the deployed site, which indicates the active production deploy has not picked up the current proxy routing for those paths.

The repository now includes exact forced public API proxy routes, an exact forced `/api/health` proxy, and forced `/api/*` and `/socket.io/*` proxy rules ahead of the SPA fallback. The Netlify build configuration intentionally points functions at `netlify/disabled-functions` for normal deploys, and the production readiness deploy command uses the same disabled functions directory so oversized site-level environment variables do not block function upload. After the next production deploy, run the checks from [`netlify-deploy-checklist.md`](./netlify-deploy-checklist.md) and append the results to the launch evidence log. Do not record secrets or environment variable values in the evidence.
