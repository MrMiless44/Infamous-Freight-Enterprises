# Backend Integration Plan for Infamous Freight

## Goal

Connect the red/black cyber command-center UI to real systems for:

```text
Accounts → Shipments → GPS → Pricing → Documents → Invoices → Payments → Notifications
```

## 1. Accounts and Roles

Use JWT login plus role-based access.

Roles:

- `ADMIN`
- `DISPATCHER`
- `CUSTOMER`
- `CARRIER`
- `DRIVER`

Recommended behavior:

- Admin sees everything.
- Dispatcher manages loads, drivers, carriers, documents, billing, and alerts.
- Customer sees only their company shipments, quotes, documents, invoices, and tracking.
- Carrier sees assigned freight and document/payment status.
- Driver sees current load, status buttons, document upload, and messages.

## 2. Shipments

Shipment lifecycle:

```text
QUOTE_PENDING
BOOKED
CARRIER_ASSIGNED
PICKUP_SCHEDULED
PICKED_UP
IN_TRANSIT
DELAYED
OUT_FOR_DELIVERY
DELIVERED
POD_UPLOADED
INVOICED
PAID
```

Every status change creates a `StatusEvent`, which powers the timeline on web and mobile.

## 3. GPS / Tracking

The backend stores driver GPS events.

The front end renders:

- Pickup marker
- Delivery marker
- Latest truck location
- Route line
- Timeline
- ETA

Recommended production behavior:

- Driver app posts GPS during active loads.
- Public tracking shows only safe shipment data.
- Admin dashboard shows full operations data.
- Customer tracking never exposes unnecessary driver personal details.

## 4. Pricing

Starter pricing engine uses:

- Equipment type
- Miles
- Weight
- Fuel percentage
- Accessorials
- Margin percentage

Production pricing should eventually include:

- Lane history
- Carrier cost history
- Market rate feeds
- Fuel index
- Urgency
- Pickup/delivery constraints
- Customer-specific markup

## 5. Documents

Document workflow:

```text
Request upload URL
Upload file to S3
Mark document complete
Attach to shipment
Update status if needed
```

Recommended document types:

- BOL
- POD
- Rate confirmation
- Invoice
- Insurance
- W-9
- Other

## 6. Invoices and Payments

Invoice workflow:

```text
Delivered
POD uploaded
Invoice created
Customer receives payment link
Payment completed
Shipment marked paid
```

This starter creates checkout sessions and handles the `checkout.session.completed` webhook.

## 7. Notifications

Notification channels:

- In-app
- Push notification
- SMS
- Email, to be added

Trigger notifications for:

- Carrier assigned
- Pickup complete
- In transit
- Delay risk
- ETA changed
- Out for delivery
- Delivered
- POD uploaded
- Invoice sent
- Payment received

## 8. Front-End Wiring

Replace static prototype data with API calls.

### Dashboard

```js
const shipments = await api.getShipments({ status: 'IN_TRANSIT' });
const alerts = await api.getNotifications();
```

### Public Tracking

```js
const tracking = await fetch(`${API_URL}/api/tracking/${trackingToken}`).then(r => r.json());
```

### Driver Action Button

```js
await api.updateShipmentStatus(shipmentId, {
  status: 'PICKED_UP',
  city: 'Los Angeles',
  state: 'CA',
  note: 'Loaded and rolling'
});
```

### POD Upload

```js
const { document, upload } = await api.createDocumentUploadUrl({
  shipmentId,
  type: 'POD',
  fileName: file.name,
  mimeType: file.type,
  sizeBytes: file.size
});

await fetch(upload.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
await api.completeDocumentUpload(document.id);
```

## 9. Security Checklist

Before production:

- Use HTTPS only.
- Store secrets outside source code.
- Hash passwords with strong settings.
- Add rate limiting.
- Add audit logs.
- Add data backup policy.
- Restrict document downloads by role.
- Validate webhook signatures.
- Limit public tracking data.
- Add driver consent and location privacy controls.
- Add monitoring and alerting.

## 10. Deployment Order

1. Deploy PostgreSQL.
2. Deploy backend API.
3. Configure auth secrets.
4. Configure S3 bucket.
5. Configure Stripe webhook.
6. Configure Twilio/Firebase.
7. Point website/app to API URL.
8. Run smoke tests.
9. Launch with limited users.
