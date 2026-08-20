-- 0001_init.sql
-- Initial schema for ABASTO MVP

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Enum types
create type role_type as enum ('leader_disaster','leader_collection','admin_general');
create type verification_status as enum ('pending','approved','rejected','not_required');
create type event_status as enum ('active','inactive','archived');
create type operation_type as enum ('initial_declaration','manual_adjustment');

-- User profiles (mirror of auth users, keep only profile fields)
create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  role role_type not null default 'leader_disaster',
  verification_status verification_status not null default 'not_required',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Leader verification requests
create table if not exists leader_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_profiles(id) on delete cascade,
  status verification_status not null default 'pending',
  reviewed_by uuid references user_profiles(id) on delete set null,
  reviewed_at timestamptz,
  decision_note text,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Leader verification documents (private storage references)
create table if not exists leader_verification_documents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references leader_verification_requests(id) on delete cascade,
  document_type text not null,
  storage_path text not null,
  mime_type text,
  uploaded_at timestamptz not null default now()
);

-- Disaster events
create table if not exists disaster_events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status event_status not null default 'inactive',
  starts_at timestamptz,
  ends_at timestamptz,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Collection points
create table if not exists collection_points (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references disaster_events(id) on delete cascade,
  leader_id uuid references user_profiles(id) on delete set null,
  name text,
  zone_type text,
  latitude double precision,
  longitude double precision,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_collection_points_event_id on collection_points(event_id);
create index if not exists idx_collection_points_leader_id on collection_points(leader_id);

-- Inventory ledger entries (immutable history)
create table if not exists inventory_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  point_id uuid not null references collection_points(id) on delete cascade,
  supply_type text not null,
  operation_type operation_type not null,
  quantity_delta integer not null,
  previous_quantity integer,
  new_quantity integer,
  created_by uuid references user_profiles(id),
  created_at timestamptz not null default now(),
  reason text
);

create index if not exists idx_inventory_ledger_point_id on inventory_ledger_entries(point_id);

-- Inventory snapshots (current state per point + supply type)
create table if not exists inventory_snapshots (
  id uuid primary key default gen_random_uuid(),
  point_id uuid not null references collection_points(id) on delete cascade,
  supply_type text not null,
  quantity integer not null default 0,
  updated_at timestamptz not null default now(),
  source_ledger_id uuid references inventory_ledger_entries(id)
);

create unique index if not exists uq_inventory_snapshot_point_supply on inventory_snapshots(point_id, supply_type);

-- Ensure triggers or application logic will update `updated_at` timestamps and snapshots when appropriate.
