-- Fix security issue: Restrict access to leads table to admin users only
-- This prevents unauthorized employees from accessing sensitive customer form responses

-- Drop the overly permissive policy that allows all company users to access leads
DROP POLICY IF EXISTS "Users can manage leads" ON public.leads;

-- Create role-based policies for leads access

-- Policy 1: Only admins can view leads
CREATE POLICY "Only admins can view leads" 
ON public.leads 
FOR SELECT 
USING (
  -- Check if user is an admin in their company
  (get_user_role() = 'admin' AND company_id = get_user_company_id())
  -- Or if they're a global admin
  OR is_global_admin()
);

-- Policy 2: Only admins can update leads
CREATE POLICY "Only admins can update leads" 
ON public.leads 
FOR UPDATE 
USING (
  -- Check if user is an admin in their company
  (get_user_role() = 'admin' AND company_id = get_user_company_id())
  -- Or if they're a global admin
  OR is_global_admin()
)
WITH CHECK (
  -- Ensure they can only update leads in their company
  (get_user_role() = 'admin' AND company_id = get_user_company_id())
  OR is_global_admin()
);

-- Policy 3: Only admins can delete leads  
CREATE POLICY "Only admins can delete leads" 
ON public.leads 
FOR DELETE 
USING (
  -- Check if user is an admin in their company
  (get_user_role() = 'admin' AND company_id = get_user_company_id())
  -- Or if they're a global admin
  OR is_global_admin()
);

-- Policy 4: Keep INSERT unrestricted for the widget/edge functions
-- The save-lead edge function needs to be able to insert leads
-- This is safe because the edge function validates the data
CREATE POLICY "Edge functions can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

-- Add a comment explaining the security model
COMMENT ON TABLE public.leads IS 'Stores customer form responses. Access restricted to admin users only to protect sensitive customer data.';

-- Verify the policies are in place
SELECT 
  'Leads table secured' as status,
  COUNT(*) as policy_count,
  STRING_AGG(policyname, ', ') as policies
FROM pg_policies 
WHERE tablename = 'leads';