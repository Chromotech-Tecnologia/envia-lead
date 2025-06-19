
-- Limpar e recriar políticas corretamente
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view companies" ON companies;
DROP POLICY IF EXISTS "Admins can update companies" ON companies;

-- Criar políticas corretas para profiles
CREATE POLICY "Users can view profiles" ON profiles
FOR SELECT USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  OR is_global_admin()
);

CREATE POLICY "Admins can create profiles" ON profiles
FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  AND (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR is_global_admin()
  )
);

CREATE POLICY "Users can update profiles" ON profiles
FOR UPDATE USING (
  id = auth.uid()
  OR (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    AND (
      company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
      OR is_global_admin()
    )
  )
);

CREATE POLICY "Admins can delete profiles" ON profiles
FOR DELETE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  AND id != auth.uid()
  AND (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR is_global_admin()
  )
);

-- Criar políticas para companies
CREATE POLICY "Users can view companies" ON companies
FOR SELECT USING (
  id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  OR is_global_admin()
);

CREATE POLICY "Admins can update companies" ON companies
FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  AND (
    id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR is_global_admin()
  )
);

-- Criar políticas para flows
DROP POLICY IF EXISTS "Users can view flows from their company" ON flows;
CREATE POLICY "Users can view flows" ON flows
FOR SELECT USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  OR is_global_admin()
);

DROP POLICY IF EXISTS "Users can create flows" ON flows;
CREATE POLICY "Admins can create flows" ON flows
FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  AND (
    company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR is_global_admin()
  )
);

DROP POLICY IF EXISTS "Users can update flows" ON flows;
CREATE POLICY "Users can update flows" ON flows
FOR UPDATE USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  OR is_global_admin()
);

DROP POLICY IF EXISTS "Users can delete flows" ON flows;
CREATE POLICY "Users can delete flows" ON flows
FOR DELETE USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  OR is_global_admin()
);
