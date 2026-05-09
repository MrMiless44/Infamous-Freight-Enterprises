# Infamous Freight

Infamous Freight is a freight dispatch and operations platform for carriers, dispatchers, and logistics teams. The current repository ships a React/Vite web app on Netlify, an Express API for freight operations and billing workflows, Prisma-backed PostgreSQL data access, and deployment support for the production Netlify/Fly.io split.

## Current Stack

| Area | Implementation |
|---|---|
| Web app | React 19, TypeScript, Vite, Tailwind CSS |
| Web hosting | Netlify, publishing `apps/web/dist` |
| API | Express 5, TypeScript |
| API hosting | Fly.io, proxied from Netlify through `/api/*` |
| Data | PostgreSQL through Prisma |
| Auth | Supabase Auth/JWT-derived trusted claims for protected API routes |
| Payments | Stripe Checkout, Customer Portal, webhook handling, and one-time payment tracking |
| Monitoring | Sentry is opt-in through environment configuration |

## Repository Layout

| Path | Purpose |
|---|---|
| `apps/web` | React/Vite frontend, public pages, operator pages, and client-side API helpers |
| `apps/api` | Express API, Prisma schema, API tests, billing helpers, and freight workflow logic |
| `netlify/functions` | Netlify-hosted public API functions for lightweight public intake and lookup routes |
| `netlify/database/migrations` | Netlify Database migrations. Applied migrations must remain immutable. |
| `docs` | Architecture, launch, operations, Stripe, Netlify, and production-readiness documentation |
| `scripts` | Local setup, validation, production checks, deployment helpers, and operational scripts |

## Public And App Routes

The web app includes public marketing and intake routes such as `/`, `/services`, `/request-quote`, `/track-shipment`, `/customer-portal`, `/carrier-portal`, `/load-board`, `/pricing`, `/partners`, `/drive`, and `/contact`.

Authenticated operational routes include `/ops`, `/loads`, `/dispatch`, `/drivers`, `/invoices`, `/analytics`, `/compliance`, `/settings`, `/billing`, `/carriers`, `/accounting`, and `/quotes`. Role-sensitive pages use route guards in the web app and protected API routes verify trusted claims in production.

## API And Netlify Routing

Production browser traffic should use the same-origin Netlify API path:

```bash
VITE_API_URL=/api
```

The committed Netlify configuration publishes the Vite output from `apps/web/dist`, redirects the apex and default Netlify hostname to `https://www.infamousfreight.com`, serves exact Netlify Function routes for public freight intake, proxies `/api/health` and broader `/api/*` traffic to the Fly.io API, and keeps the SPA fallback last.

Launch-critical checks should verify:

- `https://www.infamousfreight.com`
- `https://infamousfreight.com` redirecting to the `www` host
- `https://www.infamousfreight.com/api/health`
- Netlify Function public routes under `/api/public/*`

Direct `api.infamousfreight.com` checks are useful operational diagnostics only after that domain is confirmed.

## Local Development

Install dependencies and create local environment files:

```bash
pnpm install
pnpm env:setup
```

Set up Prisma and seed data:

```bash
pnpm db:setup
```

Run the API and web app together:

```bash
pnpm dev
```

Useful targeted commands:

```bash
pnpm -C apps/web run dev
pnpm -C apps/api run start:dev
pnpm lint
pnpm test
pnpm env:check:strict
```

## Deployment Notes

Netlify builds only the web app with:

```bash
pnpm run build:web
```

The production API is a separate Fly.io runtime. Keep backend-only secrets such as database URLs, service keys, Stripe secrets, and webhook secrets out of the Netlify web environment. Netlify should receive only web-safe build/runtime variables and CLI deploy variables when needed.

Before launch, follow:

- [`docs/netlify-deploy-checklist.md`](docs/netlify-deploy-checklist.md)
- [`docs/CUSTOM-DOMAIN.md`](docs/CUSTOM-DOMAIN.md)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/API-REFERENCE.md`](docs/API-REFERENCE.md)
- [`docs/LAUNCH_EVIDENCE_LOG.md`](docs/LAUNCH_EVIDENCE_LOG.md)

## Production Readiness

Recommended launch work is tracked in [`docs/RECOMMENDATION_WORK_TRACKS.md`](docs/RECOMMENDATION_WORK_TRACKS.md) and [`docs/CURRENT_RECOMMENDATIONS_UPDATE.md`](docs/CURRENT_RECOMMENDATIONS_UPDATE.md). Keep public claims conservative unless they are backed by current repository evidence, production checks, or provider dashboard proof.

Do not edit, rename, or delete applied database migrations. Roll forward with a new migration if a database correction is needed.
