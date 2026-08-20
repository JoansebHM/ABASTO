-- Policies for collection_points
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
