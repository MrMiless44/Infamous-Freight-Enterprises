import path from 'node:path';
import { spawnSync } from 'node:child_process';

describe('check-database-url.sh', () => {
  const scriptPath = path.resolve(__dirname, '..', '..', '..', 'scripts', 'check-database-url.sh');

  test('fails when Database_URL uses malformed Supabase database target', () => {
    const result = spawnSync('/usr/bin/bash', [scriptPath], {
      encoding: 'utf8',
      env: {
        ...process.env,
        DATABASE_URL: '',
        Database_URL: 'postgresql://postgres:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres.wnaievjffghrztjuvutp?sslmode=require',
      },
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('Checking Database_URL');
    expect(result.stdout).toContain("appears to use 'postgres.wnaievjffghrztjuvutp' as the database name");
  });

  test('passes for a valid Supabase pooler URL provided via database_url alias', () => {
    const result = spawnSync('/usr/bin/bash', [scriptPath], {
      encoding: 'utf8',
      env: {
        ...process.env,
        DATABASE_URL: '',
        database_url: 'postgresql://postgres:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require',
      },
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Checking database_url');
    expect(result.stdout).toContain('database_url database name looks valid for Supabase');
  });
});
