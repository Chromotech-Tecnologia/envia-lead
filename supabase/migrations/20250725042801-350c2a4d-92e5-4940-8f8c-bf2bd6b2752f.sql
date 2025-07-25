-- Criar tabela para registrar acessos/visitas ao site
CREATE TABLE public.flow_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL,
  url TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flow_visits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view visits from their company flows" 
ON public.flow_visits 
FOR SELECT 
USING (flow_id IN (
  SELECT f.id
  FROM flows f
  JOIN profiles p ON p.company_id = f.company_id
  WHERE p.id = auth.uid()
));

CREATE POLICY "Widget can register visits" 
ON public.flow_visits 
FOR INSERT 
WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX idx_flow_visits_flow_id ON public.flow_visits(flow_id);
CREATE INDEX idx_flow_visits_created_at ON public.flow_visits(created_at);
CREATE INDEX idx_flow_visits_session_id ON public.flow_visits(session_id);