
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ImageAccordion from '@/components/ImageAccordion';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch featured products to display
        const { data: products, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(name)
          `)
          .eq('featured', true)
          .order('name')
          .limit(12);

        if (error) throw error;
        
        if (products && products.length > 0) {
          const formattedProducts = products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.main_image_url || '/placeholder.svg',
            category: product.categories?.name || 'Non catégorisé',
            description: product.description,
            stock: product.stock_quantity
          }));
          
          setProducts(formattedProducts);
        } else {
          // If no products from DB, use empty array
          setProducts([]);
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast({
          title: "Erreur",
          description: `Impossible de charger les produits: ${error.message}`,
          variant: "destructive",
        });
        setProducts([]); // Use empty array when error
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <Layout>
      <ImageAccordion />
      <div className="py-12">
        <ProductGrid products={loading ? [] : products} title="Produits Populaires" />
      </div>
    </Layout>
  );
};

export default HomePage;
