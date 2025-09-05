
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ProductGrid from '@/components/ProductGrid';
import DynamicImageAccordion from '@/components/DynamicImageAccordion';
import { Product } from '@/types/product';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

const AllProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      try {
        // Fetch ALL products that are not hidden (both featured and non-featured)
        const { data: products, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(name)
          `)
          .eq('hidden', false) // Only exclude hidden products
          .order('name');

        if (error) throw error;
        
        if (products && products.length > 0) {
        const formattedProducts: Product[] = products.map(product => ({
          id: product.id,
          name: product.name,
          price: product.price,
          slug: product.slug,
          imageUrl: product.main_image_url || '/placeholder.svg',
          category: product.categories?.name || 'Non catégorisé',
          description: product.description,
          stock: product.stock_quantity
        }));
          
          setProducts(formattedProducts);
        } else {
          setProducts([]);
        }
      } catch (error: any) {
        console.error('Error fetching all products:', error);
        toast({
          title: "Erreur",
          description: `Impossible de charger les produits: ${error.message}`,
          variant: "destructive",
        });
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, [toast]);

  return (
    <Layout>
      {/* Bannière sous la section des produits */}
      <div className="container mx-auto py-8">
        <ProductGrid 
          products={loading ? [] : products} 
          title="Tous les produits" 
          showAll={true}
        />
        
        {/* Bannière dynamique sous les produits */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">Découvrez nos gammes</h2>
          <DynamicImageAccordion />
        </div>
      </div>
    </Layout>
  );
};

export default AllProducts;
