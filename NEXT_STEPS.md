# Next Steps Checklist

A focused list of actions to move Infæmous Freight AI from the current handoff into production.

## 1) Validate local stack
- Copy env template: `cp .env.example .env`
- Build & start services: `docker compose up --build`
- Verify API health: `curl http://localhost:4000/health`
- Open the web UI: http://localhost and confirm avatar grid renders.

## 2) Resolve the web build warning
The local status notes a Next.js build issue (⚠️ infamous_web). Rebuild the web app directly to capture the error:
- `cd web`
- Install deps: `npm install`
- Run a production build: `npm run build`
- If the build fails, fix the reported component or config issues, then re-run the command until it passes.

## 3) Prepare production secrets
Set these before deploying:
- API: `DATABASE_URL`, `JWT_SECRET`, `AI_PROVIDER` + provider keys (OpenAI/Anthropic), optional billing keys (`STRIPE_SECRET_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`).
- Web: `NEXT_PUBLIC_API_BASE` pointing at the deployed API URL.

## 4) Deploy API to Fly.io (recommended)
- Install & login: `brew install flyctl && flyctl auth login`
- From repo root: `flyctl launch --config fly.toml --no-deploy`
- Set secrets: `flyctl secrets set JWT_SECRET="$(openssl rand -base64 32)" DATABASE_URL="<prod-db-url>" AI_PROVIDER="openai" OPENAI_API_KEY="<key>"`
- Deploy: `flyctl deploy`
- Smoke test: `curl https://<fly-app>.fly.dev/health`

## 5) Deploy Web to Vercel
- `npm i -g vercel`
- `cd web && vercel --prod`
- In the Vercel dashboard, add `NEXT_PUBLIC_API_BASE=https://<fly-app>.fly.dev/api`

## 6) Enable CI/CD
- In GitHub repo settings → Actions secrets, add `FLY_API_TOKEN` and `VERCEL_TOKEN`.
- On push to `main`, workflows `.github/workflows/deploy-api.yml` and `.github/workflows/deploy-web.yml` will auto-deploy.

## 7) Finalize database
- SSH into Fly.io app: `flyctl ssh console`
- Apply migrations: `cd /app && npx prisma migrate deploy`
- Seed production data if desired: `node prisma/seed.js`

## 8) Post-deploy verification
- Hit `/api/health` on the live API.
- Load the Vercel URL and confirm the dashboard pulls live data.
- Test AI command and billing endpoints with sample payloads.
- Review Fly.io and Vercel logs for any errors.
