import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHelmetProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

const SEOHelmet: React.FC<SEOHelmetProps> = ({
  title,
  description,
  canonical,
  ogImage = '/placeholder.svg',
  ogType = 'website',
  noIndex = false
}) => {
  const baseUrl = 'https://www.sonoff-tunisie.com';
  const fullCanonical = canonical ? `${baseUrl}${canonical}` : baseUrl;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />
      
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="Sonoff Tunisie" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullCanonical} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullOgImage} />
      
      {/* Additional SEO tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="content-language" content="fr-TN" />
      <meta name="author" content="Sonoff Tunisie" />
      <meta name="geo.region" content="TN" />
      <meta name="geo.placename" content="Tunisie" />
    </Helmet>
  );
};

export default SEOHelmet;