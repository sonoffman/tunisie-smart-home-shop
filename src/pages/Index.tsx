
import React from 'react';
import Layout from '@/components/Layout';
import DynamicImageAccordion from '@/components/DynamicImageAccordion';
import CategoryDropdown from '@/components/CategoryDropdown';
import ProductGrid from '@/components/ProductGrid';
import ContactFooter from '@/components/ContactFooter';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

const Index = () => {
  const isMobile = useIsMobile();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .eq('hidden', false)
        .limit(8);

      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        <DynamicImageAccordion />
        
        {/* Dropdown catégories visible seulement sur mobile */}
        {isMobile && <CategoryDropdown />}
        
        <div className="container mx-auto px-4 py-8">
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-sonoff-blue">
              Nos Produits Phares
            </h2>
            <ProductGrid products={featuredProducts} title="Nos Produits Phares" />
          </section>
        </div>
        
        <ContactFooter />
      </div>
    </Layout>
  );
};

export default Index;
