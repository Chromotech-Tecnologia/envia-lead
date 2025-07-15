-- Adicionar campo nome do atendente na tabela flows
ALTER TABLE flows ADD COLUMN IF NOT EXISTS attendant_name TEXT DEFAULT 'Atendimento';

-- Adicionar campos para configurações finais
ALTER TABLE flows ADD COLUMN IF NOT EXISTS final_message TEXT DEFAULT 'Obrigado pelo seu contato! Em breve entraremos em contato.';
ALTER TABLE flows ADD COLUMN IF NOT EXISTS whatsapp_message_template TEXT DEFAULT 'Olá, meu nome é #nome e gostaria de mais informações.';

-- Criar tabela para armazenar avatars salvos
CREATE TABLE IF NOT EXISTS public.saved_avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela saved_avatars
ALTER TABLE public.saved_avatars ENABLE ROW LEVEL SECURITY;

-- Política para usuários gerenciarem avatars da empresa
CREATE POLICY "Users can manage company avatars" 
ON public.saved_avatars 
FOR ALL 
USING (company_id = get_user_company_id());

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_saved_avatars_company_id ON saved_avatars(company_id);