# Paywall

Infamous Freight protects operational app areas behind an active subscription or trial.

## Frontend behavior

Protected app routes render inside `AppLayout`.

The app reads subscription status from Supabase session metadata in this order:

1. `app_metadata.subscription_status`
2. `user_metadata.subscriptionStatus`
3. `user_metadata.subscription_status`
4. `user_metadata.billingStatus`
5. `user_metadata.billing_status`

Allowed statuses:

```text
active
trialing
trial
```

Unpaid users are redirected to:

```text
/billing
```

Billing and upgrade routes remain accessible:

```text
/billing
/pay-per-load
/settings
```

Public routes remain outside the paywall:

```text
/home
/login
/onboarding
/request-quote
/track-shipment
/customer-portal
/carrier-portal
/freight-assistant
```

## API behavior

Protected operational API routes require an active or trial billing status. The API prefers carrier status stored by Stripe webhook sync; client-set subscription headers are only accepted in tests or when `ALLOW_CLIENT_SUBSCRIPTION_STATUS_HEADER=true` is set for a transitional environment.

Transitional headers:

```text
x-subscription-status: active
x-subscription-status: trialing
x-subscription-status: trial
```

Aliases:

```text
x-billing-status
x-carrier-subscription-status
```

Unpaid requests receive:

```http
402 Payment Required
```

Response shape:

```json
{
  "error": "payment_required",
  "message": "An active subscription or trial is required to access this resource.",
  "billingUrl": "/billing",
  "subscriptionStatus": "none"
}
```

## Routes intentionally not blocked

These stay open so users can sign in, start checkout, fix billing, or submit public leads:

```text
GET /health
GET /api/health
POST /api/leads/quote
POST /api/leads/demo
POST /api/leads/discount
GET /api/billing/status
POST /api/billing/checkout-session
POST /api/billing/customer-portal
POST /api/billing/webhook
```

## Production hardening needed

The remaining header-based tenant and role gate is transitional. For stronger enforcement, validate Supabase JWTs server-side, derive tenant and role from trusted claims or database membership, and stop accepting caller-controlled role headers for sensitive operations.
