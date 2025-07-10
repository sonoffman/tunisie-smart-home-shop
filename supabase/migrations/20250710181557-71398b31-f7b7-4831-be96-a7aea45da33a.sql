
-- Supprimer toutes les politiques conflictuelles et les recréer proprement

-- 1. Nettoyer complètement les politiques pour la table customers
DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Allow authenticated users to insert customers" ON public.customers;
DROP POLICY IF EXISTS "Allow insert customers for invoices" ON public.customers;

-- Recréer les politiques customers
CREATE POLICY "Allow authenticated users to manage customers" 
  ON public.customers 
  FOR ALL 
  TO authenticated
  WITH CHECK (true);

-- 2. Nettoyer complètement les politiques pour storage.objects
DROP POLICY IF EXISTS "Allow authenticated users to upload to banners bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update banners bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete from banners bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow everyone to view banners bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to update banner images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete banner images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view banner images" ON storage.objects;

-- Recréer les politiques storage avec permissions maximales pour les utilisateurs connectés
CREATE POLICY "Full access to banners bucket for authenticated users" 
  ON storage.objects 
  FOR ALL 
  TO authenticated
  WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Public read access to banners bucket" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'banners');

-- 3. Nettoyer et recréer les politiques pour invoices
DROP POLICY IF EXISTS "Allow authenticated users to insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can do everything with invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;

CREATE POLICY "Allow authenticated users to manage invoices" 
  ON public.invoices 
  FOR ALL 
  TO authenticated
  WITH CHECK (true);
