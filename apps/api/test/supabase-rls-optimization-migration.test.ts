import path from 'path';
import { readFileSync } from 'fs';

describe('supabase RLS optimization migration', () => {
  const migrationPath = path.resolve(
    __dirname,
    '../../../supabase/migrations/20260515235100_optimize_high_traffic_rls_policies.sql',
  );
  const sql = readFileSync(migrationPath, 'utf8');

  it('targets all high-priority tables from the issue scope', () => {
    expect(sql).toContain("'loads'");
    expect(sql).toContain("'shipments'");
    expect(sql).toContain("'documents'");
    expect(sql).toContain("'carriers'");
    expect(sql).toContain("'alerts'");
    expect(sql).toContain("'organizations'");
    expect(sql).toContain("'bids'");
  });

  it('rewrites auth helpers to initplan-friendly select form', () => {
    expect(sql).toContain("regexp_replace(optimized_using, 'auth\\\\.uid\\\\s*\\\\(\\\\s*\\\\)', '(select auth.uid())', 'g')");
    expect(sql).toContain("regexp_replace(optimized_with_check, 'auth\\\\.uid\\\\s*\\\\(\\\\s*\\\\)', '(select auth.uid())', 'g')");
    expect(sql).toContain("regexp_replace(optimized_using, 'auth\\\\.role\\\\s*\\\\(\\\\s*\\\\)', '(select auth.role())', 'g')");
    expect(sql).toContain("regexp_replace(optimized_with_check, 'auth\\\\.role\\\\s*\\\\(\\\\s*\\\\)', '(select auth.role())', 'g')");
  });

  it('deduplicates exact overlapping permissive policies', () => {
    expect(sql).toContain("AND permissive = 'PERMISSIVE'");
    expect(sql).toContain('DROP POLICY IF EXISTS');
  });
});
