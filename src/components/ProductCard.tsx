import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isAdmin = false }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    
    toast({
      title: "Produit ajouté au panier",
      description: `${product.name} a été ajouté à votre panier`,
    });
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    navigate('/checkout');
  };

  // Truncate product name to max 2 lines
  const truncatedName = product.name.length > (isMobile ? 30 : 50) 
    ? product.name.substring(0, isMobile ? 30 : 50) + '...' 
    : product.name;

  const productUrl = `/produit/${product.slug}`;

  return (
    <div className={`product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
      isMobile ? 'h-auto' : ''
    }`}>
      <Link to={productUrl} className="block">
        <div className={`overflow-hidden ${isMobile ? 'h-32' : 'h-48'}`}>
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      </Link>

      <div className={`p-${isMobile ? '2' : '4'}`}>
        <Link to={productUrl}>
          <h3 className={`font-semibold text-gray-800 mb-2 hover:text-sonoff-blue transition-colors ${
            isMobile ? 'text-sm leading-tight h-10' : 'text-lg h-12'
          } overflow-hidden line-clamp-2`} style={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {truncatedName}
          </h3>
        </Link>

        <div className="flex justify-between items-center mb-2">
          <span className={`font-bold text-sonoff-blue ${isMobile ? 'text-base' : 'text-xl'}`}>
            {product.price.toFixed(2)} DT
          </span>
          
          {isAdmin && product.stock !== undefined && (
            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
          )}
        </div>

        <div className={`flex flex-col gap-${isMobile ? '1' : '2'}`}>
          <Button 
            className={`w-full bg-sonoff-blue hover:bg-sonoff-teal ${
              isMobile ? 'text-xs py-1 h-8' : 'py-2'
            }`}
            onClick={handleAddToCart}
          >
            <ShoppingCart className={`mr-1 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            {isMobile ? 'Panier' : 'Ajouter au panier'}
          </Button>
          <Button 
            variant="outline" 
            className={`w-full border-sonoff-blue text-sonoff-blue hover:bg-sonoff-blue hover:text-white ${
              isMobile ? 'text-xs py-1 h-8' : 'py-2'
            }`}
            onClick={handleBuyNow}
          >
            {isMobile ? 'Acheter' : 'Achat immédiat'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
export type { Product };
