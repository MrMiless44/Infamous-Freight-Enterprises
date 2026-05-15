# Freight Operations Dashboards

## Goals

Provide operational visibility for dispatch, billing, realtime coordination, and customer activity.

## Recommended free/legal gateways

- Grafana Cloud free tier
- Supabase dashboards
- PostgreSQL views/materialized views
- Sentry dashboards
- GitHub Actions summaries

## Executive dashboard

Track:

- daily load volume
- active shipments
- dispatch completion rate
- revenue by lane
- billing conversion
- failed payment count
- average dispatch response time

## Dispatch dashboard

Track:

- active loads
- delayed shipments
- reassignment count
- average driver response time
- quote-to-dispatch conversion
- missed pickups

## Driver operations dashboard

Track:

- active drivers
- available drivers
- late deliveries
- realtime disconnect spikes
- HOS/ELD alerts

## Platform reliability dashboard

Track:

- API latency
- 5xx rate
- deploy failures
- failed health checks
- Stripe webhook failures
- auth failures
- Socket.io reconnect spikes

## AI operations dashboard

Track:

- AI feature usage
- generated dispatch workflows
- token consumption
- automation success/failure rate
- operator overrides

## Suggested SQL starter metrics

```sql
-- Daily loads
SELECT DATE(created_at) AS day, COUNT(*)
FROM loads
GROUP BY day
ORDER BY day DESC;
```

```sql
-- Shipment status counts
SELECT status, COUNT(*)
FROM shipments
GROUP BY status;
```

```sql
-- Driver activity
SELECT driver_id, COUNT(*) AS assignments
FROM load_assignments
GROUP BY driver_id
ORDER BY assignments DESC;
```

## Operational cadence

- Daily dispatch review
- Weekly reliability review
- Weekly failed-payment review
- Monthly technical debt review
- Monthly incident/postmortem review
