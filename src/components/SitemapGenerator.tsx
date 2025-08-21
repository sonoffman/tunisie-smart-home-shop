import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

const SitemapGenerator: React.FC = () => {
  const [sitemap, setSitemap] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateSitemap = async () => {
    setLoading(true);
    try {
      const baseUrl = 'https://www.sonoff-tunisie.com';
      const entries: SitemapEntry[] = [];
      
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
      
      // Récupérer tous les produits
      const { data: products } = await supabase
        .from('products')
        .select('slug, updated_at, indexable')
        .eq('hidden', false)
        .eq('indexable', true);
      
      if (products) {
        products.forEach(product => {
          entries.push({
            url: `${baseUrl}/produit/${product.slug}`,
            lastmod: product.updated_at ? product.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.8'
          });
        });
      }
      
      // Récupérer les catégories
      const { data: categories } = await supabase
        .from('categories')
        .select('slug');
      
      if (categories) {
        categories.forEach(category => {
          entries.push({
            url: `${baseUrl}/categorie/${category.slug}`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.7'
          });
        });
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
      
      setSitemap(xmlContent);
    } catch (error) {
      console.error('Erreur génération sitemap:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const downloadSitemap = () => {
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Générateur de Sitemap</h2>
      
      <div className="space-y-4">
        <button
          onClick={generateSitemap}
          disabled={loading}
          className="px-4 py-2 bg-sonoff-blue text-white rounded hover:bg-sonoff-teal disabled:opacity-50"
        >
          {loading ? 'Génération...' : 'Générer Sitemap'}
        </button>
        
        {sitemap && (
          <div className="space-y-4">
            <button
              onClick={downloadSitemap}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Télécharger sitemap.xml
            </button>
            
            <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
              <pre className="text-sm">{sitemap}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SitemapGenerator;