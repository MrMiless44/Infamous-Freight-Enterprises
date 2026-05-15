# Sentry Setup Guide

## Goals

- Capture frontend and backend runtime failures.
- Correlate releases to deploy SHAs.
- Detect production regressions quickly.
- Preserve operational visibility during incidents.

## Recommended free/legal gateway

- Sentry free tier for initial rollout.

## Frontend integration

Recommended signals:

- route crashes
- hydration failures
- API request failures
- realtime connection failures
- performance traces

## Backend integration

Recommended signals:

- unhandled exceptions
- Prisma/database failures
- Stripe webhook failures
- auth/token validation failures
- deployment startup failures

## Release tagging

Use Git SHA tagging for correlation.

Example environment values:

```bash
SENTRY_ENVIRONMENT=production
SENTRY_RELEASE=$GITHUB_SHA
```

## Sensitive data rules

Never send:

- raw auth tokens
- Stripe secrets
- database credentials
- customer payment data
- full personally identifiable information

## Alert recommendations

Create alerts for:

- repeated API exceptions
- frontend crash spikes
- Stripe webhook failures
- auth validation failures
- deploy-related regressions

## Rollout order

1. Backend exception tracking.
2. Frontend exception tracking.
3. Release tagging.
4. Performance traces.
5. Alert routing and ownership.
