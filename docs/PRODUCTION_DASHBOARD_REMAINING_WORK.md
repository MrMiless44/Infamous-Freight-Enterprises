# Production Dashboard Remaining Work

This checklist tracks the remaining production dashboard work after the environment and billing hardening changes were merged.

Treat every unchecked item as launch-blocking for paid production billing until verified with evidence in `docs/LAUNCH_EVIDENCE_LOG.md`.

## Scope

The remaining work is operational configuration and production verification. It must be completed in Netlify, Stripe, and any relevant provider dashboards rather than by committing credential values to the repository.

## Checklist

- [ ] Review deployment environment variables and mark sensitive runtime credentials as secret or sensitive where the provider supports it.
- [ ] Rotate any credential that may have been stored as a visible or non-secret value.
- [ ] Re-add rotated credentials only through provider secret-management settings.
- [ ] Configure the production Stripe webhook endpoint.
- [ ] Store `STRIPE_ACCOUNT_ID` with the same deployment and automation configuration that uses Stripe billing secrets.
- [ ] Add the Stripe webhook signing secret through secret-management settings.
- [ ] Use a restricted live Stripe key for backend Stripe operations where supported.
- [ ] Add public Stripe publishable keys for frontend usage.
- [ ] Trigger fresh production deploys after environment changes.
- [ ] Verify checkout, webhooks, customer portal, subscription lifecycle, and billing access updates.

## Required Stripe Webhook Events

Configure the production Stripe webhook endpoint to send these events:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_succeeded
invoice.payment_failed
payment_intent.succeeded
payment_intent.payment_failed
```

## Verification Notes

- Use `docs/PRODUCTION-SECRETS-CHECKLIST.md` for the secret inventory and provider-specific placement guidance.
- Use `docs/STRIPE_BILLING_AUTOMATION.md` for billing endpoint behavior and launch validation steps.
- Use `docs/STRIPE_WEBHOOK_VERIFICATION.md` for webhook signature, idempotency, failed-payment, cancellation, and reconciliation checks.
- Record production verification evidence in `docs/LAUNCH_EVIDENCE_LOG.md` after each environment change and deploy.

## Credential Handling Rule

Do not paste credentials into GitHub issues, comments, chat, screenshots, build logs, source files, or documentation. Store credential values only in provider secret-management settings, and rotate any credential that may have been exposed outside those settings.
