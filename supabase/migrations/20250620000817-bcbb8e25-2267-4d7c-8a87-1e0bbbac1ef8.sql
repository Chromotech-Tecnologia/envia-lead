
-- Corrigir a função handle_new_user para garantir que os profiles sejam salvos corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_company_id UUID;
  existing_profile_count INTEGER;
BEGIN
  -- Verificar se já existe um perfil para este usuário
  SELECT COUNT(*) INTO existing_profile_count 
  FROM public.profiles 
  WHERE id = NEW.id;
  
  -- Se já existe, não fazer nada
  IF existing_profile_count > 0 THEN
    RETURN NEW;
  END IF;

  -- Se é o admin master, usar a empresa padrão
  IF NEW.email = 'admin@envialead.com.br' THEN
    INSERT INTO public.profiles (id, email, full_name, company_id, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      '00000000-0000-0000-0000-000000000001',
      'admin'::user_role
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      updated_at = now();
  ELSE
    -- Para outros usuários, criar uma nova empresa
    INSERT INTO companies (name, email, status)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'Nova Empresa'),
      NEW.email,
      'trial'
    ) RETURNING id INTO new_company_id;

    -- Criar o perfil do usuário como admin da nova empresa
    INSERT INTO public.profiles (id, email, full_name, company_id, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      new_company_id,
      'admin'::user_role
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      company_id = EXCLUDED.company_id,
      updated_at = now();
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloquear o cadastro
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$function$;

-- Garantir que o trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Adicionar RLS policies para profiles se não existirem
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Global admins can view all profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR is_global_admin());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id OR is_global_admin());

CREATE POLICY "Global admins can view all profiles" ON profiles
  FOR ALL USING (is_global_admin());

-- Garantir que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Adicionar RLS policies para flows
DROP POLICY IF EXISTS "Users can view company flows" ON flows;
DROP POLICY IF EXISTS "Admins can manage company flows" ON flows;

CREATE POLICY "Users can view company flows" ON flows
  FOR SELECT USING (company_id = get_user_company_id() OR is_global_admin());

CREATE POLICY "Admins can manage company flows" ON flows
  FOR ALL USING (
    (company_id = get_user_company_id() AND get_user_role() = 'admin') OR 
    is_global_admin()
  );

-- Garantir que RLS está habilitado para flows
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
