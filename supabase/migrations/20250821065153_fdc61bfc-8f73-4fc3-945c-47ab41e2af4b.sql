-- Correction du problème de sécurité : mettre à jour la fonction avec search_path sécurisé
CREATE OR REPLACE FUNCTION clean_slug(input_text TEXT)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;