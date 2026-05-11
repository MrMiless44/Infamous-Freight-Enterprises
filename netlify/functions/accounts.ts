import { getDatabase } from '@netlify/database';
import type { Config } from '@netlify/functions';
import { hashPassword, verifyPassword, createToken, requireAuth, type TokenPayload } from './lib/auth.ts';
import { json, options, genId } from './lib/http.ts';
import { text, isEmail, parseBody, parseUrl, extractParam } from './lib/validate.ts';

type RegisterInput = {
  email?: unknown;
  password?: unknown;
  name?: unknown;
  companyName?: unknown;
  role?: unknown;
  phone?: unknown;
};

type LoginInput = {
  email?: unknown;
  password?: unknown;
};

type ProfileUpdate = {
  name?: unknown;
  phone?: unknown;
  avatar_url?: unknown;
};

const ALLOWED_ROLES = new Set(['admin', 'owner', 'dispatcher', 'driver', 'carrier', 'accounting', 'viewer']);

async function register(req: Request) {
  let body: RegisterInput;
  try {
    body = await parseBody<RegisterInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const email = text(body.email, 180).toLowerCase();
  const password = text(body.password, 128);
  const name = text(body.name, 120);
  const companyName = text(body.companyName, 160);
  const role = text(body.role, 20) || 'dispatcher';
  const phone = text(body.phone, 32) || null;

  if (!email || !password || !name) {
    return json(400, { error: 'missing_fields', fields: ['email', 'password', 'name'].filter((f) => !text((body as Record<string, unknown>)[f])) });
  }
  if (!isEmail(email)) return json(400, { error: 'invalid_email' });
  if (password.length < 8) return json(400, { error: 'password_too_short', message: 'Password must be at least 8 characters.' });
  if (!/[A-Z]/.test(password)) return json(400, { error: 'password_weak', message: 'Password must contain at least one uppercase letter.' });
  if (!/[a-z]/.test(password)) return json(400, { error: 'password_weak', message: 'Password must contain at least one lowercase letter.' });
  if (!/\d/.test(password)) return json(400, { error: 'password_weak', message: 'Password must contain at least one number.' });
  if (!ALLOWED_ROLES.has(role)) return json(400, { error: 'invalid_role' });

  const db = getDatabase();
  const existing = await db.sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (existing.length > 0) return json(409, { error: 'email_exists', message: 'An account with this email already exists.' });

  const id = genId();
  const carrierId = genId();
  const passwordHash = await hashPassword(password);

  await db.sql`
    INSERT INTO carriers (id, name, contact_name, contact_email, contact_phone, status)
    VALUES (${carrierId}, ${companyName || `${name}'s Company`}, ${name}, ${email}, ${phone}, 'active')
  `;

  await db.sql`
    INSERT INTO users (id, email, password_hash, name, role, carrier_id, phone)
    VALUES (${id}, ${email}, ${passwordHash}, ${name}, ${role}, ${carrierId}, ${phone})
  `;

  const token = await createToken({ sub: id, email, name, role, carrier_id: carrierId });

  return json(201, {
    token,
    user: { id, email, name, role, carrierId, phone, subscriptionStatus: 'none' },
  });
}

async function login(req: Request) {
  let body: LoginInput;
  try {
    body = await parseBody<LoginInput>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const email = text(body.email, 180).toLowerCase();
  const password = text(body.password, 128);

  if (!email || !password) return json(400, { error: 'missing_fields', fields: ['email', 'password'] });

  const db = getDatabase();
  const rows = await db.sql`
    SELECT id, email, password_hash, name, role, carrier_id, phone, avatar_url, subscription_status
    FROM users WHERE email = ${email} LIMIT 1
  `;
  const user = rows[0] as Record<string, unknown> | undefined;
  if (!user) return json(401, { error: 'invalid_credentials', message: 'Invalid email or password.' });

  const valid = await verifyPassword(password, user.password_hash as string);
  if (!valid) return json(401, { error: 'invalid_credentials', message: 'Invalid email or password.' });

  await db.sql`UPDATE users SET last_login_at = NOW() WHERE id = ${user.id as string}`;

  const token = await createToken({
    sub: user.id as string,
    email: user.email as string,
    name: user.name as string,
    role: user.role as string,
    carrier_id: (user.carrier_id as string) || undefined,
  });

  return json(200, {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      carrierId: user.carrier_id,
      phone: user.phone,
      avatar: user.avatar_url,
      subscriptionStatus: user.subscription_status,
    },
  });
}

async function getMe(authUser: TokenPayload) {
  const db = getDatabase();
  const rows = await db.sql`
    SELECT id, email, name, role, carrier_id, phone, avatar_url, subscription_status, created_at
    FROM users WHERE id = ${authUser.sub} LIMIT 1
  `;
  const user = rows[0] as Record<string, unknown> | undefined;
  if (!user) return json(404, { error: 'not_found' });

  return json(200, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      carrierId: user.carrier_id,
      phone: user.phone,
      avatar: user.avatar_url,
      subscriptionStatus: user.subscription_status,
      createdAt: user.created_at,
    },
  });
}

async function updateProfile(req: Request, authUser: TokenPayload) {
  let body: ProfileUpdate;
  try {
    body = await parseBody<ProfileUpdate>(req);
  } catch {
    return json(400, { error: 'invalid_json' });
  }

  const name = text(body.name, 120) || null;
  const phone = text(body.phone, 32) || null;
  const avatarUrl = text(body.avatar_url, 500) || null;

  const db = getDatabase();
  const sets: string[] = [];
  if (name) sets.push('name');
  if (phone) sets.push('phone');
  if (avatarUrl) sets.push('avatar_url');

  if (name) await db.sql`UPDATE users SET name = ${name} WHERE id = ${authUser.sub}`;
  if (phone) await db.sql`UPDATE users SET phone = ${phone} WHERE id = ${authUser.sub}`;
  if (avatarUrl) await db.sql`UPDATE users SET avatar_url = ${avatarUrl} WHERE id = ${authUser.sub}`;

  return getMe(authUser);
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'POST' && path === '/api/auth/register') return register(req);
  if (req.method === 'POST' && path === '/api/auth/login') return login(req);

  if (path === '/api/auth/me') {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    if (req.method === 'GET') return getMe(auth);
    if (req.method === 'PATCH') return updateProfile(req, auth);
  }

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: ['/api/auth/register', '/api/auth/login', '/api/auth/me'],
};
