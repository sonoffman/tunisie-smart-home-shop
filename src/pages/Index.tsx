
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

  // Sample product data to use if database is empty
  const sampleProducts: Product[] = [
    {
      id: "1",
      name: "Sonoff MINI R2",
      price: 35.99,
      imageUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=500&q=80",
      category: "wifi",
      description: "Mini interrupteur intelligent compatible avec Alexa et Google Home",
    },
    {
      id: "2",
      name: "Sonoff TX2 EU",
      price: 75.50,
      imageUrl: "https://images.unsplash.com/photo-1585399000684-d2f72660f092?auto=format&fit=crop&w=500&q=80",
      category: "switch",
      description: "Interrupteur tactile mural Wi-Fi à 2 canaux",
    },
    {
      id: "3",
      name: "Sonoff ZBMINI",
      price: 49.99,
      imageUrl: "https://images.unsplash.com/photo-1558346490-c7d0047bfbf6?auto=format&fit=crop&w=500&q=80",
      category: "zigbee",
      description: "Mini interrupteur ZigBee",
    },
    {
      id: "4",
      name: "Sonoff NSPanel Pro",
      price: 249.99,
      imageUrl: "https://images.unsplash.com/photo-1544437939-ab1e06a4d0de?auto=format&fit=crop&w=500&q=80",
      category: "screen",
      description: "Écran tactile mural intelligent",
    },
    {
      id: "5",
      name: "Sonoff TH Elite",
      price: 85.75,
      imageUrl: "https://images.unsplash.com/photo-1596394723269-b2cbca4e6313?auto=format&fit=crop&w=500&q=80",
      category: "accessories",
      description: "Capteur de température et d'humidité Wi-Fi",
    },
    {
      id: "6",
      name: "Sonoff DW2-Wi-Fi",
      price: 29.99,
      imageUrl: "https://images.unsplash.com/photo-1544437939-ab1e06a4d0de?auto=format&fit=crop&w=500&q=80",
      category: "accessories",
      description: "Capteur de porte/fenêtre WiFi",
    },
    {
      id: "7",
      name: "Sonoff MINIR4",
      price: 42.50,
      imageUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=500&q=80",
      category: "wifi",
      description: "Mini interrupteur intelligent - Nouvelle génération",
    },
    {
      id: "8",
      name: "Sonoff DUALR3",
      price: 68.90,
      imageUrl: "https://images.unsplash.com/photo-1585399000684-d2f72660f092?auto=format&fit=crop&w=500&q=80",
      category: "wifi",
      description: "Interrupteur intelligent double relais",
    },
    {
      id: "9",
      name: "Sonoff SNZB-02D",
      price: 59.90,
      imageUrl: "https://images.unsplash.com/photo-1596394723269-b2cbca4e6313?auto=format&fit=crop&w=500&q=80",
      category: "zigbee",
      description: "Capteur de température et d'humidité ZigBee - Version pro",
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Step 1: Fetch categories to ensure they exist
        const { data: existingCategories, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug');
        
        if (categoriesError) throw categoriesError;

        // Create a map of category names to IDs
        const categoryMap = new Map();
        if (existingCategories && existingCategories.length > 0) {
          existingCategories.forEach(cat => {
            categoryMap.set(cat.name.toLowerCase(), cat.id);
          });
        } else {
          // Insert default categories if none exist
          const defaultCategories = [
            { name: 'WiFi', slug: 'wifi', icon: 'wifi' },
            { name: 'ZigBee', slug: 'zigbee', icon: 'zap' },
            { name: 'Switches', slug: 'switch', icon: 'toggle-left' },
            { name: 'Screens', slug: 'screen', icon: 'monitor' },
            { name: 'Accessories', slug: 'accessories', icon: 'package' }
          ];
          
          for (const category of defaultCategories) {
            const { data: newCat, error: insertError } = await supabase
              .from('categories')
              .insert(category)
              .select();
            
            if (insertError) throw insertError;
            
            if (newCat && newCat.length > 0) {
              categoryMap.set(category.name.toLowerCase(), newCat[0].id);
            }
          }
        }

        // Step 2: Check if products exist
        const { data: existingProducts, error: productsError } = await supabase
          .from('products')
          .select('*');
        
        if (productsError) throw productsError;
        
        // If no products exist, add sample products to the database
        if (!existingProducts || existingProducts.length === 0) {
          for (const product of sampleProducts) {
            // Get category ID
            let categoryId = null;
            if (product.category) {
              for (const [cat, id] of categoryMap.entries()) {
                if (cat.includes(product.category.toLowerCase()) || product.category.toLowerCase().includes(cat)) {
                  categoryId = id;
                  break;
                }
              }
            }
            
            // Insert product
            await supabase.from('products').insert({
              name: product.name,
              price: product.price,
              description: product.description || '',
              main_image_url: product.imageUrl,
              category_id: categoryId,
              slug: product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
              stock_quantity: Math.floor(Math.random() * 100) + 10, // Random stock between 10-110
              featured: Math.random() > 0.7 // 30% chance of being featured
            });
          }
        }

        // Step 3: Fetch products to display
        const { data: products, error } = await supabase
          .from('products')
          .select(`
            *,
            categories(name)
          `)
          .eq('featured', true)
          .order('name')
          .limit(9);

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
          // If no products from DB, use sample data
          setProducts(sampleProducts);
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast({
          title: "Erreur",
          description: `Impossible de charger les produits: ${error.message}`,
          variant: "destructive",
        });
        setProducts(sampleProducts); // Fallback to sample data
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
