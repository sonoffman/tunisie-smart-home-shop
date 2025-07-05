
import React from 'react';
import Layout from '@/components/Layout';
import DynamicImageAccordion from '@/components/DynamicImageAccordion';
import CategoryDropdown from '@/components/CategoryDropdown';
import ProductGrid from '@/components/ProductGrid';
import ContactFooter from '@/components/ContactFooter';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

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
            <ProductGrid featured={true} limit={8} />
          </section>
        </div>
        
        <ContactFooter />
      </div>
    </Layout>
  );
};

export default Index;
