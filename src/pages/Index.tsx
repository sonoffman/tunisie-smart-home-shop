
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProductGrid from '@/components/ProductGrid';
import DynamicImageAccordion from '@/components/DynamicImageAccordion';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useCMSContent } from '@/hooks/useCMSContent';

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Hook pour récupérer le texte d'accueil depuis le CMS
  const { title: welcomeTitle } = useCMSContent(
    'welcome-message', 
    'Bienvenue sur SONOFF Tunisie', 
    ''
  );

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        console.log('Fetching featured products...');
        
        // Fetch featured products
        const { data: products, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(name)
          `)
          .eq('featured', true)
          .eq('hidden', false)
          .order('name');

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }
        
        console.log('Featured products fetched:', products?.length || 0);
        
        if (products && products.length > 0) {
          const formattedProducts: Product[] = products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.main_image_url || '/placeholder.svg',
            category: product.categories?.name || 'Non catégorisé',
            description: product.description,
            stock: product.stock_quantity,
            slug: product.slug
          }));
          
          setFeaturedProducts(formattedProducts);
        } else {
          console.log('No featured products found');
          setFeaturedProducts([]);
        }
      } catch (error: any) {
        console.error('Error fetching featured products:', error);
        toast({
          title: "Erreur",
          description: `Impossible de charger les produits phares: ${error.message}`,
          variant: "destructive",
        });
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [toast]);

  return (
    <Layout>
      {/* Bannière dynamique */}
      <DynamicImageAccordion />
      
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          {welcomeTitle}
        </h1>

        {/* Section Produits Phares */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            Nos Produits Phares
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <p>Chargement des produits phares...</p>
            </div>
          ) : featuredProducts.length > 0 ? (
            <ProductGrid 
              products={featuredProducts} 
              title=""
              showAll={false}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun produit phare disponible pour le moment.</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Index;
