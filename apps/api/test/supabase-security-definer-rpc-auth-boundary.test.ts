import path from 'path';
import { readFileSync } from 'fs';

describe('supabase security definer rpc auth boundary migration', () => {
  const migrationPath = path.resolve(
    __dirname,
    '../../../supabase/migrations/20260516002000_restrict_sensitive_rpc_execution.sql',
  );
  const sql = readFileSync(migrationPath, 'utf8');

  it('keeps sensitive RPCs as security invoker', () => {
    expect(sql).toContain('ALTER FUNCTION public.review_document(uuid, text, text) SECURITY INVOKER;');
    expect(sql).toContain('ALTER FUNCTION public.verify_profile(uuid, boolean, text) SECURITY INVOKER;');
  });

  it('revokes authenticated role execution for sensitive RPCs', () => {
    expect(sql).toContain(
      'REVOKE EXECUTE ON FUNCTION public.review_document(uuid, text, text) FROM authenticated;',
    );
    expect(sql).toContain(
      'REVOKE EXECUTE ON FUNCTION public.verify_profile(uuid, boolean, text) FROM authenticated;',
    );
    expect(sql).not.toContain('GRANT EXECUTE ON FUNCTION public.review_document(uuid, text, text) TO authenticated;');
    expect(sql).not.toContain('GRANT EXECUTE ON FUNCTION public.verify_profile(uuid, boolean, text) TO authenticated;');
  });

  it('retains server-side execution path through service_role only', () => {
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.review_document(uuid, text, text) TO service_role;');
    expect(sql).toContain('GRANT EXECUTE ON FUNCTION public.verify_profile(uuid, boolean, text) TO service_role;');
  });
});
