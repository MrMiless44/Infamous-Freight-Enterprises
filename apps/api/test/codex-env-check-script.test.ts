import path from 'node:path';
import { spawnSync } from 'node:child_process';

describe('codex-env-check.sh', () => {
  const scriptPath = path.resolve(__dirname, '..', '..', '..', 'scripts', 'codex-env-check.sh');

  it('fails in strict mode when placeholders are configured', () => {
    const result = spawnSync('/usr/bin/bash', [scriptPath, '--strict'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://user:password@host:5432/db',
        STRIPE_SECRET_KEY: 'sk_live_placeholder',
        STRIPE_WEBHOOK_SECRET: 'whsec_real_secret',
        STRIPE_PUBLISHABLE_KEY: 'pk_live_real',
        VITE_STRIPE_PUBLIC_KEY: 'pk_live_real',
        SUPABASE_URL: 'https://placeholder.supabase.co',
        SUPABASE_SERVICE_KEY: 'service_role_real',
        SUPABASE_ANON_KEY: 'anon_real',
        SUPABASE_SERVICE_ROLE_KEY: 'service_role_real',
        SUPABASE_JWT_SECRET: 'jwt_real',
        VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
        VITE_SUPABASE_DATABASE_URL: 'https://placeholder.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_real',
        VITE_SUPABASE_ANON_KEY: 'anon_real',
        NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
      },
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('appears to still use a placeholder value');
    expect(result.stdout).toContain('Placeholder-looking values:');
  });

  it('warns when REDIS_HOST is localhost', () => {
    const result = spawnSync('/usr/bin/bash', [scriptPath], {
      encoding: 'utf8',
      env: {
        ...process.env,
        REDIS_HOST: 'localhost',
      },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('REDIS_HOST is localhost');
  });

  it('fails in strict mode when STRIPE_ACCOUNT_ID is malformed', () => {
    const result = spawnSync('/usr/bin/bash', [scriptPath, '--strict'], {
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        DATABASE_URL: 'postgresql://user:password@host:5432/db',
        STRIPE_ACCOUNT_ID: 'not-a-stripe-account',
        STRIPE_SECRET_KEY: 'sk_live_real',
        STRIPE_WEBHOOK_SECRET: 'whsec_real_secret',
        STRIPE_PUBLISHABLE_KEY: 'pk_live_real',
        VITE_STRIPE_PUBLIC_KEY: 'pk_live_real',
        SUPABASE_URL: 'https://project.supabase.co',
        SUPABASE_SERVICE_KEY: 'service_role_real',
        SUPABASE_SERVICE_ROLE_KEY: 'service_role_real',
        SUPABASE_JWT_SECRET: 'jwt_real',
        SUPABASE_ANON_KEY: 'anon_real',
        VITE_SUPABASE_URL: 'https://project.supabase.co',
        VITE_SUPABASE_DATABASE_URL: 'https://project.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_real',
        VITE_SUPABASE_ANON_KEY: 'anon_real',
        NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
        WEB_APP_URL: 'https://www.infamousfreight.com',
        CORS_ORIGINS: 'https://www.infamousfreight.com',
      },
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('STRIPE_ACCOUNT_ID does not look like a Stripe account ID');
  });
});
