
-- Corriger les politiques RLS pour la table customers
-- Le problème est que la politique actuelle est trop restrictive

-- Supprimer l'ancienne politique
DROP POLICY IF EXISTS "Allow authenticated users to manage customers" ON public.customers;

-- Créer des politiques plus spécifiques et permissives
-- Permettre à tous les utilisateurs authentifiés de voir les clients
CREATE POLICY "Allow authenticated users to view customers" 
  ON public.customers 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Permettre à tous les utilisateurs authentifiés de créer des clients
CREATE POLICY "Allow authenticated users to create customers" 
  ON public.customers 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Permettre aux admins de modifier et supprimer les clients
CREATE POLICY "Allow admins to update customers" 
  ON public.customers 
  FOR UPDATE 
  USING (is_admin(auth.uid()));

CREATE POLICY "Allow admins to delete customers" 
  ON public.customers 
  FOR DELETE 
  USING (is_admin(auth.uid()));
