import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 25,
  duration: '45s',
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<2500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'https://www.infamousfreight.com';

export default function () {
  const socketHandshake = http.get(`${BASE_URL}/socket.io/?EIO=4&transport=polling`);

  check(socketHandshake, {
    'socket handshake reachable': (r) => r.status === 200,
    'socket handshake has payload': (r) => !!r.body,
  });

  sleep(1);
}
