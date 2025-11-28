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

If you want, next I can add:

- Prisma migrations for the DB
- Stripe/PayPal billing routes
- or a voice/command endpoint where you “call” your avatar by name and it responds.

## AI maintenance endpoints

The API now exposes scoped endpoints that proxy the AI Synthetic Intelligence ♊ engine:

- `POST /api/ai/repair/env` – submit the current `.env` plus a validation report so the AI can patch missing or broken values.
- `POST /api/ai/sign/env` – request a digital signature for a given `.env` so deployments can verify provenance.

Both routes require the shared `AI_SYNTHETIC_API_KEY` (sent via `x-api-key`) and enforce the `system:admin` + `ai:repair` scopes through `auth.hybrid` and `scopeGuard`.

## CI/CD autonomy

- Use `node scripts/ci-auto-repair.js .env` inside your GitHub Action (or any CI runner) to call the repair endpoint whenever a workflow fails. The script reads the provided env file, posts it to the API, and prints the AI response.
- Configure `AI_AUTOREPAIR_ENDPOINT`, `AI_SYNTHETIC_API_KEY`, and `AI_SECURITY_MODE` as repository secrets so the script authenticates securely.
- See `docs/ci-autonomy.md` for a full walk-through, including an example `if: failure()` step and a table of required secrets.
