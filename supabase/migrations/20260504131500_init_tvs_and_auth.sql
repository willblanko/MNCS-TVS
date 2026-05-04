DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed admin user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ilopes@lclaw.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'ilopes@lclaw.com.br',
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.tvs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline',
  playlist_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tvs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tvs_select_policy" ON public.tvs;
CREATE POLICY "tvs_select_policy" ON public.tvs FOR SELECT USING (true);

DROP POLICY IF EXISTS "tvs_insert_policy" ON public.tvs;
CREATE POLICY "tvs_insert_policy" ON public.tvs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "tvs_update_policy" ON public.tvs;
CREATE POLICY "tvs_update_policy" ON public.tvs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "tvs_delete_policy" ON public.tvs;
CREATE POLICY "tvs_delete_policy" ON public.tvs FOR DELETE TO authenticated USING (true);

-- Ensure Realtime publication is configured properly
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'tvs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tvs;
  END IF;
END $$;
