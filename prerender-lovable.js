import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const BASE_URL = "https://www.sonoff-tunisie.com";
const OUTPUT_DIR = "./dist";
const API_URL = "https://ixurnulffowefnouwfcs.supabase.co/rest/v1/produits"; // à remplacer
const MANIFEST_PATH = path.join(OUTPUT_DIR, "manifest.json");

// 🔹 On lit le manifest Vite pour trouver le bon fichier JS
let entryFile = "assets/index.js";
if (fs.existsSync(MANIFEST_PATH)) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const entry = Object.values(manifest).find((e) => e.isEntry);
  if (entry) entryFile = entry.file;
  console.log("✅ Fichier JS détecté :", entryFile);
} else {
  console.warn("⚠️ manifest.json introuvable. Vérifie que Vite a été build avec `manifest: true`.");
}

const HEAD_HTML = (title, description, url, jsonld, jsFile) => `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}" />
<script type="application/ld+json">${jsonld}</script>
</head>
<body>
<div id="root"></div>
<script type="module" src="/${jsFile}"></script>
</body>
</html>
`;

async function prerenderProducts() {
  console.log("🚀 Pré-rendu des produits...");
  const res = await fetch(API_URL, {
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    },
  });
  const products = await res.json();

  for (const p of products) {
    const slug = p.slug || p.id;
    const dir = path.join(OUTPUT_DIR, "produit", slug);
    fs.mkdirSync(dir, { recursive: true });

    const jsonld = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": p.name,
      "description": p.description,
      "image": p.imageUrl,
      "offers": {
        "@type": "Offer",
        "price": p.price,
        "priceCurrency": "TND",
        "availability": p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      }
    };

    const html = HEAD_HTML(
      p.name,
      p.description?.slice(0, 150),
      `${BASE_URL}/produit/${slug}`,
      JSON.stringify(jsonld, null, 2),
      entryFile
    );

    fs.writeFileSync(path.join(dir, "index.html"), html);
    console.log(`✅ Page produit générée : /produit/${slug}`);
  }
  console.log("🎯 Pré-rendu terminé !");
}

prerenderProducts().catch(console.error);
