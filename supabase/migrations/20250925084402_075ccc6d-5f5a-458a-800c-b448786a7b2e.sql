-- Le problème : role "none" au lieu de "anon"
-- Solution : Créer une policy qui fonctionne pour tous les rôles

-- Supprimer la policy actuelle
DROP POLICY IF EXISTS "Allow insert orders (anon + auth, user_id nullable)" ON orders;

-- Créer une nouvelle policy pour PUBLIC (tous les rôles)
CREATE POLICY "Allow insert orders for everyone with user_id null or matching"
ON orders
FOR INSERT
TO public
WITH CHECK (
  user_id IS NULL
  OR user_id = auth.uid()
);

-- Test avec le rôle actuel
DO $$
BEGIN
    RAISE NOTICE 'Test insert avec rôle actuel...';
    
    -- Insérer une commande de test avec user_id NULL
    INSERT INTO orders (customer_name, customer_phone, customer_address, total_amount, user_id)
    VALUES ('Test Anon Debug', '00000000', 'Adresse test debug', 99.99, NULL);

    RAISE NOTICE '✅ Insert réussi avec user_id NULL';
    
    -- Nettoyer
    DELETE FROM orders WHERE customer_name = 'Test Anon Debug';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erreur lors du test: %', SQLERRM;
END $$;