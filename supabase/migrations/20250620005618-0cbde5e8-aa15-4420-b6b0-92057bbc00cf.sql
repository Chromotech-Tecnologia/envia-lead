
-- Primeiro, vamos corrigir a função handle_new_user para garantir que funcione corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  new_company_id UUID;
  existing_profile_count INTEGER;
BEGIN
  -- Log para debug
  RAISE LOG 'Criando perfil para usuário: %, email: %', NEW.id, NEW.email;
  
  -- Verificar se já existe um perfil para este usuário
  SELECT COUNT(*) INTO existing_profile_count 
  FROM public.profiles 
  WHERE id = NEW.id;
  
  -- Se já existe, não fazer nada
  IF existing_profile_count > 0 THEN
    RAISE LOG 'Perfil já existe para usuário: %', NEW.id;
    RETURN NEW;
  END IF;

  -- Se é o admin master, usar a empresa padrão
  IF NEW.email = 'admin@envialead.com.br' THEN
    INSERT INTO public.profiles (id, email, full_name, company_id, role, is_active)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      '00000000-0000-0000-0000-000000000001',
      'admin'::user_role,
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      updated_at = now();
    
    RAISE LOG 'Perfil admin master criado para: %', NEW.email;
  ELSE
    -- Para outros usuários, criar uma nova empresa
    INSERT INTO companies (name, email, status)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'company_name', 'Nova Empresa'),
      NEW.email,
      'trial'
    ) RETURNING id INTO new_company_id;
    
    RAISE LOG 'Nova empresa criada com ID: % para email: %', new_company_id, NEW.email;

    -- Criar o perfil do usuário como admin da nova empresa
    INSERT INTO public.profiles (id, email, full_name, company_id, role, is_active)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      new_company_id,
      'admin'::user_role,
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      company_id = EXCLUDED.company_id,
      role = EXCLUDED.role,
      updated_at = now();
    
    RAISE LOG 'Perfil admin criado para usuário: % na empresa: %', NEW.email, new_company_id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloquear o cadastro
    RAISE WARNING 'Erro ao criar perfil para usuário %: % - %', NEW.email, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$function$;

-- Garantir que o trigger existe e está ativo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Garantir que a empresa padrão existe
INSERT INTO companies (id, name, email, status) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Envia Lead Master', 'admin@envialead.com.br', 'active')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  updated_at = now();

-- Corrigir as políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- Política para visualizar perfis
CREATE POLICY "Users can view profiles" ON profiles
FOR SELECT USING (
  company_id = get_user_company_id() OR 
  is_global_admin() OR
  id = auth.uid()
);

-- Política para inserir perfis (apenas pelo trigger ou admins)
CREATE POLICY "System can create profiles" ON profiles
FOR INSERT WITH CHECK (true);

-- Política para atualizar perfis
CREATE POLICY "Users can update profiles" ON profiles
FOR UPDATE USING (
  id = auth.uid() OR
  (get_user_role() = 'admin' AND company_id = get_user_company_id()) OR
  is_global_admin()
);

-- Política para deletar perfis
CREATE POLICY "Admins can delete profiles" ON profiles
FOR DELETE USING (
  id != auth.uid() AND
  ((get_user_role() = 'admin' AND company_id = get_user_company_id()) OR
   is_global_admin())
);

-- Garantir que RLS está habilitado
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Corrigir políticas para companies
DROP POLICY IF EXISTS "Users can view companies" ON companies;
DROP POLICY IF EXISTS "Admins can update companies" ON companies;

CREATE POLICY "Users can view companies" ON companies
FOR SELECT USING (
  id = get_user_company_id() OR 
  is_global_admin()
);

CREATE POLICY "System can create companies" ON companies
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update companies" ON companies
FOR UPDATE USING (
  (get_user_role() = 'admin' AND id = get_user_company_id()) OR
  is_global_admin()
);

-- Garantir que RLS está habilitado para companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
