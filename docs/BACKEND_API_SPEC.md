# Infamous Freight API Spec

Base URL:

```text
http://localhost:4000/api
```

Auth header for protected routes:

```text
Authorization: Bearer <token>
```

## Auth

### POST `/auth/login`

```json
{
  "email": "admin@infamousfreight.com",
  "password": "Password123!"
}
```

Response:

```json
{
  "token": "jwt",
  "user": { "id": "...", "role": "ADMIN" }
}
```

### GET `/auth/me`

Returns current user.

---

## Shipments

### GET `/shipments`

Query parameters:

```text
status=IN_TRANSIT
q=Chicago
```

Role behavior:

- Admin/Dispatcher: all shipments
- Customer: shipments for their company
- Carrier: shipments assigned to their carrier company
- Driver: shipments assigned to them

### POST `/shipments`

Admin/Dispatcher only.

```json
{
  "customerId": "company_id",
  "carrierId": "carrier_company_id",
  "driverId": "driver_user_id",
  "originAddress": "100 Harbor Way",
  "originCity": "Los Angeles",
  "originState": "CA",
  "destinationAddress": "700 Industrial Ave",
  "destinationCity": "Chicago",
  "destinationState": "IL",
  "equipmentType": "DRY_VAN",
  "weightLbs": 42500,
  "miles": 2015,
  "rateCents": 485000,
  "costCents": 392000
}
```

### POST `/shipments/:id/status`

```json
{
  "status": "PICKED_UP",
  "note": "Loaded and rolling",
  "city": "Los Angeles",
  "state": "CA"
}
```

This creates a timeline event and queues notifications.

### GET `/tracking/:trackingToken`

Public tracking endpoint. No login required.

---

## GPS

### POST `/shipments/:id/locations`

```json
{
  "latitude": 35.1983,
  "longitude": -111.6513,
  "heading": 79,
  "speedMph": 63
}
```

### GET `/shipments/:id/locations`

Returns recent location points for route replay and live map view.

---

## Pricing

### POST `/pricing/quote`

```json
{
  "originCity": "Los Angeles",
  "originState": "CA",
  "destinationCity": "Chicago",
  "destinationState": "IL",
  "equipmentType": "DRY_VAN",
  "weightLbs": 42500,
  "miles": 2015,
  "accessorialsCents": 0
}
```

Returns calculated quote with base rate, fuel, accessorials, margin, and final quoted price.

---

## Documents

### POST `/documents/upload-url`

```json
{
  "shipmentId": "shipment_id",
  "type": "POD",
  "fileName": "pod.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 552000
}
```

Returns document metadata and a temporary upload URL.

### PATCH `/documents/:id/complete`

Marks upload complete. If document type is `POD`, shipment status changes to `POD_UPLOADED`.

### GET `/documents/:id/download-url`

Returns a temporary download URL.

---

## Invoices and Payments

### POST `/invoices`

Admin/Dispatcher only.

```json
{
  "shipmentId": "shipment_id",
  "amountCents": 485000,
  "dueAt": "2026-06-10T00:00:00.000Z"
}
```

### POST `/invoices/:id/checkout-session`

Creates a Stripe Checkout session when Stripe credentials are configured. Otherwise returns a mock URL for local testing.

---

## Notifications

### POST `/notifications/device-tokens`

```json
{
  "token": "fcm_device_token",
  "platform": "ios"
}
```

### POST `/notifications/test`

Admin/Dispatcher only.

```json
{
  "userId": "user_id",
  "title": "Delay Risk",
  "body": "Load IF-77291 has a weather delay risk.",
  "phone": "+15555555555"
}
```
