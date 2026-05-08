# Infamous Freight — Production Build Package for Manus

This package consolidates the complete production-ready build specification for Infamous Freight.

## 1) Master Manus Prompt

```text
Build a production-ready freight operations platform for Infamous Freight.

Business goal:
Centralize freight brokerage operations, reduce manual work, automate communication, and support quoting, dispatch, tracking, documents, and billing in one system.

Core app modules:
1. Public quote request page
2. Customer portal
3. Internal operations dashboard
4. Admin settings panel
5. Billing and payments
6. Document management

Core features:
- Quote request intake
- AI-assisted quote review and drafting
- Shipment booking
- Dispatch/load board
- Shipment status tracking
- Customer management
- Carrier management
- Invoice generation
- Online payment collection
- Document upload and storage
- SMS/email notifications
- Activity logs and audit trail

Third-party integrations to connect:
1. OpenAI API
Use cases:
- AI quote assistance
- Draft customer and carrier messages
- Summarize shipment updates
- Extract structured data from BOL, POD, rate confirmations, invoices, and other freight documents

2. Twilio API
Use cases:
- SMS shipment updates
- Carrier/customer alerts
- Pickup, in-transit, delivered, and exception notifications
- Delivery status callbacks
- Optional email notifications if implemented through Twilio-supported flow or another mail provider abstraction

3. Stripe API
Use cases:
- Online invoice payments
- Payment links
- Payment status synchronization
- Payment history per invoice/customer

Main workflows:
1. A shipper submits a quote request
2. The system stores the request and creates a quote record
3. OpenAI helps classify the shipment and draft a quote response
4. Operations reviews and sends the quote
5. When approved, a load is created and assigned
6. Shipment status updates trigger customer/carrier notifications
7. Documents are uploaded and linked to the shipment
8. Invoice is generated
9. Customer pays online through Stripe
10. Payment status updates appear in the dashboard automatically

Required pages:
- Home
- Quote Request
- Customer Login / Portal
- Shipment Tracking
- Ops Dashboard
- Dispatch Board
- Quote List
- Quote Detail
- Load List
- Load Detail
- Customer Management
- Carrier Management
- Invoice List
- Invoice Detail
- Document Center
- Admin Settings
- Integrations Settings
- Activity / Audit Log

UI requirements:
- Clean, modern dark theme
- Mobile-friendly
- Fast workflow for creating and updating loads
- Easy-to-read operational tables
- Practical dashboard for real freight operations, not demo-only UI

Technical requirements:
- Production-ready architecture
- Secure authentication and role-based access
- Separate service layer for each third-party integration
- Webhook endpoints for Twilio and Stripe
- Background job processing for retries and async tasks
- Structured logging
- Error handling and retry policy
- Audit logging for outbound and inbound integration events
- Environment-variable-based secret management

Design the system with these backend modules:
- auth
- users
- customers
- carriers
- quotes
- loads
- load_status_history
- documents
- invoices
- payments
- notifications
- integrations
- webhooks
- audit_logs

For integrations, do all of the following:
1. Define exact integration architecture
2. List all required API keys, secrets, and account setup items
3. Define environment variables
4. Specify webhook endpoints and subscribed events
5. Recommend database tables and fields needed
6. Define retry logic for failed API calls
7. Define logging and monitoring requirements
8. Tell me exactly what credentials, branding assets, business rules, and required fields you need from me

Output format:
1. System architecture
2. Pages and modules
3. Database schema
4. Required third-party accounts and credentials
5. Environment variables
6. Webhook configuration
7. Integration service design
8. Step-by-step implementation order
9. Security best practices
10. Final list of items needed from me

Build the MVP in the most practical production-ready order, not as a mockup.
```

## 2) Recommended Production Architecture

> **⚠️ Note — architecture drift:** This section describes the original planning-phase target architecture. The **actual implemented architecture** differs in several areas. Before building against these recommendations, review the canonical reference:
>
> - [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) — canonical backend framework, ports, entry points
> - [`docs/API-REFERENCE.md`](API-REFERENCE.md) — implemented API routes
>
> Key differences between this document and the live repo:
>
> | This document | Actual repo |
> |---|---|
> | Next.js frontend | React 18 + Vite SPA (not Next.js) |
> | Next.js API routes or separate Node backend | Express 5 (`apps/api/src/server.ts`) |
> | Express version assumptions in older sections | Express 5 in use |
> | tRPC-style type-safe RPC | Standard REST over HTTP |
> | `/api/freight/...` route prefix | Routes use `/api/loads`, `/api/shipments`, `/api/freight-operations/:resource`, `/api/workflows/...` |
> | Webhook endpoint `POST /api/webhooks/stripe` | Implemented as `POST /api/billing/webhook` |

### Stack

Use this structure:

#### Frontend
- Next.js
- TypeScript
- Tailwind
- Auth-protected dashboard + public pages

#### Backend
- Next.js API routes or separate Node backend
- Service-layer architecture
- Background jobs for async processing

#### Database
- PostgreSQL

#### File storage
- S3-compatible storage or equivalent

#### Queue / jobs
- Redis + job worker layer

#### Auth
- Secure email/password or SSO later
- Role-based access control

## 3) Integration Design

### A. OpenAI

Use for:
- Quote draft assistance
- Message drafting
- Shipment summary generation
- Document extraction

Service pattern:
- `openai.service.ts`
- `document-extraction.service.ts`
- `prompt-templates.ts`

Best practice:
- Do not call OpenAI directly from page components.
- Always go through backend service functions.

Suggested internal methods:
- `generateQuoteDraft()`
- `draftCustomerUpdate()`
- `summarizeShipmentStatus()`
- `extractFreightDocumentData()`

### B. Twilio

Use for:
- SMS notifications
- Event-driven shipment updates
- Delivery status tracking

Service pattern:
- `twilio.service.ts`
- `notification.service.ts`
- `message-template.service.ts`

Suggested methods:
- `sendShipmentUpdateSMS()`
- `sendCarrierAlert()`
- `sendCustomerAlert()`
- `handleMessageStatusCallback()`

Trigger events:
- quote sent
- quote approved
- load booked
- pickup complete
- in transit
- delayed / exception
- delivered
- invoice sent
- payment received

### C. Stripe

Use for:
- Payment links
- Invoice payment
- Payment status updates
- Payment reconciliation

Service pattern:
- `stripe.service.ts`
- `billing.service.ts`
- `payment-reconciliation.service.ts`

Suggested methods:
- `createPaymentLinkForInvoice()`
- `createCheckoutSession()`
- `handleStripeWebhook()`
- `syncPaymentStatus()`

## 4) Environment Variables

```bash
APP_NAME=Infamous Freight
APP_ENV=production
APP_BASE_URL=https://yourdomain.com
WEBHOOK_BASE_URL=https://yourdomain.com

DATABASE_URL=
REDIS_URL=

JWT_SECRET=
SESSION_SECRET=

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
TWILIO_MESSAGING_SERVICE_SID=
TWILIO_STATUS_CALLBACK_URL=https://yourdomain.com/api/webhooks/twilio/status

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

STORAGE_BUCKET=
STORAGE_REGION=
STORAGE_ACCESS_KEY_ID=
STORAGE_SECRET_ACCESS_KEY=

EMAIL_FROM_ADDRESS=
SUPPORT_EMAIL=
```

## 5) Webhooks to Configure

### Stripe webhooks
Create endpoint: `POST /api/webhooks/stripe`

Listen for:
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.paid`
- `invoice.payment_failed`

### Twilio callbacks
Create endpoint: `POST /api/webhooks/twilio/status`

Use for:
- message sent
- delivered
- failed
- undelivered

### Internal eventing
Recommended internal event names:
- `quote.created`
- `quote.sent`
- `quote.approved`
- `load.created`
- `load.status.updated`
- `invoice.created`
- `payment.received`

## 6) Database Schema

Core tables and suggested fields:

### users
- id
- full_name
- email
- password_hash
- role
- is_active
- created_at
- updated_at

### customers
- id
- company_name
- contact_name
- email
- phone
- billing_address
- notes
- created_at
- updated_at

### carriers
- id
- company_name
- contact_name
- email
- phone
- mc_number
- dot_number
- insurance_status
- notes
- created_at
- updated_at

### quotes
- id
- customer_id
- origin
- destination
- shipment_type
- equipment_type
- weight
- commodity
- requested_pickup_date
- status
- ai_summary
- ai_draft
- quoted_amount
- created_by
- created_at
- updated_at

### loads
- id
- quote_id
- customer_id
- carrier_id
- load_number
- status
- pickup_address
- delivery_address
- scheduled_pickup_at
- scheduled_delivery_at
- equipment_type
- commodity
- notes
- created_at
- updated_at

### load_status_history
- id
- load_id
- status
- status_note
- updated_by
- created_at

### documents
- id
- load_id
- customer_id
- carrier_id
- document_type
- file_url
- extracted_json
- extraction_status
- uploaded_by
- created_at

### invoices
- id
- customer_id
- load_id
- invoice_number
- amount
- due_date
- status
- stripe_payment_link
- stripe_checkout_session_id
- created_at
- updated_at

### payments
- id
- invoice_id
- stripe_payment_intent_id
- stripe_checkout_session_id
- amount
- currency
- status
- paid_at
- raw_response_json
- created_at
- updated_at

### notifications
- id
- related_type
- related_id
- recipient_type
- recipient_name
- recipient_phone
- recipient_email
- channel
- template_key
- message_body
- provider
- provider_message_id
- delivery_status
- error_message
- created_at
- updated_at

### integration_events
- id
- provider
- event_type
- event_direction
- external_id
- payload_json
- processing_status
- error_message
- created_at
- processed_at

### webhook_logs
- id
- provider
- endpoint
- headers_json
- payload_json
- validation_status
- processing_status
- error_message
- created_at

### audit_logs
- id
- user_id
- entity_type
- entity_id
- action
- metadata_json
- created_at

## 7) Security Setup

Required:
- Store secrets only in environment variables
- Never expose secret keys to frontend
- Verify Stripe webhook signatures
- Validate Twilio callbacks
- Encrypt sensitive data where needed
- Role-based access:
  - admin
  - ops
  - billing
  - customer

Good practice:
- Add request logging
- Add rate limiting on public forms
- Add upload validation for documents
- Add API retry rules with dead-letter handling for failures

## 8) Retry and Background Job Logic

Use queue workers for:
- SMS sends
- email sends
- document extraction
- AI summarization
- webhook processing
- payment reconciliation retries

Retry policy:
1. attempt 1 immediately
2. attempt 2 after 1 minute
3. attempt 3 after 5 minutes
4. attempt 4 after 15 minutes
5. move to failed state with alert after final retry

Log all failed jobs into:
- `integration_events`
- `webhook_logs`
- `notifications`

## 9) Page List for MVP

### Public
- Home
- Quote Request
- Shipment Tracking
- Customer Login

### Private
- Dashboard
- Quotes
- Quote Detail
- Loads
- Load Detail
- Dispatch Board
- Customers
- Carriers
- Documents
- Invoices
- Payments
- Notifications
- Integrations
- Settings
- Audit Logs

## 10) Exact Items Manus Should Ask You For

Credentials:
- OpenAI API key
- Twilio Account SID
- Twilio Auth Token
- Twilio phone number
- Stripe secret key
- Stripe publishable key
- Stripe webhook secret

Branding:
- logo
- business name
- domain
- brand colors
- support email

Business rules:
- quote required fields
- load statuses
- document types
- invoice rules
- payment terms
- customer notification triggers
- carrier notification triggers

Operational details:
- customer roles
- internal user roles
- dispatch workflow
- load numbering format
- invoice numbering format

## 11) Best Implementation Order

### Phase 1
- auth
- database
- users/customers/carriers
- quote request form
- ops dashboard skeleton

### Phase 2
- quote workflow
- load creation
- dispatch board
- status updates

### Phase 3
- Twilio notifications
- document upload/storage
- OpenAI document extraction

### Phase 4
- invoice creation
- Stripe payment links
- payment sync webhooks

### Phase 5
- audit logs
- retry jobs
- admin integrations settings
- production hardening

## 12) Ready-to-Send Follow-Up Message for Manus

```text
Use PostgreSQL for the database, a secure backend service layer for all integrations, webhook endpoints for Stripe and Twilio, and background jobs for retries and async processing.

Do not build this as a demo-only app. Build the structure so it can support real freight brokerage operations.

Before building, give me:
1. Final schema
2. Final environment variables
3. Final webhook endpoints
4. Exact credentials you need from me
5. Any assumptions you are making
```

## 13) Recommended Sequence for Using Manus

1. Paste the Master Manus Prompt.
2. Paste the Follow-Up Message.
3. Provide branding, API keys, statuses, and quote/load/invoice business rules.
