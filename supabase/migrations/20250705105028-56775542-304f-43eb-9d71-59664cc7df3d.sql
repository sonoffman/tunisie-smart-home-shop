
-- Corriger les politiques RLS pour les bannières
DROP POLICY IF EXISTS "Admins can manage banners" ON public.banner_accordion;
CREATE POLICY "Admins can manage banners" ON public.banner_accordion
    FOR ALL USING (public.is_admin(auth.uid()));

-- Ajouter une colonne pour le type de document dans les factures
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'Facture';

-- Mettre à jour la valeur par défaut du timbre fiscal à 1 DT
ALTER TABLE public.invoices ALTER COLUMN timbre_fiscal SET DEFAULT 1;

-- Permettre la modification du numéro de facture
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS unique_invoice_number;
