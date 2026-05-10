import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth, type TokenPayload } from './lib/auth.ts';
import { json, options, genId } from './lib/http.ts';
import { text, parseBody, parseUrl, extractParam } from './lib/validate.ts';

const MAX_LIST = 50;

type CompanyInput = {
  name?: unknown;
  type?: unknown;
  contactName?: unknown;
  contactEmail?: unknown;
  contactPhone?: unknown;
  address?: unknown;
  city?: unknown;
  state?: unknown;
  zip?: unknown;
  status?: unknown;
};

function rowToCompany(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function listCompanies(req: Request) {
  const url = parseUrl(req);
  const type = url.searchParams.get('type');
  const db = getDatabase();
  let rows;
  if (type) {
    rows = await db.sql`
      SELECT * FROM companies WHERE type = ${type} ORDER BY name ASC LIMIT ${MAX_LIST}
    `;
  } else {
    rows = await db.sql`SELECT * FROM companies ORDER BY name ASC LIMIT ${MAX_LIST}`;
  }
  return json(200, { companies: rows.map((r: Record<string, unknown>) => rowToCompany(r)) });
}

async function getCompany(id: string) {
  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM companies WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'not_found' });
  return json(200, { company: rowToCompany(rows[0] as Record<string, unknown>) });
}

async function createCompany(req: Request, user: TokenPayload) {
  if (user.role !== 'admin' && user.role !== 'dispatcher') {
    return json(403, { error: 'forbidden', message: 'Only admin or dispatcher can create companies.' });
  }

  let body: CompanyInput;
  try {
    body = await parseBody<CompanyInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const name = text(body.name, 160);
  if (!name) return json(400, { error: 'missing_fields', fields: ['name'] });

  const id = genId();
  const type = text(body.type, 32) || 'shipper';
  const contactName = text(body.contactName, 120) || null;
  const contactEmail = text(body.contactEmail, 180) || null;
  const contactPhone = text(body.contactPhone, 32) || null;
  const address = text(body.address, 300) || null;
  const city = text(body.city, 100) || null;
  const state = text(body.state, 2) || null;
  const zip = text(body.zip, 10) || null;

  const db = getDatabase();
  const [row] = await db.sql`
    INSERT INTO companies (id, name, type, contact_name, contact_email, contact_phone, address, city, state, zip)
    VALUES (${id}, ${name}, ${type}, ${contactName}, ${contactEmail}, ${contactPhone}, ${address}, ${city}, ${state}, ${zip})
    RETURNING *
  `;

  return json(201, { company: rowToCompany(row as Record<string, unknown>) });
}

async function updateCompany(req: Request, id: string, user: TokenPayload) {
  if (user.role !== 'admin' && user.role !== 'dispatcher') {
    return json(403, { error: 'forbidden' });
  }

  let body: CompanyInput;
  try {
    body = await parseBody<CompanyInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const db = getDatabase();
  const existing = await db.sql`SELECT id FROM companies WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) return json(404, { error: 'not_found' });

  if (body.name !== undefined) await db.sql`UPDATE companies SET name = ${text(body.name, 160)} WHERE id = ${id}`;
  if (body.type !== undefined) await db.sql`UPDATE companies SET type = ${text(body.type, 32)} WHERE id = ${id}`;
  if (body.contactName !== undefined) await db.sql`UPDATE companies SET contact_name = ${text(body.contactName, 120)} WHERE id = ${id}`;
  if (body.contactEmail !== undefined) await db.sql`UPDATE companies SET contact_email = ${text(body.contactEmail, 180)} WHERE id = ${id}`;
  if (body.contactPhone !== undefined) await db.sql`UPDATE companies SET contact_phone = ${text(body.contactPhone, 32)} WHERE id = ${id}`;
  if (body.address !== undefined) await db.sql`UPDATE companies SET address = ${text(body.address, 300)} WHERE id = ${id}`;
  if (body.city !== undefined) await db.sql`UPDATE companies SET city = ${text(body.city, 100)} WHERE id = ${id}`;
  if (body.state !== undefined) await db.sql`UPDATE companies SET state = ${text(body.state, 2)} WHERE id = ${id}`;
  if (body.zip !== undefined) await db.sql`UPDATE companies SET zip = ${text(body.zip, 10)} WHERE id = ${id}`;
  if (body.status !== undefined) await db.sql`UPDATE companies SET status = ${text(body.status, 32)} WHERE id = ${id}`;

  const [row] = await db.sql`SELECT * FROM companies WHERE id = ${id}`;
  return json(200, { company: rowToCompany(row as Record<string, unknown>) });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/api/companies') return listCompanies(req);
  if (req.method === 'POST' && path === '/api/companies') return createCompany(req, auth);

  const companyId = extractParam(path, /^\/api\/companies\/([^/]+)$/);
  if (companyId) {
    if (req.method === 'GET') return getCompany(companyId);
    if (req.method === 'PATCH') return updateCompany(req, companyId, auth);
  }

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: ['/api/companies', '/api/companies/:id'],
};
