
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import ProductFeatureToggle from './ProductFeatureToggle';

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  featured: boolean;
  hidden: boolean;
  category_name?: string;
}

interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onUpdate: () => void;
}

const ProductRow: React.FC<ProductRowProps> = ({
  product,
  onEdit,
  onDelete,
  onUpdate,
}) => {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-4">{product.name}</td>
      <td className="p-4">{product.category_name || 'Non catégorisé'}</td>
      <td className="p-4">{product.price.toFixed(2)} DT</td>
      <td className="p-4">{product.stock_quantity}</td>
      <td className="p-4">
        <ProductFeatureToggle
          productId={product.id}
          featured={product.featured}
          hidden={product.hidden}
          onUpdate={onUpdate}
        />
      </td>
      <td className="p-4">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
            className="flex items-center gap-1"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(product)}
            className="flex items-center gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;
