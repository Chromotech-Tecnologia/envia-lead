-- Verificar se as colunas necessárias existem e adicionar caso não existam

-- Adicionar coluna variable_name à tabela questions se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'questions' AND column_name = 'variable_name') THEN
        ALTER TABLE questions ADD COLUMN variable_name TEXT;
    END IF;
END $$;

-- Verificar se a coluna button_avatar_url existe na tabela flows
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'flows' AND column_name = 'button_avatar_url') THEN
        ALTER TABLE flows ADD COLUMN button_avatar_url TEXT;
    END IF;
END $$;