import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { requireAuth, type TokenPayload } from './lib/auth.ts';
import { json, options, genId } from './lib/http.ts';
import { text, toInt, parseBody, parseUrl, extractParam } from './lib/validate.ts';

const MAX_LIST = 50;

type NotificationInput = {
  userId?: unknown;
  type?: unknown;
  title?: unknown;
  message?: unknown;
  data?: unknown;
};

function rowToNotification(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    data: row.data || {},
    read: row.read,
    timestamp: row.created_at,
    createdAt: row.created_at,
  };
}

async function listNotifications(req: Request, user: TokenPayload) {
  const url = parseUrl(req);
  const unreadOnly = url.searchParams.get('unread') === 'true';
  const limit = Math.min(toInt(url.searchParams.get('limit')) || 30, MAX_LIST);
  const db = getDatabase();

  let rows;
  if (unreadOnly) {
    rows = await db.sql`
      SELECT * FROM notifications WHERE user_id = ${user.sub} AND read = FALSE
      ORDER BY created_at DESC LIMIT ${limit}
    `;
  } else {
    rows = await db.sql`
      SELECT * FROM notifications WHERE user_id = ${user.sub}
      ORDER BY created_at DESC LIMIT ${limit}
    `;
  }

  const countRows = await db.sql`
    SELECT COUNT(*) as count FROM notifications WHERE user_id = ${user.sub} AND read = FALSE
  `;
  const unreadCount = Number((countRows[0] as Record<string, unknown>)?.count || 0);

  return json(200, {
    notifications: rows.map((r: Record<string, unknown>) => rowToNotification(r)),
    unreadCount,
  });
}

async function createNotification(req: Request, _user: TokenPayload) {
  let body: NotificationInput;
  try {
    body = await parseBody<NotificationInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const userId = text(body.userId, 64);
  const type = text(body.type, 32);
  const title = text(body.title, 200);
  const message = text(body.message, 1000);

  if (!userId || !type || !title || !message) {
    return json(400, {
      error: 'missing_fields',
      fields: ['userId', 'type', 'title', 'message'].filter((f) => !text((body as Record<string, unknown>)[f])),
    });
  }

  const id = genId();
  const dataJson = body.data && typeof body.data === 'object' ? JSON.stringify(body.data) : '{}';

  const db = getDatabase();
  const [row] = await db.sql`
    INSERT INTO notifications (id, user_id, type, title, message, data)
    VALUES (${id}, ${userId}, ${type}, ${title}, ${message}, ${dataJson}::jsonb)
    RETURNING *
  `;

  return json(201, { notification: rowToNotification(row as Record<string, unknown>) });
}

async function markRead(notificationId: string, user: TokenPayload) {
  const db = getDatabase();
  const rows = await db.sql`
    SELECT id FROM notifications WHERE id = ${notificationId} AND user_id = ${user.sub} LIMIT 1
  `;
  if (rows.length === 0) return json(404, { error: 'not_found' });

  await db.sql`UPDATE notifications SET read = TRUE WHERE id = ${notificationId}`;
  return json(200, { read: true });
}

async function markAllRead(user: TokenPayload) {
  const db = getDatabase();
  await db.sql`UPDATE notifications SET read = TRUE WHERE user_id = ${user.sub} AND read = FALSE`;
  return json(200, { readAll: true });
}

async function deleteNotification(notificationId: string, user: TokenPayload) {
  const db = getDatabase();
  const rows = await db.sql`
    SELECT id FROM notifications WHERE id = ${notificationId} AND user_id = ${user.sub} LIMIT 1
  `;
  if (rows.length === 0) return json(404, { error: 'not_found' });

  await db.sql`DELETE FROM notifications WHERE id = ${notificationId}`;
  return json(200, { deleted: true });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'GET' && path === '/api/notifications') return listNotifications(req, auth);
  if (req.method === 'POST' && path === '/api/notifications') return createNotification(req, auth);
  if (req.method === 'POST' && path === '/api/notifications/read-all') return markAllRead(auth);

  const readId = extractParam(path, /^\/api\/notifications\/([^/]+)\/read$/);
  if (readId && req.method === 'PATCH') return markRead(readId, auth);

  const notifId = extractParam(path, /^\/api\/notifications\/([^/]+)$/);
  if (notifId && req.method === 'DELETE') return deleteNotification(notifId, auth);

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: [
    '/api/notifications',
    '/api/notifications/read-all',
    '/api/notifications/:id',
    '/api/notifications/:id/read',
  ],
};
