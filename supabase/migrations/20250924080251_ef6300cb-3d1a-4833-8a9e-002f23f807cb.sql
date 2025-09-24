-- Ajouter une policy pour permettre aux utilisateurs anonymes d'insérer des commandes
CREATE POLICY "Allow anon insert orders"
ON orders
FOR INSERT
TO anon
WITH CHECK (true);