-- Ajustar políticas RLS para flow_connections para permitir registro não autenticado do widget

-- Remover política existente que pode estar bloqueando
DROP POLICY IF EXISTS "System can manage flow connections" ON flow_connections;

-- Criar políticas mais específicas para flow_connections
-- Permitir inserção não autenticada (para o widget registrar conexões)
CREATE POLICY "Widget can register connections" 
ON flow_connections 
FOR INSERT 
WITH CHECK (true);

-- Permitir atualização não autenticada (para ping)
CREATE POLICY "Widget can update connections" 
ON flow_connections 
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Permitir seleção apenas para usuários autenticados da mesma empresa
CREATE POLICY "Users can view their company connections" 
ON flow_connections 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND flow_id IN (
    SELECT f.id 
    FROM flows f 
    JOIN profiles p ON p.company_id = f.company_id 
    WHERE p.id = auth.uid()
  )
);