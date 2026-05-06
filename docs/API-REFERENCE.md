<p align="center">
  <a href="https://infamousfreight.com" target="_blank" rel="noopener noreferrer">
    <img src="/docs/screenshots/infamousfreight-header.svg" alt="Infamous Freight" width="100%">
  </a>
</p>

# Infamous Freight — API Reference

_Last updated: April 2026_

This document lists all **implemented** API endpoints in the active Express 4 backend (`apps/api/src/app.ts`).

> For the canonical architecture overview, see [`docs/ARCHITECTURE.md`](ARCHITECTURE.md).

---

## Base URL

| Environment | Base URL |
|---|---|
| Local development | `http://localhost:3000` |
| Docker Compose | `http://localhost:3001` |
| Production | `https://api.infamousfreight.com` |

---

## Authentication Headers

All tenant-scoped endpoints require these headers:

| Header | Required | Description |
|---|---|---|
| `x-tenant-id` | Yes | Carrier / tenant identifier. Request body and query-string tenant values are not accepted for protected routes. |
| `x-user-role` | Yes | One of `owner`, `admin`, or `dispatcher`. Billing actions additionally require `owner` or `admin`. |

---

## Health Checks

All API responses include an `x-request-id` response header. Clients may provide `x-request-id`; otherwise the API generates one.

### `GET /health`

Returns liveness-style API status plus database status for operator convenience. No authentication required. This endpoint keeps HTTP 200 even if the database is degraded so uptime probes can remain lightweight.

**Response**
```json
{
  "status": "ok",
  "timestamp": "2026-04-27T08:00:00.000Z",
  "services": { "api": "running", "database": "connected" }
}
```

### `GET /health/live`

Returns API liveness only. No authentication required.

### `GET /health/ready`

Returns database readiness. No authentication required. HTTP status is `200` when ready and `503` when the database is disconnected.

### `GET /api/health`

Returns readiness status at the `/api` prefix for Netlify proxy checks. HTTP status is `200` when ready and `503` when the database is disconnected.

### `GET /api/health/live`

Returns API liveness at the `/api` prefix.

### `GET /api/health/ready`

Returns database readiness at the `/api` prefix.

---

## Loads

### `GET /api/loads`

List all loads for the authenticated tenant.

**Headers:** `x-tenant-id`, `x-user-role`

**Response**
```json
{ "data": [ /* load objects */ ], "count": 12 }
```

### `POST /api/loads`

Create a new load for the authenticated tenant.

**Headers:** `x-tenant-id`, `x-user-role`

**Body:** Load creation fields (see data store schema).

**Response** `201`
```json
{ "data": { /* created load */ } }
```

---

## Drivers

### `GET /api/drivers`

List all drivers for the authenticated tenant.

**Headers:** `x-tenant-id`, `x-user-role`

**Response**
```json
{ "data": [ /* driver objects */ ], "count": 5 }
```

### `POST /api/drivers`

Create a new driver for the authenticated tenant.

**Headers:** `x-tenant-id`, `x-user-role`

**Body:** Driver creation fields.

**Response** `201`
```json
{ "data": { /* created driver */ } }
```

---

## Shipments

### `GET /api/shipments`

List all shipments for the authenticated tenant.

**Headers:** `x-tenant-id`, `x-user-role`

**Response**
```json
{ "data": [ /* shipment objects */ ], "count": 8 }
```

### `POST /api/shipments`

Create a new shipment for the authenticated tenant.

**Headers:** `x-tenant-id`, `x-user-role`

**Body:** Shipment creation fields.

**Response** `201`
```json
{ "data": { /* created shipment */ } }
```

---

## Freight Operations

These endpoints provide CRUD access to freight operation resources.

**Supported `:resource` values:**

| Resource | Description |
|---|---|
| `quoteRequests` | Shipper quote requests |
| `loadAssignments` | Driver load assignment records |
| `loadDispatches` | Dispatch records |
| `shipmentTracking` | Location and status tracking entries |
| `deliveryConfirmations` | Proof-of-delivery confirmations |
| `carrierPayments` | Carrier payment records |
| `rateAgreements` | Rate agreements between parties |
| `operationalMetrics` | Aggregated operational KPIs |
| `loadBoardPosts` | Public load board postings |

### `GET /api/freight-operations/:resource`

List all records for the given resource for the authenticated tenant.

**Headers:** `x-tenant-id`, `x-user-role`

**Response**
```json
{ "data": [ /* records */ ], "count": 3 }
```

### `POST /api/freight-operations/:resource`

Create a new record for the given resource.

**Headers:** `x-tenant-id`, `x-user-role`

**Body:** Resource-specific creation fields.

**Response** `201`
```json
{ "data": { /* created record */ } }
```

### `PATCH /api/freight-operations/:resource/:id`

Update an existing record for the given resource.

**Headers:** `x-tenant-id`, `x-user-role`

**Body:** Partial update fields.

**Response** `200`
```json
{ "data": { /* updated record */ } }
```

**Error** `404` — `freight_operation_not_found` when the record does not exist for this tenant.

---

## Workflows

These endpoints drive state transitions in multi-step freight workflows.

### `POST /api/workflows/quotes/:id/convert-to-load`

Convert an approved quote request into a load record.

**Headers:** `x-tenant-id`, `x-user-role`

**Body:** Optional conversion fields.

**Response** `201`
```json
{ "data": { /* created load */ } }
```

**Error** `404` — `quote_request_not_found`.

### `POST /api/workflows/load-assignments/:id/:decision`

Accept or reject a load assignment. `:decision` must be `accepted` or `rejected`.

**Headers:** `x-tenant-id`, `x-user-role`

**Body:** Optional decision metadata.

**Response** `200`
```json
{ "data": { /* updated assignment */ } }
```

### `POST /api/workflows/dispatches/:id/confirm`

Confirm a pending dispatch.

**Headers:** `x-tenant-id`, `x-user-role`

**Body:** Optional confirmation fields.

**Response** `200`
```json
{ "data": { /* updated dispatch */ } }
```

### `POST /api/workflows/loads/:loadId/tracking-updates`

Record a new tracking update (location, status) for a load.

**Headers:** `x-tenant-id`, `x-user-role`

**Body:** Tracking update fields (location, status, timestamp, etc.).

**Response** `201`
```json
{ "data": { /* created tracking update */ } }
```

**Error** `404` — `load_not_found_for_tenant`.

### `POST /api/workflows/loads/:loadId/verify-delivery`

Record a delivery confirmation (POD) for a load.

**Headers:** `x-tenant-id`, `x-user-role`

**Body:** Delivery verification fields.

**Response** `201`
```json
{ "data": { /* created delivery verification */ } }
```

### `POST /api/workflows/carrier-payments/:id/status`

Update the status of a carrier payment record.

**Headers:** `x-tenant-id`, `x-user-role`

**Body:** `{ "status": "..." }` and optional metadata.

**Response** `200`
```json
{ "data": { /* updated payment */ } }
```

### `POST /api/workflows/operational-metrics/rollup`

Create a rolled-up operational metrics snapshot for the tenant.

**Headers:** `x-tenant-id`, `x-user-role`

**Body:** Metrics rollup fields.

**Response** `201`
```json
{ "data": { /* created metrics record */ } }
```

### `POST /api/workflows/load-board-posts/:id/status`

Update the status (e.g. active, filled, expired) of a load board post.

**Headers:** `x-tenant-id`, `x-user-role`

**Body:** `{ "status": "..." }` and optional metadata.

**Response** `200`
```json
{ "data": { /* updated post */ } }
```

---

## Billing

Billing actions require `x-user-role` of `owner` or `admin`.

### `GET /api/billing/status`

Return Stripe customer status for the authenticated tenant.

**Headers:** `x-tenant-id`, `x-user-role` (`owner` or `admin`)

**Response** `200`
```json
{
  "data": {
    "stripeCustomerId": "cus_...",
    "hasStripeCustomer": true
  }
}
```

### `POST /api/billing/checkout-session`

Create a Stripe Checkout Session to set up a new subscription.

**Headers:** `x-tenant-id`, `x-user-role` (`owner` or `admin`)

**Body**
```json
{
  "plan": "starter | professional | enterprise",
  "billingInterval": "month | year"
}
```

**Response** `200`
```json
{ "data": { "url": "https://checkout.stripe.com/..." } }
```

**Error** `409` — `stripe_customer_already_linked` when the tenant already has a Stripe customer (use Customer Portal instead).

### `POST /api/billing/customer-portal`

Create a Stripe Customer Portal session to manage an existing subscription.

**Headers:** `x-tenant-id`, `x-user-role` (`owner` or `admin`)

**Response** `200`
```json
{ "data": { "url": "https://billing.stripe.com/..." } }
```

**Error** `404` — `stripe_customer_not_found`.

### `POST /api/billing/webhook`

Stripe webhook receiver. **Do not call this manually.**

- Requires a valid `stripe-signature` header matching `STRIPE_WEBHOOK_SECRET`.
- Raw body is required (not JSON-parsed).
- Records and processes `checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, and related events.

**Response** `200`
```json
{ "received": true }
```

---

## AI Usage

### `POST /api/ai-usage/events`

Record an AI feature usage event for the authenticated tenant.

**Headers:** `x-tenant-id`, `x-user-role`

**Body**
```json
{
  "feature": "auto-dispatch",
  "model": "gpt-4o",
  "promptTokens": 512,
  "completionTokens": 128
}
```

`feature` (string) is required. All other fields are optional metadata.

**Response** `201`
```json
{ "data": { /* recorded event */ } }
```

### `GET /api/ai-usage/summary`

Return an AI usage summary for the authenticated tenant.

**Headers:** `x-tenant-id`, `x-user-role`

**Response** `200`
```json
{ "data": { /* usage summary */ } }
```

---

## Error Responses

All error responses follow this shape:

```json
{
  "error": "error_code",
  "message": "Human-readable description."
}
```

Common error codes:

| Code | HTTP Status | Description |
|---|---|---|
| `tenant_id_required` | `400` | `x-tenant-id` header (or body/query `tenantId`) is missing |
| `forbidden` | `403` | `x-user-role` header is missing or not an allowed role |
| `billing_forbidden` | `403` | Billing action attempted by a non-owner/admin role |
| `invalid_billing_plan` | `400` | `plan` must be `starter`, `professional`, or `enterprise` |
| `invalid_billing_interval` | `400` | `billingInterval` must be `month` or `year` |
| `stripe_customer_already_linked` | `409` | Tenant already has a Stripe customer |
| `stripe_customer_not_found` | `404` | No Stripe customer linked to this tenant |
| `freight_operation_resource_not_found` | `404` | Unsupported `:resource` value |
| `freight_operation_not_found` | `404` | Record not found for this tenant |
| `load_not_found_for_tenant` | `404` | Referenced load not found for this tenant |
| `quote_request_not_found` | `404` | Quote request not found for this tenant |
| `invalid_load_assignment_decision` | `400` | `:decision` must be `accepted` or `rejected` |
| `ai_usage_feature_required` | `400` | `feature` field missing from AI usage event body |
| `invalid_stripe_signature` | `400` | Stripe webhook signature verification failed |
| `stripe_secret_key_required` | `500` | `STRIPE_SECRET_KEY` environment variable not set |
| `internal_server_error` | `500` | Unexpected server error |

---

## Planned / Not-Yet-Implemented Routes

The following route patterns are described in planning documents but are **not currently implemented** in the Express layer. They will be added as feature modules are migrated from the NestJS planning files into the active Express server.

| Route pattern | Planned feature |
|---|---|
| `GET /api/dispatch/auto` | Auto-dispatch AI |
| `GET /api/dispatch/backhauls/:driverId` | Backhaul finder |
| `GET /api/invoices` | Invoice list |
| `POST /api/invoices` | Create invoice |
| `GET /api/rate-analytics/trend` | Market rate trends |
| `GET /api/factoring/*` | Factoring integrations |
| `GET /api/broker-credit/*` | Broker credit scoring |
| `GET /api/eld/*` | ELD provider sync |
| `GET /api/chat/*` | Real-time messaging |
| `GET /api/payroll/*` | Driver payroll |
| `GET /api/compliance-csa/*` | CSA monitoring |
| `GET /api/compliance-expiry/*` | Document expiry tracking |
| `GET /api/accounting/*` | QuickBooks / Xero sync |
| `GET /api/geofencing/*` | Geofence alerts and ETA |
| `GET /api/ifta/*` | IFTA fuel tax reporting |
| `GET /api/rbac/*` | Role and permission management |
| `GET /api/ratecon/*` | Rate confirmation generation |

See [`docs/ARCHITECTURE.md`](ARCHITECTURE.md#planned--in-development-features) for migration status.
