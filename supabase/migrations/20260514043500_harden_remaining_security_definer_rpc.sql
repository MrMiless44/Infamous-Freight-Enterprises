-- Supabase hardening: remove remaining authenticated SECURITY DEFINER exposure
-- for helper/admin RPCs flagged by Security Advisor.
DO $$
BEGIN
  IF to_regprocedure('public.review_document(uuid, text, text)') IS NOT NULL THEN
    ALTER FUNCTION public.review_document(uuid, text, text) SECURITY INVOKER;
    ALTER FUNCTION public.review_document(uuid, text, text) SET search_path = public, pg_temp;
    REVOKE EXECUTE ON FUNCTION public.review_document(uuid, text, text) FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.review_document(uuid, text, text) FROM anon;
    GRANT EXECUTE ON FUNCTION public.review_document(uuid, text, text) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.review_document(uuid, text, text) TO service_role;
  END IF;

  IF to_regprocedure('public.verify_profile(uuid, boolean, text)') IS NOT NULL THEN
    ALTER FUNCTION public.verify_profile(uuid, boolean, text) SECURITY INVOKER;
    ALTER FUNCTION public.verify_profile(uuid, boolean, text) SET search_path = public, pg_temp;
    REVOKE EXECUTE ON FUNCTION public.verify_profile(uuid, boolean, text) FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.verify_profile(uuid, boolean, text) FROM anon;
    GRANT EXECUTE ON FUNCTION public.verify_profile(uuid, boolean, text) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.verify_profile(uuid, boolean, text) TO service_role;
  END IF;
END
$$;
