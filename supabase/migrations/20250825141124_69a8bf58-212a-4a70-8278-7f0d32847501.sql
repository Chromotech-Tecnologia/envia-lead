-- Drop the insecure policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Create a secure policy that only allows users to view profiles within their own company
CREATE POLICY "Users can view company profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can see profiles in their own company
  (company_id = get_user_company_id())
  -- Global admins can see all profiles
  OR is_global_admin()
);

-- Keep the existing "Users can view own profile" policy as it's already secure
-- It allows users to always see their own profile regardless of company