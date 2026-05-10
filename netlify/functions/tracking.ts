import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth } from './lib/auth.ts';
import { json, options, genId } from './lib/http.ts';
import { text, toNumber, toInt, parseBody, parseUrl, extractParam } from './lib/validate.ts';

const MAX_POSITIONS = 100;

type PositionInput = {
  loadId?: unknown;
  driverId?: unknown;
  lat?: unknown;
  lng?: unknown;
  speedMph?: unknown;
  heading?: unknown;
  address?: unknown;
  recordedAt?: unknown;
};

type PositionBatchInput = {
  positions?: PositionInput[];
};

function rowToPosition(row: Record<string, unknown>) {
  return {
    id: row.id,
    loadId: row.load_id,
    driverId: row.driver_id,
    lat: Number(row.lat),
    lng: Number(row.lng),
    speedMph: row.speed_mph ? Number(row.speed_mph) : null,
    heading: row.heading,
    address: row.address,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
  };
}

async function recordPosition(req: Request) {
  let body: PositionInput;
  try {
    body = await parseBody<PositionInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const lat = toNumber(body.lat);
  const lng = toNumber(body.lng);
  if (lat === null || lng === null) return json(400, { error: 'missing_fields', fields: ['lat', 'lng'] });
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return json(400, { error: 'invalid_coordinates' });

  const loadId = text(body.loadId, 64) || null;
  const driverId = text(body.driverId, 64) || null;
  if (!loadId && !driverId) return json(400, { error: 'missing_fields', fields: ['loadId or driverId required'] });

  const id = genId();
  const speedMph = toNumber(body.speedMph);
  const heading = toInt(body.heading);
  const address = text(body.address, 300) || null;
  const recordedAt = text(body.recordedAt, 64) || new Date().toISOString();

  const db = getDatabase();
  const [row] = await db.sql`
    INSERT INTO gps_positions (id, load_id, driver_id, lat, lng, speed_mph, heading, address, recorded_at)
    VALUES (${id}, ${loadId}, ${driverId}, ${lat}, ${lng}, ${speedMph}, ${heading}, ${address}, ${recordedAt})
    RETURNING *
  `;

  if (driverId) {
    await db.sql`
      UPDATE drivers SET current_lat = ${lat}, current_lng = ${lng}, current_location = ${address}
      WHERE id = ${driverId}
    `;
  }

  return json(201, { position: rowToPosition(row as Record<string, unknown>) });
}

async function recordBatch(req: Request) {
  let body: PositionBatchInput;
  try {
    body = await parseBody<PositionBatchInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  if (!Array.isArray(body.positions) || body.positions.length === 0) {
    return json(400, { error: 'missing_fields', fields: ['positions'] });
  }

  if (body.positions.length > 50) {
    return json(400, { error: 'too_many_positions', message: 'Maximum 50 positions per batch.' });
  }

  const db = getDatabase();
  const saved: unknown[] = [];

  for (const pos of body.positions) {
    const lat = toNumber(pos.lat);
    const lng = toNumber(pos.lng);
    if (lat === null || lng === null) continue;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;

    const id = genId();
    const loadId = text(pos.loadId, 64) || null;
    const driverId = text(pos.driverId, 64) || null;
    const speedMph = toNumber(pos.speedMph);
    const heading = toInt(pos.heading);
    const address = text(pos.address, 300) || null;
    const recordedAt = text(pos.recordedAt, 64) || new Date().toISOString();

    const [row] = await db.sql`
      INSERT INTO gps_positions (id, load_id, driver_id, lat, lng, speed_mph, heading, address, recorded_at)
      VALUES (${id}, ${loadId}, ${driverId}, ${lat}, ${lng}, ${speedMph}, ${heading}, ${address}, ${recordedAt})
      RETURNING *
    `;
    saved.push(rowToPosition(row as Record<string, unknown>));

    if (driverId) {
      await db.sql`
        UPDATE drivers SET current_lat = ${lat}, current_lng = ${lng}, current_location = ${address}
        WHERE id = ${driverId}
      `;
    }
  }

  return json(201, { positions: saved, count: saved.length });
}

async function getLoadPositions(loadId: string, req: Request) {
  const url = parseUrl(req);
  const limit = Math.min(toInt(url.searchParams.get('limit')) || 50, MAX_POSITIONS);
  const db = getDatabase();
  const rows = await db.sql`
    SELECT * FROM gps_positions WHERE load_id = ${loadId}
    ORDER BY recorded_at DESC LIMIT ${limit}
  `;
  return json(200, { positions: rows.map((r: Record<string, unknown>) => rowToPosition(r)) });
}

async function getDriverLatest(driverId: string) {
  const db = getDatabase();
  const rows = await db.sql`
    SELECT * FROM gps_positions WHERE driver_id = ${driverId}
    ORDER BY recorded_at DESC LIMIT 1
  `;
  if (rows.length === 0) return json(404, { error: 'no_positions' });
  return json(200, { position: rowToPosition(rows[0] as Record<string, unknown>) });
}

async function getLoadRoute(loadId: string) {
  const db = getDatabase();
  const rows = await db.sql`
    SELECT lat, lng, recorded_at, speed_mph, address
    FROM gps_positions WHERE load_id = ${loadId}
    ORDER BY recorded_at ASC LIMIT 500
  `;
  const route = rows.map((r: Record<string, unknown>) => ({
    lat: Number(r.lat),
    lng: Number(r.lng),
    recordedAt: r.recorded_at,
    speedMph: r.speed_mph ? Number(r.speed_mph) : null,
    address: r.address,
  }));
  return json(200, { route, pointCount: route.length });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'POST' && path === '/api/tracking/positions') return recordPosition(req);
  if (req.method === 'POST' && path === '/api/tracking/positions/batch') return recordBatch(req);

  const loadPosId = extractParam(path, /^\/api\/tracking\/load\/([^/]+)\/positions$/);
  if (loadPosId && req.method === 'GET') return getLoadPositions(loadPosId, req);

  const loadRouteId = extractParam(path, /^\/api\/tracking\/load\/([^/]+)\/route$/);
  if (loadRouteId && req.method === 'GET') return getLoadRoute(loadRouteId);

  const driverLatest = extractParam(path, /^\/api\/tracking\/driver\/([^/]+)\/latest$/);
  if (driverLatest && req.method === 'GET') return getDriverLatest(driverLatest);

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: [
    '/api/tracking/positions',
    '/api/tracking/positions/batch',
    '/api/tracking/load/:loadId/positions',
    '/api/tracking/load/:loadId/route',
    '/api/tracking/driver/:driverId/latest',
  ],
};
