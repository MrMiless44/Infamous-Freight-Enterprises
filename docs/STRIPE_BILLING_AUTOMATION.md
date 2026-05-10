# Stripe Billing Automation

Date: May 5, 2026
Status: Checkout, webhook sync, customer portal, webhook logging, duplicate checkout guard, Checkout Session return IDs, webhook replay protection, mapped one-time add-on checkout, and AI usage ledger foundation added

## Purpose

This runbook documents Stripe billing automation for Infamous Freight after catalog cleanup.

The implementation adds:

- Backend-created Stripe Checkout Sessions
- Server-side Stripe Price ID selection for subscriptions
- Server-side Stripe Price ID selection for one-time AI add-ons
- Public Stripe Payment Links surfaced on the pricing page
- Stripe webhook verification
- Stripe webhook replay protection with a 5-minute signature timestamp tolerance
- Stripe webhook event logging
- Subscription/customer sync to `Carrier`
- One-time payment records in `StripeOneTimePayment`
- Duplicate subscription checkout protection
- Checkout Session ID return in success redirects
- Owner/admin customer portal endpoint
- AI usage ledger API and database table
- Billing UI in Settings
- Billing and usage tests

## API endpoints

### Stripe webhook

```http
POST /api/billing/webhook
```

This endpoint expects Stripe's raw request body and validates the `stripe-signature` header with `STRIPE_WEBHOOK_SECRET`.

Important implementation details:

- `/api/billing/webhook` is registered before `express.json()` so the raw request body remains available for signature verification.
- Webhook signatures are rejected when the timestamp is more than 5 minutes outside the server clock to reduce replay risk.
- The endpoint should be used as the source of truth for fulfillment and billing sync. Do not mark billing state from the success page alone.
- Subscription Checkout Sessions update carrier billing state.
- One-time Checkout Sessions are recorded idempotently in `StripeOneTimePayment`.

Verified events are logged to `StripeWebhookEvent` with status:

```text
received
processed
failed
ignored
```

### Subscription Checkout Session

```http
POST /api/billing/checkout-session
```

Required headers:

```text
x-tenant-id: <carrier id>
x-user-role: owner | admin
```

Request:

```json
{
  "plan": "professional",
  "billingInterval": "month"
}
```

Supported plans:

```text
starter
professional
enterprise
```

Supported billing intervals:

```text
month
year
```

The frontend sends only `plan` and `billingInterval`; the API maps those values to trusted server-side Stripe Price IDs. Do not accept raw prices or Price IDs from browser input.

If a carrier already has a linked Stripe customer, subscription checkout creation returns a conflict. Use the Customer Portal for billing changes after first checkout.

### One-time add-on Checkout Session

```http
POST /api/billing/one-time-checkout-session
```

Required headers:

```text
x-tenant-id: <carrier id>
x-user-role: owner | admin
```

Request:

```json
{
  "purchaseType": "ai_action_pack_10000"
}
```

Supported purchase types:

```text
ai_addon_pack
ai_action_pack_2000
ai_action_pack_10000
ai_action_pack_50000
document_ai_pack_500
voice_ai_minutes_1000
```

Price mapping:

| purchaseType | Stripe Price ID | Product |
|---|---|---|
| `ai_addon_pack` | `price_1TQeyLKCNuZqDozY0tb8Mwt8` | Legacy alias for AI Action Pack 2,000 |
| `ai_action_pack_2000` | `price_1TQeyLKCNuZqDozY0tb8Mwt8` | AI Action Pack 2,000 |
| `ai_action_pack_10000` | `price_1TQf0BKCNuZqDozYU5RBJVKo` | AI Action Pack 10,000 |
| `ai_action_pack_50000` | `price_1TQf0TKCNuZqDozY3dghvydQ` | AI Action Pack 50,000 |
| `document_ai_pack_500` | `price_1TQf0zKCNuZqDozYJSTRv4iY` | Document AI Pack 500 |
| `voice_ai_minutes_1000` | `price_1TQf1IKCNuZqDozYebKKmHpu` | Voice AI Minutes 1,000 |

This endpoint creates a Stripe Checkout Session in `payment` mode using the trusted server-side Price ID mapped from `purchaseType`. Environment variables can override those Price IDs per purchase type for future catalog migrations.

A linked Stripe customer is required before one-time add-ons can be purchased. This keeps add-on purchases tied to an existing carrier billing account.

### Customer portal

```http
POST /api/billing/customer-portal
```

Required headers:

```text
x-tenant-id: <carrier id>
x-user-role: owner | admin
```

Response:

```json
{
  "data": {
    "url": "https://billing.stripe.com/..."
  }
}
```

### Billing status

```http
GET /api/billing/status
```

Returns whether the carrier has a linked Stripe customer.

### AI usage event

```http
POST /api/ai-usage/events
```

Required headers:

```text
x-tenant-id: <carrier id>
x-user-role: owner | admin | dispatcher
```

Request:

```json
{
  "feature": "dispatch-assistant",
  "actionCount": 1,
  "documentScans": 0,
  "voiceMinutes": 0,
  "inputTokens": 100,
  "outputTokens": 40,
  "estimatedCost": 0.25,
  "idempotencyKey": "unique-event-id"
}
```

### AI usage summary

```http
GET /api/ai-usage/summary
```

Returns aggregate usage totals for the current carrier.

## Required environment variables

API:

```env
STRIPE_SECRET_KEY=replace-with-stripe-secret-key
STRIPE_WEBHOOK_SECRET=replace-with-stripe-webhook-signing-secret
STRIPE_PORTAL_RETURN_URL=https://www.infamousfreight.com/settings
STRIPE_CHECKOUT_SUCCESS_URL=https://www.infamousfreight.com/settings?checkout=success&session_id={CHECKOUT_SESSION_ID}
STRIPE_CHECKOUT_CANCEL_URL=https://www.infamousfreight.com/settings?checkout=canceled
```

Optional one-time add-on Price ID overrides:

```env
STRIPE_PRICE_ONE_TIME=price_1TQeyLKCNuZqDozY0tb8Mwt8
STRIPE_PRICE_AI_ADDON_PACK=price_1TQeyLKCNuZqDozY0tb8Mwt8
STRIPE_PRICE_AI_ACTION_PACK_2000=price_1TQeyLKCNuZqDozY0tb8Mwt8
STRIPE_PRICE_AI_ACTION_PACK_10000=price_1TQf0BKCNuZqDozYU5RBJVKo
STRIPE_PRICE_AI_ACTION_PACK_50000=price_1TQf0TKCNuZqDozY3dghvydQ
STRIPE_PRICE_DOCUMENT_AI_PACK_500=price_1TQf0zKCNuZqDozYJSTRv4iY
STRIPE_PRICE_VOICE_AI_MINUTES_1000=price_1TQf1IKCNuZqDozYebKKmHpu
```

Optional fallback:

```env
WEB_APP_URL=https://www.infamousfreight.com
```

If `STRIPE_CHECKOUT_SUCCESS_URL` does not include `session_id`, the API automatically appends `session_id={CHECKOUT_SESSION_ID}` before creating the Stripe Checkout Session.

Web:

```env
VITE_API_URL=/api
```

## Required Stripe webhook events

Configure a live webhook endpoint in Stripe Dashboard:

```text
https://<api-domain>/api/billing/webhook
```

Subscribe to:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
```

## Billing sync behavior

The webhook syncs these `Carrier` fields:

```text
stripeCustomerId
subscriptionTier
status
```

Supported subscription tiers:

```text
starter
professional
enterprise
```

Supported billing statuses:

```text
active
trial
past_due
canceled
unpaid
incomplete
inactive
```

## One-time payment records

`StripeOneTimePayment` stores one-time Checkout fulfillment records.

Track:

```text
eventId
carrierId
stripeCustomerId
stripeCheckoutSessionId
stripePaymentIntentId
amountTotal
currency
status
purchaseType
priceId
createdAt
updatedAt
```

`stripeCheckoutSessionId` is unique, so repeated webhook deliveries update the same payment record instead of duplicating fulfillment.

## Webhook event logs

`StripeWebhookEvent` is used for operational debugging.

Track:

```text
eventId
eventType
carrierId
status
errorMessage
receivedAt
processedAt
```

Use this table when Stripe shows an event was delivered but the app billing state did not change.

## Checkout metadata

Backend-created subscription Checkout Sessions include metadata:

```ts
metadata: {
  carrierId,
  plan,
  billingInterval,
}
```

One-time add-on Checkout Sessions include metadata:

```ts
metadata: {
  carrierId,
  purchaseType,
  priceId,
  mode: 'payment',
}
```

Subscription metadata also receives the same values so future subscription events can preserve plan mapping.

Checkout Sessions also set:

```ts
client_reference_id: carrierId
```

Use `metadata.carrierId` and `client_reference_id` to connect Stripe activity back to the internal carrier/order context.

## Public pricing page catalog

The public pricing page reads public Stripe Payment Links from:

```text
apps/web/src/lib/stripeCatalog.ts
```

Keep this file synchronized with Stripe whenever public prices or hosted Payment Links change. Do not put secret keys in this file.

## Customer portal setup

In Stripe Dashboard:

```text
Settings → Billing → Customer portal
```

Configure:

- Allowed subscription changes
- Payment method updates
- Invoice history
- Cancellation behavior
- Return URL

## AI usage ledger

The `AiUsageEvent` table is a ledger, not a metered billing implementation. Use it to build confidence in usage tracking before enabling Stripe metered billing.

Recommended launch limits:

```text
Starter: 500 AI actions / month
Professional: 5,000 AI actions / month
Enterprise: 25,000 AI actions / month
```

Keep AI add-ons as one-time packs until the ledger has proven accuracy in production.

## Launch validation

After deployment:

1. Add API env vars.
2. Run the Prisma migration for `StripeOneTimePayment`.
3. Configure Stripe live webhook endpoint.
4. Trigger a test event from Stripe Dashboard.
5. Confirm `/api/billing/webhook` returns `200`.
6. Start subscription checkout from Settings → Billing & Plans using an internal carrier.
7. Complete subscription checkout.
8. Confirm the success redirect includes `session_id`.
9. Confirm the carrier row has:
   - `stripeCustomerId`
   - correct `subscriptionTier`
   - correct `status`
10. Start one-time add-on checkout for each supported purchase type from the same internal carrier.
11. Complete one-time checkout.
12. Confirm `StripeOneTimePayment` has a record for the Checkout Session.
13. Confirm `StripeWebhookEvent` logged both webhooks as `processed`.
14. Open customer portal from Settings as owner/admin.
15. Record one AI usage event and confirm it appears in Settings → Billing & Plans.

## Notes

This foundation intentionally avoids Stripe metered billing until the backend has reliable AI usage tracking. Continue using one-time AI add-on packs for launch.
