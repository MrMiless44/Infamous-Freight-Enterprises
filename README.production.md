# Infæmous Freight AI - Complete Production System

A next-generation AI-powered logistics platform featuring:

- **GĘŊÏŮ§ Core** - Logistics AI Navigator
- **AURUM Dispatch** - Dispatcher Co-pilot
- **NOIR Guardian** - Risk and Compliance AI

## Architecture

```
┌─────────────┐
│   Nginx     │  Port 80
│   Proxy     │
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
┌──▼──┐  ┌──▼──┐
│ Web │  │ API │
│3000 │  │4000 │
└─────┘  └──┬──┘
            │
       ┌────▼────┐
       │Postgres │
       │  5432   │
       └─────────┘
```

## Quick Start

### Local Development

```bash
# Copy environment template
cp .env.example .env

# Start all services
docker compose up --build

# Access the app
open http://localhost
```

### Production Deployment

#### Option 1: Fly.io (Recommended for API)
```bash
# Install flyctl
brew install flyctl

# Login
flyctl auth login

# Deploy
flyctl deploy --config fly.toml
```

#### Option 2: Vercel (Recommended for Web)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web && vercel --prod
```

#### Option 3: Render (All-in-One)
```bash
# Push render.yaml to your repo
# Connect repo at https://render.com
```

## Tech Stack

### API
- Node.js 20 + Express
- Prisma ORM + PostgreSQL
- OpenAI / Anthropic / Synthetic AI
- Stripe + PayPal billing
- JWT authentication
- Voice command processing

### Web
- Next.js 14
- TypeScript
- React 18
- SWR for data fetching
- Tailwind-inspired inline styles

### DevOps
- Docker + Docker Compose
- Nginx reverse proxy
- GitHub Actions CI/CD
- Multi-stage builds

## Project Structure

```
infamous-freight-ai/
├── api/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── health.js
│   │   │   ├── ai.commands.js
│   │   │   ├── billing.js
│   │   │   ├── voice.js
│   │   │   └── aiSim.internal.js
│   │   ├── services/
│   │   │   └── aiSyntheticClient.js
│   │   └── server.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   ├── scripts/
│   │   ├── env.validation.js
│   │   ├── migrate.dev.sh
│   │   └── migrate.prod.sh
│   ├── Dockerfile
│   └── package.json
├── web/
│   ├── pages/
│   │   ├── index.tsx
│   │   ├── dashboard.tsx
│   │   ├── billing.tsx
│   │   ├── _app.tsx
│   │   └── api/
│   │       └── status.ts
│   ├── components/
│   │   ├── AvatarGrid.tsx
│   │   ├── VoicePanel.tsx
│   │   └── BillingPanel.tsx
│   ├── hooks/
│   │   └── useApi.ts
│   ├── styles/
│   │   └── global.css
│   ├── Dockerfile
│   ├── next.config.mjs
│   └── package.json
├── nginx/
│   └── nginx.conf
├── deploy/
│   ├── vercel-env.md
│   ├── fly-env.md
│   └── render-env.md
├── .github/
│   └── workflows/
│       ├── docker-build.yml
│       ├── fly-deploy.yml
│       └── vercel-deploy.yml
├── docker-compose.yml
├── docker-compose.prod.yml
├── docker-compose.override.yml
├── vercel.json
├── fly.toml
├── render.yaml
└── README.md
```

## Environment Variables

See `.env.example` for all required and optional environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `AI_PROVIDER` - `synthetic` | `openai` | `anthropic`
- `STRIPE_SECRET_KEY` - Stripe API key
- `PAYPAL_CLIENT_ID` - PayPal client ID

Before starting the API locally or in CI, run:

```bash
cd api && npm run validate:env
```

And after deployments (or during integration tests) execute:

```bash
cd api && npm run smoke:health
```

## API Endpoints

### Health
- `GET /api/health` - Service health check

### AI Commands
- `POST /api/ai/command` - Execute AI command
  ```json
  {
    "command": "optimize_route",
    "payload": { "origin": "LA", "destination": "NYC" },
    "meta": {}
  }
  ```

### Voice
- `POST /api/voice/ingest` - Upload audio file
- `POST /api/voice/command` - Text command processing

### Billing
- `POST /api/billing/stripe/session` - Create Stripe checkout
- `POST /api/billing/paypal/order` - Create PayPal order
- `POST /api/billing/paypal/capture` - Capture PayPal payment

## Database Migrations

### Development
```bash
cd api
npm run prisma:generate
npx prisma migrate dev
npx prisma studio  # Open database GUI
```

### Production
```bash
cd api
npm run prisma:generate
npm run prisma:migrate
```

### Seed Database
```bash
node api/prisma/seed.js
```

## Testing

```bash
# Test API health
curl http://localhost/api/health

# Test AI command
curl -X POST http://localhost/api/ai/command \
  -H "Content-Type: application/json" \
  -d '{"command":"test","payload":{}}'
```

## CI/CD

### GitHub Actions Workflows

1. **docker-build.yml** - Build and test Docker images on every push
2. **fly-deploy.yml** - Deploy API to Fly.io on main branch
3. **vercel-deploy.yml** - Deploy Web to Vercel on main branch

### Required Secrets

Add these to your GitHub repository secrets:
- `FLY_API_TOKEN` - Fly.io API token
- `VERCEL_TOKEN` - Vercel deployment token

## Security

- Helmet.js for HTTP headers
- CORS configured
- Rate limiting ready (rate-limiter-flexible)
- JWT authentication
- Environment variable validation
- SQL injection protection via Prisma

## Performance

- Docker multi-stage builds
- Production-optimized Next.js builds
- Nginx reverse proxy with HTTP/1.1 keep-alive
- Database connection pooling via Prisma
- CDN-ready static assets

## Monitoring & Logging

- Morgan HTTP request logging
- Structured error handling
- Health check endpoints
- Database query logging (Prisma)

## License

See LICENSE file.

## Support

For issues and questions:
- GitHub Issues: [your-repo/issues]
- Email: support@infamous.ai

---

**Built with ❤️ for the logistics industry**
