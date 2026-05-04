CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid() OR user_id IS NULL) WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
  
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get the first user id to assign notifications
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (id, user_id, title, message)
    VALUES 
      (gen_random_uuid(), v_user_id, 'Bem-vindo ao sistema', 'Sua conta foi configurada com sucesso.'),
      (gen_random_uuid(), v_user_id, 'Upload concluído', 'O arquivo "Promo Verão.mp4" foi processado e está pronto para uso.'),
      (gen_random_uuid(), v_user_id, 'Nova TV conectada', 'A "TV Recepção" está online agora.')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
