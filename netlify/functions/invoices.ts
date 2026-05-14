import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth } from './lib/auth.ts';
import { json, options, genId, genInvoiceNumber } from './lib/http.ts';
import { text, toNumber, toTimestamp, parseBody, parseUrl, extractParam } from './lib/validate.ts';
import { withSentry } from './lib/sentry.ts';

const MAX_LIST = 50;

type InvoiceInput = {
  loadId?: unknown;
  customerName?: unknown;
  customerEmail?: unknown;
  amount?: unknown;
  currency?: unknown;
  issuedAt?: unknown;
  dueAt?: unknown;
  status?: unknown;
  notes?: unknown;
  lineItems?: LineItemInput[];
};

type LineItemInput = {
  description?: unknown;
  quantity?: unknown;
  unitPrice?: unknown;
};

function rowToInvoice(row: Record<string, unknown>) {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    loadId: row.load_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    amount: row.amount ? Number(row.amount) : 0,
    currency: row.currency,
    issuedAt: row.issued_at,
    dueAt: row.due_at,
    paidAt: row.paid_at,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToLineItem(row: Record<string, unknown>) {
  return {
    id: row.id,
    description: row.description,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    amount: Number(row.amount),
    sortOrder: row.sort_order,
  };
}

async function listInvoices(req: Request) {
  const url = parseUrl(req);
  const status = url.searchParams.get('status');
  const db = getDatabase();
  let rows;
  if (status) {
    rows = await db.sql`SELECT * FROM invoices WHERE status = ${status} ORDER BY created_at DESC LIMIT ${MAX_LIST}`;
  } else {
    rows = await db.sql`SELECT * FROM invoices ORDER BY created_at DESC LIMIT ${MAX_LIST}`;
  }
  return json(200, { invoices: rows.map((r: Record<string, unknown>) => rowToInvoice(r)) });
}

async function getInvoice(id: string) {
  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM invoices WHERE id = ${id} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'not_found' });

  const lineItems = await db.sql`
    SELECT * FROM invoice_line_items WHERE invoice_id = ${id} ORDER BY sort_order ASC
  `;

  return json(200, {
    invoice: rowToInvoice(rows[0] as Record<string, unknown>),
    lineItems: lineItems.map((r: Record<string, unknown>) => rowToLineItem(r)),
  });
}

async function createInvoice(req: Request) {
  let body: InvoiceInput;
  try {
    body = await parseBody<InvoiceInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const customerName = text(body.customerName, 160);
  if (!customerName) return json(400, { error: 'missing_fields', fields: ['customerName'] });

  const id = genId();
  const invoiceNumber = genInvoiceNumber();
  const loadId = text(body.loadId, 64) || null;
  const customerEmail = text(body.customerEmail, 180) || null;
  const currency = text(body.currency, 3) || 'USD';
  const issuedAt = toTimestamp(body.issuedAt) || new Date().toISOString();
  const dueAt = toTimestamp(body.dueAt) || null;
  const notes = text(body.notes, 1000) || null;

  let totalAmount = toNumber(body.amount) || 0;
  const db = getDatabase();

  if (Array.isArray(body.lineItems) && body.lineItems.length > 0) {
    let computed = 0;
    for (let i = 0; i < body.lineItems.length; i++) {
      const item = body.lineItems[i];
      const desc = text(item.description, 200);
      if (!desc) continue;
      const qty = toNumber(item.quantity) || 1;
      const price = toNumber(item.unitPrice) || 0;
      const lineAmount = Math.round(qty * price * 100) / 100;
      computed += lineAmount;

      const lineId = genId();
      await db.sql`
        INSERT INTO invoice_line_items (id, invoice_id, description, quantity, unit_price, amount, sort_order)
        VALUES (${lineId}, ${id}, ${desc}, ${qty}, ${price}, ${lineAmount}, ${i})
      `;
    }
    if (totalAmount === 0) totalAmount = Math.round(computed * 100) / 100;
  }

  const [row] = await db.sql`
    INSERT INTO invoices (id, invoice_number, load_id, customer_name, customer_email, amount, currency, issued_at, due_at, notes)
    VALUES (${id}, ${invoiceNumber}, ${loadId}, ${customerName}, ${customerEmail}, ${totalAmount}, ${currency}, ${issuedAt}, ${dueAt}, ${notes})
    RETURNING *
  `;

  const lineItems = await db.sql`
    SELECT * FROM invoice_line_items WHERE invoice_id = ${id} ORDER BY sort_order ASC
  `;

  return json(201, {
    invoice: rowToInvoice(row as Record<string, unknown>),
    lineItems: lineItems.map((r: Record<string, unknown>) => rowToLineItem(r)),
  });
}

async function updateInvoice(req: Request, id: string) {
  let body: InvoiceInput;
  try {
    body = await parseBody<InvoiceInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const db = getDatabase();
  const existing = await db.sql`SELECT id, status FROM invoices WHERE id = ${id} LIMIT 1`;
  if (existing.length === 0) return json(404, { error: 'not_found' });

  if (body.customerName !== undefined) await db.sql`UPDATE invoices SET customer_name = ${text(body.customerName, 160)} WHERE id = ${id}`;
  if (body.customerEmail !== undefined) await db.sql`UPDATE invoices SET customer_email = ${text(body.customerEmail, 180)} WHERE id = ${id}`;
  if (body.amount !== undefined) await db.sql`UPDATE invoices SET amount = ${toNumber(body.amount)} WHERE id = ${id}`;
  if (body.dueAt !== undefined) await db.sql`UPDATE invoices SET due_at = ${toTimestamp(body.dueAt)} WHERE id = ${id}`;
  if (body.notes !== undefined) await db.sql`UPDATE invoices SET notes = ${text(body.notes, 1000)} WHERE id = ${id}`;

  if (body.status !== undefined) {
    const newStatus = text(body.status, 32);
    await db.sql`UPDATE invoices SET status = ${newStatus} WHERE id = ${id}`;
    if (newStatus === 'paid') {
      await db.sql`UPDATE invoices SET paid_at = NOW() WHERE id = ${id}`;
    }
  }

  return getInvoice(id);
}

export default withSentry(async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/api/invoices') return listInvoices(req);
  if (req.method === 'POST' && path === '/api/invoices') return createInvoice(req);

  const invoiceId = extractParam(path, /^\/api\/invoices\/([^/]+)$/);
  if (invoiceId) {
    if (req.method === 'GET') return getInvoice(invoiceId);
    if (req.method === 'PATCH') return updateInvoice(req, invoiceId);
  }

  return json(405, { error: 'method_not_allowed' });
});

export const config: Config = {
  path: ['/api/invoices', '/api/invoices/:id'],
};
