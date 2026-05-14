import * as Sentry from '@sentry/node';

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.CONTEXT ?? 'development',
    sendDefaultPii: true,
    tracesSampleRate: 0,
  });
  initialized = true;
}

export function captureException(err: unknown): void {
  if (initialized) Sentry.captureException(err);
}

export function withSentry<T extends (...args: never[]) => Promise<Response>>(
  handler: T,
): (...args: Parameters<T>) => Promise<Response> {
  initSentry();
  return async (...args: Parameters<T>): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (err) {
      captureException(err);
      await Sentry.flush(2000);
      return new Response(JSON.stringify({ error: 'internal_error' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }
  };
}
