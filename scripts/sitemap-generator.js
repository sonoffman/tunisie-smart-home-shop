import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = "https://ixurnulffowefnouwfcs.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dXJudWxmZm93ZWZub3V3ZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDg2MTQsImV4cCI6MjA2MDkyNDYxNH0.7TJGUB7uo2oQTLFA762YGFKlPwu6-h5t-k6KjJqB8zg";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function generateSitemap() {
  try {
    const baseUrl = 'https://www.sonoff-tunisie.com';
    const entries = [];
    
    // Pages statiques
    entries.push({
      url: baseUrl,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '1.0'
    });
    
    entries.push({
      url: `${baseUrl}/produits`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: '0.9'
    });
    
    // Récupérer tous les produits visibles et indexables
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('hidden', false)
      .eq('indexable', true)
      .not('slug', 'is', null);
    
    if (productsError) {
      console.error('Erreur récupération produits:', productsError);
    } else if (products) {
      products.forEach(product => {
        entries.push({
          url: `${baseUrl}/produit/${product.slug}`,
          lastmod: product.updated_at ? product.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.8'
        });
      });
      console.log(`✓ ${products.length} produits ajoutés au sitemap`);
    }
    
    // Récupérer les catégories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('slug')
      .not('slug', 'is', null);
    
    if (categoriesError) {
      console.error('Erreur récupération catégories:', categoriesError);
    } else if (categories) {
      categories.forEach(category => {
        entries.push({
          url: `${baseUrl}/categorie/${category.slug}`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.7'
        });
      });
      console.log(`✓ ${categories.length} catégories ajoutées au sitemap`);
    }
    
    // Générer le XML
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(entry => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    // Écrire le fichier dans public/
    const publicDir = path.join(process.cwd(), 'public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    
    // Créer le dossier public s'il n'existe pas
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    fs.writeFileSync(sitemapPath, xmlContent, 'utf8');
    
    console.log(`✓ Sitemap généré avec succès: ${sitemapPath}`);
    console.log(`✓ Total: ${entries.length} URLs dans le sitemap`);
    
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();