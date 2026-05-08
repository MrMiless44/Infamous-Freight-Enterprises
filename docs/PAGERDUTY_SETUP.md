# PagerDuty Integration Setup

Complete guide for integrating PagerDuty with Infamous Freight monitoring.

---

## 1. Create PagerDuty Account

1. Visit https://www.pagerduty.com/sign-up/
2. Create account with your email
3. Set up your organization
4. Complete onboarding

---

## 2. Create Service

1. Go to **Services** → **New Service**
2. Fill in details:
   - **Name:** Infamous Freight API
   - **Description:** Production API monitoring
   - **Escalation Policy:** Create new or select existing
   - **Alert Creation:** From events
3. Click **Create Service**
4. Copy **Integration Key** (you'll need this)

---

## 3. Configure AlertManager Integration

### Step 1: Get PagerDuty Integration Key

1. In PagerDuty, go to your service
2. Click **Integrations** tab
3. Copy the **Integration Key**

### Step 2: Update AlertManager Configuration

```yaml
# monitoring/alertmanager.yml
global:
  resolve_timeout: 5m

route:
  receiver: 'default'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h

  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-critical'
      continue: true

    - match:
        severity: warning
      receiver: 'slack-warning'

receivers:
  - name: 'default'
    slack_configs:
      - api_url: ${SLACK_WEBHOOK_URL}
        channel: '#alerts'

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: ${PAGERDUTY_INTEGRATION_KEY}
        description: '{{ .GroupLabels.alertname }}: {{ .CommonAnnotations.summary }}'
        details:
          firing: '{{ template "pagerduty.default.instances" .Alerts.Firing }}'
          resolved: '{{ template "pagerduty.default.instances" .Alerts.Resolved }}'

  - name: 'slack-warning'
    slack_configs:
      - api_url: ${SLACK_WEBHOOK_URL}
        channel: '#warnings'
        title: 'Warning: {{ .GroupLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'
```

---

## 4. Environment Variables

Add to your `.env` file:

```bash
# PagerDuty Configuration
PAGERDUTY_INTEGRATION_KEY=your_integration_key_here
PAGERDUTY_SERVICE_ID=your_service_id_here
PAGERDUTY_API_KEY=your_api_key_here
```

---

## 5. Test Integration

### Test Alert

```bash
# Send test alert to PagerDuty
curl -X POST http://localhost:9093/api/v1/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "alerts": [
      {
        "status": "firing",
        "labels": {
          "alertname": "TestAlert",
          "severity": "critical"
        },
        "annotations": {
          "summary": "This is a test alert",
          "description": "Testing PagerDuty integration"
        }
      }
    ]
  }'
```

### Verify in PagerDuty

1. Go to PagerDuty dashboard
2. Check **Incidents** tab
3. You should see the test incident
4. Acknowledge and resolve to test workflow

---

## 6. Configure On-Call Schedule

### Create Schedule

1. Go to **Schedules** → **New Schedule**
2. Set up your on-call rotation:
   - Add team members
   - Set shift duration
   - Configure timezone
3. Save schedule

### Link to Escalation Policy

1. Go to **Escalation Policies**
2. Create new or edit existing
3. Add schedule to escalation levels
4. Save policy

### Link to Service

1. Go to your Infamous Freight service
2. Click **Escalation Policy**
3. Select your escalation policy
4. Save

---

## 7. Configure Notifications

### Email Notifications

1. Go to **Settings** → **Notification Rules**
2. Configure email preferences
3. Set notification urgency levels

### Mobile App Notifications

1. Download PagerDuty mobile app
2. Log in with your account
3. Enable push notifications
4. Configure notification settings

### SMS Alerts (Optional)

1. Go to **Settings** → **Phone Numbers**
2. Add your phone number
3. Verify with code
4. Configure SMS rules

---

## 8. Create Incident Response Workflow

### Incident Workflow

```yaml
# monitoring/incident-workflow.yml
workflows:
  - name: "Critical API Error"
    trigger: "alert"
    condition:
      - severity: critical
      - service: infamous-freight
    actions:
      - create_incident:
          title: "{{ alert.title }}"
          urgency: high
      - notify_oncall:
          via: [email, sms, push]
      - create_jira_ticket:
          project: IF
          issue_type: Incident
      - post_slack:
          channel: "#critical-incidents"
          message: "🚨 CRITICAL: {{ alert.title }}"

  - name: "Database Connection Pool Exhausted"
    trigger: "alert"
    condition:
      - alertname: "HighDatabaseConnections"
    actions:
      - escalate_incident:
          level: 2
      - run_runbook:
          name: "database-pool-recovery"
      - notify_oncall:
          via: [email, sms]

  - name: "Webhook Delivery Failure"
    trigger: "alert"
    condition:
      - alertname: "WebhookDeliveryFailure"
    actions:
      - create_incident:
          title: "Webhook delivery failure"
          urgency: medium
      - run_runbook:
          name: "webhook-recovery"
      - notify_team:
          channel: "#webhooks"
```

---

## 9. Create Runbooks

### Database Recovery Runbook

```markdown
# Database Pool Recovery

## Symptoms
- High database connection count
- Slow queries
- Connection timeouts

## Steps

1. **Check Connection Status**
   ```bash
   psql -c "SELECT count(*) FROM pg_stat_activity;"
   ```

2. **Identify Long-Running Queries**
   ```bash
   psql -c "SELECT pid, usename, query, query_start FROM pg_stat_activity WHERE state != 'idle';"
   ```

3. **Kill Idle Connections**
   ```bash
   psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND query_start < now() - interval '1 hour';"
   ```

4. **Restart PgBouncer**
   ```bash
   docker restart infamous-pgbouncer
   ```

5. **Monitor Recovery**
   ```bash
   watch -n 1 'psql -c "SELECT count(*) FROM pg_stat_activity;"'
   ```

## Escalation
If connections remain high after 5 minutes, escalate to database team.
```

### Webhook Recovery Runbook

```markdown
# Webhook Delivery Recovery

## Symptoms
- Webhook delivery failures
- No load updates from load boards
- Stale load data

## Steps

1. **Check Webhook Status**
   ```bash
   curl https://api.infamousfreight.fly.dev/webhooks/status
   ```

2. **Verify Load Board Connectivity**
   ```bash
   curl -H "Authorization: Bearer ${DAT_API_KEY}" https://api.dat.com/health
   ```

3. **Resync Recent Loads**
   ```bash
   curl -X POST https://api.infamousfreight.fly.dev/admin/sync-loads \
     -H "Authorization: Bearer ${ADMIN_TOKEN}"
   ```

4. **Check Webhook Logs**
   ```bash
   docker logs infamous-api | grep webhook
   ```

5. **Retry Failed Webhooks**
   ```bash
   curl -X POST https://api.infamousfreight.fly.dev/webhooks/retry \
     -H "Authorization: Bearer ${ADMIN_TOKEN}" \
     -H "Content-Type: application/json" \
     -d '{"since": "1 hour"}'
   ```

## Escalation
If webhooks still failing after 10 minutes, escalate to API team.
```

---

## 10. Monitoring Dashboard

### PagerDuty Dashboard Metrics

Track:
- Mean Time to Acknowledge (MTTA)
- Mean Time to Resolve (MTTR)
- Incident frequency
- On-call workload
- Team performance

### Reports

Generate weekly/monthly reports:
1. Go to **Reports** → **Incident Reports**
2. Select date range
3. Download PDF report
4. Share with team

---

## 11. Team Training

### Training Checklist

- [ ] All team members have PagerDuty accounts
- [ ] Mobile app installed and configured
- [ ] Notification preferences set
- [ ] On-call schedule understood
- [ ] Incident response workflow practiced
- [ ] Runbooks reviewed
- [ ] Escalation policy understood

### Practice Drill

1. Schedule monthly incident drill
2. Trigger test incident
3. Practice response workflow
4. Review performance
5. Iterate on process

---

## 12. Troubleshooting

### Alerts Not Reaching PagerDuty

1. Verify integration key is correct
2. Check AlertManager logs
3. Test webhook manually
4. Verify service is active in PagerDuty

### Duplicate Incidents

1. Check alert grouping rules
2. Adjust group_by in AlertManager
3. Verify alert deduplication

### Slow Incident Creation

1. Check PagerDuty API status
2. Verify network connectivity
3. Check rate limits
4. Increase timeout values

---

## Next Steps

1. Complete PagerDuty setup
2. Configure on-call schedule
3. Create incident workflows
4. Document runbooks
5. Train team
6. Run practice drill
7. Monitor and iterate
