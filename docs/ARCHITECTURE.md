<p align="center">
  <a href="https://infamousfreight.com" target="_blank" rel="noopener noreferrer">
    <img src="/docs/screenshots/infamousfreight-header.svg" alt="Infamous Freight" width="100%">
  </a>
</p>

# Infamous Freight — Canonical Architecture Reference

_Last updated: May 2026_

This document is the single source of truth for the Infamous Freight backend architecture.
Update this file whenever the framework, entry point, ports, or route structure changes.

---

## Canonical Backend: Express 5

The active backend is an **Express 5** application written in TypeScript.

| File | Purpose |
|---|---|
| `apps/api/src/server.ts` | HTTP server entry point — calls `createApp()` and binds to `PORT` |
| `apps/api/src/app.ts` | Express app factory — registers middleware, health checks, and all API routes |
| `apps/api/src/data-store.ts` | Data access layer (Prisma ORM) |
| `apps/api/src/billing.ts` | Stripe billing helpers |
| `apps/api/src/ai-usage.ts` | AI usage tracking store |
| `apps/api/src/stripe-webhook-events.ts` | Stripe webhook event idempotency store |

The server starts via:

```bash
# development
npm run dev:api          # uses tsx watch on apps/api/src/server.ts

# production
npm run start            # runs node dist/src/server.js
```

---

## Ports

| Context | Port | Source |
|---|---|---|
| Local development | `3000` | `apps/api/src/server.ts` default (`PORT ?? 3000`) |
| Docker Compose API | `3001` | `docker-compose.yml` → `PORT: 3001` |
| Dockerfile.api default | `3001` | `ENV PORT=3001` |
| Nginx proxy target | `3001` | `nginx.conf` → `proxy_pass http://api:3001` |
| `.env.example` default | `3001` | `PORT=3001` |

> **Recommendation:** Use `PORT=3001` for Docker-based API runtime paths to match Docker Compose, Caddy, and nginx. Local non-Docker development can continue using the server default unless `PORT` is set.

---

## Framework Decision

**Canonical backend framework: Express 5**

The API package uses Express as its only backend runtime. The server starts from `apps/api/src/server.ts`, which imports `createApp()` from `apps/api/src/app.ts`. Earlier alternate-framework planning files were removed because they were not represented in `apps/api/package.json`, were not wired into production, and created a second apparent backend architecture.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Zustand, Socket.io | `apps/web` |
| Backend | **Express 5**, TypeScript | `apps/api` |
| ORM | Prisma | PostgreSQL schema in `apps/api/prisma/` |
| Database | PostgreSQL 16 | |
| Cache | Redis 7 | |
| Payments | Stripe | Checkout, Customer Portal, Webhooks |
| Auth | Supabase Auth + JWT-derived trusted claims | Production protected routes derive user, tenant, and role from verified bearer tokens |
| Monitoring | Sentry (`@sentry/node`) | Opt-in via `SENTRY_DSN` |
| Deployment | Fly.io (API), Netlify (Web) | |

## Netlify Web Runtime

Netlify builds only the React/Vite web app and publishes `apps/web/dist`.

The production browser API path is `/api`, not a hardcoded direct API origin. Netlify handles exact public function routes first, proxies `/api/health` and broader `/api/*` traffic to the Fly.io API, and serves the SPA fallback after those API rules.

The canonical public web host is `https://www.infamousfreight.com`. The apex domain and default Netlify hostname redirect to that host.

---

## Implemented API Routes

See [`docs/API-REFERENCE.md`](API-REFERENCE.md) for the full route reference.

---

## Docker Setup

```bash
docker-compose up -d
```

Services started:
- `postgres` — PostgreSQL 16 on port `5432`
- `redis` — Redis 7 on port `6379`
- `api` — Express 5 API on port `3001`
- `web` — nginx serving the React SPA on port `80`

The API container runs `node dist/src/server.js` with `PORT=3001`.

---

## Local Development Setup

```bash
# 1. Install dependencies + create .env files from examples
npm run env:setup

# 2. Set up the database (generate Prisma client, run migrations, seed)
npm run db:setup

# 3. Start both API and web in watch mode
npm run dev
```

---

## Planned / In-Development Features

The following feature areas are not implemented in the active Express API. Add them as Express routes or route modules when they become product priorities:

| Module | Directory | Status |
|---|---|---|
| Load board aggregation | Express route module | Not implemented |
| Invoice / BOL / POD | Express route module | Not implemented |
| ELD integrations | Express route module | Not implemented |
| Real-time chat | Express route module | Not implemented |
| Driver payroll | Express route module | Not implemented |
| Factoring | Express route module | Not implemented |
| CSA compliance monitoring | Express route module | Not implemented |
| Document expiry | Express route module | Not implemented |
| Accounting / QuickBooks / Xero | Express route module | Not implemented |
| Rate analytics | Express route module | Not implemented |
| Broker credit scoring | Express route module | Not implemented |
| Geofencing / ETA | Express route module | Not implemented |
| IFTA reporting | Express route module | Not implemented |
| Rate confirmations | Express route module | Not implemented |
| Auto-dispatch AI | Express route module | Not implemented |

**Implementation path:** Add route handlers in `apps/api/src/app.ts` or extracted Express Router files, then wire them to the Prisma data store and existing framework-free domain helpers.

---

## Deprecated / Superseded Route Patterns

The following route patterns appear in older planning documents (PDF build package) but are **not implemented** in the current codebase:

| Planned route pattern | Status | Notes |
|---|---|---|
| `GET /api/freight/:resource` | Not implemented | Superseded by `/api/freight-operations/:resource` |
| `POST /api/freight/:resource` | Not implemented | Superseded by `/api/freight-operations/:resource` |
| tRPC-style type-safe RPC | Not used | API uses REST over HTTP |

---

## Related Documents

- [`docs/API-REFERENCE.md`](API-REFERENCE.md) — Implemented API routes
- [`docs/INTEGRATIONS-AND-SECRETS.md`](INTEGRATIONS-AND-SECRETS.md) — External integrations and secret management
- [`docs/REPO-ACCURATE-STATUS.md`](REPO-ACCURATE-STATUS.md) — Evidence-based capability claims
