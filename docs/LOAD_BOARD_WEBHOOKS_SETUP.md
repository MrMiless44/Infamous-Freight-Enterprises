# Load Board Webhooks Setup Guide

This guide explains how to configure webhooks for DAT, TruckStop, and 123Loadboard to send real-time load updates to your Infamous Freight backend.

---

## Overview

Load board webhooks enable real-time notifications when new loads are posted, loads are updated, or loads are removed. This allows your system to maintain current load information without constant polling.

---

## 1. DAT (Direct Access Truckload) Webhooks

### Prerequisites
- DAT API account with webhook permissions
- API key: `${DAT_API_KEY}`

### Configuration Steps

1. **Log in to DAT Dashboard**
   - Visit: https://www.dat.com/api
   - Navigate to: API Settings → Webhooks

2. **Create Webhook Endpoint**
   - Endpoint URL: `https://api.infamousfreight.com/webhooks/dat`
   - Method: POST
   - Content-Type: application/json

3. **Configure Events**
   - ✅ Load Posted
   - ✅ Load Updated
   - ✅ Load Removed
   - ✅ Load Accepted

4. **Set Authentication**
   - Header: `Authorization: Bearer ${DAT_API_KEY}`
   - Verify SSL: Yes

5. **Test Webhook**
   - DAT provides a test button in the dashboard
   - Verify your endpoint receives the test payload

### Webhook Payload Example
```json
{
  "event": "load_posted",
  "timestamp": "2026-05-06T12:00:00Z",
  "load": {
    "id": "DAT_12345",
    "origin": "Los Angeles, CA",
    "destination": "Phoenix, AZ",
    "weight": 45000,
    "rate": 2500,
    "equipment": "53ft Dry Van",
    "posted_at": "2026-05-06T12:00:00Z"
  }
}
```

### Endpoint Handler
```typescript
// apps/api/src/webhooks/dat.ts
import { Router } from 'express';
import { verifyDATSignature } from '../middleware/verify-dat-signature';

const router = Router();

router.post('/webhooks/dat', verifyDATSignature, async (req, res) => {
  const { event, load } = req.body;
  
  try {
    switch (event) {
      case 'load_posted':
        await handleLoadPosted(load);
        break;
      case 'load_updated':
        await handleLoadUpdated(load);
        break;
      case 'load_removed':
        await handleLoadRemoved(load);
        break;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('DAT webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
```

---

## 2. TruckStop Webhooks

### Prerequisites
- TruckStop account with API access
- API key: `${TRUCKSTOP_API_KEY}`

### Configuration Steps

1. **Log in to TruckStop Dashboard**
   - Visit: https://www.truckstop.com/api
   - Navigate to: Integrations → Webhooks

2. **Create Webhook Endpoint**
   - Endpoint URL: `https://api.infamousfreight.com/webhooks/truckstop`
   - Method: POST
   - Content-Type: application/json

3. **Configure Events**
   - ✅ Load Available
   - ✅ Load Updated
   - ✅ Load Removed
   - ✅ Bid Accepted

4. **Set Authentication**
   - API Key: `${TRUCKSTOP_API_KEY}`
   - Header: `X-API-Key: ${TRUCKSTOP_API_KEY}`

5. **Test Webhook**
   - Use TruckStop's test tool to verify connectivity

### Webhook Payload Example
```json
{
  "event": "load_available",
  "timestamp": "2026-05-06T12:00:00Z",
  "load": {
    "id": "TS_98765",
    "origin": "Dallas, TX",
    "destination": "Houston, TX",
    "weight": 40000,
    "rate": 1800,
    "equipment": "53ft Refrigerated",
    "available_at": "2026-05-06T12:00:00Z"
  }
}
```

### Endpoint Handler
```typescript
// apps/api/src/webhooks/truckstop.ts
import { Router } from 'express';
import { verifyTruckStopSignature } from '../middleware/verify-truckstop-signature';

const router = Router();

router.post('/webhooks/truckstop', verifyTruckStopSignature, async (req, res) => {
  const { event, load } = req.body;
  
  try {
    switch (event) {
      case 'load_available':
        await handleLoadAvailable(load);
        break;
      case 'load_updated':
        await handleLoadUpdated(load);
        break;
      case 'load_removed':
        await handleLoadRemoved(load);
        break;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('TruckStop webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
```

---

## 3. 123Loadboard Webhooks

### Prerequisites
- 123Loadboard account with webhook access
- API key: `${LOADBOARD_API_KEY}`

### Configuration Steps

1. **Log in to 123Loadboard Dashboard**
   - Visit: https://www.123loadboard.com/api
   - Navigate to: Settings → Webhooks

2. **Create Webhook Endpoint**
   - Endpoint URL: `https://api.infamousfreight.com/webhooks/123loadboard`
   - Method: POST
   - Content-Type: application/json

3. **Configure Events**
   - ✅ Load Posted
   - ✅ Load Updated
   - ✅ Load Removed
   - ✅ Load Accepted

4. **Set Authentication**
   - API Key: `${LOADBOARD_API_KEY}`
   - Signature Header: `X-123LB-Signature`

5. **Test Webhook**
   - 123Loadboard provides a test payload option

### Webhook Payload Example
```json
{
  "event": "load_posted",
  "timestamp": "2026-05-06T12:00:00Z",
  "load": {
    "id": "123LB_54321",
    "origin": "Chicago, IL",
    "destination": "Atlanta, GA",
    "weight": 50000,
    "rate": 3200,
    "equipment": "53ft Dry Van",
    "posted_at": "2026-05-06T12:00:00Z"
  }
}
```

### Endpoint Handler
```typescript
// apps/api/src/webhooks/123loadboard.ts
import { Router } from 'express';
import { verify123LBSignature } from '../middleware/verify-123lb-signature';

const router = Router();

router.post('/webhooks/123loadboard', verify123LBSignature, async (req, res) => {
  const { event, load } = req.body;
  
  try {
    switch (event) {
      case 'load_posted':
        await handleLoadPosted(load);
        break;
      case 'load_updated':
        await handleLoadUpdated(load);
        break;
      case 'load_removed':
        await handleLoadRemoved(load);
        break;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('123Loadboard webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
```

---

## 4. Webhook Signature Verification

All webhooks should be verified to ensure they come from the load board provider.

### Implementation
```typescript
// apps/api/src/middleware/verify-webhook-signature.ts
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function verifyDATSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers['x-dat-signature'] as string;
  const payload = JSON.stringify(req.body);
  const secret = process.env.DAT_API_KEY!;
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  if (hash !== signature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
}

export function verifyTruckStopSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers['x-truckstop-signature'] as string;
  const payload = JSON.stringify(req.body);
  const secret = process.env.TRUCKSTOP_API_KEY!;
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  if (hash !== signature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
}

export function verify123LBSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.headers['x-123lb-signature'] as string;
  const payload = JSON.stringify(req.body);
  const secret = process.env.LOADBOARD_API_KEY!;
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  if (hash !== signature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
}
```

---

## 5. Load Processing Pipeline

### Database Schema
```sql
CREATE TABLE loads (
  id VARCHAR(255) PRIMARY KEY,
  source VARCHAR(50),  -- 'DAT', 'TRUCKSTOP', '123LB'
  origin VARCHAR(255),
  destination VARCHAR(255),
  weight INT,
  rate INT,
  equipment VARCHAR(100),
  posted_at TIMESTAMP,
  updated_at TIMESTAMP,
  status VARCHAR(50),  -- 'available', 'accepted', 'removed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE load_events (
  id SERIAL PRIMARY KEY,
  load_id VARCHAR(255),
  event_type VARCHAR(50),  -- 'posted', 'updated', 'removed', 'accepted'
  payload JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (load_id) REFERENCES loads(id)
);
```

### Load Handler
```typescript
// apps/api/src/services/load-service.ts
import { db } from '../db';

export async function handleLoadPosted(load: any) {
  // Check if load already exists
  const existing = await db.loads.findUnique({
    where: { id: load.id }
  });
  
  if (!existing) {
    // Create new load
    await db.loads.create({
      data: {
        id: load.id,
        source: load.source,
        origin: load.origin,
        destination: load.destination,
        weight: load.weight,
        rate: load.rate,
        equipment: load.equipment,
        posted_at: new Date(load.posted_at),
        status: 'available'
      }
    });
    
    // Log event
    await db.loadEvents.create({
      data: {
        load_id: load.id,
        event_type: 'posted',
        payload: load
      }
    });
    
    // Notify subscribers
    await notifySubscribers('load_posted', load);
  }
}

export async function handleLoadUpdated(load: any) {
  await db.loads.update({
    where: { id: load.id },
    data: {
      origin: load.origin,
      destination: load.destination,
      weight: load.weight,
      rate: load.rate,
      equipment: load.equipment,
      updated_at: new Date()
    }
  });
  
  await db.loadEvents.create({
    data: {
      load_id: load.id,
      event_type: 'updated',
      payload: load
    }
  });
  
  await notifySubscribers('load_updated', load);
}

export async function handleLoadRemoved(load: any) {
  await db.loads.update({
    where: { id: load.id },
    data: { status: 'removed' }
  });
  
  await db.loadEvents.create({
    data: {
      load_id: load.id,
      event_type: 'removed',
      payload: load
    }
  });
  
  await notifySubscribers('load_removed', load);
}
```

---

## 6. Testing Webhooks

### Using curl
```bash
# Test DAT webhook
curl -X POST https://api.infamousfreight.com/webhooks/dat \
  -H "Content-Type: application/json" \
  -H "X-DAT-Signature: $(echo -n '{}' | openssl dgst -sha256 -hmac 'YOUR_SECRET' -hex)" \
  -d '{
    "event": "load_posted",
    "load": {
      "id": "DAT_TEST_123",
      "origin": "Los Angeles, CA",
      "destination": "Phoenix, AZ",
      "weight": 45000,
      "rate": 2500,
      "equipment": "53ft Dry Van"
    }
  }'
```

### Using Postman
1. Create new POST request
2. URL: `https://api.infamousfreight.com/webhooks/dat`
3. Headers:
   - `Content-Type: application/json`
   - `X-DAT-Signature: [calculated hash]`
4. Body (raw JSON): Webhook payload
5. Send and verify response

---

## 7. Monitoring Webhooks

### Health Check
```typescript
// apps/api/src/routes/webhooks-status.ts
router.get('/webhooks/status', async (req, res) => {
  const stats = await db.loadEvents.groupBy({
    by: ['event_type'],
    _count: true
  });
  
  res.json({
    total_events: stats.reduce((sum, s) => sum + s._count, 0),
    by_type: stats,
    last_event: await db.loadEvents.findFirst({
      orderBy: { created_at: 'desc' }
    })
  });
});
```

### Alerting
Configure alerts in Sentry/DataDog for:
- Webhook delivery failures
- High error rates
- Missing webhooks (no events in 1 hour)

---

## 8. Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhooks not received | Check endpoint URL is accessible, verify firewall rules |
| Invalid signature errors | Verify API key is correct, check signature calculation |
| Duplicate loads | Implement idempotency with load ID deduplication |
| Rate limiting | Implement queue/batch processing for high-volume loads |
| Stale data | Set up periodic reconciliation with load board APIs |

---

## Next Steps

1. ✅ Configure DAT webhooks
2. ✅ Configure TruckStop webhooks
3. ✅ Configure 123Loadboard webhooks
4. ✅ Implement webhook handlers
5. ✅ Test all webhooks
6. ✅ Monitor webhook delivery
7. ✅ Set up alerts for failures
