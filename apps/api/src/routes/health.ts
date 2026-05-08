import { Router } from 'express';
import { DataStore } from '../data-store';
import { wrapAsync } from '../shared/http';

type ServiceStatus = 'ok' | 'degraded' | 'unavailable';

type DeepHealthResponse = {
  status: 'ok' | 'degraded';
  timestamp: string;
  services: {
    api: 'running';
    database: 'connected' | 'disconnected';
    redis: ServiceStatus;
    stripe: ServiceStatus;
  };
};

type HealthResponse = {
  status: 'ok' | 'degraded';
  timestamp: string;
  services: {
    api?: 'running';
    database?: 'connected' | 'disconnected';
  };
};

function createLivenessResponse(): HealthResponse {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: { api: 'running' },
  };
}

async function createReadinessResponse(dataStore: DataStore): Promise<{ statusCode: number; body: HealthResponse }> {
  const database = await dataStore.healthCheck();
  const status = database === 'connected' ? 'ok' : 'degraded';

  return {
    statusCode: status === 'ok' ? 200 : 503,
    body: {
      status,
      timestamp: new Date().toISOString(),
      services: { database },
    },
  };
}

async function checkRedis(): Promise<ServiceStatus> {
  if (!process.env.REDIS_HOST) return 'unavailable';

  try {
    const net = await import('net');
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const port = parseInt(process.env.REDIS_PORT || '6379', 10);
      socket.setTimeout(3000);
      socket.on('connect', () => { socket.destroy(); resolve('ok'); });
      socket.on('timeout', () => { socket.destroy(); resolve('degraded'); });
      socket.on('error', () => { socket.destroy(); resolve('degraded'); });
      socket.connect(port, process.env.REDIS_HOST!);
    });
  } catch {
    return 'degraded';
  }
}

async function checkStripe(): Promise<ServiceStatus> {
  if (!process.env.STRIPE_SECRET_KEY) return 'unavailable';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch('https://api.stripe.com/v1/balance', {
      method: 'GET',
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok ? 'ok' : 'degraded';
  } catch {
    return 'degraded';
  }
}

export function createHealthRoutes(dataStore: DataStore): Router {
  const router = Router();

  router.get('/health', wrapAsync(async (_req, res) => {
    const readiness = await createReadinessResponse(dataStore);
    res.status(200).json({
      ...readiness.body,
      status: 'ok',
      services: {
        api: 'running',
        ...readiness.body.services,
      },
    });
  }));

  router.get('/health/live', (_req, res) => {
    res.status(200).json(createLivenessResponse());
  });

  router.get('/health/ready', wrapAsync(async (_req, res) => {
    const readiness = await createReadinessResponse(dataStore);
    res.status(readiness.statusCode).json(readiness.body);
  }));

  router.get('/health/deep', wrapAsync(async (_req, res) => {
    const [database, redis, stripe] = await Promise.all([
      dataStore.healthCheck(),
      checkRedis(),
      checkStripe(),
    ]);

    const allOk = database === 'connected' && redis !== 'degraded' && stripe !== 'degraded';

    const body: DeepHealthResponse = {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        api: 'running',
        database,
        redis,
        stripe,
      },
    };

    res.status(allOk ? 200 : 503).json(body);
  }));

  router.get('/api/health', wrapAsync(async (_req, res) => {
    const readiness = await createReadinessResponse(dataStore);
    res.status(readiness.statusCode).json(readiness.body);
  }));

  router.get('/api/health/live', (_req, res) => {
    res.status(200).json(createLivenessResponse());
  });

  router.get('/api/health/ready', wrapAsync(async (_req, res) => {
    const readiness = await createReadinessResponse(dataStore);
    res.status(readiness.statusCode).json(readiness.body);
  }));

  router.get('/api/health/deep', wrapAsync(async (_req, res) => {
    const [database, redis, stripe] = await Promise.all([
      dataStore.healthCheck(),
      checkRedis(),
      checkStripe(),
    ]);

    const allOk = database === 'connected' && redis !== 'degraded' && stripe !== 'degraded';

    const body: DeepHealthResponse = {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        api: 'running',
        database,
        redis,
        stripe,
      },
    };

    res.status(allOk ? 200 : 503).json(body);
  }));

  router.get('/api/version', (_req, res) => {
    res.status(200).json({
      service: 'infamous-freight-api',
      version: process.env.APP_VERSION ?? process.env.npm_package_version ?? 'unknown',
      commit:
        process.env.GIT_SHA ??
        process.env.FLY_IMAGE_REF ??
        process.env.SOURCE_COMMIT ??
        'unknown',
      buildTime: process.env.BUILD_TIME ?? 'unknown',
      node: process.version,
    });
  });

  return router;
}
