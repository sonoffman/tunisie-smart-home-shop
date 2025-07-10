
-- Corriger les politiques RLS pour permettre les insertions nécessaires

-- 1. Politique pour les clients - permettre l'insertion lors de la création de factures
DROP POLICY IF EXISTS "Allow insert customers for invoices" ON public.customers;

CREATE POLICY "Allow authenticated users to insert customers" 
  ON public.customers 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- 2. Politiques pour le storage des bannières - corriger les politiques existantes
DROP POLICY IF EXISTS "Allow admins to upload banner images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to update banner images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to delete banner images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view banner images" ON storage.objects;

-- Créer des politiques plus permissives pour les bannières
CREATE POLICY "Allow authenticated users to upload to banners bucket" 
  ON storage.objects 
  FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Allow authenticated users to update banners bucket" 
  ON storage.objects 
  FOR UPDATE 
  TO authenticated
  USING (bucket_id = 'banners');

CREATE POLICY "Allow authenticated users to delete from banners bucket" 
  ON storage.objects 
  FOR DELETE 
  TO authenticated
  USING (bucket_id = 'banners');

CREATE POLICY "Allow everyone to view banners bucket" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'banners');

-- 3. S'assurer que les utilisateurs authentifiés peuvent créer des factures
CREATE POLICY "Allow authenticated users to insert invoices" 
  ON public.invoices 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);
