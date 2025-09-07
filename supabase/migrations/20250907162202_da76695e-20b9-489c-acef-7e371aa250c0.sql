-- Nettoyer les slugs avec des caractères spéciaux
UPDATE products 
SET slug = clean_slug(name),
    updated_at = now()
WHERE slug ~ '[^a-z0-9-]' OR slug ~ '^-' OR slug ~ '-$' OR slug ~ '--';

-- Vérifier et mettre à jour les slugs pour qu'ils soient SEO-friendly
UPDATE products 
SET slug = CASE 
  WHEN slug LIKE '%-–-%' THEN REPLACE(slug, '–', '-')
  WHEN slug LIKE '%–%' THEN REPLACE(slug, '–', '-')
  WHEN slug LIKE '%/%' THEN REPLACE(slug, '/', '-')
  WHEN slug LIKE '%(%' OR slug LIKE '%)%' THEN REGEXP_REPLACE(slug, '[()]', '', 'g')
  WHEN slug LIKE '%,%' THEN REPLACE(slug, ',', '')
  WHEN slug LIKE '%''%' THEN REPLACE(slug, '''', '')
  WHEN slug LIKE '%"%' THEN REPLACE(slug, '"', '')
  WHEN slug LIKE '% %' THEN REPLACE(slug, ' ', '-')
  ELSE slug
END,
updated_at = now()
WHERE slug ~ '[^a-z0-9-]' OR slug ~ '^-' OR slug ~ '-$' OR slug ~ '--';

-- Nettoyer les tirets multiples et en début/fin
UPDATE products 
SET slug = REGEXP_REPLACE(TRIM(BOTH '-' FROM slug), '-+', '-', 'g'),
    updated_at = now()
WHERE slug ~ '--' OR slug ~ '^-' OR slug ~ '-$';