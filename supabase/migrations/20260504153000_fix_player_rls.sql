-- Fix RLS so the public Player URL can fetch playlists and media files correctly.
-- Without these policies, the `anon` / public role receives empty results (0 rows).

DROP POLICY IF EXISTS "public_select_playlists" ON public.playlists;
CREATE POLICY "public_select_playlists" ON public.playlists
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_select_playlist_items" ON public.playlist_items;
CREATE POLICY "public_select_playlist_items" ON public.playlist_items
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_select_files" ON public.files;
CREATE POLICY "public_select_files" ON public.files
  FOR SELECT TO public USING (true);
