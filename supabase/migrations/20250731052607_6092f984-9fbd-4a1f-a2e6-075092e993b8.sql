-- Criar tabela para contabilizar visitas às URLs de exibição
CREATE TABLE IF NOT EXISTS public.flow_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.flow_visits ENABLE ROW LEVEL SECURITY;

-- Create policies for flow_visits
CREATE POLICY "Users can view their own flow visits" 
ON public.flow_visits 
FOR SELECT 
USING (
  flow_id IN (
    SELECT id FROM public.flows WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Public can insert flow visits" 
ON public.flow_visits 
FOR INSERT 
WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_flow_visits_flow_id ON public.flow_visits(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_visits_created_at ON public.flow_visits(created_at);
CREATE INDEX IF NOT EXISTS idx_flow_visits_url ON public.flow_visits(url);