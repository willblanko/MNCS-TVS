-- Make tvs.location optional
ALTER TABLE public.tvs ALTER COLUMN location DROP NOT NULL;
ALTER TABLE public.tvs ALTER COLUMN location SET DEFAULT '';

-- Add last_seen to tvs
ALTER TABLE public.tvs ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;

-- Add duration to files
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS duration INTEGER NOT NULL DEFAULT 0;

-- Create playlist_schedules
CREATE TABLE IF NOT EXISTS public.playlist_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  tv_id TEXT REFERENCES public.tvs(id) ON DELETE CASCADE,
  days_of_week TEXT[] NOT NULL DEFAULT '{}',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.playlist_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all" ON public.playlist_schedules;
CREATE POLICY "authenticated_all" ON public.playlist_schedules
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_select_playlist_schedules" ON public.playlist_schedules;
CREATE POLICY "public_select_playlist_schedules" ON public.playlist_schedules
  FOR SELECT TO public USING (true);

-- Add tables to realtime publication
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'playlist_schedules') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.playlist_schedules;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'files') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.files;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'playlists') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.playlists;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'playlist_items') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.playlist_items;
  END IF;
END $$;
