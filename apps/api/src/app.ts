import cors from 'cors';
import helmet from 'helmet';
import { randomUUID } from 'crypto';
import express, { NextFunction, Request, Response } from 'express';
import * as Sentry from '@sentry/node';
import { createDataStore } from './data-store';
import { createRateLimitMiddleware } from './rate-limit';
import { requireTenant, requireRole, createRequirePaidSubscription } from './auth/middleware';
import { createLeadRoutes } from './routes/leads';
import { createWebhookRoute, createBillingRoutes } from './routes/billing';
import { createCoreRoutes } from './routes/core';
import { createHealthRoutes } from './routes/health';
import { HttpError } from './shared/http';

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

function assignRequestId(req: Request, res: Response, next: NextFunction) {
  const requestId = req.header('x-request-id')?.trim() || randomUUID();

  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

export function createApp() {
  const app = express();
  const dataStore = createDataStore();

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

  // Stripe webhook must parse raw body before express.json()
  app.use('/api/billing', createWebhookRoute(dataStore));
  app.use(express.json());

  // Health & version (no auth)
  app.use(createHealthRoutes(dataStore));

  // Public lead intake (no auth)
  app.use('/api/leads', createLeadRoutes(dataStore));

  // Billing routes (tenant + role auth)
  app.use('/api/billing', createBillingRoutes(dataStore, requireTenant, requireRole));

  // Core API routes (tenant + role + subscription auth)
  const protectedMiddleware = [requireTenant, requireRole, createRequirePaidSubscription(dataStore)];
  app.use('/api', createCoreRoutes(dataStore, protectedMiddleware));

  // Global error handler
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
