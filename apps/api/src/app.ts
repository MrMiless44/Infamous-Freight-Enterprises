import cors from 'cors';
import helmet from 'helmet';
import { createHmac, timingSafeEqual, randomUUID } from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import {
  createDataStore,
  DataStore,
  FreightOperationResource,
} from './data-store';
import {
  BillingInterval,
  BillingPlan,
  createStripeBillingPortalSession,
  createStripeCheckoutSession,
  createStripeOneTimeCheckoutSession,
  getBillingSyncFromStripeEvent,
  getStripeOneTimePaymentFromStripeEvent,
  getStripeWebhookSecret,
  isOneTimePurchaseType,
  OneTimePurchaseType,
  ONE_TIME_PURCHASE_TYPES,
  StripeEvent,
  verifyStripeWebhookSignature,
} from './billing';
import { createAiUsageStore } from './ai-usage';
import { createRateLimitMiddleware } from './rate-limit';
import { createStripeWebhookEventStore } from './stripe-webhook-events';
import { createStripeOneTimePaymentStore } from './stripe-one-time-payments';
import { createFreightWorkflowRouter } from './freight-workflow-routes';

type Role = 'owner' | 'admin' | 'dispatcher';
type SubscriptionStatus = 'active' | 'trialing' | 'trial' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'none';
type AuthMode = 'header' | 'trusted';

type TrustedAuthContext = {
  userId: string;
  tenantId: string;
  role: Role;
};

type JwtClaims = {
  sub?: unknown;
  exp?: unknown;
  nbf?: unknown;
  aud?: unknown;
  tenant_id?: unknown;
  tenantId?: unknown;
  carrier_id?: unknown;
  carrierId?: unknown;
  role?: unknown;
  user_role?: unknown;
  app_metadata?: {
    tenant_id?: unknown;
    tenantId?: unknown;
    carrier_id?: unknown;
    carrierId?: unknown;
    role?: unknown;
    user_role?: unknown;
  };
  user_metadata?: {
    tenant_id?: unknown;
    tenantId?: unknown;
    carrier_id?: unknown;
    carrierId?: unknown;
    role?: unknown;
    user_role?: unknown;
  };
};

type HealthResponse = {
  status: 'ok' | 'degraded';
  timestamp: string;
  services: {
    api?: 'running';
    database?: 'connected' | 'disconnected';
  };
};

const ALLOWED_ROLES: Role[] = ['owner', 'admin', 'dispatcher'];
const BILLING_ROLES: Role[] = ['owner', 'admin'];
const BILLING_PLANS: BillingPlan[] = ['starter', 'professional', 'enterprise'];
const BILLING_INTERVALS: BillingInterval[] = ['month', 'year'];
const PAID_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ['active', 'trialing', 'trial'];
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

class HttpError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production';
}

function getAuthMode(): AuthMode {
  const configured = process.env.AUTH_MODE?.trim().toLowerCase();

  if (configured === 'header' || configured === 'trusted') {
    return configured;
  }

  return isProductionRuntime() ? 'trusted' : 'header';
}

function assertSafeAuthConfiguration() {
  if (
    isProductionRuntime() &&
    getAuthMode() === 'header' &&
    process.env.ALLOW_UNSAFE_HEADER_AUTH !== 'true'
  ) {
    throw new Error('AUTH_MODE=header is not allowed in production without ALLOW_UNSAFE_HEADER_AUTH=true.');
  }

  if (isProductionRuntime() && getAuthMode() === 'trusted' && !getJwtVerificationSecret()) {
    throw new Error('SUPABASE_JWT_SECRET or JWT_SECRET is required when production AUTH_MODE=trusted.');
  }
}

function getJwtVerificationSecret(): string | null {
  const secret = process.env.SUPABASE_JWT_SECRET ?? process.env.JWT_SECRET;
  const trimmed = secret?.trim();

  return trimmed && !trimmed.startsWith('<') ? trimmed : null;
}

function decodeBase64UrlJson(value: string): Record<string, unknown> | null {
  try {
    return JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function verifyJwtSignature(token: string, secret: string, signature: string): boolean {
  const expected = createHmac('sha256', secret)
    .update(token)
    .digest('base64url');
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
}

function getStringClaim(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function getRoleClaim(...values: unknown[]): Role | null {
  const role = getStringClaim(...values);

  return role && ALLOWED_ROLES.includes(role as Role) ? (role as Role) : null;
}

function audienceMatches(claims: JwtClaims): boolean {
  const expectedAudience = process.env.AUTH_JWT_AUDIENCE?.trim() || process.env.SUPABASE_JWT_AUDIENCE?.trim();

  if (!expectedAudience) {
    return true;
  }

  if (typeof claims.aud === 'string') {
    return claims.aud === expectedAudience;
  }

  if (Array.isArray(claims.aud)) {
    return claims.aud.includes(expectedAudience);
  }

  return false;
}

function getTrustedAuthContextFromJwt(token: string): TrustedAuthContext | null {
  const secret = getJwtVerificationSecret();

  if (!secret) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedClaims, signature] = parts;
  const header = decodeBase64UrlJson(encodedHeader);
  const claims = decodeBase64UrlJson(encodedClaims) as JwtClaims | null;

  if (!header || !claims || header.alg !== 'HS256') {
    return null;
  }

  if (!verifyJwtSignature(`${encodedHeader}.${encodedClaims}`, secret, signature)) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof claims.exp === 'number' && claims.exp <= now) {
    return null;
  }

  if (typeof claims.nbf === 'number' && claims.nbf > now) {
    return null;
  }

  if (!audienceMatches(claims)) {
    return null;
  }

  const userId = getStringClaim(claims.sub);
  const tenantId = getStringClaim(
    claims.app_metadata?.tenant_id,
    claims.app_metadata?.tenantId,
    claims.app_metadata?.carrier_id,
    claims.app_metadata?.carrierId,
    claims.user_metadata?.tenant_id,
    claims.user_metadata?.tenantId,
    claims.user_metadata?.carrier_id,
    claims.user_metadata?.carrierId,
    claims.tenant_id,
    claims.tenantId,
    claims.carrier_id,
    claims.carrierId,
  );
  const role = getRoleClaim(
    claims.app_metadata?.role,
    claims.app_metadata?.user_role,
    claims.user_metadata?.role,
    claims.user_metadata?.user_role,
    claims.user_role,
    claims.role,
  );

  if (!userId || !tenantId || !role) {
    return null;
  }

  return { userId, tenantId, role };
}

function authenticateBearerToken(req: Request, _res: Response, next: NextFunction) {
  const [scheme, token] = (req.header('authorization') ?? '').split(/\s+/, 2);

  if (scheme?.toLowerCase() === 'bearer' && token) {
    const trustedAuth = getTrustedAuthContextFromJwt(token);
    if (trustedAuth) {
      req.authenticatedUser = trustedAuth;
    }
  }

  next();
}

function getTrustedAuthContext(req: Request): TrustedAuthContext | null {
  if (!req.authenticatedUser) {
    return null;
  }

  const { userId, tenantId, role } = req.authenticatedUser;

  if (
    typeof userId !== 'string' ||
    userId.trim().length === 0 ||
    typeof tenantId !== 'string' ||
    tenantId.trim().length === 0 ||
    !ALLOWED_ROLES.includes(role)
  ) {
    return null;
  }

  return {
    userId: userId.trim(),
    tenantId: tenantId.trim(),
    role,
  };
}

function getTenantId(req: Request): string | null {
  const trustedAuth = getTrustedAuthContext(req);

  if (trustedAuth) {
    return trustedAuth.tenantId;
  }

  if (getAuthMode() !== 'header') {
    return null;
  }

  const tenantHeader = req.header('x-tenant-id')?.trim();

  return tenantHeader || null;
}

function requireTenant(req: Request, res: Response, next: NextFunction) {
  const tenantId = getTenantId(req);

  if (!tenantId) {
    const trustedMode = getAuthMode() === 'trusted';

    return res.status(trustedMode ? 401 : 400).json({
      error: trustedMode ? 'authentication_required' : 'tenant_id_required',
      message: trustedMode
        ? 'A verified authenticated user is required for this endpoint.'
        : 'Provide tenantId via the x-tenant-id header.',
      requestId: req.requestId,
    });
  }

  req.tenantId = tenantId;
  next();
}

function requireRole(req: Request, res: Response, next: NextFunction) {
  const trustedAuth = getTrustedAuthContext(req);

  if (trustedAuth) {
    req.userRole = trustedAuth.role;
    return next();
  }

  if (getAuthMode() !== 'header') {
    return res.status(401).json({
      error: 'authentication_required',
      message: 'A verified authenticated user is required for this endpoint.',
      requestId: req.requestId,
    });
  }

  const role = req.header('x-user-role');

  if (!role || !ALLOWED_ROLES.includes(role as Role)) {
    return res.status(403).json({
      error: 'forbidden',
      message: 'A valid x-user-role is required for this endpoint.',
      requestId: req.requestId,
    });
  }

  req.userRole = role as Role;
  next();
}

function requireBillingRole(req: Request, res: Response, next: NextFunction) {
  if (!req.userRole || !BILLING_ROLES.includes(req.userRole)) {
    return res.status(403).json({
      error: 'billing_forbidden',
      message: 'Billing actions require owner or admin access.',
      requestId: req.requestId,
    });
  }

  next();
}

function normalizeSubscriptionStatus(status: unknown): SubscriptionStatus {
  if (typeof status !== 'string') {
    return 'none';
  }

  const normalized = status.trim().toLowerCase();

  if (
    normalized === 'active' ||
    normalized === 'trialing' ||
    normalized === 'trial' ||
    normalized === 'past_due' ||
    normalized === 'unpaid' ||
    normalized === 'canceled' ||
    normalized === 'incomplete' ||
    normalized === 'none'
  ) {
    return normalized;
  }

  return 'none';
}

function allowClientSubscriptionStatusHeader(): boolean {
  return process.env.NODE_ENV === 'test' || process.env.ALLOW_CLIENT_SUBSCRIPTION_STATUS_HEADER === 'true';
}

function getHeaderSubscriptionStatus(req: Request): SubscriptionStatus {
  const defaultStatus =
    process.env.DEFAULT_SUBSCRIPTION_STATUS ??
    (process.env.NODE_ENV === 'test' ? 'active' : 'none');

  return normalizeSubscriptionStatus(
    req.header('x-subscription-status') ??
    req.header('x-billing-status') ??
    req.header('x-carrier-subscription-status') ??
    defaultStatus,
  );
}

function createRequirePaidSubscription(dataStore: DataStore) {
  return (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      const tenantId = getRequiredTenantId(req);
      const storedStatus = await dataStore.getCarrierSubscriptionStatus(tenantId);
      const subscriptionStatus = storedStatus
        ? normalizeSubscriptionStatus(storedStatus)
        : allowClientSubscriptionStatusHeader()
          ? getHeaderSubscriptionStatus(req)
          : 'none';

      if (!PAID_SUBSCRIPTION_STATUSES.includes(subscriptionStatus)) {
        return res.status(402).json({
          error: 'payment_required',
          message: 'An active subscription or trial is required to access this resource.',
          billingUrl: '/billing',
          subscriptionStatus,
          requestId: req.requestId,
        });
      }

      req.subscriptionStatus = subscriptionStatus;
      next();
    })().catch(next);
  };
}

function initializeSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0,
  });
}

function getAllowedCorsOrigins(): string[] {
  return (process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

const CSRF_SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function isTrustedBrowserOrigin(req: Request, allowedOrigins: string[]): boolean {
  const trustedOrigins = allowedOrigins.length
    ? allowedOrigins
    : [`${req.protocol}://${req.get('host') ?? ''}`];

  const origin = req.get('origin');
  if (origin) {
    return trustedOrigins.includes(origin);
  }

  const referer = req.get('referer');
  if (!referer) return false;

  try {
    return trustedOrigins.includes(new URL(referer).origin);
  } catch {
    return false;
  }
}

function csrfProtectionMiddleware(allowedOrigins: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (CSRF_SAFE_METHODS.has(req.method.toUpperCase())) {
      return next();
    }

    if (req.path === '/api/billing/webhook') {
      return next();
    }

    const hasBrowserSessionCookies = Boolean(req.headers.cookie);
    if (!hasBrowserSessionCookies) {
      return next();
    }

    if (isTrustedBrowserOrigin(req, allowedOrigins)) {
      return next();
    }

    return res.status(403).json({
      error: 'csrf_validation_failed',
      message: 'Request origin validation failed.',
      requestId: req.requestId,
    });
  };
}

function wrapAsync(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

function getRequiredTenantId(req: Request): string {
  if (!req.tenantId) {
    throw new HttpError(
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

  throw new HttpError(
    400,
    'route_param_required',
    `Route parameter ${name} is required.`,
  );
}

function getFreightOperationResource(req: Request): FreightOperationResource {
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

function getCheckoutPlan(req: Request): BillingPlan {
  const plan = req.body?.plan;

  if (!BILLING_PLANS.includes(plan)) {
    throw new HttpError(400, 'invalid_billing_plan', 'Billing plan must be starter, professional, or enterprise.');
  }

  return plan;
}

function getCheckoutInterval(req: Request): BillingInterval {
  const billingInterval = req.body?.billingInterval ?? 'month';

  if (!BILLING_INTERVALS.includes(billingInterval)) {
    throw new HttpError(400, 'invalid_billing_interval', 'Billing interval must be month or year.');
  }

  return billingInterval;
}

function getOneTimePurchaseType(req: Request): OneTimePurchaseType | undefined {
  const purchaseType = req.body?.purchaseType;

  if (purchaseType === undefined || purchaseType === null || purchaseType === '') {
    return undefined;
  }

  if (!isOneTimePurchaseType(purchaseType)) {
    throw new HttpError(
      400,
      'invalid_one_time_purchase_type',
      `purchaseType must be one of: ${ONE_TIME_PURCHASE_TYPES.join(', ')}.`,
    );
  }

  return purchaseType;
}

function hasLeadHoneypotValue(body: unknown): boolean {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const record = body as Record<string, unknown>;
  const value = record.website ?? record.url ?? record.companyWebsite;

  return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !Number.isNaN(Date.parse(value));
}

function getCarrierIdFromBillingSync(billingSync: ReturnType<typeof getBillingSyncFromStripeEvent>): string | null {
  return billingSync?.carrierId ?? null;
}

function createLivenessResponse(): HealthResponse {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: { api: 'running' },
  };
}

function assignRequestId(req: Request, res: Response, next: NextFunction) {
  const requestId = req.header('x-request-id')?.trim() || randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

function createTopLevelHealthResponse(readiness: HealthResponse): HealthResponse {
  return {
    ...readiness,
    status: 'ok',
    services: {
      api: 'running',
      ...readiness.services,
    },
  };
}

async function createReadinessResponse(dataStore: DataStore): Promise<{ statusCode: number; body: HealthResponse }> {
  const database = await dataStore.healthCheck();
  const status = database === 'connected' ? 'ok' : 'degraded';

  return {
    statusCode: status === 'ok' ? 200 : 503,
    body: {
      status,
      timestamp: new Date().toISOString(),
      services: { database },
    },
  };
}

function registerWebhookRoute(app: express.Express, dataStore: DataStore) {
  const webhookEvents = createStripeWebhookEventStore();
  const oneTimePayments = createStripeOneTimePaymentStore();

  app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), wrapAsync(async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body ?? {}));
    const signature = req.header('stripe-signature');

    if (!verifyStripeWebhookSignature(rawBody, signature, getStripeWebhookSecret())) {
      res.status(400).json({ error: 'invalid_stripe_signature' });
      return;
    }

    const event = JSON.parse(rawBody.toString('utf8')) as StripeEvent;
    const billingSync = getBillingSyncFromStripeEvent(event);
    const oneTimePayment = getStripeOneTimePaymentFromStripeEvent(event);
    const carrierId = getCarrierIdFromBillingSync(billingSync) ?? oneTimePayment?.carrierId ?? null;

    await webhookEvents.upsert({
      eventId: event.id,
      eventType: event.type,
      carrierId,
      status: 'received',
    });

    try {
      if (oneTimePayment) {
        await oneTimePayments.upsert(oneTimePayment);
      }

      if (billingSync) {
        const synced = await dataStore.syncCarrierBilling(billingSync);
        await webhookEvents.upsert({
          eventId: event.id,
          eventType: event.type,
          carrierId,
          status: synced ? 'processed' : 'ignored',
          processedAt: new Date(),
        });
      } else if (oneTimePayment) {
        await webhookEvents.upsert({
          eventId: event.id,
          eventType: event.type,
          carrierId,
          status: 'processed',
          processedAt: new Date(),
        });
      } else {
        await webhookEvents.upsert({
          eventId: event.id,
          eventType: event.type,
          carrierId,
          status: 'ignored',
          processedAt: new Date(),
        });
      }
    } catch (error) {
      await webhookEvents.upsert({
        eventId: event.id,
        eventType: event.type,
        carrierId,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown webhook processing error',
        processedAt: new Date(),
      });
      throw error;
    }

    res.status(200).json({ received: true });
  }));
}

function registerRoutes(app: express.Express, dataStore: DataStore) {
  const aiUsageStore = createAiUsageStore();

  // Public lead intake endpoints — no authentication required
  app.post('/api/leads/quote', wrapAsync(async (req, res) => {
    if (hasLeadHoneypotValue(req.body)) {
      throw new HttpError(400, 'lead_honeypot_rejected', 'Lead submission was rejected.');
    }

    const { name, email, originCity, destCity, freightType, weight, pickupDate } = req.body ?? {};

    const missing: string[] = [];
    if (!name || typeof name !== 'string') missing.push('name');
    if (!isValidEmail(email)) missing.push('email');
    if (!originCity || typeof originCity !== 'string') missing.push('originCity');
    if (!destCity || typeof destCity !== 'string') missing.push('destCity');
    if (!freightType || typeof freightType !== 'string') missing.push('freightType');
    if (weight === undefined || weight === null || isNaN(parseFloat(String(weight)))) missing.push('weight');
    if (!isValidDateString(pickupDate)) missing.push('pickupDate');

    if (missing.length > 0) {
      throw new HttpError(
        400,
        'quote_lead_missing_fields',
        `Missing required fields: ${missing.join(', ')}.`,
      );
    }

    const data = await dataStore.submitQuoteLead({ ...req.body, source: 'quote-form' });
    res.status(201).json({ data });
  }));

  app.post('/api/leads/demo', wrapAsync(async (req, res) => {
    if (hasLeadHoneypotValue(req.body)) {
      throw new HttpError(400, 'lead_honeypot_rejected', 'Lead submission was rejected.');
    }

    const { name, email } = req.body ?? {};

    if (!isValidEmail(email)) {
      throw new HttpError(400, 'demo_lead_missing_email', 'email is required.');
    }

    const data = await dataStore.submitQuoteLead({
      ...req.body,
      name: name ?? '',
      originCity: '',
      destCity: '',
      freightType: '',
      weight: 0,
      pickupDate: '',
      source: 'demo-request',
    });
    res.status(201).json({ data });
  }));

  app.post('/api/leads/discount', wrapAsync(async (req, res) => {
    if (hasLeadHoneypotValue(req.body)) {
      throw new HttpError(400, 'lead_honeypot_rejected', 'Lead submission was rejected.');
    }

    const { email } = req.body ?? {};

    if (!isValidEmail(email)) {
      throw new HttpError(400, 'discount_lead_missing_email', 'email is required.');
    }

    const data = await dataStore.submitQuoteLead({
      ...req.body,
      name: '',
      originCity: '',
      destCity: '',
      freightType: '',
      weight: 0,
      pickupDate: '',
      source: req.body?.source ?? 'exit-intent',
    });
    res.status(201).json({ data });
  }));

  app.get('/api/billing/status', requireTenant, requireRole, wrapAsync(async (req, res) => {
    const stripeCustomerId = await dataStore.getCarrierStripeCustomerId(getRequiredTenantId(req));
    res.status(200).json({
      data: {
        stripeCustomerId,
        hasStripeCustomer: Boolean(stripeCustomerId),
      },
    });
  }));

  app.post('/api/billing/checkout-session', requireTenant, requireRole, requireBillingRole, wrapAsync(async (req, res) => {
    const carrierId = getRequiredTenantId(req);
    const stripeCustomerId = await dataStore.getCarrierStripeCustomerId(carrierId);

    if (stripeCustomerId) {
      throw new HttpError(
        409,
        'stripe_customer_already_linked',
        'This carrier already has a Stripe customer. Use the Customer Portal to change billing.',
      );
    }

    const url = await createStripeCheckoutSession({
      carrierId,
      stripeCustomerId,
      plan: getCheckoutPlan(req),
      billingInterval: getCheckoutInterval(req),
    });

    res.status(200).json({ data: { url } });
  }));

  app.post('/api/billing/one-time-checkout-session', requireTenant, requireRole, requireBillingRole, wrapAsync(async (req, res) => {
    const carrierId = getRequiredTenantId(req);
    const purchaseType = getOneTimePurchaseType(req);
    const stripeCustomerId = await dataStore.getCarrierStripeCustomerId(carrierId);

    if (!stripeCustomerId) {
      throw new HttpError(
        404,
        'stripe_customer_not_found',
        'A linked Stripe customer is required before purchasing one-time add-ons.',
      );
    }

    const url = await createStripeOneTimeCheckoutSession({
      carrierId,
      stripeCustomerId,
      purchaseType,
    });

    res.status(200).json({ data: { url } });
  }));

  app.post('/api/billing/customer-portal', requireTenant, requireRole, requireBillingRole, wrapAsync(async (req, res) => {
    const stripeCustomerId = await dataStore.getCarrierStripeCustomerId(getRequiredTenantId(req));

    if (!stripeCustomerId) {
      throw new HttpError(
        404,
        'stripe_customer_not_found',
        'No Stripe customer is linked to this carrier yet.',
      );
    }

    const url = await createStripeBillingPortalSession(stripeCustomerId);
    res.status(200).json({ data: { url } });
  }));

  const protectedApi = [requireTenant, requireRole, createRequirePaidSubscription(dataStore)];

  app.post('/api/ai-usage/events', ...protectedApi, wrapAsync(async (req, res) => {
    if (!req.body?.feature || typeof req.body.feature !== 'string') {
      throw new HttpError(400, 'ai_usage_feature_required', 'AI usage events require a feature string.');
    }

    const data = await aiUsageStore.record({
      ...req.body,
      carrierId: getRequiredTenantId(req),
    });

    res.status(201).json({ data });
  }));

  app.get('/api/ai-usage/summary', ...protectedApi, wrapAsync(async (req, res) => {
    const data = await aiUsageStore.summarize(getRequiredTenantId(req));
    res.status(200).json({ data });
  }));

  app.get('/api/loads', ...protectedApi, wrapAsync(async (req, res) => {
    const data = await dataStore.listLoads(getRequiredTenantId(req));
    res.status(200).json({ data, count: data.length });
  }));

  app.post('/api/loads', ...protectedApi, wrapAsync(async (req, res) => {
    const data = await dataStore.createLoad(getRequiredTenantId(req), req.body);
    res.status(201).json({ data });
  }));

  app.get('/api/drivers', ...protectedApi, wrapAsync(async (req, res) => {
    const data = await dataStore.listDrivers(getRequiredTenantId(req));
    res.status(200).json({ data, count: data.length });
  }));

  app.post('/api/drivers', ...protectedApi, wrapAsync(async (req, res) => {
    const data = await dataStore.createDriver(getRequiredTenantId(req), req.body);
    res.status(201).json({ data });
  }));

  app.get('/api/shipments', ...protectedApi, wrapAsync(async (req, res) => {
    const data = await dataStore.listShipments(getRequiredTenantId(req));
    res.status(200).json({ data, count: data.length });
  }));

  app.post('/api/shipments', ...protectedApi, wrapAsync(async (req, res) => {
    const data = await dataStore.createShipment(getRequiredTenantId(req), req.body);
    res.status(201).json({ data });
  }));

  app.get('/api/freight-operations/:resource', ...protectedApi, wrapAsync(async (req, res) => {
    const resource = getFreightOperationResource(req);
    const data = await dataStore.listFreightOperations(resource, getRequiredTenantId(req));
    res.status(200).json({ data, count: data.length });
  }));

  app.post('/api/freight-operations/:resource', ...protectedApi, wrapAsync(async (req, res) => {
    const resource = getFreightOperationResource(req);
    const data = await dataStore.createFreightOperation(resource, getRequiredTenantId(req), req.body);
    res.status(201).json({ data });
  }));

  app.patch('/api/freight-operations/:resource/:id', ...protectedApi, wrapAsync(async (req, res) => {
    const resource = getFreightOperationResource(req);
    const data = await dataStore.updateFreightOperation(
      resource,
      getRequiredTenantId(req),
      getRouteParam(req, 'id'),
      req.body,
    );
    res.status(200).json({ data });
  }));

  app.use('/api/workflows', ...protectedApi, createFreightWorkflowRouter(dataStore));
}

export function createApp() {
  const app = express();
  const dataStore = createDataStore();

  assertSafeAuthConfiguration();
  initializeSentry();
  app.use(assignRequestId);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          objectSrc: ["'none'"],
          baseUri: ["'none'"],
          formAction: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: { policy: 'require-corp' },
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
    }),
  );

  const allowedOrigins = getAllowedCorsOrigins();
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === 'production'
          ? allowedOrigins
          : allowedOrigins.length
            ? allowedOrigins
            : true,
      credentials: true,
    }),
  );
  app.use(csrfProtectionMiddleware(allowedOrigins));

  app.use('/api', createRateLimitMiddleware('api'));
  registerWebhookRoute(app, dataStore);
  app.use(express.json());
  app.use(authenticateBearerToken);

  app.get('/health', wrapAsync(async (_req, res) => {
    const readiness = await createReadinessResponse(dataStore);
    res.status(200).json(createTopLevelHealthResponse(readiness.body));
  }));

  app.get('/health/live', (_req, res) => {
    res.status(200).json(createLivenessResponse());
  });

  app.get('/health/ready', wrapAsync(async (_req, res) => {
    const readiness = await createReadinessResponse(dataStore);
    res.status(readiness.statusCode).json(readiness.body);
  }));

  app.get('/api/health', wrapAsync(async (_req, res) => {
    const readiness = await createReadinessResponse(dataStore);
    res.status(readiness.statusCode).json(readiness.body);
  }));

  app.get('/api/health/live', (_req, res) => {
    res.status(200).json(createLivenessResponse());
  });

  app.get('/api/health/ready', wrapAsync(async (_req, res) => {
    const readiness = await createReadinessResponse(dataStore);
    res.status(readiness.statusCode).json(readiness.body);
  }));

  app.get('/api/version', (_req, res) => {
    res.status(200).json({
      service: 'infamous-freight-api',
      version: process.env.APP_VERSION ?? process.env.npm_package_version ?? 'unknown',
      commit:
        process.env.GIT_SHA ??
        process.env.FLY_IMAGE_REF ??
        process.env.SOURCE_COMMIT ??
        'unknown',
      buildTime: process.env.BUILD_TIME ?? 'unknown',
      node: process.version,
    });
  });

  registerRoutes(app, dataStore);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      return res.status(err.statusCode).json({
        error: err.code,
        message: err.message,
        requestId: _req.requestId,
      });
    }

    if (err.message === 'freight_operation_not_found') {
      return res.status(404).json({
        error: 'freight_operation_not_found',
        message: 'Freight operation record was not found for this tenant.',
        requestId: _req.requestId,
      });
    }

    if (err.message === 'load_not_found_for_tenant') {
      return res.status(404).json({
        error: 'load_not_found_for_tenant',
        message: 'Referenced load was not found for this tenant.',
        requestId: _req.requestId,
      });
    }

    if (err.message === 'quote_request_not_found') {
      return res.status(404).json({
        error: 'quote_request_not_found',
        message: 'Quote request was not found for this tenant.',
        requestId: _req.requestId,
      });
    }

    if (err.message === 'stripe_secret_key_required') {
      return res.status(500).json({
        error: 'stripe_secret_key_required',
        message: 'STRIPE_SECRET_KEY is required for billing actions.',
        requestId: _req.requestId,
      });
    }

    if (err.message === 'stripe_one_time_price_required') {
      return res.status(500).json({
        error: 'stripe_one_time_price_required',
        message: 'A Stripe Price ID is required for one-time purchases.',
        requestId: _req.requestId,
      });
    }

    Sentry.captureException(err);

    res.status(500).json({
      error: 'internal_server_error',
      message: 'Unexpected API error.',
      requestId: _req.requestId,
    });
  });

  return app;
}

declare global {
  namespace Express {
    interface AuthenticatedUser {
      userId: string;
      tenantId: string;
      role: Role;
    }

    interface Request {
      authenticatedUser?: AuthenticatedUser;
      tenantId?: string;
      userRole?: Role;
      subscriptionStatus?: SubscriptionStatus;
      requestId?: string;
    }
  }
}
