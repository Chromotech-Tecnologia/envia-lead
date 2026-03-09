-- Drop the old CHECK constraint that blocks new question types
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_type_check;

-- Recreate with all supported types (current + legacy)
ALTER TABLE public.questions ADD CONSTRAINT questions_type_check 
  CHECK (type = ANY (ARRAY['text','email','phone','number','textarea','select','radio','bot_message','single','multiple']));