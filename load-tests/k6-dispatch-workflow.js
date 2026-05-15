import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: Number(__ENV.VUS || 5),
  duration: __ENV.DURATION || '30s',
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<2500'],
  },
};

const API_URL = __ENV.API_URL || 'https://infamous-freight-api.fly.dev';
const TENANT_ID = __ENV.TENANT_ID || '';
const USER_ROLE = __ENV.USER_ROLE || 'owner';
const SUBSCRIPTION_STATUS = __ENV.SUBSCRIPTION_STATUS || 'active';

function headers() {
  const base = { 'Content-Type': 'application/json' };

  if (!TENANT_ID) {
    return base;
  }

  return {
    ...base,
    'x-tenant-id': TENANT_ID,
    'x-user-role': USER_ROLE,
    'x-subscription-status': SUBSCRIPTION_STATUS,
  };
}

export default function () {
  const health = http.get(`${API_URL}/api/health/ready`);
  check(health, {
    'health status is acceptable': (r) => r.status === 200 || r.status === 503,
  });

  if (TENANT_ID) {
    const loads = http.get(`${API_URL}/api/loads`, { headers: headers() });
    check(loads, {
      'loads endpoint reachable': (r) => [200, 401, 402, 403].includes(r.status),
    });

    const drivers = http.get(`${API_URL}/api/drivers`, { headers: headers() });
    check(drivers, {
      'drivers endpoint reachable': (r) => [200, 401, 402, 403].includes(r.status),
    });

    const shipments = http.get(`${API_URL}/api/shipments`, { headers: headers() });
    check(shipments, {
      'shipments endpoint reachable': (r) => [200, 401, 402, 403].includes(r.status),
    });
  }

  sleep(1);
}
