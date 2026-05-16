-- Supabase hardening: restrict sensitive profile/document RPC execution to server-side role.
DO $$
BEGIN
  IF to_regprocedure('public.review_document(uuid, text, text)') IS NOT NULL THEN
    ALTER FUNCTION public.review_document(uuid, text, text) SECURITY INVOKER;
    ALTER FUNCTION public.review_document(uuid, text, text) SET search_path = public, pg_temp;
    REVOKE EXECUTE ON FUNCTION public.review_document(uuid, text, text) FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.review_document(uuid, text, text) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.review_document(uuid, text, text) FROM authenticated;
    GRANT EXECUTE ON FUNCTION public.review_document(uuid, text, text) TO service_role;
  END IF;

  IF to_regprocedure('public.verify_profile(uuid, boolean, text)') IS NOT NULL THEN
    ALTER FUNCTION public.verify_profile(uuid, boolean, text) SECURITY INVOKER;
    ALTER FUNCTION public.verify_profile(uuid, boolean, text) SET search_path = public, pg_temp;
    REVOKE EXECUTE ON FUNCTION public.verify_profile(uuid, boolean, text) FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.verify_profile(uuid, boolean, text) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.verify_profile(uuid, boolean, text) FROM authenticated;
    GRANT EXECUTE ON FUNCTION public.verify_profile(uuid, boolean, text) TO service_role;
  END IF;
END
$$;
