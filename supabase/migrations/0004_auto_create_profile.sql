-- 0004_auto_create_profile.sql
-- Auto-create a public.user_profiles row whenever a new user is created
-- in auth.users (i.e. whenever someone calls supabase.auth.signUp()).
--
-- Without this trigger, signUp() only creates a row in auth.users;
-- the metadata passed in options.data (full_name, role) is stored in
-- auth.users.raw_user_meta_data but never copied into user_profiles.
--
-- Valid role_type values (see src/.../Role enum):
--   'leader_disaster', 'leader_collection', 'admin_general'
-- Valid verification_status values:
--   'pending', 'approved', 'rejected', 'not_required'
--
-- Security note: role is client-supplied metadata at signup time.
-- 'admin_general' must NEVER be assignable this way, so it's explicitly
-- excluded below and forced down to a safe default. Promoting someone
-- to admin_general must be a manual UPDATE done by an existing admin.

-- =========================================================
-- 1. Function that runs on every new auth.users row
-- =========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role text := NEW.raw_user_meta_data ->> 'role';
  safe_role public.role_type;
  initial_status public.verification_status;
BEGIN
  -- Whitelist: only these two roles can be self-assigned at signup.
  -- Anything else (including 'admin_general', empty, or garbage) falls
  -- back to 'leader_disaster'.
  IF requested_role = 'leader_collection' THEN
    safe_role := 'leader_collection'::public.role_type;
  ELSE
    safe_role := 'leader_disaster'::public.role_type;
  END IF;

  -- leader_collection needs admin approval before it can create
  -- collection_points (see "Points: insert by verified leaders" policy),
  -- so it starts pending. leader_disaster has no such gate, so it
  -- doesn't need verification.
  IF safe_role = 'leader_collection' THEN
    initial_status := 'pending'::public.verification_status;
  ELSE
    initial_status := 'not_required'::public.verification_status;
  END IF;

  INSERT INTO public.user_profiles (
    id,
    full_name,
    role,
    verification_status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    safe_role,
    initial_status,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- =========================================================
-- 2. Trigger on auth.users
-- =========================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- 3. Backfill any users that signed up before this trigger
--    existed and are missing a profile row.
-- =========================================================

INSERT INTO public.user_profiles (id, full_name, role, verification_status, created_at, updated_at)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
  CASE
    WHEN u.raw_user_meta_data ->> 'role' = 'leader_collection'
      THEN 'leader_collection'::public.role_type
    ELSE 'leader_disaster'::public.role_type
  END,
  CASE
    WHEN u.raw_user_meta_data ->> 'role' = 'leader_collection'
      THEN 'pending'::public.verification_status
    ELSE 'not_required'::public.verification_status
  END,
  now(),
  now()
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.id = u.id
WHERE p.id IS NULL;
