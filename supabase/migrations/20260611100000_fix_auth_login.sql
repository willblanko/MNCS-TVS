-- Fix: users created via direct SQL INSERT don't have an auth.identities record.
-- Supabase Auth v2 requires this record to authenticate via signInWithPassword.
-- Without it, login always fails even with the correct password.
INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT
  u.id::text,
  u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  u.created_at,
  u.created_at,
  u.updated_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM auth.identities i
  WHERE i.user_id = u.id AND i.provider = 'email'
);

-- Fix: seed SQL didn't set role = 'admin' for admin users in profiles.
UPDATE public.profiles
SET role = 'admin'
WHERE email IN ('ilopes@lclaw.com.br', 'triplemvv@gmail.com');
