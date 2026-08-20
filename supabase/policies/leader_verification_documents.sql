-- Policies for leader_verification_documents
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
