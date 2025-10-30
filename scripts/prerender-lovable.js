// scripts/prerender-lovable.js
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://ixurnulffowefnouwfcs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dXJudWxmZm93ZWZub3V3ZmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNDg2MTQsImV4cCI6MjA2MDkyNDYxNH0.7TJGUB7uo2oQTLFA762YGFKlPwu6-h5t-k6KjJqB8zg';
const supabase = createClient(supabaseUrl, supabaseKey);

const baseUrl = 'https://www.sonoff-tunisie.com';

async function prerenderProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, description, price, main_image_url, seo_title, seo_description')
    .eq('indexable', true);

  if (error) {
    console.error('Erreur chargement produits:', error);
    return;
  }

  const distPath = path.resolve('./dist/produit');
  fs.mkdirSync(distPath, { recursive: true });

  for (const p of products) {
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>${p.seo_title || p.name} | Sonoff Tunisie</title>
        <meta name="description" content="${p.seo_description || p.description?.substring(0, 160)}" />
        <link rel="canonical" href="${baseUrl}/produit/${p.slug}" />
        <meta property="og:title" content="${p.name}" />
        <meta property="og:description" content="${p.description?.substring(0, 160)}" />
        <meta property="og:image" content="${p.main_image_url}" />
        <meta property="og:url" content="${baseUrl}/produit/${p.slug}" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "${p.name}",
            "description": "${p.description?.replace(/"/g, '')}",
            "image": "${p.main_image_url}",
            "offers": {
              "@type": "Offer",
              "price": "${p.price}",
              "priceCurrency": "TND"
            }
          }
        </script>
      </head>
      <body>
        <div id="root"></div>
        <script src="/assets/index.js"></script>
      </body>
      </html>
    `;

    fs.writeFileSync(path.join(distPath, `${p.slug}.html`), html);
    console.log(`✅ Page générée : produit/${p.slug}.html`);
  }

  console.log(`✨ Prérendu terminé (${products.length} produits).`);
}

prerenderProducts();
