<p align="center">
  <a href="https://infamousfreight.com" target="_blank" rel="noopener noreferrer">
    <img src="/docs/screenshots/infamousfreight-header.svg" alt="Infamous Freight" width="100%">
  </a>
</p>

# Infamous Freight — Canonical Architecture Reference

_Last updated: April 2026_

This document is the single source of truth for the Infamous Freight backend architecture.
Update this file whenever the framework, entry point, ports, or route structure changes.

---

## Canonical Backend: Express 4

The active backend is an **Express 4** application written in TypeScript.

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
| Dockerfile.api default | `3000` | `ENV PORT=3000` (overridden by Docker Compose) |
| Nginx proxy target | `3001` | `nginx.conf` → `proxy_pass http://api:3001` |
| `.env.example` default | `3001` | `PORT=3001` |

> **Recommendation:** Use `PORT=3001` in all environments to match Docker Compose and nginx. Set this in your local `.env` file.

---

## Framework Decision

**Canonical backend framework: Express 4**

The codebase also contains NestJS module files (`apps/api/src/main.ts`, `apps/api/src/app.module.ts`, and per-feature controllers) that were written during an earlier planning phase. These files are **not wired to the active server entry point** (`server.ts`) and are not executed in production.

The NestJS files represent planned feature modules that have not yet been migrated into the Express layer. See [Planned / In-Development Features](#planned--in-development-features) below.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, Socket.io | `apps/web` |
| Backend | **Express 4**, TypeScript | `apps/api` |
| ORM | Prisma | PostgreSQL schema in `apps/api/prisma/` |
| Database | PostgreSQL 16 | |
| Cache | Redis 7 | |
| Payments | Stripe | Checkout, Customer Portal, Webhooks |
| Auth | Supabase Auth + JWT | Tenant ID passed via `x-tenant-id` header |
| Monitoring | Sentry (`@sentry/node`) | Opt-in via `SENTRY_DSN` |
| Deployment | Fly.io (API), Netlify (Web) | |

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
- `api` — Express 4 API on port `3001`
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

The following NestJS module files exist in `apps/api/src/` but are not connected to the active Express server. They represent planned feature areas that require implementation work before use:

| Module | Directory | Status |
|---|---|---|
| Load board aggregation | `loads/` | NestJS controller exists; not wired to Express routes |
| Invoice / BOL / POD | `invoice/` | NestJS module exists; not wired to Express routes |
| ELD integrations | `eld/` | NestJS module exists; not wired to Express routes |
| Real-time chat | `chat/` | NestJS module exists; not wired to Express routes |
| Driver payroll | `payroll/` | NestJS module exists; not wired to Express routes |
| Factoring | `factoring/` | NestJS module exists; not wired to Express routes |
| CSA compliance monitoring | `compliance-csa/` | NestJS module exists; not wired to Express routes |
| Document expiry | `compliance-expiry/` | NestJS module exists; not wired to Express routes |
| Accounting / QuickBooks / Xero | `accounting/` | NestJS module exists; not wired to Express routes |
| Rate analytics | `rate-analytics/` | NestJS module exists; not wired to Express routes |
| Broker credit scoring | `broker-credit/` | NestJS module exists; not wired to Express routes |
| Geofencing / ETA | `geofencing/` | NestJS module exists; not wired to Express routes |
| IFTA reporting | `ifta/` | NestJS module exists; not wired to Express routes |
| Role-based access control | `rbac/` | NestJS module exists; not wired to Express routes |
| Rate confirmations | `ratecon/` | NestJS module exists; not wired to Express routes |
| Auto-dispatch AI | `dispatch/` | NestJS module exists; not wired to Express routes |

**Migration path:** Each module should be migrated into the Express layer by adding route handlers in `apps/api/src/app.ts` (or extracted into Express Router files) and wiring them to the Prisma data store. The NestJS `main.ts` and `app.module.ts` entry points can be removed once all desired modules are migrated.

---

## Deprecated / Superseded Route Patterns

The following route patterns appear in older planning documents (PDF build package) but are **not implemented** in the current codebase:

| Planned route pattern | Status | Notes |
|---|---|---|
| `GET /api/freight/:resource` | Not implemented | Superseded by `/api/freight-operations/:resource` |
| `POST /api/freight/:resource` | Not implemented | Superseded by `/api/freight-operations/:resource` |
| Express 5 features | Not used | API uses Express 4 |
| tRPC-style type-safe RPC | Not used | API uses REST over HTTP |

---

## Related Documents

- [`docs/API-REFERENCE.md`](API-REFERENCE.md) — Implemented API routes
- [`docs/INTEGRATIONS-AND-SECRETS.md`](INTEGRATIONS-AND-SECRETS.md) — External integrations and secret management
- [`docs/REPO-ACCURATE-STATUS.md`](REPO-ACCURATE-STATUS.md) — Evidence-based capability claims

---

## AI-First Freight Operations Model (Human-by-Exception)

Infamous Freight should target **95%+ automation with human supervision for exceptions**, rather than a "no human ever" operating model.

### Operating Flow

```text
Customer Request
  → AI Load Intake Agent
  → Rate + Margin Engine
  → Carrier Matching + Vetting Agent
  → Auto Tender / Negotiation Agent
  → Dispatch + Tracking Agent
  → Document AI (BOL, POD, Rate Con, Invoice)
  → Billing + Collections Agent
  → Exception Queue
```

### Compliance and Audit Baseline

- Every load must be represented as a structured job in the data layer.
- Every automated decision must write a durable event log entry for traceability.
- Broker transaction records must remain reviewable and retained per regulatory retention windows.
- Human review must be mandatory for legal, fraud, safety, and claim-driven edge cases.

### Auto-Run Guardrails (Required)

AI can only auto-book/auto-advance a load when all checks pass:

1. Customer approval status valid
2. Margin meets rule threshold
3. Carrier identity and authority verified
4. Carrier safety/compliance acceptable
5. Insurance active
6. Commodity not restricted
7. Load value below auto-approval ceiling
8. Appointment windows confirmed
9. Rate confirmation matches load terms
10. No fraud flags raised

If any check fails, route directly to the exception queue.

### Layered System Design

1. **Data Core**: canonical tables for loads, carriers, documents, invoices, payments, claims, and audit/events.
2. **Workflow Engine**: deterministic rules for critical transitions (for example, POD-to-invoice automation).
3. **AI Agents**: specialized agents for intake, pricing, carrier, negotiation, dispatch, documents, billing, risk, and customer updates.
4. **Integrations**: email/SMS/voice, load boards, TMS, accounting, ELD/GPS, compliance sources, storage, payment rails.
5. **Exception Control**: centralized queue for risk, disputes, margin exceptions, and operational anomalies.

### Delivery Plan (Phased)

1. Intake + quote automation
2. Carrier matching + constrained auto-tender
3. Dispatch + tracking automation
4. Document + billing automation
5. Command center (exceptions, margin, risk, performance)

This model keeps the system operationally aggressive while protecting margin, safety, compliance, and customer trust.
