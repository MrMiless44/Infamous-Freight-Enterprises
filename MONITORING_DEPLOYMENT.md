# Monitoring & Observability Deployment Guide

Complete guide for deploying monitoring infrastructure for Infamous Freight.

---

## 1. Prometheus Setup

### Docker Deployment

```yaml
# monitoring/prometheus.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: infamous-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - monitoring

volumes:
  prometheus_data:

networks:
  monitoring:
    driver: bridge
```

### Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # API Server Metrics
  - job_name: 'infamous-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 10s

  # Database Metrics
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
    scrape_interval: 30s

  # Node Exporter (System Metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
    scrape_interval: 15s

  # Redis Metrics
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
    scrape_interval: 15s

  # PgBouncer Metrics
  - job_name: 'pgbouncer'
    static_configs:
      - targets: ['localhost:9188']
    scrape_interval: 30s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']

rule_files:
  - 'alert_rules.yml'
```

---

## 2. Grafana Setup

### Docker Deployment

```yaml
# monitoring/grafana.yml
version: '3.8'

services:
  grafana:
    image: grafana/grafana:latest
    container_name: infamous-grafana
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
      GF_INSTALL_PLUGINS: grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana-dashboard.json:/etc/grafana/provisioning/dashboards/dashboard.json
      - ./grafana-datasource.yml:/etc/grafana/provisioning/datasources/datasource.yml
    depends_on:
      - prometheus
    networks:
      - monitoring

volumes:
  grafana_data:

networks:
  monitoring:
    driver: bridge
```

### Grafana Datasource Configuration

```yaml
# monitoring/grafana-datasource.yml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
```

---

## 3. Alert Manager Setup

### Configuration

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
      receiver: 'critical'
      continue: true

    - match:
        severity: warning
      receiver: 'warning'

receivers:
  - name: 'default'
    slack_configs:
      - api_url: ${SLACK_WEBHOOK_URL}
        channel: '#alerts'
        title: 'Infamous Freight Alert'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'critical'
    slack_configs:
      - api_url: ${SLACK_WEBHOOK_URL}
        channel: '#critical-alerts'
        title: 'CRITICAL: {{ .GroupLabels.alertname }}'
    pagerduty_configs:
      - service_key: ${PAGERDUTY_SERVICE_KEY}

  - name: 'warning'
    slack_configs:
      - api_url: ${SLACK_WEBHOOK_URL}
        channel: '#alerts'
        title: 'Warning: {{ .GroupLabels.alertname }}'
```

---

## 4. Alert Rules

### Configuration

```yaml
# monitoring/alert_rules.yml
groups:
  - name: infamous_freight
    interval: 30s
    rules:
      # API Alerts
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time"
          description: "p95 response time is {{ $value }}s"

      # Database Alerts
      - alert: HighDatabaseConnections
        expr: pg_stat_activity_count > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "{{ $value }} connections active"

      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database is down"
          description: "PostgreSQL is not responding"

      # Webhook Alerts
      - alert: WebhookDeliveryFailure
        expr: rate(webhook_deliveries_failed_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Webhook delivery failures"
          description: "{{ $value | humanizePercentage }} of webhooks failing"

      - alert: NoWebhookEvents
        expr: increase(webhook_events_total[1h]) == 0
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "No webhook events received"
          description: "No webhook events in the last hour"

      # System Alerts
      - alert: HighCPUUsage
        expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value | humanizePercentage }}"

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      - alert: LowDiskSpace
        expr: node_filesystem_avail_bytes / node_filesystem_size_bytes < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Only {{ $value | humanizePercentage }} disk space available"

      # Uptime Alerts
      - alert: ServiceDown
        expr: up{job="infamous-api"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Infamous Freight API is down"
          description: "The API has been unreachable for 2 minutes"
```

---

## 5. Metrics Exporters

### Node Exporter (System Metrics)

```bash
# Install
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.1.linux-amd64.tar.gz
sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/

# Run
node_exporter --web.listen-address=:9100
```

### Postgres Exporter

```bash
# Docker
docker run -d \
  --name postgres_exporter \
  -e DATA_SOURCE_NAME="postgresql://user:password@postgres:5432/infamous_freight?sslmode=disable" \
  -p 9187:9187 \
  prometheuscommunity/postgres-exporter
```

### Redis Exporter

```bash
# Docker
docker run -d \
  --name redis_exporter \
  -p 9121:9121 \
  oliver006/redis_exporter \
  -redis-addr=redis:6379 \
  -redis-password=${REDIS_PASSWORD}
```

### PgBouncer Exporter

```bash
# Docker
docker run -d \
  --name pgbouncer_exporter \
  -e PGBOUNCER_HOST=pgbouncer \
  -e PGBOUNCER_PORT=6432 \
  -e PGBOUNCER_USER=pgbouncer \
  -e PGBOUNCER_PASSWORD=${PGBOUNCER_PASSWORD} \
  -p 9188:9188 \
  edoburu/pgbouncer-exporter
```

---

## 6. Application Metrics

### Express Middleware

```typescript
// apps/api/src/middleware/metrics.ts
import promClient from 'prom-client';
import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Middleware
router.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);

    httpRequestTotal
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  });

  next();
});

// Metrics endpoint
router.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

export default router;
```

---

## 7. Complete Docker Compose

```yaml
# monitoring/docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./alert_rules.yml:/etc/prometheus/alert_rules.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana-datasource.yml:/etc/grafana/provisioning/datasources/datasource.yml
    depends_on:
      - prometheus
    networks:
      - monitoring

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    networks:
      - monitoring

  node_exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
    networks:
      - monitoring

  postgres_exporter:
    image: prometheuscommunity/postgres-exporter:latest
    ports:
      - "9187:9187"
    environment:
      DATA_SOURCE_NAME: "postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?sslmode=disable"
    networks:
      - monitoring

  redis_exporter:
    image: oliver006/redis_exporter:latest
    ports:
      - "9121:9121"
    command:
      - "-redis-addr=redis:6379"
      - "-redis-password=${REDIS_PASSWORD}"
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:

networks:
  monitoring:
    driver: bridge
```

---

## 8. Deployment Steps

### 1. Start Monitoring Stack

```bash
cd monitoring
docker-compose up -d
```

### 2. Configure Grafana

1. Visit http://localhost:3001
2. Login with admin/admin
3. Add Prometheus datasource
4. Import dashboard from grafana-dashboard.json
5. Configure alerts

### 3. Configure Alerts

1. Visit http://localhost:9093 (AlertManager)
2. Configure Slack/PagerDuty webhooks
3. Test alert delivery

### 4. Verify Metrics Collection

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check metrics
curl http://localhost:9090/api/v1/query?query=up
```

---

## 9. Monitoring Checklist

- [ ] Prometheus collecting metrics
- [ ] Grafana displaying dashboards
- [ ] AlertManager sending alerts
- [ ] All exporters running
- [ ] Slack/PagerDuty integration working
- [ ] Alert rules configured
- [ ] Dashboards customized
- [ ] Retention policies set
- [ ] Backups configured
- [ ] Team trained on monitoring

---

## Next Steps

1. Deploy monitoring stack
2. Configure application metrics
3. Set up alert notifications
4. Create runbooks for common alerts
5. Train team on monitoring and alerting
