-- Criar usuário admin diretamente no auth.users (método alternativo)
DO $$
DECLARE
  admin_user_id UUID := '00000000-0000-0000-0000-000000000001';
  encrypted_password TEXT;
BEGIN
  -- Verificar se o usuário já existe
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@envialead.com.br') THEN
    -- Criar senha criptografada (usando bcrypt com salt para 'Admin123!')
    encrypted_password := crypt('Admin123!', gen_salt('bf'));
    
    -- Inserir diretamente na tabela auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      admin_user_id,
      'authenticated',
      'authenticated',
      'admin@envialead.com.br',
      encrypted_password,
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Desenvolvedor Sistema"}',
      false,
      '',
      '',
      '',
      ''
    );

    -- Criar perfil na tabela profiles
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      company_id,
      role,
      is_active,
      created_at,
      updated_at
    ) VALUES (
      admin_user_id,
      'admin@envialead.com.br',
      'Desenvolvedor Sistema',
      '00000000-0000-0000-0000-000000000001',
      'admin',
      true,
      now(),
      now()
    );

    RAISE NOTICE 'Usuário admin criado com sucesso: admin@envialead.com.br / Admin123!';
  ELSE
    RAISE NOTICE 'Usuário admin já existe';
  END IF;
END $$;