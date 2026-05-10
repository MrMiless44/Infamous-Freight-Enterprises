const SALT_BYTES = 16;
const ITERATIONS = 100_000;
const KEY_LENGTH = 32;

function toHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = hex.match(/../g);
  if (!bytes) throw new Error('invalid hex');
  return new Uint8Array(bytes.map((h) => parseInt(h, 16)));
}

function base64url(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  return new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
}

function base64urlEncodeStr(str: string): string {
  return base64url(new TextEncoder().encode(str));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    KEY_LENGTH * 8,
  );
  return `${toHex(salt)}:${toHex(new Uint8Array(hash))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, expectedHex] = stored.split(':');
  if (!saltHex || !expectedHex) return false;
  const salt = fromHex(saltHex);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    key,
    KEY_LENGTH * 8,
  );
  return toHex(new Uint8Array(hash)) === expectedHex;
}

async function getSigningKey(): Promise<CryptoKey> {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export type TokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
  carrier_id?: string;
};

export async function createToken(payload: TokenPayload): Promise<string> {
  const header = base64urlEncodeStr(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const claims = base64urlEncodeStr(
    JSON.stringify({
      ...payload,
      iat: now,
      exp: now + 7 * 24 * 60 * 60,
    }),
  );
  const signingInput = `${header}.${claims}`;
  const key = await getSigningKey();
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64url(new Uint8Array(sig))}`;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const key = await getSigningKey();
    const signingInput = `${parts[0]}.${parts[1]}`;
    const signature = base64urlDecode(parts[2]);
    const valid = await crypto.subtle.verify('HMAC', key, signature, new TextEncoder().encode(signingInput));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(parts[1])));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request): Promise<TokenPayload | Response> {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'unauthorized', message: 'Bearer token required.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  const user = await verifyToken(header.slice(7));
  if (!user) {
    return new Response(JSON.stringify({ error: 'unauthorized', message: 'Invalid or expired token.' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  return user;
}
