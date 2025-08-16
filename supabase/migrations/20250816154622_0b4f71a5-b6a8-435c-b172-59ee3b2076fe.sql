-- Fix RLS policies for invoices table to allow proper invoice generation
-- The current policy "Allow authenticated users to manage invoices" with command ALL might be too restrictive

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Allow authenticated users to manage invoices" ON public.invoices;

-- Create more specific policies
-- Allow authenticated users to view invoices
CREATE POLICY "Allow authenticated users to view invoices" 
  ON public.invoices 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to create invoices
CREATE POLICY "Allow authenticated users to create invoices" 
  ON public.invoices 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow admins to update invoices
CREATE POLICY "Allow admins to update invoices" 
  ON public.invoices 
  FOR UPDATE 
  USING (is_admin(auth.uid()));

-- Allow admins to delete invoices
CREATE POLICY "Allow admins to delete invoices" 
  ON public.invoices 
  FOR DELETE 
  USING (is_admin(auth.uid()));