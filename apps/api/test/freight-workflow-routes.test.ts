import express from 'express';
import request from 'supertest';
import { DataStore } from '../src/data-store';
import { createFreightWorkflowRouter } from '../src/freight-workflow-routes';

function createTestApp(dataStore: DataStore) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    req.tenantId = req.header('x-tenant-id') ?? undefined;
    next();
  });
  app.use('/api/workflows', createFreightWorkflowRouter(dataStore));
  return app;
}

describe('freight workflow routes', () => {
  it('returns exception_queue when any auto-advance guardrail fails', async () => {
    const dataStore = { logAiDecision: jest.fn().mockResolvedValue(undefined) } as unknown as DataStore;
    const app = createTestApp(dataStore);

    const response = await request(app)
      .post('/api/workflows/guardrails/evaluate-auto-advance')
      .set('x-tenant-id', 'tenant-1')
      .send({
        customerApproved: true,
        marginThresholdMet: true,
        carrierVerified: false,
        carrierComplianceAccepted: true,
        insuranceActive: true,
        commodityAllowed: true,
        loadValueWithinLimit: true,
        appointmentsConfirmed: true,
        rateConfirmationMatched: true,
        noFraudFlags: true,
      })
      .expect(200);

    expect(response.body.data.canAutoAdvance).toBe(false);
    expect(response.body.data.route).toBe('exception_queue');
    expect(response.body.data.failedChecks).toContain('carrierVerified');
    expect(response.body.data.failedChecks).toEqual(['carrierVerified']);
  });

  it('returns 400 when guardrail payload is incomplete', async () => {
    const dataStore = { logAiDecision: jest.fn().mockResolvedValue(undefined) } as unknown as DataStore;
    const app = createTestApp(dataStore);

    const response = await request(app)
      .post('/api/workflows/guardrails/evaluate-auto-advance')
      .set('x-tenant-id', 'tenant-1')
      .send({ customerApproved: true })
      .expect(400);

    expect(response.body.error).toBe('invalid_guardrail_payload');
  });

  it('returns auto when all auto-advance guardrails pass', async () => {
    const dataStore = { logAiDecision: jest.fn().mockResolvedValue(undefined) } as unknown as DataStore;
    const app = createTestApp(dataStore);

    const response = await request(app)
      .post('/api/workflows/guardrails/evaluate-auto-advance')
      .set('x-tenant-id', 'tenant-1')
      .send({
        customerApproved: true,
        marginThresholdMet: true,
        carrierVerified: true,
        carrierComplianceAccepted: true,
        insuranceActive: true,
        commodityAllowed: true,
        loadValueWithinLimit: true,
        appointmentsConfirmed: true,
        rateConfirmationMatched: true,
        noFraudFlags: true,
      })
      .expect(200);

    expect(response.body.data.canAutoAdvance).toBe(true);
    expect(response.body.data.route).toBe('auto');
    expect(response.body.data.failedChecks).toEqual([]);
  });

  it('returns 409 when a quote is not approved before load conversion', async () => {
    const dataStore = {
      listFreightOperations: jest.fn().mockResolvedValue([
        { id: 'quote-1', tenantId: 'tenant-1', status: 'pending' },
      ]),
      convertQuoteToLoad: jest.fn(),
    } as unknown as DataStore;

    const app = createTestApp(dataStore);

    const response = await request(app)
      .post('/api/workflows/quotes/quote-1/convert-to-load')
      .set('x-tenant-id', 'tenant-1')
      .send({ quoteStatus: 'converted', load: { status: 'booked' } })
      .expect(409);

    expect(response.body.error).toBe('quote_request_not_approved');
    expect(dataStore.convertQuoteToLoad).not.toHaveBeenCalled();
  });

  it('converts an approved quote into a load', async () => {
    const dataStore = {
      listFreightOperations: jest.fn().mockResolvedValue([
        { id: 'quote-1', tenantId: 'tenant-1', status: 'approved' },
      ]),
      convertQuoteToLoad: jest.fn().mockResolvedValue({
        quoteRequest: { id: 'quote-1', status: 'converted' },
        load: { id: 'load-1', quoteRequestId: 'quote-1' },
      }),
    } as unknown as DataStore;

    const app = createTestApp(dataStore);

    const response = await request(app)
      .post('/api/workflows/quotes/quote-1/convert-to-load')
      .set('x-tenant-id', 'tenant-1')
      .send({ quoteStatus: 'converted', load: { status: 'booked' } })
      .expect(201);

    expect(dataStore.convertQuoteToLoad).toHaveBeenCalledWith(
      'tenant-1',
      'quote-1',
      { quoteStatus: 'converted', load: { status: 'booked' } },
    );
    expect(response.body.data.load).toEqual({ id: 'load-1', quoteRequestId: 'quote-1' });
  });
});
