import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth } from './lib/auth.ts';
import { json, options, genId } from './lib/http.ts';
import { text, toNumber, toDate, parseBody, parseUrl, extractParam } from './lib/validate.ts';
import { withSentry } from './lib/sentry.ts';

const MAX_LIST = 50;

type DriverInput = {
  carrierId?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  licenseNumber?: unknown;
  licenseState?: unknown;
  licenseExpiry?: unknown;
  status?: unknown;
  hosRemainingHours?: unknown;
  currentLocation?: unknown;
  currentLat?: unknown;
  currentLng?: unknown;
};

function rowToDriver(row: Record<string, unknown>) {
  return {
    id: row.id,
    carrierId: row.carrier_id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    licenseNumber: row.license_number,
    licenseState: row.license_state,
    licenseExpiry: row.license_expiry,
    status: row.status,
    hosRemainingHours: row.hos_remaining_hours ? Number(row.hos_remaining_hours) : null,
    currentLocation: row.current_location,
    currentLat: row.current_lat ? Number(row.current_lat) : null,
    currentLng: row.current_lng ? Number(row.current_lng) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listDrivers(req: Request) {
  const url = parseUrl(req);
  const status = url.searchParams.get('status');
  const carrierId = url.searchParams.get('carrierId');
  const db = getDatabase();

  let rows;
  if (carrierId && status) {
    rows = await db.sql`
      SELECT * FROM drivers WHERE carrier_id = ${carrierId} AND status = ${status}
      ORDER BY name ASC LIMIT ${MAX_LIST}
    `;
  } else if (carrierId) {
    rows = await db.sql`
      SELECT * FROM drivers WHERE carrier_id = ${carrierId} ORDER BY name ASC LIMIT ${MAX_LIST}
    `;
  } else if (status) {
    rows = await db.sql`
      SELECT * FROM drivers WHERE status = ${status} ORDER BY name ASC LIMIT ${MAX_LIST}
    `;
  } else {
    rows = await db.sql`SELECT * FROM drivers ORDER BY name ASC LIMIT ${MAX_LIST}`;
  }

  return json(200, { drivers: rows.map((r: Record<string, unknown>) => rowToDriver(r)) });
}

async function getDriver(id: string) {
  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM drivers WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'not_found' });

  const driver = rowToDriver(rows[0] as Record<string, unknown>);

  const loadRows = await db.sql`
    SELECT id, tracking_number, origin, destination, status, pickup_at, delivery_at
    FROM loads WHERE driver_id = ${id} AND status IN ('booked', 'in_transit')
    ORDER BY pickup_at ASC LIMIT 5
  `;

  return json(200, { driver, activeLoads: loadRows });
}

async function createDriver(req: Request) {
  let body: DriverInput;
  try {
    body = await parseBody<DriverInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const name = text(body.name, 120);
  const carrierId = text(body.carrierId, 64);
  if (!name || !carrierId) {
    return json(400, { error: 'missing_fields', fields: ['name', 'carrierId'].filter((f) => !text((body as Record<string, unknown>)[f])) });
  }

  const db = getDatabase();
  const carrierExists = await db.sql`SELECT id FROM carriers WHERE id = ${carrierId} LIMIT 1`;
  if (carrierExists.length === 0) return json(400, { error: 'invalid_carrier', message: 'Carrier not found.' });

  const id = genId();
  const email = text(body.email, 180) || null;
  const phone = text(body.phone, 32) || null;
  const licenseNumber = text(body.licenseNumber, 32) || null;
  const licenseState = text(body.licenseState, 2) || null;
  const licenseExpiry = toDate(body.licenseExpiry);
  const status = text(body.status, 32) || 'off_duty';

  const [row] = await db.sql`
    INSERT INTO drivers (
      id, carrier_id, name, email, phone, license_number, license_state, license_expiry, status
    ) VALUES (
      ${id}, ${carrierId}, ${name}, ${email}, ${phone}, ${licenseNumber}, ${licenseState}, ${licenseExpiry}, ${status}
    ) RETURNING *
  `;

  return json(201, { driver: rowToDriver(row as Record<string, unknown>) });
}

async function updateDriver(req: Request, id: string) {
  let body: DriverInput;
  try {
    body = await parseBody<DriverInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const db = getDatabase();
  const existing = await db.sql`SELECT id FROM drivers WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) return json(404, { error: 'not_found' });

  if (body.name !== undefined) await db.sql`UPDATE drivers SET name = ${text(body.name, 120)} WHERE id = ${id}`;
  if (body.email !== undefined) await db.sql`UPDATE drivers SET email = ${text(body.email, 180) || null} WHERE id = ${id}`;
  if (body.phone !== undefined) await db.sql`UPDATE drivers SET phone = ${text(body.phone, 32) || null} WHERE id = ${id}`;
  if (body.licenseNumber !== undefined) await db.sql`UPDATE drivers SET license_number = ${text(body.licenseNumber, 32) || null} WHERE id = ${id}`;
  if (body.licenseState !== undefined) await db.sql`UPDATE drivers SET license_state = ${text(body.licenseState, 2) || null} WHERE id = ${id}`;
  if (body.licenseExpiry !== undefined) await db.sql`UPDATE drivers SET license_expiry = ${toDate(body.licenseExpiry)} WHERE id = ${id}`;
  if (body.status !== undefined) await db.sql`UPDATE drivers SET status = ${text(body.status, 32)} WHERE id = ${id}`;
  if (body.hosRemainingHours !== undefined) await db.sql`UPDATE drivers SET hos_remaining_hours = ${toNumber(body.hosRemainingHours)} WHERE id = ${id}`;
  if (body.currentLocation !== undefined) await db.sql`UPDATE drivers SET current_location = ${text(body.currentLocation, 200) || null} WHERE id = ${id}`;
  if (body.currentLat !== undefined) await db.sql`UPDATE drivers SET current_lat = ${toNumber(body.currentLat)} WHERE id = ${id}`;
  if (body.currentLng !== undefined) await db.sql`UPDATE drivers SET current_lng = ${toNumber(body.currentLng)} WHERE id = ${id}`;

  const [row] = await db.sql`SELECT * FROM drivers WHERE id = ${id}`;
  return json(200, { driver: rowToDriver(row as Record<string, unknown>) });
}

async function getDriverHos(driverId: string) {
  const db = getDatabase();
  const rows = await db.sql`
    SELECT id, status, hos_remaining_hours FROM drivers WHERE id = ${driverId} LIMIT 1
  `;
  if (rows.length === 0) return json(404, { error: 'not_found' });
  const d = rows[0] as Record<string, unknown>;
  return json(200, { hours: d.hos_remaining_hours ? Number(d.hos_remaining_hours) : 0, status: d.status });
}

export default withSentry(async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/api/drivers') return listDrivers(req);
  if (req.method === 'POST' && path === '/api/drivers') return createDriver(req);

  const hosMatch = extractParam(path, /^\/api\/eld\/drivers\/([^/]+)\/hos$/);
  if (hosMatch && req.method === 'GET') return getDriverHos(hosMatch);

  const driverId = extractParam(path, /^\/api\/drivers\/([^/]+)$/);
  if (driverId) {
    if (req.method === 'GET') return getDriver(driverId);
    if (req.method === 'PATCH') return updateDriver(req, driverId);
  }

  return json(405, { error: 'method_not_allowed' });
});

export const config: Config = {
  path: ['/api/drivers', '/api/drivers/:id', '/api/eld/drivers/:driverId/hos'],
};
