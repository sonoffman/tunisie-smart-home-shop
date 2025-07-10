
-- Corriger les politiques RLS pour la table customers
DROP POLICY IF EXISTS "Admins can do everything with customers" ON public.customers;

CREATE POLICY "Admins can manage customers" 
  ON public.customers 
  FOR ALL 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow insert customers for invoices" 
  ON public.customers 
  FOR INSERT 
  WITH CHECK (true);

-- Corriger les politiques RLS pour le storage des bannières
DROP POLICY IF EXISTS "Allow authenticated users to upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view banner images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete banner images" ON storage.objects;

-- Politiques pour le bucket banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true) 
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow admins to upload banner images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'banners' AND is_admin(auth.uid()));

CREATE POLICY "Allow admins to update banner images" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'banners' AND is_admin(auth.uid()));

CREATE POLICY "Allow admins to delete banner images" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'banners' AND is_admin(auth.uid()));

CREATE POLICY "Allow public to view banner images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'banners');
