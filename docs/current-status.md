# Current status

Updated 2026-05-14.

## Active runtime

- `apps/api` is the active backend runtime.
- Fly.io, Docker, and the API server are aligned on port `3000`.
- Netlify serves the web app and proxies same-origin `/api/*` traffic to Fly.io.

## Still being hardened

- Some operator-facing views still contain sample data.
- The main dashboard sample data should be replaced with live API-backed services.
- Unfinished authenticated routes should be explicitly gated when they are not production-ready.

## Verification

Run:

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run prisma:validate`
- `pnpm run build`
- `pnpm run test`
