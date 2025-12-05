# Vercel Environment Variables

## Required (Production dashboard)
- `NEXT_PUBLIC_APP_NAME=Infæmous Freight`
- `NEXT_PUBLIC_ENV=production`
- `NEXT_PUBLIC_API_BASE=https://your-api.fly.dev/api`
- `DATABASE_URL` – same key name as Fly for parity (use a read-only connection if needed)
- `JWT_SECRET` – matches the API secret for end-to-end tests

## Optional
- `STRIPE_PUBLIC_KEY=` (currently unused; placeholder for future Stripe integration)
- `PAYPAL_CLIENT_ID=` (currently unused; placeholder for future PayPal integration)
- AI provider keys for client-side features:
  - `AI_PROVIDER`
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`
  - `AI_SYNTHETIC_API_KEY`
  - `AI_SYNTHETIC_ENGINE_URL`

## Notes
- Only the web app is deployed to Vercel; the API URL should point to Fly.io/Render.
- Keep the variable names identical to those in Fly and `.env.example` so GitHub Actions (`vercel-deploy.yml`) and dashboard configuration stay in sync.
- Add custom-domain rewrites in `vercel.json` if you map a vanity domain.
