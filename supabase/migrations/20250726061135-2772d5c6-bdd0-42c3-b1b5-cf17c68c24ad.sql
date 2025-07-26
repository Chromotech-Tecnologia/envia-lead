-- Criar usuário desenvolvedor/admin global
-- Primeiro, vamos criar um perfil para admin@envialead.com.br na empresa global
-- A empresa global já existe (00000000-0000-0000-0000-000000000001)

-- Inserir o usuário admin se não existir
DO $$
BEGIN
  -- Verificar se o perfil já existe
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'admin@envialead.com.br') THEN
    -- Inserir o perfil admin global
    INSERT INTO profiles (
      id,
      email, 
      full_name, 
      company_id, 
      role, 
      is_active
    ) VALUES (
      '00000000-0000-0000-0000-000000000001'::uuid,
      'admin@envialead.com.br',
      'Desenvolvedor Sistema',
      '00000000-0000-0000-0000-000000000001'::uuid,
      'admin',
      true
    );
  END IF;
END $$;

-- Atualizar as políticas RLS para permitir que admin global veja tudo
-- Política para flows
DROP POLICY IF EXISTS "Global admin can view all flows" ON flows;
CREATE POLICY "Global admin can view all flows" 
ON flows FOR ALL 
TO authenticated 
USING (is_global_admin()) 
WITH CHECK (is_global_admin());

-- Política para leads  
DROP POLICY IF EXISTS "Global admin can view all leads" ON leads;
CREATE POLICY "Global admin can view all leads" 
ON leads FOR ALL 
TO authenticated 
USING (is_global_admin()) 
WITH CHECK (is_global_admin());

-- Política para questions
DROP POLICY IF EXISTS "Global admin can manage all questions" ON questions;
CREATE POLICY "Global admin can manage all questions" 
ON questions FOR ALL 
TO authenticated 
USING (is_global_admin()) 
WITH CHECK (is_global_admin());

-- Política para profiles - admin global pode gerenciar todos
DROP POLICY IF EXISTS "Global admin can manage all profiles" ON profiles;
CREATE POLICY "Global admin can manage all profiles" 
ON profiles FOR ALL 
TO authenticated 
USING (is_global_admin()) 
WITH CHECK (is_global_admin());