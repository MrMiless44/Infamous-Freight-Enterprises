import { getDatabase } from '@netlify/database';
import { getStore } from '@netlify/blobs';
import type { Config } from '@netlify/functions';
import { requireAuth, type TokenPayload } from './lib/auth.ts';
import { json, options, genId } from './lib/http.ts';
import { text, parseUrl, extractParam } from './lib/validate.ts';

const ALLOWED_TYPES = ['BOL', 'POD', 'RATE_CONFIRMATION', 'INSURANCE', 'LICENSE', 'OTHER'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function rowToDocument(row: Record<string, unknown>) {
  return {
    id: row.id,
    loadId: row.load_id,
    type: row.type,
    fileName: row.file_name,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  };
}

async function uploadDocument(req: Request, user: TokenPayload) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return json(400, { error: 'invalid_form_data', message: 'Request must be multipart/form-data.' });
  }

  const file = formData.get('file') as File | null;
  const loadId = (formData.get('loadId') as string)?.trim() || null;
  const docType = ((formData.get('type') as string)?.trim().toUpperCase()) || 'OTHER';

  if (!file) return json(400, { error: 'missing_file', message: 'A file is required.' });
  if (file.size > MAX_FILE_SIZE) return json(400, { error: 'file_too_large', message: 'Maximum file size is 10 MB.' });
  if (!ALLOWED_TYPES.includes(docType)) return json(400, { error: 'invalid_type', message: `Type must be one of: ${ALLOWED_TYPES.join(', ')}` });

  if (loadId) {
    const db = getDatabase();
    const loadCheck = await db.sql`SELECT id FROM loads WHERE id = ${loadId} LIMIT 1`;
    if (loadCheck.length === 0) return json(400, { error: 'invalid_load', message: 'Load not found.' });
  }

  const id = genId();
  const blobKey = `documents/${id}/${file.name}`;
  const buffer = await file.arrayBuffer();

  const store = getStore('freight-documents');
  await store.set(blobKey, new Uint8Array(buffer), {
    metadata: {
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      docType,
      loadId: loadId || '',
      uploadedBy: user.sub,
    },
  });

  const db = getDatabase();
  const [row] = await db.sql`
    INSERT INTO documents (id, load_id, type, file_name, blob_key, file_size, mime_type, uploaded_by)
    VALUES (${id}, ${loadId}, ${docType}, ${file.name}, ${blobKey}, ${file.size}, ${file.type || 'application/octet-stream'}, ${user.sub})
    RETURNING *
  `;

  return json(201, { document: rowToDocument(row as Record<string, unknown>) });
}

async function listByLoad(loadId: string) {
  const db = getDatabase();
  const rows = await db.sql`
    SELECT * FROM documents WHERE load_id = ${loadId} ORDER BY created_at DESC
  `;
  return json(200, { documents: rows.map((r: Record<string, unknown>) => rowToDocument(r)) });
}

async function downloadDocument(docId: string) {
  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM documents WHERE id = ${docId} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'not_found' });

  const doc = rows[0] as Record<string, unknown>;
  const store = getStore('freight-documents');

  try {
    const data = await store.get(doc.blob_key as string, { type: 'arrayBuffer' });
    if (!data) return json(404, { error: 'file_not_found', message: 'File data no longer available.' });

    return new Response(data, {
      status: 200,
      headers: {
        'content-type': (doc.mime_type as string) || 'application/octet-stream',
        'content-disposition': `attachment; filename="${doc.file_name}"`,
        'cache-control': 'private, max-age=3600',
      },
    });
  } catch {
    return json(500, { error: 'download_failed', message: 'Unable to retrieve file.' });
  }
}

async function getDocumentMeta(docId: string) {
  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM documents WHERE id = ${docId} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'not_found' });
  return json(200, { document: rowToDocument(rows[0] as Record<string, unknown>) });
}

async function deleteDocument(docId: string) {
  const db = getDatabase();
  const rows = await db.sql`SELECT * FROM documents WHERE id = ${docId} LIMIT 1`;
  if (rows.length === 0) return json(404, { error: 'not_found' });

  const doc = rows[0] as Record<string, unknown>;
  const store = getStore('freight-documents');

  try {
    await store.delete(doc.blob_key as string);
  } catch {
    // blob may already be gone
  }

  await db.sql`DELETE FROM documents WHERE id = ${docId}`;
  return json(200, { deleted: true });
}

export default async (req: Request) => {
  if (req.method === 'OPTIONS') return options();

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const url = parseUrl(req);
  const path = url.pathname;

  if (req.method === 'POST' && path === '/api/documents/upload') return uploadDocument(req, auth);

  const loadDocsId = extractParam(path, /^\/api\/documents\/load\/([^/]+)$/);
  if (loadDocsId && req.method === 'GET') return listByLoad(loadDocsId);

  const downloadId = extractParam(path, /^\/api\/documents\/([^/]+)\/download$/);
  if (downloadId && req.method === 'GET') return downloadDocument(downloadId);

  const docId = extractParam(path, /^\/api\/documents\/([^/]+)$/);
  if (docId) {
    if (req.method === 'GET') return getDocumentMeta(docId);
    if (req.method === 'DELETE') return deleteDocument(docId);
  }

  return json(405, { error: 'method_not_allowed' });
};

export const config: Config = {
  path: [
    '/api/documents/upload',
    '/api/documents/load/:loadId',
    '/api/documents/:id',
    '/api/documents/:id/download',
  ],
};
