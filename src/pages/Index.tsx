
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProductGrid from '@/components/ProductGrid';
import ImageAccordion from '@/components/ImageAccordion';
import { Product } from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch only visible products (not hidden) and featured products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('featured', true)
          .eq('hidden', false)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;
        
        if (productsData) {
          const formattedProducts = productsData.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.main_image_url || '/placeholder.svg',
            category: product.categories?.name || 'Sans catégorie',
            description: product.description || '',
            stock: product.stock_quantity
          }));
          
          setProducts(formattedProducts);
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast({
          title: "Erreur",
          description: `Impossible de charger les produits: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  return (
    <Layout>
      <ImageAccordion />
      <div className="py-12">
        <ProductGrid 
          products={loading ? [] : products} 
          title="Produits populaires" 
        />
      </div>
    </Layout>
  );
};

export default Index;
