-- Adicionar campos para configurações separadas de posicionamento e dimensionamento
ALTER TABLE public.flows 
ADD COLUMN button_position text DEFAULT 'bottom-right',
ADD COLUMN chat_position text DEFAULT 'bottom-right',
ADD COLUMN button_offset_x integer DEFAULT 0,
ADD COLUMN button_offset_y integer DEFAULT 0,
ADD COLUMN chat_offset_x integer DEFAULT 0,
ADD COLUMN chat_offset_y integer DEFAULT 0,
ADD COLUMN chat_width integer DEFAULT 400,
ADD COLUMN chat_height integer DEFAULT 500,
ADD COLUMN button_size integer DEFAULT 60;

-- Migrar dados existentes da coluna position para as novas colunas
UPDATE public.flows 
SET 
  button_position = COALESCE(position, 'bottom-right'),
  chat_position = COALESCE(position, 'bottom-right')
WHERE button_position IS NULL OR chat_position IS NULL;