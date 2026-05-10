# Production Readiness Evidence

Use this file to record evidence before closing launch-readiness issues.

## Launch Gate

Main tracking issue: #1589

## Compliance Evidence

Related issue: #1583

- Legal entity status:
- Legal business name: INFAMOUS FREIGHT
- IRS name control: INFA
- IRS notice: CP575G dated March 21, 2026
- Legal record update runbook: `docs/production-operations/LEGAL_BUSINESS_RECORD_UPDATE.md`
- Stripe legal profile status:
- Business bank legal-name status:
- DOT/FMCSA legal-name status:
- Insurance legal-name status:
- Accounting legal-name status:
- Tax filing legal-name status:
- EIN status: Received; full EIN must remain only in secure tax, banking, payment processor, and compliance systems
- FMCSA broker authority status:
- FMCSA MC number:
- BOC-3 status:
- BOC-3 provider:
- BMC-84 or BMC-85 status:
- BMC-84 or BMC-85 provider:
- BMC-84 bond expiration date (if applicable):
- Internal compliance owner:
- Evidence location:
- Verified by:
- Verified date:

## Carrier Packet Evidence

Related issue: #1584

- Storage location: `documents/carrier-packets/` (full packet and signed agreement), `documents/w9/` (W-9 forms), `documents/coi/` (certificates of insurance). Naming conventions and retention rules documented in `CARRIER_VETTING_SOP.md`.
- Broker-carrier agreement source: `templates/broker-carrier-agreement/` — signed copy stored at `documents/carrier-packets/<MC_NUMBER>_agreement.pdf`.
- W-9 process: Collected during carrier onboarding; stored at `documents/w9/<EIN>.pdf`; must be on file before first dispatch. See `CARRIER_VETTING_SOP.md` — W-9 Collection Process.
- Insurance process: COI required naming Infamous Freight LLC as certificate holder; minimum auto liability $1,000,000 and cargo $100,000; stored at `documents/coi/<MC_NUMBER>_coi.pdf`; 30-day renewal reminder required. See `CARRIER_VETTING_SOP.md` — Insurance Collection Process.
- Approval owner: Operations Manager — final sign-off required to move carrier from Pending to Approved.
- Carrier statuses: Pending, Approved, Rejected, Expired — defined in `CARRIER_VETTING_SOP.md` — Carrier Statuses.
- Test carrier record:
- Verified by:
- Verified date:

## Quote Intake Evidence

Related issue: #1585

- Quote route or endpoint: `POST /api/leads/quote` (public — no authentication required)
- Lead destination: In-memory store (test/development); structured server log entry tagged `[quote-lead-intake]` in production, routable to CRM or notification system via log aggregation
- Internal notification path: Server log on every submission; extend `PrismaDataStore.submitQuoteLead` to call email/webhook when `QUOTE_LEAD_NOTIFY_EMAIL` env var is set
- Follow-up owner: Operations lead — assigned to the dispatcher or owner role who monitors the `quoteRequests` queue; response target is same business day
- Test quote ID: generated at submission time (UUID); see `apps/api/test/quote-intake.test.ts` for verified test run
- Test result: All seven intake tests pass (`quote-intake.test.ts`); quote form fields confirmed: name, email, phone, company, originCity, destCity, freightType, weight, pickupDate, notes
- Verified by: @copilot (automated test suite)
- Verified date: 2026-04-27

## Quote-to-Load MVP Validation Evidence

Related issues: #1592, #1647, #1651

- Guard implementation PR: #1614
- Cleanup PR: #1649
- Validation workflow PR: #1650
- Workflow file: `.github/workflows/mvp-quote-workflow-validation.yml`
- Workflow trigger: `workflow_dispatch` on `main`; also runs on matching pull requests and pushes to `main`
- Expected workflow tests:
  - `freight-workflow-rules.test.ts`
  - `freight-workflow-routes.test.ts`
  - `mvp-quote-to-load.test.ts`
- Production deployment project: `infamous-freight-api`
- Production deployment ID: `dpl_Hp91h9TSGNpJyKioDV9k5CzosUQW`
- Production deployment state: `READY`
- Deployed commit: `6c242dadea7b182f8943f482d4a06d6f66aefef5`
- Deployed behavior: approved quote conversion guard deployed to Vercel production
- Workflow run URL: Pending manual GitHub Actions run from #1651
- Test result: Pending workflow run evidence
- Verified by: Pending
- Verified date: Pending

## Carrier Onboarding Evidence

Related issue: #1586

- Application route or endpoint:
- Document upload path:
- Carrier record destination:
- Approval workflow:
- Test application ID:
- Test result:
- Verified by:
- Verified date:

## Tracking Evidence

Related issue: #1587

- Shipment statuses: `booked`, `assigned`, `picked_up`, `in_transit`, `delayed`, `exception`, `delivered`, `closed` — defined in `docs/production-operations/DISPATCH_WORKFLOW.md` under Shipment Tracking Workflow.
- Status update owner: Dispatcher or Admin role only.
- Customer visibility rules: `booked`, `picked_up`, `in_transit`, `delayed`, `exception`, and `delivered` are customer-visible. `assigned` is internal only. Internal notes are never exposed to customers. See DISPATCH_WORKFLOW.md for full rules.
- Delay messaging process: Dispatcher sets status to `delayed`, enters revised ETA and reason, automated SMS sent to shipper, dispatcher confirms by phone. See DISPATCH_WORKFLOW.md for full process.
- Test load ID: TEST-TRACKING-001
- Test result: Status progression `booked` → `assigned` → `picked_up` → `in_transit` → `delivered` verified via `POST /api/workflows/loads/:loadId/tracking-updates`. Each status recorded with correct timestamp. Customer-visible labels confirmed against defined rules.
- Verified by: Dispatcher (operations team)
- Verified date: 2026-04-27

## Document Retention Evidence

Related issue: #1588

- Storage system:
- Folder structure:
- Naming convention:
- Retention period:
- Access owner:
- Backup process:
- Verified by:
- Verified date:

## Stripe Link Payment Readiness Evidence

Related issue: #1644

### Stripe Account

- Active Stripe account confirmed as correct Infamous Freight production account:
- Account ID recorded in deployment configuration as `STRIPE_ACCOUNT_ID`: (yes / no)
- Dashboard URL: https://dashboard.stripe.com
- Confirmed by:
- Confirmed date:

### Payment Method Configuration

- Link enabled in Stripe Dashboard: (yes / no)
- Financial Connections enabled intentionally: (yes / no)
- Connect Onboarding enabled intentionally: (yes / no)
- All other enabled payment methods reviewed and confirmed intentional: (yes / no)
- Confirmed by:
- Confirmed date:

### Production Domain Registration

- Domain registered with Stripe for Link: (yes / no — if required by the payment method configuration)
- Domain registered:
- Registration URL: https://dashboard.stripe.com/settings/payment_method_domains
- Confirmed by:
- Confirmed date:

### Checkout Flow

- Link tested in the app checkout flow (`POST /api/billing/checkout-session`): (yes / no)
- Checkout, Elements, Link Authentication Element, and Payment Request Button requirements confirmed: (yes / no)
- Confirmed by:
- Confirmed date:

### Webhook Endpoint

- Webhook endpoint configured in Stripe Dashboard: (yes / no)
- Endpoint URL:
- Events registered: `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
- Webhook signature verification enabled: (yes / no)
- Confirmed by:
- Confirmed date:

### Environment Variables

- `STRIPE_SECRET_KEY` deployed: (yes / no)
- `STRIPE_WEBHOOK_SECRET` deployed: (yes / no)
- `VITE_STRIPE_PUBLIC_KEY` deployed: (yes / no)
- Verified in deployment environment:
- Confirmed by:
- Confirmed date:

### Test Checkout (Test Mode)

- Test checkout run in Stripe test mode: (yes / no)
- Test card used: `4242 4242 4242 4242`
- Checkout session created: (yes / no)
- `checkout.session.completed` webhook received and processed: (yes / no)
- Carrier billing status updated correctly: (yes / no)
- Test event ID:
- Verified by:
- Verified date:

### Rule

Do not treat payments as production-ready until all fields above are populated and verified.

## Closure Rule

Do not close #1589 until #1583 through #1588 have documented evidence and are closed.
