-- 0003_views_and_rpc.sql
-- Views, functions and RPCs: public_map_view, verification decision, inventory ledger updater

-- 1) Public map view: exposes only non-sensitive fields for active events and active points
create or replace view public_map_view as
select
  e.id as event_id,
  e.name as event_name,
  e.slug as event_slug,
  p.id as point_id,
  p.name as point_name,
  p.zone_type,
  p.latitude,
  p.longitude,
  s.supply_type,
  s.quantity
from public.disaster_events e
join public.collection_points p on p.event_id = e.id and p.status = 'active'
join public.inventory_snapshots s on s.point_id = p.id
where e.status = 'active';

-- 2) RPC: Admin decision on a verification request. Updates request and the user's verification_status.
create or replace function rpc_decide_verification(request_uuid uuid, approve boolean, decision_note text)
returns void language plpgsql security definer as $$
declare
  target_user uuid;
begin
  -- Only allow admins to call this RPC
  if not exists (select 1 from public.user_profiles up where up.id = auth.uid() and up.role = 'admin_general') then
    raise exception 'permission denied: admin_general required';
  end if;

  select user_id into target_user from public.leader_verification_requests where id = request_uuid;
  if target_user is null then
    raise exception 'verification request not found: %', request_uuid;
  end if;

  update public.leader_verification_requests
    set status = case when approve then 'approved'::verification_status else 'rejected'::verification_status end,
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        decision_note = decision_note
    where id = request_uuid;

  update public.user_profiles
    set verification_status = case when approve then 'approved'::verification_status else 'rejected'::verification_status end,
        updated_at = now()
    where id = target_user;

end;
$$;

-- 3) RPC: Apply inventory adjustment (inserts ledger entry and updates snapshot atomically)
create or replace function rpc_apply_inventory_adjustment(point_uuid uuid, supply text, quantity_delta integer, reason text)
returns uuid language plpgsql as $$
declare
  prev_qty integer;
  new_qty integer;
  ledger_id uuid;
  caller uuid := auth.uid();
  is_admin boolean;
begin
  -- Authorization: must be point leader or admin
  select exists (select 1 from public.user_profiles up where up.id = caller and up.role = 'admin_general') into is_admin;
  if not is_admin then
    if not exists (select 1 from public.collection_points cp where cp.id = point_uuid and cp.leader_id = caller) then
      raise exception 'permission denied: not point leader or admin';
    end if;
  end if;

  select quantity into prev_qty from public.inventory_snapshots where point_id = point_uuid and supply_type = supply;
  prev_qty := coalesce(prev_qty, 0);
  new_qty := prev_qty + quantity_delta;
  if new_qty < 0 then
    raise exception 'resulting quantity cannot be negative';
  end if;

  -- Determine operation type
  perform 1;
  insert into public.inventory_ledger_entries(point_id, supply_type, operation_type, quantity_delta, previous_quantity, new_quantity, created_by, created_at, reason)
  values (point_uuid, supply, case when prev_qty = 0 and quantity_delta > 0 then 'initial_declaration'::operation_type else 'manual_adjustment'::operation_type end, quantity_delta, prev_qty, new_qty, caller, now(), reason)
  returning id into ledger_id;

  -- Upsert snapshot
  insert into public.inventory_snapshots(point_id, supply_type, quantity, updated_at, source_ledger_id)
  values (point_uuid, supply, new_qty, now(), ledger_id)
  on conflict (point_id, supply_type) do update set quantity = excluded.quantity, updated_at = now(), source_ledger_id = excluded.source_ledger_id;

  return ledger_id;
end;
$$;

-- Grant execute on the RPCs to authenticated role (Supabase convention uses 'authenticated')
grant execute on function rpc_decide_verification(uuid, boolean, text) to authenticated;
grant execute on function rpc_apply_inventory_adjustment(uuid, text, integer, text) to authenticated;
