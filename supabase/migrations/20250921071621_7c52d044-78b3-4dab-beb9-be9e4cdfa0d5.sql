-- Ensure all blog posts have valid slugs
UPDATE blog_posts 
SET slug = clean_slug(title) 
WHERE slug IS NULL OR slug = '' OR LENGTH(TRIM(slug)) = 0;

-- Update any duplicate slugs by appending a number
UPDATE blog_posts 
SET slug = slug || '-' || ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at)
WHERE slug IN (
  SELECT slug 
  FROM blog_posts 
  GROUP BY slug 
  HAVING COUNT(*) > 1
) AND id NOT IN (
  SELECT DISTINCT ON (slug) id 
  FROM blog_posts 
  ORDER BY slug, created_at
);