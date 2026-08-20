-- 001_initial.sql
-- Seed minimal development data: admin general, verified leader, active event, collection point, ledger and snapshot

-- Insert admin profile
insert into public.user_profiles (id, full_name, role, verification_status, created_at, updated_at)
values (
  '11111111-1111-1111-1111-111111111111'::uuid,
  'Admin General',
  'admin_general'::role_type,
  'approved'::verification_status,
  now(), now()
)
on conflict (id) do nothing;

-- Insert a verified leader profile
insert into public.user_profiles (id, full_name, role, verification_status, created_at, updated_at)
values (
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Leader Example',
  'leader_collection'::role_type,
  'approved'::verification_status,
  now(), now()
)
on conflict (id) do nothing;

-- Insert an active disaster event
insert into public.disaster_events (id, name, status, starts_at, slug, created_at)
values (
  '33333333-3333-3333-3333-333333333333'::uuid,
  'Simulated Flood - Test Event',
  'active'::event_status,
  now() - interval '1 day',
  'simulated-flood-test',
  now()
)
on conflict (id) do nothing;

-- Insert a collection point owned by the leader
insert into public.collection_points (id, event_id, leader_id, name, zone_type, latitude, longitude, status, created_at, updated_at)
values (
  '44444444-4444-4444-4444-444444444444'::uuid,
  '33333333-3333-3333-3333-333333333333'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'Punto de Prueba',
  'neighborhood',
  -34.6037,
  -58.3816,
  'active',
  now(), now()
)
on conflict (id) do nothing;

-- Insert a leader verification request (approved) and document entry
insert into public.leader_verification_requests (id, user_id, status, reviewed_by, reviewed_at, decision_note, submitted_at, created_at)
values (
  '77777777-7777-7777-7777-777777777777'::uuid,
  '22222222-2222-2222-2222-222222222222'::uuid,
  'approved'::verification_status,
  '11111111-1111-1111-1111-111111111111'::uuid,
  now(),
  'Seeded as approved for development',
  now() - interval '2 days',
  now()
)
on conflict (id) do nothing;

insert into public.leader_verification_documents (id, request_id, document_type, storage_path, mime_type, uploaded_at)
values (
  '88888888-8888-8888-8888-888888888888'::uuid,
  '77777777-7777-7777-7777-777777777777'::uuid,
  'identity_card',
  'verification-docs/seed/leader-identity.png',
  'image/png',
  now()
)
on conflict (id) do nothing;

-- Insert an initial ledger entry and snapshot for the point
insert into public.inventory_ledger_entries (id, point_id, supply_type, operation_type, quantity_delta, previous_quantity, new_quantity, created_by, created_at, reason)
values (
  '55555555-5555-5555-5555-555555555555'::uuid,
  '44444444-4444-4444-4444-444444444444'::uuid,
  'water',
  'initial_declaration'::operation_type,
  100,
  0,
  100,
  '22222222-2222-2222-2222-222222222222'::uuid,
  now(),
  'Initial seeded inventory'
)
on conflict (id) do nothing;

insert into public.inventory_snapshots (id, point_id, supply_type, quantity, updated_at, source_ledger_id)
values (
  '66666666-6666-6666-6666-666666666666'::uuid,
  '44444444-4444-4444-4444-444444444444'::uuid,
  'water',
  100,
  now(),
  '55555555-5555-5555-5555-555555555555'::uuid
)
on conflict (id) do nothing;
