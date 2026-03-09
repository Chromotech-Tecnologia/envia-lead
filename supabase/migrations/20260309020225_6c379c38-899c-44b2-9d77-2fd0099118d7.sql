
-- Drop the problematic ALL policy that has no WITH CHECK
DROP POLICY IF EXISTS "Users can manage questions" ON public.questions;

-- Drop existing INSERT policy to recreate with proper WITH CHECK
DROP POLICY IF EXISTS "Admins can create questions" ON public.questions;

-- Recreate INSERT policy with proper WITH CHECK clause
CREATE POLICY "Admins can create questions" ON public.questions
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM flows
    WHERE flows.id = questions.flow_id
    AND (flows.company_id = get_user_company_id() OR is_global_admin())
  )
);

-- Ensure UPDATE policy also has WITH CHECK
DROP POLICY IF EXISTS "Admins can update questions" ON public.questions;
CREATE POLICY "Admins can update questions" ON public.questions
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM flows
    WHERE flows.id = questions.flow_id
    AND (flows.company_id = get_user_company_id() OR is_global_admin())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM flows
    WHERE flows.id = questions.flow_id
    AND (flows.company_id = get_user_company_id() OR is_global_admin())
  )
);
