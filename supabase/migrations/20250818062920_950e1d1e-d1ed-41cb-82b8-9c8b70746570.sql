-- Ajouter une entrée CMS par défaut pour le message d'accueil
INSERT INTO cms_pages (title, slug, content, created_at, updated_at)
SELECT 'Bienvenue sur SONOFF Tunisie', 'welcome-message', '', now(), now()
WHERE NOT EXISTS (
    SELECT 1 FROM cms_pages WHERE slug = 'welcome-message'
);