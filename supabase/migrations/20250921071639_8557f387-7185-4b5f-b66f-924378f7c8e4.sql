-- Ensure all blog posts have valid slugs
UPDATE blog_posts 
SET slug = clean_slug(title) 
WHERE slug IS NULL OR slug = '' OR LENGTH(TRIM(slug)) = 0;

-- Fix duplicate slugs by adding a suffix with a temporary function
DO $$
DECLARE
    r RECORD;
    counter INTEGER;
BEGIN
    FOR r IN 
        SELECT slug 
        FROM blog_posts 
        GROUP BY slug 
        HAVING COUNT(*) > 1
    LOOP
        counter := 1;
        FOR r IN 
            SELECT id 
            FROM blog_posts 
            WHERE slug = r.slug 
            ORDER BY created_at
            OFFSET 1
        LOOP
            UPDATE blog_posts 
            SET slug = slug || '-' || counter
            WHERE id = r.id;
            counter := counter + 1;
        END LOOP;
    END LOOP;
END $$;