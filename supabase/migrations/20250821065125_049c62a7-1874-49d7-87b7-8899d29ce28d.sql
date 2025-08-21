-- Ajouter les champs SEO à la table products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS indexable BOOLEAN DEFAULT true;

-- Fonction pour générer un slug propre
CREATE OR REPLACE FUNCTION clean_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(
                      REPLACE(input_text, ' ', '-'),
                      'é', 'e'
                    ),
                    'è', 'e'
                  ),
                  'à', 'a'
                ),
                'ù', 'u'
              ),
              'ç', 'c'
            ),
            'ô', 'o'
          ),
          'â', 'a'
        ),
        'î', 'i'
      ),
      'ê', 'e'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Mettre à jour tous les slugs existants
UPDATE products 
SET slug = clean_slug(name)
WHERE slug IS NULL OR slug = '' OR slug LIKE '%_%' OR slug != LOWER(slug);

-- Générer les métadonnées SEO pour tous les produits
UPDATE products 
SET 
  seo_title = CASE 
    WHEN LENGTH(name) <= 50 THEN name || ' | Sonoff Tunisie'
    ELSE LEFT(name, 47) || '... | Sonoff Tunisie'
  END,
  seo_description = CASE 
    WHEN description IS NOT NULL AND LENGTH(description) > 50 THEN 
      LEFT(REGEXP_REPLACE(description, '【.*?】', '', 'g'), 157) || '...'
    WHEN description IS NOT NULL THEN 
      description || ' Disponible chez Sonoff Tunisie.'
    ELSE 
      'Découvrez ' || name || ' chez Sonoff Tunisie. Livraison rapide en Tunisie.'
  END,
  indexable = true
WHERE seo_title IS NULL OR seo_description IS NULL;