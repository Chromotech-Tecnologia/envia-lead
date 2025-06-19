
-- Inserir uma empresa padrão para usuários que se cadastram
INSERT INTO companies (id, name, email, status) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Envia Lead Demo', 'admin@envialead.com', 'active')
ON CONFLICT (id) DO NOTHING;

-- Atualizar a função handle_new_user para associar automaticamente à empresa padrão
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company_id, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    '00000000-0000-0000-0000-000000000001',
    CASE 
      WHEN NEW.email = 'admin@envialead.com' THEN 'admin'::user_role
      ELSE 'user'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar usuários existentes que não têm company_id
UPDATE profiles 
SET company_id = '00000000-0000-0000-0000-000000000001',
    role = CASE 
      WHEN email = 'admin@envialead.com' THEN 'admin'::user_role
      ELSE 'user'::user_role
    END
WHERE company_id IS NULL;

-- Criar usuário admin padrão (caso não exista)
-- Nota: Este usuário será criado apenas se não existir
