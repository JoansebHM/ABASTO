-- Policies for leader_verification_requests
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
