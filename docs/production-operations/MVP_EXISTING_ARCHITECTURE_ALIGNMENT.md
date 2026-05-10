# MVP Existing Architecture Alignment

This document maps the GitHub-native MVP build plan to the current repository architecture so implementation does not duplicate existing modules or conflict with the Prisma schema.

## Existing Backend Foundation

The current API is an Express service backed by Prisma. The MVP should extend the active Express routes, framework-free domain helpers, and Prisma schema instead of creating parallel backend systems.

## Existing Prisma Models That Support the MVP

The current schema already includes:

- `Carrier`
- `Driver`
- `Load`
- `Invoice`
- `Document`
- `QuoteRequest`
- `LoadAssignment`
- `LoadDispatch`
- `ShipmentTracking`
- `DeliveryConfirmation`
- `CarrierPayment`
- `OperationalMetric`
- `AuditLog`

## Implementation Direction

### Quote Request to Load Conversion

Use the existing `QuoteRequest` model and add service/controller behavior for:

- Creating quote requests
- Reviewing quote requests
- Updating quote status
- Converting approved quote requests into `Load` records

Do not create a second quote model.

### Carrier Approval and Load Assignment

Use the existing `Carrier`, `Document`, and `LoadAssignment` models.

Required rule:

- A carrier must be approved before assignment.
- Required documents must be present and valid before approval.

If additional carrier approval fields are needed, extend the existing `Carrier` model rather than creating a separate carrier profile model.

### Dispatch Board and Shipment Tracking

Use the existing `Load`, `LoadDispatch`, and `ShipmentTracking` models.

Required behavior:

- Dispatch status updates must update the load and dispatch record.
- Tracking updates must attach to the load.
- Customer-visible tracking must filter out internal notes, rates, margins, and private carrier data.

### POD Upload and Invoice Generation

Use the existing `DeliveryConfirmation`, `Document`, and `Invoice` models.

Required rules:

- A load cannot close without POD evidence.
- An invoice cannot be sent unless POD evidence exists.
- Gross margin must be calculated from shipper amount and carrier pay.

### Role-Based Access

Use the existing `RBACModule` and `TeamMember` role fields as the starting point.

Required external user restrictions:

- Shippers cannot see internal notes, carrier private data, or margins.
- Carriers cannot see other carriers or shipper financial data.
- Drivers cannot see customer billing details.

## Existing Controller Consideration

The current `LoadsController` is focused on load-board search and alerts. MVP operating endpoints should either:

1. Extend `LoadsController` carefully with operational endpoints, or
2. Add a separate controller such as `LoadOperationsController` under the existing `loads` module.

Preferred approach:

- Keep load-board aggregation endpoints separate from internal operational load lifecycle endpoints.

## Recommended Endpoint Grouping

### Quote Operations

- `POST /quote-requests`
- `GET /quote-requests`
- `GET /quote-requests/:id`
- `PATCH /quote-requests/:id`
- `POST /quote-requests/:id/convert-to-load`

### Load Operations

- `GET /loads/operations`
- `GET /loads/operations/:id`
- `POST /loads/operations`
- `POST /loads/operations/:id/assign-carrier`
- `POST /loads/operations/:id/status`
- `POST /loads/operations/:id/close`

### Tracking Operations

- `POST /loads/operations/:id/tracking-updates`
- `GET /loads/operations/:id/tracking-updates`
- `GET /tracking/:trackingNumber`

### Invoice Operations

The current invoice controller already has invoice creation, listing, send, paid, reminder, and PDF routes. Add POD-gating validation before invoice send.

## Required Test Evidence

For each MVP issue, record proof in:

`docs/production-operations/PRODUCTION_READINESS_EVIDENCE.md`

Do not close the launch gate until evidence exists for:

- Quote-to-load conversion
- Carrier approval and assignment
- Dispatch and tracking
- POD upload and invoice generation
- Role boundary testing
- End-to-end MVP workflow

## Rule

Do not duplicate domain models. Extend the current schema and modules unless there is a clear technical reason not to.
