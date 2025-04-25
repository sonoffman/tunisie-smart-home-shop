
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, ArrowRight } from 'lucide-react';
import { Product } from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';

// Ceci est une fonction temporaire de données fictives, qui sera remplacée par des données Supabase
const getProductById = (id: string): Product | undefined => {
  const products: Product[] = [
    {
      id: "1",
      name: "Sonoff MINI R2",
      price: 35.99,
      imageUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=500&q=80",
      category: "wifi",
      description: "Mini interrupteur intelligent compatible avec Alexa et Google Home. Ce petit appareil vous permet de contrôler vos appareils électriques à distance via l'application eWeLink. Compatible avec la plupart des systèmes de domotique.",
    },
    {
      id: "2",
      name: "Sonoff TX2 EU",
      price: 75.50,
      imageUrl: "https://images.unsplash.com/photo-1585399000684-d2f72660f092?auto=format&fit=crop&w=500&q=80",
      category: "switch",
      description: "Interrupteur tactile mural Wi-Fi à 2 canaux avec un design élégant en verre. Contrôle indépendant de 2 circuits, compatible avec Alexa, Google Home et eWeLink.",
    },
    // Ajouter plus de produits si nécessaire...
  ];

  return products.find(product => product.id === id);
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  // Dans une vraie application, ce serait une requête vers Supabase
  const product = id ? getProductById(id) : undefined;

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Produit non trouvé</h1>
            <Button onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Produit ajouté au panier",
      description: `${quantity} ${product.name} ${quantity > 1 ? "ont été ajoutés" : "a été ajouté"} à votre panier`,
    });
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image du produit */}
          <div className="rounded-lg overflow-hidden shadow-md">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Détails du produit */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
            <p className="text-2xl font-bold text-sonoff-blue mb-6">{product.price.toFixed(2)} DT</p>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="flex items-center mb-8">
              <span className="mr-4 font-semibold">Quantité:</span>
              <div className="flex items-center border rounded-md">
                <button 
                  onClick={decreaseQuantity} 
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 text-center w-12">{quantity}</span>
                <button 
                  onClick={increaseQuantity} 
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={handleAddToCart} 
                className="w-full bg-sonoff-blue hover:bg-sonoff-teal py-3 text-lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" /> Ajouter au panier
              </Button>
              
              <Button 
                onClick={handleBuyNow} 
                variant="outline" 
                className="w-full border-sonoff-blue text-sonoff-blue hover:bg-sonoff-blue hover:text-white py-3 text-lg"
              >
                <ArrowRight className="mr-2 h-5 w-5" /> Achat immédiat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
