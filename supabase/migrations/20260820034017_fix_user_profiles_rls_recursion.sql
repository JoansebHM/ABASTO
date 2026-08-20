-- 0003_fix_rls_recursion.sql
-- Fix: infinite recursion detected in policy for relation "user_profiles" (42P17)
--
-- Root cause: policies on user_profiles referenced user_profiles itself inside
-- an EXISTS subquery. Postgres has to re-evaluate the same RLS policy to
-- evaluate the policy, which creates an infinite loop.
--
-- Fix: introduce a SECURITY DEFINER helper function that checks admin status
-- WITHOUT going through RLS, and use it everywhere instead of the raw
-- EXISTS (SELECT 1 FROM user_profiles ...) subquery.

-- =========================================================
-- 1. Helper function (bypasses RLS internally, no recursion)
-- =========================================================

CREATE OR REPLACE FUNCTION public.is_admin_general()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin_general'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin_general() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin_general() TO authenticated;

-- =========================================================
-- 2. USER PROFILES (the table that was actually recursing)
-- =========================================================

DROP POLICY IF EXISTS "Profiles: select owner or admin" ON public.user_profiles;
CREATE POLICY "Profiles: select owner or admin" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() = id OR public.is_admin_general()
  );

DROP POLICY IF EXISTS "Profiles: update owner or admin" ON public.user_profiles;
CREATE POLICY "Profiles: update owner or admin" ON public.user_profiles
  FOR UPDATE USING (
    auth.uid() = id OR public.is_admin_general()
  ) WITH CHECK (
    auth.uid() = id OR public.is_admin_general()
  );

-- =========================================================
-- 3. LEADER VERIFICATION REQUESTS
-- =========================================================

DROP POLICY IF EXISTS "Requests: select owner or admin" ON public.leader_verification_requests;
CREATE POLICY "Requests: select owner or admin" ON public.leader_verification_requests
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin_general()
  );

DROP POLICY IF EXISTS "Requests: admin decision" ON public.leader_verification_requests;
CREATE POLICY "Requests: admin decision" ON public.leader_verification_requests
  FOR UPDATE USING (public.is_admin_general())
  WITH CHECK (public.is_admin_general());

-- "Requests: insert by owner" and "Requests: owner update while pending"
-- don't touch user_profiles, so they're left untouched.

-- =========================================================
-- 4. LEADER VERIFICATION DOCUMENTS
-- =========================================================

DROP POLICY IF EXISTS "Docs: select owner or admin" ON public.leader_verification_documents;
CREATE POLICY "Docs: select owner or admin" ON public.leader_verification_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leader_verification_requests r
      WHERE r.id = request_id AND r.user_id = auth.uid()
    )
    OR public.is_admin_general()
  );

DROP POLICY IF EXISTS "Docs: delete by admin or owner" ON public.leader_verification_documents;
CREATE POLICY "Docs: delete by admin or owner" ON public.leader_verification_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.leader_verification_requests r
      WHERE r.id = request_id AND r.user_id = auth.uid()
    )
    OR public.is_admin_general()
  );

-- "Docs: insert by request owner" doesn't touch user_profiles, left untouched.

-- =========================================================
-- 5. DISASTER EVENTS
-- =========================================================

DROP POLICY IF EXISTS "Events: admin write" ON public.disaster_events;
CREATE POLICY "Events: admin write" ON public.disaster_events
  FOR ALL USING (public.is_admin_general())
  WITH CHECK (public.is_admin_general());

-- "Events: public select" (USING (true)) left untouched.

-- =========================================================
-- 6. COLLECTION POINTS
-- =========================================================

DROP POLICY IF EXISTS "Points: select owner or admin" ON public.collection_points;
CREATE POLICY "Points: select owner or admin" ON public.collection_points
  FOR SELECT USING (
    leader_id = auth.uid() OR public.is_admin_general()
  );

DROP POLICY IF EXISTS "Points: update owner or admin" ON public.collection_points;
CREATE POLICY "Points: update owner or admin" ON public.collection_points
  FOR UPDATE USING (
    leader_id = auth.uid() OR public.is_admin_general()
  ) WITH CHECK (
    leader_id = auth.uid() OR public.is_admin_general()
  );

-- "Points: insert by verified leaders" checks verification_status, not role;
-- left untouched (no recursion risk, different condition).

-- =========================================================
-- 7. INVENTORY LEDGER ENTRIES
-- =========================================================

DROP POLICY IF EXISTS "Ledger: insert by point leader or admin" ON public.inventory_ledger_entries;
CREATE POLICY "Ledger: insert by point leader or admin" ON public.inventory_ledger_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collection_points cp
      WHERE cp.id = point_id AND cp.leader_id = auth.uid()
    )
    OR public.is_admin_general()
  );

DROP POLICY IF EXISTS "Ledger: select by point leader or admin" ON public.inventory_ledger_entries;
CREATE POLICY "Ledger: select by point leader or admin" ON public.inventory_ledger_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collection_points cp
      WHERE cp.id = point_id AND cp.leader_id = auth.uid()
    )
    OR public.is_admin_general()
  );

-- =========================================================
-- 8. INVENTORY SNAPSHOTS
-- =========================================================

DROP POLICY IF EXISTS "Snapshots: select by point leader or admin" ON public.inventory_snapshots;
CREATE POLICY "Snapshots: select by point leader or admin" ON public.inventory_snapshots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collection_points cp
      WHERE cp.id = point_id AND cp.leader_id = auth.uid()
    )
    OR public.is_admin_general()
  );

DROP POLICY IF EXISTS "Snapshots: update by admin only" ON public.inventory_snapshots;
CREATE POLICY "Snapshots: update by admin only" ON public.inventory_snapshots
  FOR UPDATE USING (public.is_admin_general())
  WITH CHECK (public.is_admin_general());

-- =========================================================
-- Done. Only user_profiles caused actual recursion (42P17);
-- the rest were rewritten for consistency and to avoid a
-- fresh EXISTS(...) subquery execution per row.
-- =========================================================
