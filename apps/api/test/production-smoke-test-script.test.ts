import fs from 'fs';
import path from 'path';

describe('production smoke test script', () => {
  const scriptPath = path.resolve(__dirname, '../../../scripts/production-smoke-test.sh');

  it('uses strict bash mode', () => {
    const content = fs.readFileSync(scriptPath, 'utf8');

    expect(content.startsWith('#!/usr/bin/env bash')).toBe(true);
    expect(content).toContain('set -euo pipefail');
  });

  it('checks API liveness and readiness on /api/health routes', () => {
    const content = fs.readFileSync(scriptPath, 'utf8');

    expect(content).toContain('curl --fail --show-error --silent "${API_URL%/}/api/health/live"');
    expect(content).toContain('curl --fail --show-error --silent "${API_URL%/}/api/health/ready"');
    expect(content).not.toContain('"${API_URL%/}/health/live"');
    expect(content).not.toContain('"${API_URL%/}/health/ready"');
  });
});
