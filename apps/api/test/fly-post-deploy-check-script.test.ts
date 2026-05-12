import fs from 'fs';
import path from 'path';

describe('fly post deploy check script', () => {
  const scriptPath = path.resolve(__dirname, '../../../scripts/fly-post-deploy-check.sh');

  it('exists and is executable shell script content', () => {
    const content = fs.readFileSync(scriptPath, 'utf8');

    expect(content.startsWith('#!/usr/bin/env bash')).toBe(true);
    expect(content).toContain('set -euo pipefail');
  });

  it('includes required Fly and health verification commands', () => {
    const content = fs.readFileSync(scriptPath, 'utf8');

    expect(content).toContain('flyctl auth whoami');
    expect(content).toContain('flyctl status --app "${APP_NAME}"');
    expect(content).toContain('flyctl checks list --app "${APP_NAME}"');
    expect(content).toContain('secrets_output="$(flyctl secrets list --app "${APP_NAME}")"');
    expect(content).toContain("grep -qx 'DATABASE_URL'");
    expect(content).toContain('ERROR: DATABASE_URL secret is missing for ${APP_NAME}.');
    expect(content).toContain('ALLOW_MULTI_IMAGE_DEPLOY="${ALLOW_MULTI_IMAGE_DEPLOY:-false}"');
    expect(content).toContain('flyctl machine list --app "${APP_NAME}" --json');
    expect(content).toContain('ERROR: ${APP_NAME} has ${unique_image_count} deployed images across machines.');
    expect(content).toContain('machine(s) with ${image}: ${ids}');
    expect(content).toContain('WARN: Continuing because ALLOW_MULTI_IMAGE_DEPLOY=true');
    expect(content).toContain('curl -fsS "${APP_URL}/api/health/live" >/dev/null');
    expect(content).toContain('curl -fsS "${APP_URL}/api/health/ready" >/dev/null');
    expect(content).toContain('curl -fsS "${API_URL}/api/health/live" >/dev/null');
    expect(content).toContain('curl -fsS "${API_URL}/api/health/ready" >/dev/null');
  });
});
