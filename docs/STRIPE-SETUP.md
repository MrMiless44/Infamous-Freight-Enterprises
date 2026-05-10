# Infamous Freight — Stripe Products Setup

This guide configures your Stripe products and prices for the Infamous Freight platform.

---

## Legal Business Profile

Before accepting production payments, confirm the Stripe account legal and tax profile uses the official legal business name `INFAMOUS FREIGHT`. Enter the full EIN only in Stripe Dashboard and deployment systems that require it; do not add it to source code, documentation, logs, screenshots, or issue comments.

Use [`production-operations/LEGAL_BUSINESS_RECORD_UPDATE.md`](./production-operations/LEGAL_BUSINESS_RECORD_UPDATE.md) for the full external-account update checklist.

---

## Credential Policy

Store Stripe credentials only in the appropriate deployment environment. Do not paste live keys into documentation, source files, issue comments, screenshots, or local command output.

Set `STRIPE_ACCOUNT_ID` to the Stripe account identifier for the account that owns these products and prices. This value is not a secret, but it should still be treated as deployment configuration rather than hardcoded application logic. Configure it anywhere Stripe provisioning or billing deployment secrets are managed, including production environment variables and GitHub Actions secrets. The product setup script checks it against the account returned by `STRIPE_SECRET_KEY` before creating Stripe objects.

---

## Step 1: Create Products

In your Stripe Dashboard, create these products:

### Product 1: Starter Plan
```
Name: Infamous Freight — Starter
Description: Perfect for owner-operators and small fleets
```

**Monthly Price:**
```
Price: $49.00 / month
Billing: Recurring
Trial period: 14 days
```

**Annual Price:**
```
Price: $470.40 / year (20% off = $39.20/month equivalent)
Billing: Recurring
Trial period: 14 days
```

### Product 2: Professional Plan (Most Popular)
```
Name: Infamous Freight — Professional
Description: For growing fleets with dispatch teams
```

**Monthly Price:**
```
Price: $99.00 / month
Billing: Recurring
Trial period: 14 days
```

**Annual Price:**
```
Price: $950.40 / year (20% off = $79.20/month equivalent)
Billing: Recurring
Trial period: 14 days
```

### Product 3: Enterprise
```
Name: Infamous Freight — Enterprise
Description: For large fleets with custom needs
```

This is a **contact sales** tier — no fixed price. Set as:
```
Price: Custom (don't create a fixed price)
```

### Product 4: Pay Per Load
```
Name: Infamous Freight — Pay Per Load
Description: Flexibility for occasional haulers
```

**Price:**
```
Price: $2.99 / load
Billing: One-time (metered usage)
```

---

## Step 2: Create the Founding 50 Coupon

Create a limited coupon for your first 50 customers:

```
Coupon Code: FOUNDING50
Type: Percentage off
Amount: 40% off
Duration: Forever (locks in price)
Redemption limit: 50 redemptions
```

This gives early customers:
- Starter: $29.40/mo forever (vs $49)
- Professional: $59.40/mo forever (vs $99)

---

## Step 3: Webhook Endpoint

In Stripe Dashboard → Developers → Webhooks:

1. Click **Add endpoint**
2. Endpoint URL: `https://api.infamousfreight.com/api/billing/webhook`
3. Select these events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

4. Copy the **Signing secret** — this is your `STRIPE_WEBHOOK_SECRET`

---

## Step 4: Customer Portal Settings

In Stripe Dashboard → Settings → Customer Portal:

Enable:
- [x] Allow customers to update payment methods
- [x] Allow customers to update subscriptions
- [x] Allow customers to cancel subscriptions
- [x] Show billing history

Cancel behavior: **Allow cancel + offer retention** (show offer before canceling)

---

## Step 5: Test the Flow

### Test Card Numbers (Stripe Test Mode)

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0000 0000 0341` | Requires 3D Secure |

Use any future expiry date and any 3-digit CVC.

### Test the Checkout

```bash
curl -X POST https://api.infamousfreight.com/api/billing/checkout-session \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: carrier_test" \
  -H "x-user-role: owner" \
  -d '{
    "plan": "starter",
    "billingInterval": "month"
  }'
```

---

## Price IDs Reference

The API accepts only these plan identifiers from the client:

```text
starter
professional
enterprise
```

Subscription Price IDs are mapped server-side in `apps/api/src/billing.ts`. Do not accept raw Price IDs from browser input.

One-time add-on Price IDs can be overridden by environment variables when catalog migrations are needed:

```env
STRIPE_PRICE_ONE_TIME=price_xxx
STRIPE_PRICE_AI_ADDON_PACK=price_xxx
STRIPE_PRICE_AI_ACTION_PACK_2000=price_xxx
STRIPE_PRICE_AI_ACTION_PACK_10000=price_xxx
STRIPE_PRICE_AI_ACTION_PACK_50000=price_xxx
STRIPE_PRICE_DOCUMENT_AI_PACK_500=price_xxx
STRIPE_PRICE_VOICE_AI_MINUTES_1000=price_xxx
```

### Web environment
```
VITE_API_URL=/api
```

---

## Revenue Projections

| Plan | Monthly Price | Annual Price | Target Customers |
|------|-------------|-------------|-----------------|
| Starter | $49/mo | $470/yr | 200 |
| Professional | $99/mo | $950/yr | 100 |
| Enterprise | Custom | Custom | 20 |
| Pay Per Load | $2.99/load | — | 500+ |

**Projected MRR at 100 customers:** ~$7,500/month
**Projected ARR at 500 customers:** ~$450,000/year

---

## Quick Checklist

- [ ] Products created in Stripe Dashboard
- [ ] Monthly + annual prices set for each plan
- [ ] Founding 50 coupon created (40% off, 50 redemptions)
- [ ] Webhook endpoint configured (`/api/billing/webhook`)
- [ ] Customer portal enabled
- [ ] Subscription Price IDs verified server-side and one-time add-on overrides configured if needed
- [ ] `STRIPE_ACCOUNT_ID` matches the Stripe account used by `STRIPE_SECRET_KEY`
- [ ] Test checkout flow works
- [ ] Production environment variables set
