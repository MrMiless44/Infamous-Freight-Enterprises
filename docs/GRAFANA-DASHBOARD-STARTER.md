# Grafana Dashboard Starter

## Recommended dashboard groups

### 1. Platform Reliability

Panels:
- API readiness success rate
- p95 latency
- 5xx error rate
- deploy failures
- smoke-test failures
- realtime reconnect spikes

### 2. Dispatch Operations

Panels:
- active loads
- delayed shipments
- dispatch completion rate
- assignment latency
- load board activity

### 3. Billing and Revenue

Panels:
- Stripe webhook failures
- successful checkouts
- failed payments
- subscription status distribution
- one-time purchase events

### 4. AI Operations

Panels:
- AI usage volume
- AI workflow completions
- AI override rate
- AI request latency

## Suggested data sources

- Fly.io logs
- Sentry
- Supabase/Postgres
- GitHub Actions artifacts
- Stripe webhooks

## Suggested alert thresholds

| Signal | Threshold |
|---|---|
| API 5xx rate | >2% for 5 minutes |
| Smoke test failure | any production failure |
| Stripe webhook failures | >0 |
| Socket reconnect spikes | >3x baseline |
| p95 latency | >2 seconds |

## Rollout sequence

1. Reliability dashboard
2. Dispatch metrics
3. Billing metrics
4. AI metrics
5. Alert routing
