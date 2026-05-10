-- Security fix: revoke public access to stripe webhook replay helper functions.
-- These should only be callable by service_role (used by backend/admin operations).
-- Identified by Supabase security advisor audit on 2026-05-08.

revoke execute on function public.stripe_webhook_mark_for_replay(text) from anon;
revoke execute on function public.stripe_webhook_mark_for_replay(text) from authenticated;
revoke execute on function public.stripe_webhook_replay_candidates(integer) from anon;
revoke execute on function public.stripe_webhook_replay_candidates(integer) from authenticated;
