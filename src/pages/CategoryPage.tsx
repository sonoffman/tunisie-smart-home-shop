
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/components/ProductCard';

// This is a temporary mock data function, will be replaced with Supabase data
const getProductsByCategory = (category: string): Product[] => {
  const allProducts: Product[] = [
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

  return allProducts.filter(product => product.category === category);
};

// Map category IDs to display names
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

  useEffect(() => {
    if (categoryId) {
      // This would be a Supabase query in a real app
      const filteredProducts = getProductsByCategory(categoryId);
      setProducts(filteredProducts);
      setCategoryName(categoryNames[categoryId] || 'Produits');
    }
  }, [categoryId]);

  return (
    <Layout>
      <div className="py-12">
        <ProductGrid 
          products={products} 
          title={categoryName} 
        />
      </div>
    </Layout>
  );
};

export default CategoryPage;
