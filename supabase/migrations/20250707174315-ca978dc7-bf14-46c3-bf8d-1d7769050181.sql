
-- Corriger les politiques RLS pour la table banner_accordion
-- Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "Admins can update banners" ON banner_accordion;
DROP POLICY IF EXISTS "Admins can insert banners" ON banner_accordion;
DROP POLICY IF EXISTS "Admins can delete banners" ON banner_accordion;

-- Recréer les politiques avec la bonne logique
CREATE POLICY "Admins can manage all banners" ON banner_accordion
FOR ALL USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
