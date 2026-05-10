import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth, type TokenPayload } from './lib/auth.ts';
import { json, options, genId } from './lib/http.ts';
import { text, parseBody, parseUrl, extractParam } from './lib/validate.ts';

const MAX_LIST = 50;

function rowToAlert(row: Record<string, unknown>) {
  return {
    id: row.id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    alertType: row.alert_type,
    severity: row.severity,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by,
    status: row.status,
    createdAt: row.created_at,
  };
}

async function getDashboard(user: TokenPayload) {
  const db = getDatabase();

  const alertRows = await db.sql`
    SELECT * FROM compliance_alerts WHERE status = 'open'
    ORDER BY
      CASE severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
      due_date ASC NULLS LAST
    LIMIT ${MAX_LIST}
  `;

  const countRows = await db.sql`
    SELECT severity, COUNT(*) as count FROM compliance_alerts WHERE status = 'open' GROUP BY severity
  `;

  const counts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const r of countRows) {
    const row = r as Record<string, unknown>;
    counts[row.severity as string] = Number(row.count);
  }

  const carrierInsurance = await db.sql`
    SELECT id, name, mc_number, insurance_expiry
    FROM carriers
    WHERE insurance_expiry IS NOT NULL AND insurance_expiry <= CURRENT_DATE + INTERVAL '30 days'
    ORDER BY insurance_expiry ASC LIMIT 20
  `;

  const expiringInsurance = carrierInsurance.map((r: Record<string, unknown>) => ({
    carrierId: r.id,
    carrierName: r.name,
    mcNumber: r.mc_number,
    insuranceExpiry: r.insurance_expiry,
    daysRemaining: r.insurance_expiry
      ? Math.ceil((new Date(r.insurance_expiry as string).getTime() - Date.now()) / 86400000)
      : null,
  }));

  const driverLicenses = await db.sql`
    SELECT id, name, license_expiry, carrier_id
    FROM drivers
    WHERE license_expiry IS NOT NULL AND license_expiry <= CURRENT_DATE + INTERVAL '30 days'
    ORDER BY license_expiry ASC LIMIT 20
  `;

  const expiringLicenses = driverLicenses.map((r: Record<string, unknown>) => ({
    driverId: r.id,
    driverName: r.name,
    licenseExpiry: r.license_expiry,
    carrierId: r.carrier_id,
    daysRemaining: r.license_expiry
      ? Math.ceil((new Date(r.license_expiry as string).getTime() - Date.now()) / 86400000)
      : null,
  }));

  return json(200, {
    alertCounts: counts,
    alerts: alertRows.map((r: Record<string, unknown>) => rowToAlert(r)),
    expiringInsurance,
    expiringLicenses,
  });
}

async function listAlerts(req: Request) {
  const url = parseUrl(req);
  const status = url.searchParams.get('status') || 'open';
  const severity = url.searchParams.get('severity');

  const db = getDatabase();
  let rows;

  if (severity) {
    rows = await db.sql`
      SELECT * FROM compliance_alerts WHERE status = ${status} AND severity = ${severity}
      ORDER BY due_date ASC NULLS LAST LIMIT ${MAX_LIST}
    `;
  } else {
    rows = await db.sql`
      SELECT * FROM compliance_alerts WHERE status = ${status}
      ORDER BY due_date ASC NULLS LAST LIMIT ${MAX_LIST}
    `;
  }

  return json(200, { alerts: rows.map((r: Record<string, unknown>) => rowToAlert(r)) });
}

async function createAlert(req: Request, user: TokenPayload) {
  let body: {
    entityType?: unknown; entityId?: unknown; alertType?: unknown;
    severity?: unknown; title?: unknown; description?: unknown; dueDate?: unknown;
  };
  try {
    body = await parseBody<typeof body>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const entityType = text(body.entityType, 32);
  const entityId = text(body.entityId, 64);
  const alertType = text(body.alertType, 64);
  const title = text(body.title, 200);

  if (!entityType || !entityId || !alertType || !title) {
    return json(400, { error: 'missing_fields', fields: ['entityType', 'entityId', 'alertType', 'title'].filter(f => !text((body as Record<string, unknown>)[f])) });
  }

  const id = genId();
  const severity = text(body.severity, 16) || 'medium';
  const description = text(body.description, 1000) || null;
  const dueDate = text(body.dueDate, 32) || null;

  const db = getDatabase();
  const [row] = await db.sql`
    INSERT INTO compliance_alerts (id, entity_type, entity_id, alert_type, severity, title, description, due_date)
    VALUES (${id}, ${entityType}, ${entityId}, ${alertType}, ${severity}, ${title}, ${description}, ${dueDate}::date)
    RETURNING *
  `;

  return json(201, { alert: rowToAlert(row as Record<string, unknown>) });
}

async function resolveAlert(alertId: string, user: TokenPayload) {
  const db = getDatabase();
  const rows = await db.sql`SELECT id FROM compliance_alerts WHERE id = ${alertId} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'not_found' });

  await db.sql`
    UPDATE compliance_alerts SET status = 'resolved', resolved_at = NOW(), resolved_by = ${user.sub}
    WHERE id = ${alertId}
  `;

  return json(200, { resolved: true });
}

async function getCSAScore(dotNumber: string) {
  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM carriers WHERE dot_number = ${dotNumber} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'carrier_not_found' });

  const carrier = rows[0] as Record<string, unknown>;
  return json(200, {
    dotNumber,
    carrierName: carrier.name,
    scores: {
      unsafeDriving: 0,
      hosFatigue: 0,
      driverFitness: 0,
      controlledSubstances: 0,
      vehicleMaintenance: 0,
      hazmat: 0,
      crashIndicator: 0,
    },
    source: 'internal',
    message: 'CSA scores represent internal baseline. Connect to FMCSA API for live data.',
  });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = parseUrl(req);
  const path = url.pathname;

  const dashboardMatch = extractParam(path, /^\/api\/compliance\/dashboard\/(.+)$/);
  if (dashboardMatch && req.method === 'GET') return getDashboard(auth);

  const alertsMatch = extractParam(path, /^\/api\/compliance\/alerts\/(.+)$/);
  if (alertsMatch && req.method === 'GET') return listAlerts(req);

  if (req.method === 'GET' && path === '/api/compliance/alerts') return listAlerts(req);
  if (req.method === 'POST' && path === '/api/compliance/alerts') return createAlert(req, auth);

  const resolveId = extractParam(path, /^\/api\/compliance\/alerts\/([^/]+)\/resolve$/);
  if (resolveId && req.method === 'POST') return resolveAlert(resolveId, auth);

  const csaDot = extractParam(path, /^\/api\/csa\/carrier\/([^/]+)$/);
  if (csaDot && req.method === 'GET') return getCSAScore(csaDot);

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: [
    '/api/compliance/dashboard/:id',
    '/api/compliance/alerts',
    '/api/compliance/alerts/:id',
    '/api/compliance/alerts/:id/resolve',
    '/api/csa/carrier/:dotNumber',
  ],
};
