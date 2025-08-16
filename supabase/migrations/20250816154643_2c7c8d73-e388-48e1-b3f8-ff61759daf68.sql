-- Fix security issues: Enable RLS on tables that have policies but RLS is disabled
-- and ensure all public tables have RLS enabled

-- Enable RLS on invoices table (it has policies but RLS is disabled)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Check for other tables that need RLS enabled
-- Enable RLS on any remaining tables that don't have it
ALTER TABLE public.products_duplicate ENABLE ROW LEVEL SECURITY;

-- Create a basic RLS policy for products_duplicate to make it secure
CREATE POLICY "Allow public read access to products_duplicate" 
  ON public.products_duplicate 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow admins to manage products_duplicate" 
  ON public.products_duplicate 
  FOR ALL 
  USING (is_admin(auth.uid()));