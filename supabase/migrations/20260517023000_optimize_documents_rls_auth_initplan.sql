-- Optimize documents RLS auth helper evaluation without consolidating overlapping access policy logic.
-- This intentionally preserves existing document access behavior while wrapping auth.uid() and auth.jwt()
-- calls in SELECT subqueries so they are evaluated once per statement where possible.

DO $$
BEGIN
  IF to_regclass('public.documents') IS NOT NULL THEN
    DROP POLICY IF EXISTS documents_select_auth ON public.documents;
    CREATE POLICY documents_select_auth ON public.documents
      FOR SELECT TO authenticated
      USING (
        owner_id = (SELECT auth.uid())
        OR company_id = (((SELECT auth.jwt()) ->> 'company_id')::uuid)
      );

    DROP POLICY IF EXISTS documents_insert_auth ON public.documents;
    CREATE POLICY documents_insert_auth ON public.documents
      FOR INSERT TO authenticated
      WITH CHECK (
        owner_id = (SELECT auth.uid())
        OR company_id = (((SELECT auth.jwt()) ->> 'company_id')::uuid)
      );

    DROP POLICY IF EXISTS documents_update_auth ON public.documents;
    CREATE POLICY documents_update_auth ON public.documents
      FOR UPDATE TO authenticated
      USING (
        owner_id = (SELECT auth.uid())
        OR company_id = (((SELECT auth.jwt()) ->> 'company_id')::uuid)
      )
      WITH CHECK (
        owner_id = (SELECT auth.uid())
        OR company_id = (((SELECT auth.jwt()) ->> 'company_id')::uuid)
      );

    DROP POLICY IF EXISTS documents_delete_auth ON public.documents;
    CREATE POLICY documents_delete_auth ON public.documents
      FOR DELETE TO authenticated
      USING (
        owner_id = (SELECT auth.uid())
        OR company_id = (((SELECT auth.jwt()) ->> 'company_id')::uuid)
      );

    DROP POLICY IF EXISTS documents_select_company_dispatcher_or_admin ON public.documents;
    CREATE POLICY documents_select_company_dispatcher_or_admin ON public.documents
      FOR SELECT TO authenticated
      USING (
        is_admin()
        OR (
          is_dispatcher()
          AND EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = (SELECT auth.uid())
              AND p.company_id IS NOT NULL
              AND p.company_id = documents.company_id
          )
        )
      );

    DROP POLICY IF EXISTS documents_review_admin_or_dispatcher ON public.documents;
    CREATE POLICY documents_review_admin_or_dispatcher ON public.documents
      FOR UPDATE TO authenticated
      USING (
        is_admin()
        OR (
          is_dispatcher()
          AND EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = (SELECT auth.uid())
              AND p.company_id IS NOT NULL
              AND p.company_id = documents.company_id
          )
        )
      )
      WITH CHECK (
        is_admin()
        OR (
          is_dispatcher()
          AND EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = (SELECT auth.uid())
              AND p.company_id IS NOT NULL
              AND p.company_id = documents.company_id
          )
        )
      );
  END IF;
END
$$;
