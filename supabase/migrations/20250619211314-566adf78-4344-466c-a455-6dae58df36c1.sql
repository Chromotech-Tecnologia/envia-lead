
-- Verificar e corrigir a tabela questions que pode estar causando problemas
ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_flow_id_fkey;
ALTER TABLE questions ADD CONSTRAINT questions_flow_id_fkey 
  FOREIGN KEY (flow_id) REFERENCES flows(id) ON DELETE CASCADE;

-- Garantir que as políticas RLS para questions existam
DROP POLICY IF EXISTS "Users can view questions" ON questions;
CREATE POLICY "Users can view questions" ON questions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM flows 
    WHERE flows.id = questions.flow_id 
    AND (flows.company_id = get_user_company_id() OR is_global_admin())
  )
);

DROP POLICY IF EXISTS "Admins can create questions" ON questions;
CREATE POLICY "Admins can create questions" ON questions
FOR INSERT WITH CHECK (
  get_user_role() = 'admin'
  AND EXISTS (
    SELECT 1 FROM flows 
    WHERE flows.id = questions.flow_id 
    AND (flows.company_id = get_user_company_id() OR is_global_admin())
  )
);

DROP POLICY IF EXISTS "Admins can update questions" ON questions;
CREATE POLICY "Admins can update questions" ON questions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM flows 
    WHERE flows.id = questions.flow_id 
    AND (flows.company_id = get_user_company_id() OR is_global_admin())
  )
);

DROP POLICY IF EXISTS "Admins can delete questions" ON questions;
CREATE POLICY "Admins can delete questions" ON questions
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM flows 
    WHERE flows.id = questions.flow_id 
    AND (flows.company_id = get_user_company_id() OR is_global_admin())
  )
);

-- Habilitar RLS na tabela questions se não estiver habilitado
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Corrigir a função handle_new_user para ser mais robusta
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
    ON CONFLICT (id) DO NOTHING;
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
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não bloquear o cadastro
    RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que a empresa padrão existe
INSERT INTO companies (id, name, email, status) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Envia Lead', 'admin@envialead.com.br', 'active')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  status = EXCLUDED.status;
