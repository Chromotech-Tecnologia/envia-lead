
-- Primeiro, vamos corrigir a estrutura da empresa padrão e garantir que existe
INSERT INTO companies (id, name, email, status) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Envia Lead Master', 'admin@envialead.com.br', 'active')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  status = EXCLUDED.status;

-- Atualizar a função handle_new_user para criar empresa automaticamente quando necessário
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_company_id UUID;
BEGIN
  -- Se é o admin master, usar a empresa padrão
  IF NEW.email = 'admin@envialead.com.br' THEN
    INSERT INTO public.profiles (id, email, full_name, company_id, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      '00000000-0000-0000-0000-000000000001',
      'admin'::user_role
    );
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
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para verificar se usuário é admin global
CREATE OR REPLACE FUNCTION is_global_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND company_id = '00000000-0000-0000-0000-000000000001'
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Atualizar política de profiles para admin global ver tudo
DROP POLICY IF EXISTS "Users can view profiles from their company" ON profiles;
CREATE POLICY "Users can view profiles" ON profiles
FOR SELECT USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  OR is_global_admin()
);

-- Política para permitir admin criar usuários na sua empresa
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Admins can create profiles" ON profiles
FOR INSERT WITH CHECK (
  -- Pode inserir se for admin da empresa ou admin global
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  AND (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR is_global_admin()
  )
);

-- Política para permitir admins atualizarem perfis da empresa
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update profiles" ON profiles
FOR UPDATE USING (
  id = auth.uid() -- Próprio perfil
  OR (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    AND (
      company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
      OR is_global_admin()
    )
  )
);

-- Política para permitir admins deletarem usuários da empresa
CREATE POLICY "Admins can delete profiles" ON profiles
FOR DELETE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  AND id != auth.uid() -- Não pode deletar a si mesmo
  AND (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR is_global_admin()
  )
);

-- Políticas para companies
DROP POLICY IF EXISTS "Users can view their company" ON companies;
CREATE POLICY "Users can view companies" ON companies
FOR SELECT USING (
  id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  OR is_global_admin()
);

DROP POLICY IF EXISTS "Users can update their company" ON companies;
CREATE POLICY "Admins can update companies" ON companies
FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  AND (
    id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR is_global_admin()
  )
);
