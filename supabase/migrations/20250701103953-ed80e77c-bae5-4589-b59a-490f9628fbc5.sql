
-- Ajouter une colonne 'hidden' pour masquer les produits
ALTER TABLE products ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;

-- Ajouter une colonne 'status' au formulaire de contact avec valeur par défaut
ALTER TABLE contact_form_submissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'nouveau';

-- Créer la table pour les bannières dynamiques
CREATE TABLE IF NOT EXISTS public.banner_accordion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titre TEXT NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    lien_bouton TEXT,
    texte_bouton TEXT DEFAULT 'Découvrir',
    ordre INTEGER DEFAULT 0,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insérer les 5 bannières par défaut
INSERT INTO public.banner_accordion (titre, description, image, lien_bouton, texte_bouton, ordre) VALUES
('Modules WiFi Sonoff', 'Contrôlez vos appareils à distance avec la technologie Sonoff.', 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=1200&q=80', '/category/wifi', 'Découvrir', 1),
('Modules ZigBee', 'Connectez tous vos appareils avec la technologie ZigBee de Sonoff.', 'https://images.unsplash.com/photo-1585399000684-d2f72660f092?auto=format&fit=crop&w=1200&q=80', '/category/zigbee', 'Découvrir', 2),
('Interrupteurs Intelligents', 'Transformez votre maison avec nos interrupteurs connectés.', 'https://images.unsplash.com/photo-1596394723269-b2cbca4e6313?auto=format&fit=crop&w=1200&q=80', '/category/switch', 'Découvrir', 3),
('Écrans Tactiles', 'Pilotez votre maison intelligente depuis un écran tactile.', 'https://images.unsplash.com/photo-1544437939-ab1e06a4d0de?auto=format&fit=crop&w=1200&q=80', '/category/screen', 'Découvrir', 4),
('Accessoires Sonoff', 'Complétez votre installation avec nos accessoires compatibles.', 'https://images.unsplash.com/photo-1558346490-c7d0047bfbf6?auto=format&fit=crop&w=1200&q=80', '/category/accessories', 'Découvrir', 5);

-- Activer RLS pour la table banner_accordion
ALTER TABLE public.banner_accordion ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique des bannières actives
CREATE POLICY "Anyone can view active banners" ON public.banner_accordion
    FOR SELECT USING (actif = true);

-- Politique pour permettre aux admins de gérer les bannières
CREATE POLICY "Admins can manage banners" ON public.banner_accordion
    FOR ALL USING (public.is_admin(auth.uid()));

-- Corriger les politiques RLS pour les factures pour éviter l'erreur de sécurité
DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
CREATE POLICY "Admins can manage invoices" ON public.invoices
    FOR ALL USING (public.is_admin(auth.uid()));

-- Assurer l'unicité des numéros de facture
ALTER TABLE invoices ADD CONSTRAINT unique_invoice_number UNIQUE (invoice_number);
