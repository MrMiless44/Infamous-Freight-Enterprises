# 🚛 Infamous Freight

> **AI-driven freight operations platform: dispatch, fleet intelligence, driver coaching—enterprise-ready and built for scale.**

[![CI](https://img.shields.io/github/actions/workflow/status/Infaemous-Freight/Infamous-freight/main.yml?branch=main&label=CI)](https://github.com/Infaemous-Freight/Infamous-freight/actions)
[![License](https://img.shields.io/github/license/Infaemous-Freight/Infamous-freight)](LICENSE)
[![Code Style: TypeScript](https://img.shields.io/badge/code%20style-typescript-blue.svg)](https://www.typescriptlang.org/)

---

## 📦 Monorepo Overview

- **api/**: Node.js (Express) backend, TypeScript, ESM-only
- **web/**: React (Vite) frontend, strict TypeScript
- **mobile/**: React Native/Expo (planned)
- **shared/**, **configs/**: Strictly typed, reusable modules; ESM workspace resolution

> **Workspace managed via PNPM. ESM enforced. No CommonJS—except where unavoidable for vendor deps.**

---

## 🔥 Platform Highlights

- 🚚 Dispatch automation (AI-assisted)
- 📍 Real-time location, ETA, and status
- 💬 Driver-dispatch chat (with voice notes)
- 🤖 Load matching & negotiation bots
- 📄 Digital paperwork, BOL/POD, invoicing
- 🛡️ Role-based, tenant-aware compliance
- 💳 Stripe, payroll/factoring integrations
- 📊 Broker & rate analytics
- 🔎 Multi-board, ELD, IFTA, geofencing, CSA, + more

---

## 🛡️ Enterprise-Grade Quality & Security

- **Production-ready by default.** SaaS-grade for critical freight ops.
- **Strict typing, explicit exports, no unused vars** (CI-enforced).
- **Structured input validation & error handling** everywhere.
- **Nothing is deployed without full CI:** lint, typecheck, build, test all pass before merge.
    - **No secrets in code:** uses `.env` files (never commit them).
    - **Principle of least privilege** across all config, CI workflows, and service roles.
    - **Security Contact**: See [SECURITY.md](SECURITY.md) to report vulnerabilities.

---

## 🧱 Active Tech Stack

| Layer        | Tech                            |
|--------------|----------------------------------|
| Frontend     | React, Vite, TypeScript, Tailwind, Zustand, Socket.io |
| Backend      | Express 4, TypeScript, Prisma ORM|
| Database     | PostgreSQL                      |
| Cache        | Redis                           |
| Auth         | Supabase Auth + JWT             |
| Billing      | Stripe                          |
| Realtime     | WebSockets (Socket.io)          |
| Deploy       | Fly.io (API), Netlify (Web), Docker |

> See full architecture diagram below for service flow.

---

## 🏗️ Solution Architecture

```text
web/   ─▶  api/   ─▶  db (Postgres/Prisma)
        │         ├─▶ Redis
        │         ├─▶ Stripe  (billing)
        │         ├─▶ Socket.io (realtime)
        │         └─▶ Auth (Supabase)
```

Full structure & docs:
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/API-REFERENCE.md`](docs/API-REFERENCE.md)
- [Monorepo package layout](#🗂️-project-structure)

---

## ⚡ Quick Start

```bash
pnpm install
pnpm run env:setup
# Edit .env files for api/, web/, root as needed
pnpm run db:setup
pnpm run dev
# Recommended: docker-compose up -d
```

- Follow the complete startup runbook in [docs/LOCAL_STARTUP_CHECKLIST.md](docs/LOCAL_STARTUP_CHECKLIST.md).
- See [docs/environment/ENVIRONMENT_VARIABLES_COMPLETE.md](docs/environment/ENVIRONMENT_VARIABLES_COMPLETE.md) for full .env requirements.
- **Never commit any secrets.**

---

## 🧪 CI/CD & Quality Gates

| Gate       | Purpose                      |
|------------|------------------------------|
| Lint       | Code style & hygiene         |
| Typecheck  | Strict TypeScript everywhere |
| Test       | Deterministic, non-flaky     |
| Build      | ESM-compatible, CI stable    |

- **CI**: Strict GitHub Actions (see [`.github/workflows/`](.github/workflows/)).
- **All must pass** before any PR merge.
- **Workspace scripts enforce:** no cross-package magic, path alias discipline, config idempotence.

---

## 🗂️ Project Structure

```text
apps/
  api/      # Express backend, TypeScript, ESM only
  web/      # React App, Vite, Frontend
  mobile/   # React Native (planned)
shared/     # Shared TS utils and configs
configs/    # Lint, tsconfig, etc.
docs/       # Playbooks, architecture, ops
.github/    # CI, badges, social preview
Dockerfile*, docker-compose.yml, etc.
```

---

## 📝 Coding Standards

- **TypeScript-first, ESM enforced.**
- Explicit exports, no implicit globals, small composable functions.
- Predictable file layouts, clear domain boundaries (dispatch, fleet, drivers, ops).
- **All changes require passing lint/typecheck/test/build.**
- Environment config via `.env` (never hardcode or expose secrets).
- [See CONTRIBUTING.md for more style and PR expectations.](CONTRIBUTING.md)

---

## 👩‍💻 Contributing & Onboarding

- See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines
- All PRs: clear summary, logical commit structure, and readiness for CI
- Branches: `feature/*`, `fix/*`, `docs/*` (see full naming convention)
- Use [Discussions](https://github.com/Infaemous-Freight/Infamous-freight/discussions) or Issues for questions

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

- **Push to main auto-deploys:**
  - API to Fly.io
  - Web to Netlify
- [Manual deploy](#🚀-deployment) and [operations runbooks](docs/production-operations/README.md) available
- **Verification:** Health endpoints, API tokens/environment required
- All sensitive/prod flows use `.env` (not committed!)

---

## 🔒 Security & Compliance

- All external input strictly validated
- No hardcoded secrets; production tokens/keys only in local `.env`
- Principle of least privilege, Sentry error monitoring, RBAC enforced at API layer
- [Responsible Disclosure: SECURITY.md](SECURITY.md)

---

## 📄 License / Ownership

Copyright 2025–2026 Infamous Freight. All rights reserved.
[MIT License](LICENSE)

> This project and all code/modules are production-sensitive. Treat compliant with enterprise procurement, auditing, and customer security standards. All contributors and consumers must respect code handling and security outlined herein.

---

*For more, see full documentation and join the [discussion board](https://github.com/Infaemous-Freight/Infamous-freight/discussions) for implementation and roadmap Q&A.*

---
