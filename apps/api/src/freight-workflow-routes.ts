import { Router, Request, Response, NextFunction } from 'express';
import {
  DataStore,
  LoadAssignmentDecision,
} from './data-store';
import {
  FreightWorkflowRuleError,
  assertQuoteCanConvertToLoad,
  assertAssignmentCanTransition,
  assertDispatchCanConfirm,
  assertLoadCanReceiveTracking,
  assertPaymentCanTransition,
  assertLoadBoardPostCanTransition,
} from './freight-workflow-rules';

class FreightWorkflowHttpError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

type TenantRequest = Request & {
  tenantId?: string;
};

function wrapAsync(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

function getRequiredTenantId(req: TenantRequest): string {
  if (!req.tenantId) {
    throw new FreightWorkflowHttpError(
      400,
      'tenant_id_required',
      'Provide tenantId via the x-tenant-id header.',
    );
  }

  return req.tenantId;
}

function getRouteParam(req: Request, name: string): string {
  const value = req.params[name];

  if (Array.isArray(value)) {
    if (typeof value[0] === 'string' && value[0].length > 0) {
      return value[0];
    }
  } else if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  throw new FreightWorkflowHttpError(
    400,
    'route_param_required',
    `Route parameter ${name} is required.`,
  );
}

function getLoadAssignmentDecision(req: Request): LoadAssignmentDecision {
  const decision = getRouteParam(req, 'decision');

  if (decision !== 'accepted' && decision !== 'rejected') {
    throw new FreightWorkflowHttpError(
      400,
      'invalid_load_assignment_decision',
      'Load assignment decision must be accepted or rejected.',
    );
  }

  return decision;
}

export function createFreightWorkflowRouter(dataStore: DataStore): Router {
  const router = Router();

  router.post('/quotes/:id/convert-to-load', wrapAsync(async (req: TenantRequest, res) => {
    const tenantId = getRequiredTenantId(req);
    const quoteId = getRouteParam(req, 'id');
    const quoteRequests = await dataStore.listFreightOperations('quoteRequests', tenantId);
    const quoteRequest = quoteRequests.find((item) => item.id === quoteId);

    if (!quoteRequest) {
      throw new FreightWorkflowHttpError(
        404,
        'quote_request_not_found',
        'Quote request was not found for this tenant.',
      );
    }

    assertQuoteCanConvertToLoad({ status: quoteRequest.status });

    const data = await dataStore.convertQuoteToLoad(tenantId, quoteId, req.body);
    res.status(201).json({ data });
  }));

  router.post('/load-assignments/:id/:decision', wrapAsync(async (req: TenantRequest, res) => {
    const tenantId = getRequiredTenantId(req);
    const assignmentId = getRouteParam(req, 'id');
    const decision = getLoadAssignmentDecision(req);
    const assignments = await dataStore.listFreightOperations('loadAssignments', tenantId);
    const assignment = assignments.find((item) => item.id === assignmentId);
    if (assignment) {
      assertAssignmentCanTransition(assignment, decision);
    }
    const data = await dataStore.respondToLoadAssignment(tenantId, assignmentId, decision, req.body);
    res.status(200).json({ data });
  }));

  router.post('/dispatches/:id/confirm', wrapAsync(async (req: TenantRequest, res) => {
    const tenantId = getRequiredTenantId(req);
    const dispatchId = getRouteParam(req, 'id');
    const dispatches = await dataStore.listFreightOperations('loadDispatches', tenantId);
    const dispatch = dispatches.find((item) => item.id === dispatchId);
    if (dispatch) {
      assertDispatchCanConfirm(dispatch);
    }
    const data = await dataStore.confirmDispatch(tenantId, dispatchId, req.body);
    res.status(200).json({ data });
  }));

  router.post('/loads/:loadId/tracking-updates', wrapAsync(async (req: TenantRequest, res) => {
    const tenantId = getRequiredTenantId(req);
    const loadId = getRouteParam(req, 'loadId');
    const trackingRecords = await dataStore.listFreightOperations('shipmentTracking', tenantId);
    const latest = trackingRecords.find((item) => item.loadId === loadId);
    assertLoadCanReceiveTracking(latest ?? null);
    const data = await dataStore.recordTrackingUpdate(tenantId, loadId, req.body);
    res.status(201).json({ data });
  }));

  router.post('/loads/:loadId/verify-delivery', wrapAsync(async (req: TenantRequest, res) => {
    const tenantId = getRequiredTenantId(req);
    const loadId = getRouteParam(req, 'loadId');
    const trackingRecords = await dataStore.listFreightOperations('shipmentTracking', tenantId);
    const latest = trackingRecords.find((item) => item.loadId === loadId);
    assertLoadCanReceiveTracking(latest ?? null);
    const data = await dataStore.verifyDelivery(tenantId, loadId, req.body);
    res.status(201).json({ data });
  }));

  router.post('/carrier-payments/:id/status', wrapAsync(async (req: TenantRequest, res) => {
    const tenantId = getRequiredTenantId(req);
    const paymentId = getRouteParam(req, 'id');
    const payments = await dataStore.listFreightOperations('carrierPayments', tenantId);
    const payment = payments.find((item) => item.id === paymentId);
    if (payment) {
      assertPaymentCanTransition(payment);
    }
    const data = await dataStore.updateCarrierPaymentStatus(tenantId, paymentId, req.body);
    res.status(200).json({ data });
  }));

  router.post('/operational-metrics/rollup', wrapAsync(async (req: TenantRequest, res) => {
    const data = await dataStore.rollupOperationalMetrics(getRequiredTenantId(req), req.body);
    res.status(201).json({ data });
  }));

  router.post('/load-board-posts/:id/status', wrapAsync(async (req: TenantRequest, res) => {
    const tenantId = getRequiredTenantId(req);
    const postId = getRouteParam(req, 'id');
    const posts = await dataStore.listFreightOperations('loadBoardPosts', tenantId);
    const post = posts.find((item) => item.id === postId);
    if (post) {
      assertLoadBoardPostCanTransition(post);
    }
    const data = await dataStore.updateLoadBoardPostStatus(tenantId, postId, req.body);
    res.status(200).json({ data });
  }));

  router.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof FreightWorkflowRuleError) {
      return res.status(409).json({
        error: err.code,
        message: err.message,
      });
    }

    if (err instanceof FreightWorkflowHttpError) {
      return res.status(err.statusCode).json({
        error: err.code,
        message: err.message,
      });
    }

    next(err);
  });

  return router;
}
