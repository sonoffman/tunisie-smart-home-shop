
-- Créer les politiques RLS manquantes pour la table invoice_settings
-- Permettre aux administrateurs de voir, créer, modifier et supprimer les paramètres de facture

-- Politique pour SELECT (lecture)
CREATE POLICY "Admins can view invoice settings" ON public.invoice_settings
FOR SELECT USING (public.is_admin(auth.uid()));

-- Politique pour INSERT (création)
CREATE POLICY "Admins can create invoice settings" ON public.invoice_settings
FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Politique pour UPDATE (modification)
CREATE POLICY "Admins can update invoice settings" ON public.invoice_settings
FOR UPDATE USING (public.is_admin(auth.uid()));

-- Politique pour DELETE (suppression)
CREATE POLICY "Admins can delete invoice settings" ON public.invoice_settings
FOR DELETE USING (public.is_admin(auth.uid()));

-- Activer RLS sur la table si ce n'est pas déjà fait
ALTER TABLE public.invoice_settings ENABLE ROW LEVEL SECURITY;

-- Ajouter une colonne status à la table contact_form_submissions pour gérer les états
ALTER TABLE public.contact_form_submissions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'nouveau' 
CHECK (status IN ('nouveau', 'sérieux', 'non sérieux', 'contacté'));

-- Ajouter une colonne hidden aux produits pour permettre de les masquer
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;
