
import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

const Navigation = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;
        
        if (data) {
          setCategories(data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const formatCategoryName = (name: string) => {
    // Remove "module" from category names for mobile display
    return name.replace(/module\s+/gi, '').trim();
  };

  if (isMobile) {
    return (
      <nav className="bg-gray-100 py-3">
        <div className="mx-auto px-2">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between"
              >
                Catégories
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              <DropdownMenuItem asChild>
                <Link 
                  to="/" 
                  className="w-full cursor-pointer"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Tous les produits
                </Link>
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem key={category.id} asChild>
                  <Link
                    to={`/category/${category.slug}`}
                    className="w-full cursor-pointer"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    {formatCategoryName(category.name)}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-100 py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-6 overflow-x-auto">
          <Link
            to="/"
            className="text-gray-700 hover:text-sonoff-blue transition-colors font-medium whitespace-nowrap"
          >
            Tous les produits
          </Link>
          
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="text-gray-700 hover:text-sonoff-blue transition-colors font-medium whitespace-nowrap"
            >
              {category.name}
            </Link>
          ))}
          
          <Link 
            to="/formation" 
            className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors font-medium whitespace-nowrap"
          >
            Formation
          </Link>
          
          <Link 
            to="/blog" 
            className="text-gray-700 hover:text-sonoff-blue transition-colors font-medium whitespace-nowrap"
          >
            Blog
          </Link>
          
          <Link 
            to="/verify-product" 
            className="text-gray-700 hover:text-sonoff-blue transition-colors font-medium whitespace-nowrap"
          >
            Vérifier produit
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
