-- Policies for inventory_ledger_entries and inventory_snapshots
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
