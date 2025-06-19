
-- Primeiro, vamos dropar todas as políticas problemáticas
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view flows" ON flows;
DROP POLICY IF EXISTS "Admins can create flows" ON flows;
DROP POLICY IF EXISTS "Users can update flows" ON flows;
DROP POLICY IF EXISTS "Users can delete flows" ON flows;

-- Criar funções security definer para evitar recursão
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT company_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recriar políticas usando as funções security definer
CREATE POLICY "Users can view profiles" ON profiles
FOR SELECT USING (
  company_id = get_user_company_id()
  OR is_global_admin()
);

CREATE POLICY "Admins can create profiles" ON profiles
FOR INSERT WITH CHECK (
  get_user_role() = 'admin'
  AND (
    company_id = get_user_company_id()
    OR is_global_admin()
  )
);

CREATE POLICY "Users can update profiles" ON profiles
FOR UPDATE USING (
  id = auth.uid()
  OR (
    get_user_role() = 'admin'
    AND (
      company_id = get_user_company_id()
      OR is_global_admin()
    )
  )
);

CREATE POLICY "Admins can delete profiles" ON profiles
FOR DELETE USING (
  get_user_role() = 'admin'
  AND id != auth.uid()
  AND (
    company_id = get_user_company_id()
    OR is_global_admin()
  )
);

-- Políticas para flows
CREATE POLICY "Users can view flows" ON flows
FOR SELECT USING (
  company_id = get_user_company_id()
  OR is_global_admin()
);

CREATE POLICY "Admins can create flows" ON flows
FOR INSERT WITH CHECK (
  get_user_role() = 'admin'
  AND (
    company_id = get_user_company_id()
    OR is_global_admin()
  )
);

CREATE POLICY "Users can update flows" ON flows
FOR UPDATE USING (
  company_id = get_user_company_id()
  OR is_global_admin()
);

CREATE POLICY "Users can delete flows" ON flows
FOR DELETE USING (
  company_id = get_user_company_id()
  OR is_global_admin()
);
