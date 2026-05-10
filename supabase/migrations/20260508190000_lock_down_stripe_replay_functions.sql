-- Restrict replay helper functions to privileged roles only.
-- Keep migration idempotent in case functions differ across environments.
DO $$
BEGIN
  IF to_regprocedure('public.stripe_webhook_mark_for_replay(text)') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.stripe_webhook_mark_for_replay(text) FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.stripe_webhook_mark_for_replay(text) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.stripe_webhook_mark_for_replay(text) FROM authenticated;
  END IF;

  IF to_regprocedure('public.stripe_webhook_replay_candidates(integer)') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.stripe_webhook_replay_candidates(integer) FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.stripe_webhook_replay_candidates(integer) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.stripe_webhook_replay_candidates(integer) FROM authenticated;
  END IF;
END
$$;
