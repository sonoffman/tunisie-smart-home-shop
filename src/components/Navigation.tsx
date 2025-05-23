
import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

const Navigation = () => {
  const [categories, setCategories] = useState<Category[]>([]);
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

  if (isMobile) {
    return null; // Hide categories on mobile as requested
  }

  const formatCategoryName = (name: string) => {
    // Remove "module" from category names for mobile display
    return name.replace(/module\s+/gi, '').trim();
  };

  return (
    <nav className="bg-gray-100 py-3">
      <div className="container mx-auto px-4">
        <div className={`flex items-center space-x-6 ${
          isMobile ? 'overflow-x-auto whitespace-nowrap pb-2' : 'justify-center'
        }`}>
          <Link 
            to="/" 
            className={`text-gray-700 hover:text-sonoff-blue transition-colors font-medium ${
              isMobile ? 'text-sm px-2 flex-shrink-0' : ''
            }`}
          >
            Accueil
          </Link>
          
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className={`text-gray-700 hover:text-sonoff-blue transition-colors font-medium ${
                isMobile ? 'text-sm px-2 flex-shrink-0' : ''
              }`}
            >
              {isMobile ? formatCategoryName(category.name) : category.name}
            </Link>
          ))}
          
          <Link 
            to="/training" 
            className={`text-gray-700 hover:text-sonoff-blue transition-colors font-medium ${
              isMobile ? 'text-sm px-2 flex-shrink-0' : ''
            }`}
          >
            Formation
          </Link>
          
          <Link 
            to="/blog" 
            className={`text-gray-700 hover:text-sonoff-blue transition-colors font-medium ${
              isMobile ? 'text-sm px-2 flex-shrink-0' : ''
            }`}
          >
            Blog
          </Link>
          
          <Link 
            to="/verify-product" 
            className={`text-gray-700 hover:text-sonoff-blue transition-colors font-medium ${
              isMobile ? 'text-sm px-2 flex-shrink-0' : ''
            }`}
          >
            Vérifier produit
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
