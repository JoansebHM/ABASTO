-- 0002_security.sql
-- Row-Level Security policies and access rules for ABASTO MVP

-- Enable RLS on core tables and add policies per role

-- USER PROFILES
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles: select owner or admin" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  );
CREATE POLICY "Profiles: update owner or admin" ON public.user_profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  ) WITH CHECK (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  );

-- LEADER VERIFICATION REQUESTS
ALTER TABLE public.leader_verification_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Requests: insert by owner" ON public.leader_verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Requests: select owner or admin" ON public.leader_verification_requests
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  );
CREATE POLICY "Requests: owner update while pending" ON public.leader_verification_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending') WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Requests: admin decision" ON public.leader_verification_requests
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general'));

-- LEADER VERIFICATION DOCUMENTS
ALTER TABLE public.leader_verification_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Docs: insert by request owner" ON public.leader_verification_documents
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.leader_verification_requests r WHERE r.id = request_id AND r.user_id = auth.uid())
  );
CREATE POLICY "Docs: select owner or admin" ON public.leader_verification_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.leader_verification_requests r WHERE r.id = request_id AND r.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  );
CREATE POLICY "Docs: delete by admin or owner" ON public.leader_verification_documents
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.leader_verification_requests r WHERE r.id = request_id AND r.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  );

-- DISASTER EVENTS
ALTER TABLE public.disaster_events ENABLE ROW LEVEL SECURITY;
-- Events are public-readable (used by public map). Admins manage events.
CREATE POLICY "Events: public select" ON public.disaster_events
  FOR SELECT USING (true);
CREATE POLICY "Events: admin write" ON public.disaster_events
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general'));

-- COLLECTION POINTS
ALTER TABLE public.collection_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Points: insert by verified leaders" ON public.collection_points
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.verification_status = 'approved')
  );
CREATE POLICY "Points: select owner or admin" ON public.collection_points
  FOR SELECT USING (
    leader_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  );
CREATE POLICY "Points: update owner or admin" ON public.collection_points
  FOR UPDATE USING (
    leader_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  ) WITH CHECK (
    leader_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  );

-- INVENTORY LEDGER ENTRIES
ALTER TABLE public.inventory_ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ledger: insert by point leader or admin" ON public.inventory_ledger_entries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.collection_points cp WHERE cp.id = point_id AND cp.leader_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  );
CREATE POLICY "Ledger: select by point leader or admin" ON public.inventory_ledger_entries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.collection_points cp WHERE cp.id = point_id AND cp.leader_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  );

-- INVENTORY SNAPSHOTS
ALTER TABLE public.inventory_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Snapshots: select by point leader or admin" ON public.inventory_snapshots
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.collection_points cp WHERE cp.id = point_id AND cp.leader_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  );
CREATE POLICY "Snapshots: update by admin only" ON public.inventory_snapshots
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')
  );

-- Note: public_map_view and other safe public-facing views will be created in the next migration (0003_views_and_rpc.sql).
-- Storage buckets for verification documents should be created as private buckets (e.g. 'verification-docs') via the Supabase CLI or dashboard. Access to stored objects is controlled through signed URLs.
