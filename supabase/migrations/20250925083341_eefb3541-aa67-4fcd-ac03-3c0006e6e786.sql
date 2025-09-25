-- Analyser et nettoyer toutes les policies INSERT sur la table orders
-- Policies actuellement présentes sur la table orders :

-- 1. "Admins can update orders" - Command: UPDATE
-- 2. "Admins can view all orders" - Command: SELECT  
-- 3. "Allow insert orders (anon + auth, user_id nullable)" - Command: INSERT
-- 4. "Users can view their own orders" - Command: SELECT
-- 5. "allow_insert_orders" - Command: INSERT

-- Nettoyage complet de toutes les policies INSERT existantes
DROP POLICY IF EXISTS "Allow insert orders for anon and auth (user_id nullable)" ON orders;
DROP POLICY IF EXISTS "allow_insert_orders" ON orders;
DROP POLICY IF EXISTS "Allow insert orders (anon + auth, user_id nullable)" ON orders;
DROP POLICY IF EXISTS "Allow anonymous and authenticated users to insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;

-- Nouvelle policy unique selon vos spécifications exactes
CREATE POLICY "Allow insert orders (anon + auth, user_id nullable)"
ON orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  user_id IS NULL
  OR user_id = auth.uid()
);

-- 🔍 Vérification : rôle de session et test insert anonyme
DO $$
DECLARE
    current_role text;
BEGIN
    -- Vérifier le rôle courant (anon ou authenticated)
    SELECT current_setting('role', true) INTO current_role;
    RAISE NOTICE 'Current role = %', current_role;

    -- Insérer une commande de test avec user_id NULL
    INSERT INTO orders (customer_name, customer_phone, customer_address, total_amount, user_id)
    VALUES ('Test Anon', '00000000', 'Adresse test anonyme', 99.99, NULL);

    -- Nettoyer pour ne pas polluer
    DELETE FROM orders WHERE customer_name = 'Test Anon' AND customer_phone = '00000000';

    RAISE NOTICE '✅ Test insert avec user_id NULL réussi';
END $$;