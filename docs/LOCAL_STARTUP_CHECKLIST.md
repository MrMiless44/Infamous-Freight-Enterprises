# Local Startup Checklist

Use this checklist for a clean local bring-up of Infamous Freight.

## One-command startup (recommended)

```bash
pnpm run env:setup && docker-compose up -d
```

This installs dependencies, creates local `.env` files from templates, and starts the full Docker stack.

## Manual startup (without Docker)

```bash
pnpm run env:setup
pnpm run db:setup
pnpm run dev
```

Use this path when you need a fully local process-level dev loop.

## Verification

Run these checks after startup:

```bash
pnpm run build
pnpm run test
pnpm run validate
curl -X GET http://localhost:3000/health/live
curl -X GET http://localhost:3000/health/ready
```

Expected result: build/test/validate complete successfully and health endpoints return HTTP `200`.
