
import React, { useState } from 'react';
import ProductCard, { Product } from './ProductCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  title?: string;
  isAdmin?: boolean;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  title = "Nos Produits", 
  isAdmin = false 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9; // 3x3 grid

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Change page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>

      {products.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Aucun produit trouvé</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} isAdmin={isAdmin} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button 
                variant="outline" 
                onClick={prevPage} 
                disabled={currentPage === 1}
                className="flex items-center"
              >
                <ChevronLeft className="mr-1" size={16} /> Précédent
              </Button>
              
              <span className="text-gray-700">
                Page {currentPage} sur {totalPages}
              </span>
              
              <Button 
                variant="outline" 
                onClick={nextPage} 
                disabled={currentPage === totalPages}
                className="flex items-center"
              >
                Suivant <ChevronRight className="ml-1" size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;
