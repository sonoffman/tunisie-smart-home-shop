
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/components/ProductCard';
import { useToast } from '@/components/ui/use-toast';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const searchProducts = async () => {
      if (!query.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(name)
          `)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .order('name');

        if (error) throw error;

        if (data) {
          const formattedProducts = data.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.main_image_url || '/placeholder.svg',
            category: product.categories?.name || 'Non catégorisé',
            description: product.description,
            stock: product.stock_quantity,
            slug: product.slug
          }));
          
          setProducts(formattedProducts);
        }
      } catch (error: any) {
        console.error('Error searching products:', error);
        toast({
          title: "Erreur",
          description: `Impossible de rechercher les produits: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query, toast]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          Résultats de recherche pour "{query}"
        </h1>
        {loading ? (
          <div className="text-center py-8">
            <p>Recherche en cours...</p>
          </div>
        ) : (
          <ProductGrid 
            products={products} 
            title={`${products.length} produit(s) trouvé(s)`}
          />
        )}
      </div>
    </Layout>
  );
};

export default SearchResults;
