# Infamous Freight — Local Setup

Quickstart for running the Infamous Freight monorepo on a developer workstation. This is a companion to [`README.md`](../README.md) and [`CONTRIBUTING.md`](../CONTRIBUTING.md); when this guide and those documents disagree, those documents win.

---

## Prerequisites

- **Node.js** `>=22.0.0 <23.0.0` (see root [`package.json`](../package.json) `engines`). The repo includes [`.nvmrc`](../.nvmrc) and [`.node-version`](../.node-version), both set to `22` (latest Node 22.x).
- **pnpm** `>=10.0.0 <11.0.0` (see root [`package.json`](../package.json) `packageManager` and `engines`). Install with `corepack enable` (recommended) or `npm install -g pnpm@10`.
- **PostgreSQL** running locally (or via Docker / Supabase). Default local URL in [`.env.example`](../.env.example) is `postgresql://infamous:changeme@localhost:5432/infamous_freight`.
- **Redis** for rate limiting / queues (default `localhost:6379` per `.env.example`).
- Optional: **Docker** for spinning up Postgres + Redis via [`docker-compose.yml`](../docker-compose.yml).

> This project does **not** use Laravel or Sail. Ignore any Sail/PHP instructions from external sources — the API is Node/Express and the web app is React + Vite.

## 1. Clone and install

```bash
git clone https://github.com/Infaemous-Freight/Infamous-freight.git
cd Infamous-freight
pnpm install --frozen-lockfile
```

## 2. Configure environment

```bash
cp .env.example .env
# fill in values for DATABASE_URL, JWT_SECRET, STRIPE_*, etc.
```

For the full variable matrix (and which ones are required for which feature), see [`ENVIRONMENT_VARIABLES_COMPLETE.md`](../ENVIRONMENT_VARIABLES_COMPLETE.md) and [`docs/environment/`](./environment).

## 3. Database

```bash
# from repo root
pnpm -C apps/api exec prisma migrate dev
pnpm -C apps/api exec prisma generate
```

If you want seed data, see [`docs/MVP_LAUNCH_DEMO_DATA_SET.md`](./MVP_LAUNCH_DEMO_DATA_SET.md) and the seed scripts under `apps/api/prisma/`.

## 4. Run the apps

In two terminals:

```bash
# API (Express, default :3001)
pnpm -C apps/api run dev
```

```bash
# Web (Vite dev server)
pnpm -C apps/web run dev
```

The web app proxies `/api/*` and `/socket.io/*` to the API in production via [`netlify.toml`](../netlify.toml); locally the Vite dev server is configured for the same paths.

## 5. Validate before committing

Run the same checks CI runs:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm -C apps/api exec tsc -p tsconfig.json --noEmit
pnpm -C apps/web exec tsc -p tsconfig.json --noEmit
pnpm -C apps/api run test:coverage
pnpm -C apps/web run test
```

Or, if available, the aggregate validator:

```bash
pnpm run validate
```

## Troubleshooting

- **`PrismaClientInitializationError` on Linux** — the schema includes `binaryTargets = ["native", "debian-openssl-1.1.x"]` for the production runtime. Locally, `prisma generate` should pick up the right target automatically; if not, re-run after installing system OpenSSL.
- **Stripe local testing** — see [`STRIPE-SETUP.md`](./STRIPE-SETUP.md).
- **Auth / RLS issues** — see [`AUTHORIZATION_MIGRATION_PLAN.md`](./AUTHORIZATION_MIGRATION_PLAN.md).
- **Required CLIs** — [`REQUIRED-CLIS.md`](./REQUIRED-CLIS.md).

## Related docs

- [`platform-roadmap.md`](./platform-roadmap.md)
- [`customization-checklist.md`](./customization-checklist.md)
- [`CODEX_ENVIRONMENT.md`](./CODEX_ENVIRONMENT.md)
