# GitHub Execution Backlog

## Repository Tasks

- [ ] Add production operations docs
- [ ] Add issue templates for operations and compliance
- [ ] Add PR checklist for launch readiness
- [ ] Add deployment-neutral launch documentation
- [ ] Link operating docs from main README
- [ ] Confirm CI passes on main
- [ ] Confirm environment variable documentation is current

## Product Tasks

- [ ] Confirm quote intake workflow
- [ ] Confirm carrier onboarding workflow
- [ ] Confirm tracking workflow
- [ ] Confirm dispatch workflow
- [ ] Confirm CRM or database destination for leads
- [ ] Confirm document upload and retention workflow

## Compliance Tasks

- [ ] Validate broker authority requirements
- [ ] Validate bond or trust requirement
- [ ] Validate BOC-3 filing
- [ ] Validate carrier packet workflow
- [ ] Validate document retention process

## Production Dashboard Hardening Follow-ups

### Summary

Track remaining production dashboard work after the environment and billing hardening changes were merged.

### Execution checklist (production)

- [ ] Review all production environment variables in the deployment provider dashboard and set every secret token/key to **Secret/Sensitive** visibility.
- [ ] Rotate any credential that was ever stored as plain text or visible in dashboard history.
- [ ] Re-add rotated credentials only through provider secret-management controls (never via git, issue comments, chat, screenshots, or logs).
- [ ] Configure the production Stripe webhook endpoint to the production API billing webhook route.
- [ ] Add `STRIPE_WEBHOOK_SECRET` (live) via secret-management controls.
- [ ] Use a restricted live key for server-side Stripe operations where supported.
- [ ] Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live publishable) for frontend checkout flows.
- [ ] Trigger a fresh production deployment after environment updates.
- [ ] Verify checkout, webhooks, customer portal, subscription lifecycle transitions, and billing access updates end-to-end.

### Required Stripe webhook events

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### Verification evidence to capture

- [ ] Deployment revision ID for the release containing rotated credentials.
- [ ] Timestamped screenshot/export showing secret visibility is masked for production environment entries.
- [ ] Stripe webhook delivery success sample for each required event type.
- [ ] One successful live checkout + subscription activation record.
- [ ] One failed payment simulation and expected access downgrade/recovery behavior.

### Security notes

Do not paste credentials into GitHub issues, comments, chat, screenshots, build logs, or source files.
