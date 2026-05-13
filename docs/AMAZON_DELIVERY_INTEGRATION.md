# Amazon Delivery Integration

Infamous Freight can support Amazon delivery workflows by treating Amazon logistics as one possible fulfillment path inside the existing freight operations flow. The integration should stay server-side, use environment variables for credentials, and only call Amazon APIs after the seller or shipper has approved the required access.

## Scope

The practical scope is order orchestration, not a blanket replacement for local carriers. Eligible orders can be routed to Amazon Multi-Channel Fulfillment when inventory and service rules match. Other freight can remain on the existing carrier, dispatch, and final-mile workflows.

## API Areas

- Amazon Selling Partner API Fulfillment Outbound for Multi-Channel Fulfillment order creation, cancellation, previews, and tracking.
- Amazon Selling Partner API FBA Inventory for fulfillment-center inventory visibility where approved.
- Amazon Shipping API v2 for rate, shipment, label, and tracking workflows where the account has access.
- Amazon Notifications, EventBridge, or SNS for shipment and fulfillment status updates.

## Recommended Flow

1. Store Amazon connection status and account metadata in the platform database. Do not store tokens in client code.
2. Sync inventory availability from Amazon into the internal operations view on a scheduled or on-demand basis.
3. Add routing rules to decide whether an order should use Amazon fulfillment, Amazon Shipping, or local carrier dispatch.
4. Create fulfillment or shipping requests from a Netlify Function after validating the order, address, package, and service level.
5. Save Amazon reference IDs, carrier service, label metadata, tracking number, and fulfillment status against the shipment record.
6. Receive delivery events through a secure webhook endpoint and update the load timeline for dispatchers, customers, and mobile users.

## Required Configuration

Use environment variables for Amazon SP-API client credentials, refresh tokens, role ARN, marketplace IDs, region, notification secrets, and webhook verification values. Never expose those values through Vite client variables.

## Implementation Notes

The first production step should be a server-side connection and routing layer, followed by a dashboard panel that shows whether Amazon delivery is available for an order. Label printing and tracking should be added after the fulfillment request and event update paths are proven in a sandbox or limited pilot.

## Implemented Server-Side Foundation

The active Express API now includes protected Amazon delivery orchestration endpoints under `/api/amazon-delivery/*`.
These endpoints record connection metadata, inventory snapshots, routing previews, planned fulfillment requests, and
delivery status events without storing Amazon credentials in client code or making live SP-API calls.

- `GET /api/amazon-delivery/status` returns the tenant's connection summary, inventory count, and open fulfillment count.
- `PUT /api/amazon-delivery/connection` records account label, seller/account metadata, marketplace, region, enabled flag, and connection status.
- `POST /api/amazon-delivery/inventory` upserts approved inventory availability by seller SKU.
- `POST /api/amazon-delivery/routing-preview` evaluates whether an order should be reviewed for Amazon MCF, Amazon Shipping, local carrier dispatch, or manual review.
- `POST /api/amazon-delivery/fulfillment-requests` records the selected route, order reference, service level, payload summary, and shipment linkage before any live Amazon submission.
- `POST /api/amazon-delivery/webhook` updates fulfillment references, label metadata, tracking numbers, and delivery status events for an existing order reference.

The route remains behind the same protected API middleware as other operating workflows. Production SP-API credentials,
refresh tokens, role ARNs, marketplace IDs, webhook secrets, and notification verification values must remain environment
variables and should be added only when the Amazon sandbox or pilot account is ready.
