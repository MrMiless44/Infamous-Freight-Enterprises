import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

describe('check-client-env-safety.sh', () => {
  const sourceScript = path.resolve(__dirname, '..', '..', '..', 'scripts', 'check-client-env-safety.sh');

  function setupRepoFixture(prefix: string): { tmp: string; scriptPath: string; webDir: string } {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    const scriptDir = path.join(tmp, 'scripts');
    const webDir = path.join(tmp, 'apps', 'web');

    fs.mkdirSync(scriptDir, { recursive: true });
    fs.mkdirSync(webDir, { recursive: true });

    const scriptPath = path.join(scriptDir, 'check-client-env-safety.sh');
    fs.copyFileSync(sourceScript, scriptPath);
    fs.chmodSync(scriptPath, 0o755);

    return { tmp, scriptPath, webDir };
  }

  it('passes for VITE_* and approved Sentry keys', () => {
    const { tmp, scriptPath, webDir } = setupRepoFixture('client-env-safe-');
    fs.writeFileSync(
      path.join(webDir, '.env.example'),
      [
        'VITE_API_URL=https://api.example.com',
        'VITE_SUPABASE_URL=https://project.supabase.co',
        'SENTRY_ORG=infamous',
        'SENTRY_PROJECT=frontend',
      ].join('\n'),
    );

    const result = spawnSync('/usr/bin/bash', [scriptPath], {
      cwd: tmp,
      encoding: 'utf8',
      env: process.env,
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Frontend env safety check passed');
  });

  it('fails when server-side secrets appear in frontend env files', () => {
    const { tmp, scriptPath, webDir } = setupRepoFixture('client-env-secret-');
    fs.writeFileSync(
      path.join(webDir, '.env.production'),
      [
        'VITE_API_URL=https://api.example.com',
        'STRIPE_SECRET_KEY=sk_live_should_not_be_here',
      ].join('\n'),
    );

    const result = spawnSync('/usr/bin/bash', [scriptPath], {
      cwd: tmp,
      encoding: 'utf8',
      env: process.env,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('disallowed key STRIPE_SECRET_KEY');
  });

  it('fails when non-VITE non-allowlisted keys are present', () => {
    const { tmp, scriptPath, webDir } = setupRepoFixture('client-env-key-policy-');
    fs.writeFileSync(
      path.join(webDir, '.env.local'),
      [
        'VITE_API_URL=https://api.example.com',
        'WEB_INTERNAL_TOKEN=unexpected',
      ].join('\n'),
    );

    const result = spawnSync('/usr/bin/bash', [scriptPath], {
      cwd: tmp,
      encoding: 'utf8',
      env: process.env,
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('non-public key WEB_INTERNAL_TOKEN must be VITE_* or explicitly allowlisted');
  });
});
