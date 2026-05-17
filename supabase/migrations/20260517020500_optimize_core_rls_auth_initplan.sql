-- Optimize high-traffic RLS policies by wrapping auth.uid() calls in SELECT.
-- This follows Supabase advisor guidance so auth helper calls are evaluated once per statement instead of per row.
-- Logic is intentionally unchanged: same tenant/org boundaries, same roles, same commands.

DO $$
BEGIN
  IF to_regclass('public.alerts') IS NOT NULL THEN
    DROP POLICY IF EXISTS alerts_select_org ON public.alerts;
    CREATE POLICY alerts_select_org ON public.alerts
      FOR SELECT TO authenticated
      USING (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      );

    DROP POLICY IF EXISTS alerts_insert_org ON public.alerts;
    CREATE POLICY alerts_insert_org ON public.alerts
      FOR INSERT TO authenticated
      WITH CHECK (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      );

    DROP POLICY IF EXISTS alerts_update_org ON public.alerts;
    CREATE POLICY alerts_update_org ON public.alerts
      FOR UPDATE TO authenticated
      USING (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      )
      WITH CHECK (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      );

    DROP POLICY IF EXISTS alerts_delete_org ON public.alerts;
    CREATE POLICY alerts_delete_org ON public.alerts
      FOR DELETE TO authenticated
      USING (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      );
  END IF;

  IF to_regclass('public.carriers') IS NOT NULL THEN
    DROP POLICY IF EXISTS carriers_select_org ON public.carriers;
    CREATE POLICY carriers_select_org ON public.carriers
      FOR SELECT TO authenticated
      USING (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      );

    DROP POLICY IF EXISTS carriers_insert_org ON public.carriers;
    CREATE POLICY carriers_insert_org ON public.carriers
      FOR INSERT TO authenticated
      WITH CHECK (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      );

    DROP POLICY IF EXISTS carriers_update_org ON public.carriers;
    CREATE POLICY carriers_update_org ON public.carriers
      FOR UPDATE TO authenticated
      USING (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      )
      WITH CHECK (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      );

    DROP POLICY IF EXISTS carriers_delete_org ON public.carriers;
    CREATE POLICY carriers_delete_org ON public.carriers
      FOR DELETE TO authenticated
      USING (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      );
  END IF;

  IF to_regclass('public.shipments') IS NOT NULL THEN
    DROP POLICY IF EXISTS shipments_select_org ON public.shipments;
    CREATE POLICY shipments_select_org ON public.shipments
      FOR SELECT TO authenticated
      USING (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      );

    DROP POLICY IF EXISTS shipments_insert_org ON public.shipments;
    CREATE POLICY shipments_insert_org ON public.shipments
      FOR INSERT TO authenticated
      WITH CHECK (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      );

    DROP POLICY IF EXISTS shipments_update_org ON public.shipments;
    CREATE POLICY shipments_update_org ON public.shipments
      FOR UPDATE TO authenticated
      USING (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      )
      WITH CHECK (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      );

    DROP POLICY IF EXISTS shipments_delete_org ON public.shipments;
    CREATE POLICY shipments_delete_org ON public.shipments
      FOR DELETE TO authenticated
      USING (
        organization_id = (
          SELECT profiles.organization_id
          FROM public.profiles
          WHERE profiles.id = (SELECT auth.uid())
        )
      );
  END IF;

  IF to_regclass('public.loads') IS NOT NULL THEN
    DROP POLICY IF EXISTS loads_select_company_dispatcher_or_admin ON public.loads;
    CREATE POLICY loads_select_company_dispatcher_or_admin ON public.loads
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
              AND p.company_id = loads.company_id
          )
        )
      );
  END IF;
END
$$;
