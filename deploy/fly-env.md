# Fly.io API Environment Variables

## Required Secrets (set in Fly dashboard or via `flyctl secrets set`)
- `DATABASE_URL` – production Postgres connection string
- `JWT_SECRET` – generated per deployment
- `NODE_ENV` – `production`

## AI Providers
- `AI_PROVIDER` – set to `synthetic`, `openai`, or `anthropic`
- `AI_SYNTHETIC_API_KEY` – required when `AI_PROVIDER=synthetic`
- `AI_SYNTHETIC_ENGINE_URL` – internal URL to the AI simulator
- `AI_SECURITY_MODE` – e.g., `strict`
- `OPENAI_API_KEY` – only when `AI_PROVIDER=openai`
- `ANTHROPIC_API_KEY` – only when `AI_PROVIDER=anthropic`

## Billing
- `STRIPE_SECRET_KEY=`
- `PAYPAL_CLIENT_ID=`
- `PAYPAL_SECRET=`

## Voice / Uploads
- `WHISPER_API_KEY=` (optional)

## CI/CD name alignment
Use the exact variable names above so that Fly secrets, GitHub Actions (`fly-deploy.yml`), and `.env.example` all match. That alignment keeps `flyctl deploy` and any remote builds consistent with the local `.env`.
