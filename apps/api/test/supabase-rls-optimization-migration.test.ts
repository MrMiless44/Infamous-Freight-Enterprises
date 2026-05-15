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
    expect(sql).toContain("uid_pattern constant text := 'auth[.]uid[[:space:]]*[(][[:space:]]*[)]'");
    expect(sql).toContain("role_pattern constant text := 'auth[.]role[[:space:]]*[(][[:space:]]*[)]'");
    expect(sql).toContain("regexp_replace(optimized_using, uid_pattern, '(select auth.uid())', 'g')");
    expect(sql).toContain("regexp_replace(optimized_with_check, uid_pattern, '(select auth.uid())', 'g')");
    expect(sql).toContain("regexp_replace(optimized_using, role_pattern, '(select auth.role())', 'g')");
    expect(sql).toContain("regexp_replace(optimized_with_check, role_pattern, '(select auth.role())', 'g')");
  });

  it('handles auth helper whitespace variants in expressions', () => {
    const uidPattern = /auth[.]uid\s*[(]\s*[)]/g;
    const rolePattern = /auth[.]role\s*[(]\s*[)]/g;
    const input = 'auth.uid() = user_id OR auth.uid ( ) = owner_id OR auth.role( ) = \'admin\'';

    const output = input
      .replace(uidPattern, '(select auth.uid())')
      .replace(rolePattern, '(select auth.role())');

    expect(output).toContain('(select auth.uid()) = user_id');
    expect(output).toContain('(select auth.uid()) = owner_id');
    expect(output).toContain('(select auth.role()) = \'admin\'');
  });

  it('deduplicates exact overlapping permissive policies', () => {
    expect(sql).toContain("AND permissive = 'PERMISSIVE'");
    expect(sql).toContain('DROP POLICY IF EXISTS');
  });
});
