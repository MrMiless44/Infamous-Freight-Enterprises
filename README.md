# **INFÆMOUS FREIGHT**

**🚛 AI-driven freight operations platform 🚚**

Dispatch • Fleet intelligence • Driver coordination • Compliance • Billing • Enterprise-ready logistics execution

[![validation](https://img.shields.io/github/actions/workflow/status/Infaemous-Freight/Infamous-freight/full-validation.yml?branch=main&label=validation)](https://github.com/Infaemous-Freight/Infamous-freight/actions/workflows/full-validation.yml)
[![fly deploy](https://img.shields.io/github/actions/workflow/status/Infaemous-Freight/Infamous-freight/deploy-fly.yml?branch=main&label=fly%20deploy)](https://github.com/Infaemous-Freight/Infamous-freight/actions/workflows/deploy-fly.yml)
![license](https://img.shields.io/github/license/Infaemous-Freight/Infamous-freight)
[![code style: TypeScript](https://img.shields.io/badge/code%20style-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)

---

## Runtime Truth

[`docs/current-status.md`](docs/current-status.md) is the source of truth for what is live, demo-backed, not ready, or blocked.

The README describes product direction and repository structure. Before selling, launching, dispatching, billing, onboarding, or treating any authenticated route as production-ready, confirm current route and runtime status in [`docs/current-status.md`](docs/current-status.md).

---

## 🚛 Overview

Infamous Freight is an AI-powered freight operations platform for **dispatch execution**, **shipment visibility**, **driver coordination**, **compliance workflows**, **billing**, and **logistics automation**.

Built as a **pnpm monorepo**, the platform currently ships a **React 19 + Vite web application on Netlify**, an **Express 5 API on Fly.io**, **Prisma-backed PostgreSQL data access**, **Socket.io realtime flows**, and **Stripe-powered billing** for modern freight teams.

If you want one system for **dispatch**, **tracking**, **paperwork**, **analytics**, **compliance**, and **operational control**, this is the platform vision. Some authenticated surfaces are still demo-backed or blocked; check [`docs/current-status.md`](docs/current-status.md) before claiming production readiness.

---

## 📦 Monorepo Overview

- `apps/api` — Node.js + Express 5 backend, TypeScript, Prisma, billing helpers, and freight workflow logic
- `apps/web` — React 19 + Vite frontend, strict TypeScript, operator surfaces, and client-side API helpers
- `apps/mobile` — reserved mobile surface *(planned)*
- `netlify/functions` — retained function entrypoints for future packaging or emergency fallback; normal Netlify deploys currently keep these disabled and proxy browser API traffic to Fly.io
- `netlify/database/migrations` — Netlify Database migrations. Applied migrations must remain immutable.
- `docs/` — architecture, launch, operations, Stripe, Netlify, and production-readiness docs
- `scripts/` — local setup, validation, deployment helpers, and operational tooling
- `.github/` — CI workflows, automation, and repository metadata

> **Workspace managed with pnpm.** The web app is built and deployed separately from the production API. Browser traffic uses same-origin `/api/*` paths from Netlify, which proxy to the Fly.io API origin.

---

## Platform Highlights

Current and planned capabilities include:

- AI-assisted dispatch workflows
- Shipment location, ETA, and status visibility
- Driver-dispatch chat and operational messaging
- Load matching and negotiation support
- Digital paperwork, BOL/POD, invoicing, and portal flows
- Role-based, tenant-aware compliance controls
- Stripe checkout, customer portal, webhook sync, and one-time payment tracking
- Broker, rate, and operational analytics
- Load-board, geofencing, CSA, IFTA, and related freight workflow surfaces

Readiness varies by route. The app now labels demo-backed routes and blocks not-ready authenticated routes using the route readiness map in [`docs/current-status.md`](docs/current-status.md).

---

## Active Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS, Zustand, Socket.io client |
| Backend | Express 5, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Cache | Redis |
| Auth | Supabase Auth and JWT-derived trusted claims |
| Billing | Stripe Checkout, Customer Portal, webhooks, and one-time payments |
| Realtime | Socket.io |
| Deploy | Fly.io API, Netlify Web, Docker |
| Monitoring | Sentry is opt-in through environment configuration |

---

## Solution Architecture

```text
web/   ─▶  api/   ─▶  db (Postgres/Prisma)
        │         ├─▶ Redis
        │         ├─▶ Stripe (billing)
        │         ├─▶ Socket.io (realtime)
        │         └─▶ Auth (Supabase)
```

Full references:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/API-REFERENCE.md`](docs/API-REFERENCE.md)

---

## Quick Start

```bash
pnpm install
pnpm run env:setup
pnpm run db:setup
pnpm run dev
```

Recommended local infra fallback:

```bash
docker-compose up -d
```

Further setup references:

- [`docs/LOCAL_STARTUP_CHECKLIST.md`](docs/LOCAL_STARTUP_CHECKLIST.md)
- [`docs/environment/ENVIRONMENT_VARIABLES_COMPLETE.md`](docs/environment/ENVIRONMENT_VARIABLES_COMPLETE.md)

> **Never commit secrets.**

---

## Public And App Surfaces

### Public marketing and intake routes

- `/`
- `/services`
- `/request-quote`
- `/track-shipment`
- `/customer-portal`
- `/carrier-portal`
- `/load-board`
- `/pricing`
- `/partners`
- `/drive`
- `/contact`

### Authenticated operational routes

- `/ops`
- `/loads`
- `/dispatch`
- `/drivers`
- `/invoices`
- `/analytics`
- `/compliance`
- `/settings`
- `/billing`
- `/carriers`
- `/accounting`
- `/quotes`
- `/messages`
- `/driver-app`

These routes are explicitly labeled or blocked by readiness status in the app and in [`docs/current-status.md`](docs/current-status.md).

---

## API And Netlify Routing

Production browser traffic should use the same-origin Netlify API path:

```bash
VITE_API_URL=/api
```

The committed Netlify configuration publishes the Vite output from `apps/web/dist`, redirects the apex and default Netlify hostname to `https://www.infamousfreight.com`, keeps repo-owned Netlify Functions out of normal deploys, proxies `/api/health`, public freight intake paths, and broader `/api/*` traffic to the Fly.io API, and keeps the SPA fallback last.

Launch-critical checks should verify:

- `https://www.infamousfreight.com`
- `https://infamousfreight.com` redirecting to the `www` host
- `https://www.infamousfreight.com/api/health`
- public API routes under `/api/public/*` through the Netlify-to-Fly proxy

Direct `api.infamousfreight.com` checks are useful for operations diagnostics only after that domain is confirmed.

---

## Health & Runtime Verification

```bash
curl -X GET https://www.infamousfreight.com/api/health
curl -X GET https://www.infamousfreight.com/api/health/live
curl -X GET https://www.infamousfreight.com/api/health/ready
```

Use these during local verification, pre-launch validation, post-deploy smoke checks, and incident response.

---

## CI/CD & Quality Gates

| Gate | Purpose |
|---|---|
| Lint | Code style and hygiene |
| Typecheck | Strict TypeScript validation |
| Test | Deterministic verification |
| Build | CI-stable output |
| Runtime checks | Docker, Fly, and health validation |

All checks must pass before PR merge.

---

## Documentation

- [Current Runtime Status](docs/current-status.md)
- [Project Docs Index](docs/README.md)
- [Local Startup Checklist](docs/LOCAL_STARTUP_CHECKLIST.md)
- [Environment Variables Reference](docs/environment/ENVIRONMENT_VARIABLES_COMPLETE.md)
- [Detailed Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API-REFERENCE.md)
- [Production, Compliance, and Launch Docs](docs/LAUNCH_READINESS_INDEX.md)

---

## Deployment & Operations

Pushes to `main` can deploy:

- API to Fly.io
- Web to Netlify

Supporting references:

- [`docs/production-operations/README.md`](docs/production-operations/README.md)
- [`docs/INTEGRATIONS-AND-SECRETS.md`](docs/INTEGRATIONS-AND-SECRETS.md)
- [`docs/NETLIFY-BUILDHOOKS.md`](docs/NETLIFY-BUILDHOOKS.md)
- [`docs/CUSTOM-DOMAIN.md`](docs/CUSTOM-DOMAIN.md)
- [`docs/netlify-deploy-checklist.md`](docs/netlify-deploy-checklist.md)

Verification should always include:

- `https://www.infamousfreight.com`
- redirect from `https://infamousfreight.com`
- `https://www.infamousfreight.com/api/health`
- public intake routes under `/api/public/*`
- Fly.io runtime status after deploy

---

## Security & Compliance

- all external input is strictly validated
- no hardcoded secrets
- production credentials stay in local or managed environment config
- principle of least privilege across platform services
- Sentry monitoring and operational observability are supported
- RBAC and trusted-claim checks are enforced at the API layer

Responsible disclosure: [`SECURITY.md`](SECURITY.md)

---

## License / Ownership

Copyright 2025–2026 Infamous Freight. All rights reserved.
MIT License

> This project and its code/modules are production-sensitive. Handle them with the same care expected for enterprise procurement, auditing, customer review, and security operations.
