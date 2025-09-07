-- Nettoyer les derniers slugs avec des caractères spéciaux restants
UPDATE products 
SET slug = REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(slug, 'é', 'e'),
                'è', 'e'
              ),
              'à', 'a'
            ),
            'ù', 'u'
          ),
          '[|/()]', '-', 'g'
        ),
        '''', '', 'g'
      ),
      '[^a-z0-9-]', '', 'g'
    ),
    '-+', '-', 'g'
  ),
  '^-|-$', '', 'g'
),
updated_at = now()
WHERE slug ~ '[^a-z0-9-]' OR slug ~ '^-' OR slug ~ '-$' OR slug ~ '--';