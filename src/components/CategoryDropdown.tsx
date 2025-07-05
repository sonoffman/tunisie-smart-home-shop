
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

const CategoryDropdown = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  if (isMobile) {
    return (
      <div className="w-full bg-white shadow-sm border-b mb-4">
        <div className="container mx-auto px-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-between w-full py-3 text-left font-medium text-gray-700 hover:text-sonoff-blue"
          >
            <span>Catégories</span>
            <ChevronDown 
              size={16} 
              className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
          
          {isOpen && (
            <div className="pb-4">
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                  >
                    {category.icon && (
                      <span className="mr-2 text-base">{category.icon}</span>
                    )}
                    {category.name}
                  </Link>
                ))}
                <Link
                  to="/products"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center p-2 text-sm font-medium text-sonoff-blue hover:bg-gray-50 rounded-md col-span-2 border-t pt-3"
                >
                  Tous les produits
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-sonoff-blue transition-colors">
        <span>Catégories</span>
        <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
      </button>
      
      <div className="absolute top-full left-0 w-64 bg-white shadow-lg rounded-md border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {category.icon && (
                <span className="mr-2 text-base">{category.icon}</span>
              )}
              {category.name}
            </Link>
          ))}
          <Link
            to="/products"
            className="flex items-center px-3 py-2 text-sm font-medium text-sonoff-blue hover:bg-gray-100 rounded-md border-t mt-2 pt-3"
          >
            Tous les produits
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryDropdown;
