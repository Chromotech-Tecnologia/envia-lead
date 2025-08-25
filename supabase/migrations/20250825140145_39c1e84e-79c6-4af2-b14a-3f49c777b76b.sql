-- Drop the insecure policy that allows everyone to view all companies
DROP POLICY IF EXISTS "Users can view companies" ON public.companies;

-- Create a secure policy that only allows users to view their own company
CREATE POLICY "Users can view their own company" 
ON public.companies 
FOR SELECT 
USING (
  id = get_user_company_id() 
  OR is_global_admin()
);

-- Ensure admins can still manage their company data
DROP POLICY IF EXISTS "Admins can update companies" ON public.companies;

CREATE POLICY "Admins can update their own company" 
ON public.companies 
FOR UPDATE 
USING (
  (get_user_role() = 'admin'::text AND id = get_user_company_id()) 
  OR is_global_admin()
)
WITH CHECK (
  (get_user_role() = 'admin'::text AND id = get_user_company_id()) 
  OR is_global_admin()
);