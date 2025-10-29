import React from 'react';
import { Helmet } from 'react-helmet-async';

interface ProductJsonLdProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    slug: string;
    stock?: number;
  };
}

const ProductJsonLd: React.FC<ProductJsonLdProps> = ({ product }) => {
  const baseUrl = 'https://www.sonoff-tunisie.com';
  const productUrl = `${baseUrl}/produit/${product.slug}`;
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.imageUrl.startsWith('http') ? product.imageUrl : `${baseUrl}${product.imageUrl}`,
    "url": productUrl,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Sonoff"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "Sonoff"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "TND",
      "availability": product.stock && product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "url": productUrl,
      "priceValidUntil": "2027-12-30",
      "seller": {
        "@type": "Organization",
        "name": "Sonoff Tunisie",
        "url": baseUrl
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "7.00",
          "currency": "TND"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "DAY"
          }
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "TN"
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "10"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

export default ProductJsonLd;