# KPI Tracking

This document defines the operational and business KPIs that should be reviewed consistently.

## Core business KPIs

| KPI | Definition | Review cadence |
|---|---|---|
| Quote conversion rate | quote/demo leads that become active customer or dispatch activity | weekly |
| Dispatch latency | time from load creation to assignment/dispatch | daily/weekly |
| Shipment completion time | time from pickup to delivery confirmation | weekly |
| Driver utilization | active assigned driver time vs available driver time | weekly |
| Billing failure rate | failed Stripe/payment lifecycle events vs successful events | daily/weekly |
| AI usage efficiency | AI actions completed vs operator overrides/failures | weekly |

## Reliability KPIs

| KPI | Definition | Target |
|---|---|---|
| Deploy success rate | successful deploys / total deploy attempts | >= 95% |
| API readiness success | successful readiness probes / total probes | >= 99% |
| 5xx error rate | server errors / total API requests | < 1% |
| p95 API latency | 95th percentile API response time | < 2s initially |
| Webhook failure count | failed Stripe webhook processing events | 0 production failures |
| Realtime connection failure rate | failed Socket.io handshakes/reconnect spikes | monitored weekly |

## Operational review questions

- Which workflow slowed dispatch this week?
- Which failed event created customer or operator friction?
- Which manual step happened more than twice?
- Which metric lacks instrumentation?
- Which bottleneck should become the next AI task?

## KPI implementation path

1. Define the event or query.
2. Capture the event in the app or database.
3. Add a SQL view or dashboard panel.
4. Review weekly.
5. Convert recurring pain into an automation task.

## Suggested first dashboards

- Dispatch health
- Billing health
- Lead conversion
- Driver utilization
- Platform reliability
- AI operations

## Data quality rules

- Do not track unnecessary personal data.
- Avoid logging raw secrets, tokens, payment details, or private customer notes.
- Prefer aggregate metrics for dashboards.
- Keep tenant isolation intact in all analytics queries.
