-- Analyser les policies existantes sur la table orders
-- Voici les policies actuellement présentes :

-- 1. "Admins can update orders" - Command: UPDATE
--    Using Expression: (EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role))))

-- 2. "Admins can view all orders" - Command: SELECT  
--    Using Expression: (EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::user_role))))

-- 3. "Allow anonymous and authenticated users to insert orders" - Command: INSERT
--    With Check Expression: true

-- 4. "Anyone can insert orders" - Command: INSERT
--    With Check Expression: true  

-- 5. "Users can view their own orders" - Command: SELECT
--    Using Expression: (auth.uid() = user_id)

-- Supprimer les policies INSERT existantes qui pourraient être en conflit
DROP POLICY IF EXISTS "Allow anonymous and authenticated users to insert orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;

-- Créer la nouvelle policy selon vos spécifications exactes
CREATE POLICY "Allow insert orders (anon + auth, user_id nullable)"
ON orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Test d'insertion avec user_id NULL pour vérifier que ça fonctionne
-- Cette insertion sera annulée après le test
DO $$
BEGIN
    -- Insérer une ligne de test
    INSERT INTO orders (customer_name, customer_phone, customer_address, total_amount, user_id) 
    VALUES ('Test Customer', '123456789', 'Test Address', 100.00, NULL);
    
    -- Supprimer immédiatement la ligne de test
    DELETE FROM orders WHERE customer_name = 'Test Customer' AND customer_phone = '123456789';
    
    RAISE NOTICE 'Test d''insertion avec user_id NULL réussi !';
END $$;