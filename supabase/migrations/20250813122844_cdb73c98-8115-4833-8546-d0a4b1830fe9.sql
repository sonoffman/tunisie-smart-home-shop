-- Phase 1: Critical Security Fixes - RLS Policy Updates

-- Fix profiles table - prevent users from changing their role
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;

CREATE POLICY "Users can update their own profile data (except role)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent users from changing their role
  (OLD.role = NEW.role OR get_user_role(auth.uid()) = 'admin')
);

-- Fix orders table - only authenticated users can insert orders and must set correct user_id
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

CREATE POLICY "Authenticated users can insert their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Fix order_items table - only authenticated users can insert order items for their own orders
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;

CREATE POLICY "Authenticated users can insert order items for their own orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Add missing policies for better security

-- Ensure profiles can only be created for the authenticated user (if needed)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id AND auth.uid() IS NOT NULL);

-- Add policy for authenticated users to update their own orders (before shipping)
CREATE POLICY "Users can update their own pending orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id AND status IN ('new', 'pending'))
WITH CHECK (auth.uid() = user_id AND status IN ('new', 'pending'));

-- Ensure contact form submissions don't expose personal data
-- (This one looks OK already - only admins can view, anyone can insert)

-- Storage bucket policies will be handled in Phase 3
-- Authentication fixes will be handled in Phase 2