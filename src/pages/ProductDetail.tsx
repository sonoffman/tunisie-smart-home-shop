
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          stock_quantity,
          main_image_url,
          additional_images,
          category_id,
          categories(name)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      
      if (data) {
        const productData: Product = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          price: data.price,
          stock: data.stock_quantity,
          imageUrl: data.main_image_url || "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=500&q=80",
          category: data.categories?.name || ''
        };
        
        setProduct(productData);
        setMainImage(data.main_image_url);
        setAdditionalImages(Array.isArray(data.additional_images) ? data.additional_images : []);
      } else {
        // Produit non trouvé, utiliser les données fictives
        const dummyProduct = getProductById(productId);
        setProduct(dummyProduct || null);
        setMainImage(dummyProduct?.imageUrl || null);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du produit:", error);
      // Produit non trouvé, utiliser les données fictives
      const dummyProduct = getProductById(productId);
      setProduct(dummyProduct || null);
      setMainImage(dummyProduct?.imageUrl || null);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de données fictives pour la rétrocompatibilité
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
    ];

    return products.find(product => product.id === id);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Chargement du produit...</h1>
          </div>
        </div>
      </Layout>
    );
  }

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

  const setActiveImage = (imageUrl: string) => {
    setMainImage(imageUrl);
  };

  // Combiner les images pour l'affichage en carousel
  const allImages = [mainImage, ...additionalImages].filter(img => img !== null) as string[];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images du produit */}
          <div className="space-y-4">
            {/* Image principale */}
            <div className="rounded-lg overflow-hidden shadow-md h-[400px]">
              <img 
                src={mainImage || product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
            </div>

            {/* Images supplémentaires */}
            {allImages.length > 1 && (
              <div className="flex overflow-x-auto space-x-2 py-2">
                {allImages.map((img, idx) => (
                  <div 
                    key={idx}
                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden cursor-pointer border-2 ${
                      img === mainImage ? 'border-sonoff-blue' : 'border-transparent'
                    }`}
                    onClick={() => setActiveImage(img)}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} - vue ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={decreaseQuantity} 
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                        disabled={quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Diminuer la quantité</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <span className="px-4 py-2 text-center w-12">{quantity}</span>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={increaseQuantity} 
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                      >
                        <Plus size={16} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Augmenter la quantité</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleAddToCart} 
                      className="w-full bg-sonoff-blue hover:bg-sonoff-teal py-3 text-lg"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" /> Ajouter au panier
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ajouter ce produit à votre panier</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleBuyNow} 
                      variant="outline" 
                      className="w-full border-sonoff-blue text-sonoff-blue hover:bg-sonoff-blue hover:text-white py-3 text-lg"
                    >
                      <ArrowRight className="mr-2 h-5 w-5" /> Achat immédiat
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Acheter ce produit maintenant</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
