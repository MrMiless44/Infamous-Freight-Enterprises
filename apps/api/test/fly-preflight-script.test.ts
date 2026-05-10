import fs from 'fs';
import path from 'path';

describe('fly preflight script', () => {
  const scriptPath = path.resolve(__dirname, '../../../scripts/fly-preflight.sh');

  it('exists and uses strict bash mode', () => {
    const content = fs.readFileSync(scriptPath, 'utf8');

    expect(content.startsWith('#!/usr/bin/env bash')).toBe(true);
    expect(content).toContain('set -euo pipefail');
  });

  it('includes auth/status and health checks', () => {
    const content = fs.readFileSync(scriptPath, 'utf8');

    expect(content).toContain('fly auth whoami');
    expect(content).toContain('fly status --app "${APP_NAME}"');
    expect(content).toContain('curl -fsS "${APP_URL}/api/health" >/dev/null');
    expect(content).toContain('curl -fsS "${API_URL}/api/health" >/dev/null');
  });
});
