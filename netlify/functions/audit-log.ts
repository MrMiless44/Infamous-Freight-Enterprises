import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth } from './lib/auth.ts';
import { json, options } from './lib/http.ts';
import { toInt, parseUrl } from './lib/validate.ts';

const MAX_LIST = 100;

async function getActivityLog(req: Request) {
  const url = parseUrl(req);
  const limit = Math.min(toInt(url.searchParams.get('limit')) || 50, MAX_LIST);
  const offset = toInt(url.searchParams.get('offset')) || 0;
  const category = url.searchParams.get('category');

  const db = getDatabase();

  const parts: Array<{ id: string; category: string; action: string; entity: string; entityId: string; actor: string; details: string; timestamp: string }> = [];

  if (!category || category === 'status') {
    const statusRows = await db.sql`
      SELECT se.id, se.load_id, se.status, se.notes, se.created_at,
             u.name as user_name, l.tracking_number
      FROM status_events se
      LEFT JOIN users u ON se.changed_by = u.id
      LEFT JOIN loads l ON se.load_id = l.id
      ORDER BY se.created_at DESC LIMIT ${limit}
    `;
    for (const r of statusRows as Array<Record<string, unknown>>) {
      parts.push({
        id: `se-${r.id}`,
        category: 'status',
        action: `Status changed to ${r.status}`,
        entity: `Load ${r.tracking_number || r.load_id}`,
        entityId: r.load_id as string,
        actor: (r.user_name as string) || 'System',
        details: (r.notes as string) || '',
        timestamp: r.created_at as string,
      });
    }
  }

  if (!category || category === 'notification') {
    const notifRows = await db.sql`
      SELECT n.id, n.type, n.title, n.message, n.created_at,
             u.name as user_name
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC LIMIT ${limit}
    `;
    for (const r of notifRows as Array<Record<string, unknown>>) {
      parts.push({
        id: `nf-${r.id}`,
        category: 'notification',
        action: r.title as string,
        entity: r.type as string,
        entityId: r.id as string,
        actor: (r.user_name as string) || 'System',
        details: (r.message as string) || '',
        timestamp: r.created_at as string,
      });
    }
  }

  if (!category || category === 'compliance') {
    const compRows = await db.sql`
      SELECT ca.id, ca.entity_type, ca.entity_id, ca.alert_type, ca.severity,
             ca.title, ca.description, ca.status as alert_status, ca.created_at,
             u.name as resolved_by_name
      FROM compliance_alerts ca
      LEFT JOIN users u ON ca.resolved_by = u.id
      ORDER BY ca.created_at DESC LIMIT ${limit}
    `;
    for (const r of compRows as Array<Record<string, unknown>>) {
      parts.push({
        id: `ca-${r.id}`,
        category: 'compliance',
        action: `${r.alert_type}: ${r.title}`,
        entity: `${r.entity_type} ${r.entity_id}`,
        entityId: r.entity_id as string,
        actor: (r.resolved_by_name as string) || 'System',
        details: (r.description as string) || '',
        timestamp: r.created_at as string,
      });
    }
  }

  if (!category || category === 'dispatch') {
    const dispRows = await db.sql`
      SELECT da.id, da.load_id, da.method, da.status as assign_status, da.notes, da.created_at,
             u.name as assigned_by_name, l.tracking_number,
             c.name as carrier_name
      FROM dispatch_assignments da
      LEFT JOIN users u ON da.assigned_by = u.id
      LEFT JOIN loads l ON da.load_id = l.id
      LEFT JOIN carriers c ON da.carrier_id = c.id
      ORDER BY da.created_at DESC LIMIT ${limit}
    `;
    for (const r of dispRows as Array<Record<string, unknown>>) {
      parts.push({
        id: `da-${r.id}`,
        category: 'dispatch',
        action: `Dispatch ${r.assign_status} (${r.method})`,
        entity: `Load ${r.tracking_number || r.load_id}`,
        entityId: r.load_id as string,
        actor: (r.assigned_by_name as string) || 'Auto-dispatch',
        details: r.carrier_name ? `Carrier: ${r.carrier_name}` : (r.notes as string) || '',
        timestamp: r.created_at as string,
      });
    }
  }

  if (!category || category === 'payment') {
    const payRows = await db.sql`
      SELECT p.id, p.invoice_id, p.amount, p.status as pay_status, p.created_at,
             i.invoice_number, i.customer_name
      FROM payments p
      LEFT JOIN invoices i ON p.invoice_id = i.id
      ORDER BY p.created_at DESC LIMIT ${limit}
    `;
    for (const r of payRows as Array<Record<string, unknown>>) {
      parts.push({
        id: `py-${r.id}`,
        category: 'payment',
        action: `Payment ${r.pay_status}`,
        entity: `Invoice ${r.invoice_number || r.invoice_id}`,
        entityId: r.invoice_id as string,
        actor: (r.customer_name as string) || 'System',
        details: `$${Number(r.amount || 0).toLocaleString()}`,
        timestamp: r.created_at as string,
      });
    }
  }

  parts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const paginated = parts.slice(offset, offset + limit);

  const countRows = await db.sql`
    SELECT
      (SELECT COUNT(*) FROM status_events) as status_count,
      (SELECT COUNT(*) FROM notifications) as notification_count,
      (SELECT COUNT(*) FROM compliance_alerts) as compliance_count,
      (SELECT COUNT(*) FROM dispatch_assignments) as dispatch_count,
      (SELECT COUNT(*) FROM payments) as payment_count
  `;
  const counts = countRows[0] as Record<string, unknown>;

  return json(200, {
    events: paginated,
    total: parts.length,
    counts: {
      status: Number(counts.status_count || 0),
      notification: Number(counts.notification_count || 0),
      compliance: Number(counts.compliance_count || 0),
      dispatch: Number(counts.dispatch_count || 0),
      payment: Number(counts.payment_count || 0),
    },
  });
}

async function getNotificationAdmin(req: Request) {
  const url = parseUrl(req);
  const limit = Math.min(toInt(url.searchParams.get('limit')) || 50, MAX_LIST);
  const db = getDatabase();

  const rows = await db.sql`
    SELECT n.*, u.name as user_name, u.email as user_email
    FROM notifications n
    LEFT JOIN users u ON n.user_id = u.id
    ORDER BY n.created_at DESC LIMIT ${limit}
  `;

  const stats = await db.sql`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE read = TRUE) as read_count,
      COUNT(*) FILTER (WHERE read = FALSE) as unread_count,
      COUNT(DISTINCT user_id) as unique_users,
      COUNT(DISTINCT type) as unique_types
    FROM notifications
  `;

  const typeBreakdown = await db.sql`
    SELECT type, COUNT(*) as count
    FROM notifications
    GROUP BY type ORDER BY count DESC LIMIT 20
  `;

  const s = stats[0] as Record<string, unknown>;

  return json(200, {
    notifications: (rows as Array<Record<string, unknown>>).map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userEmail: r.user_email,
      type: r.type,
      title: r.title,
      message: r.message,
      read: r.read,
      createdAt: r.created_at,
    })),
    stats: {
      total: Number(s.total || 0),
      readCount: Number(s.read_count || 0),
      unreadCount: Number(s.unread_count || 0),
      uniqueUsers: Number(s.unique_users || 0),
      uniqueTypes: Number(s.unique_types || 0),
    },
    typeBreakdown: (typeBreakdown as Array<Record<string, unknown>>).map((r) => ({
      type: r.type,
      count: Number(r.count),
    })),
  });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  if (auth.role !== 'admin' && auth.role !== 'owner') {
    return json(403, { error: 'forbidden', message: 'Admin access required.' });
  }

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/api/admin/activity') return getActivityLog(req);
  if (req.method === 'GET' && path === '/api/admin/notifications') return getNotificationAdmin(req);

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: ['/api/admin/activity', '/api/admin/notifications'],
};
