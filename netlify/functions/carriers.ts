import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth } from './lib/auth.ts';
import { json, options, genId } from './lib/http.ts';
import { text, toNumber, toDate, parseBody, parseUrl, extractParam } from './lib/validate.ts';

const MAX_LIST = 50;

type CarrierInput = {
  name?: unknown;
  mcNumber?: unknown;
  dotNumber?: unknown;
  contactName?: unknown;
  contactEmail?: unknown;
  contactPhone?: unknown;
  address?: unknown;
  city?: unknown;
  state?: unknown;
  zip?: unknown;
  insuranceExpiry?: unknown;
  authorityStatus?: unknown;
  status?: unknown;
};

function rowToCarrier(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    mcNumber: row.mc_number,
    dotNumber: row.dot_number,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    insuranceExpiry: row.insurance_expiry,
    authorityStatus: row.authority_status,
    rating: row.rating ? Number(row.rating) : null,
    totalLoads: row.total_loads,
    onTimeRate: row.on_time_rate ? Number(row.on_time_rate) : null,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listCarriers(req: Request) {
  const url = parseUrl(req);
  const status = url.searchParams.get('status') || 'active';
  const db = getDatabase();
  const rows = await db.sql`
    SELECT * FROM carriers WHERE status = ${status} ORDER BY name ASC LIMIT ${MAX_LIST}
  `;
  return json(200, { carriers: rows.map((r: Record<string, unknown>) => rowToCarrier(r)) });
}

async function getCarrier(id: string) {
  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM carriers WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'not_found' });
  return json(200, { carrier: rowToCarrier(rows[0] as Record<string, unknown>) });
}

async function createCarrier(req: Request) {
  let body: CarrierInput;
  try {
    body = await parseBody<CarrierInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const name = text(body.name, 160);
  if (!name) return json(400, { error: 'missing_fields', fields: ['name'] });

  const id = genId();
  const mcNumber = text(body.mcNumber, 32) || null;
  const dotNumber = text(body.dotNumber, 32) || null;
  const contactName = text(body.contactName, 120) || null;
  const contactEmail = text(body.contactEmail, 180) || null;
  const contactPhone = text(body.contactPhone, 32) || null;
  const address = text(body.address, 200) || null;
  const city = text(body.city, 100) || null;
  const state = text(body.state, 2) || null;
  const zip = text(body.zip, 10) || null;
  const insuranceExpiry = toDate(body.insuranceExpiry);
  const authorityStatus = text(body.authorityStatus, 32) || 'pending';

  const db = getDatabase();

  if (mcNumber) {
    const existing = await db.sql`SELECT id FROM carriers WHERE mc_number = ${mcNumber} LIMIT 1`;
    if (existing.length > 0) return json(409, { error: 'mc_number_exists', message: 'A carrier with this MC number already exists.' });
  }

  const [row] = await db.sql`
    INSERT INTO carriers (
      id, name, mc_number, dot_number, contact_name, contact_email, contact_phone,
      address, city, state, zip, insurance_expiry, authority_status
    ) VALUES (
      ${id}, ${name}, ${mcNumber}, ${dotNumber}, ${contactName}, ${contactEmail}, ${contactPhone},
      ${address}, ${city}, ${state}, ${zip}, ${insuranceExpiry}, ${authorityStatus}
    ) RETURNING *
  `;

  return json(201, { carrier: rowToCarrier(row as Record<string, unknown>) });
}

async function updateCarrier(req: Request, id: string) {
  let body: CarrierInput;
  try {
    body = await parseBody<CarrierInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const db = getDatabase();
  const existing = await db.sql`SELECT id FROM carriers WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) return json(404, { error: 'not_found' });

  if (body.name !== undefined) await db.sql`UPDATE carriers SET name = ${text(body.name, 160)} WHERE id = ${id}`;
  if (body.mcNumber !== undefined) await db.sql`UPDATE carriers SET mc_number = ${text(body.mcNumber, 32) || null} WHERE id = ${id}`;
  if (body.dotNumber !== undefined) await db.sql`UPDATE carriers SET dot_number = ${text(body.dotNumber, 32) || null} WHERE id = ${id}`;
  if (body.contactName !== undefined) await db.sql`UPDATE carriers SET contact_name = ${text(body.contactName, 120) || null} WHERE id = ${id}`;
  if (body.contactEmail !== undefined) await db.sql`UPDATE carriers SET contact_email = ${text(body.contactEmail, 180) || null} WHERE id = ${id}`;
  if (body.contactPhone !== undefined) await db.sql`UPDATE carriers SET contact_phone = ${text(body.contactPhone, 32) || null} WHERE id = ${id}`;
  if (body.address !== undefined) await db.sql`UPDATE carriers SET address = ${text(body.address, 200) || null} WHERE id = ${id}`;
  if (body.city !== undefined) await db.sql`UPDATE carriers SET city = ${text(body.city, 100) || null} WHERE id = ${id}`;
  if (body.state !== undefined) await db.sql`UPDATE carriers SET state = ${text(body.state, 2) || null} WHERE id = ${id}`;
  if (body.zip !== undefined) await db.sql`UPDATE carriers SET zip = ${text(body.zip, 10) || null} WHERE id = ${id}`;
  if (body.insuranceExpiry !== undefined) await db.sql`UPDATE carriers SET insurance_expiry = ${toDate(body.insuranceExpiry)} WHERE id = ${id}`;
  if (body.authorityStatus !== undefined) await db.sql`UPDATE carriers SET authority_status = ${text(body.authorityStatus, 32)} WHERE id = ${id}`;
  if (body.status !== undefined) await db.sql`UPDATE carriers SET status = ${text(body.status, 32)} WHERE id = ${id}`;

  const [row] = await db.sql`SELECT * FROM carriers WHERE id = ${id}`;
  return json(200, { carrier: rowToCarrier(row as Record<string, unknown>) });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/api/carriers') return listCarriers(req);
  if (req.method === 'POST' && path === '/api/carriers') return createCarrier(req);

  const carrierId = extractParam(path, /^\/api\/carriers\/([^/]+)$/);
  if (carrierId) {
    if (req.method === 'GET') return getCarrier(carrierId);
    if (req.method === 'PATCH') return updateCarrier(req, carrierId);
  }

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: ['/api/carriers', '/api/carriers/:id'],
};
