
-- Fix RLS policy for banner_accordion to allow updates
DROP POLICY IF EXISTS "Admins can manage banners" ON banner_accordion;

-- Create separate policies for better control
CREATE POLICY "Admins can view all banners" ON banner_accordion
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert banners" ON banner_accordion
  FOR INSERT WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update banners" ON banner_accordion
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete banners" ON banner_accordion
  FOR DELETE USING (is_admin(auth.uid()));
