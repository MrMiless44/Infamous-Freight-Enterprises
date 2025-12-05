# Infæmous Freight ♊ – AI Synthetic Intelligence Stack

This repo contains a minimal but complete stack:

- `api`: Node.js Express + Prisma API with AI Synthetic client
- `web`: Next.js web UI with AI avatars
- `postgres`: PostgreSQL via Docker
- `nginx`: Reverse proxy routing `/` to web and `/api` to API
- `docker-compose.yml`: Single-command local deployment

## Quick start (local)

```bash
cp .env.example .env
docker compose up --build
```

Open:

- Web: [http://localhost](http://localhost)
- API health: [http://localhost/api/health](http://localhost/api/health)

## Database

Inside API container:

```bash
docker compose run api npm run prisma:generate
docker compose run api npx prisma migrate dev
```

## Notes

- Never commit real secrets.
- Add secrets in GitHub settings for CI.

## Deployment

Supports Docker, Render, Fly.io, Vercel.
