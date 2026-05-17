DO $$
DECLARE
  new_user_id uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'triplemvv@gmail.com') THEN
    UPDATE auth.users
    SET encrypted_password = crypt('Triplem@email', gen_salt('bf')),
        updated_at = NOW()
    WHERE email = 'triplemvv@gmail.com';
  ELSE
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
      'triplemvv@gmail.com',
      crypt('Triplem@email', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Triplem Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name)
    VALUES (new_user_id, 'triplemvv@gmail.com', 'Triplem Admin')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
