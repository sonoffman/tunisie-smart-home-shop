
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description?: string;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isAdmin = false }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  return (
    <div className="product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/product/${product.id}`} className="block">
        <div className="h-48 overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-sonoff-blue transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-sonoff-blue">{product.price.toFixed(2)} DT</span>
          
          {isAdmin && product.stock !== undefined && (
            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button 
            className="w-full bg-sonoff-blue hover:bg-sonoff-teal"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Ajouter au panier
          </Button>
          <Button 
            variant="outline" 
            className="w-full border-sonoff-blue text-sonoff-blue hover:bg-sonoff-blue hover:text-white"
            onClick={handleBuyNow}
          >
            Achat immédiat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
