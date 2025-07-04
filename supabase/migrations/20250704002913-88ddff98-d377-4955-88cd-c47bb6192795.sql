
-- Criar tabela para rastrear conexões ativas dos sites
CREATE TABLE public.flow_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES public.flows(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  last_ping TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address INET,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_flow_connections_flow_id ON public.flow_connections(flow_id);
CREATE INDEX idx_flow_connections_url ON public.flow_connections(url);
CREATE INDEX idx_flow_connections_last_ping ON public.flow_connections(last_ping);

-- RLS policies
ALTER TABLE public.flow_connections ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver conexões dos fluxos de sua empresa
CREATE POLICY "Users can view flow connections from their company" 
  ON public.flow_connections 
  FOR SELECT 
  USING (
    flow_id IN (
      SELECT f.id FROM flows f 
      WHERE f.company_id = (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Sistema pode inserir/atualizar conexões (para o script externo)
CREATE POLICY "System can manage flow connections" 
  ON public.flow_connections 
  FOR ALL 
  USING (true)
  WITH CHECK (true);
