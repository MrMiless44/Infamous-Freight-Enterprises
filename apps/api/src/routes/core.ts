import express, { Router } from 'express';
import { DataStore, FreightOperationResource } from '../data-store';
import { createAiUsageStore } from '../ai-usage';
import { createFreightWorkflowRouter } from '../freight-workflow-routes';
import { HttpError, wrapAsync, getRequiredTenantId, getRouteParam } from '../shared/http';

const FREIGHT_OPERATION_RESOURCES: FreightOperationResource[] = [
  'quoteRequests',
  'loadAssignments',
  'loadDispatches',
  'shipmentTracking',
  'deliveryConfirmations',
  'carrierPayments',
  'rateAgreements',
  'operationalMetrics',
  'loadBoardPosts',
];

function getFreightOperationResource(req: express.Request): FreightOperationResource {
  const resource = getRouteParam(req, 'resource');

  if (!FREIGHT_OPERATION_RESOURCES.includes(resource as FreightOperationResource)) {
    throw new HttpError(
      404,
      'freight_operation_resource_not_found',
      `Unsupported freight operation resource: ${resource}`,
    );
  }

  return resource as FreightOperationResource;
}

export function createCoreRoutes(
  dataStore: DataStore,
  protectedMiddleware: express.RequestHandler[],
): Router {
  const router = Router();
  const aiUsageStore = createAiUsageStore();

  router.post('/ai-usage/events', ...protectedMiddleware, wrapAsync(async (req, res) => {
    if (!req.body?.feature || typeof req.body.feature !== 'string') {
      throw new HttpError(400, 'ai_usage_feature_required', 'AI usage events require a feature string.');
    }

    const data = await aiUsageStore.record({
      ...req.body,
      carrierId: getRequiredTenantId(req),
    });

    res.status(201).json({ data });
  }));

  router.get('/ai-usage/summary', ...protectedMiddleware, wrapAsync(async (req, res) => {
    const data = await aiUsageStore.summarize(getRequiredTenantId(req));
    res.status(200).json({ data });
  }));

  router.get('/loads', ...protectedMiddleware, wrapAsync(async (req, res) => {
    const data = await dataStore.listLoads(getRequiredTenantId(req));
    res.status(200).json({ data, count: data.length });
  }));

  router.post('/loads', ...protectedMiddleware, wrapAsync(async (req, res) => {
    const data = await dataStore.createLoad(getRequiredTenantId(req), req.body);
    res.status(201).json({ data });
  }));

  router.get('/drivers', ...protectedMiddleware, wrapAsync(async (req, res) => {
    const data = await dataStore.listDrivers(getRequiredTenantId(req));
    res.status(200).json({ data, count: data.length });
  }));

  router.post('/drivers', ...protectedMiddleware, wrapAsync(async (req, res) => {
    const data = await dataStore.createDriver(getRequiredTenantId(req), req.body);
    res.status(201).json({ data });
  }));

  router.get('/shipments', ...protectedMiddleware, wrapAsync(async (req, res) => {
    const data = await dataStore.listShipments(getRequiredTenantId(req));
    res.status(200).json({ data, count: data.length });
  }));

  router.post('/shipments', ...protectedMiddleware, wrapAsync(async (req, res) => {
    const data = await dataStore.createShipment(getRequiredTenantId(req), req.body);
    res.status(201).json({ data });
  }));

  router.get('/freight-operations/:resource', ...protectedMiddleware, wrapAsync(async (req, res) => {
    const resource = getFreightOperationResource(req);
    const data = await dataStore.listFreightOperations(resource, getRequiredTenantId(req));
    res.status(200).json({ data, count: data.length });
  }));

  router.post('/freight-operations/:resource', ...protectedMiddleware, wrapAsync(async (req, res) => {
    const resource = getFreightOperationResource(req);
    const data = await dataStore.createFreightOperation(resource, getRequiredTenantId(req), req.body);
    res.status(201).json({ data });
  }));

  router.patch('/freight-operations/:resource/:id', ...protectedMiddleware, wrapAsync(async (req, res) => {
    const resource = getFreightOperationResource(req);
    const data = await dataStore.updateFreightOperation(
      resource,
      getRequiredTenantId(req),
      getRouteParam(req, 'id'),
      req.body,
    );
    res.status(200).json({ data });
  }));

  router.use('/workflows', ...protectedMiddleware, createFreightWorkflowRouter(dataStore));

  return router;
}
