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

- Web: <http://localhost>
- API health: <http://localhost/api/health>

## Database

The API uses Prisma with Postgres.

Inside the api container:

```bash
docker compose run api npm run prisma:generate
```

Later you can add migrations with Prisma migrate.

## Notes

- Do not commit real secrets.
- Configure CI secrets in GitHub → Settings → Secrets and variables → Actions.

---

## How to deploy this

1. Create a new GitHub repo (private).
2. Copy all these files into that repo with the same structure.
3. Commit and push.
4. On your machine, from repo root:

```bash
cp .env.example .env
docker compose up --build
```

You now have a running Infæmous Freight ♊ stack: API + Web + AI simulator behind a single compose file, ready to grow with more AI SYNTHETIC INTELLIGENCE features.

If you want, next we can add Prisma migrations for the DB, Stripe/PayPal billing routes, or a voice/command endpoint where you “call” your avatar by name and it responds.
