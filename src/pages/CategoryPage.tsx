
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
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('Produits');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryId) return;
      
      setLoading(true);
      try {
        // First, get the category details
        const { data: category, error: categoryError } = await supabase
          .from('categories')
          .select('name, id')
          .eq('slug', categoryId)
          .maybeSingle();

        if (categoryError) throw categoryError;
        
        if (category) {
          setCategoryName(category.name);
          
          // Then, fetch products for this category
          const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', category.id);

          if (error) throw error;
          
          if (products && products.length > 0) {
            const formattedProducts = products.map(product => ({
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.main_image_url || '/placeholder.svg',
              category: categoryName,
              description: product.description,
              stock: product.stock_quantity
            }));
            
            setProducts(formattedProducts);
          } else {
            setProducts([]);
          }
        } else {
          setCategoryName(categoryNames[categoryId] || 'Produits');
          setProducts([]);
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
  }, [categoryId, categoryName, toast]);

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
