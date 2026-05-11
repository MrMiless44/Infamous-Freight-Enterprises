# Infamous Freight — Custom Domain Setup

This guide walks you through pointing your custom domain to the Infamous Freight platform.

---

## What You Need

- A domain name (e.g., `infamousfreight.com`)
- Access to your domain's DNS settings (GoDaddy, Cloudflare, Namecheap, etc.)

---

## Step 1: DNS Records

Add these DNS records at your domain registrar:

### For the Web App (Netlify)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| ALIAS / ANAME | `@` | `apex-loadbalancer.netlify.com` | Auto |
| A | `@` | `75.2.60.5` | Auto |
| CNAME | `www` | `infamous-freight.netlify.app` | Auto |

> The ALIAS/A records point the apex (`infamousfreight.com`) directly at Netlify. The `www` CNAME is also registered so Netlify can serve the canonical web host. The committed [`netlify.toml`](../netlify.toml) redirects the apex and default Netlify hostname to `https://www.infamousfreight.com`.

### For the API (Fly.io)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | `api` | `infamous-freight-api.fly.dev` | Auto |

This gives you:
- **Web:** `https://www.infamousfreight.com`
- **API:** `https://api.infamousfreight.com`

---

## Step 2: Netlify Custom Domain

1. Go to your Netlify dashboard: `https://app.netlify.com/sites/d03682ba-fcb4-4dc6-984e-f7eae7fff59c/settings/domain`
2. Click **Add custom domain**
3. Enter: `infamousfreight.com`
4. Click **Verify** → **Add domain**
5. Also add `www.infamousfreight.com` so Netlify provisions an SSL certificate for it
6. Netlify will request an SSL certificate automatically (HTTPS)

### Primary Domain

Set `www.infamousfreight.com` as the primary domain so everything funnels to one canonical host:

1. In Netlify domain settings, click **Set as primary** on `www.infamousfreight.com`.
2. Leave `infamousfreight.com` registered as a domain alias. The committed `netlify.toml` already 301s the apex and the default `infamous-freight.netlify.app` URL to the `www` host.
3. If Netlify, registrar forwarding, or another DNS provider injects a reverse `www` to apex redirect, remove that setting before launch. A reverse redirect conflicts with `netlify.toml` and can create a production redirect loop.

---

## Step 3: Fly.io Custom Domain

1. Go to your Fly.io dashboard: `https://fly.io/apps/infamous-freight`
2. Click **Certificates**
3. Click **Add certificate**
4. Enter: `api.infamousfreight.com`
5. Fly.io will verify your DNS CNAME and provision SSL

Or via CLI:
```bash
fly certs create api.infamousfreight.com --app infamous-freight-api
```

---

## Step 4: Update Frontend API URL

Production should prefer the Netlify `/api` proxy so browser traffic validates the same route served by `netlify.toml`. Use the direct API domain only for non-proxied deployments or operational checks.

### `apps/web/.env.production`
```
VITE_API_URL=/api
VITE_SOCKET_URL=
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

### `apps/web/src/api-client/client.ts`
```typescript
const API_BASE = import.meta.env.VITE_API_URL ?? '';
```

---

## Step 5: CORS Configuration

Update your API's CORS settings to accept requests from your custom domain:

### `apps/api/src/app.ts`
```bash
CORS_ORIGINS=https://infamousfreight.com,https://www.infamousfreight.com,http://localhost:5173
```

---

## Step 6: SSL/HTTPS Verification

Test that everything is secure:

```bash
# Test web
curl -sI https://www.infamousfreight.com | head -5

# Confirm apex redirects to the canonical www host
curl -sIL https://infamousfreight.com | grep -i '^location:'

# Test proxied API health
curl -s https://www.infamousfreight.com/api/health

# Optional direct API checks
curl -s https://api.infamousfreight.com/health
```

All should return `200 OK` with valid SSL certificates.

---

## Complete URL Map

| Service | URL |
|---------|-----|
| **Main App** | `https://www.infamousfreight.com` |
| **API** | `https://api.infamousfreight.com` |
| **WebSocket** | `wss://api.infamousfreight.com` |
| **Proxied Health Check** | `https://www.infamousfreight.com/api/health` |
| **Direct Health Check** | `https://api.infamousfreight.com/health` |
| **API Docs** | `https://api.infamousfreight.com/api/docs` |
| **Stripe Webhook** | `https://api.infamousfreight.com/stripe/webhook` |

---

## Cloudflare (Optional but Recommended)

If using Cloudflare as your DNS provider, you get free DDoS protection and caching:

1. Add your domain to Cloudflare
2. Change nameservers at your registrar to Cloudflare's
3. In Cloudflare DNS, add the records from Step 1
4. Set SSL/TLS mode to **Full (strict)**
5. Enable **Always Use HTTPS**
6. Enable **Auto Minify** for JS, CSS, HTML

### Cloudflare Page Rules (Free Performance Boost)

```
Rule 1: www.infamousfreight.com/static/*
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month

Rule 2: www.infamousfreight.com/api/*
  - Cache Level: Bypass
  - Security Level: High
```

---

## Troubleshooting

### "Domain not found"
- DNS propagation takes 5 minutes to 48 hours
- Check: `dig infamousfreight.com +short`

### "SSL certificate error"
- Netlify/Fly.io need time to provision certificates (up to 24 hours)
- Ensure DNS records are correct before requesting certificates

### "CORS error in browser"
- Double-check CORS origin list includes your exact domain
- Include both `www` and non-`www` variants
- Add `http://localhost:5173` for local development

### "API 404 on custom domain"
- Verify Fly.io cert is active: `fly certs show api.infamousfreight.com --app infamous-freight-api`
- Check DNS CNAME resolves: `dig api.infamousfreight.com +short`
