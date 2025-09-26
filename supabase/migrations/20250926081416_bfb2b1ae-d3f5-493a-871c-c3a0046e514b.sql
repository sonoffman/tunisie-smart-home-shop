-- Nettoyage et fix définitif du problème RLS pour les commandes anonymes

-- 1. Supprimer toutes les policies INSERT existantes pour éviter les conflits
DROP POLICY IF EXISTS "Allow insert orders for everyone" ON orders;
DROP POLICY IF EXISTS "Allow insert orders for everyone with user_id null or matching" ON orders;

-- 2. Créer UNE SEULE policy claire pour INSERT
CREATE POLICY "orders_insert_policy"
ON orders
FOR INSERT
TO public
WITH CHECK (
  -- Permettre insertion avec user_id NULL (utilisateurs anonymes)
  -- OU avec user_id égal à l'utilisateur connecté
  user_id IS NULL 
  OR user_id = auth.uid()
);

-- 3. Test direct d'insertion anonyme
INSERT INTO orders (customer_name, customer_phone, customer_address, total_amount, user_id, status)
VALUES ('ABCDEF TEST', '12345678', 'hamhama hamhama hamhama', 99.99, NULL, 'new')
RETURNING id, customer_name;