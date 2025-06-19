
-- Atualizar o email do admin padrão
UPDATE companies 
SET email = 'admin@envialead.com.br' 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Atualizar a função handle_new_user para usar o novo email do admin
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
      WHEN NEW.email = 'admin@envialead.com.br' THEN 'admin'::user_role
      ELSE 'user'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar usuários existentes para o novo email do admin
UPDATE profiles 
SET role = 'admin'::user_role
WHERE email = 'admin@envialead.com.br';

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Users can view flows from their company" ON flows;
DROP POLICY IF EXISTS "Users can create flows for their company" ON flows;
DROP POLICY IF EXISTS "Users can update flows from their company" ON flows;
DROP POLICY IF EXISTS "Users can delete flows from their company" ON flows;
DROP POLICY IF EXISTS "Users can manage flow URLs from their company" ON flow_urls;
DROP POLICY IF EXISTS "Users can manage flow emails from their company" ON flow_emails;
DROP POLICY IF EXISTS "Users can manage questions from their company" ON questions;
DROP POLICY IF EXISTS "Users can view leads from their company" ON leads;

-- Políticas RLS melhoradas para flows
CREATE POLICY "Users can view flows from their company" ON flows
FOR SELECT USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can insert flows to their company" ON flows
FOR INSERT WITH CHECK (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can update flows from their company" ON flows
FOR UPDATE USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can delete flows from their company" ON flows
FOR DELETE USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
);

-- Políticas para flow_urls
CREATE POLICY "Users can manage flow_urls" ON flow_urls
FOR ALL USING (
  flow_id IN (
    SELECT id FROM flows WHERE company_id = (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Políticas para flow_emails
CREATE POLICY "Users can manage flow_emails" ON flow_emails
FOR ALL USING (
  flow_id IN (
    SELECT id FROM flows WHERE company_id = (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Políticas para questions
CREATE POLICY "Users can manage questions" ON questions
FOR ALL USING (
  flow_id IN (
    SELECT id FROM flows WHERE company_id = (
      SELECT company_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Políticas para leads
CREATE POLICY "Users can manage leads" ON leads
FOR ALL USING (
  company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
);

-- Criar storage bucket para avatars se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Remover políticas existentes do storage se houver
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their avatar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their avatar images" ON storage.objects;

-- Políticas para o bucket de avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatar images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their avatar images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their avatar images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);
