
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, ArrowRight, Phone, Mail } from 'lucide-react';
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
  const [originalMainImage, setOriginalMainImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [allImages, setAllImages] = useState<string[]>([]);
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

      if (error) {
        console.error("Error fetching product:", error);
        throw error;
      }
      
      if (data) {
        const productData: Product = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          price: data.price,
          stock: data.stock_quantity,
          imageUrl: data.main_image_url || "/placeholder.svg",
          category: data.categories?.name || ''
        };
        
        setProduct(productData);
        setMainImage(data.main_image_url);
        setOriginalMainImage(data.main_image_url);
        
        // Convert additional_images from Json to string array
        if (data.additional_images && Array.isArray(data.additional_images)) {
          const imageArray: string[] = [];
          data.additional_images.forEach(img => {
            if (typeof img === 'string') {
              imageArray.push(img);
            }
          });
          setAdditionalImages(imageArray);
          
          // Prepare all images for display
          const allImagesArray = [];
          if (data.main_image_url) {
            allImagesArray.push(data.main_image_url);
          }
          if (imageArray && imageArray.length > 0) {
            allImagesArray.push(...imageArray.filter(img => img !== null && img !== data.main_image_url));
          }
          setAllImages(allImagesArray);
        }
      }
    } catch (error: any) {
      console.error("Erreur lors du chargement du produit:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails du produit.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  const resetToMainImage = () => {
    if (originalMainImage) {
      setMainImage(originalMainImage);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Chargement du produit...</h1>
          </div>
        ) : !product ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Produit non trouvé</h1>
            <Button onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </div>
        ) : (
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
              {allImages.length > 0 && (
                <>
                  <div className="flex overflow-x-auto space-x-2 py-2">
                    {allImages.map((img, idx) => (
                      <div 
                        key={idx}
                        className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden cursor-pointer border-2 ${
                          img === mainImage ? 'border-sonoff-blue' : 'border-transparent'
                        }`}
                        onClick={() => setMainImage(img)}
                      >
                        <img 
                          src={img} 
                          alt={`${product.name} - vue ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Bouton pour revenir à l'image principale */}
                  {mainImage !== originalMainImage && originalMainImage && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setMainImage(originalMainImage)}
                      className="mt-2"
                    >
                      Revenir à l'image principale
                    </Button>
                  )}
                </>
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
              
              {/* Contact information with clickable phone and email */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Besoin d'aide?</h2>
                <div className="flex items-center space-x-2 mb-2">
                  <Phone size={16} className="text-sonoff-blue" />
                  <a href="tel:+21655123456" className="text-sonoff-blue hover:underline">+216 55 123 456</a>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail size={16} className="text-sonoff-blue" />
                  <a href="mailto:contact@sonoff-store.tn" className="text-sonoff-blue hover:underline">contact@sonoff-store.tn</a>
                </div>
              </div>

              <div className="flex items-center mb-8">
                <span className="mr-4 font-semibold">Quantité:</span>
                <div className="flex items-center border rounded-md">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          onClick={() => quantity > 1 && setQuantity(prev => prev - 1)} 
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
                          onClick={() => setQuantity(prev => prev + 1)} 
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
                        onClick={() => {
                          addToCart(product, quantity);
                          toast({
                            title: "Produit ajouté au panier",
                            description: `${quantity} ${product.name} ${quantity > 1 ? "ont été ajoutés" : "a été ajouté"} à votre panier`,
                          });
                        }}
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
                        onClick={() => {
                          addToCart(product, quantity);
                          navigate('/checkout');
                        }}
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
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
