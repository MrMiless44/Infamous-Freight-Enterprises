# API Route Map

Status: Current implemented API surface for the Express API.

This document lists the routes implemented in `apps/api/src/app.ts`. Do not use older PDF-generated route maps as production truth unless the corresponding routes exist in code.

## Health

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | No | Runtime health check |
| GET | `/api/health` | No | API-prefixed runtime health check |

## Billing

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/billing/status` | `x-tenant-id` + role header currently | Carrier Stripe link status |
| POST | `/api/billing/checkout-session` | `x-tenant-id` + owner/admin role currently | Create checkout session |
| POST | `/api/billing/customer-portal` | `x-tenant-id` + owner/admin role currently | Create customer portal session |
| POST | `/api/billing/webhook` | Stripe signature | Stripe webhook receiver |

## AI Usage

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/ai-usage/events` | `x-tenant-id`, role, stored active/trial billing status | Record AI usage event |
| GET | `/api/ai-usage/summary` | `x-tenant-id`, role, stored active/trial billing status | Summarize AI usage |

## Core Operations

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/loads` | `x-tenant-id`, role, stored active/trial billing status | List tenant loads |
| POST | `/api/loads` | `x-tenant-id`, role, stored active/trial billing status | Create tenant load |
| GET | `/api/drivers` | `x-tenant-id`, role, stored active/trial billing status | List tenant drivers |
| POST | `/api/drivers` | `x-tenant-id`, role, stored active/trial billing status | Create tenant driver |
| GET | `/api/shipments` | `x-tenant-id`, role, stored active/trial billing status | List tenant shipments |
| POST | `/api/shipments` | `x-tenant-id`, role, stored active/trial billing status | Create tenant shipment |

## Freight Operation Resources

Supported resources:

- `quoteRequests`
- `loadAssignments`
- `loadDispatches`
- `shipmentTracking`
- `deliveryConfirmations`
- `carrierPayments`
- `rateAgreements`
- `operationalMetrics`
- `loadBoardPosts`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/freight-operations/:resource` | `x-tenant-id`, role, stored active/trial billing status | List records for a supported resource |
| POST | `/api/freight-operations/:resource` | `x-tenant-id`, role, stored active/trial billing status | Create record for a supported resource |
| PATCH | `/api/freight-operations/:resource/:id` | `x-tenant-id`, role, stored active/trial billing status | Update record for a supported resource |

## Workflow Routes

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/workflows/quotes/:id/convert-to-load` | `x-tenant-id`, role, stored active/trial billing status | Convert quote request to load |
| POST | `/api/workflows/load-assignments/:id/:decision` | `x-tenant-id`, role, stored active/trial billing status | Accept or reject load assignment |
| POST | `/api/workflows/dispatches/:id/confirm` | `x-tenant-id`, role, stored active/trial billing status | Confirm dispatch |
| POST | `/api/workflows/loads/:loadId/tracking-updates` | `x-tenant-id`, role, stored active/trial billing status | Record tracking update |
| POST | `/api/workflows/loads/:loadId/verify-delivery` | `x-tenant-id`, role, stored active/trial billing status | Verify delivery |
| POST | `/api/workflows/carrier-payments/:id/status` | `x-tenant-id`, role, stored active/trial billing status | Update carrier payment status |
| POST | `/api/workflows/operational-metrics/rollup` | `x-tenant-id`, role, stored active/trial billing status | Roll up operational metrics |
| POST | `/api/workflows/load-board-posts/:id/status` | `x-tenant-id`, role, stored active/trial billing status | Update load-board post status |

## Rate Limiting

All `/api/*` routes are protected by the API rate limiter unless disabled with `RATE_LIMIT_ENABLED=false`.

Environment variables:

| Variable | Default | Purpose |
|---|---:|---|
| `RATE_LIMIT_ENABLED` | enabled unless set to `false` | Enables/disables rate limiting |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Window size in milliseconds |
| `RATE_LIMIT_MAX_REQUESTS` | `120` | Max requests per key/window |

Exceeded requests return:

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Try again after the retry window."
}
```

The response also includes a `Retry-After` header.

## Production Auth Warning

Tenant identity is accepted only from the `x-tenant-id` header; body and query string tenant fallbacks are intentionally rejected. Role is still transitional and header-based. Protected subscription checks prefer the carrier billing status stored by Stripe webhook sync; client billing status headers are only accepted in tests or when `ALLOW_CLIENT_SUBSCRIPTION_STATUS_HEADER=true` is set for a transitional environment. Complete the server-side auth-token migration before paid beta or public launch.
