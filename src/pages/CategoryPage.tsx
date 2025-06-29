
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Map category IDs to display names (as fallback if DB lookup fails)
const categoryNames: Record<string, string> = {
  'wifi': 'Modules WiFi',
  'zigbee': 'Modules ZigBee',
  'switch': 'Interrupteurs',
  'screen': 'Écrans',
  'accessories': 'Accessoires'
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('Produits');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (!slug) {
          // If no slug, show all products
          const { data: allProductsData, error: allProductsError } = await supabase
            .from('products')
            .select('*, categories(name)');

          if (allProductsError) throw allProductsError;
          
          if (allProductsData) {
            const formattedProducts = allProductsData.map(product => ({
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.main_image_url || '/placeholder.svg',
              category: product.categories?.name || 'Sans catégorie',
              description: product.description || '',
              stock: product.stock_quantity
            }));
            
            setProducts(formattedProducts);
            setCategoryName('Tous les produits');
          }
          return;
        }
        
        // First, get the category details by slug
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('name, id')
          .eq('slug', slug)
          .maybeSingle();

        if (categoryError) throw categoryError;
        
        if (categoryData) {
          setCategoryName(categoryData.name);
          
          // Fetch products for this category
          const { data: productsData, error: productsError } = await supabase
            .from('products')
            .select('*, categories(name)')
            .eq('category_id', categoryData.id);

          if (productsError) throw productsError;
          
          if (productsData) {
            const formattedProducts = productsData.map(product => ({
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.main_image_url || '/placeholder.svg',
              category: product.categories?.name || categoryData.name,
              description: product.description || '',
              stock: product.stock_quantity
            }));
            
            setProducts(formattedProducts);
          } else {
            setProducts([]);
          }
        } else {
          // Fallback: Set the category name from our hardcoded map
          setCategoryName(categoryNames[slug] || 'Produits');
          setProducts([]);
          
          toast({
            title: "Catégorie non trouvée",
            description: `La catégorie "${slug}" n'existe pas.`,
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
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

    fetchProducts();
  }, [slug, toast]);

  return (
    <Layout>
      <div className="py-12">
        <ProductGrid 
          products={loading ? [] : products} 
          title={categoryName} 
        />
      </div>
    </Layout>
  );
};

export default CategoryPage;
