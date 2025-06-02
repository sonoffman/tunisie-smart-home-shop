
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ImageAccordion from '@/components/ImageAccordion';
import ProductGrid from '@/components/ProductGrid';
import ContactForm from '@/components/contact/ContactForm';
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
        // Fetch featured products to display - increased to 20
        const { data: products, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(name)
          `)
          .eq('featured', true)
          .eq('hidden', false)
          .order('name')
          .limit(20);

        if (error) throw error;
        
        if (products && products.length > 0) {
          const formattedProducts = products.map(product => ({
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
        } else {
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
  }, []);

  return (
    <Layout>
      <ImageAccordion />
      <div className="py-12">
        <ProductGrid products={loading ? [] : products} title="Produits Populaires" />
      </div>

      {/* Contact Form Section */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Contactez-nous</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
