import { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function wrapAsync(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

export function getRequiredTenantId(req: Request): string {
  if (!req.tenantId) {
    throw new HttpError(
      400,
      'tenant_id_required',
      'Provide tenantId via the x-tenant-id header.',
    );
  }

  return req.tenantId;
}

export function getRouteParam(req: Request, name: string): string {
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

export function hasLeadHoneypotValue(body: unknown): boolean {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const record = body as Record<string, unknown>;
  const value = record.website ?? record.url ?? record.companyWebsite;

  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidDateString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && !Number.isNaN(Date.parse(value));
}
