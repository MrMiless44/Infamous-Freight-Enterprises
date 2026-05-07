import request from 'supertest';
import { createApp } from '../src/app';

describe('MVP quote-to-load workflow', () => {
  const tenantId = 'carrier-test-quote-to-load';
  const headers = {
    'x-tenant-id': tenantId,
    'x-user-role': 'dispatcher',
    'x-subscription-status': 'active',
  };

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  it('creates an approved quote request and converts it into a load', async () => {
    const app = createApp();

    const quoteResponse = await request(app)
      .post('/api/freight-operations/quoteRequests')
      .set(headers)
      .send({
        brokerName: 'Infamous Freight Test Shipper',
        originCity: 'Dallas',
        destCity: 'Atlanta',
        freightType: 'Dry Van',
        weight: 42000,
        pickupDate: '2026-05-01T10:00:00.000Z',
        deliveryDeadline: '2026-05-03T17:00:00.000Z',
        shipperRate: 2800,
        carrierCost: 2250,
        profitMargin: 550,
        status: 'approved',
      })
      .expect(201);

    expect(quoteResponse.body.data).toMatchObject({
      tenantId,
      brokerName: 'Infamous Freight Test Shipper',
      originCity: 'Dallas',
      destCity: 'Atlanta',
      status: 'approved',
    });

    const quoteId = quoteResponse.body.data.id;

    const conversionResponse = await request(app)
      .post(`/api/workflows/quotes/${quoteId}/convert-to-load`)
      .set(headers)
      .send({
        quoteStatus: 'converted',
        load: {
          brokerName: 'Infamous Freight Test Shipper',
          originCity: 'Dallas',
          originState: 'TX',
          originLat: 32.7767,
          originLng: -96.797,
          destCity: 'Atlanta',
          destState: 'GA',
          destLat: 33.749,
          destLng: -84.388,
          distance: 781,
          rate: 2800,
          ratePerMile: 3.59,
          equipmentType: 'Dry Van',
          weight: 42000,
          pickupDate: '2026-05-01T10:00:00.000Z',
          status: 'booked',
        },
      })
      .expect(201);

    expect(conversionResponse.body.data.quoteRequest).toMatchObject({
      id: quoteId,
      tenantId,
      status: 'converted',
    });

    expect(conversionResponse.body.data.load).toMatchObject({
      tenantId,
      quoteRequestId: quoteId,
      brokerName: 'Infamous Freight Test Shipper',
      originCity: 'Dallas',
      destCity: 'Atlanta',
      status: 'booked',
    });
  });

  it('does not convert a pending quote request into a load', async () => {
    const app = createApp();

    const quoteResponse = await request(app)
      .post('/api/freight-operations/quoteRequests')
      .set(headers)
      .send({
        brokerName: 'Infamous Freight Pending Shipper',
        originCity: 'Houston',
        destCity: 'Memphis',
        freightType: 'Reefer',
        weight: 36000,
        pickupDate: '2026-05-05T10:00:00.000Z',
        shipperRate: 1900,
        carrierCost: 1600,
        profitMargin: 300,
        status: 'pending',
      })
      .expect(201);

    const quoteId = quoteResponse.body.data.id;

    const conversionResponse = await request(app)
      .post(`/api/workflows/quotes/${quoteId}/convert-to-load`)
      .set(headers)
      .send({
        quoteStatus: 'converted',
        load: {
          brokerName: 'Infamous Freight Pending Shipper',
          originCity: 'Houston',
          originState: 'TX',
          originLat: 29.7604,
          originLng: -95.3698,
          destCity: 'Memphis',
          destState: 'TN',
          destLat: 35.1495,
          destLng: -90.049,
          distance: 567,
          rate: 1900,
          ratePerMile: 3.35,
          equipmentType: 'Reefer',
          weight: 36000,
          pickupDate: '2026-05-05T10:00:00.000Z',
          status: 'booked',
        },
      })
      .expect(409);

    expect(conversionResponse.body.error).toBe('quote_request_not_approved');

    const loadsResponse = await request(app)
      .get('/api/loads')
      .set(headers)
      .expect(200);

    expect(loadsResponse.body.data).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ quoteRequestId: quoteId }),
      ]),
    );

    const quoteRequestsResponse = await request(app)
      .get('/api/freight-operations/quoteRequests')
      .set(headers)
      .expect(200);

    const updatedQuote = quoteRequestsResponse.body.data.find(
      (quote: { id: string; status: string }) => quote.id === quoteId,
    );

    expect(updatedQuote).toEqual(
      expect.objectContaining({ id: quoteId, status: 'pending' }),
    );
  });

  it('returns customer-visible tracking without private rate data', async () => {
    const app = createApp();

    const loadResponse = await request(app)
      .post('/api/loads')
      .set(headers)
      .send({
        trackingNumber: 'IF-PUBLIC-1',
        brokerName: 'Summit Retail Group',
        originCity: 'Chicago',
        originState: 'IL',
        originLat: 41.8781,
        originLng: -87.6298,
        destCity: 'Dallas',
        destState: 'TX',
        destLat: 32.7767,
        destLng: -96.797,
        distance: 967,
        rate: 3200,
        ratePerMile: 3.31,
        equipmentType: 'Dry Van',
        weight: 24000,
        pickupDate: '2026-05-04T10:00:00.000Z',
        deliveryDate: '2026-05-06T17:00:00.000Z',
        status: 'booked',
        notes: 'Customer can see ETA only.',
      })
      .expect(201);

    await request(app)
      .post(`/api/workflows/loads/${loadResponse.body.data.id}/tracking-updates`)
      .set(headers)
      .send({
        status: 'in_transit',
        deliveryETA: '2026-05-06T16:30:00.000Z',
        publicNotes: 'Driver checked in and is on schedule.',
        internalNotes: 'Do not expose margin or carrier costs.',
      })
      .expect(201);

    const trackingResponse = await request(app)
      .get('/api/tracking/IF-PUBLIC-1')
      .expect(200);

    expect(trackingResponse.body.data).toMatchObject({
      trackingNumber: 'IF-PUBLIC-1',
      customer: 'Summit Retail Group',
      originCity: 'Chicago',
      destCity: 'Dallas',
      status: 'in_transit',
      notes: 'Driver checked in and is on schedule.',
    });
    expect(trackingResponse.body.data).not.toHaveProperty('rate');
    expect(trackingResponse.body.data).not.toHaveProperty('tenantId');
    expect(JSON.stringify(trackingResponse.body.data)).not.toContain('internalNotes');
  });
});
