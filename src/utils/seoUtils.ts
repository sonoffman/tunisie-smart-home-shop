// Utilitaires pour le SEO

export const generateCleanSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[éèê]/g, 'e')
    .replace(/[àâ]/g, 'a')
    .replace(/[ùû]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ôö]/g, 'o')
    .replace(/[îï]/g, 'i')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const generateSEOTitle = (productName: string): string => {
  const maxLength = 60;
  const suffix = ' | Sonoff Tunisie';
  const availableLength = maxLength - suffix.length;
  
  if (productName.length <= availableLength) {
    return `${productName}${suffix}`;
  }
  
  return `${productName.substring(0, availableLength - 3)}...${suffix}`;
};

export const generateSEODescription = (productName: string, description?: string): string => {
  const maxLength = 160;
  const fallback = `Découvrez ${productName} chez Sonoff Tunisie. Livraison rapide en Tunisie. Produits Sonoff authentiques et garantis.`;
  
  if (!description) {
    return fallback.length <= maxLength ? fallback : fallback.substring(0, maxLength - 3) + '...';
  }
  
  // Nettoyer la description des caractères spéciaux
  const cleanDescription = description.replace(/【.*?】/g, '').trim();
  
  if (cleanDescription.length <= maxLength) {
    return cleanDescription;
  }
  
  return cleanDescription.substring(0, maxLength - 3) + '...';
};

export const generateCanonicalUrl = (path: string): string => {
  const baseUrl = 'https://www.sonoff-tunisie.com';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};