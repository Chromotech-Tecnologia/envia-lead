-- Adicionar campos faltantes na tabela flows
ALTER TABLE public.flows 
ADD COLUMN welcome_message TEXT DEFAULT 'Olá! Como posso ajudá-lo?',
ADD COLUMN show_whatsapp_button BOOLEAN DEFAULT true;

-- Atualizar flows existentes com valores padrão caso necessário
UPDATE public.flows 
SET welcome_message = COALESCE(welcome_message, 'Olá! Como posso ajudá-lo?'),
    show_whatsapp_button = COALESCE(show_whatsapp_button, true)
WHERE welcome_message IS NULL OR show_whatsapp_button IS NULL;