-- Verificar se existe a empresa padrão para os testes
INSERT INTO companies (id, name, email, status) 
VALUES ('00000000-0000-0000-0000-000000000001', 'EnviaLead Master', 'admin@envialead.com.br', 'active')
ON CONFLICT (id) DO NOTHING;

-- Atualizar a função create-user para ser mais robusta
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT,
  user_role TEXT,
  user_company_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir o perfil do usuário
  INSERT INTO public.profiles (id, email, full_name, company_id, role, is_active)
  VALUES (
    user_id,
    user_email,
    user_full_name,
    user_company_id,
    user_role::user_role,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_id = EXCLUDED.company_id,
    role = EXCLUDED.role,
    updated_at = now();
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil do usuário %: %', user_email, SQLERRM;
    RETURN FALSE;
END;
$$;