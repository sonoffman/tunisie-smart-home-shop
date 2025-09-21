-- Create RLS policies for blog_images storage bucket

-- Allow admins to manage blog images (upload, update, delete)
CREATE POLICY "Admin blog images access" 
ON storage.objects 
FOR ALL 
TO authenticated 
USING (bucket_id = 'blog_images' AND is_admin(auth.uid()))
WITH CHECK (bucket_id = 'blog_images' AND is_admin(auth.uid()));

-- Allow public read access to blog images
CREATE POLICY "Public read access to blog images" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'blog_images');