# **INFÆMOUS FREIGHT**

**🚛 AI-driven freight operations platform 🚚**

Dispatch • Fleet intelligence • Driver coordination • Compliance • Billing • Enterprise-ready logistics execution

[![validation](https://img.shields.io/github/actions/workflow/status/Infaemous-Freight/Infamous-freight/full-validation.yml?branch=main&label=validation)](https://github.com/Infaemous-Freight/Infamous-freight/actions/workflows/full-validation.yml)
[![fly deploy](https://img.shields.io/github/actions/workflow/status/Infaemous-Freight/Infamous-freight/deploy-fly.yml?branch=main&label=fly%20deploy)](https://github.com/Infaemous-Freight/Infamous-freight/actions/workflows/deploy-fly.yml)
![license](https://img.shields.io/github/license/Infaemous-Freight/Infamous-freight)
[![code style: TypeScript](https://img.shields.io/badge/code%20style-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)

---

## 🚛 Overview

Infamous Freight is an AI-powered freight operations platform for **dispatch execution**, **shipment visibility**, **driver coordination**, **compliance workflows**, **billing**, and **logistics automation**.

Built as a **pnpm monorepo**, the platform currently ships a **React 19 + Vite web application on Netlify**, an **Express 5 API on Fly.io**, **Prisma-backed PostgreSQL data access**, **Socket.io realtime flows**, and **Stripe-powered billing** for modern freight teams and enterprise-ready operations.

If you want one system for **dispatch**, **tracking**, **paperwork**, **analytics**, **compliance**, and **operational control**, this is the platform.

> Runtime truth and current hardening status live in [`docs/current-status.md`](docs/current-status.md).

---

## 📦 Monorepo Overview

- `apps/api` — 🛠️ Node.js + Express 5 backend, TypeScript, Prisma, billing helpers, and freight workflow logic
- `apps/web` — 🌐 React 19 + Vite frontend, strict TypeScript, operator surfaces, and client-side API helpers
- `apps/mobile` — 📱 reserved mobile surface *(planned)*
- `netlify/functions` — ⚡ retained function entrypoints for future packaging or emergency fallback; normal Netlify deploys currently keep these disabled and proxy browser API traffic to Fly.io
- `docs/netlify-database-pending-migrations` — 🗄️ pending Netlify Database migration drafts kept outside Netlify's auto-provisioning path.
- `docs/` — 📚 architecture, launch, operations, Stripe, Netlify, and production-readiness docs
- `scripts/` — 🔁 local setup, validation, deployment helpers, and operational tooling
- `.github/` — 🤖 CI workflows, automation, and repository metadata

> **Workspace managed with pnpm.** The web app is built and deployed separately from the production API. Browser traffic uses same-origin `/api/*` paths from Netlify, which proxy to the Fly.io API origin.

---

## 🔥 Platform Highlights

- 🚚 AI-assisted dispatch workflows
- 📍 Real-time shipment location, ETA, and status visibility
- 💬 Driver-dispatch chat and operational messaging
- 🤖 Load matching and negotiation support
- 📄 Digital paperwork, BOL/POD, invoicing, and portal flows
- 🛡️ Role-based, tenant-aware compliance controls
- 💳 Stripe checkout, customer portal, webhook sync, and one-time payment tracking
- 📊 Broker, rate, and operational analytics
- 🔎 Support for load-board, geofencing, CSA, IFTA, and related freight workflow surfaces

---

## 🛡️ Enterprise-Grade Quality & Security

- ✅ **Production-focused defaults** for operationally sensitive freight workflows
- ✅ **Strict typing, explicit exports, and CI-enforced code quality**
- ✅ **Structured validation and error handling** across the stack
- ✅ **Nothing ships without CI**: lint, typecheck, build, test, and runtime checks must pass before merge
- ✅ **No secrets in code**: `.env` files and managed secret stores only
- ✅ **Principle of least privilege** across services, workflows, and runtime configuration
- ✅ **Security contact**: see [`SECURITY.md`](SECURITY.md) for responsible disclosure

---

## 🧱 Active Tech Stack

| Layer | Tech |
|---|---|
| 🎨 Frontend | React 19, Vite, TypeScript, Tailwind CSS, Zustand, Socket.io client |
| 🧠 Backend | Express 5, TypeScript, Prisma ORM |
| 🗄️ Database | PostgreSQL |
| ⚡ Cache | Redis |
| 🔐 Auth | Supabase Auth and JWT-derived trusted claims |
| 💳 Billing | Stripe Checkout, Customer Portal, webhooks, and one-time payments |
| 📡 Realtime | Socket.io |
| ☁️ Deploy | Fly.io (API), Netlify (Web), Docker |
| 🚨 Monitoring | Sentry is opt-in through environment configuration |

---

## 🏗️ Solution Architecture

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

## 📸 Screenshots

### 🖥️ Current Visuals

Use any existing visuals you already keep in the repo:

```md
![Landing Experience](docs/screenshots/infamousfreight-landing-page.svg)
![Platform Overview](docs/screenshots/infamousfreight-platform-overview.svg)
```

### 🧭 Product UI Screenshots

Replace the placeholders below with real product screenshots as the app matures.

| View | Screenshot |
|---|---|
| 🚚 Dispatch Board | `docs/screenshots/dispatch-board.png` |
| 📦 Shipment Detail View | `docs/screenshots/shipment-detail.png` |
| 👨‍✈️ Driver Operations View | `docs/screenshots/driver-ops.png` |
| 💬 Realtime Chat View | `docs/screenshots/chat-view.png` |
| 💳 Billing / Invoicing View | `docs/screenshots/billing-invoice.png` |
| 📊 Analytics Dashboard | `docs/screenshots/analytics-dashboard.png` |
| 🛡️ Compliance Panel | `docs/screenshots/compliance-panel.png` |
| 🗂️ Carrier Packet Workflow | `docs/screenshots/carrier-packet.png` |

### 🖼️ Social Preview

The GitHub social preview image should live at:

```text
.github/social-preview.png
```

To regenerate after updating branding assets:

```bash
pnpm run social-preview:generate
```

> Maintainers must upload the resulting PNG via **Settings → General → Social preview**. GitHub does not accept SVG there and does not expose an API for this setting.

---

## ⚡ Quick Start

```bash
pnpm install
pnpm run env:setup
# Edit .env files for repo root, apps/api, and apps/web as needed
pnpm run db:setup
pnpm run dev
# Recommended alternative for local infra:
docker-compose up -d
```

Further setup references:

- [`docs/LOCAL_STARTUP_CHECKLIST.md`](docs/LOCAL_STARTUP_CHECKLIST.md)
- [`docs/environment/ENVIRONMENT_VARIABLES_COMPLETE.md`](docs/environment/ENVIRONMENT_VARIABLES_COMPLETE.md)

> **Never commit secrets.**

---

## 🌐 Public And App Surfaces

### Public marketing and intake routes

The web app includes public routes such as:

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

The app also includes authenticated or operator-facing routes such as:

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

---

## 🔌 API And Netlify Routing

Production browser traffic should use the same-origin Netlify API path:

```bash
VITE_API_URL=/api
```

The committed Netlify configuration publishes the Vite output from `apps/web/dist`, redirects the apex and default Netlify hostname to `https://www.infamousfreight.com`, keeps repo-owned Netlify Functions out of normal deploys, proxies `/api/health`, public freight intake paths, and broader `/api/*` traffic to the Fly.io API, and keeps the SPA fallback last.

Launch-critical checks should verify:

- `https://www.infamousfreight.com`
- `https://infamousfreight.com` redirecting to the `www` host
- `https://www.infamousfreight.com/api/health`
- Public API routes under `/api/public/*` through the Netlify-to-Fly proxy

Direct `api.infamousfreight.com` checks are useful for operations diagnostics only after that domain is confirmed.

---

## 🔌 Health & Runtime Verification

Recommended checks:

```bash
curl -X GET https://www.infamousfreight.com/api/health
curl -X GET https://www.infamousfreight.com/api/health/live
curl -X GET https://www.infamousfreight.com/api/health/ready
```

Use these during:
- local verification
- pre-launch validation
- post-deploy smoke checks
- production incident response

---

## 🧪 CI/CD & Quality Gates

| Gate | Purpose |
|---|---|
| Lint | Code style and hygiene |
| Typecheck | Strict TypeScript validation |
| Test | Deterministic verification |
| Build | CI-stable output |
| Runtime checks | Docker, Fly, and health validation |

- 🔁 CI runs through GitHub Actions under [`.github/workflows/`](.github/workflows/)
- ✅ All checks must pass before PR merge
- 🧩 Workspace scripts enforce path discipline, validation consistency, and environment sanity

---

## 🗂️ Project Structure

```text
apps/
  api/      # Express 5 backend, TypeScript, Prisma
  web/      # React 19 + Vite frontend
  mobile/   # Reserved mobile surface (planned)

netlify/
  functions/            # Public intake and lookup routes
  database/migrations/  # Netlify database migrations

docs/       # Architecture, operations, launch, readiness
scripts/    # Setup, validation, deployment, runtime checks
.github/    # CI workflows, automation, repository metadata
Dockerfile*, docker-compose.yml, etc.
```

---

## 📝 Coding Standards

- TypeScript-first
- pnpm workspace discipline
- explicit exports and small composable functions
- predictable file layouts
- clear domain boundaries across dispatch, fleet, driver, billing, and operations modules
- all changes must pass lint, typecheck, test, and build
- environment configuration via `.env`

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for PR and style expectations.

---

## 👩‍💻 Contributing & Onboarding

- See [`CONTRIBUTING.md`](CONTRIBUTING.md) for full guidelines
- Every PR should include a clear summary, logical commit structure, and CI readiness
- Branches should follow `feature/*`, `fix/*`, `docs/*`, `chore/*`, `security/*`
- Use GitHub Discussions or Issues for questions and planning

---

## 📚 Documentation

- [Project Docs Index](docs/README.md)
- [Local Startup Checklist](docs/LOCAL_STARTUP_CHECKLIST.md)
- [Environment Variables Reference](docs/environment/ENVIRONMENT_VARIABLES_COMPLETE.md)
- [Detailed Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API-REFERENCE.md)
- [Production, Compliance, and Launch Docs](docs/LAUNCH_READINESS_INDEX.md)

---

## 🚀 Deployment & Operations

Pushes to `main` can deploy:

- 🚚 API to Fly.io
- 🌐 Web to Netlify

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

## 🔒 Security & Compliance

- all external input is strictly validated
- no hardcoded secrets
- production credentials stay in local or managed environment config
- principle of least privilege across platform services
- Sentry monitoring and operational observability are supported
- RBAC and trusted-claim checks are enforced at the API layer

Responsible disclosure: [`SECURITY.md`](SECURITY.md)

---

## 📄 License / Ownership

Copyright 2025–2026 Infamous Freight. All rights reserved.
MIT License

> This project and its code/modules are production-sensitive. Handle them with the same care expected for enterprise procurement, auditing, customer review, and security operations.

---

For more, see the full documentation and use the project discussion board for implementation and roadmap Q&A.
