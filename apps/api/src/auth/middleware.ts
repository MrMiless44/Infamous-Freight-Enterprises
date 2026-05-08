import { NextFunction, Request, Response } from 'express';
import * as Sentry from '@sentry/node';

type Role = 'owner' | 'admin' | 'dispatcher' | 'driver';

type SubscriptionStatus = 'active' | 'trialing' | 'trial' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'none';

const ALLOWED_ROLES: Role[] = ['owner', 'admin', 'dispatcher', 'driver'];
const PAID_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ['active', 'trialing', 'trial'];

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

function getTenantId(req: Request): string | null {
  return req.header('x-tenant-id')?.trim() || null;
}

export function requireTenant(req: Request, res: Response, next: NextFunction) {
  const tenantId = getTenantId(req);

  if (!tenantId) {
    return res.status(400).json({
      error: 'tenant_id_required',
      message: 'Provide tenantId via the x-tenant-id header.',
      requestId: req.requestId,
    });
  }

  req.tenantId = tenantId;
  next();
}

export function requireRole(req: Request, res: Response, next: NextFunction) {
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

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'A valid Authorization header is required.',
      requestId: req.requestId,
    });
  }

  const token = authHeader.slice(7);

  if (!token || token.length < 10) {
    return res.status(401).json({
      error: 'invalid_token',
      message: 'The provided token is invalid.',
      requestId: req.requestId,
    });
  }

  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return res.status(401).json({
          error: 'token_expired',
          message: 'The provided token has expired.',
          requestId: req.requestId,
        });
      }

      if (payload.sub) {
        req.userId = payload.sub;
      }

      if (payload.user_metadata?.role) {
        req.userRole = payload.user_metadata.role;
      }

      Sentry.setUser({ id: payload.sub });
    }
  } catch {
    // Token parsing failed — fall through to let downstream middleware decide
  }

  next();
}

interface DataStoreForBilling {
  getCarrierSubscriptionStatus(tenantId: string): Promise<string | null>;
}

export function createRequirePaidSubscription(dataStore: DataStoreForBilling) {
  return (req: Request, res: Response, next: NextFunction) => {
    void (async () => {
      const tenantId = req.tenantId;
      if (!tenantId) {
        return res.status(400).json({
          error: 'tenant_id_required',
          message: 'Provide tenantId via the x-tenant-id header.',
          requestId: req.requestId,
        });
      }

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

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      userRole?: string;
      userId?: string;
      subscriptionStatus?: string;
      requestId?: string;
    }
  }
}
