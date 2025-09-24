-- Remove the conflicting policy that might be causing issues
DROP POLICY IF EXISTS "Allow anon insert orders" ON orders;

-- Create a comprehensive policy that allows anonymous users to insert orders
CREATE POLICY "Allow anonymous and authenticated users to insert orders"
ON orders
FOR INSERT
WITH CHECK (true);