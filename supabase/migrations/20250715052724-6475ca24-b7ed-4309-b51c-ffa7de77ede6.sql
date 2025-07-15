-- Adicionar campo para mensagem final customizada na tabela flows
ALTER TABLE flows ADD COLUMN IF NOT EXISTS final_message_custom TEXT;