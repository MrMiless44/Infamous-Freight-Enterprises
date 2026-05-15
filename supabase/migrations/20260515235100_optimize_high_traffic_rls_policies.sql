-- Supabase RLS performance hardening for high-traffic tables.
-- Rewrites auth helper calls to initplan-friendly subselects and removes exact duplicate
-- permissive policies to reduce policy evaluation overhead.
-- High-traffic candidates are tables with sustained advisor warnings and frequent
-- tenant-scoped reads/writes; review and expand this list during the monthly operational
-- review documented in docs/SUPABASE-HARDENING-RUNBOOK.md.
DO $$
DECLARE
  target_tables constant text[] := ARRAY[
    'loads',
    'shipments',
    'documents',
    'carriers',
    'alerts',
    'organizations',
    'bids'
  ];
  policy_row record;
  duplicate_row record;
  optimized_using text;
  optimized_with_check text;
  uid_pattern constant text := 'auth[.]uid[[:space:]]*[(][[:space:]]*[)]';
  role_pattern constant text := 'auth[.]role[[:space:]]*[(][[:space:]]*[)]';
BEGIN
  -- Audit + optimize each policy expression on priority tables.
  FOR policy_row IN
    SELECT
      schemaname,
      tablename,
      policyname,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY(target_tables)
  LOOP
    optimized_using := policy_row.qual;
    optimized_with_check := policy_row.with_check;

    IF optimized_using IS NOT NULL THEN
      optimized_using := regexp_replace(optimized_using, uid_pattern, '(select auth.uid())', 'g');
      optimized_using := regexp_replace(optimized_using, role_pattern, '(select auth.role())', 'g');
    END IF;

    IF optimized_with_check IS NOT NULL THEN
      optimized_with_check := regexp_replace(optimized_with_check, uid_pattern, '(select auth.uid())', 'g');
      optimized_with_check := regexp_replace(optimized_with_check, role_pattern, '(select auth.role())', 'g');
    END IF;

    IF optimized_using IS NOT NULL AND (
      optimized_using ~ ';'
      OR optimized_using ~ '--'
      OR optimized_using ~ '/\\*'
    ) THEN
      RAISE EXCEPTION 'Unsafe optimized USING expression detected for policy % on %.%',
        policy_row.policyname,
        policy_row.schemaname,
        policy_row.tablename;
    END IF;

    IF optimized_with_check IS NOT NULL AND (
      optimized_with_check ~ ';'
      OR optimized_with_check ~ '--'
      OR optimized_with_check ~ '/\\*'
    ) THEN
      RAISE EXCEPTION 'Unsafe optimized WITH CHECK expression detected for policy % on %.%',
        policy_row.policyname,
        policy_row.schemaname,
        policy_row.tablename;
    END IF;

    IF optimized_using IS DISTINCT FROM policy_row.qual
      OR optimized_with_check IS DISTINCT FROM policy_row.with_check THEN
      RAISE NOTICE '%',
        'Optimizing policy '
        || policy_row.schemaname
        || '.'
        || policy_row.tablename
        || ':'
        || policy_row.policyname;
      EXECUTE format(
        'ALTER POLICY %I ON %I.%I %s%s',
        policy_row.policyname,
        policy_row.schemaname,
        policy_row.tablename,
        CASE
          WHEN optimized_using IS NOT NULL THEN format('USING (%s) ', optimized_using)
          ELSE ''
        END,
        CASE
          WHEN optimized_with_check IS NOT NULL THEN format('WITH CHECK (%s)', optimized_with_check)
          ELSE ''
        END
      );
    END IF;
  END LOOP;

  -- Consolidate overlapping permissive policies where exact duplicates exist.
  -- Keep the alphabetically first policy name and drop later duplicates.
  FOR duplicate_row IN
    WITH ranked AS (
      SELECT
        schemaname,
        tablename,
        policyname,
        row_number() OVER (
          PARTITION BY
            schemaname,
            tablename,
            permissive,
            cmd,
            roles::text,
            coalesce(qual, ''),
            coalesce(with_check, '')
          ORDER BY policyname
        ) AS row_rank
      FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = ANY(target_tables)
        AND permissive = 'PERMISSIVE'
    )
    SELECT schemaname, tablename, policyname
    FROM ranked
    WHERE row_rank > 1
  LOOP
    RAISE NOTICE '%',
      'Dropping duplicate permissive policy '
      || duplicate_row.schemaname
      || '.'
      || duplicate_row.tablename
      || ':'
      || duplicate_row.policyname;
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      duplicate_row.policyname,
      duplicate_row.schemaname,
      duplicate_row.tablename
    );
  END LOOP;
END
$$;
