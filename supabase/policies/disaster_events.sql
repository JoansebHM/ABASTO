-- Policies for disaster_events
ALTER TABLE public.disaster_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events: public select" ON public.disaster_events
  FOR SELECT USING (true);
CREATE POLICY "Events: admin write" ON public.disaster_events
  FOR ALL USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general')) WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin_general'));
