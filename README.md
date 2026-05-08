          🚛 Infamous Freight 🚚

> **Freight operations platform: dispatch workflows, shipment visibility, driver coordination, billing, and logistics execution.**

[![CI](https://img.shields.io/github/actions/workflow/status/Infaemous-Freight/Infamous-freight/main.yml?branch=main&label=CI)](https://github.com/Infaemous-Freight/Infamous-freight/actions)
[![License](https://img.shields.io/github/license/Infaemous-Freight/Infamous-freight)](LICENSE)
[![Code Style: TypeScript](https://img.shields.io/badge/code%20style-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)

Infamous Freight is a freight operations platform for dispatch execution, shipment visibility, driver coordination, compliance workflows, billing, and logistics automation.

Built as a **pnpm monorepo**, the platform combines an **Express 5 backend**, **React + Vite web application**, **Prisma/PostgreSQL data workflows**, **Socket.io messaging**, and **Stripe-powered billing flows** for modern freight teams.

The repository is the active implementation source for dispatch, tracking, paperwork, analytics, compliance, and operational control workflows.

---

## 📦 Monorepo Overview

- `apps/api` — 🛠️ Node.js + Express backend, TypeScript
- `apps/web` — 🌐 React + Vite frontend, strict TypeScript
- `apps/mobile` — 📱 React Native / Expo surface *(planned)*
- `docs/` — 📚 architecture, launch, operations, security, and readiness docs
- `.github/` — 🔁 CI workflows, badges, automation, and social preview assets

> **Workspace managed with pnpm.**

---

## 🔥 Platform Highlights

- 🚚 Dispatch workflow surfaces
- 📍 Real-time shipment location, ETA, and status visibility
- 💬 Driver-dispatch chat with voice-note support
- 🤖 Planned load matching and negotiation workflows
- 📄 Digital paperwork, BOL/POD, and invoicing flows
- 🛡️ Tenant-aware API behavior with role controls under active hardening
- 💳 Stripe billing, payroll, and factoring support
- 📊 Broker, rate, and operational analytics
- 🔎 Multi-board, ELD, IFTA, geofencing, CSA, and related freight workflow modules under active development

---

## 🛡️ Enterprise-Grade Quality & Security

- ✅ **Production-focused defaults** for operationally sensitive freight workflows
- ✅ **Strict typing, explicit exports, and CI-enforced code quality**
- ✅ **Structured validation and error handling** across the stack
- ✅ **Nothing ships without CI**: lint, typecheck, build, and test must pass before merge
- ✅ **No secrets in code**: use `.env` files and managed secret stores only
- ✅ **Least-privilege guidance** across services, workflows, and runtime configuration
- ✅ **Security contact**: see [`SECURITY.md`](SECURITY.md) for responsible disclosure

---

## 🧱 Active Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, Vite, TypeScript, Tailwind, Zustand, Socket.io |
| Backend | Express 5, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Cache | Redis |
| Auth | Supabase Auth + JWT |
| Billing | Stripe |
| Realtime | Socket.io |
| Deploy | Fly.io (API), Netlify (Web), Docker |

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

> Never commit secrets.

---

## 🧪 CI/CD & Quality Gates

| Gate | Purpose |
|---|---|
| Lint | Code style and hygiene |
| Typecheck | Strict TypeScript validation |
| Test | Deterministic verification |
| Build | ESM-compatible, CI-stable output |

- 🔁 CI runs through GitHub Actions under [`.github/workflows/`](.github/workflows/)
- ✅ All checks must pass before PR merge
- 🧩 Workspace scripts enforce path discipline, validation consistency, and environment sanity

---

## 🗂️ Project Structure

```text
apps/
  api/      # Express backend, TypeScript
  web/      # React + Vite frontend
  mobile/   # React Native / Expo (planned)

docs/       # Architecture, operations, launch, and compliance docs
.github/    # CI workflows, badges, and social preview
Dockerfile*, docker-compose.yml, etc.
```

---

## 📝 Coding Standards

- TypeScript-first
- explicit exports
- small composable functions
- predictable file layouts
- clear domain boundaries across dispatch, fleet, driver, and operations modules
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
- [Production, Compliance, and Launch Docs](docs/PRODUCTION_READINESS_VERIFICATION.md)

---

## 🚀 Deployment & Operations

Pushes to `main` can deploy:

- 🚚 API to Fly.io
- 🌐 Web to Netlify

Supporting references:

- [`docs/production-operations/README.md`](docs/production-operations/README.md)
- [`docs/INTEGRATIONS-AND-SECRETS.md`](docs/INTEGRATIONS-AND-SECRETS.md)
- [`docs/NETLIFY-BUILDHOOKS.md`](docs/NETLIFY-BUILDHOOKS.md)

Verification should always include health endpoints, required environment variables, and deploy-specific smoke checks.

---

## 🔒 Security & Compliance

- all external input is strictly validated
- no hardcoded secrets
- production credentials stay in local or managed environment config
- principle of least privilege across platform services
- Sentry monitoring and operational observability
- RBAC enforced at the API layer

Responsible disclosure: [`SECURITY.md`](SECURITY.md)

---

## 📄 License / Ownership

Copyright 2025–2026 Infamous Freight. All rights reserved.  
[MIT License](LICENSE)

> This project and its code/modules are production-sensitive. Handle them with the same care expected for enterprise procurement, auditing, customer review, and security operations.

---

For more, see the full documentation and use the project discussion board for implementation and roadmap Q&A.
