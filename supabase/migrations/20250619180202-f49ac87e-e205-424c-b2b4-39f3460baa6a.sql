
-- Criar enum para tipos de perfil
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user');

-- Criar enum para status de empresa
CREATE TYPE company_status AS ENUM ('active', 'inactive', 'trial');

-- Tabela de empresas (multi-tenant)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  logo_url TEXT,
  status company_status DEFAULT 'trial',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perfis de usuários
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de fluxos
CREATE TABLE flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  position TEXT DEFAULT 'bottom-right',
  whatsapp TEXT,
  colors JSONB DEFAULT '{"primary": "#FF6B35", "secondary": "#3B82F6", "text": "#1F2937", "background": "#FFFFFF"}',
  minimum_question INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de URLs dos fluxos
CREATE TABLE flow_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de emails dos fluxos
CREATE TABLE flow_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perguntas
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('text', 'email', 'phone', 'number', 'single', 'multiple')),
  title TEXT NOT NULL,
  placeholder TEXT,
  options JSONB,
  required BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  completed BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tickets de suporte
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Policies para companies (apenas admins globais podem gerenciar)
CREATE POLICY "Users can view their company" ON companies
  FOR SELECT USING (id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their company" ON companies
  FOR UPDATE USING (id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Policies para profiles
CREATE POLICY "Users can view profiles from their company" ON profiles
  FOR SELECT USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- Policies para flows
CREATE POLICY "Users can view flows from their company" ON flows
  FOR SELECT USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create flows for their company" ON flows
  FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update flows from their company" ON flows
  FOR UPDATE USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete flows from their company" ON flows
  FOR DELETE USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Policies para flow_urls
CREATE POLICY "Users can manage flow URLs from their company" ON flow_urls
  FOR ALL USING (flow_id IN (
    SELECT id FROM flows WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  ));

-- Policies para flow_emails
CREATE POLICY "Users can manage flow emails from their company" ON flow_emails
  FOR ALL USING (flow_id IN (
    SELECT id FROM flows WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  ));

-- Policies para questions
CREATE POLICY "Users can manage questions from their company" ON questions
  FOR ALL USING (flow_id IN (
    SELECT id FROM flows WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
  ));

-- Policies para leads
CREATE POLICY "Users can view leads from their company" ON leads
  FOR SELECT USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Policy para suporte
CREATE POLICY "Users can manage their support tickets" ON support_tickets
  FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()));

-- Função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Inserir empresa padrão para testes
INSERT INTO companies (name, email, status) 
VALUES ('Envia Lead Demo', 'admin@envialead.com', 'active');
