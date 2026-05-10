# Infamous Freight Required Setup

This runbook records the required setup path for Infamous Freight and the current repository reality. It should be used before development, deployment, or agent work starts.

## Current Checkout Status

This checkout is the Netlify-oriented Infamous Freight monorepo. It uses React, Vite, Netlify Functions, an Express API, Prisma, PostgreSQL, and Fly.io deployment support.

It is not the Laravel/Inertia/Laravel Sail source tree described by the requested LoadPartner TMS setup. Do not run `sail`, Laravel migrations, Composer install, or PHP setup commands against this checkout unless the repository has first been replaced with the Laravel TMS repository.

## Required GitHub Setup

Target repository:

```text
MrMiless44/infamous-freight-platform
```

Required working branch:

```text
infamous-custom
```

Do not work directly on:

```text
main
```

If the repository cannot be accessed or returns `404`, reconnect GitHub access in the ChatGPT connector settings and allow access to `infamous-freight-platform`.

GitHub Issues should be enabled by a repository admin:

```text
Repo -> Settings -> Features -> Issues -> Enable
```

## Laravel TMS Setup Path

Use this path only after confirming the checkout is the Laravel TMS repository.

Install workstation dependencies:

- Git
- Docker Desktop
- Node.js and npm
- Composer
- PHP, if not relying fully on Docker

Clone and enter the expected repository:

```bash
git clone git@github.com:MrMiless44/infamous-freight-platform.git
cd infamous-freight-platform
git checkout infamous-custom
```

If SSH access is unavailable, use HTTPS:

```bash
git clone https://github.com/MrMiless44/infamous-freight-platform.git
cd infamous-freight-platform
git checkout infamous-custom
```

Add the LoadPartner upstream source:

```bash
git remote add upstream https://github.com/loadpartner/tms.git
git remote -v
```

Install Laravel Sail dependencies:

```bash
docker run --rm \
  -u "$(id -u):$(id -g)" \
  -v "$(pwd):/var/www/html" \
  -w /var/www/html \
  laravelsail/php84-composer:latest \
  composer install --ignore-platform-reqs
```

Make Sail available in the current shell:

```bash
export PATH=./vendor/bin:$PATH
```

Create the local environment file:

```bash
cp .env.example .env
```

Do not commit `.env`.

Start the Laravel app:

```bash
sail up -d
sail artisan migrate
sail npm install
sail artisan key:generate
sail npm run dev
```

Optional demo data:

```bash
sail artisan dev:refresh
```

Daily Laravel workflow:

```bash
cd infamous-freight-platform
git checkout infamous-custom
git pull origin infamous-custom
sail up -d
sail npm run dev
```

## Deployment Setup

Add the Phoenix/Fly git remote only after local setup works.

```bash
git checkout infamous-custom
git remote add fly "<YOUR_PHOENIX_GIT_URL>"
git push --quiet fly infamous-custom:main 2>&1
```

If the `fly` remote already exists:

```bash
git remote set-url fly "<YOUR_PHOENIX_GIT_URL>"
git push --quiet fly infamous-custom:main 2>&1
```

Do not commit deployment secrets, environment files, private keys, or provider tokens.

## Build Order

1. Get the local app running.
2. Brand the app as Infamous Freight.
3. Verify dashboard and TMS workflow.
4. Customize customers, carriers, loads, lanes, and documents.
5. Add MapLibre maps.
6. Add GraphHopper routing.
7. Add OR-Tools optimization.
8. Add INFAMOUS-ATLAS AI workflows.

## Netlify Monorepo Setup Path

If work continues in this checkout instead of the Laravel TMS repository, use the existing Netlify monorepo setup:

```bash
pnpm install --frozen-lockfile
pnpm env:setup
pnpm db:setup
pnpm dev
```

See [`local-setup.md`](./local-setup.md), [`ARCHITECTURE.md`](./ARCHITECTURE.md), and [`netlify-deploy-checklist.md`](./netlify-deploy-checklist.md) for the repository-accurate Netlify/Fly workflow.
