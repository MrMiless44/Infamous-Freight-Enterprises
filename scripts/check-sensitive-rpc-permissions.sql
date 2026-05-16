-- Verifies sensitive SECURITY DEFINER RPC functions are not directly executable by browser roles.
-- Expected:
-- - authenticated: false
-- - anon: false
-- - service_role: true

select
  has_function_privilege('authenticated', 'public.review_document(uuid,text,text)', 'execute') as authenticated_can_review_document,
  has_function_privilege('anon', 'public.review_document(uuid,text,text)', 'execute') as anon_can_review_document,
  has_function_privilege('service_role', 'public.review_document(uuid,text,text)', 'execute') as service_role_can_review_document,
  has_function_privilege('authenticated', 'public.verify_profile(uuid,boolean,text)', 'execute') as authenticated_can_verify_profile,
  has_function_privilege('anon', 'public.verify_profile(uuid,boolean,text)', 'execute') as anon_can_verify_profile,
  has_function_privilege('service_role', 'public.verify_profile(uuid,boolean,text)', 'execute') as service_role_can_verify_profile;
