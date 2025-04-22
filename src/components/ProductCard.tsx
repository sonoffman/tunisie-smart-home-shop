
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

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
  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
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

        <div className="mt-4">
          <Button className="w-full bg-sonoff-blue hover:bg-sonoff-teal">
            <ShoppingCart className="mr-2 h-4 w-4" /> Ajouter au panier
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
