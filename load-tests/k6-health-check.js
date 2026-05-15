import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const response = http.get(`${BASE_URL}/api/health/ready`);

  check(response, {
    'status is 200 or 503': (r) => r.status === 200 || r.status === 503,
    'response received': (r) => !!r.body,
  });

  sleep(1);
}
