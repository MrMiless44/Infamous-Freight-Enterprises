import request from 'supertest';
import { createApp } from '../src/app';

describe('quote intake workflow', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  const validQuotePayload = {
    name: 'Jane Shipper',
    email: 'jane@acmegoods.com',
    phone: '(555) 234-5678',
    company: 'Acme Goods LLC',
    originCity: 'Dallas',
    destCity: 'Atlanta',
    freightType: 'Dry Van',
    weight: 42000,
    pickupDate: '2026-06-01T08:00:00.000Z',
    notes: 'Fragile pallets — please handle with care',
  };

  it('accepts a valid public quote request and returns a lead record', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/leads/quote')
      .send(validQuotePayload)
      .expect(201);

    expect(response.body.data).toMatchObject({
      name: 'Jane Shipper',
      email: 'jane@acmegoods.com',
      company: 'Acme Goods LLC',
      originCity: 'Dallas',
      destCity: 'Atlanta',
      freightType: 'Dry Van',
      weight: 42000,
      source: 'quote-form',
      status: 'new',
    });

    expect(typeof response.body.data.id).toBe('string');
    expect(response.body.data.id.length).toBeGreaterThan(0);
    expect(typeof response.body.data.receivedAt).toBe('string');
  });

  it('rejects a quote request missing required fields', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/leads/quote')
      .send({
        name: 'Incomplete Lead',
        email: 'incomplete@example.com',
        // missing originCity, destCity, freightType, weight, pickupDate
      })
      .expect(400);

    expect(response.body.error).toBe('quote_lead_missing_fields');
  });

  it('rejects public lead submissions that fill honeypot fields', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/leads/quote')
      .send({ ...validQuotePayload, website: 'https://spam.example' })
      .expect(400);

    expect(response.body.error).toBe('lead_honeypot_rejected');
  });

  it('does not require authentication to submit a quote lead', async () => {
    const app = createApp();

    // Deliberate: no x-tenant-id or x-user-role headers
    const response = await request(app)
      .post('/api/leads/quote')
      .send(validQuotePayload)
      .expect(201);

    expect(response.body.data.status).toBe('new');
  });

  it('rejects invalid public shipment tracking numbers without authentication', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/public/shipments/invalid-tracking')
      .expect(400);

    expect(response.body.error).toBe('invalid_tracking_number');
  });

  it('returns a public not found response for valid but unknown tracking numbers', async () => {
    const app = createApp();

    const response = await request(app)
      .get('/api/public/shipments/IF-99999')
      .expect(404);

    expect(response.body.error).toBe('shipment_not_found');
  });

  it('accepts a demo booking lead', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/leads/demo')
      .send({
        name: 'Demo User',
        email: 'demo@carrier.com',
        company: 'Fast Trucking',
        fleetSize: '10-25',
      })
      .expect(201);

    expect(response.body.data).toMatchObject({
      email: 'demo@carrier.com',
      source: 'demo-request',
      status: 'new',
    });
  });

  it('rejects a demo lead missing email', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/leads/demo')
      .send({ name: 'No Email' })
      .expect(400);

    expect(response.body.error).toBe('demo_lead_missing_email');
  });

  it('accepts an exit-intent discount lead', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/leads/discount')
      .send({ email: 'savings@carrier.com', source: 'exit-intent' })
      .expect(201);

    expect(response.body.data).toMatchObject({
      email: 'savings@carrier.com',
      source: 'exit-intent',
      status: 'new',
    });
  });

  it('rejects a discount lead missing email', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/leads/discount')
      .send({})
      .expect(400);

    expect(response.body.error).toBe('discount_lead_missing_email');
  });

  it('rejects state-changing requests with cookies from untrusted origins', async () => {
    const app = createApp();

    const response = await request(app)
      .post('/api/leads/quote')
      .set('Cookie', 'session=test-session')
      .set('Origin', 'https://attacker.example')
      .send(validQuotePayload)
      .expect(403);

    expect(response.body.error).toBe('csrf_validation_failed');
  });

});
